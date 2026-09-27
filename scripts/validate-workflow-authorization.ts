import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import bcrypt from "bcrypt";

import { prisma } from "@/server/prisma/client";
import type { Result } from "@/server/responses";
import { checklistItemService } from "@/server/services/checklist-item.service";
import { checklistVersionService } from "@/server/services/checklist-version.service";
import { checklistService } from "@/server/services/checklist.service";
import { companyService } from "@/server/services/company.service";
import { correctiveActionService } from "@/server/services/corrective-action.service";
import { inspectionResponseService } from "@/server/services/inspection-response.service";
import { inspectionService } from "@/server/services/inspection.service";
import { nonConformityService } from "@/server/services/non-conformity.service";

const fixture = {
  users: [] as string[],
  companyIds: [] as string[],
  checklistId: "",
  inspectionIds: [] as string[],
};

function unwrap<T>(result: Result<T>): T {
  if (!result.success) throw new Error(`${result.code}: ${result.message}`);
  return result.data;
}

function unavailable(result: Result<unknown>): void {
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.code, "NOT_FOUND");
    assert.equal(result.statusCode, 404);
  }
}

async function main(): Promise<void> {
  const suffix = randomUUID();
  const password = await bcrypt.hash(randomUUID(), 4);
  const userA = await prisma.user.create({
    data: {
      name: "Authorization owner",
      email: `auth-owner-${suffix}@validation.invalid`,
      password,
      role: "TECHNICIAN",
    },
  });
  fixture.users.push(userA.id);
  const userB = await prisma.user.create({
    data: {
      name: "Authorization foreign user",
      email: `auth-foreign-${suffix}@validation.invalid`,
      password,
      role: "TECHNICIAN",
    },
  });
  fixture.users.push(userB.id);

  const company = unwrap(
    await companyService.createCompany({
      corporateName: `Authorization ${suffix}`,
      cnae: "0000-0/00",
      riskLevel: 1,
      employeeCount: 1,
      createdById: userA.id,
    }),
  );
  fixture.companyIds.push(company.id);
  assert.equal(
    unwrap(await companyService.listCompanies({}, userB.id)).items.some(
      (item) => item.id === company.id,
    ),
    false,
  );
  unavailable(await companyService.getCompanyById(company.id, userB.id));
  unavailable(
    await companyService.updateCompany(company.id, { corporateName: "Foreign" }, userB.id),
  );
  unavailable(await companyService.deleteCompany(company.id, userB.id));
  const companyB = unwrap(
    await companyService.createCompany({
      corporateName: `Authorization B ${suffix}`,
      cnae: "0000-0/00",
      riskLevel: 1,
      employeeCount: 1,
      createdById: userB.id,
    }),
  );
  fixture.companyIds.push(companyB.id);

  const checklist = unwrap(
    await checklistService.createChecklist({
      title: `Authorization ${suffix}`,
      createdById: userA.id,
    }),
  );
  fixture.checklistId = checklist.id;
  const item = unwrap(
    await checklistItemService.createChecklistItem({
      checklistId: checklist.id,
      description: "Safety item",
      updatedById: userA.id,
    }),
  );
  unavailable(await checklistService.getChecklistById(checklist.id, userB.id));
  unavailable(
    await checklistItemService.createChecklistItem({
      checklistId: checklist.id,
      description: "Foreign item",
      updatedById: userB.id,
    }),
  );
  unavailable(
    await checklistItemService.updateChecklistItem(item.id, {
      description: "Foreign",
      updatedById: userB.id,
    }),
  );
  unavailable(await checklistItemService.deleteChecklistItem(item.id, userB.id));
  unavailable(await checklistVersionService.publishDraft(checklist.id, userB.id));
  const version = unwrap(await checklistVersionService.publishDraft(checklist.id, userA.id));
  assert.equal(version.status, "PUBLISHED");
  assert.equal(
    unwrap(await checklistService.getChecklistById(checklist.id, userB.id)).versions.length,
    1,
  );
  assert.equal(
    unwrap(await checklistService.listChecklists({}, userB.id)).items.some(
      (entry) => entry.id === checklist.id,
    ),
    true,
  );
  unavailable(await checklistService.updateChecklist(checklist.id, { isActive: false }, userB.id));
  unavailable(await checklistService.deleteChecklist(checklist.id, userB.id));
  unavailable(await checklistVersionService.retireVersion(checklist.id, version.id, userB.id));

  unavailable(
    await inspectionService.createInspection({
      userId: userB.id,
      companyId: company.id,
      checklistId: checklist.id,
      checklistVersionId: version.id,
      inspectionDate: new Date(),
    }),
  );
  const inspection = unwrap(
    await inspectionService.createInspection({
      userId: userA.id,
      companyId: company.id,
      checklistId: checklist.id,
      checklistVersionId: version.id,
      inspectionDate: new Date(),
    }),
  );
  fixture.inspectionIds.push(inspection.id);
  const reusedInspection = unwrap(
    await inspectionService.createInspection({
      userId: userB.id,
      companyId: companyB.id,
      checklistId: checklist.id,
      checklistVersionId: version.id,
      inspectionDate: new Date(),
    }),
  );
  fixture.inspectionIds.push(reusedInspection.id);
  assert.equal(reusedInspection.snapshot?.title, version.title);
  const snapshotItem = inspection.snapshot?.items[0];
  if (!snapshotItem) throw new Error("Inspection snapshot item missing.");
  assert.equal(
    unwrap(await inspectionService.listInspections({}, userB.id)).items.some(
      (entry) => entry.id === inspection.id,
    ),
    false,
  );
  unavailable(await inspectionService.getInspectionById(inspection.id, userB.id));
  unavailable(await inspectionService.deleteInspection(inspection.id, userB.id));
  unavailable(await inspectionResponseService.listInspectionResponses(inspection.id, userB.id));
  unavailable(
    await inspectionResponseService.saveInspectionResponse({
      userId: userB.id,
      inspectionId: inspection.id,
      snapshotItemId: snapshotItem.id,
      status: "NON_COMPLIANT",
    }),
  );
  const foreignOperationId = randomUUID();
  unavailable(
    await inspectionResponseService.saveInspectionResponse({
      userId: userB.id,
      inspectionId: inspection.id,
      snapshotItemId: snapshotItem.id,
      status: "NON_COMPLIANT",
      offlineOperation: {
        id: foreignOperationId,
        userId: userB.id,
        clientCreatedAt: new Date(),
        expectedResponseUpdatedAt: null,
      },
    }),
  );
  assert.equal(await prisma.offlineSyncOperation.count({ where: { id: foreignOperationId } }), 0);
  unavailable(await inspectionResponseService.finishInspection(inspection.id, userB.id));
  unavailable(
    await inspectionResponseService.finishInspection(inspection.id, userB.id, {
      id: randomUUID(),
      userId: userB.id,
      clientCreatedAt: new Date(),
    }),
  );

  const response = unwrap(
    await inspectionResponseService.saveInspectionResponse({
      userId: userA.id,
      inspectionId: inspection.id,
      snapshotItemId: snapshotItem.id,
      status: "NON_COMPLIANT",
    }),
  );
  if (!response.nonConformity) throw new Error("Non-conformity missing.");
  const nc = response.nonConformity;
  unavailable(await nonConformityService.getNonConformityById(nc.id, userB.id));
  assert.equal(
    unwrap(await nonConformityService.listNonConformities({}, userB.id)).items.some(
      (entry) => entry.id === nc.id,
    ),
    false,
  );
  unavailable(
    await nonConformityService.createNonConformity(
      {
        inspectionResponseId: response.id,
        description: "Foreign NC",
        severity: "MEDIUM",
      },
      userB.id,
    ),
  );
  unavailable(
    await nonConformityService.updateNonConformity(nc.id, { description: "Foreign" }, userB.id),
  );
  unavailable(await nonConformityService.deleteNonConformity(nc.id, userB.id));
  unavailable(await correctiveActionService.listCorrectiveActions(nc.id, userB.id));
  unavailable(
    await correctiveActionService.createCorrectiveAction(
      { nonConformityId: nc.id, description: "Foreign" },
      userB.id,
    ),
  );
  const action = unwrap(
    await correctiveActionService.createCorrectiveAction(
      { nonConformityId: nc.id, description: "Owner fix" },
      userA.id,
    ),
  );
  unavailable(
    await correctiveActionService.updateCorrectiveAction(
      action.id,
      { description: "Foreign" },
      userB.id,
    ),
  );
  unavailable(await correctiveActionService.deleteCorrectiveAction(action.id, userB.id));
  assert.equal(
    unwrap(await correctiveActionService.listCorrectiveActions(nc.id, userA.id)).length,
    1,
  );
  assert.equal(
    unwrap(await inspectionResponseService.finishInspection(inspection.id, userA.id)).status,
    "COMPLETED",
  );

  console.log(
    JSON.stringify({
      validation: "workflow authorization",
      twoUsers: true,
      privateReadsBlocked: true,
      privateMutationsBlocked: true,
      publishedReuseAllowed: true,
      ownerWorkflowCompleted: true,
    }),
  );
}

