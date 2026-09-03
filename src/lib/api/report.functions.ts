import { createServerFn } from "@tanstack/react-start";

import { toServerResult } from "@/lib/api/server-result";
import { inspectionReportIdSchema } from "@/server/schemas/report.schema";
import type { Result } from "@/server/responses";
import type { ReportService } from "@/server/services/report.service";
import type { SafeUser } from "@/server/services/user.service";

async function getReportService(): Promise<ReportService> {
  const { reportService } = await import("@/server/services/report.service");

  return reportService;
}

async function getAuthenticatedUserResult(): Promise<Result<SafeUser>> {
  const { getAuthenticatedUser } = await import("@/server/auth/session");

  return getAuthenticatedUser();
}

export const listAvailableInspectionReports = createServerFn({ method: "GET" }).handler(
  async () => {
    const userResult = await getAuthenticatedUserResult();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getReportService();

    return toServerResult(await service.listAvailableInspectionReports(userResult.data.id));
  },
);

export const getInspectionReport = createServerFn({ method: "POST" })
  .validator(inspectionReportIdSchema)
  .handler(async ({ data }) => {
    const userResult = await getAuthenticatedUserResult();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    const service = await getReportService();

    return toServerResult(await service.getInspectionReport(data.inspectionId, userResult.data.id));
  });
