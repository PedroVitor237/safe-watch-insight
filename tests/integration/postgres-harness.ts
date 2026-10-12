import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import bcrypt from "bcrypt";
import pg from "pg";
import type { Result } from "../../src/server/responses";
import type { InspectionWithRelations } from "../../src/server/repositories/inspection.repository";

// Guard runs BEFORE importing the application singleton. Never import dotenv here.
const url = new URL(process.env.DATABASE_URL ?? "postgresql://invalid");
assert.equal(url.hostname, "127.0.0.1", "Only the runner's loopback cluster is allowed.");
assert.equal(url.pathname, "/swi_concurrency_test");
assert.match(process.env.CONCURRENCY_TEST_TOKEN ?? "", /^[0-9a-f-]{36}$/);
export const observer = new pg.Pool({
  connectionString: url.toString(),
  application_name: "ic_p6_03_observer",
});
const authorization = await observer.query(
  "SELECT 1 FROM concurrency_harness.authorization WHERE token=$1",
  [process.env.CONCURRENCY_TEST_TOKEN],
);
assert.equal(authorization.rowCount, 1, "Database was not created by the disposable runner.");
export const { prisma } = await import("../../src/server/prisma/client");
export const { inspectionResponseService: service } =
  await import("../../src/server/services/inspection-response.service");
const { inspectionService } = await import("../../src/server/services/inspection.service");
const { checklistService } = await import("../../src/server/services/checklist.service");
const { checklistItemService } = await import("../../src/server/services/checklist-item.service");
const { checklistVersionService } =
  await import("../../src/server/services/checklist-version.service");

export function unwrap<T>(result: Result<T>): T {
  if (!result.success) assert.fail(`${result.code}: ${result.message}`);
  return result.data;
}

export function conflict(result: Result<unknown>): void {
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.code, "CONFLICT");
    assert.equal(result.statusCode, 409);
  }
}

export interface Fixture {
  userId: string;
  otherUserId: string;
  email: string;
  otherEmail: string;
  password: string;
  inspection: InspectionWithRelations;
  itemId: string;
}

export async function fixture(): Promise<Fixture> {
  const password = randomUUID();
  const hash = await bcrypt.hash(password, 12);
  const users = await Promise.all(
    ["owner", "other"].map((label) =>
      prisma.user.create({
        data: {
          name: `Concurrency ${label}`,
          email: `${randomUUID()}@test.invalid`,
          password: hash,
          role: "TECHNICIAN",
        },
      }),
    ),
  );
  const userId = users[0].id;
  const company = await prisma.company.create({
    data: {
      corporateName: "Disposable concurrency fixture",
      cnae: "0000000",
      riskLevel: 1,
      employeeCount: 1,
      createdById: userId,
    },
  });
  const checklist = unwrap(
    await checklistService.createChecklist({ title: "Concurrency fixture", createdById: userId }),
  );
  unwrap(
    await checklistItemService.createChecklistItem({
      checklistId: checklist.id,
      description: "Required fixture item",
      isRequired: true,
      updatedById: userId,
    }),
  );
  unwrap(
    await checklistItemService.createChecklistItem({
      checklistId: checklist.id,
      description: "Optional fixture item",
      isRequired: false,
      updatedById: userId,
    }),
  );
  unwrap(await checklistVersionService.publishDraft(checklist.id, userId));
  const inspection = unwrap(
    await inspectionService.createInspection({
      userId,
      companyId: company.id,
      checklistId: checklist.id,
      inspectionDate: new Date(),
    }),
  );
  assert.ok(inspection.snapshot);
  return {
    userId,
    otherUserId: users[1].id,
    email: users[0].email,
    otherEmail: users[1].email,
    password,
    inspection,
    itemId: inspection.snapshot.items[0].id,
  };
}

export async function save(
  f: Fixture,
  revision: Date | null,
  observation = "first",
  id = randomUUID(),
) {
  return service.saveInspectionResponse({
    userId: f.userId,
    inspectionId: f.inspection.id,
    snapshotItemId: f.itemId,
    status: "NON_COMPLIANT",
    observation,
    offlineOperation: {
      id,
      userId: f.userId,
      clientCreatedAt: new Date("2026-10-12T12:00:00Z"),
      expectedResponseUpdatedAt: revision,
    },
  });
}

