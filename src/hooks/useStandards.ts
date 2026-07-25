import { useQuery } from "@tanstack/react-query";

import { getStandardById, listStandards } from "@/lib/api/standard.functions";
import {
  getStandardListFilters,
  standardQueryKeys,
  type StandardQueryFilters,
} from "@/lib/api/standard.query-keys";

export function useStandards(filters: StandardQueryFilters = {}) {
  const listFilters = getStandardListFilters(filters);

  return useQuery({
    queryKey: standardQueryKeys.list(listFilters),
    queryFn: () => listStandards({ data: listFilters }),
  });
}

export function useStandard(id: string, enabled = true) {
  return useQuery({
    queryKey: standardQueryKeys.detail(id),
    queryFn: () => getStandardById({ data: { id } }),
    enabled: enabled && id.length > 0,
  });
}
