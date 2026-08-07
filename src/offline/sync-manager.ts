import { finishInspection, saveInspectionResponse } from "@/lib/api/inspection-response.functions";

import {
  getOfflineDatabase,
  notifyOfflineStateChanged,
  notifyOfflineSynchronizationCompleted,
} from "./database";
import {
  getNextPendingOperation,
  resetInterruptedOperations,
  retryFailedOperations,
} from "./inspection-store";
import { getAppSession, getCachedOfflineSession } from "./session";
import type { OfflineOperation, SaveResponseOperation } from "./types";

const MAX_AUTOMATIC_ATTEMPTS = 5;
const MAX_RETRY_DELAY_MS = 5 * 60 * 1_000;

let activeSynchronization: Promise<void> | null = null;

export function synchronizeOfflineQueue(): Promise<void> {
  activeSynchronization ??= runSynchronization().finally(() => {
    activeSynchronization = null;
    notifyOfflineStateChanged();
  });

  return activeSynchronization;
}

export async function retryOfflineQueue(): Promise<void> {
  await retryFailedOperations();
  await synchronizeOfflineQueue();
}

async function runSynchronization(): Promise<void> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return;
  }

  await resetInterruptedOperations();
  const localSession = await getCachedOfflineSession();
  if (!localSession.success) {
    return;
  }

  const serverSession = await getAppSession();
  if (!serverSession.success) {
    if (serverSession.statusCode === 401) {
      await markAuthenticationFailure(
        localSession.data.id,
        serverSession.code,
        serverSession.message,
      );
    }
    return;
  }

  if (serverSession.data.id !== localSession.data.id) {
    return;
  }

  while (navigator.onLine) {
    const operation = await getNextPendingOperation(serverSession.data.id);
    if (!operation) {
      return;
    }

    const shouldContinue = await synchronizeOperation(operation);
    if (!shouldContinue) {
      return;
    }
  }
}

async function markAuthenticationFailure(
  userId: string,
  code: string,
  message: string,
): Promise<void> {
  const operations = await getOfflineDatabase().operations.where("userId").equals(userId).toArray();

  for (const operation of operations) {
    if (operation.status === "PENDING" || operation.status === "SYNCING") {
      await markOperationFailure(operation, "ERROR", code, message);
    }
  }
}

async function synchronizeOperation(operation: OfflineOperation): Promise<boolean> {
  const db = getOfflineDatabase();
  await db.operations.update(operation.id, {
    status: "SYNCING",
    updatedAt: new Date(),
    attemptCount: operation.attemptCount + 1,
  });
  await updatePackageStatus(operation, "SYNCING");
  notifyOfflineStateChanged();

  try {
    if (operation.type === "SAVE_INSPECTION_RESPONSE") {
      const result = await saveInspectionResponse({
        data: {
          inspectionId: operation.inspectionId,
          snapshotItemId: operation.payload.snapshotItemId,
          status: operation.payload.status,
          observation: operation.payload.observation,
          operationId: operation.id,
          clientCreatedAt: operation.payload.clientCreatedAt,
          expectedResponseUpdatedAt: operation.payload.expectedResponseUpdatedAt,
        },
      });

      if (!result.success) {
        return handleServerFailure(operation, result);
      }

      await acknowledgeResponseOperation(operation, result.data);
      return true;
    }

    const result = await finishInspection({
      data: {
        inspectionId: operation.inspectionId,
        operationId: operation.id,
        clientCreatedAt: operation.payload.clientCreatedAt,
      },
    });

    if (!result.success) {
      return handleServerFailure(operation, result);
    }

    await acknowledgeFinishOperation(operation, result.data);
    return true;
  } catch (error) {
    await scheduleRetry(
      operation,
      "NETWORK_ERROR",
      error instanceof Error
        ? error.message
        : "A conexão foi interrompida durante a sincronização.",
    );
    return false;
  }
}

