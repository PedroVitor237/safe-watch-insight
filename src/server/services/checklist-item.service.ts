import { ChecklistVersionStatus, Prisma, type Standard } from "@/generated/prisma/client";
import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import {
  checklistVersionItemRepository,
  ChecklistVersionItemRepository,
  type ChecklistVersionItemWithStandards,
  type ChecklistVersionItemWithVersion,
} from "@/server/repositories/checklist-version-item.repository";
import {
  ChecklistVersionPersistenceConflictError,
  checklistVersionRepository,
  ChecklistVersionRepository,
  type VersionStandardPersistenceInput,
} from "@/server/repositories/checklist-version.repository";
import {
  standardRepository as defaultStandardRepository,
  StandardRepository,
} from "@/server/repositories/standard.repository";
import type { Result } from "@/server/responses";

import { BaseService } from "./base.service";
import { checklistVersionService, ChecklistVersionService } from "./checklist-version.service";

export interface CreateChecklistItemInput {
  checklistId: string;
  description: string;
  orderIndex?: number;
  isRequired?: boolean;
  standardIds?: string[];
  updatedById: string;
}

export interface UpdateChecklistItemInput {
  description?: string;
  orderIndex?: number;
  isRequired?: boolean;
  standardIds?: string[];
  updatedById: string;
}

export class ChecklistItemService extends BaseService<ChecklistVersionItemRepository> {
  constructor(
    repository: ChecklistVersionItemRepository = checklistVersionItemRepository,
    private readonly checklistRepository = new ChecklistRepository(),
    private readonly versionRepository: ChecklistVersionRepository = checklistVersionRepository,
    private readonly versionService: ChecklistVersionService = checklistVersionService,
    private readonly standardRepository: StandardRepository = defaultStandardRepository,
  ) {
    super(repository);
  }

  async createChecklistItem(
    input: CreateChecklistItemInput,
  ): Promise<Result<ChecklistVersionItemWithStandards>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(input.checklistId);
      const draft = await this.versionService.getOrCreateDraft(
        input.checklistId,
        input.updatedById,
      );
      const standards = await this.findStandards(input.standardIds);
      const orderIndex = input.orderIndex ?? (await this.repository.getNextOrderIndex(draft.id));
      const item = await this.repository.createInDraft({
        checklistVersionId: draft.id,
        description: input.description,
        orderIndex,
        isRequired: input.isRequired ?? true,
        standards: this.toPersistenceStandards(standards),
      });

      return this.success(item);
    });
  }

  async updateChecklistItem(
    id: string,
    input: UpdateChecklistItemInput,
  ): Promise<Result<ChecklistVersionItemWithStandards>> {
    return this.execute(async () => {
      const selectedItem = await this.ensureChecklistItemExists(id);
      const draftItem = await this.resolveDraftItem(selectedItem, input.updatedById);
      const standards =
        input.standardIds === undefined ? undefined : await this.findStandards(input.standardIds);
      const item = await this.repository.updateInDraft(draftItem.id, draftItem.checklistVersionId, {
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
        ...(input.isRequired !== undefined ? { isRequired: input.isRequired } : {}),
        ...(standards !== undefined ? { standards: this.toPersistenceStandards(standards) } : {}),
      });

      return this.success(item);
    });
  }

  async deleteChecklistItem(id: string, updatedById: string): Promise<Result<null>> {
    return this.execute(async () => {
      const selectedItem = await this.ensureChecklistItemExists(id);
      const draftItem = await this.resolveDraftItem(selectedItem, updatedById);

      await this.repository.deleteFromDraft(draftItem.id, draftItem.checklistVersionId);

      return this.success(null);
    });
  }

  async listChecklistItems(
    checklistId: string,
  ): Promise<Result<ChecklistVersionItemWithStandards[]>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(checklistId);
      const versions = await this.versionRepository.listByChecklistId(checklistId);
      const workingVersion =
        versions.find((version) => version.status === ChecklistVersionStatus.DRAFT) ??
        versions.find((version) => version.status === ChecklistVersionStatus.PUBLISHED) ??
        versions[0];

      if (!workingVersion) {
        throw new NotFoundError("Checklist version not found.");
      }

      return this.success(workingVersion.items);
    });
  }

  private async resolveDraftItem(
    selectedItem: ChecklistVersionItemWithVersion,
    updatedById: string,
  ): Promise<ChecklistVersionItemWithVersion> {
    if (selectedItem.checklistVersion.status === ChecklistVersionStatus.DRAFT) {
      return selectedItem;
    }

    const draft = await this.versionService.getOrCreateDraft(
      selectedItem.checklistVersion.checklistId,
      updatedById,
    );
    const derivedItem = await this.repository.findDerivedItem(draft.id, selectedItem.id);

    if (!derivedItem) {
      throw new ConflictError(
        "This item does not belong to the checklist's current editable version.",
      );
    }

    return derivedItem;
  }

  private async execute<TData>(operation: () => Promise<Result<TData>>): Promise<Result<TData>> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError) {
        return this.failure(error);
      }

      if (error instanceof ChecklistVersionPersistenceConflictError) {
        return this.failure(new ConflictError(error.message));
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return this.failure(
          new ConflictError("Another checklist item already uses this position."),
        );
      }

      throw error;
    }
  }

  private async ensureChecklistExists(id: string): Promise<void> {
    const checklist = await this.checklistRepository.findActiveById(id);

    if (!checklist) {
      throw new NotFoundError("Checklist not found.");
    }
  }

  private async ensureChecklistItemExists(id: string): Promise<ChecklistVersionItemWithVersion> {
    const item = await this.repository.findWithVersionById(id);

    if (!item) {
      throw new NotFoundError("Checklist item not found.");
    }

    return item;
  }

  private async findStandards(ids: string[] | undefined): Promise<Standard[]> {
    const normalizedIds = [...new Set(ids ?? [])];

    if (normalizedIds.length === 0) {
      return [];
    }

    const standards = await this.standardRepository.findActiveByIds(normalizedIds);

    if (standards.length !== normalizedIds.length) {
      throw new NotFoundError("One or more active standards were not found.");
    }

    return standards;
  }

  private toPersistenceStandards(standards: Standard[]): VersionStandardPersistenceInput[] {
    return standards.map((standard) => ({
      standardId: standard.id,
      type: standard.type,
      code: standard.code,
      title: standard.title,
      summary: standard.summary,
      officialUrl: standard.officialUrl,
    }));
  }
}

export const checklistItemService = new ChecklistItemService();
