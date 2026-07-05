import type { Company, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import type { PaginatedResult, SortOrder } from "@/server/types";
import { getPaginationOffset, normalizePagination } from "@/server/utils/pagination.utils";
import { paginate } from "@/server/responses/pagination";

import { BaseRepository } from "./base.repository";

const COMPANY_SORT_FIELDS = {
  corporateName: "corporateName",
  tradeName: "tradeName",
  cnae: "cnae",
  riskLevel: "riskLevel",
  employeeCount: "employeeCount",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

export type CompanySortField = keyof typeof COMPANY_SORT_FIELDS;

export interface CompanyFindManyFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: CompanySortField;
  sortOrder?: SortOrder;
  createdById?: string;
  includeDeleted?: boolean;
}

export class CompanyRepository extends BaseRepository<
  Company,
  Prisma.CompanyCreateInput,
  Prisma.CompanyUpdateInput,
  Prisma.CompanyWhereUniqueInput,
  Prisma.CompanyFindManyArgs,
  Prisma.CompanyCountArgs
> {
  constructor() {
    super(prisma.company);
  }

  findActiveById(id: string): Promise<Company | null> {
    return prisma.company.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  findActiveByCnpj(cnpj: string): Promise<Company | null> {
    return prisma.company.findFirst({
      where: {
        cnpj,
        deletedAt: null,
      },
    });
  }

  existsByCnpj(cnpj: string, excludeId?: string): Promise<boolean> {
    return prisma.company
      .count({
        where: {
          cnpj,
          deletedAt: null,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      })
      .then((total) => total > 0);
  }

  findManyPaginated(filters: CompanyFindManyFilters = {}): Promise<PaginatedResult<Company>> {
    const pagination = normalizePagination(filters.page, filters.pageSize);
    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder);

    return Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        skip: getPaginationOffset(pagination),
        take: pagination.pageSize,
      }),
      prisma.company.count({ where }),
    ]).then(([items, totalItems]) => paginate(items, totalItems, pagination));
  }

  countActive(filters: Omit<CompanyFindManyFilters, "page" | "pageSize" | "sortBy" | "sortOrder"> = {}): Promise<number> {
    return prisma.company.count({
      where: this.buildWhere(filters),
    });
  }

  softDelete(id: string): Promise<Company> {
    return prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private buildWhere(filters: CompanyFindManyFilters): Prisma.CompanyWhereInput {
    const conditions: Prisma.CompanyWhereInput[] = [];

    if (!filters.includeDeleted) {
      conditions.push({ deletedAt: null });
    }

    if (filters.createdById) {
      conditions.push({ createdById: filters.createdById });
    }

    const search = filters.search?.trim();
    if (search) {
      conditions.push({
        OR: [
          { corporateName: { contains: search, mode: "insensitive" } },
          { tradeName: { contains: search, mode: "insensitive" } },
          { cnpj: { contains: search, mode: "insensitive" } },
          { cnae: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
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
    sortBy?: CompanySortField,
    sortOrder: SortOrder = "desc",
  ): Prisma.CompanyOrderByWithRelationInput {
    const field = sortBy && sortBy in COMPANY_SORT_FIELDS ? sortBy : "createdAt";

    return { [field]: sortOrder };
  }
}

export const companyRepository = new CompanyRepository();
