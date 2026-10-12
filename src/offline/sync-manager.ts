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
import { isValidSynchronizationResult } from "./sync-result";
import { fetchForOfflineSynchronization, SyncTransportError } from "./sync-transport";
import type { OfflineOperation, SaveResponseOperation } from "./types";

const MAX_AUTOMATIC_ATTEMPTS = 5;
const MAX_RETRY_DELAY_MS = 5 * 60 * 1_000;

let activeSynchronization: Promise<void> | null = null;

interface SynchronizationFunctions {
  saveInspectionResponse: (
    options: Parameters<typeof saveInspectionResponse>[0],
  ) => ReturnType<typeof saveInspectionResponse>;
  finishInspection: (
    options: Parameters<typeof finishInspection>[0],
  ) => ReturnType<typeof finishInspection>;
}

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

export async function synchronizeOperation(
  operation: OfflineOperation,
  functions: SynchronizationFunctions = { saveInspectionResponse, finishInspection },
): Promise<boolean> {
  const db = getOfflineDatabase();
  await db.operations.update(operation.id, {
    status: "SYNCING",
    updatedAt: new Date(),
    attemptCount: operation.attemptCount + 1,
  });
  await updatePackageStatus(operation, "SYNCING");
  notifyOfflineStateChanged();

  let acknowledge: () => Promise<void>;
  try {
    if (operation.type === "SAVE_INSPECTION_RESPONSE") {
      const result = await functions.saveInspectionResponse({
        data: {
          inspectionId: operation.inspectionId,
          snapshotItemId: operation.payload.snapshotItemId,
          status: operation.payload.status,
          observation: operation.payload.observation,
          operationId: operation.id,
          clientCreatedAt: operation.payload.clientCreatedAt,
          expectedResponseUpdatedAt: operation.payload.expectedResponseUpdatedAt,
        },
        fetch: fetchForOfflineSynchronization,
      });

      if (!isValidSynchronizationResult(result, operation)) {
        return markInvalidResponse(operation);
      }
      if (!result.success) {
        return handleServerFailure(operation, result);
      }

      acknowledge = () => acknowledgeResponseOperation(operation, result.data);
    } else {
      const result = await functions.finishInspection({
        data: {
          inspectionId: operation.inspectionId,
          operationId: operation.id,
          clientCreatedAt: operation.payload.clientCreatedAt,
        },
        fetch: fetchForOfflineSynchronization,
      });

      if (!isValidSynchronizationResult(result, operation)) {
        return markInvalidResponse(operation);
      }
      if (!result.success) {
        return handleServerFailure(operation, result);
      }
      acknowledge = () => acknowledgeFinishOperation(operation, result.data);
    }
  } catch (error) {
    if (error instanceof SyncTransportError) {
      if (error.code === "NETWORK_ERROR") {
        await scheduleRetry(operation, error.code, error.message);
        return false;
      }
      return handleServerFailure(operation, error);
    }
    await markOperationFailure(
      operation,
      "ERROR",
      "SYNC_EXCEPTION",
      "A chamada de sincronização falhou sem confirmação. Verifique o problema antes de tentar novamente.",
    );
    return false;
  }

  try {
    await acknowledge();
  } catch {
    await markOperationFailure(
      operation,
      "ERROR",
      "LOCAL_PERSISTENCE_ERROR",
      "Não foi possível confirmar a sincronização no armazenamento deste dispositivo.",
    );
    return false;
  }
  return true;
}

async function markInvalidResponse(operation: OfflineOperation): Promise<boolean> {
  await markOperationFailure(
    operation,
    "ERROR",
    "INVALID_SYNC_RESPONSE",
    "O servidor retornou uma confirmação de sincronização inválida.",
  );
  return false;
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

  const applied = await db.transaction("rw", db.operations, db.inspectionPackages, async () => {
    // Another in-flight attempt may already have acknowledged this UUID.
    if (!(await db.operations.get(operation.id))) {
      return false;
    }

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
      const newerEdit = await db.operations
        .where("[inspectionId+entityKey]")
        .equals([operation.inspectionId, operation.entityKey])
        .filter(
          (candidate) =>
            candidate.userId === operation.userId &&
            candidate.type === "SAVE_INSPECTION_RESPONSE" &&
            candidate.sequence > operation.sequence,
        )
        .first();

      // The queue carries the remote revision; the package carries the latest local edit.
      if (!newerEdit) {
        const responseIndex = inspection.responses.findIndex(
          (candidate) => candidate.snapshotItemId === response.snapshotItemId,
        );

        if (responseIndex >= 0) {
          inspection.responses[responseIndex] = response;
        } else {
          inspection.responses.push(response);
        }
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

    return true;
  });

  if (applied) {
    notifyOfflineStateChanged();
    notifyOfflineSynchronizationCompleted(operation.inspectionId);
  }
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

  if (
    error.statusCode === 408 ||
    error.statusCode === 429 ||
    (error.statusCode >= 500 && error.statusCode <= 599)
  ) {
    await scheduleRetry(operation, error.code, error.message);
    return false;
  }

  await markOperationFailure(operation, "ERROR", error.code, error.message);
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
