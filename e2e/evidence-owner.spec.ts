import "dotenv/config";

import { expect, test, type Page } from "@playwright/test";

import { prisma } from "../src/server/prisma/client";
import type { Result } from "../src/server/responses";
import { inspectionService } from "../src/server/services/inspection.service";
import { userService } from "../src/server/services/user.service";
import { cloudinaryStorageService } from "../src/server/storage/cloudinary-storage.service.server";

const ADMIN_EMAIL = "admin@demo.com";
const ADMIN_PASSWORD = "Admin@123";
const TEMPORARY_NOTE_PREFIX = "E2E Evidence ownership temporário";
const FILE_NAME = "evidence-ownership-browser.png";
const FILE_CAPTION = "Validação de evidência do proprietário";
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

let inspectionId: string | null = null;

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  inspectionId = await createTemporaryInspection();
});

test.afterAll(async () => {
  try {
    if (inspectionId) {
      try {
        await removeTemporaryProviderFiles(inspectionId);
      } finally {
        await cleanupTemporaryInspection(inspectionId);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
});

test("owner uploads, lists and removes inspection evidence", async ({ page }) => {
  if (!inspectionId) {
    throw new Error("The temporary Evidence inspection was not created.");
  }

  await login(page);
  await page.goto(`/inspecoes/${inspectionId}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: "Evidências", exact: true }).click();

  await page.getByLabel("Imagens", { exact: true }).setInputFiles({
    name: FILE_NAME,
    mimeType: "image/png",
    buffer: PNG_BYTES,
  });
  await page.getByLabel("Legenda opcional", { exact: true }).fill(FILE_CAPTION);
  await page.getByRole("button", { name: "Enviar evidências", exact: true }).click();

  await expect(page.getByText("Evidência enviada com sucesso.", { exact: true })).toBeVisible();
  await expect(page.getByText(FILE_NAME, { exact: true })).toBeVisible();
  await expect(page.getByText(FILE_CAPTION, { exact: true })).toBeVisible();

  const activeEvidence = await prisma.evidence.findFirst({
    where: { inspectionId, fileName: FILE_NAME, deletedAt: null },
    select: { id: true },
  });
  expect(activeEvidence).not.toBeNull();
  if (!activeEvidence) {
    throw new Error("The uploaded Evidence metadata was not persisted.");
  }

  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: `Remover ${FILE_NAME}`, exact: true }).click();

  await expect(page.getByText("Evidência removida.", { exact: true })).toBeVisible();
  await expect(page.getByText(FILE_NAME, { exact: true })).not.toBeVisible();

  const archivedEvidence = await prisma.evidence.findUnique({
    where: { id: activeEvidence.id },
    select: { deletedAt: true },
  });
  expect(archivedEvidence?.deletedAt).not.toBeNull();
});

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.waitForFunction(() => {
    const form = document.querySelector("form");
    return form !== null && Object.keys(form).some((key) => key.startsWith("__reactProps$"));
  });
  await page.getByLabel("E-mail").fill(ADMIN_EMAIL);
  await page.getByLabel("Senha").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function createTemporaryInspection(): Promise<string> {
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

  if (!inspection.snapshot) {
    await cleanupTemporaryInspection(inspection.id);
    throw new Error("The temporary Evidence inspection did not receive a snapshot.");
  }

  return inspection.id;
}

async function removeTemporaryProviderFiles(targetInspectionId: string): Promise<void> {
  const evidence = await prisma.evidence.findMany({
    where: { inspectionId: targetInspectionId },
    select: { publicId: true },
  });

  for (const item of evidence) {
    await cloudinaryStorageService.remove(item.publicId);
  }
}

async function cleanupTemporaryInspection(targetInspectionId: string): Promise<void> {
  const snapshot = await prisma.inspectionChecklistSnapshot.findUnique({
    where: { inspectionId: targetInspectionId },
  });

  await prisma.$transaction(async (transaction) => {
    await transaction.evidence.deleteMany({ where: { inspectionId: targetInspectionId } });
    await transaction.inspectionResponse.deleteMany({
      where: { inspectionId: targetInspectionId },
    });

    if (snapshot) {
      await transaction.inspectionSnapshotItemStandard.deleteMany({
        where: { snapshotItem: { snapshotId: snapshot.id } },
      });
      await transaction.inspectionSnapshotItem.deleteMany({ where: { snapshotId: snapshot.id } });
      await transaction.inspectionChecklistSnapshot.delete({ where: { id: snapshot.id } });
    }

    await transaction.inspection.deleteMany({
      where: {
        id: targetInspectionId,
        notes: { startsWith: TEMPORARY_NOTE_PREFIX },
      },
    });
  });
}

function unwrap<TData>(result: Result<TData>): TData {
  if (!result.success) {
    throw new Error(`${result.code}: ${result.message}`);
  }

  return result.data;
}
