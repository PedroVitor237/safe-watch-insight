import { StandardType } from "@/generated/prisma/client";
import { z } from "zod";

import { listQuerySchema } from "./pagination.schema";

export const standardIdSchema = z.object({
  id: z.string().uuid(),
});

export const standardTypeSchema = z.nativeEnum(StandardType);

export const standardSortFieldSchema = z.enum(["code", "title", "type"]);

export const standardFiltersSchema = listQuerySchema.extend({
  pageSize: z.coerce.number().int().positive().max(100).default(100),
  sortBy: standardSortFieldSchema.optional(),
  type: standardTypeSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export type StandardFiltersSchemaInput = z.infer<typeof standardFiltersSchema>;
export type StandardSortFieldSchemaInput = z.infer<typeof standardSortFieldSchema>;
