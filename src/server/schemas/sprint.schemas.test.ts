import assert from "node:assert/strict";
import test from "node:test";

import {
  createCorrectiveActionSchema,
  updateCorrectiveActionSchema,
} from "./corrective-action.schema";
import {
  createNonConformitySchema,
  nonConformityFiltersSchema,
} from "./non-conformity.schema";
import { standardFiltersSchema } from "./standard.schema";

const UUID = "11111111-1111-4111-8111-111111111111";

test("standard filters apply safe pagination defaults and coerce booleans", () => {
  const result = standardFiltersSchema.parse({
    type: "NR",
    isActive: "true",
  });

  assert.equal(result.page, 1);
  assert.equal(result.pageSize, 100);
  assert.equal(result.sortOrder, "desc");
  assert.equal(result.type, "NR");
  assert.equal(result.isActive, true);
});

test("non-conformity create schema converts due dates and defaults status", () => {
  const result = createNonConformitySchema.parse({
    inspectionResponseId: UUID,
    description: "  Proteção ausente  ",
    severity: "HIGH",
    dueDate: "2026-08-01",
  });

  assert.equal(result.description, "Proteção ausente");
  assert.equal(result.status, "OPEN");
  assert.ok(result.dueDate instanceof Date);
});

test("non-conformity filters reject unsupported status values", () => {
  const result = nonConformityFiltersSchema.safeParse({
    status: "CLOSED",
  });

  assert.equal(result.success, false);
});

test("corrective action schemas normalize optional fields and require updates", () => {
  const created = createCorrectiveActionSchema.parse({
    nonConformityId: UUID,
    description: "  Instalar proteção fixa  ",
    why: "  Reduzir o risco de contato  ",
    location: "  Linha 1  ",
    responsible: " ",
    dueDate: "",
    method: "  Instalação durante a parada programada  ",
    estimatedCost: "  R$ 1.000,00  ",
  });

  assert.equal(created.description, "Instalar proteção fixa");
  assert.equal(created.responsible, null);
  assert.equal(created.dueDate, null);
  assert.equal(created.why, "Reduzir o risco de contato");
  assert.equal(created.location, "Linha 1");
  assert.equal(
    created.method,
    "Instalação durante a parada programada",
  );
  assert.equal(created.estimatedCost, "R$ 1.000,00");
  assert.equal(created.status, "PENDING");
  assert.equal(updateCorrectiveActionSchema.safeParse({}).success, false);
});
