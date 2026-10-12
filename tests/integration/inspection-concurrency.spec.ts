import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import type { SaveInspectionResponseSchemaInput } from "../../src/server/schemas/inspection-response.schema";
import type { Result } from "../../src/server/responses";
import {
  clearEvents,
  closeHarness,
  conflict,
  events,
  fixture,
  installHarness,
  race,
  save,
  state,
  unwrap,
  value,
  type Fixture,
} from "./postgres-harness";

test.beforeAll(installHarness);
test.afterAll(closeHarness);

async function login(page: Page, f: Fixture, other = false) {
  await page.addInitScript(() => {
    Object.assign(window, {
      process: { env: { TSS_SERVER_FN_BASE: "/_serverFn/", NODE_ENV: "development" } },
    });
  });
  await page.goto("/offline.html");
  const result = await page.evaluate(
    async (credentials) => {
      const path = "/src/lib/api/auth.functions.ts";
      const api = (await import(path)) as typeof import("../../src/lib/api/auth.functions");
      return api.login({ data: credentials });
    },
    { email: other ? f.otherEmail : f.email, password: f.password },
  );
  unwrap(result);
}

function httpStatuses(page: Page): number[] {
  const statuses: number[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/_serverFn/")) statuses.push(response.status());
  });
  return statuses;
}

function saveHttp(page: Page, input: SaveInspectionResponseSchemaInput) {
  return page.evaluate(async (data) => {
    const path = "/src/lib/api/inspection-response.functions.ts";
    const api = (await import(
      path
    )) as typeof import("../../src/lib/api/inspection-response.functions");
    return api.saveInspectionResponse({ data });
  }, input);
}

function finishHttp(page: Page, f: Fixture, id = randomUUID()) {
  return page.evaluate(
    async (data) => {
      const path = "/src/lib/api/inspection-response.functions.ts";
      const api = (await import(
        path
      )) as typeof import("../../src/lib/api/inspection-response.functions");
      return api.finishInspection({ data });
    },
    {
      inspectionId: f.inspection.id,
      operationId: id,
      clientCreatedAt: new Date("2026-10-12T12:00:00Z"),
    },
  );
}

function input(
  f: Fixture,
  revision: Date | null = null,
  observation = "HTTP response",
  id = randomUUID(),
): SaveInspectionResponseSchemaInput {
  return {
    inspectionId: f.inspection.id,
    snapshotItemId: f.itemId,
    status: "NON_COMPLIANT",
    observation,
    operationId: id,
    clientCreatedAt: new Date("2026-10-12T12:00:00Z"),
    expectedResponseUpdatedAt: revision,
  };
}

test("two real HTTP conclusions: one success, one logical 409 in HTTP 200", async ({
  page,
  context,
}) => {
  const f = await fixture();
  unwrap(await save(f, null));
  const other = await context.newPage();
  await login(page, f);
  await login(other, f);
  const firstStatuses = httpStatuses(page);
  const secondStatuses = httpStatuses(other);
  const result = await race(
    f.inspection.id,
    () => finishHttp(page, f),
    () => finishHttp(other, f),
  );
  unwrap(value(result.first));
  conflict(value(result.second));
  expect(firstStatuses).toEqual([200]);
  expect(secondStatuses).toEqual([200]);
  expect((await state(f)).status).toBe("COMPLETED");
  expect(
    (await state(f)).offlineSyncOperations.filter((op) => op.type === "FINISH_INSPECTION"),
  ).toHaveLength(1);
});

test("identical and divergent UUID HTTP retries across tabs preserve a single mutation", async ({
  page,
  context,
}) => {
  const f = await fixture();
  const other = await context.newPage();
  await login(page, f);
  await login(other, f);
  await clearEvents(f);
  const payload = input(f);
  const result = await race(
    f.inspection.id,
    () => saveHttp(page, payload),
    () => saveHttp(other, payload),
  );
  expect(unwrap(value(result.first))).toEqual(unwrap(value(result.second)));
  conflict(await saveHttp(other, { ...payload, observation: "divergent" }));
  const before = await state(f);
  const id = randomUUID();
  const completion = await race(
    f.inspection.id,
    () => finishHttp(page, f, id),
    () => finishHttp(other, f, id),
  );
  unwrap(value(completion.first));
  unwrap(value(completion.second));
  expect((await state(f)).responses).toEqual(before.responses);
  expect((await events(f)).filter((e) => e.kind.startsWith("InspectionResponse:"))).toHaveLength(1);
  expect((await events(f)).filter((e) => e.kind.startsWith("OfflineSyncOperation:"))).toHaveLength(
    2,
  );
});

test("HTTP response edit holds the lock before conclusion and the latest response persists", async ({
  page,
  context,
}) => {
  const f = await fixture();
  const original = unwrap(await save(f, null));
  const other = await context.newPage();
  await login(page, f);
  await login(other, f);
  const result = await race(
    f.inspection.id,
    () => saveHttp(page, input(f, original.updatedAt, "latest over HTTP")),
    () => finishHttp(other, f),
  );
  unwrap(value(result.first));
  unwrap(value(result.second));
  expect((await state(f)).responses[0].observation).toBe("latest over HTTP");
  expect((await state(f)).status).toBe("COMPLETED");
});

