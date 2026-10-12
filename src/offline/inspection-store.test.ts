import "fake-indexeddb/auto";

import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

import type { saveInspectionResponse } from "@/lib/api/inspection-response.functions";

import {
  ChecklistVersionStatus,
  InspectionSnapshotIntegrityStatus,
  InspectionSnapshotOrigin,
  InspectionStatus,
  SyncStatus,
  UserRole,
} from "@/generated/prisma/client";

import { getOfflineDatabase } from "./database";
import { cacheOfflineSession } from "./session";
import { synchronizeOperation } from "./sync-manager";
import { fetchForOfflineSynchronization } from "./sync-transport";
import {
  cacheInspectionPackage,
  getCachedInspection,
  getNextPendingOperation,
  queueInspectionFinish,
  queueInspectionResponse,
  resetInterruptedOperations,
  retryFailedOperations,
} from "./inspection-store";
import type {
  OfflineInspection,
  OfflineInspectionPackage,
  OfflineInspectionResponse,
  SaveResponseOperation,
} from "./types";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const INSPECTION_ID = "22222222-2222-4222-8222-222222222222";
const SNAPSHOT_ID = "33333333-3333-4333-8333-333333333333";
const SNAPSHOT_ITEM_ID = "44444444-4444-4444-8444-444444444444";
const VERSION_ID = "55555555-5555-4555-8555-555555555555";
const VERSION_ITEM_ID = "66666666-6666-4666-8666-666666666666";
const COMPANY_ID = "77777777-7777-4777-8777-777777777777";
const CHECKLIST_ID = "88888888-8888-4888-8888-888888888888";
const SECOND_INSPECTION_ID = "99999999-9999-4999-8999-999999999999";
const SECOND_USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

beforeEach(async () => {
  const db = getOfflineDatabase();
  await db.transaction("rw", db.sessions, db.inspectionPackages, db.operations, async () => {
    await Promise.all([db.sessions.clear(), db.inspectionPackages.clear(), db.operations.clear()]);
  });
  const now = new Date("2026-08-06T12:00:00.000Z");
  await db.sessions.put({
    key: "current",
    user: createInspection().user,
    verifiedAt: now,
    expiresAt: new Date("2099-08-06T20:00:00.000Z"),
  });
});

afterEach(() => mock.restoreAll());

test("persists the complete immutable snapshot for an offline inspection", async () => {
  await cacheInspectionPackage(createInspection());

  const cached = await getCachedInspection(INSPECTION_ID);

  assert.equal(cached.success, true);
  if (!cached.success) return;
  assert.equal(cached.data.snapshot?.integrityStatus, "VERIFIED");
  assert.equal(cached.data.snapshot?.contentHash, "a".repeat(64));
  assert.equal(cached.data.snapshot?.items[0]?.description, "Pergunta histórica v1");
});

test("queues a response with a stable operation ID and creates local NC state", async () => {
  await cacheInspectionPackage(createInspection());

  const result = await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "NON_COMPLIANT",
    observation: "Proteção ausente",
  });
  const operations = await getOfflineDatabase().operations.toArray();
  const cached = await getCachedInspection(INSPECTION_ID);

  assert.equal(result.success, true);
  assert.equal(operations.length, 1);
  assert.match(operations[0]?.id ?? "", /^[0-9a-f-]{36}$/);
  assert.equal(operations[0]?.status, "PENDING");
  assert.equal(cached.success, true);
  if (!cached.success) return;
  assert.equal(cached.data.syncStatus, "PENDING");
  assert.equal(cached.data.responses[0]?.nonConformity?.description, "Proteção ausente");
  assert.equal(cached.data.snapshot?.title, "Checklist publicado v1");
});

test("orders repeated edits through explicit operation dependencies", async () => {
  await cacheInspectionPackage(createInspection());
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "NON_COMPLIANT",
  });
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
  });

  const operations = (await getOfflineDatabase().operations.toArray()).sort(
    (left, right) => left.sequence - right.sequence,
  );

  assert.equal(operations.length, 2);
  assert.notEqual(operations[0]?.id, operations[1]?.id);
  assert.equal(operations[1]?.dependsOnOperationId, operations[0]?.id);
});

test("uses queue sequence when repeated edits share the same timestamp", async () => {
  await cacheInspectionPackage(createInspection());
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "NON_COMPLIANT",
  });
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
  });

  const db = getOfflineDatabase();
  const operations = (await db.operations.toArray()).sort(
    (left, right) => left.sequence - right.sequence,
  );
  const first = operations[0];
  const second = operations[1];
  assert.ok(first);
  assert.ok(second);

  const sharedTimestamp = new Date("2026-08-06T13:00:00.000Z");
  const firstId = "00000000-0000-4000-8000-000000000001";
  const secondId = "ffffffff-ffff-4fff-bfff-ffffffffffff";
  await db.operations.clear();
  await db.operations.bulkAdd([
    { ...first, id: firstId, createdAt: sharedTimestamp },
    {
      ...second,
      id: secondId,
      createdAt: sharedTimestamp,
      dependsOnOperationId: firstId,
    },
  ]);

  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "NOT_APPLICABLE",
  });

  const third = (await db.operations.toArray()).find((operation) => operation.sequence === 3);
  assert.equal(third?.dependsOnOperationId, secondId);
});

