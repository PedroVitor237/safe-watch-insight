import "dotenv/config";

import { randomUUID } from "node:crypto";

import { expect, test, type Locator, type Page, type Route } from "@playwright/test";

import { ResponseStatus } from "../src/generated/prisma/client";
import { prisma } from "../src/server/prisma/client";
import type { Result } from "../src/server/responses";
import { inspectionResponseService } from "../src/server/services/inspection-response.service";
import { inspectionService } from "../src/server/services/inspection.service";
import { userService } from "../src/server/services/user.service";

const ADMIN_EMAIL = "admin@demo.com";
const ADMIN_PASSWORD = "Admin@123";
const TEMPORARY_NOTE_PREFIX = "E2E Offline/PWA temporário";

interface BrowserStorageSnapshot {
  sessions: Array<Record<string, unknown>>;
  packages: Array<Record<string, unknown>>;
  operations: Array<Record<string, unknown>>;
  cacheNames: string[];
  cacheEntries: Record<string, string[]>;
}

interface CapturedResponseOperation {
  id: string;
  userId: string;
  inspectionId: string;
  status: string;
  attemptCount: number;
  lastErrorCode: string | null;
  payload: {
    snapshotItemId: string;
    status: "COMPLIANT" | "NON_COMPLIANT" | "NOT_APPLICABLE";
    observation: string | null;
    expectedResponseUpdatedAt: string | null;
    clientCreatedAt: string;
  };
}

interface BrowserEvidence {
  browser: string;
  browserVersion: string;
  manifestContentType: string;
  manifestName: string;
  manifestDisplay: string;
  manifestParseErrors: number;
  installabilityErrors: string[];
  serviceWorkerScope: string;
  serviceWorkerScript: string;
  staleCacheRemoved: boolean;
  serverResponsesExcludedFromCache: boolean;
  offlineNavigationUrl: string;
  primaryOperationId: string;
  interruptedOperationRecovered: boolean;
  transientFailureCode: string;
  automaticSynchronization: boolean;
  snapshotIdentityPreserved: boolean;
  idempotentRetry: boolean;
  responseSnapshotItemPreserved: boolean;
  nonConformityCount: number;
  authenticationFailureCode: string;
  authenticationRecovery: boolean;
  sessionExpirationRedirect: boolean;
  foreignUserDataRemoved: boolean;
  logoutClearedPrivateData: boolean;
  forbiddenLocalKeyPaths: string[];
}

interface TestFixture {
  inspectionId: string;
  userId: string;
  snapshotId: string;
  snapshotContentHash: string;
  snapshotItemId: string;
  snapshotItemDescription: string;
}

let fixture: TestFixture | null = null;

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await cleanupStaleTemporaryInspections();
  fixture = await createTemporaryInspection();
});

test.afterAll(async () => {
  try {
    if (fixture) {
      await cleanupTemporaryInspection(fixture.inspectionId);
    }
  } finally {
    await prisma.$disconnect();
  }
});

