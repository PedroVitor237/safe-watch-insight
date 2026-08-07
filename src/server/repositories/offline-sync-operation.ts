import type { OfflineOperationType } from "@/generated/prisma/client";

import { OfflineOperationPayloadConflictError } from "./offline-sync.errors";

export interface OfflineOperationIdentity {
  userId: string;
  inspectionId: string;
  type: OfflineOperationType;
  payloadHash: string;
}

export function assertMatchingOfflineOperation(
  completed: OfflineOperationIdentity,
  incoming: OfflineOperationIdentity,
): void {
  if (
    completed.userId !== incoming.userId ||
    completed.inspectionId !== incoming.inspectionId ||
    completed.type !== incoming.type ||
    completed.payloadHash !== incoming.payloadHash
  ) {
    throw new OfflineOperationPayloadConflictError();
  }
}