test("restores interrupted syncing operations for an idempotent retry after restart", async () => {
  await cacheInspectionPackage(createInspection());
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
  });
  const operation = await getOfflineDatabase().operations.toCollection().first();
  assert.ok(operation);
  await getOfflineDatabase().operations.update(operation.id, { status: "SYNCING" });

  await resetInterruptedOperations();

  const restored = await getOfflineDatabase().operations.get(operation.id);
  assert.equal(restored?.status, "PENDING");
  assert.equal(restored?.id, operation.id);
});

test("validates required snapshot items before queueing offline completion", async () => {
  await cacheInspectionPackage(createInspection());

  const rejected = await queueInspectionFinish(INSPECTION_ID);
  assert.equal(rejected.success, false);

  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
  });
  const accepted = await queueInspectionFinish(INSPECTION_ID);
  const operations = await getOfflineDatabase().operations.toArray();

  assert.equal(accepted.success, true);
  assert.equal(operations.find((operation) => operation.type === "FINISH_INSPECTION")?.sequence, 2);
});

test("preserves global FIFO order and never overtakes a failed operation", async () => {
  await cacheInspectionPackage(createInspection());
  await cacheInspectionPackage({ ...createInspection(), id: SECOND_INSPECTION_ID });
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
  });
  await queueInspectionResponse({
    inspectionId: SECOND_INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
  });

  const operations = (await getOfflineDatabase().operations.toArray()).sort(
    (left, right) => left.sequence - right.sequence,
  );
  assert.deepEqual(
    operations.map((operation) => operation.sequence),
    [1, 2],
  );

  const firstOperation = operations[0];
  assert.ok(firstOperation);
  await getOfflineDatabase().operations.update(firstOperation.id, {
    status: "ERROR",
    attemptCount: 5,
  });

  assert.equal(await getNextPendingOperation(USER_ID), null);

  await retryFailedOperations();
  const retriedOperation = await getNextPendingOperation(USER_ID);
  assert.equal(retriedOperation?.id, firstOperation.id);
  assert.equal(retriedOperation?.attemptCount, 0);
});

test("clears the previous user's local inspection data when the authenticated identity changes", async () => {
  const inspection = createInspection();
  await cacheInspectionPackage(inspection);
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
  });

  await cacheOfflineSession({
    ...inspection.user,
    id: SECOND_USER_ID,
    email: "second-user@example.com",
  });

  const db = getOfflineDatabase();
  assert.equal(await db.inspectionPackages.count(), 0);
  assert.equal(await db.operations.count(), 0);
  assert.equal((await db.sessions.get("current"))?.user.id, SECOND_USER_ID);
});

test("does not retain inspection packages assigned to another user", async () => {
  const ownInspection = createInspection();
  await cacheInspectionPackage(ownInspection);
  await cacheInspectionPackage({
    ...ownInspection,
    id: SECOND_INSPECTION_ID,
    userId: SECOND_USER_ID,
    user: {
      ...ownInspection.user,
      id: SECOND_USER_ID,
      email: "second-user@example.com",
    },
  });

  await cacheOfflineSession(ownInspection.user);

  const packages = await getOfflineDatabase().inspectionPackages.toArray();
  assert.equal(packages.length, 1);
  assert.equal(packages[0]?.userId, USER_ID);
  assert.equal(packages[0]?.inspectionId, INSPECTION_ID);
});

test("acknowledges a response and adopts remote identity and revision when no newer edit exists", async () => {
  const operation = await queueResponse("COMPLIANT", "Resposta enviada");
  const response = await createRemoteResponse();
  const snapshot = (await readLocalInspection()).snapshot;

  assert.equal(await synchronizeResponse(operation, async () => response), true);

  const inspection = await readLocalInspection();
  assert.deepEqual(inspection.responses[0], response);
  assert.deepEqual(inspection.snapshot, snapshot);
  assert.equal(inspection.status, "IN_PROGRESS");
  assert.equal(inspection.syncStatus, "SYNCED");
  assert.equal(await getOfflineDatabase().operations.count(), 0);
  assert.equal((await readLocalPackage()).localSyncStatus, "SYNCED");

  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "NOT_APPLICABLE",
  });
  const next = await getNextPendingOperation(USER_ID);
  assert.ok(next?.type === "SAVE_INSPECTION_RESPONSE");
  assert.deepEqual(next.payload.expectedResponseUpdatedAt, response.updatedAt);
});

