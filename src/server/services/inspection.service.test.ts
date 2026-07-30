import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import { InspectionStatus, SyncStatus, UserRole, type Prisma } from "@/generated/prisma/client";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import { CompanyRepository } from "@/server/repositories/company.repository";
import {
  InspectionRepository,
  type InspectionWithRelations,
} from "@/server/repositories/inspection.repository";
import { createInspectionSchema } from "@/server/schemas/inspection.schema";

import { InspectionService } from "./inspection.service";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const COMPANY_ID = "22222222-2222-4222-8222-222222222222";
const CHECKLIST_ID = "33333333-3333-4333-8333-333333333333";
const INSPECTION_ID = "44444444-4444-4444-8444-444444444444";

class FakeInspectionRepository extends InspectionRepository {
  createdData: Prisma.InspectionCreateInput | null = null;

  override createWithRelations(
    data: Prisma.InspectionCreateInput,
  ): Promise<InspectionWithRelations> {
    this.createdData = data;

    return Promise.resolve(createInspection());
  }
}

class FakeCompanyRepository extends CompanyRepository {
  override findActiveById() {
    const now = new Date("2026-07-30T12:00:00.000Z");

    return Promise.resolve({
      id: COMPANY_ID,
      corporateName: "Empresa Teste",
      tradeName: null,
      cnpj: null,
      cnae: "0000-0/00",
      riskLevel: 1,
      employeeCount: 1,
      address: null,
      notes: null,
      createdById: USER_ID,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }
}

class FakeChecklistRepository extends ChecklistRepository {
  constructor(private readonly active: boolean) {
    super();
  }

  override findActiveById() {
    const now = new Date("2026-07-30T12:00:00.000Z");

    return Promise.resolve({
      id: CHECKLIST_ID,
      title: "Checklist teste",
      description: null,
      isTemplate: false,
      isActive: this.active,
      createdById: USER_ID,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      items: [],
    });
  }
}

test("the public creation schema does not accept workflow or sync status", () => {
  const parsed = createInspectionSchema.parse({
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    inspectionDate: "2026-07-30T12:00:00.000Z",
    status: InspectionStatus.COMPLETED,
    syncStatus: SyncStatus.ERROR,
  });

  assert.equal("status" in parsed, false);
  assert.equal("syncStatus" in parsed, false);
});

test("new online inspections always start planned and synced", async () => {
  const inspectionRepository = new FakeInspectionRepository();
  const service = new InspectionService(
    inspectionRepository,
    new FakeCompanyRepository(),
    new FakeChecklistRepository(true),
  );

  const result = await service.createInspection({
    userId: USER_ID,
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    inspectionDate: new Date("2026-07-30T12:00:00.000Z"),
  });

  assert.equal(result.success, true);
  assert.equal(inspectionRepository.createdData?.status, InspectionStatus.PLANNED);
  assert.equal(inspectionRepository.createdData?.syncStatus, SyncStatus.SYNCED);
});

test("inactive checklists cannot be used for new inspections", async () => {
  const inspectionRepository = new FakeInspectionRepository();
  const service = new InspectionService(
    inspectionRepository,
    new FakeCompanyRepository(),
    new FakeChecklistRepository(false),
  );

  const result = await service.createInspection({
    userId: USER_ID,
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    inspectionDate: new Date("2026-07-30T12:00:00.000Z"),
  });

  assert.equal(result.success, false);

  if (result.success) {
    assert.fail("Expected a failed result.");
  }

  assert.equal(result.code, "CONFLICT");
  assert.equal(inspectionRepository.createdData, null);
});

function createInspection(): InspectionWithRelations {
  const now = new Date("2026-07-30T12:00:00.000Z");

  return {
    id: INSPECTION_ID,
    userId: USER_ID,
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    inspectionDate: now,
    status: InspectionStatus.PLANNED,
    syncStatus: SyncStatus.SYNCED,
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    user: {
      id: USER_ID,
      name: "Inspetora",
      email: "inspetora@example.com",
      role: UserRole.TECHNICIAN,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    company: {
      id: COMPANY_ID,
      corporateName: "Empresa Teste",
      tradeName: null,
      cnpj: null,
      cnae: "0000-0/00",
      riskLevel: 1,
      employeeCount: 1,
      address: null,
      notes: null,
      createdById: USER_ID,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    checklist: {
      id: CHECKLIST_ID,
      title: "Checklist teste",
      description: null,
      isTemplate: false,
      isActive: true,
      createdById: USER_ID,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      items: [],
    },
    responses: [],
  };
}
