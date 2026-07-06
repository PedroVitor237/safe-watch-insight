import type { ChecklistFiltersSchemaInput } from "@/server/schemas/checklist.schema";

export type ChecklistQueryFilters = Partial<ChecklistFiltersSchemaInput>;

export function getChecklistListFilters(
  filters: ChecklistQueryFilters = {},
): ChecklistFiltersSchemaInput {
  return {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
    sortOrder: filters.sortOrder ?? "desc",
    ...(filters.search === undefined ? {} : { search: filters.search }),
    ...(filters.sortBy === undefined ? {} : { sortBy: filters.sortBy }),
    ...(filters.createdById === undefined ? {} : { createdById: filters.createdById }),
    ...(filters.isTemplate === undefined ? {} : { isTemplate: filters.isTemplate }),
    ...(filters.isActive === undefined ? {} : { isActive: filters.isActive }),
  };
}

export const checklistQueryKeys = {
  all: ["checklists"] as const,
  lists: () => [...checklistQueryKeys.all, "list"] as const,
  list: (filters: ChecklistQueryFilters = {}) =>
    [...checklistQueryKeys.lists(), getChecklistListFilters(filters)] as const,
  details: () => [...checklistQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...checklistQueryKeys.details(), id] as const,
};
