import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import {
  ChecklistVersionStatus,
  InspectionSnapshotIntegrityStatus,
  InspectionSnapshotOrigin,
  InspectionStatus,
  NonConformityStatus,
  ResponseStatus,
  Severity,
  SyncStatus,
  UserRole,
} from "@/generated/prisma/client";
import {
  InspectionResponseRepository,
  InspectionStatePersistenceConflictError,
  type InspectionResponseWithRelations,
  type InspectionStatePersistenceDirective,
  type NonConformityPersistenceDirective,
} from "@/server/repositories/inspection-response.repository";
import {
  InspectionRepository,
  type InspectionWithRelations,
} from "@/server/repositories/inspection.repository";

import { InspectionResponseService } from "./inspection-response.service";

const INSPECTION_ID = "11111111-1111-4111-8111-111111111111";
const SNAPSHOT_ITEM_ID = "22222222-2222-4222-8222-222222222222";
const LEGACY_ITEM_ID = "33333333-3333-4333-8333-333333333333";
const VERSION_ID = "44444444-4444-4444-8444-444444444444";
const VERSION_ITEM_ID = "55555555-5555-4555-8555-555555555555";

class FakeInspectionResponseRepository extends InspectionResponseRepository {
  directive: NonConformityPersistenceDirective | null = null;
  inspectionState: InspectionStatePersistenceDirective | null = null;
  savedSnapshotItemId: string | null = null;
  failWithStateConflict = false;

  override saveWithNonConformity(
    inspectionId: string,
    snapshotItemId: string,
    data: Parameters<InspectionResponseRepository["saveWithNonConformity"]>[2],
    nonConformity: NonConformityPersistenceDirective,
    inspectionState: InspectionStatePersistenceDirective,
  ): Promise<InspectionResponseWithRelations> {
    this.directive = nonConformity;
    this.inspectionState = inspectionState;
    this.savedSnapshotItemId = snapshotItemId;

    if (this.failWithStateConflict) {
      return Promise.reject(new InspectionStatePersistenceConflictError());
    }

    const now = new Date("2026-08-03T12:00:00.000Z");

    return Promise.resolve({
      id: "66666666-6666-4666-8666-666666666666",
      inspectionId,
      checklistItemId: null,
      snapshotItemId,
      status: data.status as ResponseStatus,
      observation: data.observation ?? null,
      clientUpdatedAt: data.clientUpdatedAt ?? null,
      createdAt: now,
      updatedAt: now,
      checklistItem: null,
      snapshotItem: createInspection().snapshot?.items[0] ?? null,
      nonConformity: null,
    });
  }
}

class FakeInspectionRepository extends InspectionRepository {
  updatedStatus: InspectionStatus | null = null;

  constructor(private currentInspection: InspectionWithRelations) {
    super();
  }

  override findActiveById(): Promise<InspectionWithRelations | null> {
    return Promise.resolve(this.currentInspection);
  }

  override updateStatusIfCurrent(
    _id: string,
    _allowedStatuses: InspectionStatus[],
    status: InspectionStatus,
  ): Promise<InspectionWithRelations | null> {
    this.updatedStatus = status;
    this.currentInspection = {
      ...this.currentInspection,
      status,
    };

    return Promise.resolve(this.currentInspection);
  }
}

test("a non-compliant response uses the snapshot text for the NC directive", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  const service = new InspectionResponseService(
    responseRepository,
    new FakeInspectionRepository(createInspection()),
  );

  const result = await service.saveInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: ResponseStatus.NON_COMPLIANT,
  });

  assert.equal(result.success, true);
  assert.equal(responseRepository.savedSnapshotItemId, SNAPSHOT_ITEM_ID);
  assert.equal(responseRepository.directive?.action, "ensure");

  if (responseRepository.directive?.action !== "ensure") {
    assert.fail("Expected ensure directive.");
  }

  assert.equal(responseRepository.directive.description, "Pergunta histórica v1");
  assert.equal(responseRepository.directive.severity, Severity.MEDIUM);
  assert.equal(responseRepository.directive.status, NonConformityStatus.OPEN);
});

test("a legacy checklist item identifier is mapped to its inspection snapshot item", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  const service = new InspectionResponseService(
    responseRepository,
    new FakeInspectionRepository(createInspection()),
  );

  const result = await service.saveInspectionResponse({
    inspectionId: INSPECTION_ID,
    checklistItemId: LEGACY_ITEM_ID,
    status: ResponseStatus.COMPLIANT,
  });

  assert.equal(result.success, true);
  assert.equal(responseRepository.savedSnapshotItemId, SNAPSHOT_ITEM_ID);
});

test("an item outside the inspection snapshot is rejected", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  const service = new InspectionResponseService(
    responseRepository,
    new FakeInspectionRepository(createInspection()),
  );

  const result = await service.saveInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: "99999999-9999-4999-8999-999999999999",
    status: ResponseStatus.COMPLIANT,
  });

  assert.equal(result.success, false);
  assert.equal(responseRepository.savedSnapshotItemId, null);
});