for (const operation of ["response", "conclusion"] as const) {
  test(`HTTP UUID collision across independently owned inspections (${operation}) returns logical 409`, async ({
    page,
    browser,
  }) => {
    const first = await fixture();
    const second = await fixture();
    if (operation === "conclusion") {
      unwrap(await save(first, null));
      unwrap(await save(second, null));
    }
    await login(page, first);
    const otherContext = await browser.newContext();
    const other = await otherContext.newPage();
    try {
      await login(other, second);
      const id = randomUUID();
      const before = await state(second);
      const request = (p: Page, f: Fixture): Promise<Result<unknown>> =>
        operation === "response"
          ? saveHttp(p, input(f, null, "collision", id))
          : finishHttp(p, f, id);
      const statuses = httpStatuses(other);
      const result = await race(
        id,
        () => request(page, first),
        () => request(other, second),
        "acknowledgement",
      );
      expect(await state(second)).toEqual(before);
      console.log(`UUID collision (${operation}): actual HTTP status=${statuses.join(",")}`);
      unwrap(value(result.first));
      conflict(value(result.second));
      expect(statuses).toEqual([200]);
    } finally {
      await otherContext.close();
    }
  });
}

test("foreign and unauthenticated HTTP sessions cannot mutate while the owner concludes", async ({
  page,
  browser,
}) => {
  const f = await fixture();
  unwrap(await save(f, null));
  await login(page, f);
  const foreignContext = await browser.newContext();
  const foreign = await foreignContext.newPage();
  try {
    await login(foreign, f, true);
    const deniedStatuses = httpStatuses(foreign);
    const result = await race(
      f.inspection.id,
      () => finishHttp(page, f),
      async () => {
        // Wrong ownership does not wait for the owner's row: it matches no row.
        const denied = await finishHttp(foreign, f);
        expect(denied.success).toBe(false);
        if (!denied.success) expect(denied.statusCode).toBe(404);
        const forged = { ...input(f), userId: f.userId };
        const deniedEdit = await saveHttp(foreign, forged);
        expect(deniedEdit.success).toBe(false);
        if (!deniedEdit.success) expect(deniedEdit.statusCode).toBe(404);
        // Supply the actual contending owner request so race observes a row wait.
        return finishHttp(page, f);
      },
    );
    unwrap(value(result.first));
    conflict(value(result.second));
    await foreignContext.clearCookies();
    const unauthenticated = await saveHttp(foreign, input(f));
    expect(unauthenticated.success).toBe(false);
    if (!unauthenticated.success) expect(unauthenticated.statusCode).toBe(401);
    expect(deniedStatuses).toEqual([200, 200, 200]);
    expect((await state(f)).offlineSyncOperations.every((op) => op.userId === f.userId)).toBe(true);
  } finally {
    await foreignContext.close();
  }
});

async function queueResponse(page: Page, f: Fixture, observation: string) {
  return page.evaluate(
    async (data) => {
      const authPath = "/src/lib/api/auth.functions.ts";
      const inspectionPath = "/src/lib/api/inspection.functions.ts";
      const storePath = "/src/offline/inspection-store.ts";
      const sessionPath = "/src/offline/session.ts";
      const dbPath = "/src/offline/database.ts";
      const auth = (await import(authPath)) as typeof import("../../src/lib/api/auth.functions");
      const api = (await import(
        inspectionPath
      )) as typeof import("../../src/lib/api/inspection.functions");
      const store = (await import(
        storePath
      )) as typeof import("../../src/offline/inspection-store");
      const session = (await import(sessionPath)) as typeof import("../../src/offline/session");
      const { getOfflineDatabase } = (await import(
        dbPath
      )) as typeof import("../../src/offline/database");
      const user = await auth.getCurrentSession();
      const inspection = await api.getInspectionById({ data: { id: data.inspectionId } });
      if (!user.success || !inspection.success) throw new Error("Fixture session unavailable.");
      await session.cacheOfflineSession(user.data);
      await store.cacheInspectionPackage(inspection.data);
      const queued = await store.queueInspectionResponse({
        inspectionId: data.inspectionId,
        snapshotItemId: data.itemId,
        status: "NON_COMPLIANT",
        observation: data.observation,
      });
      if (!queued.success) throw new Error("Could not queue fixture response.");
      return (await getOfflineDatabase().operations.toArray())[0].id;
    },
    { inspectionId: f.inspection.id, itemId: f.itemId, observation },
  );
}

function sync(page: Page, id: string) {
  return page.evaluate(async (operationId) => {
    const dbPath = "/src/offline/database.ts";
    const managerPath = "/src/offline/sync-manager.ts";
    const { getOfflineDatabase } = (await import(
      dbPath
    )) as typeof import("../../src/offline/database");
    const { synchronizeOperation } = (await import(
      managerPath
    )) as typeof import("../../src/offline/sync-manager");
    const operation = await getOfflineDatabase().operations.get(operationId);
    if (!operation) throw new Error("Queued operation unavailable.");
    return synchronizeOperation(operation);
  }, id);
}

