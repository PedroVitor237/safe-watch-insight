import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, expect as playwrightExpect, type Locator, type Page } from "@playwright/test";

const expect = playwrightExpect.configure({ timeout: 15_000 });
const origin = "https://safe-watch-insight-timing.vercel.app";
const deployment = {
  origin,
  id: "dpl_9nBhHuVpEmuxFHWbxNK8Ha6Ka3Hx",
  project: "safe-watch-insight-timing",
  projectId: "prj_W58Dd38R2lx3QqEhJXJqkcIemFky",
  commit: "b247c8694c06221a64000e6844479bf7a015e429",
  region: "gru1",
};
const database = {
  project: "SafeWatchInsightTiming",
  projectId: "icy-cake-52272050",
  branchId: "br-sparkling-meadow-b689n13x",
  endpoint: "ep-young-brook-b6zvhv9e.c-2.sa-east-1.aws.neon.tech",
  name: "safe_watch_timing",
  region: "aws-sa-east-1",
};
const timingRunEmail = "sw-timing-466a55a2-ede9-4cf0-824d-38c9ef2e3057@example.test";
const stages = [
  "empresa",
  "checklist",
  "inspecaoCriada",
  "respostasEConclusao",
  "persistencia",
  "relatorio",
  "naoConformidade",
] as const;

type Stage = (typeof stages)[number];
type Step = { status: "nao_executada" | "aprovada" | "falha" | "nao_aplicavel"; detalhe?: string };
interface Cycle {
  numero: number;
  empresa: string;
  checklist: string;
  itens: [string, string];
  observacaoNC: string | null;
  checklistId?: string;
  inspecaoId?: string;
  relatorioInspecaoId?: string;
  etapas: Record<Stage, Step>;
}

const runId = randomUUID();
const account = `sw-volume-${runId}@example.test`;
const password = `Volume!${randomUUID()}`;
const output = resolve(process.argv[2] ?? "test-results/volume/volume-" + runId + ".json");
const cycles: Cycle[] = Array.from({ length: 30 }, (_, index) => {
  const numero = index + 1;
  const tag = `VOL ${runId} ${String(numero).padStart(2, "0")}`;
  const observacaoNC = numero % 3 === 0 ? `Observação sintética ${tag}` : null;
  const etapas: Cycle["etapas"] = {
    empresa: { status: "nao_executada" },
    checklist: { status: "nao_executada" },
    inspecaoCriada: { status: "nao_executada" },
    respostasEConclusao: { status: "nao_executada" },
    persistencia: { status: "nao_executada" },
    relatorio: { status: "nao_executada" },
    naoConformidade: { status: observacaoNC ? "nao_executada" : "nao_aplicavel" },
  };
  return {
    numero,
    empresa: `Empresa sintética ${tag}`,
    checklist: `Checklist ${tag}`,
    itens: [`Circulação desobstruída ${tag}`, `Sinalização de saída ${tag}`],
    observacaoNC,
    etapas,
  };
});

const file = fileURLToPath(import.meta.url);
const repo = resolve(dirname(file), "../..");
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
const script = "tests/volume/workflow.ts";
const runnerCommit = git("rev-parse", "HEAD");
const startedAt = new Date().toISOString();
let browserVersion: string | undefined;
let preflight = "metadados";
let status: "em_execucao" | "finalizado" | "interrompido" = "em_execucao";
let audit: Awaited<ReturnType<typeof verifyDatabase>> | undefined;
let reportInventory: string[] | undefined;
let checkPoint = "";

function summary() {
  return Object.fromEntries(
    stages.map((stage) => {
      const steps = cycles.map((cycle) => cycle.etapas[stage].status);
      const aprovadas = steps.filter((step) => step === "aprovada").length;
      const falhas = steps.filter((step) => step === "falha").length;
      return [
        stage,
        {
          previstas: steps.length - steps.filter((step) => step === "nao_aplicavel").length,
          iniciadas: aprovadas + falhas,
          aprovadas,
          falhas,
          naoExecutadas: steps.filter((step) => step === "nao_executada").length,
        },
      ];
    }),
  );
}

function isComplete(cycle: Cycle) {
  return Object.values(cycle.etapas).every(
    ({ status }) => status === "aprovada" || status === "nao_aplicavel",
  );
}

