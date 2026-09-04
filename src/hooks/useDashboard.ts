import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "@/lib/api/dashboard.functions";
import { dashboardQueryKeys } from "@/lib/api/dashboard.query-keys";

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKeys.overview(),
    queryFn: () => getDashboard(),
  });
}
