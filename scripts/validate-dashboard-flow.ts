import "dotenv/config";

import assert from "node:assert/strict";

import { prisma } from "@/server/prisma/client";
import type { Result } from "@/server/responses";
import { dashboardService } from "@/server/services/dashboard.service";
import { reportService } from "@/server/services/report.service";

async function main(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });

  if (users.length === 0) {
    throw new Error("An active user is required for Dashboard validation.");
  }

  const dashboards = await Promise.all(
    users.map(async (user) => ({
      userId: user.id,
      dashboard: unwrap(await dashboardService.getDashboard(user.id)),
    })),
  );
  const existingDataCase = dashboards
    .filter((item) => item.dashboard.summary.totalInspections > 0)
    .sort(
      (left, right) =>
        right.dashboard.summary.totalInspections - left.dashboard.summary.totalInspections,
    )[0];

  if (!existingDataCase) {
    throw new Error("At least one persisted inspection is required for Dashboard validation.");
  }

  const { userId, dashboard } = existingDataCase;
  const inspectionScope = { userId, deletedAt: null } as const;
  const nonConformityScope = {
    deletedAt: null,
    inspectionResponse: { inspection: inspectionScope },
  } as const;
  const beforeReadState = await loadStatusState(userId);

  const [
    directInspectionGroups,
    directNonConformities,
    directResolvedNonConformities,
    directResponseGroups,
    directRecentInspections,
  ] = await Promise.all([
    prisma.inspection.groupBy({
      by: ["status"],
      where: inspectionScope,
      _count: { status: true },
    }),
    prisma.nonConformity.count({ where: nonConformityScope }),
    prisma.nonConformity.count({
      where: { ...nonConformityScope, status: "RESOLVED" },
    }),
    prisma.inspectionResponse.groupBy({
      by: ["status"],
      where: {
        snapshotItemId: { not: null },
        status: { in: ["COMPLIANT", "NON_COMPLIANT"] },
        inspection: { ...inspectionScope, status: "COMPLETED" },
      },
      _count: { status: true },
    }),
    prisma.inspection.findMany({
      where: inspectionScope,
      orderBy: [{ inspectionDate: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      take: 5,
      select: { id: true },
    }),
  ]);

  assert.equal(
    dashboard.summary.totalInspections,
    directInspectionGroups.reduce((total, group) => total + group._count.status, 0),
  );
  for (const group of directInspectionGroups) {
    assert.equal(
      dashboard.inspectionStatusDistribution.find((item) => item.status === group.status)?.count,
      group._count.status,
    );
  }
  assert.equal(dashboard.summary.totalNonConformities, directNonConformities);
  assert.equal(dashboard.summary.resolvedNonConformities, directResolvedNonConformities);
  assert.equal(
    dashboard.summary.openNonConformities,
    directNonConformities - directResolvedNonConformities,
  );

  const compliantResponses =
    directResponseGroups.find((group) => group.status === "COMPLIANT")?._count.status ?? 0;
  const nonCompliantResponses =
    directResponseGroups.find((group) => group.status === "NON_COMPLIANT")?._count.status ?? 0;
  const applicableResponses = compliantResponses + nonCompliantResponses;
  assert.deepEqual(dashboard.compliance, {
    percentage:
      applicableResponses === 0
        ? null
        : Math.round((compliantResponses / applicableResponses) * 100),
    compliantResponses,
    nonCompliantResponses,
    applicableResponses,
  });
  assert.deepEqual(
    dashboard.recentInspections.map((inspection) => inspection.id),
    directRecentInspections.map((inspection) => inspection.id),
  );

  for (const recentInspection of dashboard.recentInspections) {
    const ownedInspection = await prisma.inspection.count({
      where: { id: recentInspection.id, userId, deletedAt: null },
    });
    assert.equal(ownedInspection, 1);
  }

  unwrap(await dashboardService.getDashboard(userId));
  assert.deepEqual(await loadStatusState(userId), beforeReadState);

  const availableReports = unwrap(await reportService.listAvailableInspectionReports(userId));
  if (availableReports[0]) {
    const report = unwrap(await reportService.getInspectionReport(availableReports[0].id, userId));
    assert.equal(report.id, availableReports[0].id);
  }

  const emptyDataCase = dashboards.find((item) => item.dashboard.summary.totalInspections === 0);
  if (emptyDataCase) {
    assert.equal(emptyDataCase.dashboard.compliance.percentage, null);
    assert.equal(emptyDataCase.dashboard.recentInspections.length, 0);
  }

  console.log(
    JSON.stringify(
      {
        validation: "Dashboard Neon validation passed",
        summary: dashboard.summary,
        compliance: dashboard.compliance,
        recentInspectionCount: dashboard.recentInspections.length,
        reportsRegressionChecked: availableReports.length > 0,
        readDidNotMutateStatuses: true,
        authorizationScopeChecked: true,
        emptyStateChecked: emptyDataCase !== undefined,
      },
      null,
      2,
    ),
  );
}

async function loadStatusState(userId: string) {
  const [nonConformities, correctiveActions] = await Promise.all([
    prisma.nonConformity.findMany({
      where: {
        deletedAt: null,
        inspectionResponse: { inspection: { userId, deletedAt: null } },
      },
      orderBy: { id: "asc" },
      select: { id: true, status: true, updatedAt: true },
    }),
    prisma.correctiveAction.findMany({
      where: {
        deletedAt: null,
        nonConformity: {
          deletedAt: null,
          inspectionResponse: { inspection: { userId, deletedAt: null } },
        },
      },
      orderBy: { id: "asc" },
      select: { id: true, status: true, updatedAt: true },
    }),
  ]);

  return { nonConformities, correctiveActions };
}

function unwrap<TData>(result: Result<TData>): TData {
  if (!result.success) {
    throw new Error(`${result.code}: ${result.message}`);
  }

  return result.data;
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Dashboard validation failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
