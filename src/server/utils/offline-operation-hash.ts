import { createHash } from "node:crypto";

import { OfflineOperationType, type ResponseStatus } from "@/generated/prisma/client";

export type OfflineOperationHashInput =
  | {
      type: typeof OfflineOperationType.SAVE_INSPECTION_RESPONSE;
      inspectionId: string;
      snapshotItemId: string;
      status: ResponseStatus;
      observation: string | null;
      expectedResponseUpdatedAt: Date | null;
      clientCreatedAt: Date;
    }
  | {
      type: typeof OfflineOperationType.FINISH_INSPECTION;
      inspectionId: string;
      clientCreatedAt: Date;
    };

export function createOfflineOperationPayloadHash(input: OfflineOperationHashInput): string {
  const canonical =
    input.type === "SAVE_INSPECTION_RESPONSE"
      ? {
          type: input.type,
          inspectionId: input.inspectionId,
          snapshotItemId: input.snapshotItemId,
          status: input.status,
          observation: input.observation?.normalize("NFC") ?? null,
          expectedResponseUpdatedAt: input.expectedResponseUpdatedAt?.toISOString() ?? null,
          clientCreatedAt: input.clientCreatedAt.toISOString(),
        }
      : {
          type: input.type,
          inspectionId: input.inspectionId,
          clientCreatedAt: input.clientCreatedAt.toISOString(),
        };

  return createHash("sha256").update(JSON.stringify(canonical), "utf8").digest("hex");
}