test("online → offline → reopen → retry → synchronize → Neon", async ({
  browser,
  context,
  page: initialPage,
}) => {
  if (!fixture) {
    throw new Error("The temporary inspection fixture was not created.");
  }

  await context.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "onLine", {
      configurable: true,
      get: () => localStorage.getItem("safe-watch-e2e-online") !== "false",
    });
  });

  let page = initialPage;
  const inspectionUrl = `/inspecoes/${fixture.inspectionId}`;
  const evidence: BrowserEvidence = {
    browser: browser.browserType().name(),
    browserVersion: browser.version(),
    manifestContentType: "",
    manifestName: "",
    manifestDisplay: "",
    manifestParseErrors: -1,
    installabilityErrors: [],
    serviceWorkerScope: "",
    serviceWorkerScript: "",
    staleCacheRemoved: false,
    serverResponsesExcludedFromCache: false,
    offlineNavigationUrl: "",
    primaryOperationId: "",
    interruptedOperationRecovered: false,
    transientFailureCode: "",
    automaticSynchronization: false,
    snapshotIdentityPreserved: false,
    idempotentRetry: false,
    responseSnapshotItemPreserved: false,
    nonConformityCount: -1,
    authenticationFailureCode: "",
    authenticationRecovery: false,
    sessionExpirationRedirect: false,
    foreignUserDataRemoved: false,
    logoutClearedPrivateData: false,
    forbiddenLocalKeyPaths: [],
  };

  await test.step("authenticate and preload the inspection package", async () => {
    console.log("E2E_STAGE=preload");
    await login(page);
    await openInspection(page, inspectionUrl, fixture.snapshotItemDescription);

    await page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.active !== null && navigator.serviceWorker.controller !== null;
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(responseCard(page, fixture.snapshotItemDescription)).toBeVisible();

    const storage = await readBrowserStorage(page);
    const inspectionPackage = findInspectionPackage(storage, fixture.inspectionId);
    const localInspection = asRecord(inspectionPackage.inspection, "cached inspection");
    const localSnapshot = asRecord(localInspection.snapshot, "cached snapshot");

    expect(localSnapshot.id).toBe(fixture.snapshotId);
    expect(localSnapshot.contentHash).toBe(fixture.snapshotContentHash);
    expect(asArray(localSnapshot.items, "cached snapshot items").length).toBeGreaterThan(0);
    expect(storage.sessions).toHaveLength(1);
  });

  await test.step("validate manifest, registration, scope and cache invalidation", async () => {
    console.log("E2E_STAGE=pwa");
    const manifest = await page.evaluate(async () => {
      const response = await fetch("/manifest.json");
      return {
        contentType: response.headers.get("content-type") ?? "",
        body: (await response.json()) as { name?: string; display?: string },
      };
    });
    evidence.manifestContentType = manifest.contentType;
    evidence.manifestName = manifest.body.name ?? "";
    evidence.manifestDisplay = manifest.body.display ?? "";
    expect(evidence.manifestName).toBe("Safe Watch Insight");
    expect(evidence.manifestDisplay).toBe("standalone");

    const worker = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return {
        scope: registration.scope,
        script: registration.active?.scriptURL ?? "",
      };
    });
    evidence.serviceWorkerScope = worker.scope;
    evidence.serviceWorkerScript = worker.script;
    expect(worker.scope).toBe("http://127.0.0.1:4173/");
    expect(worker.script).toBe("http://127.0.0.1:4173/sw.js");

    await page.evaluate(async () => {
      await caches.open("safe-watch-v0-static");
      const replacement = await navigator.serviceWorker.register(
        `/sw.js?e2e-update=${Date.now()}`,
        { scope: "/" },
      );
      const replacementWorker = replacement.installing ?? replacement.waiting;

      if (!replacementWorker) {
        throw new Error("The updated service worker did not enter installation.");
      }

      await new Promise<void>((resolve, reject) => {
        const deadline = window.setTimeout(
          () => reject(new Error("Replacement service worker activation timed out.")),
          10_000,
        );
        const inspect = () => {
          if (replacementWorker.state === "activated") {
            window.clearTimeout(deadline);
            resolve();
            return;
          }
        };
        replacementWorker.addEventListener("statechange", inspect);
        inspect();
      });

      await new Promise<void>((resolve, reject) => {
        const deadline = window.setTimeout(
          () => reject(new Error("Stale cache cleanup timed out.")),
          5_000,
        );
        const inspect = async () => {
          if (!(await caches.has("safe-watch-v0-static"))) {
            window.clearTimeout(deadline);
            resolve();
            return;
          }
          window.setTimeout(() => void inspect(), 50);
        };
        void inspect();
      });
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(responseCard(page, fixture.snapshotItemDescription)).toBeVisible();

    const cacheNames = await page.evaluate(() => caches.keys());
    evidence.staleCacheRemoved = !cacheNames.includes("safe-watch-v0-static");
    expect(evidence.staleCacheRemoved).toBe(true);
    expect(cacheNames).toContain("safe-watch-v1-static");
    expect(cacheNames).toContain("safe-watch-v1-navigation");

    const cachedUrls = Object.values((await readBrowserStorage(page)).cacheEntries).flat();
    evidence.serverResponsesExcludedFromCache = cachedUrls.every((cachedUrl) => {
      const cachedPath = new URL(cachedUrl).pathname;
      return cachedPath !== "/login" && !cachedPath.includes("_server");
    });
    expect(evidence.serverResponsesExcludedFromCache).toBe(true);

    const cdp = await context.newCDPSession(page);
    const appManifest = await cdp.send("Page.getAppManifest");
    const installability = await cdp.send("Page.getInstallabilityErrors");
    evidence.manifestParseErrors = appManifest.errors.length;
    evidence.installabilityErrors = installability.installabilityErrors.map(
      (error) => error.errorId,
    );
    expect(evidence.manifestParseErrors).toBe(0);

    const evidenceTab = page.getByRole("tab", { name: "Evidências", exact: true });
    await evidenceTab.click();
    await expect(evidenceTab).toHaveAttribute("data-state", "active");
    const executionTab = page.getByRole("tab", {
      name: "Execução do checklist",
      exact: true,
    });
    await executionTab.click();
    await expect(executionTab).toHaveAttribute("data-state", "active");
  });

  let primaryOperation: CapturedResponseOperation;

  await test.step("work offline, persist locally and reopen the application", async () => {
    console.log("E2E_STAGE=offline-reopen");
    await setEmulatedConnectivity(page, false);
    await context.setOffline(true);
    await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false);
    await expect(page.getByText("Offline", { exact: true })).toBeVisible();

    const responseButton = responseCard(page, fixture.snapshotItemDescription).getByRole("button", {
      name: "NC",
      exact: true,
    });
    await waitForReactHydration(responseButton);
    await responseButton.click();
    await expect.poll(async () => (await readBrowserStorage(page)).operations.length).toBe(1);

    let storage = await readBrowserStorage(page);
    primaryOperation = captureOnlyResponseOperation(storage);
    evidence.primaryOperationId = primaryOperation.id;
    expect(primaryOperation.status).toBe("PENDING");
    expect(primaryOperation.payload.snapshotItemId).toBe(fixture.snapshotItemId);
    expect(primaryOperation.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const localPackage = findInspectionPackage(storage, fixture.inspectionId);
    expect(localPackage.localSyncStatus).toBe("PENDING");
    const localInspection = asRecord(localPackage.inspection, "pending cached inspection");
    expect(localInspection.syncStatus).toBe("PENDING");

    await markOperationAsInterrupted(page, primaryOperation.id);
    storage = await readBrowserStorage(page);
    expect(captureOnlyResponseOperation(storage).status).toBe("SYNCING");

    await page.close();
    page = await context.newPage();
    await page.goto(inspectionUrl, { waitUntil: "domcontentloaded" });
    evidence.offlineNavigationUrl = page.url();
    await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false);
    await expect(responseCard(page, fixture.snapshotItemDescription)).toBeVisible();
    await expect(page.getByText("Não conformidade identificada.", { exact: true })).toBeVisible();

    storage = await readBrowserStorage(page);
    const reopenedOperation = captureOnlyResponseOperation(storage);
    expect(reopenedOperation.id).toBe(primaryOperation.id);
    expect(reopenedOperation.status).toBe("SYNCING");
  });

  await test.step("recover SYNCING, retain the UUID after failure and retry automatically", async () => {
    console.log("E2E_STAGE=retry");
    let transientRequestFailed = false;
    const failFirstMutation = async (route: Route): Promise<void> => {
      if (!transientRequestFailed && route.request().method() === "POST") {
        transientRequestFailed = true;
        await route.abort("failed");
        return;
      }
      await route.continue();
    };
    await page.route("**/*", failFirstMutation);
    await page.evaluate(() => {
      window.addEventListener(
        "online",
        () => {
          Object.assign(window, { __offlineE2eOnlineEvent: true });
        },
        { once: true },
      );
    });

    await context.setOffline(false);
    await setEmulatedConnectivity(page, true);
    await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() =>
          Boolean(
            (window as Window & { __offlineE2eOnlineEvent?: boolean }).__offlineE2eOnlineEvent,
          ),
        ),
      )
      .toBe(true);
    await expect.poll(() => transientRequestFailed, { timeout: 45_000 }).toBe(true);
    await expect
      .poll(async () => {
        const operations = (await readBrowserStorage(page)).operations;
        if (operations.length !== 1) return "waiting";
        return String(operations[0].status);
      })
      .toBe("PENDING");

    const failedOperation = captureOnlyResponseOperation(await readBrowserStorage(page));
    evidence.interruptedOperationRecovered = failedOperation.id === primaryOperation.id;
    evidence.transientFailureCode = failedOperation.lastErrorCode ?? "";
    expect(evidence.interruptedOperationRecovered).toBe(true);
    expect(failedOperation.attemptCount).toBe(1);
    expect(evidence.transientFailureCode).toBe("NETWORK_ERROR");

    await page.unroute("**/*", failFirstMutation);
    await page.waitForTimeout(2_200);
    await setEmulatedConnectivity(page, false);
    await context.setOffline(true);
    await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false);
    await context.setOffline(false);
    await setEmulatedConnectivity(page, true);

    await expect.poll(async () => (await readBrowserStorage(page)).operations.length).toBe(0);
    evidence.automaticSynchronization = true;
    const synchronizedPackage = findInspectionPackage(
      await readBrowserStorage(page),
      fixture.inspectionId,
    );
    expect(synchronizedPackage.localSyncStatus).toBe("SYNCED");
  });

  await test.step("verify Neon persistence, snapshot identity, NC and idempotency", async () => {
    console.log("E2E_STAGE=neon");
    const persistedInspection = await prisma.inspection.findUniqueOrThrow({
      where: { id: fixture.inspectionId },
      include: {
        snapshot: true,
        responses: {
          where: { snapshotItemId: fixture.snapshotItemId },
          include: { nonConformity: true },
        },
        offlineSyncOperations: true,
      },
    });
    const persistedResponse = persistedInspection.responses[0];
    expect(persistedResponse).toBeDefined();
    expect(persistedResponse.status).toBe(ResponseStatus.NON_COMPLIANT);
    expect(persistedResponse.snapshotItemId).toBe(fixture.snapshotItemId);
    expect(persistedInspection.offlineSyncOperations.map((operation) => operation.id)).toContain(
      primaryOperation.id,
    );

    evidence.snapshotIdentityPreserved =
      persistedInspection.snapshot?.id === fixture.snapshotId &&
      persistedInspection.snapshot.contentHash === fixture.snapshotContentHash;
    evidence.responseSnapshotItemPreserved =
      persistedResponse.snapshotItemId === fixture.snapshotItemId;
    evidence.nonConformityCount = persistedInspection.responses.filter(
      (response) => response.nonConformity?.deletedAt === null,
    ).length;
    expect(evidence.snapshotIdentityPreserved).toBe(true);
    expect(evidence.responseSnapshotItemPreserved).toBe(true);
    expect(evidence.nonConformityCount).toBe(1);

    const duplicate = unwrap(
      await inspectionResponseService.saveInspectionResponse({
        inspectionId: primaryOperation.inspectionId,
        snapshotItemId: primaryOperation.payload.snapshotItemId,
        status: ResponseStatus.NON_COMPLIANT,
        observation: primaryOperation.payload.observation,
        offlineOperation: {
          id: primaryOperation.id,
          userId: primaryOperation.userId,
          clientCreatedAt: new Date(primaryOperation.payload.clientCreatedAt),
          expectedResponseUpdatedAt: primaryOperation.payload.expectedResponseUpdatedAt
            ? new Date(primaryOperation.payload.expectedResponseUpdatedAt)
            : null,
        },
      }),
    );
    const duplicateOperationCount = await prisma.offlineSyncOperation.count({
      where: { id: primaryOperation.id },
    });
    evidence.idempotentRetry =
      duplicate.id === persistedResponse.id && duplicateOperationCount === 1;
    expect(evidence.idempotentRetry).toBe(true);
  });

  await test.step("retain a pending operation after authentication failure and recover", async () => {
    console.log("E2E_STAGE=authentication-recovery");
    await setEmulatedConnectivity(page, false);
    await context.setOffline(true);
    const responseButton = responseCard(page, fixture.snapshotItemDescription).getByRole("button", {
      name: "NC",
      exact: true,
    });
    await waitForReactHydration(responseButton);
    await responseButton.click();
    const authenticationOperation = captureOnlyResponseOperation(await readBrowserStorage(page));

    await context.clearCookies();
    await context.setOffline(false);
    await setEmulatedConnectivity(page, true);
    await expect
      .poll(async () => {
        const operations = (await readBrowserStorage(page)).operations;
        if (operations.length !== 1) return "waiting";
        return String(operations[0].status);
      })
      .toBe("ERROR");

    const failedAuthenticationOperation = captureOnlyResponseOperation(
      await readBrowserStorage(page),
    );
    evidence.authenticationFailureCode = failedAuthenticationOperation.lastErrorCode ?? "";
    expect(failedAuthenticationOperation.id).toBe(authenticationOperation.id);
    expect(evidence.authenticationFailureCode).toBe("UNAUTHORIZED");
    expect((await readBrowserStorage(page)).sessions).toHaveLength(0);

    await page.goto("/login");
    await loginFromCurrentPage(page);
    await expect(page.getByRole("button", { name: "Sincronizar dados locais" })).toBeVisible();
    await page.getByRole("button", { name: "Sincronizar dados locais" }).click();
    await expect
      .poll(async () => (await readBrowserStorage(page)).operations.length, {
        timeout: 45_000,
      })
      .toBe(0);
    evidence.authenticationRecovery = true;

    const operationCount = await prisma.offlineSyncOperation.count({
      where: { inspectionId: fixture.inspectionId },
    });
    const activeNonConformities = await prisma.nonConformity.count({
      where: {
        inspectionResponse: { inspectionId: fixture.inspectionId },
        deletedAt: null,
      },
    });
    expect(operationCount).toBe(2);
    expect(activeNonConformities).toBe(1);
  });

  await test.step("verify secret exclusion, session expiry, identity isolation and logout cleanup", async () => {
    console.log("E2E_STAGE=security-cleanup");
    await page.goto(inspectionUrl);
    await expect(responseCard(page, fixture.snapshotItemDescription)).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });

    const privateStorage = await readBrowserStorage(page);
    evidence.forbiddenLocalKeyPaths = findForbiddenKeyPaths(privateStorage);
    expect(evidence.forbiddenLocalKeyPaths).toEqual([]);
    expect(JSON.stringify(privateStorage)).not.toContain(ADMIN_PASSWORD);

    const sessionCookie = (await context.cookies()).find(
      (cookie) => cookie.name === "safe_watch_session",
    );
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.sameSite).toBe("Lax");

    await setEmulatedConnectivity(page, false);
    await context.setOffline(true);
    await expireLocalSession(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login$/);
    evidence.sessionExpirationRedirect = true;
    expect((await readBrowserStorage(page)).sessions).toHaveLength(0);

    await context.setOffline(false);
    await setEmulatedConnectivity(page, true);
    await context.clearCookies();
    await page.goto("/login");
    const foreignUserId = randomUUID();
    await insertForeignUserPackage(page, foreignUserId);
    await loginFromCurrentPage(page);

    const isolatedStorage = await readBrowserStorage(page);
    const isolatedSessionUser = asRecord(
      isolatedStorage.sessions[0]?.user,
      "isolated session user",
    );
    evidence.foreignUserDataRemoved =
      isolatedStorage.sessions.length === 1 &&
      isolatedSessionUser.id === fixture.userId &&
      isolatedStorage.packages.every((record) => record.userId !== foreignUserId);
    expect(evidence.foreignUserDataRemoved).toBe(true);

    await page.goto(inspectionUrl);
    await expect(responseCard(page, fixture.snapshotItemDescription)).toBeVisible();
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);

    const loggedOutStorage = await readBrowserStorage(page);
    const privateNavigationCaches = loggedOutStorage.cacheNames.filter((name) =>
      /^safe-watch-.*-navigation$/.test(name),
    );
    evidence.logoutClearedPrivateData =
      loggedOutStorage.sessions.length === 0 &&
      loggedOutStorage.packages.length === 0 &&
      loggedOutStorage.operations.length === 0 &&
      privateNavigationCaches.length === 0;
    expect(evidence.logoutClearedPrivateData).toBe(true);
  });

  console.log(`OFFLINE_PWA_BROWSER_EVIDENCE=${JSON.stringify(evidence)}`);
});

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await loginFromCurrentPage(page);
}

