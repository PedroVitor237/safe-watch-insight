import { ApiError } from "@/server/errors";

export interface SuccessResult<TData> {
  success: true;
  data: TData;
  message?: string;
}

export interface ErrorResult {
  success: false;
  message: string;
  code: string;
  statusCode: number;
  errors?: unknown;
}

export type Result<TData> = SuccessResult<TData> | ErrorResult;

export function success<TData>(data: TData, message?: string): SuccessResult<TData> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
}

export function failure(error: ApiError): ErrorResult {
  return {
    success: false,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    ...(error.details === undefined ? {} : { errors: error.details }),
  };
}

export function internalErrorResult(message = "Internal server error"): ErrorResult {
  return {
    success: false,
    message,
    code: "INTERNAL_SERVER_ERROR",
    statusCode: 500,
  };
}

export function resultFromError(error: unknown): ErrorResult {
  if (error instanceof ApiError) {
    return failure(error);
  }

  return internalErrorResult();
}