test("preserves a newer response and local completion when an older request is acknowledged", async () => {
  const operation = await queueResponse("NON_COMPLIANT", "Observação antiga");
  const response = await createRemoteResponse();
  const submitted = deferred<void>();
  const confirmation = deferred<OfflineInspectionResponse>();
  const synchronization = synchronizeResponse(operation, async () => {
    submitted.resolve();
    return confirmation.promise;
  });
  await submitted.promise;

  const edit = await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
    observation: "Observação nova",
  });
  assert.ok(edit.success);
  assert.ok((await queueInspectionFinish(INSPECTION_ID)).success);
  const projection = await readLocalInspection();
  confirmation.resolve(response);
  assert.equal(await synchronization, true);

  // Read the persisted package again after closing the IndexedDB connection.
  getOfflineDatabase().close();
  await getOfflineDatabase().open();
  const inspection = await readLocalInspection();
  assert.deepEqual(inspection.responses[0], edit.data);
  assert.equal(inspection.responses[0]?.nonConformity, null);
  assert.deepEqual(inspection.snapshot, projection.snapshot);
  assert.equal(inspection.status, "COMPLETED");
  assert.deepEqual(inspection.updatedAt, projection.updatedAt);
  assert.equal(inspection.syncStatus, "PENDING");
  assert.equal((await readLocalPackage()).localSyncStatus, "PENDING");
  assert.equal(await getOfflineDatabase().operations.get(operation.id), undefined);
  const next = await getNextPendingOperation(USER_ID);
  assert.ok(next?.type === "SAVE_INSPECTION_RESPONSE");
  assert.equal(next.dependsOnOperationId, null);
  assert.equal(next.payload.status, "COMPLIANT");
  assert.equal(next.payload.observation, "Observação nova");
  assert.deepEqual(next.payload.expectedResponseUpdatedAt, response.updatedAt);
  assert.equal(await getOfflineDatabase().operations.count(), 2);
});

test("preserves the latest local NC through three dependent edits and adopts the final confirmation", async () => {
  const first = await queueResponse("COMPLIANT", "Primeira resposta");
  const firstResponse = await createRemoteResponse();
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "NOT_APPLICABLE",
    observation: "Segunda resposta",
  });
  const secondResponse = {
    ...firstResponse,
    status: "NOT_APPLICABLE" as const,
    observation: "Segunda resposta",
    updatedAt: new Date("2026-10-12T12:01:00.000Z"),
  };
  const last = await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "NON_COMPLIANT",
    observation: "Proteção ausente na última edição",
  });
  assert.ok(last.success);
  const finalResponse = await createRemoteResponse(new Date("2026-10-12T12:02:00.000Z"));

  await synchronizeResponse(first, async () => firstResponse);
  assert.deepEqual((await readLocalInspection()).responses[0], last.data);
  const second = await getNextPendingOperation(USER_ID);
  assert.ok(second?.type === "SAVE_INSPECTION_RESPONSE");
  assert.deepEqual(second.payload.expectedResponseUpdatedAt, firstResponse.updatedAt);
  await synchronizeResponse(second, async () => secondResponse);
  assert.deepEqual((await readLocalInspection()).responses[0], last.data);
  const third = await getNextPendingOperation(USER_ID);
  assert.ok(third?.type === "SAVE_INSPECTION_RESPONSE");
  assert.deepEqual(third.payload.expectedResponseUpdatedAt, secondResponse.updatedAt);
  await synchronizeResponse(third, async () => finalResponse);
  assert.deepEqual((await readLocalInspection()).responses[0], finalResponse);
  assert.equal((await readLocalPackage()).localSyncStatus, "SYNCED");
  assert.equal(await getOfflineDatabase().operations.count(), 0);
});

test("synchronizes a locally completed inspection after its response acknowledgement", async () => {
  const responseOperation = await queueResponse("COMPLIANT", "Resposta final");
  const response = await createRemoteResponse();
  assert.ok((await queueInspectionFinish(INSPECTION_ID)).success);
  await synchronizeResponse(responseOperation, async () => response);
  const local = await readLocalInspection();
  assert.equal(local.status, "COMPLETED");
  assert.equal(local.syncStatus, "PENDING");
  assert.deepEqual(local.responses[0], response);
  const finish = await getNextPendingOperation(USER_ID);
  assert.ok(finish?.type === "FINISH_INSPECTION");
  const remote = { ...local, syncStatus: "SYNCED" as const };

  assert.equal(
    await synchronizeOperation(finish, {
      saveInspectionResponse: async () => {
        throw new Error("Unexpected response request");
      },
      finishInspection: async ({ data }) => {
        assert.equal(data?.operationId, finish.id);
        return { success: true, data: remote };
      },
    }),
    true,
  );

  assert.deepEqual(await readLocalInspection(), remote);
  assert.equal((await readLocalPackage()).localSyncStatus, "SYNCED");
  assert.equal(await getOfflineDatabase().operations.count(), 0);
});

test("applies the remote response while preserving pending work on a different snapshot item", async () => {
  const inspection = createInspection();
  assert.ok(inspection.snapshot);
  const otherItemId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  inspection.snapshot.items.push({
    ...inspection.snapshot.items[0],
    id: otherItemId,
    orderIndex: 2,
  });
  await cacheInspectionPackage(inspection);
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
  });
  const first = await getNextPendingOperation(USER_ID);
  assert.ok(first?.type === "SAVE_INSPECTION_RESPONSE");
  const remote = await createRemoteResponse();
  const other = await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: otherItemId,
    status: "NON_COMPLIANT",
    observation: "Outro item pendente",
  });
  assert.ok(other.success);

  await synchronizeResponse(first, async () => remote);

  const persisted = await readLocalInspection();
  assert.deepEqual(persisted.responses[0], remote);
  assert.deepEqual(persisted.responses[1], other.data);
  assert.equal(persisted.syncStatus, "PENDING");
  assert.equal((await readLocalPackage()).localSyncStatus, "PENDING");
  assert.equal(await getOfflineDatabase().operations.count(), 1);
  assert.equal((await getNextPendingOperation(USER_ID))?.entityKey, `response:${otherItemId}`);
});

