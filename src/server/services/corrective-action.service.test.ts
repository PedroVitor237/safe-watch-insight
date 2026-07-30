import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import {
  CorrectiveActionStatus,
  NonConformityStatus,
  ResponseStatus,
  Severity,
} from "@/generated/prisma/client";
import {
  CorrectiveActionRepository,
  NonConformityStatePersistenceConflictError,
  type NonConformityStatusTransition,
} from "@/server/repositories/corrective-action.repository";
import {
  NonConformityRepository,
  type NonConformityWithRelations,
} from "@/server/repositories/non-conformity.repository";

import { CorrectiveActionService } from "./corrective-action.service";

const NON_CONFORMITY_ID = "11111111-1111-4111-8111-111111111111";

class FakeCorrectiveActionRepository extends CorrectiveActionRepository {
  transition: NonConformityStatusTransition | undefined;
  failWithStateConflict = false;

  override createWithNonConformityTransition(
    _data: Parameters<CorrectiveActionRepository["createWithNonConformityTransition"]>[0],
    transition?: NonConformityStatusTransition,
  ) {
    this.transition = transition;

    if (this.failWithStateConflict) {
      return Promise.reject(new NonConformityStatePersistenceConflictError());
    }

    const now = new Date("2026-07-30T12:00:00.000Z");

    return Promise.resolve({
      id: "22222222-2222-4222-8222-222222222222",
      nonConformityId: NON_CONFORMITY_ID,
      description: "Instalar proteção fixa.",
      why: null,
      location: null,
      responsible: null,
      dueDate: null,
      method: null,
      estimatedCost: null,
      status: CorrectiveActionStatus.PENDING,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }
}

class FakeNonConformityRepository extends NonConformityRepository {
  constructor(private readonly nonConformity: NonConformityWithRelations) {
    super();
  }

  override findActiveById(): Promise<NonConformityWithRelations | null> {
    return Promise.resolve(this.nonConformity);
  }
}

test("creating the first corrective action requests an atomic NC transition", async () => {
  const actionRepository = new FakeCorrectiveActionRepository();
  const nonConformityRepository = new FakeNonConformityRepository(
    createNonConformity(NonConformityStatus.OPEN),
  );
  const service = new CorrectiveActionService(actionRepository, nonConformityRepository);

  const result = await service.createCorrectiveAction({
    nonConformityId: NON_CONFORMITY_ID,
    description: "Instalar proteção fixa.",
  });

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

  const result = await service.createCorrectiveAction({
    nonConformityId: NON_CONFORMITY_ID,
    description: "Treinar operadores.",
  });

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

  const result = await service.createCorrectiveAction({
    nonConformityId: NON_CONFORMITY_ID,
    description: "Instalar proteção fixa.",
  });

  assert.equal(result.success, false);

  if (result.success) {
    assert.fail("Expected a failed result.");
  }

  assert.equal(result.code, "CONFLICT");
});

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
      status: ResponseStatus.NON_COMPLIANT,
      observation: null,
      checklistItem: {
        id: "55555555-5555-4555-8555-555555555555",
        checklistId: "66666666-6666-4666-8666-666666666666",
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
        checklist: {
          id: "66666666-6666-4666-8666-666666666666",
          title: "Checklist teste",
          description: null,
          isTemplate: false,
          isActive: true,
          createdById: "77777777-7777-4777-8777-777777777777",
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
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
