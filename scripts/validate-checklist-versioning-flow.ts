import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import {
  InspectionSnapshotIntegrityStatus,
  InspectionSnapshotOrigin,
  InspectionStatus,
  ResponseStatus,
  SyncStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import type { ChecklistVersionWithItems } from "@/server/repositories/checklist-version.repository";
import { InspectionRepository } from "@/server/repositories/inspection.repository";
import type { Result } from "@/server/responses";
import { checklistItemService } from "@/server/services/checklist-item.service";
import { checklistService } from "@/server/services/checklist.service";
import { checklistVersionService } from "@/server/services/checklist-version.service";
import { inspectionResponseService } from "@/server/services/inspection-response.service";
import { inspectionService } from "@/server/services/inspection.service";
import { nonConformityService } from "@/server/services/non-conformity.service";
import { standardService } from "@/server/services/standard.service";
import { userService } from "@/server/services/user.service";

const createdInspectionIds: string[] = [];
let createdChecklistId: string | null = null;
let rollbackInspectionId: string | null = null;

async function main(): Promise<void> {
  await verifyLegacyBackfill();

  const user = unwrap(await userService.authenticate("admin@demo.com", "Admin@123"));
  const company = await prisma.company.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  if (!company) {
    throw new Error("An active company is required for checklist versioning validation.");
  }

  const standards = unwrap(
    await standardService.listStandards({
      page: 1,
      pageSize: 100,
      type: "NR",
      isActive: true,
    }),
  );
  const nr10 = standards.items.find((standard) => standard.code === "NR-10");
  const nr12 = standards.items.find((standard) => standard.code === "NR-12");

  if (!nr10 || !nr12) {
    throw new Error("NR-10 and NR-12 are required for checklist versioning validation.");
  }

  const suffix = Date.now().toString();
  const checklist = unwrap(
    await checklistService.createChecklist({
      title: `Validação histórica ${suffix}`,
      description: "Conteúdo original v1",
      isTemplate: false,
      isActive: true,
      createdById: user.id,
    }),
  );
  createdChecklistId = checklist.id;

  const itemA = unwrap(
    await checklistItemService.createChecklistItem({
      checklistId: checklist.id,
      description: "Item A original",
      isRequired: true,
      standardIds: [nr10.id],
      updatedById: user.id,
    }),
  );
  const itemB = unwrap(
    await checklistItemService.createChecklistItem({
      checklistId: checklist.id,
      description: "Item B original",
      isRequired: true,
      updatedById: user.id,
    }),
  );
  const itemC = unwrap(
    await checklistItemService.createChecklistItem({
      checklistId: checklist.id,
      description: "Item C original",
      isRequired: true,
      updatedById: user.id,
    }),
  );
  const version1 = unwrap(await checklistVersionService.publishDraft(checklist.id, user.id));

  const inspection1 = unwrap(
    await inspectionService.createInspection({
      userId: user.id,
      companyId: company.id,
      checklistId: checklist.id,
      checklistVersionId: version1.id,
      inspectionDate: new Date(),
      notes: "Inspeção criada com v1.",
    }),
  );
  createdInspectionIds.push(inspection1.id);

  assert.equal(inspection1.snapshot?.sourceVersionNumber, 1);
  assert.equal(inspection1.snapshot?.integrityStatus, InspectionSnapshotIntegrityStatus.VERIFIED);
  assert.deepEqual(
    inspection1.snapshot?.items.map((item) => item.description),
    ["Item A original", "Item B original", "Item C original"],
  );

  unwrap(
    await checklistService.updateChecklist(
      checklist.id,
      {
        title: `Validação histórica atualizada ${suffix}`,
        description: "Conteúdo alterado v2",
      },
      user.id,
    ),
  );
  unwrap(
    await checklistItemService.updateChecklistItem(itemA.id, {
      description: "Item A atualizado",
      standardIds: [nr12.id],
      updatedById: user.id,
    }),
  );

  const draftItems = unwrap(await checklistItemService.listChecklistItems(checklist.id));
  const draftItemB = draftItems.find((item) => item.description === itemB.description);

  if (!draftItemB) {
    throw new Error("Item B was not cloned into v2 draft.");
  }

  unwrap(await checklistItemService.deleteChecklistItem(draftItemB.id, user.id));
  unwrap(
    await checklistItemService.createChecklistItem({
      checklistId: checklist.id,
      description: "Item D adicionado",
      isRequired: true,
      updatedById: user.id,
    }),
  );
  const version2 = unwrap(await checklistVersionService.publishDraft(checklist.id, user.id));

  assert.equal(version2.versionNumber, 2);

  const historicalInspection = unwrap(await inspectionService.getInspectionById(inspection1.id));
  const historicalItemA = historicalInspection.snapshot?.items.find(
    (item) => item.description === "Item A original",
  );

  assert.equal(historicalInspection.snapshot?.title, `Validação histórica ${suffix}`);
  assert.deepEqual(
    historicalInspection.snapshot?.items.map((item) => item.description),
    ["Item A original", "Item B original", "Item C original"],
  );
  assert.equal(historicalItemA?.standards[0]?.code, "NR-10");

  const inspection2 = unwrap(
    await inspectionService.createInspection({
      userId: user.id,
      companyId: company.id,
      checklistId: checklist.id,
      checklistVersionId: version2.id,
      inspectionDate: new Date(),
      notes: "Inspeção criada com v2.",
    }),
  );
  createdInspectionIds.push(inspection2.id);

  assert.equal(inspection2.snapshot?.sourceVersionNumber, 2);
  assert.deepEqual(
    inspection2.snapshot?.items.map((item) => item.description),
    ["Item A atualizado", "Item C original", "Item D adicionado"],
  );
  assert.equal(inspection2.snapshot?.items[0]?.standards[0]?.code, "NR-12");

  if (!historicalItemA || !historicalInspection.snapshot) {
    throw new Error("Historical snapshot item A was not found.");
  }

  const nonCompliantResponse = unwrap(
    await inspectionResponseService.saveInspectionResponse({
      inspectionId: inspection1.id,
      snapshotItemId: historicalItemA.id,
      status: ResponseStatus.NON_COMPLIANT,
      observation: "Falha histórica no item A.",
    }),
  );

  if (!nonCompliantResponse.nonConformity) {
    throw new Error("A non-conformity was not created from the historical response.");
  }

  const historicalNonConformity = unwrap(
    await nonConformityService.getNonConformityById(nonCompliantResponse.nonConformity.id),
  );
  assert.equal(
    historicalNonConformity.inspectionResponse.snapshotItem?.description,
    "Item A original",
  );
  assert.equal(
    historicalNonConformity.inspectionResponse.snapshotItem?.standards[0]?.code,
    "NR-10",
  );

  for (const snapshotItem of historicalInspection.snapshot.items) {
    if (snapshotItem.id === historicalItemA.id) {
      continue;
    }

    unwrap(
      await inspectionResponseService.saveInspectionResponse({
        inspectionId: inspection1.id,
        snapshotItemId: snapshotItem.id,
        status: ResponseStatus.COMPLIANT,
      }),
    );
  }

  const completed = unwrap(await inspectionResponseService.finishInspection(inspection1.id));
  assert.equal(completed.status, InspectionStatus.COMPLETED);

  const version2ItemA = version2.items.find((item) => item.description === "Item A atualizado");

  if (!version2ItemA) {
    throw new Error("Version 2 item A was not found.");
  }

  unwrap(
    await checklistItemService.updateChecklistItem(version2ItemA.id, {
      description: "Item A em rascunho futuro",
      updatedById: user.id,
    }),
  );

  const completedAfterDraftChange = unwrap(
    await inspectionService.getInspectionById(inspection1.id),
  );
  assert.equal(completedAfterDraftChange.snapshot?.items[0]?.description, "Item A original");

  await verifyInspectionTransactionRollback({
    userId: user.id,
    companyId: company.id,
    checklistId: checklist.id,
    version: version2,
  });

  console.log(
    JSON.stringify({
      legacyBackfillValidated: true,
      publishedVersions: [version1.versionNumber, version2.versionNumber],
      itemModificationIsolated: true,
      itemAdditionIsolated: true,
      itemRemovalIsolated: true,
      standardAssociationIsolated: true,
      multipleInspectionVersionsValidated: true,
      nonConformityContextValidated: true,
      completedInspectionRemainedStable: true,
      transactionRollbackValidated: true,
    }),
  );

  void itemC;
}

async function verifyLegacyBackfill(): Promise<void> {
  const legacySnapshots = await prisma.inspectionChecklistSnapshot.count({
    where: {
      origin: InspectionSnapshotOrigin.LEGACY_BACKFILL,
      integrityStatus: InspectionSnapshotIntegrityStatus.UNVERIFIED_LEGACY,
    },
  });
  const unmappedResponses = await prisma.inspectionResponse.count({
    where: { snapshotItemId: null },
  });
  const inspectionsWithoutSnapshot = await prisma.inspection.count({
    where: { snapshot: null },
  });

  assert.ok(legacySnapshots > 0);
  assert.equal(unmappedResponses, 0);
  assert.equal(inspectionsWithoutSnapshot, 0);
}

async function verifyInspectionTransactionRollback({
  userId,
  companyId,
  checklistId,
  version,
}: {
  userId: string;
  companyId: string;
  checklistId: string;
  version: ChecklistVersionWithItems;
}): Promise<void> {
  const repository = new InspectionRepository();
  const sourceItems = version.items.slice(0, 2);

  if (sourceItems.length < 2 || !version.contentHash) {
    throw new Error("Two published items are required for the rollback validation.");
  }

  rollbackInspectionId = randomUUID();

  await assert.rejects(
    repository.createWithSnapshot({
      id: rollbackInspectionId,
      userId,
      companyId,
      checklistId,
      checklistVersionId: version.id,
      inspectionDate: new Date(),
      status: InspectionStatus.PLANNED,
      syncStatus: SyncStatus.SYNCED,
      notes: "This transaction must roll back.",
      snapshot: {
        sourceVersionNumber: version.versionNumber,
        title: version.title,
        description: version.description,
        isTemplate: false,
        snapshotSchemaVersion: version.contentSchemaVersion,
        contentHash: version.contentHash,
        origin: InspectionSnapshotOrigin.INSPECTION_CREATION,
        integrityStatus: InspectionSnapshotIntegrityStatus.VERIFIED,
        capturedAt: new Date(),
        items: sourceItems.map((item) => ({
          sourceVersionItemId: item.id,
          sourceChecklistItemId: item.sourceChecklistItemId,
          description: item.description,
          orderIndex: 1,
          isRequired: item.isRequired,
          standards: item.standards.map((standard) => ({
            standardId: standard.standardId,
            type: standard.type,
            code: standard.code,
            title: standard.title,
            summary: standard.summary,
            officialUrl: standard.officialUrl,
          })),
        })),
      },
    }),
  );

  const inspectionCount = await prisma.inspection.count({ where: { id: rollbackInspectionId } });
  const snapshotCount = await prisma.inspectionChecklistSnapshot.count({
    where: { inspectionId: rollbackInspectionId },
  });

  assert.equal(inspectionCount, 0);
  assert.equal(snapshotCount, 0);
}

function unwrap<TData>(result: Result<TData>): TData {
  if (!result.success) {
    throw new Error(`${result.code}: ${result.message}`);
  }

  return result.data;
}

async function cleanup(): Promise<void> {
  if (rollbackInspectionId) {
    await prisma.inspection.deleteMany({ where: { id: rollbackInspectionId } });
  }

  if (createdInspectionIds.length > 0) {
    await prisma.correctiveAction.deleteMany({
      where: {
        nonConformity: {
          inspectionResponse: {
            inspectionId: { in: createdInspectionIds },
          },
        },
      },
    });
    await prisma.evidence.deleteMany({
      where: {
        OR: [
          { inspectionId: { in: createdInspectionIds } },
          {
            nonConformity: {
              inspectionResponse: {
                inspectionId: { in: createdInspectionIds },
              },
            },
          },
        ],
      },
    });
    await prisma.nonConformity.deleteMany({
      where: {
        inspectionResponse: {
          inspectionId: { in: createdInspectionIds },
        },
      },
    });
    await prisma.inspectionResponse.deleteMany({
      where: { inspectionId: { in: createdInspectionIds } },
    });
    await prisma.inspectionSnapshotItemStandard.deleteMany({
      where: {
        snapshotItem: {
          snapshot: {
            inspectionId: { in: createdInspectionIds },
          },
        },
      },
    });
    await prisma.inspectionSnapshotItem.deleteMany({
      where: {
        snapshot: {
          inspectionId: { in: createdInspectionIds },
        },
      },
    });
    await prisma.inspectionChecklistSnapshot.deleteMany({
      where: { inspectionId: { in: createdInspectionIds } },
    });
    await prisma.inspection.deleteMany({
      where: { id: { in: createdInspectionIds } },
    });
  }

  if (createdChecklistId) {
    const versions = await prisma.checklistVersion.findMany({
      where: { checklistId: createdChecklistId },
      orderBy: { versionNumber: "desc" },
    });

    for (const version of versions) {
      await prisma.checklistVersionItemStandard.deleteMany({
        where: {
          checklistVersionItem: {
            checklistVersionId: version.id,
          },
        },
      });
      await prisma.checklistVersionItem.deleteMany({
        where: { checklistVersionId: version.id },
      });
      await prisma.checklistVersion.delete({
        where: { id: version.id },
      });
    }

    await prisma.checklist.deleteMany({ where: { id: createdChecklistId } });
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
