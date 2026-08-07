import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listEvidence, removeEvidence, uploadEvidence } from "@/lib/api/evidence.functions";
import { evidenceQueryKeys } from "@/lib/api/evidence.query-keys";
import { inspectionQueryKeys } from "@/lib/api/inspection.query-keys";
import { nonConformityQueryKeys } from "@/lib/api/non-conformity.query-keys";
import type { EvidenceTargetSchemaInput } from "@/server/schemas/evidence.schema";

export interface UploadEvidenceVariables {
  target: EvidenceTargetSchemaInput;
  file: File;
  caption?: string;
}

async function invalidateEvidenceContext(
  queryClient: ReturnType<typeof useQueryClient>,
  target: EvidenceTargetSchemaInput,
) {
  const invalidations: Array<Promise<void>> = [
    queryClient.invalidateQueries({ queryKey: evidenceQueryKeys.list(target) }),
  ];

  if (target.inspectionId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: inspectionQueryKeys.detail(target.inspectionId) }),
    );
  }

  if (target.nonConformityId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: nonConformityQueryKeys.detail(target.nonConformityId),
      }),
    );
  }

  await Promise.all(invalidations);
}

export function useEvidence(
  target: EvidenceTargetSchemaInput,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: evidenceQueryKeys.list(target),
    queryFn: () => listEvidence({ data: target }),
    enabled: options.enabled ?? true,
  });
}

export function useUploadEvidence(target: EvidenceTargetSchemaInput) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ target: uploadTarget, file, caption }: UploadEvidenceVariables) => {
      const formData = new FormData();

      if (uploadTarget.inspectionId) {
        formData.set("inspectionId", uploadTarget.inspectionId);
      }

      if (uploadTarget.nonConformityId) {
        formData.set("nonConformityId", uploadTarget.nonConformityId);
      }

      if (caption?.trim()) {
        formData.set("caption", caption.trim());
      }

      formData.set("file", file);

      return uploadEvidence({ data: formData });
    },
    onSuccess: async (result) => {
      if (result.success) {
        await invalidateEvidenceContext(queryClient, target);
      }
    },
  });
}

export function useRemoveEvidence(target: EvidenceTargetSchemaInput) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeEvidence({ data: { id } }),
    onSuccess: async (result) => {
      if (result.success) {
        await invalidateEvidenceContext(queryClient, target);
      }
    },
  });
}
