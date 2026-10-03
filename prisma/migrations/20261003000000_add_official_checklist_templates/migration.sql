-- Existing checklists remain user-owned. Platform content has no login account.
ALTER TABLE "Checklist" ADD COLUMN "isOfficial" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Checklist" ALTER COLUMN "createdById" DROP NOT NULL;
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_ownership_check" CHECK (
  ("isOfficial" AND "createdById" IS NULL AND "isTemplate")
  OR (NOT "isOfficial" AND "createdById" IS NOT NULL)
);

-- NULL authors identify platform-managed versions through their parent checklist.
ALTER TABLE "ChecklistVersion" ALTER COLUMN "createdById" DROP NOT NULL;
ALTER TABLE "ChecklistVersion" DROP CONSTRAINT "ChecklistVersion_publicationState_check";
ALTER TABLE "ChecklistVersion" ADD CONSTRAINT "ChecklistVersion_publicationState_check" CHECK (
  ("status" = 'DRAFT' AND "publishedById" IS NULL AND "publishedAt" IS NULL AND "contentHash" IS NULL)
  OR (
    "status" IN ('PUBLISHED', 'RETIRED')
    AND ("publishedById" IS NOT NULL OR "createdById" IS NULL)
    AND "publishedAt" IS NOT NULL AND "contentHash" IS NOT NULL
  )
);
