import { expect, test, type Page } from "@playwright/test";
import type { DashboardDto } from "../src/server/services/dashboard.service";

// Exercise the real SPA, guards, hooks and IndexedDB with synthetic RPC results.
// No test account, cookie or request is sent to a database or external service.
test.use({ serviceWorkers: "block" });

const users = {
  A: {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Cache User A",
    email: "a@test.invalid",
    role: "TECHNICIAN",
  },
  B: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Cache User B",
    email: "b@test.invalid",
    role: "TECHNICIAN",
  },
} as const;
type Identity = keyof typeof users;
const privateName = (identity: Identity) => `Empresa privada exclusiva ${identity}`;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function dashboard(identity: Identity): DashboardDto {
  return {
    summary: {
      totalInspections: 1,
      completedInspections: 0,
      inProgressInspections: 0,
      plannedInspections: 1,
      cancelledInspections: 0,
      totalNonConformities: 0,
      openNonConformities: 0,
      resolvedNonConformities: 0,
      overdueNonConformities: 0,
      overdueCorrectiveActions: 0,
    },
    compliance: {
      percentage: null,
      compliantResponses: 0,
      nonCompliantResponses: 0,
      applicableResponses: 0,
    },
    inspectionStatusDistribution: [{ status: "PLANNED", count: 1 }],
    recentInspections: [
      {
        id: users[identity].id,
        title: `Inspeção privada ${identity}`,
        sourceVersionNumber: 1,
        companyName: privateName(identity),
        inspectorName: users[identity].name,
        inspectionDate: new Date("2026-10-13T12:00:00Z"),
        status: "PLANNED",
      },
    ],
  };
}

async function installRpcFixture(page: Page) {
  const state = {
    current: null as Identity | null,
    nextLogin: "A" as Identity,
    holdDashboard: null as {
      identity: Identity;
      started: ReturnType<typeof deferred>;
      release: ReturnType<typeof deferred>;
    } | null,
    failDashboard: false,
  };
  await page.route("**/_serverFn/**", async (route) => {
    const id = new URL(route.request().url()).pathname.split("/").pop()!;
    const { export: functionExport } = JSON.parse(Buffer.from(id, "base64url").toString()) as {
      export: string;
    };
    const name = functionExport.split("_createServerFn_")[0];
    let result: unknown;
    if (name === "login") {
      state.current = state.nextLogin;
      result = { success: true, data: users[state.current] };
    } else if (name === "logout") {
      state.current = null;
      result = { success: true, data: null };
    } else if (name === "getCurrentSession") {
      result = state.current
        ? { success: true, data: users[state.current] }
        : {
            success: false,
            code: "UNAUTHORIZED",
            statusCode: 401,
            message: "Test session expired",
          };
    } else if (name === "getDashboard") {
      const identity = state.current;
      if (!identity) throw new Error("Dashboard requested without a test identity");
      const hold = state.holdDashboard;
      if (hold?.identity === identity) {
        hold.started.resolve();
        await hold.release.promise;
      }
      result = state.failDashboard
        ? {
            success: false,
            code: "INTERNAL_SERVER_ERROR",
            statusCode: 500,
            message: "Test failure",
          }
        : { success: true, data: dashboard(identity) };
    } else {
      // Fail closed: an unexpected RPC must never reach the application backend.
      await route.abort();
      throw new Error(`Unexpected RPC: ${name}`);
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ result }) });
  });
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeVisible();
  // SSR makes the form visible before React attaches its event handlers.
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("#email") ?? {}).some((key) =>
      key.startsWith("__reactProps$"),
    ),
  );
  await page.evaluate(() => {
    Object.assign(window, { cacheTestDocument: crypto.randomUUID() });
  });
  return state;
}