export function finish(
  f: Fixture,
  id = randomUUID(),
  createdAt = new Date("2026-10-12T12:00:00Z"),
) {
  return service.finishInspection(f.inspection.id, f.userId, {
    id,
    userId: f.userId,
    clientCreatedAt: createdAt,
  });
}

export async function state(f: Fixture) {
  return prisma.inspection.findUniqueOrThrow({
    where: { id: f.inspection.id },
    include: {
      responses: { include: { nonConformity: true } },
      offlineSyncOperations: true,
      snapshot: { include: { items: true } },
    },
  });
}

export async function installHarness(): Promise<void> {
  await observer.query(`
    CREATE TABLE IF NOT EXISTS concurrency_harness.gates (id uuid PRIMARY KEY, point text NOT NULL, key integer NOT NULL);
    CREATE TABLE IF NOT EXISTS concurrency_harness.failures (id uuid PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS concurrency_harness.events (
      kind text NOT NULL, row_id uuid NOT NULL, inspection_id uuid NOT NULL,
      pid integer NOT NULL, tx bigint NOT NULL, isolation text NOT NULL
    );
    CREATE OR REPLACE FUNCTION concurrency_harness.before_write() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE gate_key integer; point_name text;
    BEGIN
      point_name := CASE TG_TABLE_NAME WHEN 'Inspection' THEN 'inspection' WHEN 'InspectionResponse' THEN 'response' ELSE 'acknowledgement' END;
      SELECT key INTO gate_key FROM concurrency_harness.gates WHERE id=NEW.id AND point=point_name AND point<>'acknowledgement';
      IF gate_key IS NOT NULL THEN PERFORM pg_advisory_xact_lock(6303, gate_key); END IF;
      RETURN NEW;
    END $$;
    CREATE OR REPLACE FUNCTION concurrency_harness.trace_write() RETURNS trigger LANGUAGE plpgsql AS $$
    DECLARE inspection_id uuid; gate_key integer;
    BEGIN
      IF TG_TABLE_NAME='Inspection' THEN inspection_id:=NEW.id;
      ELSIF TG_TABLE_NAME='NonConformity' THEN SELECT "inspectionId" INTO inspection_id FROM "InspectionResponse" WHERE id=NEW."inspectionResponseId";
      ELSE inspection_id:=NEW."inspectionId"; END IF;
      INSERT INTO concurrency_harness.events VALUES (TG_TABLE_NAME || ':' || TG_OP, NEW.id, inspection_id, pg_backend_pid(), txid_current(), current_setting('transaction_isolation'));
      IF TG_TABLE_NAME='OfflineSyncOperation' THEN
        SELECT key INTO gate_key FROM concurrency_harness.gates WHERE id=NEW.id AND point='acknowledgement';
        IF gate_key IS NOT NULL THEN PERFORM pg_advisory_xact_lock(6303, gate_key); END IF;
        IF EXISTS (SELECT 1 FROM concurrency_harness.failures WHERE id=NEW.id) THEN
          RAISE EXCEPTION 'injected acknowledgement failure' USING ERRCODE='23514';
        END IF;
      END IF;
      RETURN NEW;
    END $$;
  `);
  for (const table of [
    "Inspection",
    "InspectionResponse",
    "OfflineSyncOperation",
    "NonConformity",
  ]) {
    await observer.query(
      `DROP TRIGGER IF EXISTS concurrency_trace ON "${table}"; CREATE TRIGGER concurrency_trace AFTER INSERT OR UPDATE ON "${table}" FOR EACH ROW EXECUTE FUNCTION concurrency_harness.trace_write()`,
    );
    if (table !== "NonConformity")
      await observer.query(
        `DROP TRIGGER IF EXISTS concurrency_gate ON "${table}"; CREATE TRIGGER concurrency_gate BEFORE INSERT OR UPDATE ON "${table}" FOR EACH ROW EXECUTE FUNCTION concurrency_harness.before_write()`,
      );
  }
}