async function loginFromCurrentPage(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const form = document.querySelector("form");
    return form !== null && Object.keys(form).some((key) => key.startsWith("__reactProps$"));
  });
  await expect(page.locator("form")).toHaveAttribute("method", "post");
  await page.getByLabel("E-mail").fill(ADMIN_EMAIL);
  await page.getByLabel("Senha").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

function responseCard(page: Page, itemDescription: string) {
  return page.locator("div.rounded-lg.border.p-4").filter({
    has: page.getByText(itemDescription, { exact: true }),
  });
}

async function openInspection(
  page: Page,
  inspectionUrl: string,
  itemDescription: string,
): Promise<void> {
  await page.goto(inspectionUrl, { waitUntil: "domcontentloaded" });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await responseCard(page, itemDescription).isVisible()) {
      return;
    }

    const temporaryDevError = page.getByRole("heading", { name: "This page didn't load" });
    const temporaryFallback = page.getByText(
      "Esta inspeção ainda não foi disponibilizada localmente neste dispositivo.",
      { exact: true },
    );
    if (!(await temporaryDevError.isVisible()) && !(await temporaryFallback.isVisible())) {
      break;
    }

    await page.waitForTimeout(250);
    await page.reload({ waitUntil: "domcontentloaded" });
  }

  await expect(responseCard(page, itemDescription)).toBeVisible();
}

