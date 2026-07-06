import type { Checklist, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import { paginate } from "@/server/responses/pagination";
import type { PaginatedResult, SortOrder } from "@/server/types";
import { getPaginationOffset, normalizePagination } from "@/server/utils/pagination.utils";

import { BaseRepository } from "./base.repository";

const CHECKLIST_SORT_FIELDS = {
  title: "title",
  isTemplate: "isTemplate",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

export type ChecklistSortField = keyof typeof CHECKLIST_SORT_FIELDS;

export interface ChecklistFindManyFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: ChecklistSortField;
  sortOrder?: SortOrder;
  createdById?: string;
  isTemplate?: boolean;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export class ChecklistRepository extends BaseRepository<
  Checklist,
  Prisma.ChecklistCreateInput,
  Prisma.ChecklistUpdateInput,
  Prisma.ChecklistWhereUniqueInput,
  Prisma.ChecklistFindManyArgs,
  Prisma.ChecklistCountArgs
> {
  constructor() {
    super(prisma.checklist);
  }

  findActiveById(id: string): Promise<Checklist | null> {
    return prisma.checklist.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  findManyPaginated(filters: ChecklistFindManyFilters = {}): Promise<PaginatedResult<Checklist>> {
    const pagination = normalizePagination(filters.page, filters.pageSize);
    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder);

    return Promise.all([
      prisma.checklist.findMany({
        where,
        orderBy,
        skip: getPaginationOffset(pagination),
        take: pagination.pageSize,
      }),
      prisma.checklist.count({ where }),
    ]).then(([items, totalItems]) => paginate(items, totalItems, pagination));
  }

  softDelete(id: string): Promise<Checklist> {
    return prisma.checklist.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private buildWhere(filters: ChecklistFindManyFilters): Prisma.ChecklistWhereInput {
    const conditions: Prisma.ChecklistWhereInput[] = [];

    if (!filters.includeDeleted) {
      conditions.push({ deletedAt: null });
    }

    if (filters.createdById) {
      conditions.push({ createdById: filters.createdById });
    }

    if (filters.isTemplate !== undefined) {
      conditions.push({ isTemplate: filters.isTemplate });
    }

    if (filters.isActive !== undefined) {
      conditions.push({ isActive: filters.isActive });
    }

    const search = filters.search?.trim();
    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
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
    sortBy?: ChecklistSortField,
    sortOrder: SortOrder = "desc",
  ): Prisma.ChecklistOrderByWithRelationInput {
    const field = sortBy && sortBy in CHECKLIST_SORT_FIELDS ? sortBy : "createdAt";

    return { [field]: sortOrder };
  }
}

export const checklistRepository = new ChecklistRepository();
