import type { InspectionResponse, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

import { BaseRepository } from "./base.repository";

const inspectionResponseRelations = {
  checklistItem: true,
} satisfies Prisma.InspectionResponseInclude;

export type InspectionResponseWithRelations = Prisma.InspectionResponseGetPayload<{
  include: typeof inspectionResponseRelations;
}>;

export class InspectionResponseRepository extends BaseRepository<
  InspectionResponse,
  Prisma.InspectionResponseCreateInput,
  Prisma.InspectionResponseUpdateInput,
  Prisma.InspectionResponseWhereUniqueInput,
  Prisma.InspectionResponseFindManyArgs,
  Prisma.InspectionResponseCountArgs
> {
  constructor() {
    super(prisma.inspectionResponse);
  }

  findByInspectionId(inspectionId: string): Promise<InspectionResponseWithRelations[]> {
    return prisma.inspectionResponse.findMany({
      where: { inspectionId },
      orderBy: {
        checklistItem: {
          orderIndex: "asc",
        },
      },
      include: inspectionResponseRelations,
    });
  }

  upsertByInspectionAndItem(
    inspectionId: string,
    checklistItemId: string,
    data: Pick<Prisma.InspectionResponseCreateInput, "status" | "observation">,
  ): Promise<InspectionResponseWithRelations> {
    return prisma.inspectionResponse.upsert({
      where: {
        inspectionId_checklistItemId: {
          inspectionId,
          checklistItemId,
        },
      },
      create: {
        inspection: {
          connect: {
            id: inspectionId,
          },
        },
        checklistItem: {
          connect: {
            id: checklistItemId,
          },
        },
        status: data.status,
        observation: data.observation,
      },
      update: {
        status: data.status,
        observation: data.observation,
      },
      include: inspectionResponseRelations,
    });
  }
}

export const inspectionResponseRepository = new InspectionResponseRepository();
