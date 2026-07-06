import { InspectionStatus, SyncStatus } from "@/generated/prisma/client";
import { z } from "zod";

import { listQuerySchema } from "./pagination.schema";

const optionalNullableTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const inspectionStatusSchema = z.nativeEnum(InspectionStatus);
export const syncStatusSchema = z.nativeEnum(SyncStatus);

export const inspectionSortFieldSchema = z.enum([
  "inspectionDate",
  "status",
  "syncStatus",
  "createdAt",
  "updatedAt",
]);

export const createInspectionSchema = z.object({
  userId: z.string().uuid(),
  companyId: z.string().uuid(),
  checklistId: z.string().uuid(),
  inspectionDate: z.coerce.date(),
  status: inspectionStatusSchema.default(InspectionStatus.PLANNED),
  syncStatus: syncStatusSchema.default(SyncStatus.SYNCED),
  notes: optionalNullableTextSchema,
});

export const inspectionFiltersSchema = listQuerySchema.extend({
  sortBy: inspectionSortFieldSchema.optional(),
  userId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  checklistId: z.string().uuid().optional(),
  status: inspectionStatusSchema.optional(),
  syncStatus: syncStatusSchema.optional(),
});

export type CreateInspectionSchemaInput = z.infer<typeof createInspectionSchema>;
export type InspectionFiltersSchemaInput = z.infer<typeof inspectionFiltersSchema>;
export type InspectionSortFieldSchemaInput = z.infer<typeof inspectionSortFieldSchema>;
export type InspectionStatusSchemaInput = z.infer<typeof inspectionStatusSchema>;
export type SyncStatusSchemaInput = z.infer<typeof syncStatusSchema>;
