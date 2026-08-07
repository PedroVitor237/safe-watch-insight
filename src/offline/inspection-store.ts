import type { SaveInspectionResponseSchemaInput } from "@/server/schemas/inspection-response.schema";

import {
  getOfflineDatabase,
  isOfflineStorageAvailable,
  notifyOfflineStateChanged,
} from "./database";
import { getCachedOfflineSession } from "./session";
import type {
  FinishInspectionOperation,
  OfflineInspection,
  OfflineInspectionPackage,
  OfflineInspectionResponse,
  OfflineOperation,
  OfflineQueueSummary,
  SaveResponseOperation,
} from "./types";

type OfflineInspectionResult =
  | { success: true; data: OfflineInspection }
  | {
      success: false;
      message: string;
      code: string;
      statusCode: number;
    };

type OfflineResponseResult =
  | { success: true; data: OfflineInspectionResponse; message?: string }
  | {
      success: false;
      message: string;
      code: string;
      statusCode: number;
    };

export function inspectionPackageKey(userId: string, inspectionId: string): string {
  return `${userId}:${inspectionId}`;
}

export async function cacheInspectionPackage(inspection: OfflineInspection): Promise<void> {
  if (!isOfflineStorageAvailable()) {
    return;
  }

  const db = getOfflineDatabase();
  const key = inspectionPackageKey(inspection.user.id, inspection.id);
  const pendingOperations = await db.operations.where("inspectionId").equals(inspection.id).count();

  if (pendingOperations > 0) {
    return;
  }

  await db.inspectionPackages.put({
    key,
    userId: inspection.user.id,
    inspectionId: inspection.id,
    inspection,
    cachedAt: new Date(),
    localSyncStatus: "SYNCED",
  });
  notifyOfflineStateChanged();
}

export async function cacheInspectionPackages(inspections: OfflineInspection[]): Promise<void> {
  for (const inspection of inspections) {
    await cacheInspectionPackage(inspection);
  }
}

export async function getCachedInspection(inspectionId: string): Promise<OfflineInspectionResult> {
  if (!isOfflineStorageAvailable()) {
    return offlineDataUnavailable();
  }

  const session = await getCachedOfflineSession();
  if (!session.success) {
    return session;
  }

  const record = await getOfflineDatabase().inspectionPackages.get(
    inspectionPackageKey(session.data.id, inspectionId),
  );

  if (!record) {
    return offlineDataUnavailable();
  }

  return { success: true, data: record.inspection };
}

export async function getCachedInspectionPackagesForCurrentUser(): Promise<
  OfflineInspectionPackage[]
> {
  if (!isOfflineStorageAvailable()) {
    return [];
  }

  const session = await getCachedOfflineSession();
  if (!session.success) {
    return [];
  }

  return getOfflineDatabase().inspectionPackages.where("userId").equals(session.data.id).toArray();
}

export async function hasPendingOperations(inspectionId: string): Promise<boolean> {
  if (!isOfflineStorageAvailable()) {
    return false;
  }

  return (
    (await getOfflineDatabase().operations.where("inspectionId").equals(inspectionId).count()) > 0
  );
}

