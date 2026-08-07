import type {
  Inspection,
  InspectionSnapshotIntegrityStatus,
  InspectionSnapshotOrigin,
  InspectionStatus,
  OfflineOperationType,
  Prisma,
  StandardType,
} from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import { paginate } from "@/server/responses/pagination";
import type { PaginatedResult, SortOrder } from "@/server/types";
import { getPaginationOffset, normalizePagination } from "@/server/utils/pagination.utils";

import { BaseRepository } from "./base.repository";
import { assertMatchingOfflineOperation } from "./offline-sync-operation";

const INSPECTION_SORT_FIELDS = {
  inspectionDate: "inspectionDate",
  status: "status",
  syncStatus: "syncStatus",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

const snapshotItemRelations = {
  standards: {
    orderBy: [{ type: "asc" }, { code: "asc" }],
  },
} satisfies Prisma.InspectionSnapshotItemInclude;

const inspectionRelations = {
  company: true,
  checklist: true,
  checklistVersion: true,
  snapshot: {
    include: {
      items: {
        orderBy: [{ orderIndex: "asc" }, { id: "asc" }],
        include: snapshotItemRelations,
      },
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  },
  responses: {
    include: {
      snapshotItem: {
        include: snapshotItemRelations,
      },
      checklistItem: true,
      nonConformity: true,
    },
  },
} satisfies Prisma.InspectionInclude;

export type InspectionWithRelations = Prisma.InspectionGetPayload<{
  include: typeof inspectionRelations;
}>;

export type InspectionSortField = keyof typeof INSPECTION_SORT_FIELDS;

export interface InspectionFindManyFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: InspectionSortField;
  sortOrder?: SortOrder;
  userId?: string;
  companyId?: string;
  checklistId?: string;
  status?: Prisma.EnumInspectionStatusFilter["equals"];
  syncStatus?: Prisma.EnumSyncStatusFilter["equals"];
  includeDeleted?: boolean;
}

export interface InspectionEvidenceContext {
  id: string;
  snapshot: {
    id: string;
  } | null;
}

export interface InspectionSnapshotStandardPersistenceInput {
  standardId: string;
  type: StandardType;
  code: string;
  title: string;
  summary: string | null;
  officialUrl: string | null;
}

export interface InspectionSnapshotItemPersistenceInput {
  sourceVersionItemId: string;
  sourceChecklistItemId: string | null;
  description: string;
  orderIndex: number;
  isRequired: boolean;
  standards: InspectionSnapshotStandardPersistenceInput[];
}

export interface CreateInspectionWithSnapshotPersistenceInput {
  id?: string;
  userId: string;
  companyId: string;
  checklistId: string;
  checklistVersionId: string;
  inspectionDate: Date;
  status: Prisma.InspectionCreateInput["status"];
  syncStatus: Prisma.InspectionCreateInput["syncStatus"];
  notes: string | null;
  snapshot: {
    sourceVersionNumber: number;
    title: string;
    description: string | null;
    isTemplate: boolean;
    snapshotSchemaVersion: number;
    contentHash: string;
    origin: InspectionSnapshotOrigin;
    integrityStatus: InspectionSnapshotIntegrityStatus;
    capturedAt: Date;
    items: InspectionSnapshotItemPersistenceInput[];
  };
}

export interface OfflineFinishOperationPersistenceInput {
  id: string;
  userId: string;
  type: OfflineOperationType;
  payloadHash: string;
  clientCreatedAt: Date;
}

export class InspectionRepository extends BaseRepository<
  Inspection,
  Prisma.InspectionCreateInput,
  Prisma.InspectionUpdateInput,
  Prisma.InspectionWhereUniqueInput,
  Prisma.InspectionFindManyArgs,
  Prisma.InspectionCountArgs
> {
  constructor() {
    super(prisma.inspection);
  }

  createWithRelations(data: Prisma.InspectionCreateInput): Promise<InspectionWithRelations> {
    return prisma.inspection.create({
      data,
      include: inspectionRelations,
    });
  }

  createWithSnapshot(
    input: CreateInspectionWithSnapshotPersistenceInput,
  ): Promise<InspectionWithRelations> {
    return prisma.$transaction(
      (transaction) =>
        transaction.inspection.create({
          data: {
            ...(input.id ? { id: input.id } : {}),
            inspectionDate: input.inspectionDate,
            status: input.status,
            syncStatus: input.syncStatus,
            notes: input.notes,
            user: {
              connect: { id: input.userId },
            },
            company: {
              connect: { id: input.companyId },
            },
            checklist: {
              connect: { id: input.checklistId },
            },
            checklistVersion: {
              connect: { id: input.checklistVersionId },
            },
            snapshot: {
              create: {
                sourceChecklist: {
                  connect: { id: input.checklistId },
                },
                sourceChecklistVersion: {
                  connect: { id: input.checklistVersionId },
                },
                sourceVersionNumber: input.snapshot.sourceVersionNumber,
                title: input.snapshot.title,
                description: input.snapshot.description,
                isTemplate: input.snapshot.isTemplate,
                snapshotSchemaVersion: input.snapshot.snapshotSchemaVersion,
                contentHash: input.snapshot.contentHash,
                origin: input.snapshot.origin,
                integrityStatus: input.snapshot.integrityStatus,
                capturedAt: input.snapshot.capturedAt,
                items: {
                  create: input.snapshot.items.map((item) => ({
                    sourceVersionItem: {
                      connect: { id: item.sourceVersionItemId },
                    },
                    ...(item.sourceChecklistItemId
                      ? {
                          sourceChecklistItem: {
                            connect: { id: item.sourceChecklistItemId },
                          },
                        }
                      : {}),
                    description: item.description,
                    orderIndex: item.orderIndex,
                    isRequired: item.isRequired,
                    standards: {
                      create: item.standards.map((standard) => ({
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
                  })),
                },
              },
            },
          },
          include: inspectionRelations,
        }),
      {
        maxWait: 10_000,
        timeout: 15_000,
      },
    );
  }

  findActiveById(id: string): Promise<InspectionWithRelations | null> {
    return prisma.inspection.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: inspectionRelations,
    });
  }

  findEvidenceContextById(id: string): Promise<InspectionEvidenceContext | null> {
    return prisma.inspection.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        snapshot: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  findManyPaginated(
    filters: InspectionFindManyFilters = {},
  ): Promise<PaginatedResult<InspectionWithRelations>> {
    const pagination = normalizePagination(filters.page, filters.pageSize);
    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder);

    return Promise.all([
      prisma.inspection.findMany({
        where,
        orderBy,
        skip: getPaginationOffset(pagination),
        take: pagination.pageSize,
        include: inspectionRelations,
      }),
      prisma.inspection.count({ where }),
    ]).then(([items, totalItems]) => paginate(items, totalItems, pagination));
  }

  softDelete(id: string): Promise<InspectionWithRelations> {
    return prisma.inspection.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: inspectionRelations,
    });
  }

  updateStatusIfCurrent(
    id: string,
    allowedStatuses: InspectionStatus[],
    status: InspectionStatus,
  ): Promise<InspectionWithRelations | null> {
    return prisma.$transaction(async (transaction) => {
      const update = await transaction.inspection.updateMany({
        where: {
          id,
          deletedAt: null,
          status: {
            in: allowedStatuses,
          },
        },
        data: { status },
      });

      if (update.count !== 1) {
        return null;
      }

      return transaction.inspection.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: inspectionRelations,
      });
    });
  }

  completeWithOfflineOperation(
    inspectionId: string,
    operation: OfflineFinishOperationPersistenceInput,
  ): Promise<InspectionWithRelations | null> {
    return prisma.$transaction(async (transaction) => {
      const completedOperation = await transaction.offlineSyncOperation.findUnique({
        where: { id: operation.id },
      });

      if (completedOperation) {
        assertMatchingOfflineOperation(completedOperation, {
          ...operation,
          inspectionId,
        });

        return transaction.inspection.findFirst({
          where: { id: inspectionId, userId: operation.userId, deletedAt: null },
          include: inspectionRelations,
        });
      }

      const update = await transaction.inspection.updateMany({
        where: {
          id: inspectionId,
          userId: operation.userId,
          deletedAt: null,
          status: { in: ["PLANNED", "IN_PROGRESS"] },
        },
        data: {
          status: "COMPLETED",
          syncStatus: "SYNCED",
        },
      });

      if (update.count !== 1) {
        return null;
      }

      await transaction.offlineSyncOperation.create({
        data: {
          id: operation.id,
          userId: operation.userId,
          inspectionId,
          type: operation.type,
          payloadHash: operation.payloadHash,
          clientCreatedAt: operation.clientCreatedAt,
        },
      });

      return transaction.inspection.findFirst({
        where: { id: inspectionId, userId: operation.userId, deletedAt: null },
        include: inspectionRelations,
      });
    });
  }

  private buildWhere(filters: InspectionFindManyFilters): Prisma.InspectionWhereInput {
    const conditions: Prisma.InspectionWhereInput[] = [];

    if (!filters.includeDeleted) {
      conditions.push({ deletedAt: null });
    }

    if (filters.userId) {
      conditions.push({ userId: filters.userId });
    }

    if (filters.companyId) {
      conditions.push({ companyId: filters.companyId });
    }

    if (filters.checklistId) {
      conditions.push({ checklistId: filters.checklistId });
    }

    if (filters.status) {
      conditions.push({ status: filters.status });
    }

    if (filters.syncStatus) {
      conditions.push({ syncStatus: filters.syncStatus });
    }

    const search = filters.search?.trim();
    if (search) {
      conditions.push({
        OR: [
          { notes: { contains: search, mode: "insensitive" } },
          { company: { corporateName: { contains: search, mode: "insensitive" } } },
          { company: { tradeName: { contains: search, mode: "insensitive" } } },
          { snapshot: { title: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    if (conditions.length === 0) {
      return {};
    }

    return conditions.length === 1 ? conditions[0] : { AND: conditions };
  }

  private buildOrderBy(
    sortBy?: InspectionSortField,
    sortOrder: SortOrder = "desc",
  ): Prisma.InspectionOrderByWithRelationInput {
    const field = sortBy && sortBy in INSPECTION_SORT_FIELDS ? sortBy : "inspectionDate";

    return { [field]: sortOrder };
  }
}

export const inspectionRepository = new InspectionRepository();