async function login(
  page: Page,
  state: Awaited<ReturnType<typeof installRpcFixture>>,
  identity: Identity,
) {
  state.nextLogin = identity;
  await page.getByLabel("E-mail", { exact: true }).fill(users[identity].email);
  await page.getByLabel("Senha", { exact: true }).fill("Synthetic@123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(users[identity].name, { exact: true }).first()).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeVisible();
}

test("A → logout → B never reuses A's dashboard, even with delayed or failed B queries", async ({
  page,
}) => {
  const state = await installRpcFixture(page);
  const documentId = await page.evaluate(() => Reflect.get(window, "cacheTestDocument") as string);
  await login(page, state, "A");
  await expect(page.getByText(privateName("A"))).toBeVisible();
  await logout(page);
  const hold = { identity: "B" as const, started: deferred(), release: deferred() };
  state.holdDashboard = hold;
  try {
    await login(page, state, "B");
    await hold.started.promise;
    await expect(page.getByText(privateName("A"))).toHaveCount(0);
  } finally {
    hold.release.resolve();
  }
  await expect(page.getByText(privateName("B"))).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, "cacheTestDocument"))).toBe(documentId);
  state.holdDashboard = null;
  await logout(page);
  state.failDashboard = true;
  await login(page, state, "A");
  await expect(
    page.getByText("Não foi possível carregar o Dashboard", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(privateName("B"))).toHaveCount(0);
  state.failDashboard = false;
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByText(privateName("A"))).toBeVisible();
});

test("a request started by A cannot fill B's cache after logout", async ({ page }) => {
  const state = await installRpcFixture(page);
  const hold = { identity: "A" as const, started: deferred(), release: deferred() };
  state.holdDashboard = hold;
  try {
    await login(page, state, "A");
    await hold.started.promise;
    await logout(page);
    await login(page, state, "B");
    await expect(page.getByText(privateName("B"))).toBeVisible();
  } finally {
    hold.release.resolve();
  }
  await expect(page.getByText(privateName("A"))).toHaveCount(0);
  await expect(page.getByText(privateName("B"))).toBeVisible();
});

test("a changed identity detected by the route guard replaces the cache without logout", async ({
  page,
}) => {
  const state = await installRpcFixture(page);
  await login(page, state, "A");
  await expect(page.getByText(privateName("A"))).toBeVisible();
  state.current = "B";
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page.getByText(users.B.name, { exact: true }).first()).toBeVisible();
  const hold = { identity: "B" as const, started: deferred(), release: deferred() };
  state.holdDashboard = hold;
  try {
    await page.getByRole("link", { name: "Dashboard", exact: true }).click();
    await hold.started.promise;
    await expect(page.getByText(privateName("A"))).toHaveCount(0);
  } finally {
    hold.release.resolve();
  }
  await expect(page.getByText(privateName("B"))).toBeVisible();
});

test("remote expiry and local offline expiry dispose the authenticated cache", async ({
  page,
  context,
}) => {
  const state = await installRpcFixture(page);
  await login(page, state, "A");
  await expect(page.getByText(privateName("A"))).toBeVisible();
  state.current = null;
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  const hold = { identity: "B" as const, started: deferred(), release: deferred() };
  state.holdDashboard = hold;
  try {
    await login(page, state, "B");
    await hold.started.promise;
    await expect(page.getByText(privateName("A"))).toHaveCount(0);
  } finally {
    hold.release.resolve();
  }
  await expect(page.getByText(privateName("B"))).toBeVisible();
  state.holdDashboard = null;
  // Warm the existing route module before testing a navigation without a SW.
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page).toHaveURL(/\/configuracoes$/);
  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.evaluate(async () => {
    const path = "/src/offline/database.ts";
    const { getOfflineDatabase } = (await import(path)) as typeof import("../src/offline/database");
    await getOfflineDatabase().sessions.update("current", { expiresAt: new Date(0) });
  });
  await context.setOffline(true);
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await context.setOffline(false);
  state.current = null;
  state.failDashboard = true;
  await login(page, state, "A");
  await expect(
    page.getByText("Não foi possível carregar o Dashboard", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(privateName("B"))).toHaveCount(0);
});

