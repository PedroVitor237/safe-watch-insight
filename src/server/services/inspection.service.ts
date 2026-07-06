import type { InspectionStatus, SyncStatus } from "@/generated/prisma/client";
import { ApiError, NotFoundError } from "@/server/errors";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import { CompanyRepository } from "@/server/repositories/company.repository";
import {
  inspectionRepository,
  InspectionRepository,
  type InspectionFindManyFilters,
  type InspectionWithRelations,
} from "@/server/repositories/inspection.repository";
import type { Result } from "@/server/responses";
import type { PaginatedResult } from "@/server/types";

import { BaseService } from "./base.service";

type InspectionCreateData = Parameters<InspectionRepository["createWithRelations"]>[0];

export interface CreateInspectionInput {
  userId: string;
  companyId: string;
  checklistId: string;
  inspectionDate: Date;
  status?: InspectionStatus;
  syncStatus?: SyncStatus;
  notes?: string | null;
}

export class InspectionService extends BaseService<InspectionRepository> {
  constructor(
    repository: InspectionRepository = inspectionRepository,
    private readonly companyRepository = new CompanyRepository(),
    private readonly checklistRepository = new ChecklistRepository(),
  ) {
    super(repository);
  }

  async createInspection(input: CreateInspectionInput): Promise<Result<InspectionWithRelations>> {
    return this.execute(async () => {
      await this.ensureCompanyExists(input.companyId);
      await this.ensureChecklistExists(input.checklistId);

      const inspection = await this.repository.createWithRelations(this.toCreateData(input));

      return this.success(inspection);
    });
  }

  async getInspectionById(id: string): Promise<Result<InspectionWithRelations>> {
    return this.execute(async () => {
      const inspection = await this.repository.findActiveById(id);

      if (!inspection) {
        throw new NotFoundError("Inspection not found.");
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

  private async ensureChecklistExists(id: string): Promise<void> {
    const checklist = await this.checklistRepository.findActiveById(id);

    if (!checklist) {
      throw new NotFoundError("Checklist not found.");
    }
  }

  private toCreateData(input: CreateInspectionInput): InspectionCreateData {
    return {
      inspectionDate: input.inspectionDate,
      status: input.status,
      syncStatus: input.syncStatus,
      notes: input.notes,
      user: {
        connect: {
          id: input.userId,
        },
      },
      company: {
        connect: {
          id: input.companyId,
        },
      },
      checklist: {
        connect: {
          id: input.checklistId,
        },
      },
    };
  }
}

export const inspectionService = new InspectionService();
