import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import {
  ChecklistVersionStatus,
  InspectionSnapshotIntegrityStatus,
  InspectionSnapshotOrigin,
  InspectionStatus,
  StandardType,
  SyncStatus,
  UserRole,
} from "@/generated/prisma/client";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import {
  ChecklistVersionRepository,
  type ChecklistVersionWithItems,
} from "@/server/repositories/checklist-version.repository";
import { CompanyRepository } from "@/server/repositories/company.repository";
import {
  type CreateInspectionWithSnapshotPersistenceInput,
  InspectionRepository,
  type InspectionWithRelations,
} from "@/server/repositories/inspection.repository";
import { createInspectionSchema } from "@/server/schemas/inspection.schema";
import {
  CHECKLIST_CONTENT_SCHEMA_VERSION,
  createChecklistContentHash,
} from "@/server/utils/checklist-content-hash";

import { InspectionService } from "./inspection.service";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const COMPANY_ID = "22222222-2222-4222-8222-222222222222";
const CHECKLIST_ID = "33333333-3333-4333-8333-333333333333";
const INSPECTION_ID = "44444444-4444-4444-8444-444444444444";
const VERSION_ID = "55555555-5555-4555-8555-555555555555";
const VERSION_ITEM_ID = "66666666-6666-4666-8666-666666666666";
const SNAPSHOT_ITEM_ID = "77777777-7777-4777-8777-777777777777";
const STANDARD_ID = "88888888-8888-4888-8888-888888888888";

class FakeInspectionRepository extends InspectionRepository {
  createdData: CreateInspectionWithSnapshotPersistenceInput | null = null;

  override createWithSnapshot(
    data: CreateInspectionWithSnapshotPersistenceInput,
  ): Promise<InspectionWithRelations> {
    this.createdData = data;

    return Promise.resolve(createInspection());
  }
}

class FakeCompanyRepository extends CompanyRepository {
  override findActiveById() {
    const now = new Date("2026-08-03T12:00:00.000Z");

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
    const now = new Date("2026-08-03T12:00:00.000Z");

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
      versions: [createPublishedVersion()],
    });
  }
}

class FakeChecklistVersionRepository extends ChecklistVersionRepository {
  constructor(private readonly version: ChecklistVersionWithItems = createPublishedVersion()) {
    super();
  }

  override findLatestPublishedByChecklistId(): Promise<ChecklistVersionWithItems | null> {
    return Promise.resolve(this.version);
  }

  override findByIdWithItems(): Promise<ChecklistVersionWithItems | null> {
    return Promise.resolve(this.version);
  }
}

test("the public creation schema does not accept workflow or sync status", () => {
  const parsed = createInspectionSchema.parse({
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    checklistVersionId: VERSION_ID,
    inspectionDate: "2026-08-03T12:00:00.000Z",
    status: InspectionStatus.COMPLETED,
    syncStatus: SyncStatus.ERROR,
  });

  assert.equal("status" in parsed, false);
  assert.equal("syncStatus" in parsed, false);
  assert.equal(parsed.checklistVersionId, VERSION_ID);
});

test("new online inspections start planned and atomically request a verified snapshot", async () => {
  const inspectionRepository = new FakeInspectionRepository();
  const service = new InspectionService(
    inspectionRepository,
    new FakeCompanyRepository(),
    new FakeChecklistRepository(true),
    new FakeChecklistVersionRepository(),
  );

  const result = await service.createInspection({
    userId: USER_ID,
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    checklistVersionId: VERSION_ID,
    inspectionDate: new Date("2026-08-03T12:00:00.000Z"),
  });

  assert.equal(result.success, true);
  assert.equal(inspectionRepository.createdData?.status, InspectionStatus.PLANNED);
  assert.equal(inspectionRepository.createdData?.syncStatus, SyncStatus.SYNCED);
  assert.equal(inspectionRepository.createdData?.checklistVersionId, VERSION_ID);
  assert.equal(
    inspectionRepository.createdData?.snapshot.origin,
    InspectionSnapshotOrigin.INSPECTION_CREATION,
  );
  assert.equal(
    inspectionRepository.createdData?.snapshot.integrityStatus,
    InspectionSnapshotIntegrityStatus.VERIFIED,
  );
  assert.equal(inspectionRepository.createdData?.snapshot.items[0]?.description, "Pergunta v1");
  assert.equal(inspectionRepository.createdData?.snapshot.items[0]?.standards[0]?.code, "NR-10");
});