async function setEmulatedConnectivity(page: Page, online: boolean): Promise<void> {
  await page.evaluate((isOnline) => {
    localStorage.setItem("safe-watch-e2e-online", String(isOnline));
    window.dispatchEvent(new Event(isOnline ? "online" : "offline"));
  }, online);
}

async function waitForReactHydration(locator: Locator): Promise<void> {
  await expect
    .poll(() =>
      locator.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactProps$")),
      ),
    )
    .toBe(true);
}

async function readBrowserStorage(page: Page): Promise<BrowserStorageSnapshot> {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("safe-watch-insight");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    try {
      const transaction = database.transaction(
        ["sessions", "inspectionPackages", "operations"],
        "readonly",
      );
      const readAll = (storeName: string) =>
        new Promise<unknown[]>((resolve, reject) => {
          const request = transaction.objectStore(storeName).getAll();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });
      const [sessions, packages, operations] = await Promise.all([
        readAll("sessions"),
        readAll("inspectionPackages"),
        readAll("operations"),
      ]);
      const cacheNames = await caches.keys();
      const cacheEntries = Object.fromEntries(
        await Promise.all(
          cacheNames.map(async (cacheName) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            return [cacheName, keys.map((request) => request.url)] as const;
          }),
        ),
      );

      return JSON.parse(
        JSON.stringify({ sessions, packages, operations, cacheNames, cacheEntries }),
      ) as BrowserStorageSnapshot;
    } finally {
      database.close();
    }
  });
}