test("ignores a duplicate old confirmation arriving after the dependent edit was synchronized", async () => {
  const first = await queueResponse("NON_COMPLIANT", "Resposta antiga");
  const oldResponse = await createRemoteResponse();
  const duplicateSubmitted = deferred<void>();
  const duplicateConfirmation = deferred<OfflineInspectionResponse>();
  const delayedDuplicate = synchronizeResponse(first, async () => {
    duplicateSubmitted.resolve();
    return duplicateConfirmation.promise;
  });
  await duplicateSubmitted.promise;
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "COMPLIANT",
    observation: "Resposta nova",
  });
  const newResponse = await createRemoteResponse(new Date("2026-10-12T12:01:00.000Z"));
  await synchronizeResponse(first, async () => oldResponse);
  const second = await getNextPendingOperation(USER_ID);
  assert.ok(second?.type === "SAVE_INSPECTION_RESPONSE");
  await synchronizeResponse(second, async () => newResponse);
  const synchronizedPackage = await readLocalPackage();

  duplicateConfirmation.resolve(oldResponse);
  assert.equal(await delayedDuplicate, true);

  assert.deepEqual(await readLocalPackage(), synchronizedPackage);
  assert.equal(await getOfflineDatabase().operations.count(), 0);
});

for (const statusCode of [409, 401, 403, 404, 422, 408, 429, 500, 502, 503]) {
  test(`keeps local edits and dependencies when the server rejects synchronization with ${statusCode}`, async () => {
    const first = await queueResponse("COMPLIANT", "Enviada");
    await queueInspectionResponse({
      inspectionId: INSPECTION_ID,
      snapshotItemId: SNAPSHOT_ITEM_ID,
      status: "NON_COMPLIANT",
      observation: "Edição ainda local",
    });
    const projection = await readLocalInspection();
    const operations = await getOfflineDatabase().operations.toArray();
    const dependent = operations.find((operation) => operation.dependsOnOperationId === first.id);
    assert.ok(dependent);
    const continued = await synchronizeOperation(first, {
      saveInspectionResponse: async () => ({
        success: false,
        statusCode,
        code: "TEST_REJECTION",
        message: "Confirmação rejeitada",
      }),
      finishInspection: async () => {
        throw new Error("Unexpected inspection completion request");
      },
    });

    assert.equal(continued, false);
    assert.deepEqual((await readLocalInspection()).responses, projection.responses);
    assert.deepEqual(await getOfflineDatabase().operations.get(dependent.id), dependent);
    const persisted = await getOfflineDatabase().operations.get(first.id);
    assert.ok(persisted);
    assert.equal(
      persisted.status,
      statusCode === 409
        ? "CONFLICT"
        : statusCode === 408 || statusCode === 429 || statusCode >= 500
          ? "PENDING"
          : "ERROR",
    );
    assert.equal(persisted.lastErrorCode, "TEST_REJECTION");
    assert.equal(persisted.lastErrorMessage, "Confirmação rejeitada");
    assert.equal(persisted.attemptCount, 1);
    assert.equal((await readLocalPackage()).localSyncStatus, persisted.status);
    assert.equal(await getOfflineDatabase().operations.count(), 2);
    assert.equal(await getNextPendingOperation(USER_ID), null);
    if (statusCode === 409) {
      await retryFailedOperations();
      assert.equal((await getOfflineDatabase().operations.get(first.id))?.status, "CONFLICT");
      assert.equal(await getNextPendingOperation(USER_ID), null);
    }
  });
}

for (const error of [
  new Error("Unexpected server failure with private diagnostic details"),
  new TypeError("Failed to fetch"),
  new RangeError("Serialization failed"),
  { reason: "Unknown rejection with private diagnostic details" },
]) {
  test(`blocks an unclassified server-function rejection (${error instanceof Error ? error.name : "object"}) without losing queued work`, async () => {
    const operation = await queueResponse("NON_COMPLIANT", "Resposta local preservada");
    const projection = await readLocalInspection();

    assert.equal(
      await synchronizeResponse(operation, async () => {
        throw error;
      }),
      false,
    );

    const persisted = await getOfflineDatabase().operations.get(operation.id);
    assert.ok(persisted);
    assert.equal(persisted.status, "ERROR");
    assert.equal(persisted.lastErrorCode, "SYNC_EXCEPTION");
    assert.equal(persisted.attemptCount, 1);
    assert.doesNotMatch(persisted.lastErrorMessage ?? "", /private diagnostic details/);
    assert.deepEqual(persisted.payload, operation.payload);
    assert.deepEqual((await readLocalInspection()).responses, projection.responses);
    assert.equal((await readLocalPackage()).localSyncStatus, "ERROR");
    assert.equal(await getNextPendingOperation(USER_ID), null);
  });
}

