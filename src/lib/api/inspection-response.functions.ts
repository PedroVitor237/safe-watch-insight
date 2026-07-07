import { createServerFn } from "@tanstack/react-start";

import {
  inspectionResponseIdSchema,
  saveInspectionResponseSchema,
} from "@/server/schemas/inspection-response.schema";
import type { Result } from "@/server/responses";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type ServerResult<TData> =
  | {
      success: true;
      data: TData;
      message?: string;
    }
  | {
      success: false;
      message: string;
      code: string;
      statusCode: number;
      errors?: JsonValue;
    };

async function getInspectionResponseService() {
  const { inspectionResponseService } = await import(
    "@/server/services/inspection-response.service"
  );

  return inspectionResponseService;
}

async function getAuthSessionHelpers() {
  return await import("@/server/auth/session");
}

function toJsonValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toJsonValue(item)]));
  }

  return String(value);
}

function toServerResult<TData>(result: Result<TData>): ServerResult<TData> {
  if (result.success) {
    return result;
  }

  return {
    success: false,
    message: result.message,
    code: result.code,
    statusCode: result.statusCode,
    ...(result.errors === undefined ? {} : { errors: toJsonValue(result.errors) }),
  };
}

export const listInspectionResponses = createServerFn({ method: "POST" })
  .inputValidator(inspectionResponseIdSchema)
  .handler(async ({ data }) => {
    const service = await getInspectionResponseService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.listInspectionResponses(data.inspectionId));
  });

export const saveInspectionResponse = createServerFn({ method: "POST" })
  .inputValidator(saveInspectionResponseSchema)
  .handler(async ({ data }) => {
    const service = await getInspectionResponseService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.saveInspectionResponse(data));
  });

export const finishInspection = createServerFn({ method: "POST" })
  .inputValidator(inspectionResponseIdSchema)
  .handler(async ({ data }) => {
    const service = await getInspectionResponseService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.finishInspection(data.inspectionId));
  });
