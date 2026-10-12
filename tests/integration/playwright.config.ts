import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

const port = Number(process.env.CONCURRENCY_WEB_PORT);
if (!port || !process.env.CONCURRENCY_TEST_TOKEN)
  throw new Error("Use the disposable concurrency runner.");

export default defineConfig({
  testDir: ".",
  testMatch: "inspection-concurrency.spec.ts",
  workers: 1,
  fullyParallel: false,
  timeout: 45_000,
  reporter: "list",
  // Independent tabs/contexts in one browser, not independent physical devices.
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${port}`,
    serviceWorkers: "block",
    trace: "off",
  },
  webServer: {
    cwd: fileURLToPath(new URL("../../", import.meta.url)),
    command: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/offline.html`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