async function save() {
  await mkdir(dirname(output), { recursive: true });
  const evidence = {
    runId,
    status,
    preflight,
    startedAt,
    updatedAt: new Date().toISOString(),
    deployment,
    database,
    runnerCommit,
    runner: { node: process.version, platform: process.platform, chromium: browserVersion },
    ciclosCompletos: cycles.filter(isComplete).length,
    resumo: summary(),
    relatoriosDisponiveis: reportInventory,
    verificacaoComplementar: audit,
    ciclos: cycles,
  };
  await writeFile(output + ".tmp", JSON.stringify(evidence, null, 2) + "\n");
  await rename(output + ".tmp", output);
}

async function step(cycle: Cycle, stage: Stage, action: () => Promise<void>) {
  checkPoint = "verificação inicial";
  try {
    await action();
    cycle.etapas[stage] = { status: "aprovada" };
  } catch (error) {
    const type = error instanceof Error ? error.name : "Erro";
    cycle.etapas[stage] = { status: "falha", detalhe: `${checkPoint} (${type})` };
    console.log(`Ciclo ${cycle.numero}: ${stage} falhou em ${checkPoint} (${type}).`);
  }
  await save();
  return cycle.etapas[stage].status === "aprovada";
}

async function go(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  if (!response?.ok() || new URL(page.url()).origin !== origin) {
    throw new Error("Navegação fora do destino esperado ou sem resposta válida.");
  }
}

async function hydrated(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactProps$")),
      ),
    )
    .toBe(true);
}

function button(page: Page | Locator, name: string) {
  return page.getByRole("button", { name, exact: true });
}

function text(page: Page | Locator, label: string) {
  return page.getByText(label, { exact: true });
}

async function visibleDialog(page: Page, title: string) {
  const dialog = page.getByRole("dialog", { name: title });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function registerAndSignIn(page: Page) {
  await go(page, "/register");
  await hydrated(button(page, "Criar conta"));
  await page.getByLabel("Nome", { exact: true }).fill("Inspetora sintética de volume");
  await page.getByLabel("E-mail", { exact: true }).fill(account);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Confirmar senha", { exact: true }).fill(password);
  await button(page, "Criar conta").click();
  await expect(page).toHaveURL(origin + "/login");
  await hydrated(button(page, "Entrar"));
  await page.getByLabel("E-mail", { exact: true }).fill(account);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await button(page, "Entrar").click();
  await expect(page).toHaveURL(origin + "/dashboard");
}

async function createCompany(page: Page, cycle: Cycle) {
  checkPoint = "formulário de empresa";
  await go(page, "/empresas");
  await hydrated(button(page, "Nova empresa"));
  await button(page, "Nova empresa").click();
  const dialog = await visibleDialog(page, "Nova empresa");
  await dialog.getByLabel("Razão social").fill(cycle.empresa);
  await dialog.getByLabel("CNAE").fill("0000000");
  await dialog.getByLabel("Grau de risco").fill("1");
  await dialog.getByLabel("Funcionários").fill("10");
  checkPoint = "cadastro da empresa";
  await button(dialog, "Cadastrar empresa").click();
  await expect(dialog).toBeHidden();
  checkPoint = "consulta da empresa após nova navegação";
  await go(page, "/empresas");
  await expect(text(page, cycle.empresa).first()).toBeVisible();
}

function routeId(page: Page, route: "checklists" | "inspecoes") {
  const part = new URL(page.url()).pathname.match(new RegExp(`^/${route}/([0-9a-f-]{36})$`));
  if (!part) throw new Error("Identificador de rota ausente.");
  return part[1];
}

async function createChecklist(page: Page, cycle: Cycle) {
  checkPoint = "formulário do checklist";
  await go(page, "/checklists");
  await hydrated(button(page, "Novo modelo"));
  await button(page, "Novo modelo").click();
  const dialog = await visibleDialog(page, "Novo checklist");
  await dialog.getByLabel("Título", { exact: true }).fill(cycle.checklist);
  checkPoint = "cadastro e consulta do checklist";
  await button(dialog, "Cadastrar checklist").click();
  await expect(dialog).toBeHidden();
  const card = page.locator("div.h-full").filter({ has: text(page, cycle.checklist) });
  await card.getByRole("link", { name: "Abrir", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: cycle.checklist })).toBeVisible();
  cycle.checklistId = routeId(page, "checklists");

  for (const item of cycle.itens) {
    checkPoint = "cadastro de item obrigatório";
    await button(page, "Novo item").click();
    const itemForm = await visibleDialog(page, "Novo item");
    await itemForm.getByLabel("Descrição", { exact: true }).fill(item);
    await expect(itemForm.getByRole("switch", { name: "Obrigatório" })).toBeChecked();
    await button(itemForm, "Cadastrar item").click();
    await expect(itemForm).toBeHidden();
    await expect(text(page, item)).toBeVisible();
  }

  checkPoint = "publicação e consulta da v1";
  page.once("dialog", (confirmation) => confirmation.accept());
  await button(page, "Publicar v1").click();
  await expect(text(page, "Publicada v1")).toBeVisible();
  await go(page, `/checklists/${cycle.checklistId}`);
  await expect(text(page, "Publicada v1")).toBeVisible();
  for (const item of cycle.itens) await expect(text(page, item)).toBeVisible();
}

