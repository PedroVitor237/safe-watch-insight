import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  createInspectionSchema,
  inspectionFiltersSchema,
} from "@/server/schemas/inspection.schema";
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

const inspectionIdSchema = z.object({
  id: z.string().uuid(),
});

async function getInspectionService() {
  const { inspectionService } = await import("@/server/services/inspection.service");

  return inspectionService;
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

export const createInspection = createServerFn({ method: "POST" })
  .inputValidator(createInspectionSchema)
  .handler(async ({ data }) => {
    const service = await getInspectionService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(
      await service.createInspection({
        ...data,
        userId: userResult.data.id,
      }),
    );
  });

export const getInspectionById = createServerFn({ method: "POST" })
  .inputValidator(inspectionIdSchema)
  .handler(async ({ data }) => {
    const service = await getInspectionService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.getInspectionById(data.id));
  });

export const listInspections = createServerFn({ method: "POST" })
  .inputValidator(inspectionFiltersSchema)
  .handler(async ({ data }) => {
    const service = await getInspectionService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.listInspections(data));
  });

export const deleteInspection = createServerFn({ method: "POST" })
  .inputValidator(inspectionIdSchema)
  .handler(async ({ data }) => {
    const service = await getInspectionService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.deleteInspection(data.id));
  });
