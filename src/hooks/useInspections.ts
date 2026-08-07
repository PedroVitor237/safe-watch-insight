import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createInspection, deleteInspection } from "@/lib/api/inspection.functions";
import {
  getInspectionListFilters,
  inspectionQueryKeys,
  type InspectionQueryFilters,
} from "@/lib/api/inspection.query-keys";
import type { CreateInspectionSchemaInput } from "@/server/schemas/inspection.schema";
import {
  getInspectionWithOfflineFallback,
  listInspectionsWithOfflineFallback,
} from "@/offline/inspection-client";
import { cacheInspectionPackage } from "@/offline/inspection-store";

export interface UseInspectionOptions {
  enabled?: boolean;
}

export function useInspections(filters: InspectionQueryFilters = {}) {
  const listFilters = getInspectionListFilters(filters);

  return useQuery({
    queryKey: inspectionQueryKeys.list(listFilters),
    queryFn: () => listInspectionsWithOfflineFallback(listFilters),
  });
}

export function useInspection(id: string, options: UseInspectionOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: inspectionQueryKeys.detail(id),
    queryFn: () => getInspectionWithOfflineFallback(id),
    enabled: enabled && id.length > 0,
  });
}

export function useCreateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInspectionSchemaInput) => createInspection({ data }),
    onSuccess: async (result) => {
      if (!result.success) {
        return;
      }

      await cacheInspectionPackage(result.data);
      await queryClient.invalidateQueries({ queryKey: inspectionQueryKeys.lists() });
    },
  });
}

export function useDeleteInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInspection({ data: { id } }),
    onSuccess: async (result, id) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inspectionQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inspectionQueryKeys.detail(id) }),
      ]);
    },
  });
}
