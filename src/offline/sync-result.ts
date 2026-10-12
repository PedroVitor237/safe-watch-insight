import { z } from "zod";

import type { OfflineOperation } from "./types";

const timestamp = z.union([z.date(), z.string().datetime()]);
const serverFailure = z.object({
  success: z.literal(false),
  code: z.string().min(1),
  message: z.string(),
  statusCode: z.number().int().min(400).max(599),
});
const responseConfirmation = z.object({
  id: z.string().uuid(),
  inspectionId: z.string().uuid(),
  snapshotItemId: z.string().uuid(),
  status: z.enum(["COMPLIANT", "NON_COMPLIANT", "NOT_APPLICABLE"]),
  observation: z.string().nullable(),
  updatedAt: timestamp,
  nonConformity: z.object({}).nullable(),
});
const finishConfirmation = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.literal("COMPLETED"),
  syncStatus: z.literal("SYNCED"),
  snapshot: z.object({}),
  responses: z.array(z.object({})),
});

// Inspect essential acknowledgement fields without replacing the original DTO.
export function isValidSynchronizationResult(
  result: unknown,
  operation: OfflineOperation,
): boolean {
  if (serverFailure.safeParse(result).success) {
    return true;
  }

  if (operation.type === "SAVE_INSPECTION_RESPONSE") {
    const parsed = z
      .object({ success: z.literal(true), data: responseConfirmation })
      .safeParse(result);
    return (
      parsed.success &&
      parsed.data.data.inspectionId === operation.inspectionId &&
      parsed.data.data.snapshotItemId === operation.payload.snapshotItemId
    );
  }

  const parsed = z.object({ success: z.literal(true), data: finishConfirmation }).safeParse(result);
  return (
    parsed.success &&
    parsed.data.data.id === operation.inspectionId &&
    parsed.data.data.userId === operation.userId
  );
}
