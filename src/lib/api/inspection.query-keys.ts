import type { InspectionFiltersSchemaInput } from "@/server/schemas/inspection.schema";

export type InspectionQueryFilters = Partial<InspectionFiltersSchemaInput>;

export function getInspectionListFilters(
  filters: InspectionQueryFilters = {},
): InspectionFiltersSchemaInput {
  return {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
    sortOrder: filters.sortOrder ?? "desc",
    ...(filters.search === undefined ? {} : { search: filters.search }),
    ...(filters.sortBy === undefined ? {} : { sortBy: filters.sortBy }),
    ...(filters.userId === undefined ? {} : { userId: filters.userId }),
    ...(filters.companyId === undefined ? {} : { companyId: filters.companyId }),
    ...(filters.checklistId === undefined ? {} : { checklistId: filters.checklistId }),
    ...(filters.status === undefined ? {} : { status: filters.status }),
    ...(filters.syncStatus === undefined ? {} : { syncStatus: filters.syncStatus }),
  };
}

export const inspectionQueryKeys = {
  all: ["inspections"] as const,
  lists: () => [...inspectionQueryKeys.all, "list"] as const,
  list: (filters: InspectionQueryFilters = {}) =>
    [...inspectionQueryKeys.lists(), getInspectionListFilters(filters)] as const,
  details: () => [...inspectionQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...inspectionQueryKeys.details(), id] as const,
};
