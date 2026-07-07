import { createServerFn } from "@tanstack/react-start";

import {
  checklistItemIdSchema,
  checklistItemsByChecklistIdSchema,
  createChecklistItemSchema,
  updateChecklistItemInputSchema,
} from "@/server/schemas/checklist-item.schema";
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

async function getChecklistItemService() {
  const { checklistItemService } = await import("@/server/services/checklist-item.service");

  return checklistItemService;
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

async function ensureAuthenticated(): Promise<ServerResult<never> | null> {
  const { getAuthenticatedUser } = await getAuthSessionHelpers();
  const userResult = await getAuthenticatedUser();

  if (!userResult.success) {
    return toServerResult<never>(userResult);
  }

  return null;
}

export const createChecklistItem = createServerFn({ method: "POST" })
  .inputValidator(createChecklistItemSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getChecklistItemService();

    return toServerResult(await service.createChecklistItem(data));
  });

export const updateChecklistItem = createServerFn({ method: "POST" })
  .inputValidator(updateChecklistItemInputSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getChecklistItemService();

    return toServerResult(await service.updateChecklistItem(data.id, data.data));
  });

export const deleteChecklistItem = createServerFn({ method: "POST" })
  .inputValidator(checklistItemIdSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getChecklistItemService();

    return toServerResult(await service.deleteChecklistItem(data.id));
  });

export const listChecklistItems = createServerFn({ method: "POST" })
  .inputValidator(checklistItemsByChecklistIdSchema)
  .handler(async ({ data }) => {
    const authError = await ensureAuthenticated();

    if (authError) {
      return authError;
    }

    const service = await getChecklistItemService();

    return toServerResult(await service.listChecklistItems(data.checklistId));
  });
