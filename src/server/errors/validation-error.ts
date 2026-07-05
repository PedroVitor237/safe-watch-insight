import { ApiError } from "./api-error";

export interface ValidationIssue {
  field: string;
  message: string;
}

export class ValidationError extends ApiError {
  constructor(message = "Validation failed", issues: ValidationIssue[] = []) {
    super({
      message,
      statusCode: 422,
      code: "VALIDATION_ERROR",
      details: issues,
    });
  }
}

