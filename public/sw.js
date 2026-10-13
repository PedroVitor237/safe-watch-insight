const CACHE_VERSION = "safe-watch-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_SHELL = "/offline-shell";
const CORE_ASSETS = [OFFLINE_SHELL, "/offline.html", "/manifest.json", "/icons/safe-watch.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll(
          CORE_ASSETS.map((url) => new Request(url, { credentials: "omit", cache: "reload" })),
        ),
      ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("safe-watch-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (
    isPublicAsset(url) &&
    ["script", "style", "font", "image", "manifest"].includes(request.destination)
  ) {
    event.respondWith(
      isDevelopmentModule(url) ? networkFirstStatic(request) : cacheFirstStatic(request),
    );
  }
});

function isPublicAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    isDevelopmentModule(url)
  );
}

function isCacheableAsset(response) {
  return (
    response.ok &&
    !response.redirected &&
    !/\b(no-store|private)\b/i.test(response.headers.get("Cache-Control") || "")
  );
}

function isDevelopmentModule(url) {
  return (
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/node_modules/") ||
    url.pathname.startsWith("/@")
  );
}

async function networkFirstNavigation(request) {
  try {
    // SSR documents can contain identity and serialized private data, even with no-store.
    // Never persist them or use a previously cached document as a fallback.
    return await fetch(request);
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    return (
      (await cache.match(OFFLINE_SHELL)) || (await cache.match("/offline.html")) || Response.error()
    );
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (isCacheableAsset(response)) {
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstStatic(request) {
  try {
    const response = await fetch(request);
    if (isCacheableAsset(response)) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    return (await cache.match(request)) || Response.error();
  }
}
