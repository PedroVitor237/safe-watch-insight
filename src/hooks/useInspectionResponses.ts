import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listInspectionResponses } from "@/lib/api/inspection-response.functions";
import { inspectionResponseQueryKeys } from "@/lib/api/inspection-response.query-keys";
import { inspectionQueryKeys } from "@/lib/api/inspection.query-keys";
import { nonConformityQueryKeys } from "@/lib/api/non-conformity.query-keys";
import type { SaveInspectionResponseSchemaInput } from "@/server/schemas/inspection-response.schema";
import { queueInspectionFinish, queueInspectionResponse } from "@/offline/inspection-store";
import { synchronizeOfflineQueue } from "@/offline/sync-manager";

export interface UseInspectionResponsesOptions {
  enabled?: boolean;
}

export function useInspectionResponses(
  inspectionId: string,
  options: UseInspectionResponsesOptions = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: inspectionResponseQueryKeys.list(inspectionId),
    queryFn: () => listInspectionResponses({ data: { inspectionId } }),
    enabled: enabled && inspectionId.length > 0,
  });
}

export function useSaveInspectionResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async (data: SaveInspectionResponseSchemaInput) => {
      const result = await queueInspectionResponse(data);

      if (result.success && typeof navigator !== "undefined" && navigator.onLine) {
        void synchronizeOfflineQueue();
      }

      return result;
    },
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: inspectionResponseQueryKeys.list(variables.inspectionId),
        }),
        queryClient.invalidateQueries({
          queryKey: inspectionQueryKeys.detail(variables.inspectionId),
        }),
        queryClient.invalidateQueries({
          queryKey: inspectionQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.lists(),
        }),
      ]);
    },
  });
}

export function useFinishInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async (inspectionId: string) => {
      const result = await queueInspectionFinish(inspectionId);

      if (result.success && typeof navigator !== "undefined" && navigator.onLine) {
        void synchronizeOfflineQueue();
      }

      return result;
    },
    onSuccess: async (result, inspectionId) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inspectionQueryKeys.detail(inspectionId) }),
        queryClient.invalidateQueries({ queryKey: inspectionQueryKeys.lists() }),
      ]);
    },
  });
}
