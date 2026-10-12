import type { Prisma } from "@/generated/prisma/client";

/** Acquire before reading revisions/idempotency; READ COMMITTED refreshes reads after waiting. */
export async function lockOwnedInspection(
  transaction: Prisma.TransactionClient,
  inspectionId: string,
  userId: string,
): Promise<boolean> {
  const rows = await transaction.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Inspection"
    WHERE "id" = ${inspectionId}::uuid
      AND "userId" = ${userId}::uuid
      AND "deletedAt" IS NULL
    FOR UPDATE
  `;

  return rows.length === 1;
}
