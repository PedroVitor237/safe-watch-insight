import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import {
  ChecklistVersionStatus,
  InspectionStatus,
  ResponseStatus,
} from "@/generated/prisma/client";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import { ChecklistVersionItemRepository } from "@/server/repositories/checklist-version-item.repository";
import { ChecklistVersionRepository } from "@/server/repositories/checklist-version.repository";
import { CompanyRepository } from "@/server/repositories/company.repository";
import { CorrectiveActionRepository } from "@/server/repositories/corrective-action.repository";
import { InspectionRepository } from "@/server/repositories/inspection.repository";
import { InspectionResponseRepository } from "@/server/repositories/inspection-response.repository";
import { NonConformityRepository } from "@/server/repositories/non-conformity.repository";

import { ChecklistService } from "./checklist.service";
import { ChecklistItemService } from "./checklist-item.service";
import { ChecklistVersionService } from "./checklist-version.service";
import { CompanyService } from "./company.service";
import { CorrectiveActionService } from "./corrective-action.service";
import { InspectionResponseService } from "./inspection-response.service";
import { InspectionService } from "./inspection.service";
import { NonConformityService } from "./non-conformity.service";

const owner = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const id = "33333333-3333-4333-8333-333333333333";
const now = new Date("2026-09-27T12:00:00.000Z");

function unavailable(result: { success: boolean; code?: string }): void {
  assert.equal(result.success, false);
  assert.equal(result.code, "NOT_FOUND");
}

test("company list, detail and mutations use the authenticated owner", async () => {
  const calls: string[] = [];
  const company = { id, createdById: owner, deletedAt: null };
  const repository = {
    findActiveOwnedById: async (_id: string, userId: string) => (userId === owner ? company : null),
    findManyPaginated: async (filters: { createdById: string }) => {
      calls.push(`list:${filters.createdById}`);
      return {
        items: filters.createdById === owner ? [company] : [],
        totalItems: filters.createdById === owner ? 1 : 0,
      };
    },
    updateOwned: async (_id: string, userId: string) => {
      calls.push(`update:${userId}`);
      return company;
    },
    softDeleteOwned: async (_id: string, userId: string) => {
      calls.push(`delete:${userId}`);
      return company;
    },
  } as unknown as CompanyRepository;
  const service = new CompanyService(repository);

  assert.equal((await service.listCompanies({}, owner)).success, true);
  const foreignList = await service.listCompanies({}, other);
  assert.equal(foreignList.success && foreignList.data.items.length, 0);
  unavailable(await service.getCompanyById(id, other));
  unavailable(await service.updateCompany(id, { corporateName: "Changed" }, other));
  unavailable(await service.deleteCompany(id, other));
  assert.equal((await service.getCompanyById(id, owner)).success, true);
  assert.equal(
    (await service.updateCompany(id, { corporateName: "Changed" }, owner)).success,
    true,
  );
  assert.equal((await service.deleteCompany(id, owner)).success, true);
  assert.deepEqual(calls, [`list:${owner}`, `list:${other}`, `update:${owner}`, `delete:${owner}`]);
});

test("published checklist is visible to another user but its draft and mutations remain private", async () => {
  const published = {
    id,
    status: ChecklistVersionStatus.PUBLISHED,
    title: "Published",
    description: null,
    items: [],
  };
  const draft = {
    id: other,
    status: ChecklistVersionStatus.DRAFT,
    title: "Private draft",
    description: null,
    items: [],
  };
  const checklist = {
    id,
    createdById: owner,
    title: "Private draft",
    description: null,
    isActive: true,
    versions: [draft, published],
  };
  const calls: string[] = [];
  const repository = {
    findActiveOwnedById: async (_id: string, userId: string) =>
      userId === owner ? checklist : null,
    findActiveById: async () => checklist,
    findVisibleById: async () => checklist,
    findManyPaginated: async (filters: { visibleToUserId: string }) => {
      calls.push(`list:${filters.visibleToUserId}`);
      return { items: [checklist], totalItems: 1 };
    },
    softDeleteOwned: async (_id: string, userId: string) => {
      calls.push(`delete:${userId}`);
      return checklist;
    },
    updateOwnedWithItems: async (_id: string, userId: string) => {
      calls.push(`update:${userId}`);
      return checklist;
    },
  } as unknown as ChecklistRepository;
  const versions = {
    listByChecklistId: async () => [draft, published],
    findDraftByChecklistId: async () => draft,
    publishDraft: async (_id: string, _input: unknown, userId: string) => {
      calls.push(`publish:${userId}`);
      return published;
    },
  } as unknown as ChecklistVersionRepository;
  const versionService = new ChecklistVersionService(versions, repository);
  const service = new ChecklistService(repository, versionService);

  const shared = await service.getChecklistById(id, other);
  assert.equal(shared.success && shared.data.title, "Published");
  assert.deepEqual(shared.success && shared.data.versions.map((version) => version.status), [
    ChecklistVersionStatus.PUBLISHED,
  ]);
  const listed = await service.listChecklists({}, other);
  assert.equal(listed.success && listed.data.items[0].title, "Published");
  unavailable(await service.updateChecklist(id, { isActive: false }, other));
  unavailable(await service.deleteChecklist(id, other));
  unavailable(await versionService.publishDraft(id, other));
  assert.equal((await versionService.listVersions(id, other)).success, true);
  assert.equal((await versionService.publishDraft(id, owner)).success, true);
  assert.equal((await service.updateChecklist(id, { isActive: false }, owner)).success, true);
  assert.equal((await service.deleteChecklist(id, owner)).success, true);
  assert.deepEqual(calls, [
    `list:${other}`,
    `publish:${owner}`,
    `update:${owner}`,
    `delete:${owner}`,
  ]);
});

