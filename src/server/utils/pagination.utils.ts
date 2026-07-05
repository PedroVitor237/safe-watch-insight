import type { PaginationParams } from "@/server/types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function normalizePagination(page?: number, pageSize?: number): PaginationParams {
  const normalizedPage = page && page > 0 ? page : DEFAULT_PAGE;
  const requestedPageSize = pageSize && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;

  return {
    page: normalizedPage,
    pageSize: Math.min(requestedPageSize, MAX_PAGE_SIZE),
  };
}

export function getPaginationOffset(params: PaginationParams): number {
  return (params.page - 1) * params.pageSize;
}

