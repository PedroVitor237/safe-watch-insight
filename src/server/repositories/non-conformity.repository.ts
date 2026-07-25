import type { NonConformity, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import { paginate } from "@/server/responses/pagination";
import type { PaginatedResult, SortOrder } from "@/server/types";
import { getPaginationOffset, normalizePagination } from "@/server/utils/pagination.utils";

import { BaseRepository } from "./base.repository";

const NON_CONFORMITY_SORT_FIELDS = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  dueDate: "dueDate",
  severity: "severity",
  status: "status",
} as const;

const nonConformityRelations = {
  inspectionResponse: {
    include: {
      checklistItem: {
        include: {
          standards: {
            include: {
              standard: true,
            },
          },
        },
      },
      inspection: {
        include: {
          company: true,
          checklist: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  },
  correctiveActions: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  evidence: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.NonConformityInclude;

export type NonConformityWithRelations = Prisma.NonConformityGetPayload<{
  include: typeof nonConformityRelations;
}>;

export type NonConformitySortField = keyof typeof NON_CONFORMITY_SORT_FIELDS;

export interface NonConformityFindManyFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: NonConformitySortField;
  sortOrder?: SortOrder;
  status?: Prisma.EnumNonConformityStatusFilter["equals"];
  severity?: Prisma.EnumSeverityFilter["equals"];
  companyId?: string;
  inspectionId?: string;
  standardId?: string;
  includeDeleted?: boolean;
}

export class NonConformityRepository extends BaseRepository<
  NonConformity,
  Prisma.NonConformityCreateInput,
  Prisma.NonConformityUpdateInput,
  Prisma.NonConformityWhereUniqueInput,
  Prisma.NonConformityFindManyArgs,
  Prisma.NonConformityCountArgs
> {
  constructor() {
    super(prisma.nonConformity);
  }

  createWithRelations(
    data: Prisma.NonConformityCreateInput,
  ): Promise<NonConformityWithRelations> {
    return prisma.nonConformity.create({
      data,
      include: nonConformityRelations,
    });
  }

  findActiveById(id: string): Promise<NonConformityWithRelations | null> {
    return prisma.nonConformity.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: nonConformityRelations,
    });
  }

  findByInspectionResponseId(
    inspectionResponseId: string,
  ): Promise<NonConformity | null> {
    return prisma.nonConformity.findUnique({
      where: { inspectionResponseId },
    });
  }

  findManyPaginated(
    filters: NonConformityFindManyFilters = {},
  ): Promise<PaginatedResult<NonConformityWithRelations>> {
    const pagination = normalizePagination(filters.page, filters.pageSize);
    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder);

    return Promise.all([
      prisma.nonConformity.findMany({
        where,
        orderBy,
        skip: getPaginationOffset(pagination),
        take: pagination.pageSize,
        include: nonConformityRelations,
      }),
      prisma.nonConformity.count({ where }),
    ]).then(([items, totalItems]) => paginate(items, totalItems, pagination));
  }

  updateWithRelations(
    id: string,
    data: Prisma.NonConformityUpdateInput,
  ): Promise<NonConformityWithRelations> {
    return prisma.nonConformity.update({
      where: { id },
      data,
      include: nonConformityRelations,
    });
  }

  softDelete(id: string): Promise<NonConformityWithRelations> {
    return this.updateWithRelations(id, { deletedAt: new Date() });
  }

  markOverdue(referenceDate: Date): Promise<number> {
    return prisma.nonConformity
      .updateMany({
        where: {
          deletedAt: null,
          dueDate: { lt: referenceDate },
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
        data: {
          status: "OVERDUE",
        },
      })
      .then((result) => result.count);
  }

  private buildWhere(
    filters: NonConformityFindManyFilters,
  ): Prisma.NonConformityWhereInput {
    const conditions: Prisma.NonConformityWhereInput[] = [];

    if (!filters.includeDeleted) {
      conditions.push({ deletedAt: null });
    }

    if (filters.status) {
      conditions.push({ status: filters.status });
    }

    if (filters.severity) {
      conditions.push({ severity: filters.severity });
    }

    if (filters.companyId) {
      conditions.push({
        inspectionResponse: {
          inspection: {
            companyId: filters.companyId,
          },
        },
      });
    }

    if (filters.inspectionId) {
      conditions.push({
        inspectionResponse: {
          inspectionId: filters.inspectionId,
        },
      });
    }

    if (filters.standardId) {
      conditions.push({
        inspectionResponse: {
          checklistItem: {
            standards: {
              some: {
                standardId: filters.standardId,
              },
            },
          },
        },
      });
    }

    const search = filters.search?.trim();
    if (search) {
      conditions.push({
        OR: [
          { description: { contains: search, mode: "insensitive" } },
          {
            inspectionResponse: {
              checklistItem: {
                description: { contains: search, mode: "insensitive" },
              },
            },
          },
          {
            inspectionResponse: {
              inspection: {
                company: {
                  corporateName: { contains: search, mode: "insensitive" },
                },
              },
            },
          },
          {
            inspectionResponse: {
              inspection: {
                company: {
                  tradeName: { contains: search, mode: "insensitive" },
                },
              },
            },
          },
        ],
      });
    }

    if (conditions.length === 0) {
      return {};
    }

    return conditions.length === 1 ? conditions[0] : { AND: conditions };
  }

  private buildOrderBy(
    sortBy?: NonConformitySortField,
    sortOrder: SortOrder = "desc",
  ): Prisma.NonConformityOrderByWithRelationInput {
    const field =
      sortBy && sortBy in NON_CONFORMITY_SORT_FIELDS ? sortBy : "createdAt";

    return { [field]: sortOrder };
  }
}

export const nonConformityRepository = new NonConformityRepository();
