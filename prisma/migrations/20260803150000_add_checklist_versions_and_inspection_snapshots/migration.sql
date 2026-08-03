-- The backfill hashes the best currently recoverable legacy state. It does not
-- claim that this state is identical to the checklist at inspection time.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "ChecklistVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "InspectionSnapshotOrigin" AS ENUM ('INSPECTION_CREATION', 'LEGACY_BACKFILL');

-- CreateEnum
CREATE TYPE "InspectionSnapshotIntegrityStatus" AS ENUM ('VERIFIED', 'UNVERIFIED_LEGACY');

-- CreateTable
CREATE TABLE "ChecklistVersion" (
    "id" UUID NOT NULL,
    "checklistId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "ChecklistVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "contentHash" CHAR(64),
    "createdById" UUID NOT NULL,
    "publishedById" UUID,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistVersion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ChecklistVersion_versionNumber_check" CHECK ("versionNumber" > 0),
    CONSTRAINT "ChecklistVersion_contentSchemaVersion_check" CHECK ("contentSchemaVersion" >= 0),
    CONSTRAINT "ChecklistVersion_contentHash_check" CHECK (
        "contentHash" IS NULL OR "contentHash" ~ '^[0-9a-f]{64}$'
    ),
    CONSTRAINT "ChecklistVersion_publicationState_check" CHECK (
        (
            "status" = 'DRAFT'
            AND "publishedById" IS NULL
            AND "publishedAt" IS NULL
            AND "contentHash" IS NULL
        )
        OR
        (
            "status" IN ('PUBLISHED', 'RETIRED')
            AND "publishedById" IS NOT NULL
            AND "publishedAt" IS NOT NULL
            AND "contentHash" IS NOT NULL
        )
    )
);

-- CreateTable
CREATE TABLE "ChecklistVersionItem" (
    "id" UUID NOT NULL,
    "checklistVersionId" UUID NOT NULL,
    "sourceVersionItemId" UUID,
    "sourceChecklistItemId" UUID,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistVersionItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ChecklistVersionItem_orderIndex_check" CHECK ("orderIndex" > 0)
);

-- CreateTable
CREATE TABLE "ChecklistVersionItemStandard" (
    "checklistVersionItemId" UUID NOT NULL,
    "standardId" UUID NOT NULL,
    "type" "StandardType" NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "officialUrl" TEXT,

    CONSTRAINT "ChecklistVersionItemStandard_pkey" PRIMARY KEY ("checklistVersionItemId", "standardId")
);

-- Expand existing inspection and response tables. These foreign keys remain
-- nullable during the compatibility window; Services require them for new data.
ALTER TABLE "Inspection" ADD COLUMN "checklistVersionId" UUID;

ALTER TABLE "InspectionResponse"
    ALTER COLUMN "checklistItemId" DROP NOT NULL,
    ADD COLUMN "snapshotItemId" UUID,
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "InspectionResponse"
SET "updatedAt" = CURRENT_TIMESTAMP
WHERE "updatedAt" IS NULL;

ALTER TABLE "InspectionResponse"
    ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "InspectionChecklistSnapshot" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "sourceChecklistId" UUID NOT NULL,
    "sourceChecklistVersionId" UUID NOT NULL,
    "sourceVersionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isTemplate" BOOLEAN NOT NULL,
    "snapshotSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "contentHash" CHAR(64) NOT NULL,
    "origin" "InspectionSnapshotOrigin" NOT NULL,
    "integrityStatus" "InspectionSnapshotIntegrityStatus" NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionChecklistSnapshot_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InspectionChecklistSnapshot_sourceVersionNumber_check" CHECK ("sourceVersionNumber" > 0),
    CONSTRAINT "InspectionChecklistSnapshot_schemaVersion_check" CHECK ("snapshotSchemaVersion" >= 0),
    CONSTRAINT "InspectionChecklistSnapshot_contentHash_check" CHECK ("contentHash" ~ '^[0-9a-f]{64}$')
);

-- CreateTable
CREATE TABLE "InspectionSnapshotItem" (
    "id" UUID NOT NULL,
    "snapshotId" UUID NOT NULL,
    "sourceVersionItemId" UUID NOT NULL,
    "sourceChecklistItemId" UUID,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InspectionSnapshotItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InspectionSnapshotItem_orderIndex_check" CHECK ("orderIndex" > 0)
);

