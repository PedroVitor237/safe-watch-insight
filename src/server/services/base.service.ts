import type { ApiError } from "@/server/errors";
import { failure, success } from "@/server/responses";
import type { Result } from "@/server/responses";

export abstract class BaseService<TRepository> {
  protected constructor(protected readonly repository: TRepository) {}

  protected success<TData>(data: TData, message?: string): Result<TData> {
    return success(data, message);
  }

  protected failure(error: ApiError): Result<never> {
    return failure(error);
  }
}

