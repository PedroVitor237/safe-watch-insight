import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createChecklistItem,
  deleteChecklistItem,
  listChecklistItems,
  updateChecklistItem,
} from "@/lib/api/checklist-item.functions";
import { checklistItemQueryKeys } from "@/lib/api/checklist-item.query-keys";
import { checklistQueryKeys } from "@/lib/api/checklist.query-keys";
import type {
  CreateChecklistItemSchemaInput,
  UpdateChecklistItemSchemaInput,
} from "@/server/schemas/checklist-item.schema";

export interface UseChecklistItemsOptions {
  enabled?: boolean;
}

export interface UpdateChecklistItemVariables {
  id: string;
  checklistId: string;
  data: UpdateChecklistItemSchemaInput;
}

export function useChecklistItems(
  checklistId: string,
  options: UseChecklistItemsOptions = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: checklistItemQueryKeys.list(checklistId),
    queryFn: () => listChecklistItems({ data: { checklistId } }),
    enabled: enabled && checklistId.length > 0,
  });
}

export function useCreateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChecklistItemSchemaInput) => createChecklistItem({ data }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: checklistItemQueryKeys.list(variables.checklistId),
        }),
        queryClient.invalidateQueries({
          queryKey: checklistQueryKeys.detail(variables.checklistId),
        }),
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() }),
      ]);
    },
  });
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateChecklistItemVariables) =>
      updateChecklistItem({ data: { id, data } }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: checklistItemQueryKeys.list(variables.checklistId),
        }),
        queryClient.invalidateQueries({
          queryKey: checklistQueryKeys.detail(variables.checklistId),
        }),
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() }),
      ]);
    },
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; checklistId: string }) =>
      deleteChecklistItem({ data: { id } }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: checklistItemQueryKeys.list(variables.checklistId),
        }),
        queryClient.invalidateQueries({
          queryKey: checklistQueryKeys.detail(variables.checklistId),
        }),
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() }),
      ]);
    },
  });
}
