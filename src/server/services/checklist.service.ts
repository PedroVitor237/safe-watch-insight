import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import { Prisma } from "@/generated/prisma/client";
import {
  checklistRepository,
  ChecklistRepository,
} from "@/server/repositories/checklist.repository";
import type { ChecklistFindManyFilters } from "@/server/repositories/checklist.repository";
import type { Result } from "@/server/responses";
import type { PaginatedResult } from "@/server/types";

import {
  CHECKLIST_CONTENT_SCHEMA_VERSION,
  createChecklistContentHash,
} from "@/server/utils/checklist-content-hash";

import { BaseService } from "./base.service";
import { checklistVersionService, ChecklistVersionService } from "./checklist-version.service";

type ChecklistEntity = NonNullable<Awaited<ReturnType<ChecklistRepository["findActiveById"]>>>;
type ChecklistView = ChecklistEntity & { canManage: boolean };
type ChecklistListEntity = Awaited<
  ReturnType<ChecklistRepository["findManyPaginated"]>
>["items"][number];
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
  constructor(
    repository: ChecklistRepository = checklistRepository,
    private readonly versionService: ChecklistVersionService = checklistVersionService,
  ) {
    super(repository);
  }

  async createChecklist(input: CreateChecklistInput): Promise<Result<ChecklistEntity>> {
    return this.execute(async () => {
      const checklist = await this.repository.createWithDraft(this.toCreateData(input), {
        title: input.title,
        description: input.description ?? null,
        createdById: input.createdById,
      });

      return this.success(checklist);
    });
  }

  async useOfficialTemplate(id: string, userId: string): Promise<Result<ChecklistEntity>> {
    return this.execute(async () => {
      const template = await this.repository.findVisibleById(id, userId);
      if (!template?.isOfficial || template.createdById !== null || !template.isActive) {
        throw new NotFoundError("Checklist not found.");
      }
      const source = template.versions.find((version) => version.status === "PUBLISHED");
      if (!source) throw new NotFoundError("Checklist version not found.");
      if (
        source.contentSchemaVersion !== CHECKLIST_CONTENT_SCHEMA_VERSION ||
        source.contentHash !== createChecklistContentHash(source)
      ) {
        throw new ConflictError("Published checklist content failed its integrity check.");
      }
      const checklist = await this.repository.createFromOfficialVersion(source.id, {
        title: `Meu checklist — ${source.title}`.slice(0, 255),
        description: `Cópia pessoal do template Safe Watch Insight, versão ${source.versionNumber}.\n\n${source.description ?? ""}`,
        createdById: userId,
        items: this.versionService.toDraftItems(source),
      });
      return this.success(checklist);
    });
  }

  async updateChecklist(
    id: string,
    input: UpdateChecklistInput,
    updatedById: string,
  ): Promise<Result<ChecklistEntity>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(id, updatedById);

      if (input.title !== undefined || input.description !== undefined) {
        await this.versionService.updateDraftAndChecklist(id, updatedById, input);
      } else {
        await this.repository.updateOwnedWithItems(id, updatedById, this.toUpdateData(input));
      }

      const checklist = await this.repository.findActiveOwnedById(id, updatedById);

      if (!checklist) {
        throw new NotFoundError("Checklist not found.");
      }

      return this.success(checklist);
    });
  }

  async deleteChecklist(id: string, userId: string): Promise<Result<ChecklistEntity>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(id, userId);

      const checklist = await this.repository.softDeleteOwned(id, userId);

      return this.success(checklist);
    });
  }

  async getChecklistById(id: string, userId: string): Promise<Result<ChecklistView>> {
    return this.execute(async () => {
      const checklist = await this.repository.findVisibleById(id, userId);

      if (!checklist) {
        throw new NotFoundError("Checklist not found.");
      }

      return this.success(
        checklist.createdById === userId && !checklist.isOfficial
          ? { ...checklist, canManage: true }
          : {
              ...checklist,
              canManage: false,
              title:
                checklist.versions.find((version) => version.status === "PUBLISHED")?.title ??
                checklist.title,
              description:
                checklist.versions.find((version) => version.status === "PUBLISHED")?.description ??
                null,
              versions: checklist.versions.filter((version) => version.status === "PUBLISHED"),
            },
      );
    });
  }

  async listChecklists(
    filters: ChecklistFindManyFilters = {},
    userId: string,
  ): Promise<Result<PaginatedResult<ChecklistListEntity & { canManage: boolean }>>> {
    return this.execute(async () => {
      const checklists = await this.repository.findManyPaginated({
        ...filters,
        includeDeleted: false,
        visibleToUserId: userId,
      });

      return this.success({
        ...checklists,
        items: checklists.items.map((checklist) =>
          checklist.createdById === userId && !checklist.isOfficial
            ? { ...checklist, canManage: true }
            : {
                ...checklist,
                canManage: false,
                title:
                  checklist.versions.find((version) => version.status === "PUBLISHED")?.title ??
                  checklist.title,
                description:
                  checklist.versions.find((version) => version.status === "PUBLISHED")
                    ?.description ?? null,
                versions: checklist.versions.filter((version) => version.status === "PUBLISHED"),
              },
        ),
      });
    });
  }

  private async execute<TData>(operation: () => Promise<Result<TData>>): Promise<Result<TData>> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError) {
        return this.failure(error);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return this.failure(new NotFoundError("Checklist not found."));
      }

      throw error;
    }
  }

  private async ensureChecklistExists(id: string, userId: string): Promise<ChecklistEntity> {
    const checklist = await this.repository.findActiveOwnedById(id, userId);

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
