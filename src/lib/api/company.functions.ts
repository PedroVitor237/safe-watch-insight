import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  companyClientFiltersSchema,
  createCompanyClientSchema,
  updateCompanySchema,
} from "@/server/schemas";
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

const companyIdSchema = z.object({
  id: z.string().uuid(),
});

const updateCompanyInputSchema = z.object({
  id: z.string().uuid(),
  data: updateCompanySchema,
});

async function getCompanyService() {
  const { companyService } = await import("@/server/services/company.service");

  return companyService;
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

export const createCompany = createServerFn({ method: "POST" })
  .inputValidator(createCompanyClientSchema)
  .handler(async ({ data }) => {
    const service = await getCompanyService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.createCompany({ ...data, createdById: userResult.data.id }));
  });

export const updateCompany = createServerFn({ method: "POST" })
  .inputValidator(updateCompanyInputSchema)
  .handler(async ({ data }) => {
    const service = await getCompanyService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.updateCompany(data.id, data.data));
  });

export const deleteCompany = createServerFn({ method: "POST" })
  .inputValidator(companyIdSchema)
  .handler(async ({ data }) => {
    const service = await getCompanyService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.deleteCompany(data.id));
  });

export const getCompanyById = createServerFn({ method: "POST" })
  .inputValidator(companyIdSchema)
  .handler(async ({ data }) => {
    const service = await getCompanyService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.getCompanyById(data.id));
  });

export const listCompanies = createServerFn({ method: "POST" })
  .inputValidator(companyClientFiltersSchema)
  .handler(async ({ data }) => {
    const service = await getCompanyService();
    const { getAuthenticatedUser } = await getAuthSessionHelpers();
    const userResult = await getAuthenticatedUser();

    if (!userResult.success) {
      return toServerResult<never>(userResult);
    }

    return toServerResult(await service.listCompanies(data));
  });
