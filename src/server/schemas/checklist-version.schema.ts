import { z } from "zod";

export const checklistVersionIdSchema = z.object({
  checklistId: z.string().uuid(),
  versionId: z.string().uuid(),
});

export const checklistVersionsByChecklistSchema = z.object({
  checklistId: z.string().uuid(),
});

export const publishChecklistVersionSchema = checklistVersionsByChecklistSchema;

export type ChecklistVersionIdSchemaInput = z.infer<typeof checklistVersionIdSchema>;
export type ChecklistVersionsByChecklistSchemaInput = z.infer<
  typeof checklistVersionsByChecklistSchema
>;