test("retries an uncertain outcome with the same payload and preserves an edit made after submission", async () => {
  const first = await queueResponse("NON_COMPLIANT", "Resposta aceita remotamente");
  const accepted = await createRemoteResponse();
  const continued = await synchronizeResponse(first, async () => {
    await queueInspectionResponse({
      inspectionId: INSPECTION_ID,
      snapshotItemId: SNAPSHOT_ITEM_ID,
      status: "COMPLIANT",
      observation: "Edição feita enquanto a confirmação se perdeu",
    });
    mock.method(globalThis, "fetch", async () => {
      throw new TypeError("Failed to fetch");
    });
    await fetchForOfflineSynchronization("/sync-test");
    throw new Error("Unexpected transport success");
  });
  assert.equal(continued, false);
  const projection = await readLocalInspection();
  const db = getOfflineDatabase();
  const pending = await db.operations.get(first.id);
  assert.ok(pending);
  assert.equal(pending.status, "PENDING");
  assert.equal(pending.lastErrorCode, "NETWORK_ERROR");
  assert.deepEqual(pending.payload, first.payload);
  assert.equal(await getNextPendingOperation(USER_ID), null);
  // Advance eligibility explicitly instead of waiting for the backoff timer.
  await db.operations.update(first.id, { nextAttemptAt: new Date(0) });
  const retry = await getNextPendingOperation(USER_ID);
  assert.ok(retry?.type === "SAVE_INSPECTION_RESPONSE");
  assert.equal(retry.id, first.id);
  assert.deepEqual(retry.payload, first.payload);
  await synchronizeResponse(retry, async () => accepted);

  assert.deepEqual((await readLocalInspection()).responses, projection.responses);
  const dependent = await getNextPendingOperation(USER_ID);
  assert.ok(dependent?.type === "SAVE_INSPECTION_RESPONSE");
  assert.deepEqual(dependent.payload.expectedResponseUpdatedAt, accepted.updatedAt);
  assert.equal(await db.operations.count(), 1);
});

test("does not acknowledge an incomplete confirmation when response decoding fails", async () => {
  const operation = await queueResponse("NON_COMPLIANT", "Resposta local");
  const projection = await readLocalInspection();

  const continued = await synchronizeResponse(operation, async () => {
    throw new SyntaxError("Unexpected end of synchronization response");
  });

  assert.equal(continued, false);
  assert.deepEqual((await readLocalInspection()).responses, projection.responses);
  const persisted = await getOfflineDatabase().operations.get(operation.id);
  assert.ok(persisted);
  assert.equal(persisted.status, "ERROR");
  assert.equal(persisted.lastErrorCode, "SYNC_EXCEPTION");
  assert.deepEqual(persisted.payload, operation.payload);
  assert.equal((await readLocalPackage()).localSyncStatus, "ERROR");
});

test("rolls back acknowledgement and dependency changes when the local package commit fails", async () => {
  const first = await queueResponse("COMPLIANT", "Resposta enviada");
  const response = await createRemoteResponse();
  await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status: "NON_COMPLIANT",
    observation: "Resposta local mais recente",
  });
  const db = getOfflineDatabase();
  const operations = await db.operations.toArray();
  const dependent = operations.find((operation) => operation.dependsOnOperationId === first.id);
  assert.ok(dependent);
  const projection = await readLocalInspection();
  // Fail only the acknowledgement write; status/retry writes use the real table.
  const packagePut = db.inspectionPackages.put.bind(db.inspectionPackages);
  const put = mock.method(db.inspectionPackages, "put", packagePut);
  const continued = await synchronizeResponse(first, async () => {
    put.mock.mockImplementationOnce(() => {
      throw new Error("IndexedDB package write failed");
    });
    return response;
  });
  put.mock.restore();

  assert.equal(continued, false);
  assert.deepEqual((await readLocalInspection()).responses, projection.responses);
  assert.deepEqual(await db.operations.get(dependent.id), dependent);
  const retried = await db.operations.get(first.id);
  assert.ok(retried);
  assert.equal(retried.status, "ERROR");
  assert.equal(retried.lastErrorCode, "LOCAL_PERSISTENCE_ERROR");
  assert.deepEqual(retried.payload, first.payload);
  assert.equal(await db.operations.count(), 2);

  await retryFailedOperations();
  const manualRetry = await getNextPendingOperation(USER_ID);
  assert.ok(manualRetry?.type === "SAVE_INSPECTION_RESPONSE");
  assert.equal(manualRetry.id, first.id);
  assert.equal(manualRetry.attemptCount, 0);
  assert.deepEqual(manualRetry.payload, first.payload);
  assert.equal(await synchronizeResponse(manualRetry, async () => response), true);
  const next = await getNextPendingOperation(USER_ID);
  assert.ok(next?.type === "SAVE_INSPECTION_RESPONSE");
  assert.equal(next.id, dependent.id);
  assert.deepEqual(next.payload.expectedResponseUpdatedAt, response.updatedAt);
  assert.deepEqual((await readLocalInspection()).responses, projection.responses);
});

