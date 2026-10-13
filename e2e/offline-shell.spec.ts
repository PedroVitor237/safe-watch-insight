import { expect, test, type Page } from "@playwright/test";
import type { OfflineInspection } from "../src/offline/types";

// Real SPA, worker and IndexedDB, with synthetic RPCs and no database access.
const USER_ID = "11111111-1111-4111-8111-111111111111";
const INSPECTION_ID = "22222222-2222-4222-8222-222222222222";
const SNAPSHOT_ID = "33333333-3333-4333-8333-333333333333";
const SNAPSHOT_ITEM_ID = "44444444-4444-4444-8444-444444444444";
const VERSION_ID = "55555555-5555-4555-8555-555555555555";
const VERSION_ITEM_ID = "66666666-6666-4666-8666-666666666666";
const COMPANY_ID = "77777777-7777-4777-8777-777777777777";
const CHECKLIST_ID = "88888888-8888-4888-8888-888888888888";
const inspectionUrl = `/inspecoes/${INSPECTION_ID}`;
const question = "Pergunta histórica v1";

async function prepare(page: Page) {
  const inspection = createInspection();
  const state = { user: inspection.user, sessionUrl: "", online: true, authenticated: false };
  await page.context().route("**/_serverFn/**", async (route) => {
    if (!state.online) {
      await route.abort("internetdisconnected");
      return;
    }
    const id = new URL(route.request().url()).pathname.split("/").pop()!;
    const { export: functionExport } = JSON.parse(Buffer.from(id, "base64url").toString()) as {
      export: string;
    };
    const name = functionExport.split("_createServerFn_")[0];
    let data: unknown;
    if (name === "login") {
      state.authenticated = true;
      data = state.user;
    } else if (name === "getCurrentSession") {
      state.sessionUrl = route.request().url();
      if (!state.authenticated) {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              success: false,
              code: "UNAUTHORIZED",
              statusCode: 401,
              message: "Synthetic session unavailable",
            },
          }),
        });
        return;
      }
      data = state.user;
    } else if (name === "logout") {
      state.authenticated = false;
      data = null;
    } else if (name === "getInspectionById") data = inspection;
    else if (name === "listInspections")
      data = { items: [inspection], total: 1, page: 1, pageSize: 20, totalPages: 1 };
    else if (name === "listEvidence") data = [];
    else if (name === "getDashboard") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            success: false,
            code: "TEST_FIXTURE",
            statusCode: 500,
            message: "Synthetic dashboard unavailable",
          },
        }),
      });
      return;
    } else {
      await route.abort();
      throw new Error(`Unexpected RPC: ${name}`);
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ result: { success: true, data } }),
    });
  });
  await page.goto("/login");
  await page.waitForFunction(
    async () =>
      (await navigator.serviceWorker.ready).active !== null &&
      navigator.serviceWorker.controller !== null,
  );
  // Warm root/client assets under worker control, including the shell's dev CSS.
  await page.goto("/offline-shell");
  await page.goto("/login");
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("#email") ?? {}).some((key) =>
      key.startsWith("__reactProps$"),
    ),
  );
  await page.getByLabel("E-mail", { exact: true }).fill(inspection.user.email);
  await page.getByLabel("Senha", { exact: true }).fill("Synthetic@123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.waitForFunction(
    async () =>
      (await navigator.serviceWorker.ready).active !== null &&
      navigator.serviceWorker.controller !== null,
  );
  await page.getByRole("link", { name: "Inspeções", exact: true }).click();
  await page.getByRole("link").filter({ hasText: "Checklist publicado v1" }).click();
  await expect(page.getByText(question, { exact: true })).toBeVisible();
  return state;
}

async function assertNoPrivateCache(page: Page) {
  const entries = await page.evaluate(async () => {
    const entries: Array<{ url: string; body: string }> = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys())
        entries.push({ url: request.url, body: await (await cache.match(request))!.text() });
    }
    return entries;
  });
  expect(entries.some((entry) => new URL(entry.url).pathname === "/offline-shell")).toBe(true);
  expect(
    entries.some(
      (entry) => entry.url.includes("_serverFn") || new URL(entry.url).pathname === inspectionUrl,
    ),
  ).toBe(false);
  const html = entries.filter((entry) =>
    ["/offline-shell", "/offline.html"].includes(new URL(entry.url).pathname),
  );
  for (const entry of html) {
    expect(entry.body).not.toContain(USER_ID);
    expect(entry.body).not.toContain(question);
    expect(entry.body).not.toContain("Inspetora Offline");
  }
}

