import {
  CorrectiveActionStatus,
  NonConformityStatus,
  type InspectionSnapshotIntegrityStatus,
  type InspectionSnapshotOrigin,
  type InspectionStatus,
  type ResponseStatus,
  type Severity,
  type StandardType,
  type UserRole,
} from "@/generated/prisma/client";
import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import {
  reportRepository,
  ReportRepository,
  type AvailableInspectionReportSource,
  type InspectionReportSource,
} from "@/server/repositories/report.repository";
import type { Result } from "@/server/responses";

import { BaseService } from "./base.service";

export interface ReportEvidenceDto {
  id: string;
  storageUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  caption: string | null;
  createdAt: Date;
}

export interface ReportCorrectiveActionDto {
  id: string;
  description: string;
  why: string | null;
  location: string | null;
  responsible: string | null;
  dueDate: Date | null;
  method: string | null;
  estimatedCost: string | null;
  status: CorrectiveActionStatus;
  completedAt: Date | null;
}

export interface ReportNonConformityDto {
  id: string;
  description: string;
  severity: Severity;
  dueDate: Date | null;
  status: NonConformityStatus;
  correctiveActions: ReportCorrectiveActionDto[];
  evidence: ReportEvidenceDto[];
}

export interface ReportItemDto {
  id: string;
  description: string;
  orderIndex: number;
  isRequired: boolean;
  standards: Array<{
    standardId: string;
    type: StandardType;
    code: string;
    title: string;
    summary: string | null;
    officialUrl: string | null;
  }>;
  response: {
    id: string;
    status: ResponseStatus;
    observation: string | null;
    updatedAt: Date;
  } | null;
  nonConformity: ReportNonConformityDto | null;
}

export interface InspectionReportDto {
  id: string;
  inspectionDate: Date;
  status: InspectionStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  company: {
    corporateName: string;
    tradeName: string | null;
    cnpj: string | null;
    cnae: string;
    riskLevel: number;
    employeeCount: number;
    address: string | null;
  };
  inspector: {
    name: string;
    email: string;
    role: UserRole;
  };
  snapshot: {
    id: string;
    title: string;
    description: string | null;
    sourceVersionNumber: number;
    snapshotSchemaVersion: number;
    origin: InspectionSnapshotOrigin;
    integrityStatus: InspectionSnapshotIntegrityStatus;
    capturedAt: Date;
  };
  summary: {
    totalItems: number;
    answeredItems: number;
    compliantItems: number;
    nonCompliantItems: number;
    notApplicableItems: number;
    pendingItems: number;
    completionPercentage: number;
  };
  items: ReportItemDto[];
  evidence: ReportEvidenceDto[];
}

export interface AvailableInspectionReportDto {
  id: string;
  inspectionDate: Date;
  status: InspectionStatus;
  companyName: string;
  title: string;
  sourceVersionNumber: number;
}

export class ReportService extends BaseService<ReportRepository> {
  constructor(repository: ReportRepository = reportRepository) {
    super(repository);
  }

  async getInspectionReport(
    inspectionId: string,
    userId: string,
  ): Promise<Result<InspectionReportDto>> {
    return this.execute(async () => {
      const inspection = await this.repository.findOwnedInspectionReport(inspectionId, userId);

      if (!inspection) {
        throw new NotFoundError("Relatório da inspeção não encontrado.");
      }

      if (!inspection.snapshot) {
        throw new ConflictError("O histórico desta inspeção não está disponível.");
      }

      return this.success(this.toReportDto(inspection));
    });
  }

  async listAvailableInspectionReports(
    userId: string,
  ): Promise<Result<AvailableInspectionReportDto[]>> {
    return this.execute(async () => {
      const inspections = await this.repository.listAvailableInspectionReports(userId);

      return this.success(
        inspections
          .filter(
            (
              inspection,
            ): inspection is AvailableInspectionReportSource & {
              snapshot: NonNullable<AvailableInspectionReportSource["snapshot"]>;
            } => inspection.snapshot !== null,
          )
          .map((inspection) => ({
            id: inspection.id,
            inspectionDate: inspection.inspectionDate,
            status: inspection.status,
            companyName: inspection.company.tradeName ?? inspection.company.corporateName,
            title: inspection.snapshot.title,
            sourceVersionNumber: inspection.snapshot.sourceVersionNumber,
          })),
      );
    });
  }