export async function events(f: Fixture) {
  const result = await observer.query<{ kind: string; pid: number; tx: string; isolation: string }>(
    "SELECT kind,pid,tx::text,isolation FROM concurrency_harness.events WHERE inspection_id=$1",
    [f.inspection.id],
  );
  return result.rows;
}

export async function clearEvents(f: Fixture) {
  await observer.query("DELETE FROM concurrency_harness.events WHERE inspection_id=$1", [
    f.inspection.id,
  ]);
}

export interface WaitingConnection {
  pid: number;
  wait_event: string | null;
  blockers: number[];
}
export async function waitBlockedBy(pid: number): Promise<WaitingConnection> {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    const result = await observer.query<WaitingConnection>(
      `
      SELECT pid,wait_event,pg_blocking_pids(pid) AS blockers FROM pg_stat_activity
      WHERE application_name='ic_p6_03_application' AND $1=ANY(pg_blocking_pids(pid))`,
      [pid],
    );
    // pg_stat_activity and pg_blocking_pids read live backend state separately.
    // At the instant a backend enters a wait, blockers can be visible before
    // wait_event is populated. Require both observations before releasing.
    if (result.rows[0]?.wait_event) return result.rows[0];
    await delay(10); // Poll an observed condition; elapsed time never releases a barrier.
  }
  throw new Error(`No PostgreSQL lock waiter for backend ${pid}.`);
}

let nextKey = 0;
export async function gate(
  id: string,
  point: "inspection" | "response" | "acknowledgement" = "inspection",
) {
  const controller = await observer.connect();
  const key = ++nextKey;
  const pid = (await controller.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0]
    .pid;
  await controller.query("SELECT pg_advisory_lock(6303,$1)", [key]);
  await controller.query("INSERT INTO concurrency_harness.gates VALUES ($1,$2,$3)", [
    id,
    point,
    key,
  ]);
  let released = false;
  return {
    pid,
    async release() {
      if (released) return;
      released = true;
      try {
        await controller.query("DELETE FROM concurrency_harness.gates WHERE id=$1", [id]);
        await controller.query("SELECT pg_advisory_unlock(6303,$1)", [key]);
      } finally {
        controller.release();
      }
    },
  };
}

export async function race<A, B>(
  id: string,
  first: () => Promise<A>,
  second: () => Promise<B>,
  point: "inspection" | "acknowledgement" = "inspection",
) {
  const barrier = await gate(id, point);
  const firstResult = first();
  // Attach rejection handlers immediately while deliberately holding SQL locks.
  const firstSettled = firstResult.then(
    (value) => ({ value }),
    (error) => ({ error: error as unknown }),
  );
  let secondSettled: Promise<{ value: B } | { error: unknown }> | undefined;
  try {
    const holder = await waitBlockedBy(barrier.pid);
    assert.equal(holder.wait_event, "advisory");
    secondSettled = second().then(
      (value) => ({ value }),
      (error) => ({ error: error as unknown }),
    );
    const waiter = await waitBlockedBy(holder.pid);
    assert.notEqual(
      holder.pid,
      waiter.pid,
      "Transactions must use independent backend connections.",
    );
    assert.notEqual(
      waiter.wait_event,
      "advisory",
      "Follower must wait on the real application lock.",
    );
    console.log(
      `PostgreSQL barrier: holder=${holder.pid}, contender=${waiter.pid}, wait=${waiter.wait_event}, blocker=${holder.pid}`,
    );
    return { first: await releaseAndGet(), second: await secondSettled, holder, waiter };
  } finally {
    await barrier.release();
    await firstSettled;
    await secondSettled;
  }
  async function releaseAndGet() {
    await barrier.release();
    return firstSettled;
  }
}

export function value<T>(outcome: { value: T } | { error: unknown }): T {
  if ("error" in outcome) throw outcome.error;
  return outcome.value;
}

export async function closeHarness(): Promise<void> {
  await prisma.$disconnect();
  await observer.end();
}
