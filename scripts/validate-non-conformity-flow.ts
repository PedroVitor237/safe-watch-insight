import "dotenv/config";

import { randomUUID } from "node:crypto";

import {
  CorrectiveActionStatus,
  InspectionStatus,
  ResponseStatus,
  Severity,
} from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import type { Result } from "@/server/responses";
import { checklistItemService } from "@/server/services/checklist-item.service";
import { checklistService } from "@/server/services/checklist.service";
import { checklistVersionService } from "@/server/services/checklist-version.service";
import { companyService } from "@/server/services/company.service";
import { correctiveActionService } from "@/server/services/corrective-action.service";
import { inspectionResponseService } from "@/server/services/inspection-response.service";
import { inspectionService } from "@/server/services/inspection.service";
import { nonConformityService } from "@/server/services/non-conformity.service";
import { standardService } from "@/server/services/standard.service";
import { userService } from "@/server/services/user.service";

interface CreatedIds {
  companyId?: string;
  checklistId?: string;
  checklistItemId?: string;
  checklistVersionId?: string;
  snapshotItemId?: string;
  inspectionId?: string;
  inspectionResponseId?: string;
  nonConformityId?: string;
  correctiveActionId?: string;
}

const createdIds: CreatedIds = {};

async function main(): Promise<void> {
  const authenticatedUser = unwrap(await userService.authenticate("admin@demo.com", "Admin@123"));
  const standards = unwrap(
    await standardService.listStandards({
      page: 1,
      pageSize: 100,
      type: "NR",
      isActive: true,
    }),
  );
  const standard = standards.items.find((item) => item.code === "NR-6");

  if (!standard) {
    throw new Error("NR-6 was not found after the seed.");
  }

  const uniqueSuffix = Date.now().toString().slice(-10);
  const company = unwrap(
    await companyService.createCompany({
      corporateName: `Validação NC ${uniqueSuffix} Ltda.`,
      tradeName: "Validação NC",
      cnpj: uniqueSuffix.padStart(14, "8"),
      cnae: "0000-0/00",
      riskLevel: 2,
      employeeCount: 10,
      address: "Ambiente automatizado",
      notes: "Registro temporário da validação integrada.",
      createdById: authenticatedUser.id,
    }),
  );
  createdIds.companyId = company.id;

  unwrap(
    await companyService.updateCompany(company.id, {
      employeeCount: 11,
    }),
  );

  const checklist = unwrap(
    await checklistService.createChecklist({
      title: `Checklist de validação ${uniqueSuffix}`,
      description: "Registro temporário da validação integrada.",
      isTemplate: false,
      isActive: true,
      createdById: authenticatedUser.id,
    }),
  );
  createdIds.checklistId = checklist.id;

  unwrap(
    await checklistService.updateChecklist(
      checklist.id,
      {
        description: "Checklist atualizado durante a validação integrada.",
      },
      authenticatedUser.id,
    ),
  );

  const checklistItem = unwrap(
    await checklistItemService.createChecklistItem({
      checklistId: checklist.id,
      description: "Verificar entrega e utilização adequada de EPI.",
      isRequired: true,
      standardIds: [standard.id],
      updatedById: authenticatedUser.id,
    }),
  );
  createdIds.checklistItemId = checklistItem.id;

  const checklistVersion = unwrap(
    await checklistVersionService.publishDraft(checklist.id, authenticatedUser.id),
  );
  createdIds.checklistVersionId = checklistVersion.id;

  const inspection = unwrap(
    await inspectionService.createInspection({
      userId: authenticatedUser.id,
      companyId: company.id,
      checklistId: checklist.id,
      checklistVersionId: checklistVersion.id,
      inspectionDate: new Date(),
      notes: "Inspeção temporária da validação integrada.",
    }),
  );
  createdIds.inspectionId = inspection.id;

  const snapshotItem = inspection.snapshot?.items[0];

  if (!snapshotItem) {
    throw new Error("The inspection snapshot item was not created.");
  }
  createdIds.snapshotItemId = snapshotItem.id;

  const response = unwrap(
    await inspectionResponseService.saveInspectionResponse({
      inspectionId: inspection.id,
      snapshotItemId: snapshotItem.id,
      status: ResponseStatus.NON_COMPLIANT,
      observation: "EPI obrigatório não disponibilizado.",
    }),
  );
  createdIds.inspectionResponseId = response.id;

  if (!response.nonConformity) {
    throw new Error("The non-compliant response did not create a non-conformity.");
  }
  createdIds.nonConformityId = response.nonConformity.id;

  const nonConformities = unwrap(
    await nonConformityService.listNonConformities({
      inspectionId: inspection.id,
    }),
  );

  if (nonConformities.totalItems !== 1) {
    throw new Error("The inspection should have exactly one non-conformity.");
  }

  unwrap(
    await nonConformityService.updateNonConformity(response.nonConformity.id, {
      severity: Severity.HIGH,
    }),
  );

  const correctiveAction = unwrap(
    await correctiveActionService.createCorrectiveAction({
      nonConformityId: response.nonConformity.id,
      description: "Disponibilizar o EPI e registrar a entrega.",
      why: "Eliminar a exposição sem proteção adequada.",
      location: "Área operacional",
      responsible: "SESMT",
      dueDate: new Date(Date.now() + 86_400_000),
      method: "Comprar, entregar e registrar o recebimento do EPI.",
      estimatedCost: "R$ 500,00",
    }),
  );
  createdIds.correctiveActionId = correctiveAction.id;

  if (
    correctiveAction.why !== "Eliminar a exposição sem proteção adequada." ||
    correctiveAction.location !== "Área operacional" ||
    correctiveAction.method !== "Comprar, entregar e registrar o recebimento do EPI." ||
    correctiveAction.estimatedCost !== "R$ 500,00"
  ) {
    throw new Error("The 5W2H fields were not persisted correctly.");
  }

  unwrap(
    await correctiveActionService.updateCorrectiveAction(correctiveAction.id, {
      status: CorrectiveActionStatus.COMPLETED,
    }),
  );

  const completedInspection = unwrap(
    await inspectionResponseService.finishInspection(inspection.id),
  );

  if (completedInspection.status !== InspectionStatus.COMPLETED) {
    throw new Error("The inspection was not completed.");
  }

  unwrap(await inspectionService.deleteInspection(inspection.id));
  unwrap(await checklistService.deleteChecklist(checklist.id));
  unwrap(await companyService.deleteCompany(company.id));

  const duplicateDeletedCompany = await companyService.createCompany({
    corporateName: `Validação NC duplicada ${uniqueSuffix} Ltda.`,
    tradeName: "Validação NC duplicada",
    cnpj: uniqueSuffix.padStart(14, "8"),
    cnae: "0000-0/00",
    riskLevel: 2,
    employeeCount: 10,
    createdById: authenticatedUser.id,
  });

  if (duplicateDeletedCompany.success || duplicateDeletedCompany.code !== "CONFLICT") {
    throw new Error("A soft-deleted company's CNPJ should remain reserved.");
  }

  console.log(
    JSON.stringify({
      authenticated: true,
      standards: standards.totalItems,
      companyCrud: true,
      checklistCrud: true,
      checklistVersionPublished: true,
      inspectionSnapshotCreated: true,
      standardAssociation: checklistItem.standards.length === 1,
      inspectionCompleted: true,
      automaticNonConformity: true,
      plan5w2h: true,
      correctiveActionCompleted: true,
      softDeleteValidated: true,
      deletedCompanyCnpjReserved: true,
    }),
  );
}

