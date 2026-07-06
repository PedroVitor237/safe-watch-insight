import { ResponseStatus } from "@/generated/prisma/client";
import { z } from "zod";

const optionalNullableTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const responseStatusSchema = z.nativeEnum(ResponseStatus);

export const inspectionResponseIdSchema = z.object({
  inspectionId: z.string().uuid(),
});

export const saveInspectionResponseSchema = z.object({
  inspectionId: z.string().uuid(),
  checklistItemId: z.string().uuid(),
  status: responseStatusSchema,
  observation: optionalNullableTextSchema,
});

export type InspectionResponseIdSchemaInput = z.infer<typeof inspectionResponseIdSchema>;
export type SaveInspectionResponseSchemaInput = z.infer<typeof saveInspectionResponseSchema>;