async function acknowledgeResponseOperation(
  operation: SaveResponseOperation,
  response: Awaited<ReturnType<typeof saveInspectionResponse>> extends infer TResult
    ? Extract<TResult, { success: true }> extends { data: infer TData }
      ? TData
      : never
    : never,
): Promise<void> {
  const db = getOfflineDatabase();

  await db.transaction("rw", db.operations, db.inspectionPackages, async () => {
    const record = await db.inspectionPackages
      .where("[userId+inspectionId]")
      .equals([operation.userId, operation.inspectionId])
      .first();
    const dependents = await db.operations
      .where("dependsOnOperationId")
      .equals(operation.id)
      .toArray();

    for (const dependent of dependents) {
      if (dependent.type === "SAVE_INSPECTION_RESPONSE") {
        await db.operations.put({
          ...dependent,
          dependsOnOperationId: null,
          payload: {
            ...dependent.payload,
            expectedResponseUpdatedAt: toDate(response.updatedAt),
          },
          updatedAt: new Date(),
        });
      } else {
        await db.operations.update(dependent.id, {
          dependsOnOperationId: null,
          updatedAt: new Date(),
        });
      }
    }

    await db.operations.delete(operation.id);

    if (record) {
      const inspection = structuredClone(record.inspection);
      const responseIndex = inspection.responses.findIndex(
        (candidate) => candidate.snapshotItemId === response.snapshotItemId,
      );

      if (responseIndex >= 0) {
        inspection.responses[responseIndex] = response;
      } else {
        inspection.responses.push(response);
      }

      const remaining = await db.operations
        .where("inspectionId")
        .equals(operation.inspectionId)
        .count();
      inspection.syncStatus = remaining === 0 ? "SYNCED" : "PENDING";
      await db.inspectionPackages.put({
        ...record,
        inspection,
        cachedAt: new Date(),
        localSyncStatus: remaining === 0 ? "SYNCED" : "PENDING",
      });
    }
  });

  notifyOfflineStateChanged();
  notifyOfflineSynchronizationCompleted(operation.inspectionId);
}

async function acknowledgeFinishOperation(
  operation: Extract<OfflineOperation, { type: "FINISH_INSPECTION" }>,
  inspection: Awaited<ReturnType<typeof finishInspection>> extends infer TResult
    ? Extract<TResult, { success: true }> extends { data: infer TData }
      ? TData
      : never
    : never,
): Promise<void> {
  const db = getOfflineDatabase();

  await db.transaction("rw", db.operations, db.inspectionPackages, async () => {
    await db.operations.delete(operation.id);
    const record = await db.inspectionPackages
      .where("[userId+inspectionId]")
      .equals([operation.userId, operation.inspectionId])
      .first();

    if (record) {
      await db.inspectionPackages.put({
        ...record,
        inspection,
        cachedAt: new Date(),
        localSyncStatus: "SYNCED",
      });
    }
  });

  notifyOfflineStateChanged();
  notifyOfflineSynchronizationCompleted(operation.inspectionId);
}

async function handleServerFailure(
  operation: OfflineOperation,
  error: { statusCode: number; code: string; message: string },
): Promise<boolean> {
  if (error.statusCode === 409) {
    await markOperationFailure(operation, "CONFLICT", error.code, error.message);
    return false;
  }

  if (error.statusCode === 401 || error.statusCode === 422) {
    await markOperationFailure(operation, "ERROR", error.code, error.message);
    return false;
  }

  await scheduleRetry(operation, error.code, error.message);
  return false;
}

async function scheduleRetry(
  operation: OfflineOperation,
  code: string,
  message: string,
): Promise<void> {
  const attemptCount = operation.attemptCount + 1;
  const exhausted = attemptCount >= MAX_AUTOMATIC_ATTEMPTS;
  const delay = Math.min(2 ** attemptCount * 1_000, MAX_RETRY_DELAY_MS);
  const status = exhausted ? "ERROR" : "PENDING";

  await getOfflineDatabase().operations.update(operation.id, {
    status,
    attemptCount,
    nextAttemptAt: new Date(Date.now() + delay),
    updatedAt: new Date(),
    lastErrorCode: code,
    lastErrorMessage: message,
  });
  await updatePackageStatus(operation, status);
  notifyOfflineStateChanged();
}

async function markOperationFailure(
  operation: OfflineOperation,
  status: "ERROR" | "CONFLICT",
  code: string,
  message: string,
): Promise<void> {
  await getOfflineDatabase().operations.update(operation.id, {
    status,
    updatedAt: new Date(),
    lastErrorCode: code,
    lastErrorMessage: message,
  });
  await updatePackageStatus(operation, status);
  notifyOfflineStateChanged();
}

async function updatePackageStatus(
  operation: OfflineOperation,
  status: "PENDING" | "SYNCING" | "ERROR" | "CONFLICT",
): Promise<void> {
  const db = getOfflineDatabase();
  const record = await db.inspectionPackages
    .where("[userId+inspectionId]")
    .equals([operation.userId, operation.inspectionId])
    .first();

  if (!record) {
    return;
  }

  const inspection = structuredClone(record.inspection);
  inspection.syncStatus = status === "CONFLICT" ? "ERROR" : status;
  await db.inspectionPackages.put({
    ...record,
    inspection,
    localSyncStatus: status,
  });
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}
