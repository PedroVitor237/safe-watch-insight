import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import type { Result } from "../../src/server/responses";
import {
  clearEvents,
  closeHarness,
  conflict,
  events,
  finish,
  fixture,
  gate,
  installHarness,
  observer,
  prisma,
  race,
  save,
  service,
  state,
  unwrap,
  value,
  waitBlockedBy,
} from "./postgres-harness";

before(installHarness);
after(closeHarness);

test("distinct conclusions of the same inspection: one success, one application 409", async () => {
  const f = await fixture();
  unwrap(await save(f, null));
  await clearEvents(f);
  const result = await race(
    f.inspection.id,
    () => finish(f),
    () => finish(f),
  );
  unwrap(value(result.first));
  conflict(value(result.second));
  const persisted = await state(f);
  assert.equal(persisted.status, "COMPLETED");
  assert.equal(persisted.responses.length, 1);
  assert.equal(
    persisted.offlineSyncOperations.filter((op) => op.type === "FINISH_INSPECTION").length,
    1,
  );
  assert.equal((await events(f)).filter((e) => e.kind === "Inspection:UPDATE").length, 1);
});

test("same response revision on independent connections: loser cannot overwrite", async () => {
  const f = await fixture();
  const original = unwrap(await save(f, null));
  await clearEvents(f);
  const result = await race(
    f.inspection.id,
    () => save(f, original.updatedAt, "winner"),
    () => save(f, original.updatedAt, "loser"),
  );
  const winner = unwrap(value(result.first));
  conflict(value(result.second));
  assert.ok(winner.updatedAt > original.updatedAt);
  const persisted = await state(f);
  assert.equal(persisted.responses[0].observation, "winner");
  assert.equal(persisted.responses[0].id, original.id);
  assert.equal(persisted.offlineSyncOperations.length, 2);
  assert.equal((await events(f)).filter((e) => e.kind === "InspectionResponse:UPDATE").length, 1);
  assert.ok((await events(f)).every((e) => e.isolation === "read committed"));
});

test("competing older and newer revisions: stale edit stays rejected after the lock wait", async () => {
  const f = await fixture();
  const old = unwrap(await save(f, null));
  const newer = unwrap(await save(f, old.updatedAt, "newer"));
  const result = await race(
    f.inspection.id,
    () => save(f, newer.updatedAt, "newest"),
    () => save(f, old.updatedAt, "stale"),
  );
  unwrap(value(result.first));
  conflict(value(result.second));
  assert.equal((await state(f)).responses[0].observation, "newest");
  assert.equal((await state(f)).offlineSyncOperations.length, 3);
});

test("two creations expecting absence: exactly one response and NC", async () => {
  const f = await fixture();
  const result = await race(
    f.inspection.id,
    () => save(f, null),
    () => save(f, null, "loser"),
  );
  unwrap(value(result.first));
  conflict(value(result.second));
  const persisted = await state(f);
  assert.equal(persisted.responses.length, 1);
  assert.ok(persisted.responses[0].nonConformity);
  assert.equal(persisted.offlineSyncOperations.length, 1);
});

test("simultaneous identical UUID/payload response retries mutate once", async () => {
  const f = await fixture();
  const id = randomUUID();
  await clearEvents(f);
  const result = await race(
    f.inspection.id,
    () => save(f, null, "identical", id),
    () => save(f, null, "identical", id),
  );
  assert.deepEqual(unwrap(value(result.first)), unwrap(value(result.second)));
  const persisted = await state(f);
  assert.equal(persisted.offlineSyncOperations.length, 1);
  const trace = await events(f);
  assert.equal(trace.filter((e) => e.kind.startsWith("InspectionResponse:")).length, 1);
  assert.equal(trace.filter((e) => e.kind.startsWith("NonConformity:")).length, 1);
  assert.equal(new Set(trace.map((e) => e.tx)).size, 1);
});

test("simultaneous identical conclusion UUID/payload retries mutate once", async () => {
  const f = await fixture();
  unwrap(await save(f, null));
  await clearEvents(f);
  const id = randomUUID();
  const result = await race(
    f.inspection.id,
    () => finish(f, id),
    () => finish(f, id),
  );
  assert.deepEqual(unwrap(value(result.first)), unwrap(value(result.second)));
  assert.equal((await state(f)).status, "COMPLETED");
  assert.equal((await events(f)).filter((e) => e.kind === "Inspection:UPDATE").length, 1);
  assert.equal((await events(f)).filter((e) => e.kind === "OfflineSyncOperation:INSERT").length, 1);
});

test("same response UUID with different payload: application 409 without a second write", async () => {
  const f = await fixture();
  const id = randomUUID();
  const result = await race(
    f.inspection.id,
    () => save(f, null, "accepted", id),
    () => save(f, null, "divergent", id),
  );
  unwrap(value(result.first));
  conflict(value(result.second));
  assert.equal((await state(f)).responses[0].observation, "accepted");
  assert.equal((await state(f)).offlineSyncOperations.length, 1);
});

