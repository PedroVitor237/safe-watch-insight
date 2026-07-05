import { ApiError } from "./api-error";

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super({
      message,
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }
}

