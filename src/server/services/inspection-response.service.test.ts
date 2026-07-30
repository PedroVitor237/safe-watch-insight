import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import {
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
const ITEM_ID = "22222222-2222-4222-8222-222222222222";

class FakeInspectionResponseRepository extends InspectionResponseRepository {
  directive: NonConformityPersistenceDirective | null = null;
  inspectionState: InspectionStatePersistenceDirective | null = null;
  failWithStateConflict = false;

  override saveWithNonConformity(
    inspectionId: string,
    checklistItemId: string,
    data: Parameters<InspectionResponseRepository["saveWithNonConformity"]>[2],
    nonConformity: NonConformityPersistenceDirective,
    inspectionState: InspectionStatePersistenceDirective,
  ): Promise<InspectionResponseWithRelations> {
    this.directive = nonConformity;
    this.inspectionState = inspectionState;

    if (this.failWithStateConflict) {
      return Promise.reject(new InspectionStatePersistenceConflictError());
    }

    return Promise.resolve({
      id: "33333333-3333-4333-8333-333333333333",
      inspectionId,
      checklistItemId,
      status: data.status as ResponseStatus,
      observation: data.observation ?? null,
      checklistItem: createInspection().checklist.items[0],
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

test("a non-compliant response creates a default non-conformity directive", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  const inspectionRepository = new FakeInspectionRepository(createInspection());
  const service = new InspectionResponseService(responseRepository, inspectionRepository);

  const result = await service.saveInspectionResponse({
    inspectionId: INSPECTION_ID,
    checklistItemId: ITEM_ID,
    status: ResponseStatus.NON_COMPLIANT,
    observation: "  Proteção removida  ",
  });

  assert.equal(result.success, true);
  assert.equal(responseRepository.directive?.action, "ensure");

  if (responseRepository.directive?.action !== "ensure") {
    assert.fail("Expected ensure directive.");
  }

  assert.equal(responseRepository.directive.description, "Proteção removida");
  assert.equal(responseRepository.directive.severity, Severity.MEDIUM);
  assert.equal(responseRepository.directive.status, NonConformityStatus.OPEN);
  assert.ok(responseRepository.directive.dueDate instanceof Date);
  assert.equal(responseRepository.inspectionState?.nextStatus, InspectionStatus.IN_PROGRESS);
  assert.equal(inspectionRepository.updatedStatus, null);
});

test("a compliant response archives an existing non-conformity", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  const inspectionRepository = new FakeInspectionRepository(
    createInspection(InspectionStatus.IN_PROGRESS),
  );
  const service = new InspectionResponseService(responseRepository, inspectionRepository);

  const result = await service.saveInspectionResponse({
    inspectionId: INSPECTION_ID,
    checklistItemId: ITEM_ID,
    status: ResponseStatus.COMPLIANT,
  });

  assert.equal(result.success, true);
  assert.equal(responseRepository.directive?.action, "archive");
  assert.equal(inspectionRepository.updatedStatus, null);
});

test("finishing is rejected while a required item is unanswered", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  const inspectionRepository = new FakeInspectionRepository(
    createInspection(InspectionStatus.IN_PROGRESS),
  );
  const service = new InspectionResponseService(responseRepository, inspectionRepository);

  const result = await service.finishInspection(INSPECTION_ID);

  assert.equal(result.success, false);

  if (result.success) {
    assert.fail("Expected a failed result.");
  }

  assert.equal(result.code, "CONFLICT");
  assert.equal(inspectionRepository.updatedStatus, null);
});

test("a completed inspection cannot receive new responses", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  const inspectionRepository = new FakeInspectionRepository(
    createInspection(InspectionStatus.COMPLETED),
  );
  const service = new InspectionResponseService(responseRepository, inspectionRepository);

  const result = await service.saveInspectionResponse({
    inspectionId: INSPECTION_ID,
    checklistItemId: ITEM_ID,
    status: ResponseStatus.COMPLIANT,
  });

  assert.equal(result.success, false);
  assert.equal(responseRepository.directive, null);
});

test("a concurrent completion conflict is returned without accepting a response", async () => {
  const responseRepository = new FakeInspectionResponseRepository();
  responseRepository.failWithStateConflict = true;
  const inspectionRepository = new FakeInspectionRepository(
    createInspection(InspectionStatus.IN_PROGRESS),
  );
  const service = new InspectionResponseService(responseRepository, inspectionRepository);

  const result = await service.saveInspectionResponse({
    inspectionId: INSPECTION_ID,
    checklistItemId: ITEM_ID,
    status: ResponseStatus.COMPLIANT,
  });

  assert.equal(result.success, false);

  if (result.success) {
    assert.fail("Expected a failed result.");
  }

  assert.equal(result.code, "CONFLICT");
});

function createInspection(
  status: InspectionStatus = InspectionStatus.PLANNED,
): InspectionWithRelations {
  const now = new Date("2026-07-25T12:00:00.000Z");

  return {
    id: INSPECTION_ID,
    userId: "44444444-4444-4444-8444-444444444444",
    companyId: "55555555-5555-4555-8555-555555555555",
    checklistId: "66666666-6666-4666-8666-666666666666",
    inspectionDate: now,
    status,
    syncStatus: SyncStatus.SYNCED,
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    user: {
      id: "44444444-4444-4444-8444-444444444444",
      name: "Inspetora",
      email: "inspetora@example.com",
      role: UserRole.TECHNICIAN,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    company: {
      id: "55555555-5555-4555-8555-555555555555",
      corporateName: "Empresa Teste",
      tradeName: null,
      cnpj: null,
      cnae: "0000-0/00",
      riskLevel: 1,
      employeeCount: 1,
      address: null,
      notes: null,
      createdById: "44444444-4444-4444-8444-444444444444",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    checklist: {
      id: "66666666-6666-4666-8666-666666666666",
      title: "Checklist teste",
      description: null,
      isTemplate: false,
      isActive: true,
      createdById: "44444444-4444-4444-8444-444444444444",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      items: [
        {
          id: ITEM_ID,
          checklistId: "66666666-6666-4666-8666-666666666666",
          description: "Verificar proteção da máquina.",
          orderIndex: 1,
          isRequired: true,
          standards: [],
        },
      ],
    },
    responses: [],
  };
}
