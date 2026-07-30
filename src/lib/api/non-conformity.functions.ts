import { createServerFn } from "@tanstack/react-start";

import { toServerResult } from "@/lib/api/server-result";
import {
  createNonConformitySchema,
  nonConformityFiltersSchema,
  nonConformityIdSchema,
  updateNonConformityInputSchema,
} from "@/server/schemas/non-conformity.schema";

async function getNonConformityService() {
  const { nonConformityService } = await import("@/server/services/non-conformity.service");

  return nonConformityService;
}

async function ensureAuthenticated() {
  const { getAuthenticatedUser } = await import("@/server/auth/session");
  const userResult = await getAuthenticatedUser();

  return userResult.success ? null : toServerResult<never>(userResult);
}

export const createNonConformity = createServerFn({ method: "POST" })
  .validator(createNonConformitySchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getNonConformityService();

    return toServerResult(await service.createNonConformity(data));
  });

export const getNonConformityById = createServerFn({ method: "POST" })
  .validator(nonConformityIdSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getNonConformityService();

    return toServerResult(await service.getNonConformityById(data.id));
  });

export const listNonConformities = createServerFn({ method: "POST" })
  .validator(nonConformityFiltersSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getNonConformityService();

    return toServerResult(await service.listNonConformities(data));
  });

export const updateNonConformity = createServerFn({ method: "POST" })
  .validator(updateNonConformityInputSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getNonConformityService();

    return toServerResult(await service.updateNonConformity(data.id, data.data));
  });

export const deleteNonConformity = createServerFn({ method: "POST" })
  .validator(nonConformityIdSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getNonConformityService();

    return toServerResult(await service.deleteNonConformity(data.id));
  });
