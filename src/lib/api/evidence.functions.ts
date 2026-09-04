import { createServerFn } from "@tanstack/react-start";

import { toServerResult } from "@/lib/api/server-result";
import {
  evidenceIdSchema,
  evidenceTargetSchema,
  parseEvidenceUploadFormData,
} from "@/server/schemas/evidence.schema";
import type { Result } from "@/server/responses";
import type { SafeUser } from "@/server/services/user.service";

async function getEvidenceService() {
  const { evidenceService } = await import("@/server/services/evidence.service");

  return evidenceService;
}

async function getAuthenticatedUserResult(): Promise<Result<SafeUser>> {
  const { getAuthenticatedUser } = await import("@/server/auth/session");

  return getAuthenticatedUser();
}

export const uploadEvidence = createServerFn({ method: "POST" })
  .validator((formData: FormData) => parseEvidenceUploadFormData(formData))
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUserResult();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getEvidenceService();

    return toServerResult(await service.uploadEvidence(data, userResult.data.id));
  });

export const listEvidence = createServerFn({ method: "POST" })
  .validator(evidenceTargetSchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUserResult();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getEvidenceService();

    return toServerResult(await service.listEvidence(data, userResult.data.id));
  });

export const removeEvidence = createServerFn({ method: "POST" })
  .validator(evidenceIdSchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUserResult();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getEvidenceService();

    return toServerResult(await service.removeEvidence(data.id, userResult.data.id));
  });
