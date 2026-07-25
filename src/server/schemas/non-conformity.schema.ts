import { NonConformityStatus, Severity } from "@/generated/prisma/client";
import { z } from "zod";

import { listQuerySchema } from "./pagination.schema";

const optionalNullableDateSchema = z
  .union([z.coerce.date(), z.literal("").transform(() => null), z.null()])
  .optional();

export const nonConformityIdSchema = z.object({
  id: z.string().uuid(),
});

export const severitySchema = z.nativeEnum(Severity);
export const nonConformityStatusSchema = z.nativeEnum(NonConformityStatus);

export const nonConformitySortFieldSchema = z.enum([
  "createdAt",
  "updatedAt",
  "dueDate",
  "severity",
  "status",
]);

export const createNonConformitySchema = z.object({
  inspectionResponseId: z.string().uuid(),
  description: z.string().trim().min(1).max(2000),
  severity: severitySchema,
  dueDate: optionalNullableDateSchema,
  status: nonConformityStatusSchema.default(NonConformityStatus.OPEN),
});

export const updateNonConformitySchema = z
  .object({
    description: z.string().trim().min(1).max(2000).optional(),
    severity: severitySchema.optional(),
    dueDate: optionalNullableDateSchema,
    status: nonConformityStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const updateNonConformityInputSchema = z.object({
  id: z.string().uuid(),
  data: updateNonConformitySchema,
});

export const nonConformityFiltersSchema = listQuerySchema.extend({
  sortBy: nonConformitySortFieldSchema.optional(),
  status: nonConformityStatusSchema.optional(),
  severity: severitySchema.optional(),
  companyId: z.string().uuid().optional(),
  inspectionId: z.string().uuid().optional(),
  standardId: z.string().uuid().optional(),
});

export type CreateNonConformitySchemaInput = z.infer<
  typeof createNonConformitySchema
>;
export type UpdateNonConformitySchemaInput = z.infer<
  typeof updateNonConformitySchema
>;
export type NonConformityFiltersSchemaInput = z.infer<
  typeof nonConformityFiltersSchema
>;