function unwrap<TData>(result: Result<TData>): TData {
  if (!result.success) {
    throw new Error(`${result.code}: ${result.message}`);
  }

  return result.data;
}

async function cleanup(): Promise<void> {
  if (createdIds.correctiveActionId) {
    await prisma.correctiveAction.deleteMany({
      where: { id: createdIds.correctiveActionId },
    });
  }

  if (createdIds.nonConformityId) {
    await prisma.evidence.deleteMany({
      where: { nonConformityId: createdIds.nonConformityId },
    });
    await prisma.nonConformity.deleteMany({
      where: { id: createdIds.nonConformityId },
    });
  }

  if (createdIds.inspectionResponseId) {
    await prisma.inspectionResponse.deleteMany({
      where: { id: createdIds.inspectionResponseId },
    });
  }

  if (createdIds.inspectionId) {
    await prisma.evidence.deleteMany({
      where: { inspectionId: createdIds.inspectionId },
    });
    await prisma.report.deleteMany({
      where: { inspectionId: createdIds.inspectionId },
    });
    const snapshot = await prisma.inspectionChecklistSnapshot.findUnique({
      where: { inspectionId: createdIds.inspectionId },
    });

    if (snapshot) {
      await prisma.inspectionSnapshotItemStandard.deleteMany({
        where: {
          snapshotItem: {
            snapshotId: snapshot.id,
          },
        },
      });
      await prisma.inspectionSnapshotItem.deleteMany({
        where: { snapshotId: snapshot.id },
      });
      await prisma.inspectionChecklistSnapshot.delete({
        where: { id: snapshot.id },
      });
    }
    await prisma.inspection.deleteMany({
      where: { id: createdIds.inspectionId },
    });
  }

  if (createdIds.checklistId) {
    await prisma.checklistVersionItemStandard.deleteMany({
      where: {
        checklistVersionItem: {
          checklistVersion: {
            checklistId: createdIds.checklistId,
          },
        },
      },
    });
    await prisma.checklistVersionItem.deleteMany({
      where: {
        checklistVersion: {
          checklistId: createdIds.checklistId,
        },
      },
    });
    await prisma.checklistVersion.deleteMany({
      where: { checklistId: createdIds.checklistId },
    });
    await prisma.checklist.deleteMany({
      where: { id: createdIds.checklistId },
    });
  }

  if (createdIds.companyId) {
    await prisma.company.deleteMany({
      where: { id: createdIds.companyId },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });
