import type { ChecklistItem, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

import { BaseRepository } from "./base.repository";

export class ChecklistItemRepository extends BaseRepository<
  ChecklistItem,
  Prisma.ChecklistItemCreateInput,
  Prisma.ChecklistItemUpdateInput,
  Prisma.ChecklistItemWhereUniqueInput,
  Prisma.ChecklistItemFindManyArgs,
  Prisma.ChecklistItemCountArgs
> {
  constructor() {
    super(prisma.checklistItem);
  }

  findByChecklistId(checklistId: string): Promise<ChecklistItemWithStandards[]> {
    return prisma.checklistItem.findMany({
      where: { checklistId },
      orderBy: { orderIndex: "asc" },
      include: checklistItemRelations,
    });
  }

  findWithStandardsById(id: string): Promise<ChecklistItemWithStandards | null> {
    return prisma.checklistItem.findUnique({
      where: { id },
      include: checklistItemRelations,
    });
  }

  createWithStandards(
    data: Prisma.ChecklistItemCreateInput,
    standardIds: string[],
  ): Promise<ChecklistItemWithStandards> {
    return prisma.checklistItem.create({
      data: {
        ...data,
        standards: {
          create: standardIds.map((standardId) => ({
            standard: { connect: { id: standardId } },
          })),
        },
      },
      include: checklistItemRelations,
    });
  }

  updateWithStandards(
    id: string,
    data: Prisma.ChecklistItemUpdateInput,
    standardIds?: string[],
  ): Promise<ChecklistItemWithStandards> {
    return prisma.checklistItem.update({
      where: { id },
      data: {
        ...data,
        ...(standardIds
          ? {
              standards: {
                deleteMany: {},
                create: standardIds.map((standardId) => ({
                  standard: { connect: { id: standardId } },
                })),
              },
            }
          : {}),
      },
      include: checklistItemRelations,
    });
  }

  getNextOrderIndex(checklistId: string): Promise<number> {
    return prisma.checklistItem
      .aggregate({
        where: { checklistId },
        _max: { orderIndex: true },
      })
      .then((result) => (result._max.orderIndex ?? 0) + 1);
  }

  countResponses(id: string): Promise<number> {
    return prisma.inspectionResponse.count({
      where: { checklistItemId: id },
    });
  }

  deleteById(id: string): Promise<ChecklistItem> {
    return prisma.checklistItem.delete({
      where: { id },
    });
  }
}

const checklistItemRelations = {
  standards: {
    include: {
      standard: true,
    },
  },
} satisfies Prisma.ChecklistItemInclude;

export type ChecklistItemWithStandards = Prisma.ChecklistItemGetPayload<{
  include: typeof checklistItemRelations;
}>;

export const checklistItemRepository = new ChecklistItemRepository();
