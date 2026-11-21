import { randomUUID } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { arch, platform, release } from "node:os";
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { devices, expect, test, type Page } from "@playwright/test";

import { checklistTitle, items, prepareFixture, readEnvironment } from "./fixture";

const device = devices["Pixel 7"];
const typingWpm = 36.2;
const typingDelayMs = Math.round(60_000 / (5 * typingWpm));
const flows = ["inspection", "report"] as const;
const conditions = ["after-idle", "consecutive", "pilot"] as const;
type Flow = (typeof flows)[number];
type Condition = (typeof conditions)[number];

interface Sample {
  flow: Flow;
  condition: Condition;
  block: number;
  attempt: number;
  startedAt: string;
  outcome: "passed" | "failed";
  stage: string;
  idleMs: number;
  accessMs?: number;
  fillingMs?: number;
  fillingAndLocalCompletionMs?: number;
  reportReadyMs?: number;
}

type Metric = "accessMs" | "fillingMs" | "fillingAndLocalCompletionMs" | "reportReadyMs";

test("tempos mobile de inspeção e relatório", async ({ browser }, testInfo) => {
  const { mode, target, database } = readEnvironment();
  const deploymentCommit = process.env.SW_TIMING_DEPLOY_SHA;
  if (mode === "study" && !/^[0-9a-f]{40}$/i.test(deploymentCommit ?? "")) {
    throw new Error("Informe o SHA completo do deploy em SW_TIMING_DEPLOY_SHA.");
  }

  const runId = randomUUID();
  const path = testInfo.outputPath("tempos-mobile.json");
  const blocks = mode === "study" ? 3 : 1;
  const attempts = mode === "study" ? 6 : 1;
  const idleDuration = mode === "study" ? 6 * 60_000 : 0;
  const samples: Sample[] = [];
  const startedAt = new Date().toISOString();

  async function save(status: "running" | "finished" | "interrupted", stage: string) {
    const payload = {
      runId,
      status,
      stage,
      startedAt,
      updatedAt: new Date().toISOString(),
      mode,
      deployment: { origin: target.origin, commit: deploymentCommit ?? null },
      runner: { platform: platform(), release: release(), arch: arch(), node: process.version },
      browser: { name: browser.browserType().name(), version: browser.version() },
      profile: { device: "Pixel 7", viewport: device.viewport, typingWpm, typingDelayMs },
      procedure: {
        blocks,
        attemptsPerBlock: attempts,
        idleDurationMs: idleDuration,
        items,
        images: 0,
      },
      samples,
      summary: summarize(samples, mode, blocks, attempts),
    };
    await mkdir(dirname(path), { recursive: true });
    await writeFile(`${path}.tmp`, JSON.stringify(payload, null, 2) + "\n");
    await rename(`${path}.tmp`, path);
  }

  await save("running", "fixture");
  console.log(`Resultados do ensaio: ${path}`);
  let stage = "fixture";
  let fixture: Awaited<ReturnType<typeof prepareFixture>> | undefined;

  try {
    fixture = await prepareFixture(database, runId, blocks * attempts);
    stage = "login";
    const loginContext = await browser.newContext({ ...device, baseURL: target.origin });
    const storageState = await (async () => {
      try {
        const page = await loginContext.newPage();
        await signIn(page, fixture.email, fixture.password);
        return await loginContext.storageState({ indexedDB: true });
      } finally {
        await loginContext.close();
      }
    })();

    stage = "measurement";
    for (const flow of flows) {
      for (let block = 1; block <= blocks; block += 1) {
        console.log(`${flow} · bloco ${block}/${blocks}`);
        const idleStart = performance.now();
        if (idleDuration > 0) await delay(idleDuration);
        const idleMs = Math.round(performance.now() - idleStart);
        for (let attempt = 1; attempt <= attempts; attempt += 1) {
          const context = await browser.newContext({
            ...device,
            baseURL: target.origin,
            storageState,
          });
          const sample: Sample = {
            flow,
            block,
            attempt,
            condition: mode === "pilot" ? "pilot" : attempt === 1 ? "after-idle" : "consecutive",
            startedAt: new Date().toISOString(),
            outcome: "failed",
            stage: "opening",
            idleMs: attempt === 1 ? idleMs : 0,
          };

          try {
            const page = await context.newPage();
            if (flow === "inspection") {
              const inspectionId = fixture.inspectionIds[(block - 1) * attempts + attempt - 1];
              await measureInspection(page, inspectionId, sample);
              // Verify durable state after the clock stops, while the browser can still sync.
              sample.stage = "server-verification";
              const currentFixture = fixture;
              await expect
                .poll(() => currentFixture.isPersisted(inspectionId), {
                  timeout: 45_000,
                  intervals: [500, 1000, 2000],
                })
                .toBe(true);
            } else {
              await measureReport(page, fixture.reportId, sample);
            }
            sample.outcome = "passed";
            sample.stage = "complete";
          } catch (error) {
            // The raw output contains synthetic data only. Never publish Playwright traces,
            // credentials, or request payloads.
            console.log(
              `${flow} · ${block}.${attempt} falhou em ${sample.stage}: ${errorName(error)}`,
            );
          } finally {
            samples.push(sample);
            await save("running", stage);
            await context.close();
          }
        }
      }
    }
    await save("finished", "complete");
  } catch (error) {
    await save("interrupted", stage);
    const details =
      stage === "fixture"
        ? "Verifique migrations, banco dedicado e conexão."
        : stage === "login"
          ? "Confirme que o deploy usa o mesmo banco e está acessível."
          : "Consulte o JSON parcial.";
    throw new Error(`Ensaio interrompido em ${stage} (${errorName(error)}). ${details}`);
  } finally {
    await fixture?.disconnect();
  }

  expect(samples.filter((sample) => sample.outcome === "failed")).toHaveLength(0);
});

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForFunction(() => {
    const form = document.querySelector('input[name="password"]')?.closest("form");
    return form && Object.keys(form).some((key) => key.startsWith("__reactProps$"));
  });
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function measureInspection(page: Page, id: string, sample: Sample) {
  const start = performance.now();
  await page.goto(`/inspecoes/${id}`, { waitUntil: "commit" });
  await expect(page.getByRole("heading", { level: 1, name: checklistTitle })).toBeVisible();
  await expect(page.getByText(`0/${items.length} itens`, { exact: true })).toBeVisible();
  const firstAction = responseCard(page, items[0].description).getByRole("button", {
    name: items[0].button,
    exact: true,
  });
  await expect
    .poll(() =>
      firstAction.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactProps$")),
      ),
    )
    .toBe(true);
  await expect(firstAction).toBeEnabled();
  const ready = performance.now();
  sample.accessMs = Math.round(ready - start);

  sample.stage = "filling";
  for (const [index, item] of items.entries()) {
    const card = responseCard(page, item.description);
    const action = card.getByRole("button", { name: item.button, exact: true });
    await action.tap();
    await expect(
      page.getByText(`${index + 1}/${items.length} itens`, { exact: true }),
    ).toBeVisible();
    if ("observation" in item) {
      const observation = card.getByPlaceholder("Observações, evidências verbais, contexto...");
      await expect(observation).toBeEditable();
      await observation.pressSequentially(item.observation, { delay: typingDelayMs });
      await expect(observation).toHaveValue(item.observation);
      await observation.blur();
    }
  }
  await expect(firstAction).toBeEnabled();
  sample.fillingMs = Math.round(performance.now() - ready);

  sample.stage = "local-completion";
  await page.getByRole("tab", { name: "Encerrar", exact: true }).tap();
  await page.getByRole("button", { name: "Concluir inspeção", exact: true }).tap();
  await expect(
    page.getByText("Inspeção concluída localmente; sincronização iniciada.", { exact: true }),
  ).toBeVisible();
  sample.fillingAndLocalCompletionMs = Math.round(performance.now() - ready);
}

