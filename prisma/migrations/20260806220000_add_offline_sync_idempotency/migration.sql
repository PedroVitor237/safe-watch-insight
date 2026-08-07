-- Client-generated operation IDs are persisted atomically with offline
-- mutations. This makes retries safe after an interrupted request without
-- storing the complete (and potentially sensitive) request payload.
BEGIN;

CREATE TYPE "OfflineOperationType" AS ENUM (
  'SAVE_INSPECTION_RESPONSE',
  'FINISH_INSPECTION'
);

-- Keep the device event time for audit purposes while updatedAt remains the
-- authoritative server revision used by optimistic conflict detection.
ALTER TABLE "InspectionResponse"
ADD COLUMN "clientUpdatedAt" TIMESTAMP(3);

CREATE TABLE "OfflineSyncOperation" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "inspectionId" UUID NOT NULL,
  "type" "OfflineOperationType" NOT NULL,
  "payloadHash" CHAR(64) NOT NULL,
  "clientCreatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OfflineSyncOperation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OfflineSyncOperation_payloadHash_check"
    CHECK ("payloadHash" ~ '^[0-9a-f]{64}$')
);

CREATE INDEX "OfflineSyncOperation_userId_completedAt_idx"
ON "OfflineSyncOperation"("userId", "completedAt");

CREATE INDEX "OfflineSyncOperation_inspectionId_completedAt_idx"
ON "OfflineSyncOperation"("inspectionId", "completedAt");

CREATE INDEX "OfflineSyncOperation_type_idx"
ON "OfflineSyncOperation"("type");

ALTER TABLE "OfflineSyncOperation"
ADD CONSTRAINT "OfflineSyncOperation_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OfflineSyncOperation"
ADD CONSTRAINT "OfflineSyncOperation_inspectionId_fkey"
FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
