import { ApiError, NotFoundError } from "@/server/errors";
import {
  checklistRepository,
  ChecklistRepository,
} from "@/server/repositories/checklist.repository";
import type { ChecklistFindManyFilters } from "@/server/repositories/checklist.repository";
import type { Result } from "@/server/responses";
import type { PaginatedResult } from "@/server/types";

import { BaseService } from "./base.service";

type ChecklistEntity = NonNullable<Awaited<ReturnType<ChecklistRepository["findActiveById"]>>>;
type ChecklistCreateData = Parameters<ChecklistRepository["create"]>[0];
type ChecklistUpdateData = Parameters<ChecklistRepository["update"]>[1];

export interface CreateChecklistInput {
  title: string;
  description?: string | null;
  isTemplate?: boolean;
  isActive?: boolean;
  createdById: string;
}

export interface UpdateChecklistInput {
  title?: string;
  description?: string | null;
  isTemplate?: boolean;
  isActive?: boolean;
}

export class ChecklistService extends BaseService<ChecklistRepository> {
  constructor(repository: ChecklistRepository = checklistRepository) {
    super(repository);
  }

  async createChecklist(input: CreateChecklistInput): Promise<Result<ChecklistEntity>> {
    return this.execute(async () => {
      const checklist = await this.repository.create(this.toCreateData(input));

      return this.success(checklist);
    });
  }

  async updateChecklist(id: string, input: UpdateChecklistInput): Promise<Result<ChecklistEntity>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(id);

      const checklist = await this.repository.update({ id }, this.toUpdateData(input));

      return this.success(checklist);
    });
  }

  async deleteChecklist(id: string): Promise<Result<ChecklistEntity>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(id);

      const checklist = await this.repository.softDelete(id);

      return this.success(checklist);
    });
  }

  async getChecklistById(id: string): Promise<Result<ChecklistEntity>> {
    return this.execute(async () => {
      const checklist = await this.repository.findActiveById(id);

      if (!checklist) {
        throw new NotFoundError("Checklist not found.");
      }

      return this.success(checklist);
    });
  }

  async listChecklists(
    filters: ChecklistFindManyFilters = {},
  ): Promise<Result<PaginatedResult<ChecklistEntity>>> {
    return this.execute(async () => {
      const checklists = await this.repository.findManyPaginated({
        ...filters,
        includeDeleted: false,
      });

      return this.success(checklists);
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

  private async ensureChecklistExists(id: string): Promise<ChecklistEntity> {
    const checklist = await this.repository.findActiveById(id);

    if (!checklist) {
      throw new NotFoundError("Checklist not found.");
    }

    return checklist;
  }

  private toCreateData(input: CreateChecklistInput): ChecklistCreateData {
    return {
      title: input.title,
      description: input.description,
      isTemplate: input.isTemplate ?? false,
      isActive: input.isActive ?? true,
      createdBy: {
        connect: {
          id: input.createdById,
        },
      },
    };
  }

  private toUpdateData(input: UpdateChecklistInput): ChecklistUpdateData {
    return {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.isTemplate !== undefined ? { isTemplate: input.isTemplate } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };
  }
}

export const checklistService = new ChecklistService();
