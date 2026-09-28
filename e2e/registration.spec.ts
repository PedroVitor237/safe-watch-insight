import "dotenv/config";

import { randomUUID } from "node:crypto";
import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";

import { prisma } from "../src/server/prisma/client";
import { companyService } from "../src/server/services/company.service";

const password = "Registration123!";
let temporaryEmails: string[] = [];
let temporaryContexts: BrowserContext[] = [];

async function waitForFormHydration(page: Page) {
  await page.waitForFunction(
    () => {
      const form = document.querySelector("form");
      return form !== null && Object.keys(form).some((key) => key.startsWith("__reactProps$"));
    },
    undefined,
    { timeout: 15_000 },
  );
}

async function waitForCompanyButtonHydration(page: Page) {
  await page.waitForFunction(
    () => {
      const button = [...document.querySelectorAll("button")].find((item) =>
        item.textContent?.includes("Nova empresa"),
      );
      return (
        button !== undefined && Object.keys(button).some((key) => key.startsWith("__reactProps$"))
      );
    },
    undefined,
    { timeout: 15_000 },
  );
}

async function registerAndLogin(page: Page, name: string, email: string) {
  await page.goto("/login");
  await page.getByRole("link", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await waitForFormHydration(page);
  await page.getByLabel("Nome", { exact: true }).fill(name);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByLabel("Confirmar senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await waitForFormHydration(page);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function checkSeededLogin(browser: Browser) {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto("/login");
    await waitForFormHydration(page);
    await page.getByLabel("E-mail").fill("admin@demo.com");
    await page.getByLabel("Senha").fill("Admin@123");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  } finally {
    await context.close();
  }
}

test.afterEach(async () => {
  const cleanupErrors: unknown[] = [];

  if (temporaryEmails.length > 0) {
    try {
      await prisma.company.deleteMany({
        where: { createdBy: { email: { in: temporaryEmails } } },
      });
    } catch (error) {
      cleanupErrors.push(error);
    }

    try {
      await prisma.user.deleteMany({ where: { email: { in: temporaryEmails } } });
    } catch (error) {
      cleanupErrors.push(error);
    }
  }

  const contextResults = await Promise.allSettled(
    temporaryContexts.map(async (context) => await context.close()),
  );
  for (const result of contextResults) {
    if (result.status === "rejected") {
      cleanupErrors.push(result.reason);
    }
  }

  try {
    await prisma.$disconnect();
  } catch (error) {
    cleanupErrors.push(error);
  }

  temporaryEmails = [];
  temporaryContexts = [];

  if (cleanupErrors.length > 0) {
    throw new AggregateError(cleanupErrors, "Registration E2E cleanup failed.");
  }
});

test("two public registrations log in and retain private company ownership", async ({
  browser,
}) => {
  const suffix = randomUUID();
  const emails = [`registration-a-${suffix}@example.com`, `registration-b-${suffix}@example.com`];
  temporaryEmails = emails;
  temporaryContexts.push(await browser.newContext());
  temporaryContexts.push(await browser.newContext());
  const contexts = temporaryContexts;

  const firstPage = await contexts[0].newPage();
  await registerAndLogin(firstPage, "Registro Ana", emails[0]);
  const firstUser = await prisma.user.findUniqueOrThrow({ where: { email: emails[0] } });
  expect(firstUser.password).not.toBe(password);
  expect(firstUser.role).toBe("TECHNICIAN");

  await firstPage.goto("/empresas");
  await waitForCompanyButtonHydration(firstPage);
  await firstPage.getByRole("button", { name: "Nova empresa" }).click();
  const dialog = firstPage.getByRole("dialog", { name: "Nova empresa" });
  const companyName = `Empresa Registro ${suffix}`;
  await dialog.getByLabel("Razão social").fill(companyName);
  await dialog.getByLabel("CNAE").fill("4120-4/00");
  await dialog.getByLabel("Grau de risco").fill("2");
  await dialog.getByLabel("Funcionários").fill("5");
  await dialog.getByRole("button", { name: "Cadastrar empresa" }).click();
  await expect(firstPage.getByText(companyName).first()).toBeVisible();
  const company = await prisma.company.findFirstOrThrow({
    where: { corporateName: companyName },
  });
  expect(company.createdById).toBe(firstUser.id);

  const secondPage = await contexts[1].newPage();
  await registerAndLogin(secondPage, "Registro Bruno", emails[1]);
  const secondUser = await prisma.user.findUniqueOrThrow({ where: { email: emails[1] } });
  expect(secondUser.id).not.toBe(firstUser.id);
  await secondPage.goto("/empresas");
  await expect(secondPage.getByText("Nenhuma empresa cadastrada.")).toBeVisible();
  await expect(secondPage.getByText(companyName)).toHaveCount(0);
  const foreignDetail = await companyService.getCompanyById(company.id, secondUser.id);
  expect(foreignDetail.success).toBe(false);
  const foreignMutation = await companyService.updateCompany(
    company.id,
    { corporateName: "Alterada" },
    secondUser.id,
  );
  expect(foreignMutation.success).toBe(false);
  await checkSeededLogin(browser);
});