async function createInspection(page: Page, cycle: Cycle) {
  checkPoint = "seleção da empresa na inspeção";
  await go(page, "/inspecoes/nova");
  const select = page.getByRole("combobox");
  await hydrated(select);
  await expect(text(page, "Selecione a empresa fiscalizada.")).toBeVisible();
  await select.click();
  await page.getByRole("option", { name: cycle.empresa, exact: true }).click();
  await button(page, "Avançar").click();

  checkPoint = "seleção da versão publicada da inspeção";
  await expect(text(page, "A versão selecionada será congelada nesta inspeção.")).toBeVisible();
  await select.click();
  await page.getByRole("option", { name: cycle.checklist + " · v1", exact: true }).click();
  await button(page, "Avançar").click();
  await expect(text(page, "Empresa: " + cycle.empresa)).toBeVisible();
  await expect(text(page, "Checklist: " + cycle.checklist + " · v1")).toBeVisible();

  checkPoint = "cadastro e abertura da inspeção";
  await button(page, "Criar inspeção").click();
  await expect(page).toHaveURL(/\/inspecoes\/?$/);
  await page.getByPlaceholder("Buscar por empresa, checklist ou observações…").fill(cycle.empresa);
  const link = page.getByRole("link").filter({ has: text(page, cycle.checklist + " · v1") });
  await expect(link.getByText(cycle.empresa, { exact: true })).toBeVisible();
  await link.click();
  await expect(page.getByRole("heading", { level: 1, name: cycle.checklist })).toBeVisible();
  cycle.inspecaoId = routeId(page, "inspecoes");
  await expect(text(page, "0/2 itens")).toBeVisible();
}

function responseCard(page: Page, item: string) {
  return page.locator("div.rounded-lg.border.p-4").filter({ has: text(page, item) });
}

function observation(card: Locator) {
  return card.getByPlaceholder("Observações, evidências verbais, contexto...");
}

async function finishInspection(page: Page, cycle: Cycle) {
  checkPoint = "resposta de circulação";
  await button(responseCard(page, cycle.itens[0]), "Conforme").click();
  await expect(text(page, "1/2 itens")).toBeVisible();

  checkPoint = "resposta de sinalização";
  const card = responseCard(page, cycle.itens[1]);
  await button(card, cycle.observacaoNC ? "NC" : "Conforme").click();
  await expect(text(page, "2/2 itens")).toBeVisible();
  if (cycle.observacaoNC) {
    checkPoint = "observação da não conformidade";
    await observation(card).fill(cycle.observacaoNC);
    await observation(card).blur();
    await expect(observation(card)).toBeEditable();
  }

  checkPoint = "conclusão e início da sincronização";
  await page.getByRole("tab", { name: "Encerrar", exact: true }).click();
  await button(page, "Concluir inspeção").click();
  await expect(text(page, "Inspeção concluída localmente; sincronização iniciada.")).toBeVisible();
}

async function verifyPersistence(page: Page, cycle: Cycle) {
  checkPoint = "conclusão sincronizada em contexto de navegador novo";
  const id = cycle.inspecaoId;
  const reportLink = page.getByRole("link", { name: "Ver relatório", exact: true });
  await expect(async () => {
    await go(page, `/inspecoes/${id}`);
    await expect(reportLink).toHaveAttribute("href", `/relatorios?inspectionId=${id}`, {
      timeout: 3000,
    });
    await expect(
      page.getByText(
        /^(Sincronizando|Pendente de sincronização|Falha\/conflito de sincronização)$/,
      ),
    ).toHaveCount(0);
  }).toPass({ timeout: 45_000, intervals: [500, 1000, 2000] });
  await expect(text(page, "Concluída")).toBeVisible();
  await expect(text(page, "2/2 itens")).toBeVisible();

  checkPoint = "respostas recarregadas após sincronização";
  const first = responseCard(page, cycle.itens[0]);
  const second = responseCard(page, cycle.itens[1]);
  await expect(button(first, "Conforme")).toHaveClass(/\bbg-success\b/);
  await expect(button(first, "Conforme")).toBeDisabled();
  if (cycle.observacaoNC) {
    await expect(text(second, "Não conformidade identificada.")).toBeVisible();
    await expect(observation(second)).toHaveValue(cycle.observacaoNC);
  } else {
    await expect(button(second, "Conforme")).toHaveClass(/\bbg-success\b/);
  }
}

