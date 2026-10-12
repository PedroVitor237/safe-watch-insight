import "dotenv/config";

import assert from "node:assert/strict";
import test, { mock } from "node:test";

import { Prisma, type OfflineSyncOperation } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import { InspectionResponseService } from "@/server/services/inspection-response.service";

import { InspectionResponseRepository } from "./inspection-response.repository";
import { InspectionRepository, type InspectionWithRelations } from "./inspection.repository";

const INSPECTION_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";
const ITEM_ID = "33333333-3333-4333-8333-333333333333";
const OPERATION_ID = "44444444-4444-4444-8444-444444444444";
const OTHER_OPERATION_ID = "55555555-5555-4555-8555-555555555555";
const REVISION = new Date("2026-10-12T12:00:00.000Z");
const originalTransaction = prisma.$transaction;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

type Checkpoint = "revision" | "operation" | "lock" | "inspection";

// Executes the real repositories/services against a small READ COMMITTED model:
// SELECT reads committed data, parent UPDATE/FOR UPDATE holds a row lock until
// commit, and failed transactions discard their writes. No database is contacted.
class InspectionDatabase {
  inspection = inspectionFixture();
  operations = new Map<string, OfflineSyncOperation>();
  writes = 0;
  failOperationInsert = false;
  events: string[] = [];
  private sequence = 0;
  private lockTail = Promise.resolve();
  readonly paused = deferred();
  readonly resume = deferred();
  readonly contender = deferred();
  readonly resumeContender = deferred();

  constructor(private pauseAt?: Checkpoint) {}

  install() {
    mock.method(
      InspectionRepository.prototype,
      "findActiveOwnedById",
      async (id: string, userId: string) =>
        this.matches({ id, userId }) ? structuredClone(this.inspection) : null,
    );
    prisma.$transaction = this.transaction.bind(this) as typeof prisma.$transaction;
  }

  private matches(where?: Prisma.InspectionWhereInput): boolean {
    return (
      (!where?.id || where.id === this.inspection.id) &&
      (!where?.userId || where.userId === USER_ID) &&
      this.inspection.deletedAt === null
    );
  }

  private async checkpoint(id: number, point: Checkpoint) {
    this.events.push(`${id}:${point}`);
    if (this.pauseAt === undefined) return;
    if (id === 1 && point === this.pauseAt) {
      this.paused.resolve();
      await this.resume.promise;
    }
    if (id === 2 && (point === this.pauseAt || point === "lock")) {
      this.contender.resolve();
      await this.resumeContender.promise;
    }
  }

