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

async function getAuthenticatedUserResult() {
  const { getAuthenticatedUser } = await import("@/server/auth/session");
  const userResult = await getAuthenticatedUser();

  return userResult;
}

export const createCorrectiveAction = createServerFn({ method: "POST" })
  .validator(createCorrectiveActionSchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUserResult();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getCorrectiveActionService();

    return toServerResult(await service.createCorrectiveAction(data, userResult.data.id));
  });

export const listCorrectiveActions = createServerFn({ method: "POST" })
  .validator(correctiveActionsByNonConformitySchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUserResult();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getCorrectiveActionService();

    return toServerResult(
      await service.listCorrectiveActions(data.nonConformityId, userResult.data.id),
    );
  });

export const updateCorrectiveAction = createServerFn({ method: "POST" })
  .validator(updateCorrectiveActionInputSchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUserResult();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getCorrectiveActionService();

    return toServerResult(
      await service.updateCorrectiveAction(data.id, data.data, userResult.data.id),
    );
  });

export const deleteCorrectiveAction = createServerFn({ method: "POST" })
  .validator(correctiveActionIdSchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUserResult();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getCorrectiveActionService();

    return toServerResult(await service.deleteCorrectiveAction(data.id, userResult.data.id));
  });
