export type EntityId = string;

export type SortOrder = "asc" | "desc";

export interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteFields {
  deletedAt: Date | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export type MaybePromise<TValue> = TValue | Promise<TValue>;

