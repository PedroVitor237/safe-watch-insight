import assert from "node:assert/strict";
import test from "node:test";

import {
  createCorrectiveActionSchema,
  updateCorrectiveActionInputSchema,
  updateCorrectiveActionSchema,
} from "./corrective-action.schema";
import {
  createNonConformitySchema,
  nonConformityFiltersSchema,
  updateNonConformityInputSchema,
  updateNonConformitySchema,
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
  assert.equal(created.method, "Instalação durante a parada programada");
  assert.equal(created.estimatedCost, "R$ 1.000,00");
  assert.equal(created.status, "PENDING");
  assert.equal(updateCorrectiveActionSchema.safeParse({}).success, false);
});

const deadlineContracts = [
  {
    name: "non-conformity create",
    parse: (fields: { dueDate?: unknown }) =>
      createNonConformitySchema.parse({
        inspectionResponseId: UUID,
        description: "Proteção ausente",
        severity: "HIGH",
        ...fields,
      }),
  },
  {
    name: "non-conformity update",
    parse: (fields: { dueDate?: unknown }) =>
      updateNonConformityInputSchema.parse({
        id: UUID,
        data: { description: "Proteção ausente", ...fields },
      }).data,
  },
  {
    name: "corrective action create",
    parse: (fields: { dueDate?: unknown }) =>
      createCorrectiveActionSchema.parse({
        nonConformityId: UUID,
        description: "Instalar proteção fixa",
        ...fields,
      }),
  },
  {
    name: "corrective action update",
    parse: (fields: { dueDate?: unknown }) =>
      updateCorrectiveActionInputSchema.parse({
        id: UUID,
        data: { description: "Instalar proteção fixa", ...fields },
      }).data,
  },
];

for (const { name, parse } of deadlineContracts) {
  test(`${name} preserves omitted and explicitly undefined deadlines`, () => {
    const omitted = parse({});
    assert.equal(omitted.dueDate, undefined);
    assert.equal(Object.hasOwn(omitted, "dueDate"), false);
    assert.equal(parse({ dueDate: undefined }).dueDate, undefined);
  });

  test(`${name} preserves JSON null and normalizes an empty deadline`, () => {
    const jsonNull: { dueDate: unknown } = JSON.parse('{"dueDate":null}');
    assert.equal(parse(jsonNull).dueDate, null);
    assert.equal(parse({ dueDate: "" }).dueDate, null);
  });

  test(`${name} preserves date strings and Date values from the form`, () => {
    assert.equal(
      parse({ dueDate: "2026-10-20" }).dueDate?.toISOString(),
      "2026-10-20T00:00:00.000Z",
    );
    const formDate = new Date("2026-10-20T12:00:00.000Z");
    for (const dueDate of [formDate, formDate.toISOString()]) {
      assert.equal(parse({ dueDate }).dueDate?.getTime(), formDate.getTime());
    }
  });

  test(`${name} rejects invalid strings and invalid Date values`, () => {
    for (const dueDate of ["invalid", new Date(Number.NaN)]) {
      assert.throws(() => parse({ dueDate }), { name: "ZodError" });
    }
  });
}

test("deadline-only updates can clear a date and still reject empty updates", () => {
  for (const schema of [updateNonConformitySchema, updateCorrectiveActionSchema]) {
    assert.equal(schema.parse({ dueDate: null }).dueDate, null);
    assert.equal(schema.parse({ dueDate: "" }).dueDate, null);
    assert.equal(schema.safeParse({}).success, false);
  }
});
