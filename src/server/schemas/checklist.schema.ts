import { z } from "zod";

import { listQuerySchema } from "./pagination.schema";

const optionalNullableTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const checklistSortFieldSchema = z.enum([
  "title",
  "isTemplate",
  "isActive",
  "createdAt",
  "updatedAt",
]);

const checklistMutableFieldsSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: optionalNullableTextSchema,
  isTemplate: z.coerce.boolean(),
  isActive: z.coerce.boolean(),
});

export const createChecklistSchema = checklistMutableFieldsSchema.extend({
  isTemplate: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  createdById: z.string().uuid(),
});

export const createChecklistClientSchema = createChecklistSchema.omit({ createdById: true });

export const updateChecklistSchema = checklistMutableFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const checklistFiltersSchema = listQuerySchema.extend({
  sortBy: checklistSortFieldSchema.optional(),
  createdById: z.string().uuid().optional(),
  isTemplate: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const checklistClientFiltersSchema = checklistFiltersSchema.omit({ createdById: true });

export type CreateChecklistSchemaInput = z.infer<typeof createChecklistSchema>;
export type CreateChecklistClientSchemaInput = z.infer<typeof createChecklistClientSchema>;
export type UpdateChecklistSchemaInput = z.infer<typeof updateChecklistSchema>;
export type ChecklistFiltersSchemaInput = z.infer<typeof checklistFiltersSchema>;
export type ChecklistClientFiltersSchemaInput = z.infer<typeof checklistClientFiltersSchema>;
export type ChecklistSortFieldSchemaInput = z.infer<typeof checklistSortFieldSchema>;
