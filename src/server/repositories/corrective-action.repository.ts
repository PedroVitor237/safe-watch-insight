import type { CorrectiveAction, NonConformityStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

import { BaseRepository } from "./base.repository";

export interface NonConformityStatusTransition {
  id: string;
  from: NonConformityStatus;
  to: NonConformityStatus;
}

export class NonConformityStatePersistenceConflictError extends Error {
  constructor() {
    super("Non-conformity state changed during corrective action creation.");
    this.name = "NonConformityStatePersistenceConflictError";
  }
}

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

  createWithNonConformityTransition(
    data: Prisma.CorrectiveActionCreateInput,
    transition?: NonConformityStatusTransition,
  ): Promise<CorrectiveAction> {
    if (!transition) {
      return prisma.correctiveAction.create({ data });
    }

    return prisma.$transaction(async (transaction) => {
      const nonConformityUpdate = await transaction.nonConformity.updateMany({
        where: {
          id: transition.id,
          deletedAt: null,
          status: transition.from,
        },
        data: {
          status: transition.to,
        },
      });

      if (nonConformityUpdate.count !== 1) {
        throw new NonConformityStatePersistenceConflictError();
      }

      return transaction.correctiveAction.create({ data });
    });
  }

  findActiveById(id: string): Promise<CorrectiveAction | null> {
    return prisma.correctiveAction.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  findByNonConformityId(nonConformityId: string): Promise<CorrectiveAction[]> {
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
