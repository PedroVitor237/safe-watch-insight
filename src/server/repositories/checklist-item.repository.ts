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

  findByChecklistId(checklistId: string): Promise<ChecklistItem[]> {
    return prisma.checklistItem.findMany({
      where: { checklistId },
      orderBy: { orderIndex: "asc" },
    });
  }

  findById(id: string): Promise<ChecklistItem | null> {
    return prisma.checklistItem.findUnique({
      where: { id },
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

export const checklistItemRepository = new ChecklistItemRepository();
