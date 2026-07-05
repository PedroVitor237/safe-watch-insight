import type { PaginatedResult, PaginationParams } from "@/server/types";

export function paginate<TItem>(
  items: TItem[],
  totalItems: number,
  params: PaginationParams,
): PaginatedResult<TItem> {
  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / params.pageSize),
  };
}