function findInspectionPackage(
  storage: BrowserStorageSnapshot,
  inspectionId: string,
): Record<string, unknown> {
  const record = storage.packages.find((candidate) => candidate.inspectionId === inspectionId);
  if (!record) {
    throw new Error(`Inspection ${inspectionId} was not found in IndexedDB.`);
  }
  return record;
}

function captureOnlyResponseOperation(storage: BrowserStorageSnapshot): CapturedResponseOperation {
  expect(storage.operations).toHaveLength(1);
  const operation = storage.operations[0];
  const payload = asRecord(operation.payload, "offline operation payload");

  return {
    id: asString(operation.id, "operation id"),
    userId: asString(operation.userId, "operation user id"),
    inspectionId: asString(operation.inspectionId, "operation inspection id"),
    status: asString(operation.status, "operation status"),
    attemptCount: asNumber(operation.attemptCount, "operation attempt count"),
    lastErrorCode:
      operation.lastErrorCode === null
        ? null
        : asString(operation.lastErrorCode, "operation last error code"),
    payload: {
      snapshotItemId: asString(payload.snapshotItemId, "snapshot item id"),
      status: asResponseStatus(payload.status),
      observation:
        payload.observation === null
          ? null
          : asString(payload.observation, "operation observation"),
      expectedResponseUpdatedAt:
        payload.expectedResponseUpdatedAt === null
          ? null
          : asString(payload.expectedResponseUpdatedAt, "expected response revision"),
      clientCreatedAt: asString(payload.clientCreatedAt, "operation client timestamp"),
    },
  };
}

