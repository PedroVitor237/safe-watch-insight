import { expect, test, type Page } from "@playwright/test";
import { toJSONAsync } from "seroval";

import type {
  FinishInspectionOperation,
  OfflineOperation,
  SaveResponseOperation,
} from "../src/offline/types";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const INSPECTION_ID = "22222222-2222-4222-8222-222222222222";
const ITEM_ID = "33333333-3333-4333-8333-333333333333";
const OPERATION_ID = "44444444-4444-4444-8444-444444444444";
const RPC_ROUTE = "**/_serverFn/**";

// Every RPC is intercepted. These tests never invoke a service or database fixture.
test.beforeEach(async ({ page }) => {
  // The static harness imports Vite modules without the normal application entry.
  // Supply the RPC base normally replaced by the production bundler.
  await page.addInitScript(() => {
    Object.assign(window, {
      process: { env: { TSS_SERVER_FN_BASE: "/_serverFn/", NODE_ENV: "development" } },
    });
  });
  await page.goto("/offline.html");
  await page.evaluate(
    async (ids) => {
      const path = "/src/offline/database.ts";
      const { getOfflineDatabase } = (await import(
        path
      )) as typeof import("../src/offline/database");
      const db = getOfflineDatabase();
      await db.operations.clear();
      const now = new Date();
      const operation: SaveResponseOperation = {
        id: ids.operationId,
        userId: ids.userId,
        inspectionId: ids.inspectionId,
        entityKey: `response:${ids.itemId}`,
        type: "SAVE_INSPECTION_RESPONSE",
        status: "PENDING",
        sequence: 1,
        createdAt: now,
        updatedAt: now,
        attemptCount: 0,
        nextAttemptAt: now,
        dependsOnOperationId: null,
        lastErrorCode: null,
        lastErrorMessage: null,
        payload: {
          snapshotItemId: ids.itemId,
          status: "COMPLIANT",
          observation: "Resposta durável no Chromium",
          expectedResponseUpdatedAt: null,
          clientCreatedAt: now,
        },
      };
      await db.operations.add(operation);
    },
    { operationId: OPERATION_ID, userId: USER_ID, inspectionId: INSPECTION_ID, itemId: ITEM_ID },
  );
});

test("native fetch failure keeps the UUID for automatic retry and recovery", async ({ page }) => {
  let requests = 0;
  await page.route(RPC_ROUTE, async (route) => {
    requests += 1;
    if (requests === 1) {
      await route.abort("failed");
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          success: true,
          data: {
            id: "55555555-5555-4555-8555-555555555555",
            inspectionId: INSPECTION_ID,
            snapshotItemId: ITEM_ID,
            status: "COMPLIANT",
            observation: "Resposta durável no Chromium",
            updatedAt: "2026-10-12T12:00:00.000Z",
            nonConformity: null,
          },
        },
      }),
    });
  });
  const original = await readOperation(page);
  expect(await synchronize(page)).toBe(false);
  const pending = await readOperation(page);
  expect(pending).toMatchObject({
    status: "PENDING",
    attemptCount: 1,
    lastErrorCode: "NETWORK_ERROR",
  });
  expect(pending?.payload).toEqual(original?.payload);
  await page.reload();
  expect((await readOperation(page))?.id).toBe(OPERATION_ID);
  await page.evaluate(async (id) => {
    const path = "/src/offline/database.ts";
    const { getOfflineDatabase } = (await import(path)) as typeof import("../src/offline/database");
    await getOfflineDatabase().operations.update(id, { nextAttemptAt: new Date(0) });
  }, OPERATION_ID);
  expect(await synchronize(page)).toBe(true);
  expect(await readOperation(page)).toBeUndefined();
  expect(requests).toBe(2);
});

for (const statusCode of [401, 403, 404, 409, 422, 500, 503]) {
  test(`real HTTP ${statusCode} stays distinct from a network failure`, async ({ page }) => {
    await page.route(RPC_ROUTE, (route) =>
      route.fulfill({
        status: statusCode,
        contentType: "text/html",
        body: "private server diagnostics",
      }),
    );
    expect(await synchronize(page)).toBe(false);
    const operation = await readOperation(page);
    expect(operation).toMatchObject({
      id: OPERATION_ID,
      status: statusCode === 409 ? "CONFLICT" : statusCode >= 500 ? "PENDING" : "ERROR",
      lastErrorCode: "HTTP_ERROR",
      attemptCount: 1,
    });
    expect(operation?.lastErrorMessage).not.toContain("private server diagnostics");
  });
}

