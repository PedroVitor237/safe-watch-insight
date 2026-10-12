import { Prisma, type OfflineOperationType } from "@/generated/prisma/client";

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

export async function persistOfflineOperation(
  transaction: Prisma.TransactionClient,
  data: Prisma.OfflineSyncOperationUncheckedCreateInput,
): Promise<void> {
  try {
    await transaction.offlineSyncOperation.create({ data });
  } catch (error) {
    // The sole unique key here is the global operation UUID. Two independently
    // locked inspections can still compete for it. Throw so the entire losing
    // transaction rolls back before the Service maps the existing conflict.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new OfflineOperationPayloadConflictError();
    }

    throw error;
  }
}
