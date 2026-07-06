import type { Inspection, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import { paginate } from "@/server/responses/pagination";
import type { PaginatedResult, SortOrder } from "@/server/types";
import { getPaginationOffset, normalizePagination } from "@/server/utils/pagination.utils";

import { BaseRepository } from "./base.repository";

const INSPECTION_SORT_FIELDS = {
  inspectionDate: "inspectionDate",
  status: "status",
  syncStatus: "syncStatus",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

const inspectionRelations = {
  company: true,
  checklist: true,
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

  findActiveById(id: string): Promise<InspectionWithRelations | null> {
    return prisma.inspection.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: inspectionRelations,
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
          { checklist: { title: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    if (conditions.length === 0) {
      return {};
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
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
