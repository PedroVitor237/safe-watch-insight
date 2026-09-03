import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import {
  CorrectiveActionStatus,
  InspectionSnapshotIntegrityStatus,
  InspectionSnapshotOrigin,
  InspectionStatus,
  NonConformityStatus,
  ResponseStatus,
  Severity,
  StandardType,
  UserRole,
} from "@/generated/prisma/client";
import {
  ReportRepository,
  type AvailableInspectionReportSource,
  type InspectionReportSource,
} from "@/server/repositories/report.repository";

import { ReportService } from "./report.service";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_USER_ID = "22222222-2222-4222-8222-222222222222";
const INSPECTION_ID = "33333333-3333-4333-8333-333333333333";
const SNAPSHOT_ID = "44444444-4444-4444-8444-444444444444";
const SNAPSHOT_ITEM_1_ID = "55555555-5555-4555-8555-555555555551";
const SNAPSHOT_ITEM_2_ID = "55555555-5555-4555-8555-555555555552";
const SNAPSHOT_ITEM_3_ID = "55555555-5555-4555-8555-555555555553";
const STANDARD_ID = "66666666-6666-4666-8666-666666666666";
const RESPONSE_1_ID = "77777777-7777-4777-8777-777777777771";
const RESPONSE_2_ID = "77777777-7777-4777-8777-777777777772";
const NON_CONFORMITY_ID = "88888888-8888-4888-8888-888888888888";
const ACTION_ID = "99999999-9999-4999-8999-999999999999";
const EVIDENCE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

class FakeReportRepository extends ReportRepository {
  requestedInspectionId: string | null = null;
  requestedUserId: string | null = null;

  constructor(
    private readonly report: InspectionReportSource | null,
    private readonly available: AvailableInspectionReportSource[] = [],
  ) {
    super();
  }

  override findOwnedInspectionReport(
    inspectionId: string,
    userId: string,
  ): Promise<InspectionReportSource | null> {
    this.requestedInspectionId = inspectionId;
    this.requestedUserId = userId;

    return Promise.resolve(this.report);
  }

  override listAvailableInspectionReports(
    userId: string,
  ): Promise<AvailableInspectionReportSource[]> {
    this.requestedUserId = userId;

    return Promise.resolve(this.available);
  }
}

test("report uses snapshot wording and derives a complete response summary", async () => {
  const repository = new FakeReportRepository(createInspectionReportSource());
  const service = new ReportService(repository);

  const result = await service.getInspectionReport(INSPECTION_ID, USER_ID);

  assert.equal(result.success, true);
  assert.equal(repository.requestedInspectionId, INSPECTION_ID);
  assert.equal(repository.requestedUserId, USER_ID);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.snapshot.title, "Checklist histórico publicado");
  assert.equal(result.data.items[0]?.description, "Redação histórica do item");
  assert.deepEqual(result.data.summary, {
    totalItems: 3,
    answeredItems: 2,
    compliantItems: 1,
    nonCompliantItems: 1,
    notApplicableItems: 0,
    pendingItems: 1,
    completionPercentage: 67,
  });
});

test("report includes active non-conformity, action and evidence without bigint leakage", async () => {
  const service = new ReportService(new FakeReportRepository(createInspectionReportSource()));

  const result = await service.getInspectionReport(INSPECTION_ID, USER_ID);

  assert.equal(result.success, true);
  if (!result.success) {
    return;
  }

  const nonConformity = result.data.items[1]?.nonConformity;
  assert.equal(nonConformity?.status, NonConformityStatus.OVERDUE);
  assert.equal(nonConformity?.correctiveActions[0]?.status, CorrectiveActionStatus.OVERDUE);
  assert.equal(nonConformity?.evidence[0]?.fileSize, 2048);
  assert.equal(typeof nonConformity?.evidence[0]?.fileSize, "number");
  assert.equal(result.data.evidence[0]?.storageUrl, "https://example.com/inspection.jpg");
});

test("report lookup does not disclose an inspection unavailable to the authenticated user", async () => {
  const repository = new FakeReportRepository(null);
  const service = new ReportService(repository);

  const result = await service.getInspectionReport(INSPECTION_ID, OTHER_USER_ID);

  assert.equal(repository.requestedUserId, OTHER_USER_ID);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.statusCode, 404);
    assert.equal(result.code, "NOT_FOUND");
  }
});

