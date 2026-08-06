import { createServerFn } from "@tanstack/react-start";

import { toServerResult } from "@/lib/api/server-result";
import {
  evidenceIdSchema,
  evidenceTargetSchema,
  parseEvidenceUploadFormData,
} from "@/server/schemas/evidence.schema";

async function getEvidenceService() {
  const { evidenceService } = await import("@/server/services/evidence.service");

  return evidenceService;
}

async function ensureAuthenticated() {
  const { getAuthenticatedUser } = await import("@/server/auth/session");
  const userResult = await getAuthenticatedUser();

  return userResult.success ? null : toServerResult<never>(userResult);
}

export const uploadEvidence = createServerFn({ method: "POST" })
  .validator((formData: FormData) => parseEvidenceUploadFormData(formData))
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getEvidenceService();

    return toServerResult(await service.uploadEvidence(data));
  });

export const listEvidence = createServerFn({ method: "POST" })
  .validator(evidenceTargetSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getEvidenceService();

    return toServerResult(await service.listEvidence(data));
  });

export const removeEvidence = createServerFn({ method: "POST" })
  .validator(evidenceIdSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getEvidenceService();

    return toServerResult(await service.removeEvidence(data.id));
  });
