import type { CompanyClientFiltersSchemaInput } from "@/server/schemas";

export type CompanyQueryFilters = Partial<CompanyClientFiltersSchemaInput>;

export function getCompanyListFilters(
  filters: CompanyQueryFilters = {},
): CompanyClientFiltersSchemaInput {
  return {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
    sortOrder: filters.sortOrder ?? "desc",
    ...(filters.search === undefined ? {} : { search: filters.search }),
    ...(filters.sortBy === undefined ? {} : { sortBy: filters.sortBy }),
  };
}

export const companyQueryKeys = {
  all: ["companies"] as const,
  lists: () => [...companyQueryKeys.all, "list"] as const,
  list: (filters: CompanyQueryFilters = {}) =>
    [...companyQueryKeys.lists(), getCompanyListFilters(filters)] as const,
  details: () => [...companyQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...companyQueryKeys.details(), id] as const,
};