function localOperations(page: Page) {
  return page.evaluate(async () => {
    const path = "/src/offline/database.ts";
    const { getOfflineDatabase } = (await import(
      path
    )) as typeof import("../../src/offline/database");
    return getOfflineDatabase().operations.toArray();
  });
}

test("two tabs synchronize the same durable IndexedDB UUID through real HTTP and PostgreSQL", async ({
  page,
  context,
}) => {
  const f = await fixture();
  const other = await context.newPage();
  await login(page, f);
  await login(other, f);
  const id = await queueResponse(page, f, "shared queue");
  await clearEvents(f);
  const result = await race(
    f.inspection.id,
    () => sync(page, id),
    () => sync(other, id),
  );
  expect(value(result.first)).toBe(true);
  expect(value(result.second)).toBe(true);
  expect(await localOperations(page)).toHaveLength(0);
  const persisted = await state(f);
  expect(persisted.responses).toHaveLength(1);
  expect(persisted.offlineSyncOperations).toHaveLength(1);
  expect(persisted.offlineSyncOperations[0].id).toBe(id);
  expect((await events(f)).filter((e) => e.kind.startsWith("NonConformity:"))).toHaveLength(1);
});

test("two tabs synchronize the same queued offline conclusion through real HTTP", async ({
  page,
  context,
}) => {
  const f = await fixture();
  const other = await context.newPage();
  await login(page, f);
  await login(other, f);
  const responseId = await queueResponse(page, f, "offline conclusion fixture");
  expect(await sync(page, responseId)).toBe(true);
  const id = await page.evaluate(async (inspectionId) => {
    const storePath = "/src/offline/inspection-store.ts";
    const dbPath = "/src/offline/database.ts";
    const { queueInspectionFinish } = (await import(
      storePath
    )) as typeof import("../../src/offline/inspection-store");
    const { getOfflineDatabase } = (await import(
      dbPath
    )) as typeof import("../../src/offline/database");
    const queued = await queueInspectionFinish(inspectionId);
    if (!queued.success) throw new Error("Could not queue offline conclusion.");
    return (await getOfflineDatabase().operations.toArray())[0].id;
  }, f.inspection.id);
  const before = await state(f);
  await clearEvents(f);
  const result = await race(
    f.inspection.id,
    () => sync(page, id),
    () => sync(other, id),
  );
  expect(value(result.first)).toBe(true);
  expect(value(result.second)).toBe(true);
  expect(await localOperations(page)).toHaveLength(0);
  const persisted = await state(f);
  expect(persisted.status).toBe("COMPLETED");
  expect(persisted.responses).toEqual(before.responses);
  expect(persisted.snapshot).toEqual(before.snapshot);
  expect(persisted.offlineSyncOperations).toHaveLength(2);
  expect((await events(f)).filter((event) => event.kind === "Inspection:UPDATE")).toHaveLength(1);
});

test("independent offline caches competing for one revision retain the loser as CONFLICT", async ({
  page,
  browser,
}) => {
  const f = await fixture();
  await login(page, f);
  const otherContext = await browser.newContext();
  const other = await otherContext.newPage();
  try {
    await login(other, f);
    const first = await queueResponse(page, f, "winner from cache A");
    const second = await queueResponse(other, f, "loser from cache B");
    const result = await race(
      f.inspection.id,
      () => sync(page, first),
      () => sync(other, second),
    );
    expect(value(result.first)).toBe(true);
    expect(value(result.second)).toBe(false);
    const retained = await localOperations(other);
    expect(retained).toHaveLength(1);
    expect(retained[0]).toMatchObject({
      id: second,
      status: "CONFLICT",
      lastErrorCode: "CONFLICT",
    });
    expect(retained[0].payload).toMatchObject({ observation: "loser from cache B" });
    expect((await state(f)).responses[0].observation).toBe("winner from cache A");
    expect((await state(f)).offlineSyncOperations).toHaveLength(1);
  } finally {
    await otherContext.close();
  }
});

test("lost HTTP acknowledgement after commit is NETWORK_ERROR; exact UUID retry applies no mutation", async ({
  page,
}) => {
  const f = await fixture();
  await login(page, f);
  const id = await queueResponse(page, f, "committed but acknowledgement lost");
  await clearEvents(f);
  await page.route("**/_serverFn/**", async (route) => {
    // Forward the real request, wait for the server commit, then lose its response.
    const response = await route.fetch();
    expect(response.status()).toBe(200);
    await route.abort("failed");
  });
  expect(await sync(page, id)).toBe(false);
  const retained = await localOperations(page);
  expect(retained[0]).toMatchObject({ id, status: "PENDING", lastErrorCode: "NETWORK_ERROR" });
  const committed = await state(f);
  expect(committed.offlineSyncOperations).toHaveLength(1);
  const trace = await events(f);
  await page.unroute("**/_serverFn/**");
  expect(await sync(page, id)).toBe(true);
  expect(await localOperations(page)).toHaveLength(0);
  expect(await state(f)).toEqual(committed);
  expect(await events(f)).toEqual(trace);
});