for (const statusCode of [401, 403, 404, 409, 422, 429, 500, 503]) {
  test(`classifies HTTP ${statusCode} at the fetch boundary without retaining the response body`, async () => {
    const operation = await queueResponse("COMPLIANT", "Resposta local");
    mock.method(
      globalThis,
      "fetch",
      async () => new Response("private server diagnostics", { status: statusCode }),
    );

    assert.equal(await synchronizeThroughFetch(operation), false);

    const persisted = await getOfflineDatabase().operations.get(operation.id);
    assert.ok(persisted);
    assert.equal(
      persisted.status,
      statusCode === 409
        ? "CONFLICT"
        : statusCode === 429 || statusCode >= 500
          ? "PENDING"
          : "ERROR",
    );
    assert.equal(persisted.lastErrorCode, "HTTP_ERROR");
    assert.match(persisted.lastErrorMessage ?? "", new RegExp(`HTTP ${statusCode}`));
    assert.doesNotMatch(persisted.lastErrorMessage ?? "", /private server diagnostics/);
    assert.deepEqual(persisted.payload, operation.payload);
    assert.equal(await getNextPendingOperation(USER_ID), null);
  });
}

for (const error of [
  new TypeError("Invalid URL"),
  new DOMException("The request was aborted", "AbortError"),
  new Error("Unexpected fetch wrapper error"),
]) {
  test(`does not retry a fetch rejection without recognized transport evidence (${error.name})`, async () => {
    const operation = await queueResponse("COMPLIANT", "Resposta local");
    mock.method(globalThis, "fetch", async () => {
      throw error;
    });
    assert.equal(await synchronizeThroughFetch(operation), false);
    const persisted = await getOfflineDatabase().operations.get(operation.id);
    assert.equal(persisted?.status, "ERROR");
    assert.equal(persisted?.lastErrorCode, "SYNC_EXCEPTION");
    assert.deepEqual(persisted?.payload, operation.payload);
  });
}

test("limits connectivity retries to five attempts and recovers manually with the original UUID", async () => {
  const original = await queueResponse("COMPLIANT", "Resposta local");
  const response = await createRemoteResponse();
  mock.method(globalThis, "fetch", async () => {
    throw new TypeError("Failed to fetch");
  });
  const db = getOfflineDatabase();

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const operation = await db.operations.get(original.id);
    assert.ok(operation?.type === "SAVE_INSPECTION_RESPONSE");
    const before = Date.now();
    assert.equal(await synchronizeThroughFetch(operation), false);
    const persisted = await db.operations.get(original.id);
    assert.ok(persisted);
    assert.equal(persisted.attemptCount, attempt);
    assert.equal(persisted.status, attempt === 5 ? "ERROR" : "PENDING");
    assert.equal(persisted.lastErrorCode, "NETWORK_ERROR");
    assert.ok(persisted.nextAttemptAt.getTime() >= before + 2 ** attempt * 1_000);
    assert.deepEqual(persisted.payload, original.payload);
    assert.equal(await getNextPendingOperation(USER_ID), null);
    await db.operations.update(original.id, { nextAttemptAt: new Date(0) });
  }
  assert.equal(await getNextPendingOperation(USER_ID), null);
  await retryFailedOperations();
  const manualRetry = await getNextPendingOperation(USER_ID);
  assert.ok(manualRetry?.type === "SAVE_INSPECTION_RESPONSE");
  assert.equal(manualRetry.id, original.id);
  assert.equal(manualRetry.attemptCount, 0);
  assert.equal(await synchronizeResponse(manualRetry, async () => response), true);
  assert.equal(await db.operations.count(), 0);
  assert.equal((await readLocalPackage()).localSyncStatus, "SYNCED");
});

for (const result of [
  undefined,
  {},
  { success: true },
  { success: true, data: {} },
  { success: false, statusCode: 500 },
]) {
  test(`rejects a malformed synchronization envelope (${JSON.stringify(result)})`, async () => {
    const operation = await queueResponse("NON_COMPLIANT", "Resposta local");
    const projection = await readLocalInspection();
    assert.equal(
      await synchronizeOperation(operation, {
        saveInspectionResponse: async () =>
          result as Awaited<ReturnType<typeof saveInspectionResponse>>,
        finishInspection: async () => {
          throw new Error("Unexpected completion");
        },
      }),
      false,
    );
    const persisted = await getOfflineDatabase().operations.get(operation.id);
    assert.equal(persisted?.status, "ERROR");
    assert.equal(persisted?.lastErrorCode, "INVALID_SYNC_RESPONSE");
    assert.deepEqual(persisted?.payload, operation.payload);
    assert.deepEqual((await readLocalInspection()).responses, projection.responses);
  });
}

