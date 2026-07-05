import { z } from "zod";

import { listQuerySchema } from "./pagination.schema";

const cnpjSchema = z
  .string()
  .trim()
  .regex(/^(\d{14}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})$/, {
    message: "CNPJ must contain 14 digits.",
  })
  .transform((value) => value.replace(/\D/g, ""));

const optionalNullableTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const optionalNullableCnpjSchema = z
  .union([cnpjSchema, z.literal("").transform(() => null), z.null()])
  .optional();

export const companySortFieldSchema = z.enum([
  "corporateName",
  "tradeName",
  "cnae",
  "riskLevel",
  "employeeCount",
  "createdAt",
  "updatedAt",
]);

export const createCompanySchema = z.object({
  corporateName: z.string().trim().min(1).max(255),
  tradeName: optionalNullableTextSchema,
  cnpj: optionalNullableCnpjSchema,
  cnae: z.string().trim().min(1).max(20),
  riskLevel: z.coerce.number().int().min(1).max(4),
  employeeCount: z.coerce.number().int().nonnegative(),
  address: optionalNullableTextSchema,
  notes: optionalNullableTextSchema,
  createdById: z.string().uuid(),
});

export const updateCompanySchema = createCompanySchema
  .omit({ createdById: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const companyFiltersSchema = listQuerySchema.extend({
  sortBy: companySortFieldSchema.optional(),
  createdById: z.string().uuid().optional(),
});

export type CreateCompanySchemaInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanySchemaInput = z.infer<typeof updateCompanySchema>;
export type CompanyFiltersSchemaInput = z.infer<typeof companyFiltersSchema>;
export type CompanySortFieldSchemaInput = z.infer<typeof companySortFieldSchema>;
