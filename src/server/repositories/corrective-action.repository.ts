import type { CorrectiveAction, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

import { BaseRepository } from "./base.repository";

export class CorrectiveActionRepository extends BaseRepository<
  CorrectiveAction,
  Prisma.CorrectiveActionCreateInput,
  Prisma.CorrectiveActionUpdateInput,
  Prisma.CorrectiveActionWhereUniqueInput,
  Prisma.CorrectiveActionFindManyArgs,
  Prisma.CorrectiveActionCountArgs
> {
  constructor() {
    super(prisma.correctiveAction);
  }

  findActiveById(id: string): Promise<CorrectiveAction | null> {
    return prisma.correctiveAction.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  findByNonConformityId(
    nonConformityId: string,
  ): Promise<CorrectiveAction[]> {
    return prisma.correctiveAction.findMany({
      where: {
        nonConformityId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  softDelete(id: string): Promise<CorrectiveAction> {
    return prisma.correctiveAction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  markOverdue(referenceDate: Date): Promise<number> {
    return prisma.correctiveAction
      .updateMany({
        where: {
          deletedAt: null,
          dueDate: { lt: referenceDate },
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        data: {
          status: "OVERDUE",
        },
      })
      .then((result) => result.count);
  }
}

export const correctiveActionRepository = new CorrectiveActionRepository();
