import { createServerFn } from "@tanstack/react-start";

import { toServerResult } from "@/lib/api/server-result";
import {
  correctiveActionIdSchema,
  correctiveActionsByNonConformitySchema,
  createCorrectiveActionSchema,
  updateCorrectiveActionInputSchema,
} from "@/server/schemas/corrective-action.schema";

async function getCorrectiveActionService() {
  const { correctiveActionService } = await import("@/server/services/corrective-action.service");

  return correctiveActionService;
}

async function ensureAuthenticated() {
  const { getAuthenticatedUser } = await import("@/server/auth/session");
  const userResult = await getAuthenticatedUser();

  return userResult.success ? null : toServerResult<never>(userResult);
}

export const createCorrectiveAction = createServerFn({ method: "POST" })
  .validator(createCorrectiveActionSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getCorrectiveActionService();

    return toServerResult(await service.createCorrectiveAction(data));
  });

export const listCorrectiveActions = createServerFn({ method: "POST" })
  .validator(correctiveActionsByNonConformitySchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getCorrectiveActionService();

    return toServerResult(await service.listCorrectiveActions(data.nonConformityId));
  });

export const updateCorrectiveAction = createServerFn({ method: "POST" })
  .validator(updateCorrectiveActionInputSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getCorrectiveActionService();

    return toServerResult(await service.updateCorrectiveAction(data.id, data.data));
  });

export const deleteCorrectiveAction = createServerFn({ method: "POST" })
  .validator(correctiveActionIdSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getCorrectiveActionService();

    return toServerResult(await service.deleteCorrectiveAction(data.id));
  });