export async function queueInspectionResponse(
  input: SaveInspectionResponseSchemaInput,
): Promise<OfflineResponseResult> {
  if (!isOfflineStorageAvailable() || !input.snapshotItemId) {
    return offlineDataUnavailable();
  }

  const session = await getCachedOfflineSession();
  if (!session.success) {
    return session;
  }

  const db = getOfflineDatabase();
  const key = inspectionPackageKey(session.data.id, input.inspectionId);

  const result = await db.transaction(
    "rw",
    db.inspectionPackages,
    db.operations,
    async (): Promise<OfflineResponseResult> => {
      const record = await db.inspectionPackages.get(key);

      if (!record?.inspection.snapshot) {
        return offlineDataUnavailable();
      }

      if (record.inspection.status === "COMPLETED" || record.inspection.status === "CANCELLED") {
        return localConflict("Inspeções concluídas ou canceladas não podem ser alteradas.");
      }

      const snapshotItem = record.inspection.snapshot.items.find(
        (item) => item.id === input.snapshotItemId,
      );
      if (!snapshotItem) {
        return localConflict("O item não pertence ao snapshot armazenado desta inspeção.");
      }

      const entityKey = `response:${snapshotItem.id}`;
      const existingOperations = await db.operations
        .where("[inspectionId+entityKey]")
        .equals([input.inspectionId, entityKey])
        .toArray();
      const userOperations = await db.operations.where("userId").equals(session.data.id).toArray();
      const blockingOperation = existingOperations.find(
        (operation) => operation.status === "ERROR" || operation.status === "CONFLICT",
      );

      if (blockingOperation) {
        return localConflict(
          "Há uma falha de sincronização neste item. Revise o conflito antes de continuar.",
        );
      }

      const previousOperation = [...existingOperations].sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
      )[0];
      const now = new Date();
      const inspection = structuredClone(record.inspection);
      const responseIndex = inspection.responses.findIndex(
        (response) => response.snapshotItemId === snapshotItem.id,
      );
      const existingResponse = responseIndex >= 0 ? inspection.responses[responseIndex] : null;
      const responseId = existingResponse?.id ?? crypto.randomUUID();
      const observation = input.observation?.trim() || null;
      const response: OfflineInspectionResponse = {
        id: responseId,
        inspectionId: input.inspectionId,
        checklistItemId: existingResponse?.checklistItemId ?? null,
        snapshotItemId: snapshotItem.id,
        status: input.status,
        observation,
        clientUpdatedAt: now,
        createdAt: existingResponse?.createdAt ?? now,
        updatedAt: now,
        checklistItem: existingResponse?.checklistItem ?? null,
        snapshotItem,
        nonConformity:
          input.status === "NON_COMPLIANT"
            ? createLocalNonConformity(
                responseId,
                observation || snapshotItem.description,
                existingResponse?.nonConformity ?? null,
                now,
              )
            : null,
      };

      if (responseIndex >= 0) {
        inspection.responses[responseIndex] = response;
      } else {
        inspection.responses.push(response);
      }

      inspection.status = "IN_PROGRESS";
      inspection.syncStatus = "PENDING";
      inspection.updatedAt = now;

      const operation: SaveResponseOperation = {
        id: crypto.randomUUID(),
        userId: session.data.id,
        inspectionId: input.inspectionId,
        entityKey,
        type: "SAVE_INSPECTION_RESPONSE",
        status: "PENDING",
        sequence: nextOperationSequence(userOperations),
        createdAt: now,
        updatedAt: now,
        attemptCount: 0,
        nextAttemptAt: now,
        dependsOnOperationId: previousOperation?.id ?? null,
        lastErrorCode: null,
        lastErrorMessage: null,
        payload: {
          snapshotItemId: snapshotItem.id,
          status: input.status,
          observation,
          expectedResponseUpdatedAt: previousOperation
            ? null
            : existingResponse
              ? toDate(existingResponse.updatedAt)
              : null,
          clientCreatedAt: now,
        },
      };

      await db.operations.add(operation);
      await db.inspectionPackages.put({
        ...record,
        inspection,
        cachedAt: now,
        localSyncStatus: "PENDING",
      });

      return {
        success: true,
        data: response,
        message: "Resposta armazenada localmente e pendente de sincronização.",
      };
    },
  );

  notifyOfflineStateChanged();
  return result;
}

export async function queueInspectionFinish(
  inspectionId: string,
): Promise<OfflineInspectionResult> {
  if (!isOfflineStorageAvailable()) {
    return offlineDataUnavailable();
  }

  const session = await getCachedOfflineSession();
  if (!session.success) {
    return session;
  }

  const db = getOfflineDatabase();
  const key = inspectionPackageKey(session.data.id, inspectionId);
  const result = await db.transaction(
    "rw",
    db.inspectionPackages,
    db.operations,
    async (): Promise<OfflineInspectionResult> => {
      const record = await db.inspectionPackages.get(key);

      if (!record?.inspection.snapshot) {
        return offlineDataUnavailable();
      }

      const blockingOperation = await db.operations
        .where("inspectionId")
        .equals(inspectionId)
        .filter((operation) => operation.status === "ERROR" || operation.status === "CONFLICT")
        .first();
      if (blockingOperation) {
        return localConflict(
          "A inspeção possui falhas de sincronização que precisam ser revistas.",
        );
      }

      const answeredItemIds = new Set(
        record.inspection.responses
          .map((response) => response.snapshotItemId)
          .filter((id): id is string => id !== null),
      );
      const missingRequiredItems = record.inspection.snapshot.items.filter(
        (item) => item.isRequired && !answeredItemIds.has(item.id),
      );
      if (missingRequiredItems.length > 0) {
        return localConflict(
          `${missingRequiredItems.length} item(ns) obrigatório(s) ainda precisam de resposta.`,
        );
      }

      const existingFinish = await db.operations
        .where("inspectionId")
        .equals(inspectionId)
        .filter((operation) => operation.type === "FINISH_INSPECTION")
        .first();
      if (existingFinish) {
        return { success: true, data: record.inspection };
      }

      const now = new Date();
      const userOperations = await db.operations.where("userId").equals(session.data.id).toArray();
      const operation: FinishInspectionOperation = {
        id: crypto.randomUUID(),
        userId: session.data.id,
        inspectionId,
        entityKey: `inspection:${inspectionId}:finish`,
        type: "FINISH_INSPECTION",
        status: "PENDING",
        sequence: nextOperationSequence(userOperations),
        createdAt: now,
        updatedAt: now,
        attemptCount: 0,
        nextAttemptAt: now,
        dependsOnOperationId: null,
        lastErrorCode: null,
        lastErrorMessage: null,
        payload: { clientCreatedAt: now },
      };
      const inspection = structuredClone(record.inspection);
      inspection.status = "COMPLETED";
      inspection.syncStatus = "PENDING";
      inspection.updatedAt = now;

      await db.operations.add(operation);
      await db.inspectionPackages.put({
        ...record,
        inspection,
        cachedAt: now,
        localSyncStatus: "PENDING",
      });

      return { success: true, data: inspection };
    },
  );

  notifyOfflineStateChanged();
  return result;
}

