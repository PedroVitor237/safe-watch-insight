import type {
  InspectionStatus,
  NonConformityStatus,
  ResponseStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

export interface DashboardCountByInspectionStatus {
  status: InspectionStatus;
  count: number;
}

export interface DashboardCountByResponseStatus {
  status: ResponseStatus;
  count: number;
}

export interface DashboardRecentInspectionSource {
  id: string;
  inspectionDate: Date;
  status: InspectionStatus;
  company: {
    corporateName: string;
    tradeName: string | null;
  };
  user: {
    name: string;
  };
  snapshot: {
    title: string;
    sourceVersionNumber: number;
  } | null;
}

export interface DashboardOverviewSource {
  inspectionStatusCounts: DashboardCountByInspectionStatus[];
  totalNonConformities: number;
  resolvedNonConformities: number;
  overdueNonConformities: number;
  overdueCorrectiveActions: number;
  responseStatusCounts: DashboardCountByResponseStatus[];
  recentInspections: DashboardRecentInspectionSource[];
}

const ACTIVE_NON_CONFORMITY_STATUSES: NonConformityStatus[] = ["OPEN", "IN_PROGRESS", "OVERDUE"];

export class DashboardRepository {
  async getOverview(
    userId: string,
    referenceDate: Date,
    recentLimit: number,
  ): Promise<DashboardOverviewSource> {
    const inspectionScope = {
      userId,
      deletedAt: null,
    } as const;
    const nonConformityScope = {
      deletedAt: null,
      inspectionResponse: {
        inspection: inspectionScope,
      },
    } as const;

    const [
      inspectionStatusGroups,
      totalNonConformities,
      resolvedNonConformities,
      overdueNonConformities,
      overdueCorrectiveActions,
      responseStatusGroups,
      recentInspections,
    ] = await Promise.all([
      prisma.inspection.groupBy({
        by: ["status"],
        where: inspectionScope,
        _count: { status: true },
      }),
      prisma.nonConformity.count({ where: nonConformityScope }),
      prisma.nonConformity.count({
        where: {
          ...nonConformityScope,
          status: "RESOLVED",
        },
      }),
      prisma.nonConformity.count({
        where: {
          ...nonConformityScope,
          OR: [
            { status: "OVERDUE" },
            {
              status: { in: ["OPEN", "IN_PROGRESS"] },
              dueDate: { lt: referenceDate },
            },
          ],
        },
      }),
      prisma.correctiveAction.count({
        where: {
          deletedAt: null,
          nonConformity: {
            ...nonConformityScope,
            status: { in: ACTIVE_NON_CONFORMITY_STATUSES },
          },
          OR: [
            { status: "OVERDUE" },
            {
              status: { in: ["PENDING", "IN_PROGRESS"] },
              dueDate: { lt: referenceDate },
            },
          ],
        },
      }),
      prisma.inspectionResponse.groupBy({
        by: ["status"],
        where: {
          snapshotItemId: { not: null },
          status: { in: ["COMPLIANT", "NON_COMPLIANT"] },
          inspection: {
            ...inspectionScope,
            status: "COMPLETED",
          },
        },
        _count: { status: true },
      }),
      prisma.inspection.findMany({
        where: inspectionScope,
        orderBy: [{ inspectionDate: "desc" }, { createdAt: "desc" }, { id: "desc" }],
        take: recentLimit,
        select: {
          id: true,
          inspectionDate: true,
          status: true,
          company: {
            select: {
              corporateName: true,
              tradeName: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
          snapshot: {
            select: {
              title: true,
              sourceVersionNumber: true,
            },
          },
        },
      }),
    ]);

    return {
      inspectionStatusCounts: inspectionStatusGroups.map((group) => ({
        status: group.status,
        count: group._count.status,
      })),
      totalNonConformities,
      resolvedNonConformities,
      overdueNonConformities,
      overdueCorrectiveActions,
      responseStatusCounts: responseStatusGroups.map((group) => ({
        status: group.status,
        count: group._count.status,
      })),
      recentInspections,
    };
  }
}

export const dashboardRepository = new DashboardRepository();
