import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  checklistClientFiltersSchema,
  createChecklistClientSchema,
  updateChecklistSchema,
} from "@/server/schemas/checklist.schema";
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

const checklistIdSchema = z.object({
  id: z.string().uuid(),
});

const updateChecklistInputSchema = z.object({
  id: z.string().uuid(),
  data: updateChecklistSchema,
});

async function getChecklistService() {
  const { checklistService } = await import("@/server/services/checklist.service");

  return checklistService;
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

export const createChecklist = createServerFn({ method: "POST" })
  .inputValidator(createChecklistClientSchema)
  .handler(async ({ data }) => {
    const service = await getChecklistService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.createChecklist({ ...data, createdById: userResult.data.id }));
  });

export const updateChecklist = createServerFn({ method: "POST" })
  .inputValidator(updateChecklistInputSchema)
  .handler(async ({ data }) => {
    const service = await getChecklistService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.updateChecklist(data.id, data.data));
  });

export const deleteChecklist = createServerFn({ method: "POST" })
  .inputValidator(checklistIdSchema)
  .handler(async ({ data }) => {
    const service = await getChecklistService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.deleteChecklist(data.id));
  });

export const getChecklistById = createServerFn({ method: "POST" })
  .inputValidator(checklistIdSchema)
  .handler(async ({ data }) => {
    const service = await getChecklistService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.getChecklistById(data.id));
  });

export const listChecklists = createServerFn({ method: "POST" })
  .inputValidator(checklistClientFiltersSchema)
  .handler(async ({ data }) => {
    const service = await getChecklistService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.listChecklists(data));
  });
