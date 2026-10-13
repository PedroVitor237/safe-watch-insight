import { readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { expect, test, type Page } from "@playwright/test";

// Real Chromium worker + HTTP responses; synthetic identities, no database or RPC mocks.
let server: Server;
let origin: string;
const privateMarker = "PRIVATE_HTML_USER_A";

test.beforeAll(async () => {
  const worker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  server = createServer(async (request, response) => {
    const pathname = new URL(request.url!, "http://localhost").pathname;
    if (pathname === "/sw.js") {
      response.setHeader("Content-Type", "text/javascript");
      response.end(worker);
    } else if (["/offline.html", "/manifest.json", "/icons/safe-watch.svg"].includes(pathname)) {
      const file = await readFile(new URL(`../public${pathname}`, import.meta.url));
      response.setHeader(
        "Content-Type",
        pathname.endsWith("json")
          ? "application/json"
          : pathname.endsWith("svg")
            ? "image/svg+xml"
            : "text/html",
      );
      response.end(file);
    } else if (pathname === "/offline-shell") {
      response.setHeader("Content-Type", "text/html");
      response.end("<!doctype html><h1>Public offline shell</h1>");
    } else if (pathname === "/assets/private.js") {
      response.setHeader("Content-Type", "text/javascript");
      response.setHeader("Cache-Control", "private, no-store");
      response.end(`window.privateAsset = '${privateMarker}';`);
    } else if (pathname === "/assets/redirect.js") {
      response.writeHead(302, { Location: "/assets/private.js" });
      response.end();
    } else if (pathname === "/assets/public.js") {
      response.setHeader("Content-Type", "text/javascript");
      response.end("window.publicAsset = true;");
    } else if (pathname.startsWith("/_serverFn/")) {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ privateData: privateMarker }));
    } else {
      response.setHeader("Content-Type", "text/html");
      // A expires without executing the application's logout cleanup.
      const identity = request.headers.cookie?.includes("fixture_identity=A")
        ? privateMarker
        : "PUBLIC_LOGIN";
      response.end(
        `<!doctype html><h1>${pathname === "/dashboard" ? identity : "PUBLIC_LOGIN"}</h1>`,
      );
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing HTTP fixture address");
  origin = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

async function control(page: Page) {
  await page.goto(`${origin}/login`);
  await page.evaluate(async () => {
    await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

async function cachedBodies(page: Page) {
  return page.evaluate(async () => {
    const entries: Array<{ url: string; body: string }> = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        const response = await cache.match(request);
        entries.push({ url: request.url, body: await response!.text() });
      }
    }
    return entries;
  });
}

test("expired identity cannot replay A's authenticated navigation offline", async ({
  page,
  context,
}) => {
  await control(page);
  await context.addCookies([{ name: "fixture_identity", value: "A", url: origin }]);
  await page.goto(`${origin}/dashboard`);
  await expect(page.getByText(privateMarker)).toBeVisible();
  // Inspect persistent bodies before changing identity, rather than relying on guards.
  expect
    .soft((await cachedBodies(page)).some((entry) => entry.body.includes(privateMarker)))
    .toBe(false);
  await context.clearCookies();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(privateMarker)).toHaveCount(0);
  await expect(page.getByText("Public offline shell")).toBeVisible();
});

test("private GET APIs bypass persistent caching, including an image destination", async ({
  page,
  context,
}) => {
  await control(page);
  expect(await page.evaluate(async () => (await fetch("/_serverFn/private")).json())).toEqual({
    privateData: privateMarker,
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = image.onerror = () => resolve();
        image.src = "/_serverFn/private-image";
      }),
  );
  expect((await cachedBodies(page)).filter((entry) => entry.url.includes("_serverFn"))).toEqual([]);
  await context.setOffline(true);
  expect(
    await page.evaluate(async () => {
      try {
        await fetch("/_serverFn/private");
        return "cached";
      } catch {
        return "network failure";
      }
    }),
  ).toBe("network failure");
  expect(
    await page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          const image = new Image();
          image.onload = () => resolve(true);
          image.onerror = () => resolve(false);
          image.src = "/icons/safe-watch.svg";
        }),
    ),
  ).toBe(true);
});

test("activation removes legacy private HTML and static responses", async ({ page }) => {
  await control(page);
  await page.evaluate(async (marker) => {
    for (const name of ["safe-watch-v1-navigation", "safe-watch-v1-static"]) {
      const cache = await caches.open(name);
      await cache.put("/dashboard", new Response(marker));
    }
    await navigator.serviceWorker.register("/sw.js?updated");
  }, privateMarker);
  await expect
    .poll(() => page.evaluate(() => caches.keys()))
    .not.toContain("safe-watch-v1-navigation");
  expect(await page.evaluate(() => caches.keys())).not.toContain("safe-watch-v1-static");
  expect((await cachedBodies(page)).some((entry) => entry.body.includes(privateMarker))).toBe(
    false,
  );
});

test("runtime assets respect no-store and redirects while public scripts work offline", async ({
  page,
  context,
}) => {
  await control(page);
  await page.evaluate(async () => {
    for (const path of ["/assets/public.js", "/assets/private.js", "/assets/redirect.js"]) {
      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.onload = script.onerror = () => resolve();
        script.src = path;
        document.head.append(script);
      });
    }
  });
  const entries = await cachedBodies(page);
  expect(entries.some((entry) => entry.url.endsWith("/assets/public.js"))).toBe(true);
  expect(entries.some((entry) => entry.body.includes(privateMarker))).toBe(false);
  await context.setOffline(true);
  expect(
    await page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          const script = document.createElement("script");
          script.onload = () => resolve(Reflect.get(window, "publicAsset") === true);
          script.onerror = () => resolve(false);
          script.src = "/assets/public.js";
          document.head.append(script);
        }),
    ),
  ).toBe(true);
});
