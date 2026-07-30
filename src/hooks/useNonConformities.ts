import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createNonConformity,
  deleteNonConformity,
  getNonConformityById,
  listNonConformities,
  updateNonConformity,
} from "@/lib/api/non-conformity.functions";
import {
  getNonConformityListFilters,
  nonConformityQueryKeys,
  type NonConformityQueryFilters,
} from "@/lib/api/non-conformity.query-keys";
import type {
  CreateNonConformitySchemaInput,
  UpdateNonConformitySchemaInput,
} from "@/server/schemas/non-conformity.schema";

export function useNonConformities(filters: NonConformityQueryFilters = {}) {
  const listFilters = getNonConformityListFilters(filters);

  return useQuery({
    queryKey: nonConformityQueryKeys.list(listFilters),
    queryFn: () => listNonConformities({ data: listFilters }),
  });
}

export function useNonConformity(id: string, enabled = true) {
  return useQuery({
    queryKey: nonConformityQueryKeys.detail(id),
    queryFn: () => getNonConformityById({ data: { id } }),
    enabled: enabled && id.length > 0,
  });
}

export function useCreateNonConformity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNonConformitySchemaInput) => createNonConformity({ data }),
    onSuccess: async (result) => {
      if (result.success) {
        await queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.lists(),
        });
      }
    },
  });
}

export function useUpdateNonConformity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNonConformitySchemaInput }) =>
      updateNonConformity({ data: { id, data } }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useDeleteNonConformity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNonConformity({ data: { id } }),
    onSuccess: async (result, id) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.detail(id),
        }),
      ]);
    },
  });
}
