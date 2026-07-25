-- AlterTable
ALTER TABLE "CorrectiveAction"
ADD COLUMN "why" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "method" TEXT,
ADD COLUMN "estimatedCost" TEXT;
