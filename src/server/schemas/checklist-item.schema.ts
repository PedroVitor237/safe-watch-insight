import { z } from "zod";

const optionalOrderIndexSchema = z.coerce.number().int().positive().optional();

export const checklistItemIdSchema = z.object({
  id: z.string().uuid(),
});

export const checklistItemsByChecklistIdSchema = z.object({
  checklistId: z.string().uuid(),
});

export const createChecklistItemSchema = z.object({
  checklistId: z.string().uuid(),
  description: z.string().trim().min(1).max(500),
  orderIndex: optionalOrderIndexSchema,
  isRequired: z.coerce.boolean().default(true),
});

export const updateChecklistItemSchema = z
  .object({
    description: z.string().trim().min(1).max(500).optional(),
    orderIndex: optionalOrderIndexSchema,
    isRequired: z.coerce.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const updateChecklistItemInputSchema = z.object({
  id: z.string().uuid(),
  data: updateChecklistItemSchema,
});

export type ChecklistItemIdSchemaInput = z.infer<typeof checklistItemIdSchema>;
export type ChecklistItemsByChecklistIdSchemaInput = z.infer<
  typeof checklistItemsByChecklistIdSchema
>;
export type CreateChecklistItemSchemaInput = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistItemSchemaInput = z.infer<typeof updateChecklistItemSchema>;
