import { getInspectionById, listInspections } from "@/lib/api/inspection.functions";
import type { InspectionFiltersSchemaInput } from "@/server/schemas/inspection.schema";

import {
  cacheInspectionPackage,
  cacheInspectionPackages,
  getCachedInspection,
  getCachedInspectionPackagesForCurrentUser,
  hasPendingOperations,
} from "./inspection-store";
import type { OfflineInspection } from "./types";

type InspectionDetailResult = Awaited<ReturnType<typeof getInspectionById>>;
type InspectionListResult = Awaited<ReturnType<typeof listInspections>>;
type InspectionListData = Extract<InspectionListResult, { success: true }>["data"];

export async function getInspectionWithOfflineFallback(
  id: string,
): Promise<InspectionDetailResult> {
  if (typeof window === "undefined") {
    return getInspectionById({ data: { id } });
  }

  const localIsAuthoritative = await hasPendingOperations(id);
  if (!navigator.onLine || localIsAuthoritative) {
    return getCachedInspection(id);
  }

  try {
    const result = await getInspectionById({ data: { id } });
    if (result.success) {
      await cacheInspectionPackage(result.data);
    } else if (result.statusCode >= 500) {
      const cached = await getCachedInspection(id);
      if (cached.success) return cached;
    }

    return result;
  } catch {
    return getCachedInspection(id);
  }
}

export async function listInspectionsWithOfflineFallback(
  filters: InspectionFiltersSchemaInput,
): Promise<InspectionListResult> {
  if (typeof window === "undefined") {
    return listInspections({ data: filters });
  }

  if (!navigator.onLine) {
    return createLocalListResult(filters);
  }

  try {
    const result = await listInspections({ data: filters });
    if (!result.success) {
      if (result.statusCode >= 500) {
        return createLocalListResult(filters);
      }
      return result;
    }

    await cacheInspectionPackages(result.data.items);
    const localRecords = await getCachedInspectionPackagesForCurrentUser();
    const localById = new Map(
      localRecords
        .filter((record) => record.localSyncStatus !== "SYNCED")
        .map((record) => [record.inspectionId, record.inspection]),
    );

    return {
      success: true,
      data: {
        ...result.data,
        items: result.data.items.map((inspection) => localById.get(inspection.id) ?? inspection),
      },
    };
  } catch {
    return createLocalListResult(filters);
  }
}

async function createLocalListResult(
  filters: InspectionFiltersSchemaInput,
): Promise<InspectionListResult> {
  const records = await getCachedInspectionPackagesForCurrentUser();
  const filtered = records
    .map((record) => record.inspection)
    .filter((inspection) => matchesFilters(inspection, filters))
    .sort((left, right) => compareInspections(left, right, filters));
  const start = (filters.page - 1) * filters.pageSize;
  const items = filtered.slice(start, start + filters.pageSize);
  const data: InspectionListData = {
    items,
    page: filters.page,
    pageSize: filters.pageSize,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / filters.pageSize),
  };

  return { success: true, data };
}

function matchesFilters(
  inspection: OfflineInspection,
  filters: InspectionFiltersSchemaInput,
): boolean {
  if (filters.userId && inspection.userId !== filters.userId) return false;
  if (filters.companyId && inspection.companyId !== filters.companyId) return false;
  if (filters.checklistId && inspection.checklistId !== filters.checklistId) return false;
  if (filters.status && inspection.status !== filters.status) return false;
  if (filters.syncStatus && inspection.syncStatus !== filters.syncStatus) return false;

  const search = filters.search?.trim().toLocaleLowerCase("pt-BR");
  if (!search) return true;

  return [
    inspection.notes,
    inspection.company.corporateName,
    inspection.company.tradeName,
    inspection.snapshot?.title,
    inspection.user.name,
  ].some((value) => value?.toLocaleLowerCase("pt-BR").includes(search));
}

function compareInspections(
  left: OfflineInspection,
  right: OfflineInspection,
  filters: InspectionFiltersSchemaInput,
): number {
  const field = filters.sortBy ?? "inspectionDate";
  const direction = filters.sortOrder === "asc" ? 1 : -1;
  const leftValue = sortableValue(left[field]);
  const rightValue = sortableValue(right[field]);

  return leftValue.localeCompare(rightValue) * direction;
}

function sortableValue(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value);
}
