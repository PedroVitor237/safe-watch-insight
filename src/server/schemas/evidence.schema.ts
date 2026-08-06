import { z } from "zod";

import { MAX_EVIDENCE_FILE_SIZE, SUPPORTED_EVIDENCE_MIME_TYPES } from "@/lib/evidence";

export { MAX_EVIDENCE_FILE_SIZE, SUPPORTED_EVIDENCE_MIME_TYPES } from "@/lib/evidence";

const optionalTargetIdSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().uuid().optional(),
);

export const evidenceTargetSchema = z
  .object({
    inspectionId: optionalTargetIdSchema,
    nonConformityId: optionalTargetIdSchema,
  })
  .refine(
    (target) =>
      Number(target.inspectionId !== undefined) + Number(target.nonConformityId !== undefined) ===
      1,
    {
      message: "Evidence must belong to exactly one inspection or non-conformity.",
      path: ["inspectionId"],
    },
  );

export const evidenceIdSchema = z.object({
  id: z.string().uuid(),
});

export const evidenceCaptionSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z
    .string()
    .trim()
    .max(500, "Caption must contain at most 500 characters.")
    .optional()
    .transform((value) => value || undefined),
);

const uploadFieldsSchema = evidenceTargetSchema.and(
  z.object({
    caption: evidenceCaptionSchema,
  }),
);

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export function parseEvidenceUploadFormData(formData: FormData) {
  const fields = uploadFieldsSchema.parse({
    inspectionId: formData.get("inspectionId"),
    nonConformityId: formData.get("nonConformityId"),
    caption: formData.get("caption"),
  });
  const file = formData.get("file");

  if (!isFile(file)) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["file"],
        message: "An image file is required.",
      },
    ]);
  }

  if (
    !SUPPORTED_EVIDENCE_MIME_TYPES.includes(
      file.type as (typeof SUPPORTED_EVIDENCE_MIME_TYPES)[number],
    )
  ) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["file"],
        message: "Only JPEG, PNG and WebP images are supported.",
      },
    ]);
  }

  if (file.size <= 0 || file.size > MAX_EVIDENCE_FILE_SIZE) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["file"],
        message: "The image must be larger than zero bytes and at most 4 MB.",
      },
    ]);
  }

  if (file.name.trim().length === 0 || file.name.length > 255) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["file"],
        message: "The file name is invalid.",
      },
    ]);
  }

  return {
    ...fields,
    file,
  };
}

export type EvidenceTargetSchemaInput = z.infer<typeof evidenceTargetSchema>;
export type EvidenceIdSchemaInput = z.infer<typeof evidenceIdSchema>;
export type EvidenceUploadFormData = ReturnType<typeof parseEvidenceUploadFormData>;