-- CreateTable
CREATE TABLE "InspectionSnapshotItemStandard" (
    "snapshotItemId" UUID NOT NULL,
    "standardId" UUID NOT NULL,
    "type" "StandardType" NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "officialUrl" TEXT,

    CONSTRAINT "InspectionSnapshotItemStandard_pkey" PRIMARY KEY ("snapshotItemId", "standardId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistVersion_checklistId_versionNumber_key"
ON "ChecklistVersion"("checklistId", "versionNumber");

CREATE UNIQUE INDEX "ChecklistVersion_one_draft_per_checklist_key"
ON "ChecklistVersion"("checklistId")
WHERE "status" = 'DRAFT';

CREATE INDEX "ChecklistVersion_checklistId_status_idx"
ON "ChecklistVersion"("checklistId", "status");

CREATE INDEX "ChecklistVersion_status_idx" ON "ChecklistVersion"("status");
CREATE INDEX "ChecklistVersion_publishedAt_idx" ON "ChecklistVersion"("publishedAt");

CREATE UNIQUE INDEX "ChecklistVersionItem_checklistVersionId_orderIndex_key"
ON "ChecklistVersionItem"("checklistVersionId", "orderIndex");

CREATE INDEX "ChecklistVersionItem_checklistVersionId_idx"
ON "ChecklistVersionItem"("checklistVersionId");

CREATE INDEX "ChecklistVersionItem_sourceVersionItemId_idx"
ON "ChecklistVersionItem"("sourceVersionItemId");

CREATE INDEX "ChecklistVersionItem_sourceChecklistItemId_idx"
ON "ChecklistVersionItem"("sourceChecklistItemId");

CREATE INDEX "ChecklistVersionItemStandard_standardId_idx"
ON "ChecklistVersionItemStandard"("standardId");

CREATE INDEX "ChecklistVersionItemStandard_code_idx"
ON "ChecklistVersionItemStandard"("code");

CREATE INDEX "Inspection_checklistVersionId_idx" ON "Inspection"("checklistVersionId");

CREATE UNIQUE INDEX "InspectionChecklistSnapshot_inspectionId_key"
ON "InspectionChecklistSnapshot"("inspectionId");

CREATE INDEX "InspectionChecklistSnapshot_sourceChecklistId_idx"
ON "InspectionChecklistSnapshot"("sourceChecklistId");

CREATE INDEX "InspectionChecklistSnapshot_sourceChecklistVersionId_idx"
ON "InspectionChecklistSnapshot"("sourceChecklistVersionId");

CREATE INDEX "InspectionChecklistSnapshot_origin_idx"
ON "InspectionChecklistSnapshot"("origin");

CREATE INDEX "InspectionChecklistSnapshot_integrityStatus_idx"
ON "InspectionChecklistSnapshot"("integrityStatus");

CREATE UNIQUE INDEX "InspectionSnapshotItem_snapshotId_orderIndex_key"
ON "InspectionSnapshotItem"("snapshotId", "orderIndex");

CREATE INDEX "InspectionSnapshotItem_snapshotId_idx"
ON "InspectionSnapshotItem"("snapshotId");

CREATE INDEX "InspectionSnapshotItem_sourceVersionItemId_idx"
ON "InspectionSnapshotItem"("sourceVersionItemId");

CREATE INDEX "InspectionSnapshotItem_sourceChecklistItemId_idx"
ON "InspectionSnapshotItem"("sourceChecklistItemId");

CREATE INDEX "InspectionSnapshotItemStandard_standardId_idx"
ON "InspectionSnapshotItemStandard"("standardId");

CREATE INDEX "InspectionSnapshotItemStandard_code_idx"
ON "InspectionSnapshotItemStandard"("code");

CREATE INDEX "InspectionResponse_snapshotItemId_idx"
ON "InspectionResponse"("snapshotItemId");

CREATE UNIQUE INDEX "InspectionResponse_inspectionId_snapshotItemId_key"
ON "InspectionResponse"("inspectionId", "snapshotItemId");

-- AddForeignKey
ALTER TABLE "ChecklistVersion"
ADD CONSTRAINT "ChecklistVersion_checklistId_fkey"
FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChecklistVersion"
ADD CONSTRAINT "ChecklistVersion_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChecklistVersion"
ADD CONSTRAINT "ChecklistVersion_publishedById_fkey"
FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChecklistVersionItem"
ADD CONSTRAINT "ChecklistVersionItem_checklistVersionId_fkey"
FOREIGN KEY ("checklistVersionId") REFERENCES "ChecklistVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChecklistVersionItem"
ADD CONSTRAINT "ChecklistVersionItem_sourceVersionItemId_fkey"
FOREIGN KEY ("sourceVersionItemId") REFERENCES "ChecklistVersionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChecklistVersionItem"
ADD CONSTRAINT "ChecklistVersionItem_sourceChecklistItemId_fkey"
FOREIGN KEY ("sourceChecklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChecklistVersionItemStandard"
ADD CONSTRAINT "ChecklistVersionItemStandard_checklistVersionItemId_fkey"
FOREIGN KEY ("checklistVersionItemId") REFERENCES "ChecklistVersionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChecklistVersionItemStandard"
ADD CONSTRAINT "ChecklistVersionItemStandard_standardId_fkey"
FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Inspection"
ADD CONSTRAINT "Inspection_checklistVersionId_fkey"
FOREIGN KEY ("checklistVersionId") REFERENCES "ChecklistVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionChecklistSnapshot"
ADD CONSTRAINT "InspectionChecklistSnapshot_inspectionId_fkey"
FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionChecklistSnapshot"
ADD CONSTRAINT "InspectionChecklistSnapshot_sourceChecklistId_fkey"
FOREIGN KEY ("sourceChecklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionChecklistSnapshot"
ADD CONSTRAINT "InspectionChecklistSnapshot_sourceChecklistVersionId_fkey"
FOREIGN KEY ("sourceChecklistVersionId") REFERENCES "ChecklistVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionSnapshotItem"
ADD CONSTRAINT "InspectionSnapshotItem_snapshotId_fkey"
FOREIGN KEY ("snapshotId") REFERENCES "InspectionChecklistSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionSnapshotItem"
ADD CONSTRAINT "InspectionSnapshotItem_sourceVersionItemId_fkey"
FOREIGN KEY ("sourceVersionItemId") REFERENCES "ChecklistVersionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionSnapshotItem"
ADD CONSTRAINT "InspectionSnapshotItem_sourceChecklistItemId_fkey"
FOREIGN KEY ("sourceChecklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionSnapshotItemStandard"
ADD CONSTRAINT "InspectionSnapshotItemStandard_snapshotItemId_fkey"
FOREIGN KEY ("snapshotItemId") REFERENCES "InspectionSnapshotItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionSnapshotItemStandard"
ADD CONSTRAINT "InspectionSnapshotItemStandard_standardId_fkey"
FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionResponse"
ADD CONSTRAINT "InspectionResponse_snapshotItemId_fkey"
FOREIGN KEY ("snapshotItemId") REFERENCES "InspectionSnapshotItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill one imported, published version for every existing checklist. The
-- existing checklist UUID is safe to reuse because this is a different table.
WITH "ChecklistPayload" AS (
    SELECT
        c."id",
        jsonb_build_object(
            'schemaVersion', 0,
            'title', c."title",
            'description', c."description",
            'items', COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'description', ci."description",
                            'orderIndex', ci."orderIndex",
                            'isRequired', ci."isRequired",
                            'standards', COALESCE(
                                (
                                    SELECT jsonb_agg(
                                        jsonb_build_object(
                                            'type', s."type"::text,
                                            'code', s."code",
                                            'title', s."title",
                                            'summary', s."summary",
                                            'officialUrl', s."officialUrl"
                                        )
                                        ORDER BY s."type", s."code", s."id"
                                    )
                                    FROM "ChecklistItemStandard" cis
                                    JOIN "Standard" s ON s."id" = cis."standardId"
                                    WHERE cis."checklistItemId" = ci."id"
                                ),
                                '[]'::jsonb
                            )
                        )
                        ORDER BY ci."orderIndex", ci."id"
                    )
                    FROM "ChecklistItem" ci
                    WHERE ci."checklistId" = c."id"
                ),
                '[]'::jsonb
            )
        )::text AS "payload"
    FROM "Checklist" c
)
INSERT INTO "ChecklistVersion" (
    "id",
    "checklistId",
    "versionNumber",
    "status",
    "title",
    "description",
    "contentSchemaVersion",
    "contentHash",
    "createdById",
    "publishedById",
    "publishedAt",
    "createdAt",
    "updatedAt"
)
SELECT
    c."id",
    c."id",
    1,
    'PUBLISHED',
    c."title",
    c."description",
    0,
    encode(digest(cp."payload", 'sha256'), 'hex'),
    c."createdById",
    c."createdById",
    CURRENT_TIMESTAMP,
    c."createdAt",
    CURRENT_TIMESTAMP
FROM "Checklist" c
JOIN "ChecklistPayload" cp ON cp."id" = c."id"
ON CONFLICT ("checklistId", "versionNumber") DO NOTHING;

INSERT INTO "ChecklistVersionItem" (
    "id",
    "checklistVersionId",
    "sourceVersionItemId",
    "sourceChecklistItemId",
    "description",
    "orderIndex",
    "isRequired",
    "createdAt",
    "updatedAt"
)
SELECT
    ci."id",
    ci."checklistId",
    NULL,
    ci."id",
    ci."description",
    ci."orderIndex",
    ci."isRequired",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "ChecklistItem" ci
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ChecklistVersionItemStandard" (
    "checklistVersionItemId",
    "standardId",
    "type",
    "code",
    "title",
    "summary",
    "officialUrl"
)
SELECT
    cis."checklistItemId",
    s."id",
    s."type",
    s."code",
    s."title",
    s."summary",
    s."officialUrl"
