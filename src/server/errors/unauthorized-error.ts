import { ApiError } from "./api-error";

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super({
      message,
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }
}