function responseCard(page: Page, description: string) {
  return page.locator("div.rounded-lg.border.p-4").filter({
    has: page.getByText(description, { exact: true }),
  });
}

async function measureReport(page: Page, inspectionId: string, sample: Sample) {
  const start = performance.now();
  await page.goto(`/relatorios?inspectionId=${inspectionId}`, { waitUntil: "commit" });
  sample.stage = "report-render";
  const report = page.locator("article.print-report");
  await expect(report.getByText(`Inspeção ${inspectionId}`, { exact: true })).toBeVisible();
  sample.stage = "report-items";
  const results = report.locator("section").filter({
    has: page.getByRole("heading", { name: "Resultados item a item", exact: true }),
  });
  await expect(results.locator("article")).toHaveCount(items.length);
  for (const item of items) {
    const entry = results.locator("article").filter({
      has: page.getByRole("heading", { name: item.description, exact: true }),
    });
    await expect(entry).toBeVisible();
    if ("observation" in item) {
      await expect(entry.getByText(item.observation, { exact: true })).toBeVisible();
    }
  }
  sample.stage = "report-print-ready";
  await expect(page.getByRole("button", { name: "Imprimir", exact: true })).toBeEnabled();
  sample.reportReadyMs = Math.round(performance.now() - start);
}

const metricsByFlow: Record<Flow, Metric[]> = {
  inspection: ["accessMs", "fillingMs", "fillingAndLocalCompletionMs"],
  report: ["reportReadyMs"],
};

function summarize(samples: Sample[], mode: string, blocks: number, attempts: number) {
  return flows.flatMap((flow) =>
    conditions.flatMap((condition) => {
      const pilot = condition === "pilot";
      if (pilot !== (mode === "pilot")) return [];
      const group = samples.filter((row) => row.flow === flow && row.condition === condition);
      const passed = group.filter((row) => row.outcome === "passed");
      const planned = condition === "consecutive" ? blocks * (attempts - 1) : blocks;
      return [
        {
          flow,
          condition,
          planned,
          passed: passed.length,
          failed: group.length - passed.length,
          remaining: planned - group.length,
          metrics: Object.fromEntries(
            metricsByFlow[flow].map((metric) => [
              metric,
              statistics(passed.flatMap((row) => row[metric] ?? [])),
            ]),
          ),
        },
      ];
    }),
  );
}

function statistics(values: number[]) {
  if (values.length === 0) return null;
  const ordered = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  const median = ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  return {
    n: ordered.length,
    meanMs: Math.round(mean * 100) / 100,
    medianMs: median,
    minMs: ordered[0],
    maxMs: ordered[ordered.length - 1],
  };
}

function errorName(error: unknown) {
  return error instanceof Error ? error.name : "Error";
}