test("rejects a confirmation for the wrong item and retains the operation across reopen", async () => {
  const operation = await queueResponse("COMPLIANT", "Resposta local");
  const response = await createRemoteResponse();
  const projection = await readLocalInspection();
  assert.equal(
    await synchronizeResponse(operation, async () => ({
      ...response,
      snapshotItemId: SNAPSHOT_ID,
    })),
    false,
  );
  getOfflineDatabase().close();
  await getOfflineDatabase().open();
  const persisted = await getOfflineDatabase().operations.get(operation.id);
  assert.equal(persisted?.status, "ERROR");
  assert.equal(persisted?.lastErrorCode, "INVALID_SYNC_RESPONSE");
  assert.deepEqual(persisted?.payload, operation.payload);
  assert.deepEqual((await readLocalInspection()).responses, projection.responses);
});

test("propagates unavailable error persistence without discarding interrupted work", async () => {
  const operation = await queueResponse("COMPLIANT", "Resposta local");
  const response = await createRemoteResponse();
  const db = getOfflineDatabase();
  const put = mock.method(
    db.inspectionPackages,
    "put",
    db.inspectionPackages.put.bind(db.inspectionPackages),
  );
  const update = mock.method(db.operations, "update", db.operations.update.bind(db.operations));
  const projection = await readLocalInspection();

  await assert.rejects(
    synchronizeResponse(operation, async () => {
      put.mock.mockImplementationOnce(() => {
        throw new Error("Acknowledgement write failed");
      });
      update.mock.mockImplementationOnce(() => {
        throw new Error("Error state write failed");
      });
      return response;
    }),
    /Error state write failed/,
  );
  mock.restoreAll();
  const interrupted = await db.operations.get(operation.id);
  assert.equal(interrupted?.status, "SYNCING");
  assert.deepEqual(interrupted?.payload, operation.payload);
  assert.deepEqual((await readLocalInspection()).responses, projection.responses);
  await resetInterruptedOperations();
  const retry = await getNextPendingOperation(USER_ID);
  assert.ok(retry?.type === "SAVE_INSPECTION_RESPONSE");
  assert.equal(retry.id, operation.id);
  assert.equal(await synchronizeResponse(retry, async () => response), true);
});

for (const failure of ["network", "exception", "malformed", "local"] as const) {
  test(`preserves offline completion after a ${failure} failure`, async () => {
    const responseOperation = await queueResponse("COMPLIANT", "Resposta final");
    const response = await createRemoteResponse();
    await synchronizeResponse(responseOperation, async () => response);
    assert.ok((await queueInspectionFinish(INSPECTION_ID)).success);
    const operation = await getNextPendingOperation(USER_ID);
    assert.ok(operation?.type === "FINISH_INSPECTION");
    const local = await readLocalInspection();
    const db = getOfflineDatabase();
    const put = mock.method(
      db.inspectionPackages,
      "put",
      db.inspectionPackages.put.bind(db.inspectionPackages),
    );
    mock.method(globalThis, "fetch", async () => {
      throw new TypeError("Failed to fetch");
    });

    assert.equal(
      await synchronizeOperation(operation, {
        saveInspectionResponse: async () => {
          throw new Error("Unexpected response");
        },
        finishInspection: async ({ fetch: syncFetch }) => {
          if (failure === "network") {
            assert.ok(syncFetch);
            await syncFetch("/sync-test");
          }
          if (failure === "exception") throw new TypeError("Failed to fetch");
          if (failure === "local") {
            put.mock.mockImplementationOnce(() => {
              throw new Error("Finish acknowledgement failed");
            });
          }
          return {
            success: true,
            data:
              failure === "malformed"
                ? { ...local, id: SNAPSHOT_ID }
                : { ...local, syncStatus: "SYNCED" },
          };
        },
      }),
      false,
    );
    mock.restoreAll();
    const persisted = await db.operations.get(operation.id);
    assert.equal(persisted?.status, failure === "network" ? "PENDING" : "ERROR");
    assert.equal(
      persisted?.lastErrorCode,
      failure === "network"
        ? "NETWORK_ERROR"
        : failure === "exception"
          ? "SYNC_EXCEPTION"
          : failure === "local"
            ? "LOCAL_PERSISTENCE_ERROR"
            : "INVALID_SYNC_RESPONSE",
    );
    assert.deepEqual(persisted?.payload, operation.payload);
    assert.equal((await readLocalInspection()).status, "COMPLETED");
    assert.deepEqual((await readLocalInspection()).responses, local.responses);
    await retryFailedOperations();
    await db.operations.update(operation.id, { nextAttemptAt: new Date(0) });
    const retry = await getNextPendingOperation(USER_ID);
    assert.ok(retry?.type === "FINISH_INSPECTION");
    assert.equal(retry.id, operation.id);
    assert.equal(
      await synchronizeOperation(retry, {
        saveInspectionResponse: async () => {
          throw new Error("Unexpected response");
        },
        finishInspection: async () => ({ success: true, data: { ...local, syncStatus: "SYNCED" } }),
      }),
      true,
    );
    assert.equal(await db.operations.count(), 0);
    assert.equal((await readLocalPackage()).localSyncStatus, "SYNCED");
  });
}

function synchronizeThroughFetch(operation: SaveResponseOperation): Promise<boolean> {
  return synchronizeOperation(operation, {
    saveInspectionResponse: async ({ fetch: syncFetch }) => {
      assert.ok(syncFetch);
      await syncFetch("/sync-test");
      throw new Error("Unexpected transport success");
    },
    finishInspection: async () => {
      throw new Error("Unexpected completion");
    },
  });
}