FROM "ChecklistItemStandard" cis
JOIN "Standard" s ON s."id" = cis."standardId"
ON CONFLICT ("checklistVersionItemId", "standardId") DO NOTHING;

UPDATE "Inspection"
SET "checklistVersionId" = "checklistId"
WHERE "checklistVersionId" IS NULL;

INSERT INTO "InspectionChecklistSnapshot" (
    "id",
    "inspectionId",
    "sourceChecklistId",
    "sourceChecklistVersionId",
    "sourceVersionNumber",
    "title",
    "description",
    "isTemplate",
    "snapshotSchemaVersion",
    "contentHash",
    "origin",
    "integrityStatus",
    "capturedAt"
)
SELECT
    i."id",
    i."id",
    i."checklistId",
    cv."id",
    cv."versionNumber",
    cv."title",
    cv."description",
    c."isTemplate",
    0,
    cv."contentHash",
    'LEGACY_BACKFILL',
    'UNVERIFIED_LEGACY',
    CURRENT_TIMESTAMP
FROM "Inspection" i
JOIN "Checklist" c ON c."id" = i."checklistId"
JOIN "ChecklistVersion" cv ON cv."id" = i."checklistVersionId"
ON CONFLICT ("inspectionId") DO NOTHING;

WITH "SnapshotItemSource" AS (
    SELECT
        s."id" AS "snapshotId",
        cvi."id" AS "sourceVersionItemId",
        cvi."sourceChecklistItemId",
        cvi."description",
        cvi."orderIndex",
        cvi."isRequired",
        md5('snapshot-item:' || s."id"::text || ':' || cvi."id"::text) AS "deterministicHash"
    FROM "InspectionChecklistSnapshot" s
    JOIN "ChecklistVersionItem" cvi
      ON cvi."checklistVersionId" = s."sourceChecklistVersionId"
)
INSERT INTO "InspectionSnapshotItem" (
    "id",
    "snapshotId",
    "sourceVersionItemId",
    "sourceChecklistItemId",
    "description",
    "orderIndex",
    "isRequired"
)
SELECT
    (
        substr("deterministicHash", 1, 8) || '-' ||
        substr("deterministicHash", 9, 4) || '-4' ||
        substr("deterministicHash", 14, 3) || '-a' ||
        substr("deterministicHash", 18, 3) || '-' ||
        substr("deterministicHash", 21, 12)
    )::uuid,
    "snapshotId",
    "sourceVersionItemId",
    "sourceChecklistItemId",
    "description",
    "orderIndex",
    "isRequired"
