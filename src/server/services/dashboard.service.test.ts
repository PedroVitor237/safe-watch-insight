import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import { InspectionStatus, ResponseStatus } from "@/generated/prisma/client";
import {
  DashboardRepository,
  type DashboardOverviewSource,
} from "@/server/repositories/dashboard.repository";

import { DashboardService } from "./dashboard.service";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const REFERENCE_DATE = new Date("2026-09-04T12:00:00.000Z");

class FakeDashboardRepository extends DashboardRepository {
  requestedUserId: string | null = null;
  requestedReferenceDate: Date | null = null;
  requestedRecentLimit: number | null = null;

  constructor(
    private readonly source: DashboardOverviewSource | null,
    private readonly error?: Error,
  ) {
    super();
  }

  override getOverview(
    userId: string,
    referenceDate: Date,
    recentLimit: number,
  ): Promise<DashboardOverviewSource> {
    this.requestedUserId = userId;
    this.requestedReferenceDate = referenceDate;
    this.requestedRecentLimit = recentLimit;

    if (this.error) {
      return Promise.reject(this.error);
    }

    if (!this.source) {
      throw new Error("Fake Dashboard source was not configured.");
    }

    return Promise.resolve(this.source);
  }
}

test("dashboard scopes its read model by user and derives supported real-data metrics", async () => {
  const repository = new FakeDashboardRepository(createOverviewSource());
  const service = new DashboardService(repository);

  const result = await service.getDashboard(USER_ID, REFERENCE_DATE);

  assert.equal(repository.requestedUserId, USER_ID);
  assert.equal(repository.requestedReferenceDate, REFERENCE_DATE);
  assert.equal(repository.requestedRecentLimit, 5);
  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.deepEqual(result.data.summary, {
    totalInspections: 10,
    completedInspections: 5,
    inProgressInspections: 2,
    plannedInspections: 2,
    cancelledInspections: 1,
    totalNonConformities: 6,
    openNonConformities: 4,
    resolvedNonConformities: 2,
    overdueNonConformities: 1,
    overdueCorrectiveActions: 3,
  });
  assert.deepEqual(result.data.compliance, {
    percentage: 80,
    compliantResponses: 8,
    nonCompliantResponses: 2,
    applicableResponses: 10,
  });
  assert.equal(result.data.recentInspections[0]?.title, "Checklist histórico");
  assert.equal(result.data.recentInspections[0]?.companyName, "Empresa Exemplo");
});

test("dashboard returns a trustworthy empty compliance state without applicable responses", async () => {
  const source = createOverviewSource();
  source.inspectionStatusCounts = [];
  source.responseStatusCounts = [];
  source.totalNonConformities = 0;
  source.resolvedNonConformities = 0;
  source.overdueNonConformities = 0;
  source.overdueCorrectiveActions = 0;
  source.recentInspections = [];
  const service = new DashboardService(new FakeDashboardRepository(source));

  const result = await service.getDashboard(USER_ID, REFERENCE_DATE);

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.summary.totalInspections, 0);
    assert.equal(result.data.compliance.percentage, null);
    assert.equal(result.data.inspectionStatusDistribution.length, 4);
  }
});

test("dashboard converts unexpected persistence errors to a safe response", async () => {
  const repository = new FakeDashboardRepository(
    null,
    new Error("postgresql://private-host/secret"),
  );
  const service = new DashboardService(repository);

  const result = await service.getDashboard(USER_ID, REFERENCE_DATE);

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.code, "INTERNAL_SERVER_ERROR");
    assert.equal(result.statusCode, 500);
    assert.equal(result.message, "Internal server error");
    assert.equal(result.message.includes("private-host"), false);
  }
});

function createOverviewSource(): DashboardOverviewSource {
  return {
    inspectionStatusCounts: [
      { status: InspectionStatus.PLANNED, count: 2 },
      { status: InspectionStatus.IN_PROGRESS, count: 2 },
      { status: InspectionStatus.COMPLETED, count: 5 },
      { status: InspectionStatus.CANCELLED, count: 1 },
    ],
    totalNonConformities: 6,
    resolvedNonConformities: 2,
    overdueNonConformities: 1,
    overdueCorrectiveActions: 3,
    responseStatusCounts: [
      { status: ResponseStatus.COMPLIANT, count: 8 },
      { status: ResponseStatus.NON_COMPLIANT, count: 2 },
    ],
    recentInspections: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        inspectionDate: new Date("2026-09-03T09:00:00.000Z"),
        status: InspectionStatus.COMPLETED,
        company: {
          corporateName: "Empresa Exemplo Ltda.",
          tradeName: "Empresa Exemplo",
        },
        user: {
          name: "Inspetora Exemplo",
        },
        snapshot: {
          title: "Checklist histórico",
          sourceVersionNumber: 2,
        },
      },
    ],
  };
}
