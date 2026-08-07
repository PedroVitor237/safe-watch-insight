import type {
  InspectionStatus,
  InspectionResponse,
  NonConformityStatus,
  OfflineOperationType,
  Prisma,
  Severity,
} from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

import { BaseRepository } from "./base.repository";
import { InspectionResponseRevisionConflictError } from "./offline-sync.errors";
import { assertMatchingOfflineOperation } from "./offline-sync-operation";

const inspectionResponseRelations = {
  snapshotItem: {
    include: {
      standards: true,
    },
  },
  checklistItem: true,
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

export interface InspectionStatePersistenceDirective {
  allowedStatuses: InspectionStatus[];
  nextStatus: InspectionStatus;
}

export interface OfflineResponseOperationPersistenceInput {
  id: string;
  userId: string;
  type: OfflineOperationType;
  payloadHash: string;
  clientCreatedAt: Date;
  expectedResponseUpdatedAt: Date | null;
}

export class InspectionStatePersistenceConflictError extends Error {
  constructor() {
    super("Inspection is no longer editable.");
    this.name = "InspectionStatePersistenceConflictError";
  }
}

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
        snapshotItem: {
          orderIndex: "asc",
        },
      },
      include: inspectionResponseRelations,
    });
  }

  saveWithNonConformity(
    inspectionId: string,
    snapshotItemId: string,
    data: Pick<Prisma.InspectionResponseCreateInput, "status" | "observation"> & {
      clientUpdatedAt?: Date;
    },
    nonConformity: NonConformityPersistenceDirective,
    inspectionState: InspectionStatePersistenceDirective,
    offlineOperation?: OfflineResponseOperationPersistenceInput,
  ): Promise<InspectionResponseWithRelations> {
    return prisma.$transaction(
      async (transaction) => {
        if (offlineOperation) {
          const completedOperation = await transaction.offlineSyncOperation.findUnique({
            where: { id: offlineOperation.id },
          });

          if (completedOperation) {
            assertMatchingOfflineOperation(completedOperation, {
              ...offlineOperation,
              inspectionId,
            });

            return transaction.inspectionResponse.findUniqueOrThrow({
              where: {
                inspectionId_snapshotItemId: {
                  inspectionId,
                  snapshotItemId,
                },
              },
              include: inspectionResponseRelations,
            });
          }

          const currentResponse = await transaction.inspectionResponse.findUnique({
            where: {
              inspectionId_snapshotItemId: {
                inspectionId,
                snapshotItemId,
              },
            },
            select: { updatedAt: true },
          });
          const currentRevision = currentResponse?.updatedAt.getTime() ?? null;
          const expectedRevision = offlineOperation.expectedResponseUpdatedAt?.getTime() ?? null;

          if (currentRevision !== expectedRevision) {
            throw new InspectionResponseRevisionConflictError();
          }
        }

        const inspectionUpdate = await transaction.inspection.updateMany({
          where: {
            id: inspectionId,
            ...(offlineOperation ? { userId: offlineOperation.userId } : {}),
            deletedAt: null,
            status: {
              in: inspectionState.allowedStatuses,
            },
          },
          data: {
            status: inspectionState.nextStatus,
          },
        });

        if (inspectionUpdate.count !== 1) {
          throw new InspectionStatePersistenceConflictError();
        }

        const response = await transaction.inspectionResponse.upsert({
          where: {
            inspectionId_snapshotItemId: {
              inspectionId,
              snapshotItemId,
            },
          },
          create: {
            inspection: {
              connect: {
                id: inspectionId,
              },
            },
            snapshotItem: {
              connect: {
                id: snapshotItemId,
              },
            },
            status: data.status,
            observation: data.observation,
            ...(data.clientUpdatedAt ? { clientUpdatedAt: data.clientUpdatedAt } : {}),
          },
          update: {
            status: data.status,
            observation: data.observation,
            ...(data.clientUpdatedAt ? { clientUpdatedAt: data.clientUpdatedAt } : {}),
          },
        });

        if (nonConformity.action === "ensure") {
          const existingNonConformity = await transaction.nonConformity.findUnique({
            where: { inspectionResponseId: response.id },
          });

          if (existingNonConformity) {
            await transaction.nonConformity.update({
              where: { id: existingNonConformity.id },
              data: {
                deletedAt: null,
                ...(existingNonConformity.deletedAt ? { status: nonConformity.status } : {}),
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

        if (offlineOperation) {
          await transaction.offlineSyncOperation.create({
            data: {
              id: offlineOperation.id,
              userId: offlineOperation.userId,
              inspectionId,
              type: offlineOperation.type,
              payloadHash: offlineOperation.payloadHash,
              clientCreatedAt: offlineOperation.clientCreatedAt,
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