async function cleanup(): Promise<void> {
  for (const inspectionId of fixture.inspectionIds) {
    await prisma.correctiveAction.deleteMany({
      where: { nonConformity: { inspectionResponse: { inspectionId } } },
    });
    await prisma.nonConformity.deleteMany({ where: { inspectionResponse: { inspectionId } } });
    await prisma.inspectionResponse.deleteMany({ where: { inspectionId } });
    await prisma.inspectionSnapshotItemStandard.deleteMany({
      where: { snapshotItem: { snapshot: { inspectionId } } },
    });
    await prisma.inspectionSnapshotItem.deleteMany({ where: { snapshot: { inspectionId } } });
    await prisma.inspectionChecklistSnapshot.deleteMany({ where: { inspectionId } });
    await prisma.inspection.deleteMany({ where: { id: inspectionId } });
  }
  if (fixture.checklistId) {
    const checklistId = fixture.checklistId;
    await prisma.checklistVersionItemStandard.deleteMany({
      where: { checklistVersionItem: { checklistVersion: { checklistId } } },
    });
    await prisma.checklistVersionItem.deleteMany({ where: { checklistVersion: { checklistId } } });
    await prisma.checklistVersion.deleteMany({ where: { checklistId } });
    await prisma.checklist.deleteMany({ where: { id: checklistId } });
  }
  if (fixture.companyIds.length)
    await prisma.company.deleteMany({ where: { id: { in: fixture.companyIds } } });
  if (fixture.users.length) await prisma.user.deleteMany({ where: { id: { in: fixture.users } } });
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Authorization validation failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });
