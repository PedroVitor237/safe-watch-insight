import { useQuery } from "@tanstack/react-query";

import { getInspectionReport, listAvailableInspectionReports } from "@/lib/api/report.functions";
import { reportQueryKeys } from "@/lib/api/report.query-keys";

export function useAvailableInspectionReports() {
  return useQuery({
    queryKey: reportQueryKeys.available(),
    queryFn: () => listAvailableInspectionReports(),
  });
}

export function useInspectionReport(inspectionId: string) {
  return useQuery({
    queryKey: reportQueryKeys.detail(inspectionId),
    queryFn: () => getInspectionReport({ data: { inspectionId } }),
    enabled: inspectionId.length > 0,
  });
}
