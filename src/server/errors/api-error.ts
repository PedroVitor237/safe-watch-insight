export interface ApiErrorOptions {
  message: string;
  statusCode: number;
  code: string;
  details?: unknown;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  readonly isOperational = true;

  constructor({ message, statusCode, code, details }: ApiErrorOptions) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

