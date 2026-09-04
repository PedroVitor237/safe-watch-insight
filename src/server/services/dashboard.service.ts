import { InspectionStatus, ResponseStatus } from "@/generated/prisma/client";
import {
  dashboardRepository,
  DashboardRepository,
  type DashboardOverviewSource,
} from "@/server/repositories/dashboard.repository";
import { resultFromError, type Result } from "@/server/responses";

const RECENT_INSPECTION_LIMIT = 5;

export interface DashboardStatusDistributionItem {
  status: InspectionStatus;
  count: number;
}

export interface DashboardRecentInspectionDto {
  id: string;
  title: string;
  sourceVersionNumber: number | null;
  companyName: string;
  inspectorName: string;
  inspectionDate: Date;
  status: InspectionStatus;
}

export interface DashboardDto {
  summary: {
    totalInspections: number;
    completedInspections: number;
    inProgressInspections: number;
    plannedInspections: number;
    cancelledInspections: number;
    totalNonConformities: number;
    openNonConformities: number;
    resolvedNonConformities: number;
    overdueNonConformities: number;
    overdueCorrectiveActions: number;
  };
  compliance: {
    percentage: number | null;
    compliantResponses: number;
    nonCompliantResponses: number;
    applicableResponses: number;
  };
  inspectionStatusDistribution: DashboardStatusDistributionItem[];
  recentInspections: DashboardRecentInspectionDto[];
}

export class DashboardService {
  constructor(private readonly repository: DashboardRepository = dashboardRepository) {}

  async getDashboard(userId: string, referenceDate = new Date()): Promise<Result<DashboardDto>> {
    try {
      const source = await this.repository.getOverview(
        userId,
        referenceDate,
        RECENT_INSPECTION_LIMIT,
      );

      return {
        success: true,
        data: this.toDashboardDto(source),
      };
    } catch (error) {
      return resultFromError(error);
    }
  }

  private toDashboardDto(source: DashboardOverviewSource): DashboardDto {
    const inspectionCountByStatus = new Map(
      source.inspectionStatusCounts.map((item) => [item.status, item.count]),
    );
    const responseCountByStatus = new Map(
      source.responseStatusCounts.map((item) => [item.status, item.count]),
    );
    const inspectionStatusDistribution = Object.values(InspectionStatus).map((status) => ({
      status,
      count: inspectionCountByStatus.get(status) ?? 0,
    }));
    const totalInspections = inspectionStatusDistribution.reduce(
      (total, item) => total + item.count,
      0,
    );
    const compliantResponses = responseCountByStatus.get(ResponseStatus.COMPLIANT) ?? 0;
    const nonCompliantResponses = responseCountByStatus.get(ResponseStatus.NON_COMPLIANT) ?? 0;
    const applicableResponses = compliantResponses + nonCompliantResponses;

    return {
      summary: {
        totalInspections,
        completedInspections: inspectionCountByStatus.get(InspectionStatus.COMPLETED) ?? 0,
        inProgressInspections: inspectionCountByStatus.get(InspectionStatus.IN_PROGRESS) ?? 0,
        plannedInspections: inspectionCountByStatus.get(InspectionStatus.PLANNED) ?? 0,
        cancelledInspections: inspectionCountByStatus.get(InspectionStatus.CANCELLED) ?? 0,
        totalNonConformities: source.totalNonConformities,
        openNonConformities: source.totalNonConformities - source.resolvedNonConformities,
        resolvedNonConformities: source.resolvedNonConformities,
        overdueNonConformities: source.overdueNonConformities,
        overdueCorrectiveActions: source.overdueCorrectiveActions,
      },
      compliance: {
        percentage:
          applicableResponses === 0
            ? null
            : Math.round((compliantResponses / applicableResponses) * 100),
        compliantResponses,
        nonCompliantResponses,
        applicableResponses,
      },
      inspectionStatusDistribution,
      recentInspections: source.recentInspections.map((inspection) => ({
        id: inspection.id,
        title: inspection.snapshot?.title ?? "Histórico indisponível",
        sourceVersionNumber: inspection.snapshot?.sourceVersionNumber ?? null,
        companyName: inspection.company.tradeName ?? inspection.company.corporateName,
        inspectorName: inspection.user.name,
        inspectionDate: inspection.inspectionDate,
        status: inspection.status,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
