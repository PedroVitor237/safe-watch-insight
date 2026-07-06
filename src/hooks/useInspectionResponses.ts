import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  finishInspection,
  listInspectionResponses,
  saveInspectionResponse,
} from "@/lib/api/inspection-response.functions";
import { inspectionResponseQueryKeys } from "@/lib/api/inspection-response.query-keys";
import { inspectionQueryKeys } from "@/lib/api/inspection.query-keys";
import type { SaveInspectionResponseSchemaInput } from "@/server/schemas/inspection-response.schema";

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
    mutationFn: (data: SaveInspectionResponseSchemaInput) => saveInspectionResponse({ data }),
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
      ]);
    },
  });
}

export function useFinishInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inspectionId: string) => finishInspection({ data: { inspectionId } }),
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
