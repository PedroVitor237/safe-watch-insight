import {
  ChecklistVersionStatus,
  InspectionSnapshotIntegrityStatus,
  InspectionSnapshotOrigin,
  InspectionStatus,
  SyncStatus,
} from "@/generated/prisma/client";
import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import {
  checklistVersionRepository,
  ChecklistVersionRepository,
  type ChecklistVersionWithItems,
} from "@/server/repositories/checklist-version.repository";
import { CompanyRepository } from "@/server/repositories/company.repository";
import {
  inspectionRepository,
  InspectionRepository,
  type InspectionFindManyFilters,
  type InspectionWithRelations,
} from "@/server/repositories/inspection.repository";
import type { Result } from "@/server/responses";
import type { PaginatedResult } from "@/server/types";
import {
  CHECKLIST_CONTENT_SCHEMA_VERSION,
  createChecklistContentHash,
} from "@/server/utils/checklist-content-hash";

import { BaseService } from "./base.service";

type ChecklistEntity = NonNullable<Awaited<ReturnType<ChecklistRepository["findActiveById"]>>>;

export interface CreateInspectionInput {
  userId: string;
  companyId: string;
  checklistId: string;
  checklistVersionId?: string;
  inspectionDate: Date;
  notes?: string | null;
}

export class InspectionService extends BaseService<InspectionRepository> {
  constructor(
    repository: InspectionRepository = inspectionRepository,
    private readonly companyRepository = new CompanyRepository(),
    private readonly checklistRepository = new ChecklistRepository(),
    private readonly versionRepository: ChecklistVersionRepository = checklistVersionRepository,
  ) {
    super(repository);
  }

  async createInspection(input: CreateInspectionInput): Promise<Result<InspectionWithRelations>> {
    return this.execute(async () => {
      await this.ensureCompanyExists(input.companyId);
      const checklist = await this.ensureChecklistCanStartInspection(input.checklistId);
      const version = await this.resolvePublishedVersion(
        input.checklistId,
        input.checklistVersionId,
      );
      this.ensurePublishedContentIsValid(version);

      const inspection = await this.repository.createWithSnapshot({
        userId: input.userId,
        companyId: input.companyId,
        checklistId: input.checklistId,
        checklistVersionId: version.id,
        inspectionDate: input.inspectionDate,
        status: InspectionStatus.PLANNED,
        syncStatus: SyncStatus.SYNCED,
        notes: input.notes ?? null,
        snapshot: {
          sourceVersionNumber: version.versionNumber,
          title: version.title,
          description: version.description,
          isTemplate: checklist.isTemplate,
          snapshotSchemaVersion: version.contentSchemaVersion,
          contentHash: version.contentHash as string,
          origin: InspectionSnapshotOrigin.INSPECTION_CREATION,
          integrityStatus: InspectionSnapshotIntegrityStatus.VERIFIED,
          capturedAt: new Date(),
          items: version.items.map((item) => ({
            sourceVersionItemId: item.id,
            sourceChecklistItemId: item.sourceChecklistItemId,
            description: item.description,
            orderIndex: item.orderIndex,
            isRequired: item.isRequired,
            standards: item.standards.map((standard) => ({
              standardId: standard.standardId,
              type: standard.type,
              code: standard.code,
              title: standard.title,
              summary: standard.summary,
              officialUrl: standard.officialUrl,
            })),
          })),
        },
      });

      return this.success(inspection);
    });
  }

  async getInspectionById(id: string): Promise<Result<InspectionWithRelations>> {
    return this.execute(async () => {
      const inspection = await this.repository.findActiveById(id);

      if (!inspection) {
        throw new NotFoundError("Inspection not found.");
      }

      if (!inspection.snapshot || !inspection.checklistVersion) {
        throw new ConflictError("Inspection historical snapshot is unavailable.");
      }

      return this.success(inspection);
    });
  }

  async listInspections(
    filters: InspectionFindManyFilters = {},
  ): Promise<Result<PaginatedResult<InspectionWithRelations>>> {
    return this.execute(async () => {
      const inspections = await this.repository.findManyPaginated({
        ...filters,
        includeDeleted: false,
      });

      return this.success(inspections);
    });
  }

  async deleteInspection(id: string): Promise<Result<InspectionWithRelations>> {
    return this.execute(async () => {
      await this.ensureInspectionExists(id);

      const inspection = await this.repository.softDelete(id);

      return this.success(inspection);
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

  private async ensureInspectionExists(id: string): Promise<InspectionWithRelations> {
    const inspection = await this.repository.findActiveById(id);

    if (!inspection) {
      throw new NotFoundError("Inspection not found.");
    }

    return inspection;
  }

  private async ensureCompanyExists(id: string): Promise<void> {
    const company = await this.companyRepository.findActiveById(id);

    if (!company) {
      throw new NotFoundError("Company not found.");
    }
  }

  private async ensureChecklistCanStartInspection(id: string): Promise<ChecklistEntity> {
    const checklist = await this.checklistRepository.findActiveById(id);

    if (!checklist) {
      throw new NotFoundError("Checklist not found.");
    }

    if (!checklist.isActive) {
      throw new ConflictError("Inactive checklists cannot be used in new inspections.");
    }

    return checklist;
  }

  private async resolvePublishedVersion(
    checklistId: string,
    checklistVersionId?: string,
  ): Promise<ChecklistVersionWithItems> {
    const version = checklistVersionId
      ? await this.versionRepository.findByIdWithItems(checklistVersionId)
      : await this.versionRepository.findLatestPublishedByChecklistId(checklistId);

    if (!version || version.checklistId !== checklistId) {
      throw new NotFoundError("Published checklist version not found.");
    }

    if (version.status !== ChecklistVersionStatus.PUBLISHED) {
      throw new ConflictError("Only published checklist versions can start inspections.");
    }

    return version;
  }

  private ensurePublishedContentIsValid(version: ChecklistVersionWithItems): void {
    if (!version.contentHash) {
      throw new ConflictError("Published checklist version has no content hash.");
    }

    if (version.contentSchemaVersion !== CHECKLIST_CONTENT_SCHEMA_VERSION) {
      return;
    }

    const actualHash = createChecklistContentHash({
      title: version.title,
      description: version.description,
      items: version.items.map((item) => ({
        description: item.description,
        orderIndex: item.orderIndex,
        isRequired: item.isRequired,
        standards: item.standards.map((standard) => ({
          standardId: standard.standardId,
          type: standard.type,
          code: standard.code,
          title: standard.title,
          summary: standard.summary,
          officialUrl: standard.officialUrl,
        })),
      })),
    });

    if (actualHash !== version.contentHash) {
      throw new ConflictError("Published checklist version content hash is invalid.");
    }
  }
}

export const inspectionService = new InspectionService();