test("the provider isolates pending queries and mutation callbacks while preserving public cache and sync invalidation", async ({
  page,
}) => {
  await installRpcFixture(page);
  const evidence = await page.evaluate(async () => {
    const path = "/e2e/session-query-harness.ts";
    const { mount, unmount, publicClient, isCancelledError } = (await import(
      path
    )) as typeof import("./session-query-harness");
    const gate = () => {
      let resolve!: () => void;
      const promise = new Promise<void>((done) => {
        resolve = done;
      });
      return { promise, resolve };
    };
    const publicKey = ["public", "help"];
    const privateKey = ["dashboard", "overview"];
    publicClient.setQueryData(publicKey, "public content");
    const a = mount("A");
    a.setQueryData(privateKey, "private A");
    const request = gate();
    const requestStarted = gate();
    const queryResult = a
      .fetchQuery({
        queryKey: privateKey,
        queryFn: async () => {
          requestStarted.resolve();
          await request.promise; // Deliberately ignores AbortSignal.
          return "late private A";
        },
      })
      .catch((error: unknown) => isCancelledError(error));
    await requestStarted.promise;
    const mutationGate = gate();
    const mutationStarted = gate();
    const mutation = a.getMutationCache().build(a, {
      mutationFn: async () => {
        mutationStarted.resolve();
        await mutationGate.promise;
        return "mutation A";
      },
      // Deliberately writes data; current app callbacks only invalidate queries.
      onSuccess: (data) => {
        a.setQueryData(privateKey, data);
      },
    });
    const mutationResult = mutation.execute(undefined);
    await mutationStarted.promise;
    mount(null);
    const removedOnLogout =
      a.getQueryCache().getAll().length === 0 && a.getMutationCache().getAll().length === 0;
    const b = mount("B");
    const initiallyEmpty = b.getQueryData(privateKey) === undefined;
    b.setQueryData(privateKey, "private B");
    request.resolve();
    mutationGate.resolve();
    const cancelled = await queryResult;
    await mutationResult;
    const isolatedAfterLateResults = b.getQueryData(privateKey) === "private B";
    const stableDuringNavigation = mount("B") === b && b.getQueryData(privateKey) === "private B";

    const keys = [
      ["inspections", "detail", "test-inspection"],
      ["inspection-responses", "list", "test-inspection"],
      ["inspections", "list", {}],
      ["non-conformities", "list", {}],
    ];
    for (const queryKey of keys) b.setQueryData(queryKey, "cached result");
    window.dispatchEvent(
      new CustomEvent("safe-watch-offline-synchronized", {
        detail: { inspectionId: "test-inspection" },
      }),
    );
    const syncInvalidation = keys.every(
      (queryKey) => b.getQueryState(queryKey)?.isInvalidated === true,
    );
    // An identity switch in an already mounted layout must also replace the client.
    const c = mount("C");
    const directSwitchIsolated =
      c !== b &&
      c.getQueryData(privateKey) === undefined &&
      b.getQueryCache().getAll().length === 0;
    mount(null);
    const newLogin = mount("C");
    const sameUserNewSession = newLogin !== c;
    unmount();
    const publicPreserved = publicClient.getQueryData(publicKey) === "public content";
    publicClient.clear();
    return {
      removedOnLogout,
      initiallyEmpty,
      cancelled,
      isolatedAfterLateResults,
      stableDuringNavigation,
      syncInvalidation,
      directSwitchIsolated,
      sameUserNewSession,
      publicPreserved,
    };
  });
  expect(evidence).toEqual({
    removedOnLogout: true,
    initiallyEmpty: true,
    cancelled: true,
    isolatedAfterLateResults: true,
    stableDuringNavigation: true,
    syncInvalidation: true,
    directSwitchIsolated: true,
    sameUserNewSession: true,
    publicPreserved: true,
  });
});