async function expireSession(page: Page) {
  await page.evaluate(async () => {
    const path = "/src/offline/database.ts";
    const { getOfflineDatabase } = (await import(path)) as typeof import("../src/offline/database");
    await getOfflineDatabase().sessions.update("current", { expiresAt: new Date(0) });
  });
}

test("public shell reopens an inspection offline and retains response/conclusion operations", async ({
  page,
  context,
}) => {
  const state = await prepare(page);
  await assertNoPrivateCache(page);
  state.online = false;
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(question, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Conforme", exact: true }).click();
  await page.getByRole("tab", { name: "Encerrar", exact: true }).click();
  await page.getByRole("button", { name: "Concluir inspeção", exact: true }).click();
  const operations = await page.evaluate(async () => {
    const path = "/src/offline/database.ts";
    const { getOfflineDatabase } = (await import(path)) as typeof import("../src/offline/database");
    return getOfflineDatabase().operations.toArray();
  });
  expect(
    operations.sort((a, b) => a.sequence - b.sequence).map((operation) => operation.type),
  ).toEqual(["SAVE_INSPECTION_RESPONSE", "FINISH_INSPECTION"]);
  const reopened = await context.newPage();
  await page.close();
  await reopened.goto(inspectionUrl);
  await expect(reopened.getByText(question, { exact: true })).toBeVisible();
  await expect(reopened.getByText("Inspetora Offline", { exact: true }).first()).toBeVisible();
  await assertNoPrivateCache(reopened);
});

test("expired offline session redirects after reload without rendering A's private document", async ({
  page,
  context,
}) => {
  const state = await prepare(page);
  await expireSession(page);
  state.online = false;
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(question, { exact: true })).toHaveCount(0);
  await expect(page.getByText("Inspetora Offline", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeVisible();
  await assertNoPrivateCache(page);
});

test("logout preserves the public shell and B cannot reopen A's inspection", async ({
  page,
  context,
}) => {
  const state = await prepare(page);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  state.online = false;
  await context.setOffline(true);
  await page.goto(inspectionUrl);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(question, { exact: true })).toHaveCount(0);
  state.online = true;
  await context.setOffline(false);
  state.user = {
    ...state.user,
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Usuário B",
    email: "b@test.invalid",
  };
  await page.getByLabel("E-mail", { exact: true }).fill(state.user.email);
  await page.getByLabel("Senha", { exact: true }).fill("Synthetic@123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  state.online = false;
  await context.setOffline(true);
  await page.goto(inspectionUrl);
  await expect(
    page.getByText("Esta inspeção ainda não foi disponibilizada localmente neste dispositivo.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(question, { exact: true })).toHaveCount(0);
  await expect(page.getByText("Inspetora Offline", { exact: true })).toHaveCount(0);
  await assertNoPrivateCache(page);
});

test("real unauthenticated HTTP responses use no-store and shell HTML is identity-free", async ({
  page,
  request,
}) => {
  const state = await prepare(page);
  // APIRequestContext bypasses browser RPC fixtures; no cookie or database is needed.
  const rejected = await request.get(state.sessionUrl);
  expect(rejected.status()).toBe(403);
  expect(rejected.headers()["cache-control"]).toBe("private, no-store");
  const session = await request.get(state.sessionUrl, {
    headers: { Origin: "http://127.0.0.1:4173" },
  });
  expect(session.headers()["cache-control"]).toBe("private, no-store");
  expect(await session.text()).toContain("UNAUTHORIZED");
  const navigation = await request.get(inspectionUrl, { maxRedirects: 0 });
  expect(navigation.headers()["cache-control"]).toBe("private, no-store");
  const shell = await request.get("/offline-shell");
  expect(shell.status()).toBe(200);
  expect(shell.headers()["cache-control"]).toBe("public, max-age=0, must-revalidate");
  expect(await shell.text()).not.toContain(USER_ID);
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
    status: "PLANNED",
    syncStatus: "SYNCED",
    notes: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    user: {
      id: USER_ID,
      name: "Inspetora Offline",
      email: "offline@example.com",
      role: "TECHNICIAN",
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
      status: "PUBLISHED",
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
      origin: "INSPECTION_CREATION",
      integrityStatus: "VERIFIED",
      capturedAt: now,
      items: [snapshotItem],
    },
    responses: [],
  };
}