async function markOperationAsInterrupted(page: Page, operationId: string): Promise<void> {
  await page.evaluate(async (id) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("safe-watch-insight");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction("operations", "readwrite");
        const store = transaction.objectStore("operations");
        const request = store.get(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const operation = request.result as Record<string, unknown> | undefined;
          if (!operation) {
            reject(new Error("The operation to interrupt was not found."));
            return;
          }
          store.put({ ...operation, status: "SYNCING", updatedAt: new Date() });
        };
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();
      });
    } finally {
      database.close();
    }
  }, operationId);
}

async function expireLocalSession(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("safe-watch-insight");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction("sessions", "readwrite");
        const store = transaction.objectStore("sessions");
        const request = store.get("current");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const session = request.result as Record<string, unknown> | undefined;
          if (!session) {
            reject(new Error("The local session was not found."));
            return;
          }
          store.put({ ...session, expiresAt: new Date(0) });
        };
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();
      });
    } finally {
      database.close();
    }
  });
}

async function insertForeignUserPackage(page: Page, foreignUserId: string): Promise<void> {
  await page.evaluate(async (userId) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("safe-watch-insight");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction("inspectionPackages", "readwrite");
        transaction.objectStore("inspectionPackages").put({
          key: `${userId}:foreign-test`,
          userId,
          inspectionId: "foreign-test",
          inspection: {},
          cachedAt: new Date(),
          localSyncStatus: "SYNCED",
        });
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();
      });
    } finally {
      database.close();
    }
  }, foreignUserId);
}

