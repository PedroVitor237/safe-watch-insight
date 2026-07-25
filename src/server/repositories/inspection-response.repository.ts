import type {
  InspectionResponse,
  NonConformityStatus,
  Prisma,
  Severity,
} from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

import { BaseRepository } from "./base.repository";

const inspectionResponseRelations = {
  checklistItem: {
    include: {
      standards: {
        include: {
          standard: true,
        },
      },
    },
  },
  nonConformity: true,
} satisfies Prisma.InspectionResponseInclude;

export type InspectionResponseWithRelations = Prisma.InspectionResponseGetPayload<{
  include: typeof inspectionResponseRelations;
}>;

export type NonConformityPersistenceDirective =
  | {
      action: "ensure";
      description: string;
      severity: Severity;
      dueDate: Date | null;
      status: NonConformityStatus;
    }
  | {
      action: "archive";
      archivedAt: Date;
    };

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

  saveWithNonConformity(
    inspectionId: string,
    checklistItemId: string,
    data: Pick<Prisma.InspectionResponseCreateInput, "status" | "observation">,
    nonConformity: NonConformityPersistenceDirective,
  ): Promise<InspectionResponseWithRelations> {
    return prisma.$transaction(
      async (transaction) => {
        const response = await transaction.inspectionResponse.upsert({
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
        });

        if (nonConformity.action === "ensure") {
          const existingNonConformity =
            await transaction.nonConformity.findUnique({
              where: { inspectionResponseId: response.id },
            });

          if (existingNonConformity) {
            await transaction.nonConformity.update({
              where: { id: existingNonConformity.id },
              data: {
                deletedAt: null,
                ...(existingNonConformity.deletedAt
                  ? { status: nonConformity.status }
                  : {}),
              },
            });
          } else {
            await transaction.nonConformity.create({
              data: {
                inspectionResponseId: response.id,
                description: nonConformity.description,
                severity: nonConformity.severity,
                dueDate: nonConformity.dueDate,
                status: nonConformity.status,
              },
            });
          }
        } else {
          await transaction.nonConformity.updateMany({
            where: {
              inspectionResponseId: response.id,
              deletedAt: null,
            },
            data: {
              deletedAt: nonConformity.archivedAt,
            },
          });
        }

        return transaction.inspectionResponse.findUniqueOrThrow({
          where: { id: response.id },
          include: inspectionResponseRelations,
        });
      },
      {
        maxWait: 10_000,
        timeout: 15_000,
      },
    );
  }
}

export const inspectionResponseRepository = new InspectionResponseRepository();
