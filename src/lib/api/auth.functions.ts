import { createServerFn } from "@tanstack/react-start";

import { loginSchema } from "@/server/schemas/auth.schema";
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

async function getUserService() {
  const { userService } = await import("@/server/services");

  return userService;
}

async function getSessionHelpers() {
  return await import("@/server/auth/session");
}

function validateLoginInput(input: unknown) {
  console.info("[auth.login] payload received by Server Function:", input);

  return loginSchema.parse(input);
}

async function toServerErrorResult(error: unknown): Promise<ServerResult<never>> {
  const { resultFromError } = await import("@/server/responses");

  return toServerResult(resultFromError(error));
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

export const login = createServerFn({ method: "POST" })
  .inputValidator(validateLoginInput)
  .handler(async ({ data }) => {
    const service = await getUserService();
    const result = await service.authenticate(data.email, data.password);

    if (result.success) {
      const { createAuthSession } = await getSessionHelpers();

      try {
        await createAuthSession(result.data.id);
      } catch (error) {
        return await toServerErrorResult(error);
      }
    }

    return toServerResult(result);
  });

export const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getAuthenticatedUser } = await getSessionHelpers();

  return toServerResult(await getAuthenticatedUser());
});

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { clearAuthSession } = await getSessionHelpers();

  try {
    await clearAuthSession();
  } catch (error) {
    return await toServerErrorResult(error);
  }

  return {
    success: true,
    data: null,
    message: "Logged out.",
  } as const;
});
