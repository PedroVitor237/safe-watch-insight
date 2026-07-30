import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import {
  checklistItemRepository,
  ChecklistItemRepository,
} from "@/server/repositories/checklist-item.repository";
import {
  standardRepository as defaultStandardRepository,
  StandardRepository,
} from "@/server/repositories/standard.repository";
import type { Result } from "@/server/responses";

import { BaseService } from "./base.service";

type ChecklistItemEntity = NonNullable<
  Awaited<ReturnType<ChecklistItemRepository["findWithStandardsById"]>>
>;
type DeletedChecklistItemEntity = Awaited<ReturnType<ChecklistItemRepository["deleteById"]>>;
type ChecklistItemCreateData = Parameters<ChecklistItemRepository["create"]>[0];
type ChecklistItemUpdateData = Parameters<ChecklistItemRepository["update"]>[1];

export interface CreateChecklistItemInput {
  checklistId: string;
  description: string;
  orderIndex?: number;
  isRequired?: boolean;
  standardIds?: string[];
}

export interface UpdateChecklistItemInput {
  description?: string;
  orderIndex?: number;
  isRequired?: boolean;
  standardIds?: string[];
}

export class ChecklistItemService extends BaseService<ChecklistItemRepository> {
  constructor(
    repository: ChecklistItemRepository = checklistItemRepository,
    private readonly checklistRepository = new ChecklistRepository(),
    private readonly standardRepository: StandardRepository = defaultStandardRepository,
  ) {
    super(repository);
  }

  async createChecklistItem(input: CreateChecklistItemInput): Promise<Result<ChecklistItemEntity>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(input.checklistId);
      const standardIds = this.normalizeStandardIds(input.standardIds);
      await this.ensureStandardsExist(standardIds);

      const orderIndex =
        input.orderIndex ?? (await this.repository.getNextOrderIndex(input.checklistId));
      const item = await this.repository.createWithStandards(
        this.toCreateData(input, orderIndex),
        standardIds,
      );

      return this.success(item);
    });
  }

  async updateChecklistItem(
    id: string,
    input: UpdateChecklistItemInput,
  ): Promise<Result<ChecklistItemEntity>> {
    return this.execute(async () => {
      await this.ensureChecklistItemExists(id);
      const standardIds =
        input.standardIds === undefined ? undefined : this.normalizeStandardIds(input.standardIds);
      await this.ensureStandardsExist(standardIds ?? []);

      const item = await this.repository.updateWithStandards(
        id,
        this.toUpdateData(input),
        standardIds,
      );

      return this.success(item);
    });
  }

  async deleteChecklistItem(id: string): Promise<Result<DeletedChecklistItemEntity>> {
    return this.execute(async () => {
      await this.ensureChecklistItemExists(id);

      const responseCount = await this.repository.countResponses(id);

      if (responseCount > 0) {
        throw new ConflictError("Checklist item already has inspection responses.");
      }

      const item = await this.repository.deleteById(id);

      return this.success(item);
    });
  }

  async listChecklistItems(checklistId: string): Promise<Result<ChecklistItemEntity[]>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(checklistId);

      const items = await this.repository.findByChecklistId(checklistId);

      return this.success(items);
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

  private async ensureChecklistExists(id: string): Promise<void> {
    const checklist = await this.checklistRepository.findActiveById(id);

    if (!checklist) {
      throw new NotFoundError("Checklist not found.");
    }
  }

  private async ensureChecklistItemExists(id: string): Promise<ChecklistItemEntity> {
    const item = await this.repository.findWithStandardsById(id);

    if (!item) {
      throw new NotFoundError("Checklist item not found.");
    }

    return item;
  }

  private async ensureStandardsExist(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const standards = await this.standardRepository.findActiveByIds(ids);

    if (standards.length !== ids.length) {
      throw new NotFoundError("One or more active standards were not found.");
    }
  }

  private normalizeStandardIds(ids: string[] | undefined): string[] {
    return [...new Set(ids ?? [])];
  }

  private toCreateData(
    input: CreateChecklistItemInput,
    orderIndex: number,
  ): ChecklistItemCreateData {
    return {
      description: input.description,
      orderIndex,
      isRequired: input.isRequired ?? true,
      checklist: {
        connect: {
          id: input.checklistId,
        },
      },
    };
  }

  private toUpdateData(input: UpdateChecklistItemInput): ChecklistItemUpdateData {
    return {
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
      ...(input.isRequired !== undefined ? { isRequired: input.isRequired } : {}),
    };
  }
}

export const checklistItemService = new ChecklistItemService();
