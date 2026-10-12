import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import {
  CorrectiveActionStatus,
  InspectionSnapshotIntegrityStatus,
  InspectionSnapshotOrigin,
  NonConformityStatus,
  ResponseStatus,
  Severity,
} from "@/generated/prisma/client";
import { fmtData } from "@/lib/format";
import {
  CorrectiveActionRepository,
  NonConformityStatePersistenceConflictError,
  type NonConformityStatusTransition,
} from "@/server/repositories/corrective-action.repository";
import {
  NonConformityRepository,
  type NonConformityWithRelations,
} from "@/server/repositories/non-conformity.repository";
import { InspectionResponseRepository } from "@/server/repositories/inspection-response.repository";
import {
  createCorrectiveActionSchema,
  updateCorrectiveActionInputSchema,
} from "@/server/schemas/corrective-action.schema";
import {
  createNonConformitySchema,
  updateNonConformityInputSchema,
} from "@/server/schemas/non-conformity.schema";

import { CorrectiveActionService } from "./corrective-action.service";
import { NonConformityService } from "./non-conformity.service";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const NON_CONFORMITY_ID = "11111111-1111-4111-8111-111111111111";

class FakeCorrectiveActionRepository extends CorrectiveActionRepository {
  transition: NonConformityStatusTransition | undefined;
  failWithStateConflict = false;
  dueDate: Date | null = null;
  updateData: Parameters<CorrectiveActionRepository["updateOwned"]>[2] | undefined;

  override createWithNonConformityTransition(
    data: Parameters<CorrectiveActionRepository["createWithNonConformityTransition"]>[0],
    transition?: NonConformityStatusTransition,
  ) {
    this.transition = transition;

    if (this.failWithStateConflict) {
      return Promise.reject(new NonConformityStatePersistenceConflictError());
    }

    assert.ok(data.dueDate === null || data.dueDate instanceof Date);
    this.dueDate = data.dueDate;

    return this.findActiveOwnedById();
  }

