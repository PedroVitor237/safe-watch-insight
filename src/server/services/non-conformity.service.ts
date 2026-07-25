import {
  ResponseStatus,
  type NonConformityStatus,
  type Prisma,
  type Severity,
} from "@/generated/prisma/client";
import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import {
  nonConformityRepository,
  NonConformityRepository,
  type NonConformityFindManyFilters,
  type NonConformityWithRelations,
} from "@/server/repositories/non-conformity.repository";
import {
  inspectionResponseRepository,
  InspectionResponseRepository,
} from "@/server/repositories/inspection-response.repository";
import type { Result } from "@/server/responses";
import type { PaginatedResult } from "@/server/types";

import { BaseService } from "./base.service";

type NonConformityCreateData = Parameters<
  NonConformityRepository["createWithRelations"]
>[0];
type NonConformityUpdateData = Parameters<
  NonConformityRepository["updateWithRelations"]
>[1];

export interface CreateNonConformityInput {
  inspectionResponseId: string;
  description: string;
  severity: Severity;
  dueDate?: Date | null;
  status?: NonConformityStatus;
}

export interface UpdateNonConformityInput {
  description?: string;
  severity?: Severity;
  dueDate?: Date | null;
  status?: NonConformityStatus;
}

export class NonConformityService extends BaseService<NonConformityRepository> {
  constructor(
    repository: NonConformityRepository = nonConformityRepository,
    private readonly responseRepository: InspectionResponseRepository =
      inspectionResponseRepository,
  ) {
    super(repository);
  }

  async createNonConformity(
    input: CreateNonConformityInput,
  ): Promise<Result<NonConformityWithRelations>> {
    return this.execute(async () => {
      const response = await this.responseRepository.findById({
        id: input.inspectionResponseId,
      });

      if (!response) {
        throw new NotFoundError("Inspection response not found.");
      }

      if (response.status !== ResponseStatus.NON_COMPLIANT) {
        throw new ConflictError(
          "Only non-compliant inspection responses can generate a non-conformity.",
        );
      }

      const existing = await this.repository.findByInspectionResponseId(
        input.inspectionResponseId,
      );

      if (existing) {
        throw new ConflictError(
          "This inspection response already has a non-conformity.",
        );
      }

      const nonConformity = await this.repository.createWithRelations(
        this.toCreateData(input),
      );

      return this.success(nonConformity);
    });
  }

  async getNonConformityById(
    id: string,
  ): Promise<Result<NonConformityWithRelations>> {
    return this.execute(async () => {
      await this.repository.markOverdue(new Date());
      const nonConformity = await this.ensureNonConformityExists(id);

      return this.success(nonConformity);
    });
  }

  async listNonConformities(
    filters: NonConformityFindManyFilters = {},
  ): Promise<Result<PaginatedResult<NonConformityWithRelations>>> {
    return this.execute(async () => {
      await this.repository.markOverdue(new Date());
      const nonConformities = await this.repository.findManyPaginated({
        ...filters,
        includeDeleted: false,
      });

      return this.success(nonConformities);
    });
  }

  async updateNonConformity(
    id: string,
    input: UpdateNonConformityInput,
  ): Promise<Result<NonConformityWithRelations>> {
    return this.execute(async () => {
      await this.ensureNonConformityExists(id);
      const nonConformity = await this.repository.updateWithRelations(
        id,
        this.toUpdateData(input),
      );

      return this.success(nonConformity);
    });
  }

  async deleteNonConformity(
    id: string,
  ): Promise<Result<NonConformityWithRelations>> {
    return this.execute(async () => {
      await this.ensureNonConformityExists(id);
      const nonConformity = await this.repository.softDelete(id);

      return this.success(nonConformity);
    });
  }

  private async execute<TData>(
    operation: () => Promise<Result<TData>>,
  ): Promise<Result<TData>> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError) {
        return this.failure(error);
      }

      throw error;
    }
  }

  private async ensureNonConformityExists(
    id: string,
  ): Promise<NonConformityWithRelations> {
    const nonConformity = await this.repository.findActiveById(id);

    if (!nonConformity) {
      throw new NotFoundError("Non-conformity not found.");
    }

    return nonConformity;
  }

  private toCreateData(
    input: CreateNonConformityInput,
  ): NonConformityCreateData {
    return {
      description: input.description,
      severity: input.severity,
      dueDate: input.dueDate ?? null,
      status: input.status,
      inspectionResponse: {
        connect: {
          id: input.inspectionResponseId,
        },
      },
    };
  }

  private toUpdateData(
    input: UpdateNonConformityInput,
  ): NonConformityUpdateData {
    const data: Prisma.NonConformityUpdateInput = {
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.severity !== undefined ? { severity: input.severity } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    };

    return data;
  }
}

export const nonConformityService = new NonConformityService();