test("available report list is scoped by the authenticated user", async () => {
  const source = createInspectionReportSource();
  const available: AvailableInspectionReportSource[] = [
    {
      id: source.id,
      inspectionDate: source.inspectionDate,
      status: source.status,
      company: source.company,
      snapshot: {
        title: source.snapshot?.title ?? "",
        sourceVersionNumber: source.snapshot?.sourceVersionNumber ?? 1,
      },
    },
  ];
  const repository = new FakeReportRepository(source, available);
  const service = new ReportService(repository);

  const result = await service.listAvailableInspectionReports(USER_ID);

  assert.equal(repository.requestedUserId, USER_ID);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data[0]?.companyName, "Empresa Histórica");
    assert.equal(result.data[0]?.sourceVersionNumber, 3);
  }
});

function createInspectionReportSource(): InspectionReportSource {
  const now = new Date("2026-08-20T12:00:00.000Z");
  const overdueDate = new Date("2020-01-10T12:00:00.000Z");

  return {
    id: INSPECTION_ID,
    inspectionDate: new Date("2026-08-19T09:00:00.000Z"),
    status: InspectionStatus.COMPLETED,
    notes: "Notas reais da inspeção.",
    createdAt: now,
    updatedAt: now,
    company: {
      corporateName: "Empresa Histórica Ltda.",
      tradeName: "Empresa Histórica",
      cnpj: "12345678000199",
      cnae: "7112-0/00",
      riskLevel: 3,
      employeeCount: 42,
      address: "Rua de Teste, 10",
    },
    user: {
      name: "Inspetora Teste",
      email: "inspetora@example.com",
      role: UserRole.TECHNICIAN,
    },
    snapshot: {
      id: SNAPSHOT_ID,
      sourceVersionNumber: 3,
      title: "Checklist histórico publicado",
      description: "Descrição capturada na inspeção.",
      snapshotSchemaVersion: 1,
      origin: InspectionSnapshotOrigin.INSPECTION_CREATION,
      integrityStatus: InspectionSnapshotIntegrityStatus.VERIFIED,
      capturedAt: now,
      items: [
        createSnapshotItem(SNAPSHOT_ITEM_1_ID, 1, "Redação histórica do item"),
        createSnapshotItem(SNAPSHOT_ITEM_2_ID, 2, "Item histórico não conforme"),
        createSnapshotItem(SNAPSHOT_ITEM_3_ID, 3, "Item histórico pendente"),
      ],
    },
    responses: [
      {
        id: RESPONSE_1_ID,
        snapshotItemId: SNAPSHOT_ITEM_1_ID,
        status: ResponseStatus.COMPLIANT,
        observation: null,
        updatedAt: now,
        nonConformity: null,
      },
      {
        id: RESPONSE_2_ID,
        snapshotItemId: SNAPSHOT_ITEM_2_ID,
        status: ResponseStatus.NON_COMPLIANT,
        observation: "Proteção ausente.",
        updatedAt: now,
        nonConformity: {
          id: NON_CONFORMITY_ID,
          description: "Instalar proteção coletiva.",
          severity: Severity.HIGH,
          dueDate: overdueDate,
          status: NonConformityStatus.OPEN,
          deletedAt: null,
          correctiveActions: [
            {
              id: ACTION_ID,
              description: "Instalar barreira física.",
              why: "Evitar acesso à área de risco.",
              location: "Setor produtivo",
              responsible: "Manutenção",
              dueDate: overdueDate,
              method: "Fixação mecânica",
              estimatedCost: "R$ 500,00",
              status: CorrectiveActionStatus.PENDING,
              completedAt: null,
            },
          ],
          evidence: [createEvidence("https://example.com/non-conformity.jpg")],
        },
      },
    ],
    evidence: [createEvidence("https://example.com/inspection.jpg")],
  };
}

function createSnapshotItem(id: string, orderIndex: number, description: string) {
  return {
    id,
    description,
    orderIndex,
    isRequired: true,
    standards: [
      {
        standardId: STANDARD_ID,
        type: StandardType.NR,
        code: "NR-12",
        title: "Segurança no trabalho em máquinas e equipamentos",
        summary: null,
        officialUrl: null,
      },
    ],
  };
}

function createEvidence(storageUrl: string) {
  return {
    id: EVIDENCE_ID,
    storageUrl,
    fileName: "evidencia.jpg",
    mimeType: "image/jpeg",
    fileSize: BigInt(2048),
    width: 800,
    height: 600,
    caption: "Registro fotográfico",
    createdAt: new Date("2026-08-20T12:00:00.000Z"),
  };
}