function section(report: Locator, title: string) {
  return report.locator("section").filter({ hasText: title });
}

function ncEntries(report: Locator) {
  return section(report, "Não conformidades e ações corretivas").locator("article");
}

async function verifyReport(page: Page, cycle: Cycle) {
  checkPoint = "relatório pronto e vinculado à inspeção";
  const id = cycle.inspecaoId;
  if (!id) throw new Error("Inspeção sem identificador.");
  await go(page, `/relatorios?inspectionId=${id}`);
  const report = page.locator("article.print-report");
  await expect(text(report, `Inspeção ${id}`)).toBeVisible();
  await expect(button(page, "Imprimir")).toBeEnabled();
  cycle.relatorioInspecaoId = id;

  checkPoint = "empresa, versão histórica e conclusão no relatório";
  await expect(report.getByRole("heading", { name: cycle.checklist, exact: true })).toBeVisible();
  const identification = section(report, "Identificação da inspeção");
  await expect(text(identification, cycle.empresa)).toHaveCount(2);
  await expect(text(identification, cycle.empresa).first()).toBeVisible();
  await expect(text(identification, cycle.checklist + " · v1")).toBeVisible();
  await expect(text(identification, "Concluída")).toBeVisible();

  checkPoint = "respostas e observação no relatório";
  const entries = section(report, "Resultados item a item").locator("article");
  await expect(entries).toHaveCount(2);
  for (const [index, item] of cycle.itens.entries()) {
    const entry = entries.filter({ hasText: item });
    await expect(entry.getByRole("heading", { name: item, exact: true })).toBeVisible();
    const nc = index === 1 && cycle.observacaoNC;
    await expect(text(entry, nc ? "Não conforme" : "Conforme")).toBeVisible();
    if (nc) await expect(text(entry, nc)).toBeVisible();
  }
  if (!cycle.observacaoNC) await expect(ncEntries(report)).toHaveCount(0);
}

async function verifyNc(page: Page, cycle: Cycle) {
  checkPoint = "ocorrência e observação na seção de não conformidades";
  const entries = ncEntries(page.locator("article.print-report"));
  await expect(entries).toHaveCount(1);
  await expect(entries.getByRole("heading", { name: cycle.itens[1], exact: true })).toBeVisible();
  await expect(
    entries.getByText("Observação da resposta: " + cycle.observacaoNC, { exact: true }),
  ).toBeVisible();
}

async function verifyReportInventory(page: Page) {
  await go(page, "/relatorios");
  const select = page.getByRole("combobox", { name: "Selecionar inspeção concluída" });
  await hydrated(select);
  await select.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  const options = await page.getByRole("option").allTextContents();
  return cycles.flatMap((cycle) => {
    const id = cycle.relatorioInspecaoId;
    const prefix = id && `${id.slice(0, 8)} — ${cycle.checklist} · ${cycle.empresa} · `;
    return prefix && options.filter((option) => option.trim().startsWith(prefix)).length === 1
      ? [id]
      : [];
  });
}

type DatabaseClient = (typeof import("../../src/server/prisma/client"))["prisma"];

async function otherRecords(prisma: DatabaseClient) {
  const prior = { email: { not: account } };
  const [usuarios, empresas, checklists, inspecoes] = await prisma.$transaction([
    prisma.user.count({ where: prior }),
    prisma.company.count({ where: { createdBy: prior } }),
    prisma.checklist.count({ where: { createdBy: prior } }),
    prisma.inspection.count({ where: { user: prior } }),
  ]);
  return { usuarios, empresas, checklists, inspecoes };
}