FROM "SnapshotItemSource"
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "InspectionSnapshotItemStandard" (
    "snapshotItemId",
    "standardId",
    "type",
    "code",
    "title",
    "summary",
    "officialUrl"
)
SELECT
    sii."id",
    cvis."standardId",
    cvis."type",
    cvis."code",
    cvis."title",
    cvis."summary",
    cvis."officialUrl"
FROM "InspectionSnapshotItem" sii
JOIN "ChecklistVersionItemStandard" cvis
  ON cvis."checklistVersionItemId" = sii."sourceVersionItemId"
ON CONFLICT ("snapshotItemId", "standardId") DO NOTHING;

UPDATE "InspectionResponse" ir
SET "snapshotItemId" = sii."id"
FROM "InspectionChecklistSnapshot" s
JOIN "InspectionSnapshotItem" sii ON sii."snapshotId" = s."id"
WHERE ir."inspectionId" = s."inspectionId"
  AND ir."checklistItemId" = sii."sourceChecklistItemId"
  AND ir."snapshotItemId" IS NULL;

ALTER TABLE "InspectionResponse"
ADD CONSTRAINT "InspectionResponse_itemReference_check"
CHECK ("snapshotItemId" IS NOT NULL OR "checklistItemId" IS NOT NULL);

-- Abort atomically if the legacy graph could not be mapped without ambiguity.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Inspection" i
        LEFT JOIN "InspectionChecklistSnapshot" s ON s."inspectionId" = i."id"
        WHERE i."checklistVersionId" IS NULL OR s."id" IS NULL
    ) THEN
        RAISE EXCEPTION 'Checklist versioning backfill left an inspection without version or snapshot';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "InspectionResponse"
        WHERE "snapshotItemId" IS NULL
    ) THEN
        RAISE EXCEPTION 'Checklist versioning backfill left an inspection response without snapshot item';
    END IF;
END $$;
