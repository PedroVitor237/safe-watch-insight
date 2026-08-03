import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listChecklistVersions,
  publishChecklistVersion,
  retireChecklistVersion,
} from "@/lib/api/checklist-version.functions";
import { checklistVersionQueryKeys } from "@/lib/api/checklist-version.query-keys";
import { checklistItemQueryKeys } from "@/lib/api/checklist-item.query-keys";
import { checklistQueryKeys } from "@/lib/api/checklist.query-keys";

export function useChecklistVersions(checklistId: string) {
  return useQuery({
    queryKey: checklistVersionQueryKeys.list(checklistId),
    queryFn: () => listChecklistVersions({ data: { checklistId } }),
    enabled: checklistId.length > 0,
  });
}

export function usePublishChecklistVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checklistId: string) => publishChecklistVersion({ data: { checklistId } }),
    onSuccess: async (result, checklistId) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: checklistVersionQueryKeys.list(checklistId),
        }),
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.detail(checklistId) }),
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: checklistItemQueryKeys.list(checklistId),
        }),
      ]);
    },
  });
}

export function useRetireChecklistVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checklistId, versionId }: { checklistId: string; versionId: string }) =>
      retireChecklistVersion({ data: { checklistId, versionId } }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: checklistVersionQueryKeys.list(variables.checklistId),
        }),
        queryClient.invalidateQueries({
          queryKey: checklistQueryKeys.detail(variables.checklistId),
        }),
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() }),
      ]);
    },
  });
}
