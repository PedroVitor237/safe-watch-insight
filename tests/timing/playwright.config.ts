import { randomUUID } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

const run = `${new Date().toISOString().slice(0, 10)}-${randomUUID()}`;

export default defineConfig({
  testDir: ".",
  testMatch: "workflow.spec.ts",
  outputDir: `../../test-results/timing/${run}`,
  tsconfig: "../../tsconfig.json",
  workers: 1,
  retries: 0,
  timeout: 80 * 60_000,
  expect: { timeout: 20_000 },
  reporter: "list",
  use: {
    ...devices["Pixel 7"],
    browserName: "chromium",
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    trace: "off",
    launchOptions: { executablePath: process.env.SW_TIMING_CHROMIUM_PATH },
  },
});
