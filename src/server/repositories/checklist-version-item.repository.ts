import { ChecklistVersionStatus, type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

import {
  ChecklistVersionPersistenceConflictError,
  checklistVersionItemRelations,
  type VersionStandardPersistenceInput,
} from "./checklist-version.repository";

const checklistVersionItemWithVersionRelations = {
  ...checklistVersionItemRelations,
  checklistVersion: true,
} satisfies Prisma.ChecklistVersionItemInclude;

export type ChecklistVersionItemWithStandards = Prisma.ChecklistVersionItemGetPayload<{
  include: typeof checklistVersionItemRelations;
}>;

export type ChecklistVersionItemWithVersion = Prisma.ChecklistVersionItemGetPayload<{
  include: typeof checklistVersionItemWithVersionRelations;
}>;

export interface CreateVersionItemPersistenceInput {
  checklistVersionId: string;
  description: string;
  orderIndex: number;
  isRequired: boolean;
  standards: VersionStandardPersistenceInput[];
}

export interface UpdateVersionItemPersistenceInput {
  description?: string;
  orderIndex?: number;
  isRequired?: boolean;
  standards?: VersionStandardPersistenceInput[];
}

export class ChecklistVersionItemRepository {
  findByVersionId(checklistVersionId: string): Promise<ChecklistVersionItemWithStandards[]> {
    return prisma.checklistVersionItem.findMany({
      where: { checklistVersionId },
      orderBy: [{ orderIndex: "asc" }, { id: "asc" }],
      include: checklistVersionItemRelations,
    });
  }

  findWithVersionById(id: string): Promise<ChecklistVersionItemWithVersion | null> {
    return prisma.checklistVersionItem.findUnique({
      where: { id },
      include: checklistVersionItemWithVersionRelations,
    });
  }

  findDerivedItem(
    checklistVersionId: string,
    sourceVersionItemId: string,
  ): Promise<ChecklistVersionItemWithVersion | null> {
    return prisma.checklistVersionItem.findFirst({
      where: {
        checklistVersionId,
        sourceVersionItemId,
      },
      include: checklistVersionItemWithVersionRelations,
    });
  }

  createInDraft(
    input: CreateVersionItemPersistenceInput,
  ): Promise<ChecklistVersionItemWithStandards> {
    return prisma.$transaction(async (transaction) => {
      await this.touchDraft(transaction, input.checklistVersionId);

      return transaction.checklistVersionItem.create({
        data: {
          checklistVersion: {
            connect: { id: input.checklistVersionId },
          },
          description: input.description,
          orderIndex: input.orderIndex,
          isRequired: input.isRequired,
          standards: {
            create: input.standards.map((standard) => ({
              standard: {
                connect: { id: standard.standardId },
              },
              type: standard.type,
              code: standard.code,
              title: standard.title,
              summary: standard.summary,
              officialUrl: standard.officialUrl,
            })),
          },
        },
        include: checklistVersionItemRelations,
      });
    });
  }

  updateInDraft(
    id: string,
    checklistVersionId: string,
    input: UpdateVersionItemPersistenceInput,
  ): Promise<ChecklistVersionItemWithStandards> {
    return prisma.$transaction(async (transaction) => {
      await this.touchDraft(transaction, checklistVersionId);

      const update = await transaction.checklistVersionItem.updateMany({
        where: {
          id,
          checklistVersionId,
        },
        data: {
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
          ...(input.isRequired !== undefined ? { isRequired: input.isRequired } : {}),
        },
      });

      if (update.count !== 1) {
        throw new ChecklistVersionPersistenceConflictError("Checklist draft item was not found.");
      }

      if (input.standards !== undefined) {
        await transaction.checklistVersionItemStandard.deleteMany({
          where: { checklistVersionItemId: id },
        });

        if (input.standards.length > 0) {
          await transaction.checklistVersionItemStandard.createMany({
            data: input.standards.map((standard) => ({
              checklistVersionItemId: id,
              standardId: standard.standardId,
              type: standard.type,
              code: standard.code,
              title: standard.title,
              summary: standard.summary,
              officialUrl: standard.officialUrl,
            })),
          });
        }
      }

      return transaction.checklistVersionItem.findUniqueOrThrow({
        where: { id },
        include: checklistVersionItemRelations,
      });
    });
  }

  deleteFromDraft(id: string, checklistVersionId: string): Promise<void> {
    return prisma.$transaction(async (transaction) => {
      await this.touchDraft(transaction, checklistVersionId);
      await transaction.checklistVersionItemStandard.deleteMany({
        where: { checklistVersionItemId: id },
      });
      const deletion = await transaction.checklistVersionItem.deleteMany({
        where: {
          id,
          checklistVersionId,
        },
      });

      if (deletion.count !== 1) {
        throw new ChecklistVersionPersistenceConflictError("Checklist draft item was not found.");
      }
    });
  }

  getNextOrderIndex(checklistVersionId: string): Promise<number> {
    return prisma.checklistVersionItem
      .aggregate({
        where: { checklistVersionId },
        _max: { orderIndex: true },
      })
      .then((result) => (result._max.orderIndex ?? 0) + 1);
  }

  private async touchDraft(
    transaction: Prisma.TransactionClient,
    checklistVersionId: string,
  ): Promise<void> {
    const update = await transaction.checklistVersion.updateMany({
      where: {
        id: checklistVersionId,
        status: ChecklistVersionStatus.DRAFT,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    if (update.count !== 1) {
      throw new ChecklistVersionPersistenceConflictError(
        "Only draft checklist items can be changed.",
      );
    }
  }
}

export const checklistVersionItemRepository = new ChecklistVersionItemRepository();
