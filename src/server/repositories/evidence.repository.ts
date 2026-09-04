import type { Evidence, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

import { BaseRepository } from "./base.repository";

export interface EvidencePersistenceTarget {
  inspectionId?: string;
  nonConformityId?: string;
}

export interface CreateEvidencePersistenceInput extends EvidencePersistenceTarget {
  id: string;
  publicId: string;
  storageUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: bigint;
  width: number | null;
  height: number | null;
  caption: string | null;
}

function activeOwnedInspectionWhere(userId: string): Prisma.InspectionWhereInput {
  return {
    userId,
    deletedAt: null,
  };
}

function activeOwnedNonConformityWhere(userId: string): Prisma.NonConformityWhereInput {
  return {
    deletedAt: null,
    inspectionResponse: {
      inspection: activeOwnedInspectionWhere(userId),
    },
  };
}

export function buildActiveEvidenceOwnershipWhere(userId: string): Prisma.EvidenceWhereInput {
  return {
    OR: [
      {
        inspection: activeOwnedInspectionWhere(userId),
      },
      {
        nonConformity: activeOwnedNonConformityWhere(userId),
      },
    ],
  };
}

function buildActiveOwnedTargetWhere(
  target: EvidencePersistenceTarget,
  userId: string,
): Prisma.EvidenceWhereInput {
  return {
    deletedAt: null,
    ...buildActiveEvidenceOwnershipWhere(userId),
    ...(target.inspectionId ? { inspectionId: target.inspectionId } : {}),
    ...(target.nonConformityId ? { nonConformityId: target.nonConformityId } : {}),
  };
}

export class EvidenceRepository extends BaseRepository<
  Evidence,
  Prisma.EvidenceCreateInput,
  Prisma.EvidenceUpdateInput,
  Prisma.EvidenceWhereUniqueInput,
  Prisma.EvidenceFindManyArgs,
  Prisma.EvidenceCountArgs
> {
  constructor() {
    super(prisma.evidence);
  }

  createOwnedEvidence(
    input: CreateEvidencePersistenceInput,
    userId: string,
  ): Promise<Evidence | null> {
    return prisma.$transaction(async (transaction) => {
      const ownedTargetExists = input.inspectionId
        ? await transaction.inspection.findFirst({
            where: {
              id: input.inspectionId,
              ...activeOwnedInspectionWhere(userId),
            },
            select: { id: true },
          })
        : await transaction.nonConformity.findFirst({
            where: {
              id: input.nonConformityId,
              ...activeOwnedNonConformityWhere(userId),
            },
            select: { id: true },
          });

      if (!ownedTargetExists) {
        return null;
      }

      return transaction.evidence.create({
        data: {
          id: input.id,
          publicId: input.publicId,
          storageUrl: input.storageUrl,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          width: input.width,
          height: input.height,
          caption: input.caption,
          ...(input.inspectionId ? { inspection: { connect: { id: input.inspectionId } } } : {}),
          ...(input.nonConformityId
            ? { nonConformity: { connect: { id: input.nonConformityId } } }
            : {}),
        },
      });
    });
  }

  findActiveOwnedById(id: string, userId: string): Promise<Evidence | null> {
    return prisma.evidence.findFirst({
      where: {
        id,
        deletedAt: null,
        ...buildActiveEvidenceOwnershipWhere(userId),
      },
    });
  }

  listActiveOwned(target: EvidencePersistenceTarget, userId: string): Promise<Evidence[]> {
    return prisma.evidence.findMany({
      where: buildActiveOwnedTargetWhere(target, userId),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  softDeleteOwned(id: string, userId: string): Promise<Evidence | null> {
    const deletedAt = new Date();

    return prisma.$transaction(async (transaction) => {
      const update = await transaction.evidence.updateMany({
        where: {
          id,
          deletedAt: null,
          ...buildActiveEvidenceOwnershipWhere(userId),
        },
        data: { deletedAt },
      });

      if (update.count !== 1) {
        return null;
      }

      return transaction.evidence.findFirst({
        where: {
          id,
          deletedAt,
          ...buildActiveEvidenceOwnershipWhere(userId),
        },
      });
    });
  }

  restoreOwned(id: string, userId: string): Promise<Evidence | null> {
    return prisma.$transaction(async (transaction) => {
      const update = await transaction.evidence.updateMany({
        where: {
          id,
          deletedAt: { not: null },
          ...buildActiveEvidenceOwnershipWhere(userId),
        },
        data: { deletedAt: null },
      });

      if (update.count !== 1) {
        return null;
      }

      return transaction.evidence.findFirst({
        where: {
          id,
          deletedAt: null,
          ...buildActiveEvidenceOwnershipWhere(userId),
        },
      });
    });
  }
}

export const evidenceRepository = new EvidenceRepository();