  private async execute<TData>(operation: () => Promise<Result<TData>>): Promise<Result<TData>> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError) {
        return this.failure(error);
      }

      throw error;
    }
  }

  private toReportDto(inspection: InspectionReportSource): InspectionReportDto {
    const snapshot = inspection.snapshot;

    if (!snapshot) {
      throw new ConflictError("O histórico desta inspeção não está disponível.");
    }

    const responseBySnapshotItemId = new Map(
      inspection.responses
        .filter(
          (response): response is typeof response & { snapshotItemId: string } =>
            response.snapshotItemId !== null,
        )
        .map((response) => [response.snapshotItemId, response]),
    );
    const items: ReportItemDto[] = snapshot.items.map((item) => {
      const response = responseBySnapshotItemId.get(item.id) ?? null;
      const activeNonConformity =
        response?.nonConformity && response.nonConformity.deletedAt === null
          ? response.nonConformity
          : null;

      return {
        id: item.id,
        description: item.description,
        orderIndex: item.orderIndex,
        isRequired: item.isRequired,
        standards: item.standards,
        response: response
          ? {
              id: response.id,
              status: response.status,
              observation: response.observation,
              updatedAt: response.updatedAt,
            }
          : null,
        nonConformity: activeNonConformity
          ? {
              id: activeNonConformity.id,
              description: activeNonConformity.description,
              severity: activeNonConformity.severity,
              dueDate: activeNonConformity.dueDate,
              status: this.resolveNonConformityStatus(
                activeNonConformity.status,
                activeNonConformity.dueDate,
              ),
              correctiveActions: activeNonConformity.correctiveActions.map((action) => ({
                id: action.id,
                description: action.description,
                why: action.why,
                location: action.location,
                responsible: action.responsible,
                dueDate: action.dueDate,
                method: action.method,
                estimatedCost: action.estimatedCost,
                status: this.resolveCorrectiveActionStatus(action.status, action.dueDate),
                completedAt: action.completedAt,
              })),
              evidence: activeNonConformity.evidence.map((evidence) =>
                this.toEvidenceDto(evidence),
              ),
            }
          : null,
      };
    });
    const answeredItems = items.filter((item) => item.response !== null).length;
    const compliantItems = items.filter((item) => item.response?.status === "COMPLIANT").length;
    const nonCompliantItems = items.filter(
      (item) => item.response?.status === "NON_COMPLIANT",
    ).length;
    const notApplicableItems = items.filter(
      (item) => item.response?.status === "NOT_APPLICABLE",
    ).length;

    return {
      id: inspection.id,
      inspectionDate: inspection.inspectionDate,
      status: inspection.status,
      notes: inspection.notes,
      createdAt: inspection.createdAt,
      updatedAt: inspection.updatedAt,
      company: inspection.company,
      inspector: inspection.user,
      snapshot: {
        id: snapshot.id,
        title: snapshot.title,
        description: snapshot.description,
        sourceVersionNumber: snapshot.sourceVersionNumber,
        snapshotSchemaVersion: snapshot.snapshotSchemaVersion,
        origin: snapshot.origin,
        integrityStatus: snapshot.integrityStatus,
        capturedAt: snapshot.capturedAt,
      },
      summary: {
        totalItems: items.length,
        answeredItems,
        compliantItems,
        nonCompliantItems,
        notApplicableItems,
        pendingItems: items.length - answeredItems,
        completionPercentage:
          items.length === 0 ? 0 : Math.round((answeredItems / items.length) * 100),
      },
      items,
      evidence: inspection.evidence.map((evidence) => this.toEvidenceDto(evidence)),
    };
  }

  private toEvidenceDto(evidence: InspectionReportSource["evidence"][number]): ReportEvidenceDto {
    return {
      ...evidence,
      fileSize: Number(evidence.fileSize),
    };
  }

  private resolveNonConformityStatus(
    status: NonConformityStatus,
    dueDate: Date | null,
  ): NonConformityStatus {
    if (
      dueDate &&
      dueDate.getTime() < Date.now() &&
      (status === NonConformityStatus.OPEN || status === NonConformityStatus.IN_PROGRESS)
    ) {
      return NonConformityStatus.OVERDUE;
    }

    return status;
  }

  private resolveCorrectiveActionStatus(
    status: CorrectiveActionStatus,
    dueDate: Date | null,
  ): CorrectiveActionStatus {
    if (
      dueDate &&
      dueDate.getTime() < Date.now() &&
      (status === CorrectiveActionStatus.PENDING || status === CorrectiveActionStatus.IN_PROGRESS)
    ) {
      return CorrectiveActionStatus.OVERDUE;
    }

    return status;
  }
}

export const reportService = new ReportService();
