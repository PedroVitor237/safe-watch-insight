import { ApiError } from "./api-error";

export class StorageError extends ApiError {
  constructor(message = "The evidence storage provider is temporarily unavailable.") {
    super({
      message,
      statusCode: 502,
      code: "STORAGE_ERROR",
    });
  }
}