test("finishing is rejected while a required snapshot item is unanswered", async () => {
  const inspectionRepository = new FakeInspectionRepository(
    createInspection(InspectionStatus.IN_PROGRESS),
  );
  const service = new InspectionResponseService(
    new FakeInspectionResponseRepository(),
    inspectionRepository,
  );

  const result = await service.finishInspection(INSPECTION_ID);

  assert.equal(result.success, false);
  assert.equal(inspectionRepository.updatedStatus, null);
});

test("finishing uses answered snapshot item IDs", async () => {
  const inspectionRepository = new FakeInspectionRepository(
    createInspection(InspectionStatus.IN_PROGRESS, true),
  );
  const service = new InspectionResponseService(
    new FakeInspectionResponseRepository(),
    inspectionRepository,
  );

  const result = await service.finishInspection(INSPECTION_ID);

  assert.equal(result.success, true);
  assert.equal(inspectionRepository.updatedStatus, InspectionStatus.COMPLETED);
});

test("a completed inspection cannot receive new responses", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  const service = new InspectionResponseService(
    responseRepository,
    new FakeInspectionRepository(createInspection(InspectionStatus.COMPLETED)),
  );

  const result = await service.saveInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: ResponseStatus.COMPLIANT,
  });

  assert.equal(result.success, false);
  assert.equal(responseRepository.directive, null);
});

test("a concurrent completion conflict is returned without accepting a response", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  responseRepository.failWithStateConflict = true;
  const service = new InspectionResponseService(
    responseRepository,
    new FakeInspectionRepository(createInspection(InspectionStatus.IN_PROGRESS)),
  );

  const result = await service.saveInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: ResponseStatus.COMPLIANT,
  });

  assert.equal(result.success, false);
});

function createInspection(
  status: InspectionStatus = InspectionStatus.PLANNED,
  answered = false,
): InspectionWithRelations {
  const now = new Date("2026-08-03T12:00:00.000Z");
  const userId = "77777777-7777-4777-8777-777777777777";
  const companyId = "88888888-8888-4888-8888-888888888888";
  const checklistId = "99999999-9999-4999-8999-999999999998";
  const snapshotItem = {
    id: SNAPSHOT_ITEM_ID,
    snapshotId: INSPECTION_ID,
    sourceVersionItemId: VERSION_ITEM_ID,
    sourceChecklistItemId: LEGACY_ITEM_ID,
    description: "Pergunta histórica v1",
    orderIndex: 1,
    isRequired: true,
    standards: [],
  };

  return {
    id: INSPECTION_ID,
    userId,
    companyId,
    checklistId,
    checklistVersionId: VERSION_ID,
    inspectionDate: now,
    status,
    syncStatus: SyncStatus.SYNCED,
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    user: {
      id: userId,
      name: "Inspetora",
      email: "inspetora@example.com",
      role: UserRole.TECHNICIAN,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    company: {
      id: companyId,
      corporateName: "Empresa Teste",
      tradeName: null,
      cnpj: null,
      cnae: "0000-0/00",
      riskLevel: 1,
      employeeCount: 1,
      address: null,
      notes: null,
      createdById: userId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    checklist: {
      id: checklistId,
      title: "Catálogo mutável",
      description: null,
      isTemplate: false,
      isActive: true,
      createdById: userId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    checklistVersion: {
      id: VERSION_ID,
      checklistId,
      versionNumber: 1,
      status: ChecklistVersionStatus.PUBLISHED,
      title: "Versão publicada",
      description: null,
      contentSchemaVersion: 1,
      contentHash: "a".repeat(64),
      createdById: userId,
      publishedById: userId,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    snapshot: {
      id: INSPECTION_ID,
      inspectionId: INSPECTION_ID,
      sourceChecklistId: checklistId,
      sourceChecklistVersionId: VERSION_ID,
      sourceVersionNumber: 1,
      title: "Versão publicada",
      description: null,
      isTemplate: false,
      snapshotSchemaVersion: 1,
      contentHash: "a".repeat(64),
      origin: InspectionSnapshotOrigin.INSPECTION_CREATION,
      integrityStatus: InspectionSnapshotIntegrityStatus.VERIFIED,
      capturedAt: now,
      items: [snapshotItem],
    },
    responses: answered
      ? [
          {
            id: "99999999-9999-4999-8999-999999999997",
            inspectionId: INSPECTION_ID,
            checklistItemId: null,
            snapshotItemId: SNAPSHOT_ITEM_ID,
            status: ResponseStatus.COMPLIANT,
            observation: null,
            clientUpdatedAt: null,
            createdAt: now,
            updatedAt: now,
            checklistItem: null,
            snapshotItem,
            nonConformity: null,
          },
        ]
      : [],
  };
}