test("inactive checklists cannot be used for new inspections", async () => {
  const inspectionRepository = new FakeInspectionRepository();
  const service = new InspectionService(
    inspectionRepository,
    new FakeCompanyRepository(),
    new FakeChecklistRepository(false),
    new FakeChecklistVersionRepository(),
  );

  const result = await service.createInspection({
    userId: USER_ID,
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    inspectionDate: new Date("2026-08-03T12:00:00.000Z"),
  });

  assert.equal(result.success, false);
  assert.equal(inspectionRepository.createdData, null);
});

test("draft versions cannot be used for new inspections", async () => {
  const inspectionRepository = new FakeInspectionRepository();
  const draft = {
    ...createPublishedVersion(),
    status: ChecklistVersionStatus.DRAFT,
    contentHash: null,
    publishedById: null,
    publishedAt: null,
  };
  const service = new InspectionService(
    inspectionRepository,
    new FakeCompanyRepository(),
    new FakeChecklistRepository(true),
    new FakeChecklistVersionRepository(draft),
  );

  const result = await service.createInspection({
    userId: USER_ID,
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    checklistVersionId: VERSION_ID,
    inspectionDate: new Date("2026-08-03T12:00:00.000Z"),
  });

  assert.equal(result.success, false);
  assert.equal(inspectionRepository.createdData, null);
});

function createPublishedVersion(): ChecklistVersionWithItems {
  const now = new Date("2026-08-03T12:00:00.000Z");
  const content = {
    title: "Checklist publicado",
    description: "Versão estável",
    items: [
      {
        description: "Pergunta v1",
        orderIndex: 1,
        isRequired: true,
        standards: [
          {
            standardId: STANDARD_ID,
            type: StandardType.NR,
            code: "NR-10",
            title: "Segurança em eletricidade",
            summary: null,
            officialUrl: null,
          },
        ],
      },
    ],
  };

  return {
    id: VERSION_ID,
    checklistId: CHECKLIST_ID,
    versionNumber: 1,
    status: ChecklistVersionStatus.PUBLISHED,
    title: content.title,
    description: content.description,
    contentSchemaVersion: CHECKLIST_CONTENT_SCHEMA_VERSION,
    contentHash: createChecklistContentHash(content),
    createdById: USER_ID,
    publishedById: USER_ID,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    items: [
      {
        id: VERSION_ITEM_ID,
        checklistVersionId: VERSION_ID,
        sourceVersionItemId: null,
        sourceChecklistItemId: null,
        description: "Pergunta v1",
        orderIndex: 1,
        isRequired: true,
        createdAt: now,
        updatedAt: now,
        standards: [
          {
            checklistVersionItemId: VERSION_ITEM_ID,
            standardId: STANDARD_ID,
            type: StandardType.NR,
            code: "NR-10",
            title: "Segurança em eletricidade",
            summary: null,
            officialUrl: null,
          },
        ],
      },
    ],
  };
}

function createInspection(): InspectionWithRelations {
  const now = new Date("2026-08-03T12:00:00.000Z");
  const version = createPublishedVersion();

  return {
    id: INSPECTION_ID,
    userId: USER_ID,
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    checklistVersionId: VERSION_ID,
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
    },
    checklistVersion: {
      id: version.id,
      checklistId: version.checklistId,
      versionNumber: version.versionNumber,
      status: version.status,
      title: version.title,
      description: version.description,
      contentSchemaVersion: version.contentSchemaVersion,
      contentHash: version.contentHash,
      createdById: version.createdById,
      publishedById: version.publishedById,
      publishedAt: version.publishedAt,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
    },
    snapshot: {
      id: INSPECTION_ID,
      inspectionId: INSPECTION_ID,
      sourceChecklistId: CHECKLIST_ID,
      sourceChecklistVersionId: VERSION_ID,
      sourceVersionNumber: 1,
      title: version.title,
      description: version.description,
      isTemplate: false,
      snapshotSchemaVersion: CHECKLIST_CONTENT_SCHEMA_VERSION,
      contentHash: version.contentHash as string,
      origin: InspectionSnapshotOrigin.INSPECTION_CREATION,
      integrityStatus: InspectionSnapshotIntegrityStatus.VERIFIED,
      capturedAt: now,
      items: [
        {
          id: SNAPSHOT_ITEM_ID,
          snapshotId: INSPECTION_ID,
          sourceVersionItemId: VERSION_ITEM_ID,
          sourceChecklistItemId: null,
          description: "Pergunta v1",
          orderIndex: 1,
          isRequired: true,
          standards: [
            {
              snapshotItemId: SNAPSHOT_ITEM_ID,
              standardId: STANDARD_ID,
              type: StandardType.NR,
              code: "NR-10",
              title: "Segurança em eletricidade",
              summary: null,
              officialUrl: null,
            },
          ],
        },
      ],
    },
    responses: [],
  };
}