async function verifyDatabase(
  prisma: DatabaseClient,
  userId: string,
  before: Awaited<ReturnType<typeof otherRecords>>,
) {
  const [companies, checklists, inspections] = await prisma.$transaction([
    prisma.company.findMany({
      where: { createdById: userId },
      select: { id: true, corporateName: true, deletedAt: true },
    }),
    prisma.checklist.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        versions: {
          select: {
            id: true,
            status: true,
            versionNumber: true,
            _count: { select: { items: true } },
          },
        },
      },
    }),
    prisma.inspection.findMany({
      where: { userId },
      select: {
        id: true,
        companyId: true,
        checklistId: true,
        status: true,
        syncStatus: true,
        deletedAt: true,
        snapshot: {
          select: {
            id: true,
            sourceChecklistVersionId: true,
            title: true,
            items: { select: { id: true, description: true } },
          },
        },
        responses: {
          select: {
            id: true,
            status: true,
            observation: true,
            snapshotItemId: true,
            nonConformity: { select: { id: true, deletedAt: true } },
          },
        },
      },
    }),
  ]);
  const after = await otherRecords(prisma);
  const matched = cycles.flatMap((cycle) => {
    const company = companies.filter((row) => row.corporateName === cycle.empresa);
    const checklist = checklists.find((row) => row.id === cycle.checklistId);
    const inspection = inspections.find((row) => row.id === cycle.inspecaoId);
    const version = checklist?.versions[0];
    if (
      company.length !== 1 ||
      company[0].deletedAt ||
      !checklist ||
      checklist.deletedAt ||
      checklist.title !== cycle.checklist ||
      checklist.versions.length !== 1 ||
      version?.status !== "PUBLISHED" ||
      version.versionNumber !== 1 ||
      version._count.items !== 2 ||
      !inspection ||
      inspection.deletedAt ||
      inspection.companyId !== company[0].id ||
      inspection.checklistId !== checklist.id ||
      inspection.status !== "COMPLETED" ||
      inspection.syncStatus !== "SYNCED" ||
      !inspection.snapshot ||
      inspection.snapshot.sourceChecklistVersionId !== version.id ||
      inspection.snapshot.title !== cycle.checklist ||
      inspection.snapshot.items.length !== 2 ||
      inspection.responses.length !== 2
    )
      return [];
    const responses = cycle.itens.map((description) =>
      inspection.responses.find((row) =>
        inspection.snapshot?.items.some(
          (item) => item.id === row.snapshotItemId && item.description === description,
        ),
      ),
    );
    const [first, second] = responses;
    if (
      first?.status !== "COMPLIANT" ||
      first.observation !== null ||
      first.nonConformity ||
      second?.status !== (cycle.observacaoNC ? "NON_COMPLIANT" : "COMPLIANT") ||
      second.observation !== cycle.observacaoNC ||
      Boolean(second.nonConformity && !second.nonConformity.deletedAt) !==
        Boolean(cycle.observacaoNC)
    )
      return [];

    return [
      {
        ciclo: cycle.numero,
        empresaId: company[0].id,
        checklistId: checklist.id,
        versaoId: version.id,
        inspecaoId: inspection.id,
        snapshotId: inspection.snapshot.id,
        respostasIds: [first.id, second.id],
        naoConformidadeId: second.nonConformity?.id ?? null,
      },
    ];
  });

  return {
    outrosRegistrosAntes: before,
    outrosRegistrosDepois: after,
    quantidades: {
      empresas: companies.length,
      checklists: checklists.length,
      versoesPublicadas: checklists
        .flatMap(({ versions }) => versions)
        .filter(({ status }) => status === "PUBLISHED").length,
      inspecoes: inspections.length,
      snapshots: inspections.filter(({ snapshot }) => snapshot).length,
      respostas: inspections.reduce((count, row) => count + row.responses.length, 0),
      naoConformidadesAtivas: inspections
        .flatMap(({ responses }) => responses)
        .filter(({ nonConformity }) => nonConformity && !nonConformity.deletedAt).length,
    },
    vinculosValidados: matched,
  };
}

