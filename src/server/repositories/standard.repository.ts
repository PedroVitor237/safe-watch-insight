import type { Prisma, Standard } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import { paginate } from "@/server/responses/pagination";
import type { PaginatedResult, SortOrder } from "@/server/types";
import { getPaginationOffset, normalizePagination } from "@/server/utils/pagination.utils";

import { BaseRepository } from "./base.repository";

const STANDARD_SORT_FIELDS = {
  code: "code",
  title: "title",
  type: "type",
} as const;

export type StandardSortField = keyof typeof STANDARD_SORT_FIELDS;

export interface StandardFindManyFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: StandardSortField;
  sortOrder?: SortOrder;
  type?: Prisma.EnumStandardTypeFilter["equals"];
  isActive?: boolean;
}

export class StandardRepository extends BaseRepository<
  Standard,
  Prisma.StandardCreateInput,
  Prisma.StandardUpdateInput,
  Prisma.StandardWhereUniqueInput,
  Prisma.StandardFindManyArgs,
  Prisma.StandardCountArgs
> {
  constructor() {
    super(prisma.standard);
  }

  findActiveByIds(ids: string[]): Promise<Standard[]> {
    return prisma.standard.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
    });
  }

  findManyPaginated(
    filters: StandardFindManyFilters = {},
  ): Promise<PaginatedResult<Standard>> {
    const pagination = normalizePagination(filters.page, filters.pageSize);
    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder);

    return Promise.all([
      prisma.standard.findMany({
        where,
        orderBy,
        skip: getPaginationOffset(pagination),
        take: pagination.pageSize,
      }),
      prisma.standard.count({ where }),
    ]).then(([items, totalItems]) => paginate(items, totalItems, pagination));
  }

  private buildWhere(filters: StandardFindManyFilters): Prisma.StandardWhereInput {
    const search = filters.search?.trim();

    return {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" as const } },
              { title: { contains: search, mode: "insensitive" as const } },
              { summary: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
  }

  private buildOrderBy(
    sortBy?: StandardSortField,
    sortOrder: SortOrder = "asc",
  ): Prisma.StandardOrderByWithRelationInput {
    const field = sortBy && sortBy in STANDARD_SORT_FIELDS ? sortBy : "code";

    return { [field]: sortOrder };
  }
}

export const standardRepository = new StandardRepository();