  private async transaction<T>(
    operation: (client: Prisma.TransactionClient) => Promise<T>,
    options?: { isolationLevel?: string },
  ): Promise<T> {
    assert.ok(!options?.isolationLevel || options.isolationLevel === "ReadCommitted");
    const id = ++this.sequence;
    let localInspection: InspectionWithRelations | undefined;
    let releaseLock: (() => void) | undefined;
    let localWrites = 0;
    const localOperations = new Map<string, OfflineSyncOperation>();
    const current = () => localInspection ?? this.inspection;
    const lock = async () => {
      if (releaseLock) return;
      await this.checkpoint(id, "lock");
      const previous = this.lockTail;
      const released = deferred();
      this.lockTail = released.promise;
      await previous;
      releaseLock = released.resolve;
      localInspection = structuredClone(this.inspection);
    };
    const client = {
      $queryRaw: async (parts: TemplateStringsArray, inspectionId: string, userId: string) => {
        assert.match(
          parts.join("?"),
          /FROM "Inspection"[\s\S]*"userId"[\s\S]*"deletedAt"[\s\S]*FOR UPDATE/,
        );
        assert.equal(inspectionId, INSPECTION_ID);
        if (userId !== USER_ID || this.inspection.deletedAt) return [];
        await lock();
        return this.inspection.deletedAt ? [] : [{ id: INSPECTION_ID }];
      },
      inspection: {
        updateMany: async (args: Prisma.InspectionUpdateManyArgs) => {
          await lock();
          const statuses = args.where?.status;
          const allowed = typeof statuses === "object" ? statuses.in : undefined;
          if (
            !this.matches(args.where) ||
            (Array.isArray(allowed) && !allowed.includes(current().status))
          ) {
            return { count: 0 };
          }
          const status = args.data.status;
          assert.equal(typeof status, "string");
          current().status = status as InspectionWithRelations["status"];
          if (args.data.syncStatus) current().syncStatus = "SYNCED";
          return { count: 1 };
        },
        findFirst: async (args: Prisma.InspectionFindFirstArgs) => {
          const result = this.matches(args.where) ? structuredClone(current()) : null;
          await this.checkpoint(id, "inspection");
          return result;
        },
      },
      inspectionResponse: {
        findUnique: async () => {
          const result = current().responses[0];
          const revision = result ? { updatedAt: new Date(result.updatedAt) } : null;
          await this.checkpoint(id, "revision");
          return revision;
        },
        upsert: async (args: Prisma.InspectionResponseUpsertArgs) => {
          assert.ok(releaseLock, "response writes must hold the parent row lock");
          const data = current().responses.length ? args.update : args.create;
          const response = responseFixture();
          response.status = data.status as typeof response.status;
          response.observation = data.observation as string | null;
          response.updatedAt =
            data.updatedAt instanceof Date ? data.updatedAt : new Date(Date.now());
          current().responses = [response];
          localWrites += 1;
          return structuredClone(response);
        },
        findUniqueOrThrow: async () => {
          assert.ok(current().responses[0]);
          return structuredClone(current().responses[0]);
        },
      },
      nonConformity: {
        findUnique: async () => current().responses[0].nonConformity,
        create: async (args: Prisma.NonConformityCreateArgs) => {
          const data = args.data as Prisma.NonConformityUncheckedCreateInput;
          const nc = {
            id: OPERATION_ID,
            inspectionResponseId: current().responses[0].id,
            description: data.description,
            severity: data.severity,
            dueDate: data.dueDate as Date,
            status: "OPEN" as const,
            createdAt: REVISION,
            updatedAt: REVISION,
            deletedAt: null,
          };
          current().responses[0].nonConformity = nc;
          return nc;
        },
        updateMany: async () => {
          const nc = current().responses[0]?.nonConformity;
          if (nc) nc.deletedAt = new Date();
          return { count: nc ? 1 : 0 };
        },
      },
      offlineSyncOperation: {
        findUnique: async (args: Prisma.OfflineSyncOperationFindUniqueArgs) => {
          const result = this.operations.get(args.where.id ?? "") ?? null;
          await this.checkpoint(id, "operation");
          return result;
        },
        create: async (args: Prisma.OfflineSyncOperationCreateArgs) => {
          if (this.failOperationInsert) throw new Error("simulated acknowledgement failure");
          const data = args.data as Prisma.OfflineSyncOperationUncheckedCreateInput;
          if (this.operations.has(data.id)) {
            throw new Prisma.PrismaClientKnownRequestError("duplicate operation", {
              code: "P2002",
              clientVersion: "test",
            });
          }
          const result = { ...data, completedAt: REVISION } as OfflineSyncOperation;
          localOperations.set(data.id, result);
          return result;
        },
      },
    } as unknown as Prisma.TransactionClient;

    try {
      const result = await operation(client);
      if (localInspection) this.inspection = localInspection;
      for (const [key, value] of localOperations) this.operations.set(key, value);
      this.writes += localWrites;
      return result;
    } finally {
      releaseLock?.();
    }
  }
}

function service() {
  return new InspectionResponseService(
    new InspectionResponseRepository(),
    new InspectionRepository(),
  );
}

function save(operationId = OPERATION_ID, expectedRevision: Date | null = REVISION) {
  return service().saveInspectionResponse({
    userId: USER_ID,
    inspectionId: INSPECTION_ID,
    snapshotItemId: ITEM_ID,
    status: "COMPLIANT",
    observation: operationId,
    offlineOperation: {
      id: operationId,
      userId: USER_ID,
      clientCreatedAt: REVISION,
      expectedResponseUpdatedAt: expectedRevision,
    },
  });
}

function finish(operationId?: string) {
  return service().finishInspection(
    INSPECTION_ID,
    USER_ID,
    operationId
      ? {
          id: operationId,
          userId: USER_ID,
          clientCreatedAt: REVISION,
        }
      : undefined,
  );
}