  override findActiveOwnedById() {
    const now = new Date("2026-07-30T12:00:00.000Z");

    return Promise.resolve({
      id: "22222222-2222-4222-8222-222222222222",
      nonConformityId: NON_CONFORMITY_ID,
      description: "Instalar proteção fixa.",
      why: null,
      location: null,
      responsible: null,
      dueDate: this.dueDate,
      method: null,
      estimatedCost: null,
      status: CorrectiveActionStatus.PENDING,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  override async updateOwned(
    _id: string,
    _userId: string,
    data: Parameters<CorrectiveActionRepository["updateOwned"]>[2],
  ) {
    this.updateData = data;
    if (data.dueDate !== undefined) {
      assert.ok(data.dueDate === null || data.dueDate instanceof Date);
      this.dueDate = data.dueDate;
    }
    return this.findActiveOwnedById();
  }
}

class FakeNonConformityRepository extends NonConformityRepository {
  updateData: Parameters<NonConformityRepository["updateWithRelations"]>[1] | undefined;

  constructor(private readonly nonConformity: NonConformityWithRelations) {
    super();
  }

  override findActiveOwnedById(): Promise<NonConformityWithRelations | null> {
    return Promise.resolve(this.nonConformity);
  }

  override async findByInspectionResponseId() {
    return null;
  }

  override async createWithRelations(
    data: Parameters<NonConformityRepository["createWithRelations"]>[0],
  ) {
    assert.ok(data.dueDate === null || data.dueDate instanceof Date);
    this.nonConformity.dueDate = data.dueDate;
    return this.nonConformity;
  }

  override async updateWithRelations(
    _id: string,
    data: Parameters<NonConformityRepository["updateWithRelations"]>[1],
  ) {
    this.updateData = data;
    if (data.dueDate !== undefined) {
      assert.ok(data.dueDate === null || data.dueDate instanceof Date);
      this.nonConformity.dueDate = data.dueDate;
    }
    return this.nonConformity;
  }
}

class FakeInspectionResponseRepository extends InspectionResponseRepository {
  override async findOwnedById() {
    return {
      ...createNonConformity(NonConformityStatus.OPEN).inspectionResponse,
      nonConformity: null,
    };
  }
}

test("creating the first corrective action requests an atomic NC transition", async () => {
  const actionRepository = new FakeCorrectiveActionRepository();
  const nonConformityRepository = new FakeNonConformityRepository(
    createNonConformity(NonConformityStatus.OPEN),
  );
  const service = new CorrectiveActionService(actionRepository, nonConformityRepository);

  const result = await service.createCorrectiveAction(
    {
      nonConformityId: NON_CONFORMITY_ID,
      description: "Instalar proteção fixa.",
    },
    USER_ID,
  );

  assert.equal(result.success, true);
  assert.deepEqual(actionRepository.transition, {
    id: NON_CONFORMITY_ID,
    from: NonConformityStatus.OPEN,
    to: NonConformityStatus.IN_PROGRESS,
  });
});

test("creating another action does not rewrite an NC already in progress", async () => {
  const actionRepository = new FakeCorrectiveActionRepository();
  const nonConformityRepository = new FakeNonConformityRepository(
    createNonConformity(NonConformityStatus.IN_PROGRESS),
  );
  const service = new CorrectiveActionService(actionRepository, nonConformityRepository);

  const result = await service.createCorrectiveAction(
    {
      nonConformityId: NON_CONFORMITY_ID,
      description: "Treinar operadores.",
    },
    USER_ID,
  );

  assert.equal(result.success, true);
  assert.equal(actionRepository.transition, undefined);
});

test("a concurrent NC state change returns a conflict instead of a partial action", async () => {
  const actionRepository = new FakeCorrectiveActionRepository();
  actionRepository.failWithStateConflict = true;
  const nonConformityRepository = new FakeNonConformityRepository(
    createNonConformity(NonConformityStatus.OPEN),
  );
  const service = new CorrectiveActionService(actionRepository, nonConformityRepository);

  const result = await service.createCorrectiveAction(
    {
      nonConformityId: NON_CONFORMITY_ID,
      description: "Instalar proteção fixa.",
    },
    USER_ID,
  );

  assert.equal(result.success, false);

  if (result.success) {
    assert.fail("Expected a failed result.");
  }

  assert.equal(result.code, "CONFLICT");
});

for (const dueDate of [undefined, null, ""] as const) {
  test(`validated ${String(dueDate)} deadlines reach creation repositories as null`, async () => {
    const nonConformityRepository = new FakeNonConformityRepository(
      createNonConformity(NonConformityStatus.OPEN),
    );
    const actionRepository = new FakeCorrectiveActionRepository();
    const ncService = new NonConformityService(
      nonConformityRepository,
      new FakeInspectionResponseRepository(),
    );
    const actionService = new CorrectiveActionService(actionRepository, nonConformityRepository);
    const ncResult = await ncService.createNonConformity(
      createNonConformitySchema.parse({
        inspectionResponseId: NON_CONFORMITY_ID,
        description: "Proteção ausente.",
        severity: Severity.MEDIUM,
        dueDate,
      }),
      USER_ID,
    );
    const actionResult = await actionService.createCorrectiveAction(
      createCorrectiveActionSchema.parse({
        nonConformityId: NON_CONFORMITY_ID,
        description: "Instalar proteção fixa.",
        dueDate,
      }),
      USER_ID,
    );

    for (const result of [ncResult, actionResult]) {
      assert.ok(result.success);
      assert.equal(result.data.dueDate, null);
      assert.equal(fmtData(result.data.dueDate), "—");
    }
  });
}

for (const dueDate of [undefined, null, ""] as const) {
  test(`validated ${String(dueDate)} deadline updates preserve omission or clear existing dates`, async () => {
    const previousDate = new Date("2026-10-20T12:00:00.000Z");
    const nonConformity = createNonConformity(NonConformityStatus.OPEN);
    nonConformity.dueDate = previousDate;
    const nonConformityRepository = new FakeNonConformityRepository(nonConformity);
    const actionRepository = new FakeCorrectiveActionRepository();
    actionRepository.dueDate = previousDate;
    const ncService = new NonConformityService(nonConformityRepository);
    const actionService = new CorrectiveActionService(actionRepository, nonConformityRepository);
    const fields = dueDate === undefined ? { description: "Descrição atualizada." } : { dueDate };
    const ncInput = updateNonConformityInputSchema.parse({ id: NON_CONFORMITY_ID, data: fields });
    const actionInput = updateCorrectiveActionInputSchema.parse({
      id: NON_CONFORMITY_ID,
      data: fields,
    });
    const ncResult = await ncService.updateNonConformity(ncInput.id, ncInput.data, USER_ID);
    const actionResult = await actionService.updateCorrectiveAction(
      actionInput.id,
      actionInput.data,
      USER_ID,
    );

    for (const result of [ncResult, actionResult]) {
      assert.ok(result.success);
      assert.deepEqual(result.data.dueDate, dueDate === undefined ? previousDate : null);
      if (dueDate !== undefined) {
        assert.equal(fmtData(result.data.dueDate), "—");
      }
    }
    for (const data of [nonConformityRepository.updateData, actionRepository.updateData]) {
      assert.ok(data);
      assert.equal(Object.hasOwn(data, "dueDate"), dueDate !== undefined);
      assert.equal(data.dueDate, dueDate === undefined ? undefined : null);
    }
  });
}

function createNonConformity(status: NonConformityStatus): NonConformityWithRelations {
  const now = new Date("2026-07-30T12:00:00.000Z");

  return {
    id: NON_CONFORMITY_ID,
    inspectionResponseId: "33333333-3333-4333-8333-333333333333",
    description: "Proteção ausente.",
    severity: Severity.MEDIUM,
    dueDate: null,
    status,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    inspectionResponse: {
      id: "33333333-3333-4333-8333-333333333333",
      inspectionId: "44444444-4444-4444-8444-444444444444",
      checklistItemId: "55555555-5555-4555-8555-555555555555",
      snapshotItemId: "99999999-9999-4999-8999-999999999999",
      status: ResponseStatus.NON_COMPLIANT,
      observation: null,
      clientUpdatedAt: null,
      createdAt: now,
      updatedAt: now,
      checklistItem: {
        id: "55555555-5555-4555-8555-555555555555",
        checklistId: "66666666-6666-4666-8666-666666666666",
        description: "Verificar proteção da máquina.",
        orderIndex: 1,
        isRequired: true,
      },
      snapshotItem: {
        id: "99999999-9999-4999-8999-999999999999",
        snapshotId: "44444444-4444-4444-8444-444444444444",
        sourceVersionItemId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        sourceChecklistItemId: "55555555-5555-4555-8555-555555555555",
        description: "Verificar proteção da máquina.",
        orderIndex: 1,
        isRequired: true,
        standards: [],
      },
      inspection: {
        id: "44444444-4444-4444-8444-444444444444",
        userId: "77777777-7777-4777-8777-777777777777",
        companyId: "88888888-8888-4888-8888-888888888888",
        checklistId: "66666666-6666-4666-8666-666666666666",
        checklistVersionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        inspectionDate: now,
        status: "IN_PROGRESS",
        syncStatus: "SYNCED",
        notes: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        company: {
          id: "88888888-8888-4888-8888-888888888888",
          corporateName: "Empresa Teste",
          tradeName: null,
          cnpj: null,
          cnae: "0000-0/00",
          riskLevel: 1,
          employeeCount: 1,
          address: null,
          notes: null,
          createdById: "77777777-7777-4777-8777-777777777777",
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
        snapshot: {
          id: "44444444-4444-4444-8444-444444444444",
          inspectionId: "44444444-4444-4444-8444-444444444444",
          sourceChecklistId: "66666666-6666-4666-8666-666666666666",
          sourceChecklistVersionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          sourceVersionNumber: 1,
          title: "Checklist teste",
          description: null,
          isTemplate: false,
          snapshotSchemaVersion: 1,
          contentHash: "a".repeat(64),
          origin: InspectionSnapshotOrigin.INSPECTION_CREATION,
          integrityStatus: InspectionSnapshotIntegrityStatus.VERIFIED,
          capturedAt: now,
        },
        user: {
          id: "77777777-7777-4777-8777-777777777777",
          name: "Inspetora",
          email: "inspetora@example.com",
          role: "TECHNICIAN",
        },
      },
    },
    correctiveActions: [],
    evidence: [],
  };
}
