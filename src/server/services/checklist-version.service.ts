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
  type ChecklistContentHashInput,
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

  async listVersions(
    checklistId: string,
    userId: string,
  ): Promise<Result<ChecklistVersionWithItems[]>> {
    return this.execute(async () => {
      const checklist = await this.checklistRepository.findVisibleById(checklistId, userId);
      if (!checklist) throw new NotFoundError("Checklist not found.");
      const versions = await this.repository.listByChecklistId(checklistId);

      return this.success(
        checklist.createdById === userId
          ? versions
          : versions.filter((version) => version.status === ChecklistVersionStatus.PUBLISHED),
      );
    });
  }

  async publishDraft(
    checklistId: string,
    publishedById: string,
  ): Promise<Result<ChecklistVersionWithItems>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(checklistId, publishedById);
      const draft = await this.repository.findDraftByChecklistId(checklistId);

      if (!draft) {
        throw new ConflictError("This checklist has no draft version to publish.");
      }

      const published = await this.repository.publishDraft(
        draft.id,
        {
          ...prepareChecklistPublication(draft, publishedById),
          expectedUpdatedAt: draft.updatedAt,
        },
        publishedById,
      );

      return this.success(published);
    });
  }

  async retireVersion(
    checklistId: string,
    versionId: string,
    userId: string,
  ): Promise<Result<ChecklistVersionWithItems>> {
    return this.execute(async () => {
      await this.ensureChecklistExists(checklistId, userId);
      const version = await this.repository.findByIdWithItems(versionId);

      if (!version || version.checklistId !== checklistId) {
        throw new NotFoundError("Checklist version not found.");
      }

      if (version.status !== ChecklistVersionStatus.PUBLISHED) {
        throw new ConflictError("Only published checklist versions can be retired.");
      }

      const retired = await this.repository.retirePublished(versionId, userId);

      return this.success(retired);
    });
  }

  async getOrCreateDraft(
    checklistId: string,
    createdById: string,
  ): Promise<ChecklistVersionWithItems> {
    await this.ensureChecklistExists(checklistId, createdById);
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
        createdById,
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

  toDraftItems(source: ChecklistVersionWithItems): VersionItemPersistenceInput[] {
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

  private async ensureChecklistExists(id: string, userId: string): Promise<void> {
    const checklist = await this.checklistRepository.findActiveOwnedById(id, userId);

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

// Platform bootstrap uses the same canonical content and publication metadata.
export function prepareChecklistPublication(
  content: ChecklistContentHashInput,
  publishedById: string | null,
) {
  return {
    publishedById,
    publishedAt: new Date(),
    contentHash: createChecklistContentHash(content),
    contentSchemaVersion: CHECKLIST_CONTENT_SCHEMA_VERSION,
  };
}
