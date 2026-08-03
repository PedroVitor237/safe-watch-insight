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

export const saveInspectionResponseSchema = z
  .object({
    inspectionId: z.string().uuid(),
    snapshotItemId: z.string().uuid().optional(),
    checklistItemId: z.string().uuid().optional(),
    status: responseStatusSchema,
    observation: optionalNullableTextSchema,
  })
  .superRefine((data, context) => {
    const identifierCount =
      Number(data.snapshotItemId !== undefined) + Number(data.checklistItemId !== undefined);

    if (identifierCount !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide exactly one snapshotItemId or legacy checklistItemId.",
        path: ["snapshotItemId"],
      });
    }
  });

export type InspectionResponseIdSchemaInput = z.infer<typeof inspectionResponseIdSchema>;
export type SaveInspectionResponseSchemaInput = z.infer<typeof saveInspectionResponseSchema>;
