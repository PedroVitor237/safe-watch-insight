import assert from "node:assert/strict";
import test from "node:test";

import { OfflineOperationType, ResponseStatus } from "@/generated/prisma/client";
import { OfflineOperationPayloadConflictError } from "@/server/repositories/offline-sync.errors";
import { assertMatchingOfflineOperation } from "@/server/repositories/offline-sync-operation";
import { saveInspectionResponseSchema } from "@/server/schemas/inspection-response.schema";

import { createOfflineOperationPayloadHash } from "./offline-operation-hash";

const operation = {
  type: OfflineOperationType.SAVE_INSPECTION_RESPONSE,
  inspectionId: "11111111-1111-4111-8111-111111111111",
  snapshotItemId: "22222222-2222-4222-8222-222222222222",
  status: ResponseStatus.COMPLIANT,
  observation: "Proteção adequada",
  expectedResponseUpdatedAt: new Date("2026-08-06T12:00:00.000Z"),
  clientCreatedAt: new Date("2026-08-06T13:00:00.000Z"),
} as const;

test("an offline operation produces the same hash for an idempotent retry", () => {
  assert.equal(
    createOfflineOperationPayloadHash(operation),
    createOfflineOperationPayloadHash({ ...operation }),
  );
});

test("changing an operation payload changes its idempotency hash", () => {
  assert.notEqual(
    createOfflineOperationPayloadHash(operation),
    createOfflineOperationPayloadHash({
      ...operation,
      status: ResponseStatus.NON_COMPLIANT,
    }),
  );
});

test("a duplicate operation ID accepts the same identity and rejects different content", () => {
  const identity = {
    userId: "33333333-3333-4333-8333-333333333333",
    inspectionId: operation.inspectionId,
    type: operation.type,
    payloadHash: createOfflineOperationPayloadHash(operation),
  };

  assert.doesNotThrow(() => assertMatchingOfflineOperation(identity, { ...identity }));
  assert.throws(
    () => assertMatchingOfflineOperation(identity, { ...identity, payloadHash: "b".repeat(64) }),
    OfflineOperationPayloadConflictError,
  );
});

test("offline response metadata is all-or-nothing and includes the expected revision", () => {
  const base = {
    inspectionId: operation.inspectionId,
    snapshotItemId: operation.snapshotItemId,
    status: operation.status,
  };

  assert.equal(
    saveInspectionResponseSchema.safeParse({ ...base, operationId: crypto.randomUUID() }).success,
    false,
  );
  assert.equal(
    saveInspectionResponseSchema.safeParse({
      ...base,
      operationId: crypto.randomUUID(),
      clientCreatedAt: operation.clientCreatedAt,
      expectedResponseUpdatedAt: operation.expectedResponseUpdatedAt,
    }).success,
    true,
  );
});
