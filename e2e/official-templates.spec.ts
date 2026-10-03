import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { expect, test } from "@playwright/test";
import { prisma } from "../src/server/prisma/client";
import { officialChecklistService } from "../src/server/services/official-checklist.service";
import { OfficialChecklistRepository } from "../src/server/repositories/official-checklist.repository";

const email = `templates-e2e-${randomUUID()}@test.invalid`;
const password = "Templates-E2E-123!";
let userId: string | undefined;

test.afterAll(async () => {
  if (userId) {
    const whereVersion = { checklist: { createdById: userId } };
    await prisma.checklistVersionItemStandard.deleteMany({
      where: { checklistVersionItem: { checklistVersion: whereVersion } },
    });
    await prisma.checklistVersionItem.updateMany({
      where: { checklistVersion: whereVersion },
      data: { sourceVersionItemId: null },
    });
    await prisma.checklistVersionItem.deleteMany({ where: { checklistVersion: whereVersion } });
    await prisma.checklistVersion.deleteMany({ where: whereVersion });
    await prisma.checklist.deleteMany({ where: { createdById: userId } });
    await prisma.user.delete({ where: { id: userId } });
  }
  await prisma.$disconnect();
});

test("login → official catalogue → private editable copy preserves platform source", async ({
  page,
}) => {
  const [source] = await officialChecklistService.bootstrap();
  const original = structuredClone(source);
  userId = (
    await prisma.user.create({
      data: {
        name: "Templates E2E",
        email,
        role: "TECHNICIAN",
        password: await bcrypt.hash(password, 4),
      },
    })
  ).id;
  await page.goto("/login");
  await page.waitForFunction(() => {
    const input = document.querySelector('input[name="password"]');
    const form = input?.closest("form");
    return form && Object.keys(form).some((key) => key.startsWith("__reactProps$"));
  });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("link", { name: "Checklists", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Templates oficiais", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Oficial · Safe Watch Insight", { exact: true })).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Editar", exact: true })).toHaveCount(0);
  await page.locator(`a[href="/checklists/${source.id}"]`).click();
  await expect(page.getByRole("heading", { name: source.title, exact: true })).toBeVisible();
  await expect(page.getByText("Oficial · Safe Watch Insight", { exact: true })).toBeVisible();
  await expect(page.getByText("12 itens", { exact: true })).toBeVisible();
  await expect(page.getByText("Publicada v1", { exact: true })).toBeVisible();
  await expect(page.getByText(/MURBACH, Tiago/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Novo item", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Usar template", exact: true }).click();
  await expect(page.getByText("Rascunho v1", { exact: true })).toBeVisible();
  await expect(page.getByText("Personalizado", { exact: true })).toBeVisible();
  const copyId = new URL(page.url()).pathname.split("/").at(-1)!;
  expect(copyId).not.toBe(source.id);
  const copy = await prisma.checklist.findUniqueOrThrow({
    where: { id: copyId },
    include: { versions: { include: { items: true } } },
  });
  expect(copy.createdById).toBe(userId);
  expect(copy.isOfficial).toBe(false);
  expect(copy.versions[0].items).toHaveLength(12);
  await page.getByRole("button", { name: "Editar", exact: true }).first().click();
  await page
    .getByLabel("Descrição", { exact: true })
    .fill("Verificação ajustada pelo proprietário");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(
    page.getByText("Verificação ajustada pelo proprietário", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Voltar", exact: true }).click();
  await page.getByRole("button", { name: "Meus checklists", exact: true }).click();
  await expect(page.getByText(copy.title, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Templates oficiais", exact: true }).click();
  await expect(page.getByText("Oficial · Safe Watch Insight", { exact: true })).toHaveCount(2);
  expect(await new OfficialChecklistRepository().findById(source.id)).toEqual(original);
});
