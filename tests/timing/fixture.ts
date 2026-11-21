import { randomUUID } from "node:crypto";

import type { Result } from "../../src/server/responses";

export const checklistTitle = "Inspeção de circulação e sinalização";
export const items = [
  { description: "Rotas de circulação desobstruídas", status: "COMPLIANT", button: "Conforme" },
  {
    description: "Sinalização de saída visível",
    status: "NON_COMPLIANT",
    button: "NC",
    observation: "Placa parcialmente coberta por material.",
  },
  { description: "Acesso à área de carga", status: "NOT_APPLICABLE", button: "N/A" },
  { description: "Piso em condições de circulação", status: "COMPLIANT", button: "Conforme" },
  {
    description: "Iluminação dos corredores",
    status: "COMPLIANT",
    button: "Conforme",
    observation: "Iluminação suficiente no corredor principal.",
  },
  { description: "Extintor com acesso livre", status: "COMPLIANT", button: "Conforme" },
] as const;

export function readEnvironment() {
  const mode = process.env.SW_TIMING_MODE ?? "study";
  if (mode !== "study" && mode !== "pilot") {
    throw new Error("SW_TIMING_MODE deve ser study ou pilot.");
  }

  const target = URL.parse(process.env.SW_TIMING_BASE_URL ?? "");
  const database = URL.parse(process.env.SW_TIMING_DATABASE_URL ?? "");
  const localTarget = mode === "pilot" && target?.hostname === "127.0.0.1";
  if (
    !target ||
    !(target.protocol === "https:" || (localTarget && target.protocol === "http:")) ||
    target.username ||
    target.password ||
    target.pathname !== "/" ||
    target.search ||
    target.hash
  ) {
    throw new Error("SW_TIMING_BASE_URL deve apontar para a origem do deploy dedicado de testes.");
  }
  if (
    !database ||
    !["postgresql:", "postgres:"].includes(database.protocol) ||
    database.pathname !== "/safe_watch_timing" ||
    process.env.SW_TIMING_CONFIRMATION !== "dedicated-synthetic-environment"
  ) {
    throw new Error(
      "Configure SW_TIMING_DATABASE_URL para o banco dedicado safe_watch_timing e confirme o ambiente.",
    );
  }
  return { mode, target, database };
}

export async function prepareFixture(database: URL, runId: string, inspectionCount: number) {
  // Import the singleton only after selecting the explicitly dedicated database.
  process.env.DATABASE_URL = database.toString();
  const { prisma } = await import("../../src/server/prisma/client");
  try {
    const unexpectedUser = await prisma.user.findFirst({
      where: {
        NOT: {
          AND: [{ email: { startsWith: "sw-timing-" } }, { email: { endsWith: "@example.test" } }],
        },
      },
      select: { id: true },
    });
    if (unexpectedUser) {
      throw new Error("O banco contém contas alheias ao ensaio. Use um banco dedicado e sem seed.");
    }

    const { userService } = await import("../../src/server/services/user.service");
    const { companyService } = await import("../../src/server/services/company.service");
    const { checklistService } = await import("../../src/server/services/checklist.service");
    const { checklistItemService } =
      await import("../../src/server/services/checklist-item.service");
    const { checklistVersionService } =
      await import("../../src/server/services/checklist-version.service");
    const { inspectionService } = await import("../../src/server/services/inspection.service");
    const { inspectionResponseService } =
      await import("../../src/server/services/inspection-response.service");

    const email = `sw-timing-${runId}@example.test`;
    const password = `Timing!${randomUUID()}`;
    const { id: userId } = unwrap(
      await userService.register({ name: "Inspetora de teste", email, password }),
    );
    const company = unwrap(
      await companyService.createCompany({
        corporateName: "Empresa fictícia do ensaio",
        riskLevel: 1,
        cnae: "0000000",
        employeeCount: 10,
        createdById: userId,
      }),
    );
    const checklist = unwrap(
      await checklistService.createChecklist({ title: checklistTitle, createdById: userId }),
    );
    for (const item of items) {
      unwrap(
        await checklistItemService.createChecklistItem({
          checklistId: checklist.id,
          description: item.description,
          isRequired: true,
          updatedById: userId,
        }),
      );
    }
    unwrap(await checklistVersionService.publishDraft(checklist.id, userId));

    const inspectionDate = new Date();
    async function createInspection() {
      return unwrap(
        await inspectionService.createInspection({
          userId,
          companyId: company.id,
          checklistId: checklist.id,
          inspectionDate,
          notes: `Ensaio mobile ${runId}`,
        }),
      );
    }

    const reportInspection = await createInspection();
    for (const item of items) {
      const snapshotItem = reportInspection.snapshot?.items.find(
        (entry) => entry.description === item.description,
      );
      if (!snapshotItem) throw new Error("Item ausente no snapshot do relatório.");
      unwrap(
        await inspectionResponseService.saveInspectionResponse({
          userId,
          inspectionId: reportInspection.id,
          snapshotItemId: snapshotItem.id,
          status: item.status,
          observation: "observation" in item ? item.observation : null,
        }),
      );
    }
    unwrap(await inspectionResponseService.finishInspection(reportInspection.id, userId));

    const inspectionIds: string[] = [];
    for (let index = 0; index < inspectionCount; index += 1) {
      inspectionIds.push((await createInspection()).id);
    }

    return {
      email,
      password,
      inspectionIds,
      reportId: reportInspection.id,
      async isPersisted(inspectionId: string) {
        const result = unwrap(await inspectionService.getInspectionById(inspectionId, userId));
        return (
          result.status === "COMPLETED" &&
          result.syncStatus === "SYNCED" &&
          result.responses.length === items.length &&
          items.every((item) =>
            result.responses.some((response) => {
              const snapshotItem = result.snapshot?.items.find(
                (entry) => entry.id === response.snapshotItemId,
              );
              return (
                snapshotItem?.description === item.description &&
                response.status === item.status &&
                response.observation === ("observation" in item ? item.observation : null)
              );
            }),
          )
        );
      },
      disconnect: () => prisma.$disconnect(),
    };
  } catch (error) {
    await prisma.$disconnect();
    throw error;
  }
}

function unwrap<T>(result: Result<T>): T {
  if (!result.success)
    throw new Error(`Falha ao consultar ou preparar dados do ensaio (${result.code}).`);
  return result.data;
}
