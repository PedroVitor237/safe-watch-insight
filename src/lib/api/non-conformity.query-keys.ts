import type { NonConformityFiltersSchemaInput } from "@/server/schemas/non-conformity.schema";

export type NonConformityQueryFilters = Partial<NonConformityFiltersSchemaInput>;

export function getNonConformityListFilters(
  filters: NonConformityQueryFilters,
): NonConformityFiltersSchemaInput {
  return {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 100,
    search: filters.search,
    sortBy: filters.sortBy ?? "createdAt",
    sortOrder: filters.sortOrder ?? "desc",
    status: filters.status,
    severity: filters.severity,
    companyId: filters.companyId,
    inspectionId: filters.inspectionId,
    standardId: filters.standardId,
  };
}

export const nonConformityQueryKeys = {
  all: ["non-conformities"] as const,
  lists: () => [...nonConformityQueryKeys.all, "list"] as const,
  list: (filters: NonConformityFiltersSchemaInput) =>
    [...nonConformityQueryKeys.lists(), filters] as const,
  details: () => [...nonConformityQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...nonConformityQueryKeys.details(), id] as const,
};
