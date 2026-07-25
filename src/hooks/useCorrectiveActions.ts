import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCorrectiveAction,
  deleteCorrectiveAction,
  listCorrectiveActions,
  updateCorrectiveAction,
} from "@/lib/api/corrective-action.functions";
import { correctiveActionQueryKeys } from "@/lib/api/corrective-action.query-keys";
import { nonConformityQueryKeys } from "@/lib/api/non-conformity.query-keys";
import type {
  CreateCorrectiveActionSchemaInput,
  UpdateCorrectiveActionSchemaInput,
} from "@/server/schemas/corrective-action.schema";

export function useCorrectiveActions(
  nonConformityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: correctiveActionQueryKeys.list(nonConformityId),
    queryFn: () =>
      listCorrectiveActions({ data: { nonConformityId } }),
    enabled: enabled && nonConformityId.length > 0,
  });
}

export function useCreateCorrectiveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCorrectiveActionSchemaInput) =>
      createCorrectiveAction({ data }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: correctiveActionQueryKeys.list(
            variables.nonConformityId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.detail(
            variables.nonConformityId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.lists(),
        }),
      ]);
    },
  });
}

export function useUpdateCorrectiveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      nonConformityId: _nonConformityId,
      data,
    }: {
      id: string;
      nonConformityId: string;
      data: UpdateCorrectiveActionSchemaInput;
    }) => updateCorrectiveAction({ data: { id, data } }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: correctiveActionQueryKeys.list(
            variables.nonConformityId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.detail(
            variables.nonConformityId,
          ),
        }),
      ]);
    },
  });
}

export function useDeleteCorrectiveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      nonConformityId: _nonConformityId,
    }: {
      id: string;
      nonConformityId: string;
    }) => deleteCorrectiveAction({ data: { id } }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: correctiveActionQueryKeys.list(
            variables.nonConformityId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: nonConformityQueryKeys.detail(
            variables.nonConformityId,
          ),
        }),
      ]);
    },
  });
}