async function interleave<TFirst, TSecond>(
  database: InspectionDatabase,
  first: () => Promise<TFirst>,
  second: () => Promise<TSecond>,
) {
  // Attach rejection handlers immediately; an expected pre-fix failure must not
  // become an unhandled rejection while the other request is still suspended.
  const a = Promise.allSettled([first()]);
  await database.paused.promise;
  const b = Promise.allSettled([second()]);
  await database.contender.promise;
  database.resume.resolve();
  const [firstResult] = await a;
  database.resumeContender.resolve();
  const [secondResult] = await b;
  assert.equal(firstResult.status, "fulfilled");
  assert.equal(secondResult.status, "fulfilled");
  if (firstResult.status !== "fulfilled" || secondResult.status !== "fulfilled") {
    assert.fail("Both requests must return a domain result");
  }
  return [firstResult.value, secondResult.value] as const;
}

test.afterEach(() => {
  prisma.$transaction = originalTransaction;
  mock.restoreAll();
});

for (const initiallyAnswered of [true, false]) {
  test(`two offline saves using the same ${initiallyAnswered ? "revision" : "absent response"} cannot both commit`, async () => {
    const database = new InspectionDatabase("revision");
    if (!initiallyAnswered) database.inspection.responses = [];
    database.install();
    const expected = initiallyAnswered ? REVISION : null;
    const [first, second] = await interleave(
      database,
      () => save(OPERATION_ID, expected),
      () => save(OTHER_OPERATION_ID, expected),
    );
    assert.equal(first.success, true);
    assert.equal(second.success, false);
    if (!second.success) assert.equal(second.code, "CONFLICT");
    assert.equal(database.inspection.responses[0].observation, OPERATION_ID);
    assert.equal(database.writes, 1);
    assert.equal(database.operations.size, 1);
  });
}

test("simultaneous retries of one response UUID return success with one mutation", async () => {
  const database = new InspectionDatabase("revision");
  database.install();
  const [first, second] = await interleave(
    database,
    () => save(),
    () => save(),
  );
  assert.equal(first.success, true);
  assert.equal(second.success, true);
  assert.deepEqual(first, second);
  assert.equal(database.writes, 1);
  assert.equal(database.operations.size, 1);
});

test("simultaneous retries of one conclusion UUID return success with one acknowledgement", async () => {
  const database = new InspectionDatabase("operation");
  database.install();
  const [first, second] = await interleave(
    database,
    () => finish(OPERATION_ID),
    () => finish(OPERATION_ID),
  );
  assert.equal(first.success, true);
  assert.equal(second.success, true);
  assert.equal(database.inspection.status, "COMPLETED");
  assert.equal(database.operations.size, 1);
});

test("completion waits for the last required response and validates the committed state", async () => {
  const database = new InspectionDatabase("revision");
  database.inspection.responses = [];
  database.install();
  const [saved, finished] = await interleave(
    database,
    () => save(OPERATION_ID, null),
    () => finish(),
  );
  assert.equal(saved.success, true);
  assert.equal(finished.success, true);
  assert.equal(database.inspection.status, "COMPLETED");
  assert.equal(database.inspection.responses.length, 1);
  assert.ok(database.events.indexOf("2:lock") < database.events.indexOf("2:inspection"));
});

test("completion after a concurrent response update returns the fresh response", async () => {
  const database = new InspectionDatabase("revision");
  database.install();
  const [saved, finished] = await interleave(
    database,
    () => save(),
    () => finish(OTHER_OPERATION_ID),
  );
  assert.equal(saved.success, true);
  assert.equal(finished.success, true);
  if (finished.success) assert.equal(finished.data.responses[0].observation, OPERATION_ID);
  assert.equal(database.inspection.status, "COMPLETED");
});

test("a response UUID cannot be reused for conclusion", async () => {
  const database = new InspectionDatabase();
  database.install();
  assert.equal((await save()).success, true);
  const result = await finish(OPERATION_ID);
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.code, "CONFLICT");
  assert.equal(database.inspection.status, "IN_PROGRESS");
  assert.equal(database.operations.size, 1);
});

for (const offline of [false, true]) {
  test(`${offline ? "offline" : "online"} response update loses to a conclusion holding the lock`, async () => {
    const database = new InspectionDatabase("inspection");
    database.install();
    const [finished, saved] = await interleave(
      database,
      () => finish(),
      () =>
        offline
          ? save()
          : service().saveInspectionResponse({
              userId: USER_ID,
              inspectionId: INSPECTION_ID,
              snapshotItemId: ITEM_ID,
              status: "NOT_APPLICABLE",
              observation: "late change",
            }),
    );
    assert.equal(finished.success, true);
    assert.equal(saved.success, false);
    if (!saved.success) assert.equal(saved.code, "CONFLICT");
    assert.equal(database.writes, 0);
    assert.equal(database.operations.size, 0);
    assert.equal(database.inspection.responses[0].observation, "original");
  });
}

