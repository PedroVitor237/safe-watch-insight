import assert from "node:assert/strict";
import test from "node:test";

import {
  evidenceTargetSchema,
  MAX_EVIDENCE_FILE_SIZE,
  parseEvidenceUploadFormData,
} from "./evidence.schema";

const INSPECTION_ID = "11111111-1111-4111-8111-111111111111";
const NON_CONFORMITY_ID = "22222222-2222-4222-8222-222222222222";

test("evidence target requires exactly one historical context", () => {
  assert.equal(evidenceTargetSchema.safeParse({ inspectionId: INSPECTION_ID }).success, true);
  assert.equal(
    evidenceTargetSchema.safeParse({ nonConformityId: NON_CONFORMITY_ID }).success,
    true,
  );
  assert.equal(evidenceTargetSchema.safeParse({}).success, false);
  assert.equal(
    evidenceTargetSchema.safeParse({
      inspectionId: INSPECTION_ID,
      nonConformityId: NON_CONFORMITY_ID,
    }).success,
    false,
  );
});

test("upload form parser accepts a supported image and normalizes its caption", () => {
  const formData = new FormData();
  formData.set("inspectionId", INSPECTION_ID);
  formData.set("caption", "  Extintor da entrada  ");
  formData.set(
    "file",
    new File([new Uint8Array([0xff, 0xd8, 0xff])], "extintor.jpg", { type: "image/jpeg" }),
  );

  const parsed = parseEvidenceUploadFormData(formData);

  assert.equal(parsed.inspectionId, INSPECTION_ID);
  assert.equal(parsed.caption, "Extintor da entrada");
  assert.equal(parsed.file.name, "extintor.jpg");
});

test("upload form parser accepts an omitted optional caption", () => {
  const formData = new FormData();
  formData.set("inspectionId", INSPECTION_ID);
  formData.set(
    "file",
    new File([new Uint8Array([0xff, 0xd8, 0xff])], "extintor.jpg", {
      type: "image/jpeg",
    }),
  );

  const parsed = parseEvidenceUploadFormData(formData);

  assert.equal(parsed.caption, undefined);
});

test("upload form parser rejects oversized files before service execution", () => {
  const formData = new FormData();
  formData.set("inspectionId", INSPECTION_ID);
  formData.set(
    "file",
    new File([new Uint8Array(MAX_EVIDENCE_FILE_SIZE + 1)], "grande.png", {
      type: "image/png",
    }),
  );

  assert.throws(() => parseEvidenceUploadFormData(formData));
});