test("checklist item creation, update and deletion inherit the parent owner", async () => {
  const calls: string[] = [];
  const checklist = { id, createdById: owner };
  const draft = { id, checklistId: id, status: ChecklistVersionStatus.DRAFT };
  const item = { id, checklistVersionId: id, checklistVersion: draft };
  const checklistRepository = {
    findActiveOwnedById: async (_id: string, userId: string) =>
      userId === owner ? checklist : null,
  } as unknown as ChecklistRepository;
  const itemRepository = {
    findWithVersionById: async () => item,
    getNextOrderIndex: async () => 1,
    createInDraft: async (input: { userId: string }) => {
      calls.push(`create:${input.userId}`);
      return item;
    },
    updateInDraft: async (_id: string, _versionId: string, userId: string) => {
      calls.push(`update:${userId}`);
      return item;
    },
    deleteFromDraft: async (_id: string, _versionId: string, userId: string) => {
      calls.push(`delete:${userId}`);
    },
  } as unknown as ChecklistVersionItemRepository;
  const versionService = {
    getOrCreateDraft: async () => draft,
  } as unknown as ChecklistVersionService;
  const service = new ChecklistItemService(
    itemRepository,
    checklistRepository,
    {} as ChecklistVersionRepository,
    versionService,
  );

  unavailable(
    await service.createChecklistItem({ checklistId: id, description: "Item", updatedById: other }),
  );
  unavailable(
    await service.updateChecklistItem(id, { description: "Changed", updatedById: other }),
  );
  unavailable(await service.deleteChecklistItem(id, other));
  assert.equal(
    (
      await service.createChecklistItem({
        checklistId: id,
        description: "Item",
        updatedById: owner,
      })
    ).success,
    true,
  );
  assert.equal(
    (await service.updateChecklistItem(id, { description: "Changed", updatedById: owner })).success,
    true,
  );
  assert.equal((await service.deleteChecklistItem(id, owner)).success, true);
  assert.deepEqual(calls, [`create:${owner}`, `update:${owner}`, `delete:${owner}`]);
});

test("inspection detail, list, deletion, responses and completion require Inspection.userId", async () => {
  const inspection = {
    id,
    userId: owner,
    deletedAt: null,
    status: InspectionStatus.PLANNED,
    snapshot: { items: [] },
    responses: [],
    checklistVersion: { id },
  };
  const calls: string[] = [];
  const repository = {
    findActiveOwnedById: async (_id: string, userId: string) =>
      userId === owner ? inspection : null,
    findManyPaginated: async (filters: { userId: string }) => {
      calls.push(`list:${filters.userId}`);
      return {
        items: filters.userId === owner ? [inspection] : [],
        totalItems: filters.userId === owner ? 1 : 0,
      };
    },
    softDeleteOwned: async (_id: string, userId: string) => {
      calls.push(`delete:${userId}`);
      return inspection;
    },
    updateStatusIfCurrent: async (
      _id: string,
      _statuses: unknown,
      _status: unknown,
      userId: string,
    ) => {
      calls.push(`finish:${userId}`);
      return inspection;
    },
  } as unknown as InspectionRepository;
  const responseRepository = {
    findByInspectionId: async () => [],
  } as unknown as InspectionResponseRepository;
  const service = new InspectionService(repository);
  const responses = new InspectionResponseService(responseRepository, repository);

  assert.equal((await service.listInspections({}, other)).success, true);
  unavailable(await service.getInspectionById(id, other));
  unavailable(await service.deleteInspection(id, other));
  unavailable(await responses.listInspectionResponses(id, other));
  unavailable(
    await responses.saveInspectionResponse({
      userId: other,
      inspectionId: id,
      snapshotItemId: id,
      status: ResponseStatus.COMPLIANT,
    }),
  );
  unavailable(await responses.finishInspection(id, other));
  assert.equal((await service.getInspectionById(id, owner)).success, true);
  assert.equal((await responses.listInspectionResponses(id, owner)).success, true);
  assert.equal((await responses.finishInspection(id, owner)).success, true);
  assert.equal((await service.deleteInspection(id, owner)).success, true);
  assert.deepEqual(calls, [`list:${other}`, `finish:${owner}`, `delete:${owner}`]);
});