async function run() {
  await save();
  const metadata = JSON.parse(process.env.SW_VOLUME_VERIFIED_DEPLOYMENT ?? "null") as object | null;
  const dbUrl = URL.parse(process.env.SW_VOLUME_DATABASE_URL ?? "");
  const pooledHost = database.endpoint.replace(".", "-pooler.");
  if (
    !metadata ||
    !("id" in metadata) ||
    !("commit" in metadata) ||
    !("origin" in metadata) ||
    !("projectId" in metadata) ||
    metadata.id !== deployment.id ||
    metadata.commit !== deployment.commit ||
    metadata.origin !== origin ||
    metadata.projectId !== deployment.projectId ||
    !dbUrl ||
    !["postgresql:", "postgres:"].includes(dbUrl.protocol) ||
    ![database.endpoint, pooledHost].includes(dbUrl.hostname) ||
    dbUrl.pathname !== "/" + database.name ||
    !dbUrl.username ||
    !dbUrl.password ||
    process.env.SW_VOLUME_CONFIRMATION !== "dedicated-synthetic-environment" ||
    !git("ls-files", "--", script) ||
    git("diff", "HEAD", "--", script)
  )
    throw new Error("Confirme o deploy, o banco dedicado e o commit do roteiro.");

  preflight = "banco_dedicado";
  process.env.DATABASE_URL = dbUrl.toString();
  const { prisma } = await import("../../src/server/prisma/client");
  try {
    const [timingUser, unexpectedUser, before] = await Promise.all([
      prisma.user.count({ where: { email: timingRunEmail, deletedAt: null } }),
      prisma.user.count({
        where: {
          NOT: {
            AND: [
              { email: { endsWith: "@example.test" } },
              {
                OR: [
                  { email: { startsWith: "sw-timing-" } },
                  { email: { startsWith: "sw-volume-" } },
                ],
              },
            ],
          },
        },
      }),
      otherRecords(prisma),
    ]);
    if (timingUser !== 1 || unexpectedUser) throw new Error("Identidade do banco não confirmada.");

    preflight = "navegador_e_conta_sintetica";
    const browser = await chromium.launch();
    browserVersion = browser.version();
    try {
      const context = await browser.newContext({ baseURL: origin });
      const page = await context.newPage();
      await registerAndSignIn(page);
      const user = await prisma.user.findUnique({
        where: { email: account },
        select: { id: true },
      });
      if (!user) throw new Error("Conta criada na interface ausente no Neon dedicado.");
      const storageState = await context.storageState({ indexedDB: false });
      preflight = "validado";
      await save();
      console.log(`Execução ${runId} validada. Resultados em ${output}`);

      for (const cycle of cycles) {
        const companyReady = await step(cycle, "empresa", () => createCompany(page, cycle));
        const checklistReady = await step(cycle, "checklist", () => createChecklist(page, cycle));
        if (!companyReady || !checklistReady) continue;
        const inspectionReady = await step(cycle, "inspecaoCriada", () =>
          createInspection(page, cycle),
        );
        if (!inspectionReady) continue;

        await step(cycle, "respostasEConclusao", () => finishInspection(page, cycle));
        const fresh = await browser.newContext({ baseURL: origin, storageState });
        try {
          const freshPage = await fresh.newPage();
          await step(cycle, "persistencia", () => verifyPersistence(freshPage, cycle));
          const reportReady = await step(cycle, "relatorio", () => verifyReport(freshPage, cycle));
          if (reportReady && cycle.observacaoNC) {
            await step(cycle, "naoConformidade", () => verifyNc(freshPage, cycle));
          }
        } finally {
          await fresh.close();
        }
        console.log(`Ciclo ${cycle.numero}/30: ${isComplete(cycle) ? "aprovado" : "incompleto"}.`);
      }

      audit = await verifyDatabase(prisma, user.id, before);
      await stepInventory(page);
    } finally {
      await browser.close();
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function stepInventory(page: Page) {
  try {
    reportInventory = await verifyReportInventory(page);
  } catch {
    reportInventory = [];
    console.log("O seletor de relatórios não pôde ser conferido.");
  }
}

try {
  await run();
  status = "finalizado";
} catch (error) {
  status = "interrompido";
  console.error(
    `Ensaio interrompido na etapa ${preflight} (${error instanceof Error ? error.name : "Erro"}).`,
  );
} finally {
  await save();
}

if (
  status !== "finalizado" ||
  cycles.some((cycle) => !isComplete(cycle)) ||
  reportInventory?.length !== 30 ||
  audit?.vinculosValidados.length !== 30 ||
  audit.quantidades.empresas !== 30 ||
  audit.quantidades.checklists !== 30 ||
  audit.quantidades.versoesPublicadas !== 30 ||
  audit.quantidades.inspecoes !== 30 ||
  JSON.stringify(audit.outrosRegistrosAntes) !== JSON.stringify(audit.outrosRegistrosDepois)
)
  process.exitCode = 1;
