import { ApiError } from "./api-error";

export class ConflictError extends ApiError {
  constructor(message = "Resource conflict") {
    super({
      message,
      statusCode: 409,
      code: "CONFLICT",
    });
  }
}

