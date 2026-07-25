import { createServerFn } from "@tanstack/react-start";

import { toServerResult } from "@/lib/api/server-result";
import { standardFiltersSchema, standardIdSchema } from "@/server/schemas/standard.schema";

async function getStandardService() {
  const { standardService } = await import("@/server/services/standard.service");

  return standardService;
}

async function ensureAuthenticated() {
  const { getAuthenticatedUser } = await import("@/server/auth/session");
  const userResult = await getAuthenticatedUser();

  return userResult.success ? null : toServerResult<never>(userResult);
}

export const getStandardById = createServerFn({ method: "POST" })
  .validator(standardIdSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getStandardService();

    return toServerResult(await service.getStandardById(data.id));
  });

export const listStandards = createServerFn({ method: "POST" })
  .validator(standardFiltersSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getStandardService();

    return toServerResult(await service.listStandards(data));
  });
