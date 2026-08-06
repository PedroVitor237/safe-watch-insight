-- Evidence files remain in external storage. PostgreSQL stores only the
-- provider identifier, delivery URL and technical metadata required to manage
-- the file lifecycle safely.
BEGIN;

ALTER TABLE "Evidence"
ADD COLUMN "publicId" TEXT,
ADD COLUMN "width" INTEGER,
ADD COLUMN "height" INTEGER,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Evidence"
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Existing environments may contain metadata created before the provider
-- identifier became mandatory. A deterministic legacy value keeps the
-- migration expansive without claiming that those files are managed by
-- Cloudinary.
UPDATE "Evidence"
SET "publicId" = 'legacy/' || "id"
WHERE "publicId" IS NULL;

ALTER TABLE "Evidence"
ALTER COLUMN "publicId" SET NOT NULL;

CREATE UNIQUE INDEX "Evidence_publicId_key" ON "Evidence"("publicId");

ALTER TABLE "Evidence" DROP CONSTRAINT "Evidence_inspectionId_fkey";
ALTER TABLE "Evidence" DROP CONSTRAINT "Evidence_nonConformityId_fkey";

ALTER TABLE "Evidence"
ADD CONSTRAINT "Evidence_inspectionId_fkey"
FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Evidence"
ADD CONSTRAINT "Evidence_nonConformityId_fkey"
FOREIGN KEY ("nonConformityId") REFERENCES "NonConformity"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- An evidence record belongs to exactly one historical context. An inspection
-- owns its immutable checklist snapshot; a non-conformity owns the response
-- linked to an immutable snapshot item.
ALTER TABLE "Evidence"
ADD CONSTRAINT "Evidence_exactly_one_historical_context_check"
CHECK (num_nonnulls("inspectionId", "nonConformityId") = 1);

COMMIT;
