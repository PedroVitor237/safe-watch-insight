import type { StandardFiltersSchemaInput } from "@/server/schemas/standard.schema";

export type StandardQueryFilters = Partial<StandardFiltersSchemaInput>;

export function getStandardListFilters(filters: StandardQueryFilters): StandardFiltersSchemaInput {
  return {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 100,
    search: filters.search,
    sortBy: filters.sortBy ?? "code",
    sortOrder: filters.sortOrder ?? "asc",
    type: filters.type,
    isActive: filters.isActive,
  };
}

export const standardQueryKeys = {
  all: ["standards"] as const,
  lists: () => [...standardQueryKeys.all, "list"] as const,
  list: (filters: StandardFiltersSchemaInput) => [...standardQueryKeys.lists(), filters] as const,
  details: () => [...standardQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...standardQueryKeys.details(), id] as const,
};
