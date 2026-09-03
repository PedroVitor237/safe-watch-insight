import { z } from "zod";

export const inspectionReportIdSchema = z.object({
  inspectionId: z.string().uuid(),
});

export type InspectionReportIdSchemaInput = z.infer<typeof inspectionReportIdSchema>;
