import { ChecklistVersionStatus, Prisma } from "@/generated/prisma/client";
import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import {
  checklistVersionRepository,
  ChecklistVersionPersistenceConflictError,
  ChecklistVersionRepository,
  type ChecklistVersionWithItems,
  type VersionItemPersistenceInput,
} from "@/server/repositories/checklist-version.repository";
import type { Result } from "@/server/responses";
import {
  CHECKLIST_CONTENT_SCHEMA_VERSION,
  createChecklistContentHash,
} from "@/server/utils/checklist-content-hash";

import { BaseService } from "./base.service";

export class ChecklistVersionService extends BaseService<ChecklistVersionRepository> {
  constructor(
    repository: ChecklistVersionRepository = checklistVersionRepository,
    private readonly checklistRepository = new ChecklistRepository(),
  ) {
    super(repository);
  }

  async listVersions(checklistId: string): Promise<Result<ChecklistVersionWithItems[]>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(checklistId);
      const versions = await this.repository.listByChecklistId(checklistId);

      return this.success(versions);
    });
  }

  async publishDraft(
    checklistId: string,
    publishedById: string,
  ): Promise<Result<ChecklistVersionWithItems>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(checklistId);
      const draft = await this.repository.findDraftByChecklistId(checklistId);

      if (!draft) {
        throw new ConflictError("This checklist has no draft version to publish.");
      }

      const published = await this.repository.publishDraft(draft.id, {
        publishedById,
        publishedAt: new Date(),
        contentHash: createChecklistContentHash({
          title: draft.title,
          description: draft.description,
          items: draft.items.map((item) => ({
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
        }),
        contentSchemaVersion: CHECKLIST_CONTENT_SCHEMA_VERSION,
        expectedUpdatedAt: draft.updatedAt,
      });

      return this.success(published);
    });
  }

  async retireVersion(
    checklistId: string,
    versionId: string,
  ): Promise<Result<ChecklistVersionWithItems>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(checklistId);
      const version = await this.repository.findByIdWithItems(versionId);

      if (!version || version.checklistId !== checklistId) {
        throw new NotFoundError("Checklist version not found.");
      }

      if (version.status !== ChecklistVersionStatus.PUBLISHED) {
        throw new ConflictError("Only published checklist versions can be retired.");
      }

      const retired = await this.repository.retirePublished(versionId);

      return this.success(retired);
    });
  }

  async getOrCreateDraft(
    checklistId: string,
    createdById: string,
  ): Promise<ChecklistVersionWithItems> {
    const existingDraft = await this.repository.findDraftByChecklistId(checklistId);

    if (existingDraft) {
      return existingDraft;
    }

    const versions = await this.repository.listByChecklistId(checklistId);
    const source = versions.find(
      (version) =>
        version.status === ChecklistVersionStatus.PUBLISHED ||
        version.status === ChecklistVersionStatus.RETIRED,
    );

    if (!source) {
      throw new ConflictError("The checklist has no published version to use as a draft source.");
    }

    const nextVersionNumber = Math.max(...versions.map((version) => version.versionNumber)) + 1;

    try {
      return await this.repository.createDraft({
        checklistId,
        versionNumber: nextVersionNumber,
        title: source.title,
        description: source.description,
        createdById,
        items: this.toDraftItems(source),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const concurrentDraft = await this.repository.findDraftByChecklistId(checklistId);

        if (concurrentDraft) {
          return concurrentDraft;
        }
      }

      throw error;
    }
  }

  async updateDraftAndChecklist(
    checklistId: string,
    createdById: string,
    input: {
      title?: string;
      description?: string | null;
      isTemplate?: boolean;
      isActive?: boolean;
    },
  ): Promise<ChecklistVersionWithItems> {
    const draft = await this.getOrCreateDraft(checklistId, createdById);

    try {
      return await this.repository.updateDraftMetadataAndChecklist(
        checklistId,
        draft.id,
        {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
        },
        input,
      );
    } catch (error) {
      if (error instanceof ChecklistVersionPersistenceConflictError) {
        throw new ConflictError(error.message);
      }

      throw error;
    }
  }

  private toDraftItems(source: ChecklistVersionWithItems): VersionItemPersistenceInput[] {
    return source.items.map((item) => ({
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
    }));
  }

  private async ensureChecklistExists(id: string): Promise<void> {
    const checklist = await this.checklistRepository.findActiveById(id);

    if (!checklist) {
      throw new NotFoundError("Checklist not found.");
    }
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
        return this.failure(new ConflictError("Checklist version changed concurrently."));
      }

      throw error;
    }
  }
}

export const checklistVersionService = new ChecklistVersionService();