async function queueResponse(
  status: SaveResponseOperation["payload"]["status"],
  observation: string,
): Promise<SaveResponseOperation> {
  await cacheInspectionPackage(createInspection());
  const result = await queueInspectionResponse({
    inspectionId: INSPECTION_ID,
    snapshotItemId: SNAPSHOT_ITEM_ID,
    status,
    observation,
  });
  assert.ok(result.success);
  const operation = await getNextPendingOperation(USER_ID);
  assert.ok(operation?.type === "SAVE_INSPECTION_RESPONSE");
  return operation;
}

async function createRemoteResponse(
  revision = new Date("2026-10-12T12:00:00.000Z"),
): Promise<OfflineInspectionResponse> {
  const response = (await readLocalInspection()).responses[0];
  assert.ok(response);
  const id = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const createdAt = new Date("2026-10-12T12:00:00.000Z");
  return {
    ...response,
    id,
    createdAt,
    updatedAt: revision,
    nonConformity: response.nonConformity
      ? {
          ...response.nonConformity,
          id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          inspectionResponseId: id,
          createdAt,
          updatedAt: revision,
        }
      : null,
  };
}

async function readLocalInspection(): Promise<OfflineInspection> {
  const result = await getCachedInspection(INSPECTION_ID);
  assert.ok(result.success);
  return result.data;
}

async function readLocalPackage(): Promise<OfflineInspectionPackage> {
  const record = await getOfflineDatabase()
    .inspectionPackages.where("[userId+inspectionId]")
    .equals([USER_ID, INSPECTION_ID])
    .first();
  assert.ok(record);
  return record;
}

function synchronizeResponse(
  operation: SaveResponseOperation,
  send: () => Promise<OfflineInspectionResponse>,
): Promise<boolean> {
  return synchronizeOperation(operation, {
    saveInspectionResponse: async ({ data }) => {
      assert.equal(data?.operationId, operation.id);
      assert.deepEqual(
        data?.expectedResponseUpdatedAt,
        operation.payload.expectedResponseUpdatedAt,
      );
      assert.deepEqual(data?.clientCreatedAt, operation.payload.clientCreatedAt);
      return { success: true, data: await send() };
    },
    finishInspection: async () => {
      throw new Error("Unexpected inspection completion request");
    },
  });
}

interface Deferred<TValue> {
  promise: Promise<TValue>;
  resolve: (value: TValue | PromiseLike<TValue>) => void;
}

function deferred<TValue>(): Deferred<TValue> {
  let resolve!: (value: TValue | PromiseLike<TValue>) => void;
  const promise = new Promise<TValue>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function createInspection(): OfflineInspection {
  const now = new Date("2026-08-06T12:00:00.000Z");
  const snapshotItem = {
    id: SNAPSHOT_ITEM_ID,
    snapshotId: SNAPSHOT_ID,
    sourceVersionItemId: VERSION_ITEM_ID,
    sourceChecklistItemId: null,
    description: "Pergunta histórica v1",
    orderIndex: 1,
    isRequired: true,
    standards: [],
  };

  return {
    id: INSPECTION_ID,
    userId: USER_ID,
    companyId: COMPANY_ID,
    checklistId: CHECKLIST_ID,
    checklistVersionId: VERSION_ID,
    inspectionDate: now,
    status: InspectionStatus.PLANNED,
    syncStatus: SyncStatus.SYNCED,
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    user: {
      id: USER_ID,
      name: "Inspetora Offline",
      email: "offline@example.com",
      role: UserRole.TECHNICIAN,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    company: {
      id: COMPANY_ID,
      corporateName: "Empresa Offline",
      tradeName: null,
      cnpj: null,
      cnae: "0000-0/00",
      riskLevel: 1,
      employeeCount: 1,
      address: null,
      notes: null,
      createdById: USER_ID,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    checklist: {
      id: CHECKLIST_ID,
      title: "Catálogo mutável",
      description: null,
      isTemplate: false,
      isOfficial: false,
      isActive: true,
      createdById: USER_ID,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    checklistVersion: {
      id: VERSION_ID,
      checklistId: CHECKLIST_ID,
      versionNumber: 1,
      status: ChecklistVersionStatus.PUBLISHED,
      title: "Checklist publicado v1",
      description: null,
      contentSchemaVersion: 1,
      contentHash: "a".repeat(64),
      createdById: USER_ID,
      publishedById: USER_ID,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    snapshot: {
      id: SNAPSHOT_ID,
      inspectionId: INSPECTION_ID,
      sourceChecklistId: CHECKLIST_ID,
      sourceChecklistVersionId: VERSION_ID,
      sourceVersionNumber: 1,
      title: "Checklist publicado v1",
      description: null,
      isTemplate: false,
      snapshotSchemaVersion: 1,
      contentHash: "a".repeat(64),
      origin: InspectionSnapshotOrigin.INSPECTION_CREATION,
      integrityStatus: InspectionSnapshotIntegrityStatus.VERIFIED,
      capturedAt: now,
      items: [snapshotItem],
    },
    responses: [],
  };
}