for (const offline of [false, true]) {
  test(`distinct concurrent ${offline ? "offline" : "online"} conclusions allow one state transition`, async () => {
    const database = new InspectionDatabase("inspection");
    database.install();
    const [first, second] = await interleave(
      database,
      () => finish(offline ? OPERATION_ID : undefined),
      () => finish(offline ? OTHER_OPERATION_ID : undefined),
    );
    assert.equal(first.success, true);
    assert.equal(second.success, false);
    if (!second.success) assert.equal(second.code, "CONFLICT");
    assert.equal(database.inspection.status, "COMPLETED");
    assert.equal(database.operations.size, offline ? 1 : 0);
  });
}

test("response revisions advance when the server clock shares or precedes the previous millisecond", async () => {
  const database = new InspectionDatabase();
  database.install();
  mock.method(Date, "now", () => REVISION.getTime());
  assert.equal((await save()).success, true);
  assert.equal(database.inspection.responses[0].updatedAt.getTime(), REVISION.getTime() + 1);
  const stale = await save(OTHER_OPERATION_ID);
  assert.equal(stale.success, false);
  const nextRevision = database.inspection.responses[0].updatedAt;
  mock.method(Date, "now", () => REVISION.getTime() - 1000);
  assert.equal((await save(OTHER_OPERATION_ID, nextRevision)).success, true);
  assert.equal(database.inspection.responses[0].updatedAt.getTime(), REVISION.getTime() + 2);
});

test("confirmed response retry remains idempotent after completion; divergent payload conflicts", async () => {
  const database = new InspectionDatabase();
  database.install();
  assert.equal((await save()).success, true);
  assert.equal((await finish(OTHER_OPERATION_ID)).success, true);
  assert.equal((await save()).success, true);
  const conflict = await save(OPERATION_ID, null);
  assert.equal(conflict.success, false);
  if (!conflict.success) assert.equal(conflict.code, "CONFLICT");
  assert.equal(database.writes, 1);
  assert.equal(database.operations.size, 2);
});

test("another user cannot save or conclude, including offline requests", async () => {
  const database = new InspectionDatabase();
  database.install();
  const otherUser = OTHER_OPERATION_ID;
  for (const offline of [false, true]) {
    const saved = await service().saveInspectionResponse({
      userId: otherUser,
      inspectionId: INSPECTION_ID,
      snapshotItemId: ITEM_ID,
      status: "COMPLIANT",
      ...(offline
        ? {
            offlineOperation: {
              id: OPERATION_ID,
              userId: otherUser,
              clientCreatedAt: REVISION,
              expectedResponseUpdatedAt: REVISION,
            },
          }
        : {}),
    });
    const finished = await service().finishInspection(
      INSPECTION_ID,
      otherUser,
      offline ? { id: OPERATION_ID, userId: otherUser, clientCreatedAt: REVISION } : undefined,
    );
    for (const result of [saved, finished]) {
      assert.equal(result.success, false);
      if (!result.success) assert.equal(result.code, "NOT_FOUND");
    }
  }
  assert.equal(database.writes, 0);
  assert.equal(database.operations.size, 0);
});

test("conclusion rejects missing required responses or historical snapshot without persisting", async () => {
  const database = new InspectionDatabase();
  database.install();
  database.inspection.responses = [];
  assert.equal((await finish(OPERATION_ID)).success, false);
  database.inspection.snapshot = null;
  assert.equal((await finish()).success, false);
  assert.equal(database.inspection.status, "IN_PROGRESS");
  assert.equal(database.operations.size, 0);
});

test("NOT_APPLICABLE satisfies required items and optional items may remain unanswered", async () => {
  const database = new InspectionDatabase();
  database.install();
  database.inspection.responses[0].status = "NOT_APPLICABLE";
  const item = database.inspection.snapshot!.items[0];
  database.inspection.snapshot!.items.push({
    ...item,
    id: OTHER_OPERATION_ID,
    orderIndex: 2,
    isRequired: false,
  });
  assert.equal((await finish()).success, true);
  assert.equal(database.inspection.responses.length, 1);
});

