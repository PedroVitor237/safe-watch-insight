import { createHash } from "node:crypto";

import type { StandardType } from "@/generated/prisma/client";

export const CHECKLIST_CONTENT_SCHEMA_VERSION = 1;

export interface ChecklistStandardHashInput {
  standardId: string;
  type: StandardType;
  code: string;
  title: string;
  summary: string | null;
  officialUrl: string | null;
}

export interface ChecklistItemHashInput {
  description: string;
  orderIndex: number;
  isRequired: boolean;
  standards: ChecklistStandardHashInput[];
}

export interface ChecklistContentHashInput {
  title: string;
  description: string | null;
  items: ChecklistItemHashInput[];
}

interface CanonicalStandard {
  type: StandardType;
  code: string;
  title: string;
  summary: string | null;
  officialUrl: string | null;
}

interface CanonicalItem {
  description: string;
  orderIndex: number;
  isRequired: boolean;
  standards: CanonicalStandard[];
}

interface CanonicalChecklistContent {
  schemaVersion: number;
  title: string;
  description: string | null;
  items: CanonicalItem[];
}

export function serializeChecklistContent(input: ChecklistContentHashInput): string {
  const content: CanonicalChecklistContent = {
    schemaVersion: CHECKLIST_CONTENT_SCHEMA_VERSION,
    title: normalizeText(input.title),
    description: normalizeNullableText(input.description),
    items: [...input.items]
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map((item) => ({
        description: normalizeText(item.description),
        orderIndex: item.orderIndex,
        isRequired: item.isRequired,
        standards: [...item.standards]
          .sort(
            (left, right) =>
              left.type.localeCompare(right.type) ||
              left.code.localeCompare(right.code) ||
              left.standardId.localeCompare(right.standardId),
          )
          .map((standard) => ({
            type: standard.type,
            code: normalizeText(standard.code),
            title: normalizeText(standard.title),
            summary: normalizeNullableText(standard.summary),
            officialUrl: normalizeNullableText(standard.officialUrl),
          })),
      })),
  };

  return JSON.stringify(content);
}

export function createChecklistContentHash(input: ChecklistContentHashInput): string {
  return createHash("sha256").update(serializeChecklistContent(input), "utf8").digest("hex");
}

function normalizeText(value: string): string {
  return value.normalize("NFC");
}

function normalizeNullableText(value: string | null): string | null {
  return value === null ? null : normalizeText(value);
}
