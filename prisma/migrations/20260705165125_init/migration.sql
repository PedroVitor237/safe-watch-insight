-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TECHNICIAN', 'SUPERVISOR', 'AUDITOR');

-- CreateEnum
CREATE TYPE "StandardType" AS ENUM ('NR', 'NBR', 'NT', 'OTHER');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCING', 'SYNCED', 'ERROR');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NonConformityStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "CorrectiveActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "corporateName" TEXT NOT NULL,
    "tradeName" TEXT,
    "cnpj" TEXT,
    "cnae" TEXT NOT NULL,
    "riskLevel" INTEGER NOT NULL,
    "employeeCount" INTEGER NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" UUID NOT NULL,
    "checklistId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standard" (
    "id" UUID NOT NULL,
    "type" "StandardType" NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "officialUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Standard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItemStandard" (
    "checklistItemId" UUID NOT NULL,
    "standardId" UUID NOT NULL,

    CONSTRAINT "ChecklistItemStandard_pkey" PRIMARY KEY ("checklistItemId","standardId")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "checklistId" UUID NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'PLANNED',
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionResponse" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "checklistItemId" UUID NOT NULL,
    "status" "ResponseStatus" NOT NULL,
    "observation" TEXT,

    CONSTRAINT "InspectionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NonConformity" (
    "id" UUID NOT NULL,
    "inspectionResponseId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "NonConformityStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NonConformity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" UUID NOT NULL,
    "nonConformityId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "responsible" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "CorrectiveActionStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CorrectiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" UUID NOT NULL,
    "inspectionId" UUID,
    "nonConformityId" UUID,
    "storageUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "generatedById" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observations" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Company_cnpj_key" ON "Company"("cnpj");

-- CreateIndex
CREATE INDEX "Company_createdById_idx" ON "Company"("createdById");

-- CreateIndex
CREATE INDEX "Company_cnpj_idx" ON "Company"("cnpj");

-- CreateIndex
CREATE INDEX "Company_deletedAt_idx" ON "Company"("deletedAt");

-- CreateIndex
CREATE INDEX "Checklist_createdById_idx" ON "Checklist"("createdById");

-- CreateIndex
CREATE INDEX "Checklist_isTemplate_idx" ON "Checklist"("isTemplate");

-- CreateIndex
CREATE INDEX "Checklist_isActive_idx" ON "Checklist"("isActive");

-- CreateIndex
CREATE INDEX "Checklist_deletedAt_idx" ON "Checklist"("deletedAt");

-- CreateIndex
CREATE INDEX "ChecklistItem_checklistId_idx" ON "ChecklistItem"("checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_checklistId_orderIndex_key" ON "ChecklistItem"("checklistId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Standard_code_key" ON "Standard"("code");

-- CreateIndex
CREATE INDEX "Standard_type_idx" ON "Standard"("type");

-- CreateIndex
CREATE INDEX "Standard_code_idx" ON "Standard"("code");

-- CreateIndex
CREATE INDEX "Standard_isActive_idx" ON "Standard"("isActive");

-- CreateIndex
CREATE INDEX "ChecklistItemStandard_standardId_idx" ON "ChecklistItemStandard"("standardId");

-- CreateIndex
CREATE INDEX "Inspection_userId_idx" ON "Inspection"("userId");

-- CreateIndex
CREATE INDEX "Inspection_companyId_idx" ON "Inspection"("companyId");

-- CreateIndex
CREATE INDEX "Inspection_checklistId_idx" ON "Inspection"("checklistId");

-- CreateIndex
CREATE INDEX "Inspection_inspectionDate_idx" ON "Inspection"("inspectionDate");

-- CreateIndex
CREATE INDEX "Inspection_status_idx" ON "Inspection"("status");

-- CreateIndex
CREATE INDEX "Inspection_syncStatus_idx" ON "Inspection"("syncStatus");

-- CreateIndex
CREATE INDEX "Inspection_deletedAt_idx" ON "Inspection"("deletedAt");

-- CreateIndex
CREATE INDEX "InspectionResponse_inspectionId_idx" ON "InspectionResponse"("inspectionId");

-- CreateIndex
CREATE INDEX "InspectionResponse_checklistItemId_idx" ON "InspectionResponse"("checklistItemId");

-- CreateIndex
CREATE INDEX "InspectionResponse_status_idx" ON "InspectionResponse"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionResponse_inspectionId_checklistItemId_key" ON "InspectionResponse"("inspectionId", "checklistItemId");

-- CreateIndex
CREATE UNIQUE INDEX "NonConformity_inspectionResponseId_key" ON "NonConformity"("inspectionResponseId");

-- CreateIndex
CREATE INDEX "NonConformity_severity_idx" ON "NonConformity"("severity");

-- CreateIndex
CREATE INDEX "NonConformity_status_idx" ON "NonConformity"("status");

-- CreateIndex
CREATE INDEX "NonConformity_dueDate_idx" ON "NonConformity"("dueDate");

-- CreateIndex
CREATE INDEX "NonConformity_deletedAt_idx" ON "NonConformity"("deletedAt");

-- CreateIndex
CREATE INDEX "CorrectiveAction_nonConformityId_idx" ON "CorrectiveAction"("nonConformityId");

-- CreateIndex
CREATE INDEX "CorrectiveAction_status_idx" ON "CorrectiveAction"("status");

-- CreateIndex
CREATE INDEX "CorrectiveAction_dueDate_idx" ON "CorrectiveAction"("dueDate");

-- CreateIndex
CREATE INDEX "CorrectiveAction_deletedAt_idx" ON "CorrectiveAction"("deletedAt");

-- CreateIndex
CREATE INDEX "Evidence_inspectionId_idx" ON "Evidence"("inspectionId");

-- CreateIndex
CREATE INDEX "Evidence_nonConformityId_idx" ON "Evidence"("nonConformityId");

-- CreateIndex
CREATE INDEX "Evidence_mimeType_idx" ON "Evidence"("mimeType");

-- CreateIndex
CREATE INDEX "Evidence_deletedAt_idx" ON "Evidence"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Report_inspectionId_key" ON "Report"("inspectionId");

-- CreateIndex
CREATE INDEX "Report_generatedById_idx" ON "Report"("generatedById");

-- CreateIndex
CREATE INDEX "Report_generatedAt_idx" ON "Report"("generatedAt");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItemStandard" ADD CONSTRAINT "ChecklistItemStandard_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItemStandard" ADD CONSTRAINT "ChecklistItemStandard_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionResponse" ADD CONSTRAINT "InspectionResponse_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionResponse" ADD CONSTRAINT "InspectionResponse_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformity" ADD CONSTRAINT "NonConformity_inspectionResponseId_fkey" FOREIGN KEY ("inspectionResponseId") REFERENCES "InspectionResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_nonConformityId_fkey" FOREIGN KEY ("nonConformityId") REFERENCES "NonConformity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_nonConformityId_fkey" FOREIGN KEY ("nonConformityId") REFERENCES "NonConformity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