for (const status of ["COMPLETED", "CANCELLED"] as const) {
  test(`${status} rejects fresh response writes and conclusions`, async () => {
    const database = new InspectionDatabase();
    database.install();
    database.inspection.status = status;
    assert.equal((await save()).success, false);
    assert.equal((await finish(OPERATION_ID)).success, false);
    assert.equal(database.inspection.status, status);
    assert.equal(database.operations.size, 0);
    assert.equal(database.writes, 0);
  });
}

test("failed acknowledgement rolls back response, NC, inspection state and conclusion", async () => {
  const database = new InspectionDatabase();
  database.install();
  database.inspection.status = "PLANNED";
  database.failOperationInsert = true;
  await assert.rejects(
    service().saveInspectionResponse({
      userId: USER_ID,
      inspectionId: INSPECTION_ID,
      snapshotItemId: ITEM_ID,
      status: "NON_COMPLIANT",
      offlineOperation: {
        id: OPERATION_ID,
        userId: USER_ID,
        clientCreatedAt: REVISION,
        expectedResponseUpdatedAt: REVISION,
      },
    }),
    /simulated acknowledgement failure/,
  );
  assert.equal(database.inspection.status, "PLANNED");
  assert.equal(database.inspection.responses[0].observation, "original");
  assert.equal(database.inspection.responses[0].nonConformity, null);
  await assert.rejects(finish(OPERATION_ID), /simulated acknowledgement failure/);
  assert.equal(database.inspection.status, "PLANNED");
  assert.equal(database.operations.size, 0);
  assert.equal(database.writes, 0);
  database.failOperationInsert = false;
  assert.equal((await save()).success, true);
  assert.equal((await finish(OTHER_OPERATION_ID)).success, true);
});

function responseFixture(): InspectionWithRelations["responses"][number] {
  return {
    id: OTHER_OPERATION_ID,
    inspectionId: INSPECTION_ID,
    snapshotItemId: ITEM_ID,
    checklistItemId: null,
    status: "COMPLIANT",
    observation: "original",
    clientUpdatedAt: null,
    createdAt: REVISION,
    updatedAt: REVISION,
    snapshotItem: null,
    checklistItem: null,
    nonConformity: null,
  };
}

function inspectionFixture(): InspectionWithRelations {
  const timestamps = { createdAt: REVISION, updatedAt: REVISION, deletedAt: null };
  return {
    id: INSPECTION_ID,
    userId: USER_ID,
    companyId: USER_ID,
    checklistId: USER_ID,
    checklistVersionId: USER_ID,
    inspectionDate: REVISION,
    status: "IN_PROGRESS",
    syncStatus: "SYNCED",
    notes: null,
    ...timestamps,
    user: {
      id: USER_ID,
      name: "Owner",
      email: "owner@example.com",
      role: "TECHNICIAN",
      ...timestamps,
    },
    company: {
      id: USER_ID,
      corporateName: "Company",
      tradeName: null,
      cnpj: null,
      cnae: "0000-0/00",
      riskLevel: 1,
      employeeCount: 1,
      address: null,
      notes: null,
      createdById: USER_ID,
      ...timestamps,
    },
    checklist: {
      id: USER_ID,
      title: "Checklist",
      description: null,
      isTemplate: false,
      isOfficial: false,
      isActive: true,
      createdById: USER_ID,
      ...timestamps,
    },
    checklistVersion: {
      id: USER_ID,
      checklistId: USER_ID,
      versionNumber: 1,
      status: "PUBLISHED",
      title: "Checklist",
      description: null,
      contentSchemaVersion: 1,
      contentHash: "a".repeat(64),
      createdById: USER_ID,
      publishedById: USER_ID,
      publishedAt: REVISION,
      createdAt: REVISION,
      updatedAt: REVISION,
    },
    snapshot: {
      id: INSPECTION_ID,
      inspectionId: INSPECTION_ID,
      sourceChecklistId: USER_ID,
      sourceChecklistVersionId: USER_ID,
      sourceVersionNumber: 1,
      title: "Checklist",
      description: null,
      isTemplate: false,
      snapshotSchemaVersion: 1,
      contentHash: "a".repeat(64),
      origin: "INSPECTION_CREATION",
      integrityStatus: "VERIFIED",
      capturedAt: REVISION,
      items: [
        {
          id: ITEM_ID,
          snapshotId: INSPECTION_ID,
          sourceVersionItemId: ITEM_ID,
          sourceChecklistItemId: null,
          description: "Required item",
          orderIndex: 1,
          isRequired: true,
          standards: [],
        },
      ],
    },
    responses: [responseFixture()],
  };
}
