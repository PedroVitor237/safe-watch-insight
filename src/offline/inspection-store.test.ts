import "fake-indexeddb/auto";

import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

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
import {
  cacheInspectionPackage,
  getCachedInspection,
  getNextPendingOperation,
  queueInspectionFinish,
  queueInspectionResponse,
  resetInterruptedOperations,
  retryFailedOperations,
} from "./inspection-store";
import type { OfflineInspection } from "./types";

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
