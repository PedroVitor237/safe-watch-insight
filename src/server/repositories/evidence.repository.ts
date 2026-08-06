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

  createEvidence(input: CreateEvidencePersistenceInput): Promise<Evidence> {
    return prisma.evidence.create({
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
  }

  findActiveById(id: string): Promise<Evidence | null> {
    return prisma.evidence.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  listActive(target: EvidencePersistenceTarget): Promise<Evidence[]> {
    return prisma.evidence.findMany({
      where: {
        deletedAt: null,
        ...(target.inspectionId ? { inspectionId: target.inspectionId } : {}),
        ...(target.nonConformityId ? { nonConformityId: target.nonConformityId } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  softDelete(id: string): Promise<Evidence> {
    return prisma.evidence.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  restore(id: string): Promise<Evidence> {
    return prisma.evidence.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}

export const evidenceRepository = new EvidenceRepository();