test("same conclusion UUID with different client timestamp: application 409", async () => {
  const f = await fixture();
  unwrap(await save(f, null));
  const id = randomUUID();
  const result = await race(
    f.inspection.id,
    () => finish(f, id),
    () => finish(f, id, new Date("2026-10-12T12:00:01Z")),
  );
  unwrap(value(result.first));
  conflict(value(result.second));
  assert.equal(
    (await state(f)).offlineSyncOperations.filter((op) => op.type === "FINISH_INSPECTION").length,
    1,
  );
});

test("last required response holds lock first: conclusion waits and includes committed response", async () => {
  const f = await fixture();
  const result = await race(
    f.inspection.id,
    () => save(f, null),
    () => finish(f),
  );
  const response = unwrap(value(result.first));
  const completed = unwrap(value(result.second));
  assert.equal(completed.status, "COMPLETED");
  assert.equal(completed.responses[0].id, response.id);
  const trace = await events(f);
  assert.equal(
    new Set(trace.filter((e) => e.kind === "Inspection:UPDATE").map((e) => e.pid)).size,
    2,
  );
  assert.equal(
    new Set(trace.filter((e) => e.kind === "Inspection:UPDATE").map((e) => e.tx)).size,
    2,
  );
  assert.equal((await state(f)).offlineSyncOperations.length, 2);
});

test("response edit holds lock first: completion observes the latest observation and archived NC", async () => {
  const f = await fixture();
  const original = unwrap(await save(f, null));
  const result = await race(
    f.inspection.id,
    () =>
      service.saveInspectionResponse({
        userId: f.userId,
        inspectionId: f.inspection.id,
        snapshotItemId: f.itemId,
        status: "COMPLIANT",
        observation: "latest",
      }),
    () => finish(f),
  );
  unwrap(value(result.first));
  unwrap(value(result.second));
  const persisted = await state(f);
  assert.equal(persisted.responses[0].id, original.id);
  assert.equal(persisted.responses[0].observation, "latest");
  assert.ok(persisted.responses[0].nonConformity?.deletedAt);
  assert.equal(persisted.status, "COMPLETED");
});

test("conclusion holds lock first: new offline edit is 409 and identical earlier retry remains successful", async () => {
  const f = await fixture();
  const id = randomUUID();
  const original = unwrap(await save(f, null, "original", id));
  const result = await race(
    f.inspection.id,
    () => finish(f),
    () => save(f, original.updatedAt, "late"),
  );
  unwrap(value(result.first));
  conflict(value(result.second));
  const before = await state(f);
  unwrap(await save(f, null, "original", id));
  assert.deepEqual(await state(f), before);
});

test("response/NC/state/acknowledgement roll back together; waiting retry succeeds", async () => {
  const f = await fixture();
  const id = randomUUID();
  await clearEvents(f);
  await observer.query("INSERT INTO concurrency_harness.failures VALUES ($1)", [id]);
  const result = await race(
    id,
    () => save(f, null, "rolled back", id),
    () => save(f, null, "retry"),
    "acknowledgement",
  );
  assert.ok(
    "error" in result.first,
    "Injected database failure must propagate, not become a domain conflict.",
  );
  unwrap(value(result.second));
  const persisted = await state(f);
  assert.equal(persisted.responses.length, 1);
  assert.equal(persisted.responses[0].observation, "retry");
  assert.equal(persisted.offlineSyncOperations.length, 1);
  assert.equal((await events(f)).filter((e) => e.kind.startsWith("NonConformity:")).length, 1);
  await observer.query("DELETE FROM concurrency_harness.failures WHERE id=$1", [id]);
  const revision = persisted.responses[0].updatedAt;
  unwrap(await save(f, revision, "rolled back", id));
  assert.equal((await state(f)).offlineSyncOperations.length, 2);
});

test("conclusion rollback releases its lock without partial completion; same UUID retry succeeds", async () => {
  const f = await fixture();
  unwrap(await save(f, null));
  const before = await state(f);
  const id = randomUUID();
  await observer.query("INSERT INTO concurrency_harness.failures VALUES ($1)", [id]);
  await assert.rejects(finish(f, id));
  assert.deepEqual(await state(f), before);
  await observer.query("DELETE FROM concurrency_harness.failures WHERE id=$1", [id]);
  unwrap(await finish(f, id));
  assert.equal((await state(f)).status, "COMPLETED");
});