function findForbiddenKeyPaths(value: unknown, path = "root"): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findForbiddenKeyPaths(item, `${path}[${index}]`));
  }
  if (!value || typeof value !== "object") {
    return [];
  }

  const forbidden = /password|secret|cloudinary.*(?:api)?key|session.*(?:token|cookie)/i;
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const childPath = `${path}.${key}`;
    return [
      ...(forbidden.test(key) ? [childPath] : []),
      ...findForbiddenKeyPaths(child, childPath),
    ];
  });
}

async function createTemporaryInspection(): Promise<TestFixture> {
  const user = unwrap(await userService.authenticate(ADMIN_EMAIL, ADMIN_PASSWORD));
  const company = await prisma.company.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  const publishedVersion = await prisma.checklistVersion.findFirst({
    where: {
      status: "PUBLISHED",
      checklist: { isActive: true, deletedAt: null },
      items: { some: {} },
    },
    orderBy: [{ publishedAt: "desc" }, { versionNumber: "desc" }],
  });

  if (!company || !publishedVersion) {
    throw new Error("An active company and a published checklist with items are required.");
  }

  const inspection = unwrap(
    await inspectionService.createInspection({
      userId: user.id,
      companyId: company.id,
      checklistId: publishedVersion.checklistId,
      checklistVersionId: publishedVersion.id,
      inspectionDate: new Date(),
      notes: `${TEMPORARY_NOTE_PREFIX} ${new Date().toISOString()}`,
    }),
  );
  const snapshot = inspection.snapshot;
  const firstItem = snapshot?.items[0];
  if (!snapshot || !firstItem) {
    await cleanupTemporaryInspection(inspection.id);
    throw new Error("The temporary inspection did not receive a complete snapshot.");
  }

  return {
    inspectionId: inspection.id,
    userId: user.id,
    snapshotId: snapshot.id,
    snapshotContentHash: snapshot.contentHash,
    snapshotItemId: firstItem.id,
    snapshotItemDescription: firstItem.description,
  };
}