test("a server TypeError decoded by Start is not a fetch failure", async ({ page }) => {
  const body = JSON.stringify(await toJSONAsync({ error: new TypeError("Failed to fetch") }));
  await page.route(RPC_ROUTE, (route) =>
    route.fulfill({
      contentType: "application/json",
      headers: { "x-tss-serialized": "true" },
      body,
    }),
  );
  expect(await synchronize(page)).toBe(false);
  expect(await readOperation(page)).toMatchObject({
    status: "ERROR",
    lastErrorCode: "SYNC_EXCEPTION",
  });
});

for (const body of ["{", JSON.stringify({ result: { success: true } })]) {
  test(`retains the queue for malformed RPC data (${body})`, async ({ page }) => {
    await page.route(RPC_ROUTE, (route) =>
      route.fulfill({ contentType: "application/json", body }),
    );
    expect(await synchronize(page)).toBe(false);
    expect(await readOperation(page)).toMatchObject({
      status: "ERROR",
      lastErrorCode: body === "{" ? "SYNC_EXCEPTION" : "INVALID_SYNC_RESPONSE",
    });
  });
}

async function synchronize(page: Page): Promise<boolean> {
  return page.evaluate(async (id) => {
    const databasePath = "/src/offline/database.ts";
    const managerPath = "/src/offline/sync-manager.ts";
    const { getOfflineDatabase } = (await import(
      databasePath
    )) as typeof import("../src/offline/database");
    const { synchronizeOperation } = (await import(
      managerPath
    )) as typeof import("../src/offline/sync-manager");
    const operation = await getOfflineDatabase().operations.get(id);
    if (!operation) throw new Error("Missing browser operation");
    return synchronizeOperation(operation);
  }, OPERATION_ID);
}

test("an idempotent conclusion acknowledgement removes the durable UUID", async ({ page }) => {
  await seedFinishOperation(page);
  await page.route(RPC_ROUTE, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          success: true,
          data: {
            id: INSPECTION_ID,
            userId: USER_ID,
            status: "COMPLETED",
            syncStatus: "SYNCED",
            snapshot: {},
            responses: [],
          },
        },
      }),
    }),
  );
  expect(await synchronize(page)).toBe(true);
  expect(await readOperation(page)).toBeUndefined();
});

test("a conflicting conclusion keeps its UUID and blocks synchronization", async ({ page }) => {
  await seedFinishOperation(page);
  await page.route(RPC_ROUTE, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          success: false,
          code: "CONFLICT",
          statusCode: 409,
          message: "Completed or cancelled inspections cannot be edited.",
        },
      }),
    }),
  );
  expect(await synchronize(page)).toBe(false);
  expect(await readOperation(page)).toMatchObject({
    id: OPERATION_ID,
    type: "FINISH_INSPECTION",
    status: "CONFLICT",
    lastErrorCode: "CONFLICT",
    attemptCount: 1,
  });
});

async function seedFinishOperation(page: Page): Promise<void> {
  await page.evaluate(async (id) => {
    const path = "/src/offline/database.ts";
    const { getOfflineDatabase } = (await import(path)) as typeof import("../src/offline/database");
    const db = getOfflineDatabase();
    const response = await db.operations.get(id);
    if (!response) throw new Error("Missing browser operation");
    const operation: FinishInspectionOperation = {
      ...response,
      type: "FINISH_INSPECTION",
      entityKey: "inspection:finish",
      payload: { clientCreatedAt: response.createdAt },
    };
    await db.operations.put(operation);
  }, OPERATION_ID);
}

async function readOperation(page: Page): Promise<OfflineOperation | undefined> {
  return page.evaluate(async (id) => {
    const path = "/src/offline/database.ts";
    const { getOfflineDatabase } = (await import(path)) as typeof import("../src/offline/database");
    return getOfflineDatabase().operations.get(id);
  }, OPERATION_ID);
}
