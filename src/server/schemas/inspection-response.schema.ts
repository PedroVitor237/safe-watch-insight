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

const offlineOperationFields = {
  operationId: z.string().uuid().optional(),
  clientCreatedAt: z.coerce.date().optional(),
} as const;

function requireCompleteOfflineMetadata(
  data: {
    operationId?: string;
    clientCreatedAt?: Date;
    expectedResponseUpdatedAt?: Date | null;
  },
  context: z.RefinementCtx,
  requireExpectedRevision: boolean,
): void {
  const hasOfflineMetadata =
    data.operationId !== undefined ||
    data.clientCreatedAt !== undefined ||
    data.expectedResponseUpdatedAt !== undefined;

  if (!hasOfflineMetadata) {
    return;
  }

  if (data.operationId === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "operationId is required for an offline synchronization operation.",
      path: ["operationId"],
    });
  }

  if (data.clientCreatedAt === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "clientCreatedAt is required for an offline synchronization operation.",
      path: ["clientCreatedAt"],
    });
  }

  if (requireExpectedRevision && data.expectedResponseUpdatedAt === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "expectedResponseUpdatedAt must be provided, including null for a new response.",
      path: ["expectedResponseUpdatedAt"],
    });
  }
}

export const saveInspectionResponseSchema = z
  .object({
    inspectionId: z.string().uuid(),
    snapshotItemId: z.string().uuid().optional(),
    checklistItemId: z.string().uuid().optional(),
    status: responseStatusSchema,
    observation: optionalNullableTextSchema,
    expectedResponseUpdatedAt: z.coerce.date().nullable().optional(),
    ...offlineOperationFields,
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

    requireCompleteOfflineMetadata(data, context, true);
  });

export const finishInspectionSchema = inspectionResponseIdSchema
  .extend(offlineOperationFields)
  .superRefine((data, context) => requireCompleteOfflineMetadata(data, context, false));

export type InspectionResponseIdSchemaInput = z.infer<typeof inspectionResponseIdSchema>;
export type SaveInspectionResponseSchemaInput = z.infer<typeof saveInspectionResponseSchema>;
export type FinishInspectionSchemaInput = z.infer<typeof finishInspectionSchema>;
