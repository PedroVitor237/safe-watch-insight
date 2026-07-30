import { CorrectiveActionStatus } from "@/generated/prisma/client";
import { z } from "zod";

const optionalNullableTextSchema = z
  .string()
  .trim()
  .max(255)
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const optionalNullableLongTextSchema = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const optionalNullableDateSchema = z
  .union([z.coerce.date(), z.literal("").transform(() => null), z.null()])
  .optional();

export const correctiveActionIdSchema = z.object({
  id: z.string().uuid(),
});

export const correctiveActionsByNonConformitySchema = z.object({
  nonConformityId: z.string().uuid(),
});

export const correctiveActionStatusSchema = z.nativeEnum(CorrectiveActionStatus);

export const createCorrectiveActionSchema = z.object({
  nonConformityId: z.string().uuid(),
  description: z.string().trim().min(1).max(2000),
  why: optionalNullableLongTextSchema,
  location: optionalNullableTextSchema,
  responsible: optionalNullableTextSchema,
  dueDate: optionalNullableDateSchema,
  method: optionalNullableLongTextSchema,
  estimatedCost: optionalNullableTextSchema,
  status: correctiveActionStatusSchema.default(CorrectiveActionStatus.PENDING),
});

export const updateCorrectiveActionSchema = z
  .object({
    description: z.string().trim().min(1).max(2000).optional(),
    why: optionalNullableLongTextSchema,
    location: optionalNullableTextSchema,
    responsible: optionalNullableTextSchema,
    dueDate: optionalNullableDateSchema,
    method: optionalNullableLongTextSchema,
    estimatedCost: optionalNullableTextSchema,
    status: correctiveActionStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const updateCorrectiveActionInputSchema = z.object({
  id: z.string().uuid(),
  data: updateCorrectiveActionSchema,
});

export type CreateCorrectiveActionSchemaInput = z.infer<typeof createCorrectiveActionSchema>;
export type UpdateCorrectiveActionSchemaInput = z.infer<typeof updateCorrectiveActionSchema>;
