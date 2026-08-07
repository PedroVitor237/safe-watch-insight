import type { getCurrentSession } from "@/lib/api/auth.functions";
import type { getInspectionById } from "@/lib/api/inspection.functions";
import type {
  finishInspection,
  saveInspectionResponse,
} from "@/lib/api/inspection-response.functions";

type SuccessData<TResult> =
  Extract<TResult, { success: true }> extends { data: infer TData } ? TData : never;

export type OfflineSessionUser = SuccessData<Awaited<ReturnType<typeof getCurrentSession>>>;
export type OfflineInspection = SuccessData<Awaited<ReturnType<typeof getInspectionById>>>;
export type OfflineInspectionResponse = SuccessData<
  Awaited<ReturnType<typeof saveInspectionResponse>>
>;
export type OfflineFinishedInspection = SuccessData<Awaited<ReturnType<typeof finishInspection>>>;

export type LocalSyncStatus = "SYNCED" | "PENDING" | "SYNCING" | "ERROR" | "CONFLICT";
export type LocalOperationStatus = Exclude<LocalSyncStatus, "SYNCED">;
export type LocalOperationType = "SAVE_INSPECTION_RESPONSE" | "FINISH_INSPECTION";

export interface OfflineSessionRecord {
  key: "current";
  user: OfflineSessionUser;
  verifiedAt: Date;
  expiresAt: Date;
}

export interface OfflineInspectionPackage {
  key: string;
  userId: string;
  inspectionId: string;
  inspection: OfflineInspection;
  cachedAt: Date;
  localSyncStatus: LocalSyncStatus;
}

interface LocalOperationBase {
  id: string;
  userId: string;
  inspectionId: string;
  entityKey: string;
  type: LocalOperationType;
  status: LocalOperationStatus;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
  attemptCount: number;
  nextAttemptAt: Date;
  dependsOnOperationId: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
}

export interface SaveResponseOperation extends LocalOperationBase {
  type: "SAVE_INSPECTION_RESPONSE";
  payload: {
    snapshotItemId: string;
    status: "COMPLIANT" | "NON_COMPLIANT" | "NOT_APPLICABLE";
    observation: string | null;
    expectedResponseUpdatedAt: Date | null;
    clientCreatedAt: Date;
  };
}

export interface FinishInspectionOperation extends LocalOperationBase {
  type: "FINISH_INSPECTION";
  payload: {
    clientCreatedAt: Date;
  };
}

export type OfflineOperation = SaveResponseOperation | FinishInspectionOperation;

export interface OfflineQueueSummary {
  pending: number;
  syncing: number;
  failed: number;
  conflicts: number;
  storedInspections: number;
  storageAvailable: boolean;
}