test("ownership isolation while another transaction holds the inspection lock", async () => {
  const f = await fixture();
  const barrier = await gate(f.inspection.id);
  const owner = save(f, null);
  try {
    await waitBlockedBy(barrier.pid);
    const unauthorized = await Promise.all([
      service.finishInspection(f.inspection.id, f.otherUserId),
      service.saveInspectionResponse({
        userId: f.otherUserId,
        inspectionId: f.inspection.id,
        snapshotItemId: f.itemId,
        status: "COMPLIANT",
      }),
    ]);
    for (const result of unauthorized) {
      assert.equal(result.success, false);
      if (!result.success) assert.equal(result.statusCode, 404);
    }
    await barrier.release();
    unwrap(await owner);
    assert.equal((await state(f)).offlineSyncOperations[0].userId, f.userId);
    assert.equal(await prisma.offlineSyncOperation.count({ where: { userId: f.otherUserId } }), 0);
  } finally {
    await barrier.release();
    await owner;
  }
});

for (const type of ["response", "conclusion"] as const) {
  test(`UUID collision across independent inspections (${type}): unique-index waiter must become application 409`, async () => {
    const first = await fixture();
    const second = await fixture();
    if (type === "conclusion") {
      unwrap(await save(first, null));
      unwrap(await save(second, null));
    }
    const before = await state(second);
    const id = randomUUID();
    const operation = (f: typeof first): Promise<Result<unknown>> =>
      type === "response" ? save(f, null, "collision", id) : finish(f, id);
    const result = await race(
      id,
      () => operation(first),
      () => operation(second),
      "acknowledgement",
    );
    assert.deepEqual(
      await state(second),
      before,
      "Losing transaction must roll back all domain writes.",
    );
    assert.equal(await prisma.offlineSyncOperation.count({ where: { id } }), 1);
    unwrap(value(result.first));
    conflict(value(result.second));
  });
}

test("PostgreSQL serialization failure is SQLSTATE 40001, not application conflict or transport", async () => {
  await observer.query(
    "CREATE TABLE IF NOT EXISTS concurrency_harness.probe (id integer PRIMARY KEY, value integer); TRUNCATE concurrency_harness.probe; INSERT INTO concurrency_harness.probe VALUES (1,0),(2,0)",
  );
  const a = await observer.connect();
  const b = await observer.connect();
  try {
    await b.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
    await b.query("SELECT * FROM concurrency_harness.probe WHERE id=1");
    await a.query("UPDATE concurrency_harness.probe SET value=value+1 WHERE id=1");
    await assert.rejects(
      b.query("UPDATE concurrency_harness.probe SET value=value+1 WHERE id=1"),
      (error: unknown) => error instanceof pgError && error.code === "40001",
    );
  } finally {
    await b.query("ROLLBACK");
    a.release();
    b.release();
  }
  assert.equal(
    (await observer.query("SELECT value FROM concurrency_harness.probe WHERE id=1")).rows[0].value,
    1,
  );
});

test("opposite lock ordering control produces SQLSTATE 40P01; application races do not", async () => {
  await observer.query(
    "CREATE TABLE IF NOT EXISTS concurrency_harness.probe (id integer PRIMARY KEY, value integer); TRUNCATE concurrency_harness.probe; INSERT INTO concurrency_harness.probe VALUES (1,0),(2,0)",
  );
  const a = await observer.connect();
  const b = await observer.connect();
  try {
    await a.query("BEGIN");
    await b.query("BEGIN");
    await a.query("UPDATE concurrency_harness.probe SET value=value+1 WHERE id=1");
    await b.query("UPDATE concurrency_harness.probe SET value=value+1 WHERE id=2");
    const pid = (await b.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid;
    const first = a.query("UPDATE concurrency_harness.probe SET value=value+1 WHERE id=2").then(
      () => "ok",
      (error: unknown) => error,
    );
    // Observer pool has a distinct application name; observe this control explicitly.
    const deadline = Date.now() + 8000;
    let observedWait = false;
    while (Date.now() < deadline) {
      const blocked = await observer.query(
        "SELECT 1 FROM pg_stat_activity WHERE $1=ANY(pg_blocking_pids(pid))",
        [pid],
      );
      if (blocked.rowCount) {
        observedWait = true;
        break;
      }
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
    assert.ok(
      observedWait,
      "The control must observe a real lock wait before forming the deadlock.",
    );
    const second = b.query("UPDATE concurrency_harness.probe SET value=value+1 WHERE id=1").then(
      () => "ok",
      (error: unknown) => error,
    );
    const outcome = await Promise.race([first, second]);
    assert.ok(outcome instanceof pgError);
    assert.equal(outcome.code, "40P01");
    await a.query("ROLLBACK");
    await b.query("ROLLBACK");
    await Promise.all([first, second]);
  } finally {
    await a.query("ROLLBACK");
    await b.query("ROLLBACK");
    a.release();
    b.release();
  }
  assert.deepEqual(
    (await observer.query("SELECT id,value FROM concurrency_harness.probe ORDER BY id")).rows,
    [
      { id: 1, value: 0 },
      { id: 2, value: 0 },
    ],
  );
});

// pg preserves native SQLSTATE for the control experiments.
import pg from "pg";
const pgError = pg.DatabaseError;