test("nonconformities and corrective actions follow the owning inspection", async () => {
  const nonConformity = { id, inspectionResponseId: id, status: "OPEN", deletedAt: null };
  const action = { id, nonConformityId: id, deletedAt: null };
  const calls: string[] = [];
  const ncRepository = {
    findActiveOwnedById: async (_id: string, userId: string) =>
      userId === owner ? nonConformity : null,
    findManyOwnedPaginated: async (_filters: unknown, userId: string) => ({
      items: userId === owner ? [nonConformity] : [],
      totalItems: userId === owner ? 1 : 0,
    }),
    markOverdue: async () => 0,
    findByInspectionResponseId: async () => null,
    createWithRelations: async (_data: unknown, userId: string) => {
      calls.push(`nc-create:${userId}`);
      return nonConformity;
    },
    updateWithRelations: async (_id: string, _data: unknown, userId: string) => {
      calls.push(`nc-update:${userId}`);
      return nonConformity;
    },
    softDelete: async (_id: string, userId: string) => {
      calls.push(`nc-delete:${userId}`);
      return nonConformity;
    },
  } as unknown as NonConformityRepository;
  const responseRepository = {
    findOwnedById: async (_id: string, userId: string) =>
      userId === owner ? { id, status: ResponseStatus.NON_COMPLIANT } : null,
  } as unknown as InspectionResponseRepository;
  const actionRepository = {
    markOverdue: async () => 0,
    createWithNonConformityTransition: async (
      _data: unknown,
      _transition: unknown,
      userId: string,
    ) => {
      calls.push(`action-create:${userId}`);
      return action;
    },
    findActiveOwnedById: async (_id: string, userId: string) => (userId === owner ? action : null),
    findByNonConformityId: async () => [action],
    updateOwned: async (_id: string, userId: string) => {
      calls.push(`action-update:${userId}`);
      return action;
    },
    softDeleteOwned: async (_id: string, userId: string) => {
      calls.push(`action-delete:${userId}`);
      return action;
    },
  } as unknown as CorrectiveActionRepository;
  const nc = new NonConformityService(ncRepository, responseRepository);
  const actions = new CorrectiveActionService(actionRepository, ncRepository);

  unavailable(await nc.getNonConformityById(id, other));
  unavailable(
    await nc.createNonConformity(
      { inspectionResponseId: id, description: "NC", severity: "MEDIUM" },
      other,
    ),
  );
  unavailable(await nc.updateNonConformity(id, { description: "Changed" }, other));
  unavailable(await nc.deleteNonConformity(id, other));
  unavailable(
    await actions.createCorrectiveAction({ nonConformityId: id, description: "Fix" }, other),
  );
  unavailable(await actions.listCorrectiveActions(id, other));
  unavailable(await actions.updateCorrectiveAction(id, { description: "Changed" }, other));
  unavailable(await actions.deleteCorrectiveAction(id, other));
  assert.equal((await nc.listNonConformities({}, other)).success, true);
  assert.equal((await nc.getNonConformityById(id, owner)).success, true);
  assert.equal(
    (
      await nc.createNonConformity(
        { inspectionResponseId: id, description: "NC", severity: "MEDIUM" },
        owner,
      )
    ).success,
    true,
  );
  assert.equal((await nc.updateNonConformity(id, { description: "Changed" }, owner)).success, true);
  assert.equal((await actions.listCorrectiveActions(id, owner)).success, true);
  assert.equal(
    (await actions.createCorrectiveAction({ nonConformityId: id, description: "Fix" }, owner))
      .success,
    true,
  );
  assert.equal(
    (await actions.updateCorrectiveAction(id, { description: "Changed" }, owner)).success,
    true,
  );
  assert.deepEqual(calls, [
    `nc-create:${owner}`,
    `nc-update:${owner}`,
    `action-create:${owner}`,
    `action-update:${owner}`,
  ]);
});