export async function getOfflineQueueSummary(userId?: string): Promise<OfflineQueueSummary> {
  if (!isOfflineStorageAvailable()) {
    return {
      pending: 0,
      syncing: 0,
      failed: 0,
      conflicts: 0,
      storedInspections: 0,
      storageAvailable: false,
    };
  }

  const db = getOfflineDatabase();
  const operations = userId
    ? await db.operations.where("userId").equals(userId).toArray()
    : await db.operations.toArray();
  const storedInspections = userId
    ? await db.inspectionPackages.where("userId").equals(userId).count()
    : await db.inspectionPackages.count();

  return {
    pending: operations.filter((operation) => operation.status === "PENDING").length,
    syncing: operations.filter((operation) => operation.status === "SYNCING").length,
    failed: operations.filter((operation) => operation.status === "ERROR").length,
    conflicts: operations.filter((operation) => operation.status === "CONFLICT").length,
    storedInspections,
    storageAvailable: true,
  };
}

export async function resetInterruptedOperations(): Promise<void> {
  if (!isOfflineStorageAvailable()) {
    return;
  }

  const db = getOfflineDatabase();
  await db.operations
    .where("status")
    .equals("SYNCING")
    .modify({ status: "PENDING", updatedAt: new Date(), nextAttemptAt: new Date() });
}

export async function retryFailedOperations(): Promise<void> {
  if (!isOfflineStorageAvailable()) {
    return;
  }

  const now = new Date();
  await getOfflineDatabase().operations.where("status").equals("ERROR").modify({
    status: "PENDING",
    attemptCount: 0,
    nextAttemptAt: now,
    updatedAt: now,
    lastErrorCode: null,
    lastErrorMessage: null,
  });
  notifyOfflineStateChanged();
}

export async function getNextPendingOperation(userId: string): Promise<OfflineOperation | null> {
  const operations = await getOfflineDatabase().operations.where("userId").equals(userId).toArray();
  const first = operations.sort(
    (left, right) => left.sequence - right.sequence || left.id.localeCompare(right.id),
  )[0];

  if (
    !first ||
    first.status !== "PENDING" ||
    first.nextAttemptAt.getTime() > Date.now() ||
    first.dependsOnOperationId !== null
  ) {
    return null;
  }

  return first;
}

function createLocalNonConformity(
  responseId: string,
  description: string,
  existing: OfflineInspectionResponse["nonConformity"],
  now: Date,
): NonNullable<OfflineInspectionResponse["nonConformity"]> {
  if (existing) {
    return {
      ...existing,
      deletedAt: null,
      status: existing.deletedAt ? "OPEN" : existing.status,
      updatedAt: now,
    };
  }

  return {
    id: crypto.randomUUID(),
    inspectionResponseId: responseId,
    description,
    severity: "MEDIUM",
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1_000),
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function nextOperationSequence(operations: OfflineOperation[]): number {
  return operations.reduce((highest, operation) => Math.max(highest, operation.sequence), 0) + 1;
}

function offlineDataUnavailable(): OfflineInspectionResult & OfflineResponseResult {
  return {
    success: false,
    message: "Esta inspeção ainda não foi disponibilizada localmente neste dispositivo.",
    code: "OFFLINE_DATA_UNAVAILABLE",
    statusCode: 404,
  };
}

function localConflict(message: string): OfflineInspectionResult & OfflineResponseResult {
  return {
    success: false,
    message,
    code: "OFFLINE_LOCAL_CONFLICT",
    statusCode: 409,
  };
}
