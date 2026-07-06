import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createChecklist,
  deleteChecklist,
  getChecklistById,
  listChecklists,
  updateChecklist,
} from "@/lib/api/checklist.functions";
import {
  checklistQueryKeys,
  getChecklistListFilters,
  type ChecklistQueryFilters,
} from "@/lib/api/checklist.query-keys";
import type {
  CreateChecklistSchemaInput,
  UpdateChecklistSchemaInput,
} from "@/server/schemas/checklist.schema";

export interface UseChecklistOptions {
  enabled?: boolean;
}

export interface UpdateChecklistVariables {
  id: string;
  data: UpdateChecklistSchemaInput;
}

export function useChecklists(filters: ChecklistQueryFilters = {}) {
  const listFilters = getChecklistListFilters(filters);

  return useQuery({
    queryKey: checklistQueryKeys.list(listFilters),
    queryFn: () => listChecklists({ data: listFilters }),
  });
}

export function useChecklist(id: string, options: UseChecklistOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: checklistQueryKeys.detail(id),
    queryFn: () => getChecklistById({ data: { id } }),
    enabled: enabled && id.length > 0,
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChecklistSchemaInput) => createChecklist({ data }),
    onSuccess: async (result) => {
      if (!result.success) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() });
    },
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateChecklistVariables) => updateChecklist({ data: { id, data } }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.detail(variables.id) }),
      ]);
    },
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteChecklist({ data: { id } }),
    onSuccess: async (result, id) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: checklistQueryKeys.detail(id) }),
      ]);
    },
  });
}
