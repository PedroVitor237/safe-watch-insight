import { createServerFn } from "@tanstack/react-start";

import { toServerResult } from "@/lib/api/server-result";

export const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { getAuthenticatedUser } = await import("@/server/auth/session");
  const userResult = await getAuthenticatedUser();

  if (!userResult.success) {
    return toServerResult<never>(userResult);
  }

  const { dashboardService } = await import("@/server/services/dashboard.service");

  return toServerResult(await dashboardService.getDashboard(userResult.data.id));
});