async function cleanupTemporaryInspection(inspectionId: string): Promise<void> {
  const snapshot = await prisma.inspectionChecklistSnapshot.findUnique({
    where: { inspectionId },
  });

  await prisma.$transaction(async (transaction) => {
    await transaction.offlineSyncOperation.deleteMany({ where: { inspectionId } });
    await transaction.correctiveAction.deleteMany({
      where: { nonConformity: { inspectionResponse: { inspectionId } } },
    });
    await transaction.evidence.deleteMany({
      where: {
        OR: [{ inspectionId }, { nonConformity: { inspectionResponse: { inspectionId } } }],
      },
    });
    await transaction.nonConformity.deleteMany({
      where: { inspectionResponse: { inspectionId } },
    });
    await transaction.inspectionResponse.deleteMany({ where: { inspectionId } });

    if (snapshot) {
      await transaction.inspectionSnapshotItemStandard.deleteMany({
        where: { snapshotItem: { snapshotId: snapshot.id } },
      });
      await transaction.inspectionSnapshotItem.deleteMany({ where: { snapshotId: snapshot.id } });
      await transaction.inspectionChecklistSnapshot.delete({ where: { id: snapshot.id } });
    }

    await transaction.inspection.deleteMany({
      where: { id: inspectionId, notes: { startsWith: TEMPORARY_NOTE_PREFIX } },
    });
  });
}

async function cleanupStaleTemporaryInspections(): Promise<void> {
  const staleInspections = await prisma.inspection.findMany({
    where: { notes: { startsWith: TEMPORARY_NOTE_PREFIX } },
    select: { id: true },
  });

  for (const inspection of staleInspections) {
    await cleanupTemporaryInspection(inspection.id);
  }
}

function unwrap<TData>(result: Result<TData>): TData {
  if (!result.success) {
    throw new Error(`${result.code}: ${result.message}`);
  }
  return result.data;
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is not an object.`);
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} is not an array.`);
  }
  return value;
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} is not a string.`);
  }
  return value;
}

function asNumber(value: unknown, label: string): number {
  if (typeof value !== "number") {
    throw new Error(`${label} is not a number.`);
  }
  return value;
}

function asResponseStatus(value: unknown): "COMPLIANT" | "NON_COMPLIANT" | "NOT_APPLICABLE" {
  if (value !== "COMPLIANT" && value !== "NON_COMPLIANT" && value !== "NOT_APPLICABLE") {
    throw new Error("The offline operation contains an invalid response status.");
  }
  return value;
}
