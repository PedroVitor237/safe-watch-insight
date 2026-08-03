import { createServerFn } from "@tanstack/react-start";

import { toServerResult } from "@/lib/api/server-result";
import {
  checklistVersionIdSchema,
  checklistVersionsByChecklistSchema,
  publishChecklistVersionSchema,
} from "@/server/schemas/checklist-version.schema";

async function getChecklistVersionService() {
  const { checklistVersionService } = await import("@/server/services/checklist-version.service");

  return checklistVersionService;
}

async function getAuthenticatedUser() {
  const { getAuthenticatedUser: loadAuthenticatedUser } = await import("@/server/auth/session");

  return loadAuthenticatedUser();
}

export const listChecklistVersions = createServerFn({ method: "POST" })
  .validator(checklistVersionsByChecklistSchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getChecklistVersionService();

    return toServerResult(await service.listVersions(data.checklistId));
  });

export const publishChecklistVersion = createServerFn({ method: "POST" })
  .validator(publishChecklistVersionSchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getChecklistVersionService();

    return toServerResult(await service.publishDraft(data.checklistId, userResult.data.id));
  });

export const retireChecklistVersion = createServerFn({ method: "POST" })
  .validator(checklistVersionIdSchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getChecklistVersionService();

    return toServerResult(await service.retireVersion(data.checklistId, data.versionId));
  });
