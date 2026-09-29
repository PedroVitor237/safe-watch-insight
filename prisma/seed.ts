import "dotenv/config";

import { createHash } from "node:crypto";
import process from "node:process";

import {
  ChecklistVersionStatus,
  CorrectiveActionStatus,
  InspectionStatus,
  NonConformityStatus,
  ResponseStatus,
  Severity,
  StandardType,
  UserRole,
} from "../src/generated/prisma/client";
import { comparePassword, hashPassword } from "../src/server/auth/password";
import { prisma } from "../src/server/prisma/client";
import type { Result } from "../src/server/responses";
import { checklistItemService } from "../src/server/services/checklist-item.service";
import { checklistVersionService } from "../src/server/services/checklist-version.service";
import { correctiveActionService } from "../src/server/services/corrective-action.service";
import { dashboardService } from "../src/server/services/dashboard.service";
import { inspectionResponseService } from "../src/server/services/inspection-response.service";
import { inspectionService } from "../src/server/services/inspection.service";
import { nonConformityService } from "../src/server/services/non-conformity.service";
import { reportService } from "../src/server/services/report.service";
import { userService } from "../src/server/services/user.service";

// All identities and business records below are synthetic TCC demonstration data.
const DEMO = {
  id: "f5b24d96-7d25-4c93-917c-1bb4fd019001",
  name: "Usuário Demonstração",
  email: "demo.user@example.test",
  password: "Demo@12345",
} as const;
const MARKER = "Dados sintéticos do TCC — Demo Seed";
const NR_URL =
  "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs";

interface DemoItem {
  description: string;
  standard: string;
  required?: boolean;
}

interface DemoChecklist {
  key: string;
  title: string;
  items: readonly DemoItem[];
}

const COMPANIES = [
  {
    key: "oficina",
    name: "Empresa Fictícia Oficina Aurora Ltda.",
    cnae: "4520-0/01",
    risk: 3,
    employees: 48,
  },
  {
    key: "armazem",
    name: "Empresa Fictícia Armazém Horizonte Ltda.",
    cnae: "5211-7/01",
    risk: 3,
    employees: 92,
  },
  {
    key: "escritorio",
    name: "Empresa Fictícia Escritório Prisma Ltda.",
    cnae: "8211-3/00",
    risk: 1,
    employees: 27,
  },
  {
    key: "construcao",
    name: "Empresa Fictícia Obras do Vale Ltda.",
    cnae: "4120-4/00",
    risk: 3,
    employees: 135,
  },
] as const;

const STANDARDS = [
  ["NR-1", "Disposições Gerais e Gerenciamento de Riscos Ocupacionais"],
  ["NR-6", "Equipamento de Proteção Individual - EPI"],
  ["NR-10", "Segurança em Instalações e Serviços em Eletricidade"],
  ["NR-12", "Segurança no Trabalho em Máquinas e Equipamentos"],
  ["NR-17", "Ergonomia"],
  ["NR-23", "Proteção Contra Incêndios"],
  ["NR-26", "Sinalização de Segurança"],
  ["NR-35", "Trabalho em Altura"],
] as const;

const CHECKLISTS: readonly DemoChecklist[] = [
  {
    key: "epi",
    title: "Demo TCC — Equipamentos de proteção e sinalização",
    items: [
      { description: "EPIs adequados estão disponíveis no posto de trabalho?", standard: "NR-6" },
      { description: "Os EPIs são utilizados e conservados corretamente?", standard: "NR-6" },
      { description: "As áreas de risco têm sinalização visível?", standard: "NR-26" },
      { description: "As orientações de segurança estão acessíveis à equipe?", standard: "NR-1" },
    ],
  },
  {
    key: "incendio",
    title: "Demo TCC — Preparação para emergências",
    items: [
      { description: "As rotas de fuga estão livres e sinalizadas?", standard: "NR-23" },
      { description: "Os extintores estão acessíveis e dentro da validade?", standard: "NR-23" },
      { description: "A equipe conhece o procedimento de evacuação?", standard: "NR-1" },
      { description: "A sinalização de emergência é legível?", standard: "NR-26" },
      { description: "O ponto de encontro está identificado?", standard: "NR-23", required: false },
    ],
  },
  {
    key: "maquinas",
    title: "Demo TCC — Máquinas e instalações elétricas",
    items: [
      { description: "As partes móveis das máquinas têm proteção?", standard: "NR-12" },
      { description: "Os comandos de parada de emergência estão operacionais?", standard: "NR-12" },
      { description: "Os cabos e painéis elétricos estão protegidos?", standard: "NR-10" },
      { description: "Há bloqueio e identificação durante manutenção?", standard: "NR-12" },
      { description: "As intervenções elétricas seguem procedimento seguro?", standard: "NR-10" },
      {
        description: "Os trabalhadores receberam orientação para o equipamento?",
        standard: "NR-1",
      },
    ],
  },
  {
    key: "altura",
    title: "Demo TCC — Trabalho em altura e ergonomia",
    items: [
      { description: "O planejamento do trabalho em altura está disponível?", standard: "NR-35" },
      {
        description: "Os sistemas de proteção contra quedas foram inspecionados?",
        standard: "NR-35",
      },
      { description: "As posturas e alcances de trabalho foram avaliados?", standard: "NR-17" },
      { description: "Há pausas e organização adequada do posto?", standard: "NR-17" },
    ],
  },
];

interface DemoAnswer {
  item: number;
  status: ResponseStatus;
  observation?: string;
  severity?: Severity;
  ncStatus?: NonConformityStatus;
  action?: {
    description: string;
    status: CorrectiveActionStatus;
  };
}

interface DemoInspection {
  key: string;
  company: string;
  checklist: string;
  date: string;
  state: InspectionStatus;
  answers: readonly DemoAnswer[];
}

const INSPECTIONS: readonly DemoInspection[] = [
  {
    key: "oficina-epi",
    company: "oficina",
    checklist: "epi",
    date: "2026-06-12",
    state: InspectionStatus.COMPLETED,
    answers: [
      {
        item: 1,
        status: ResponseStatus.NON_COMPLIANT,
        observation: "Luvas de proteção indisponíveis no posto de corte.",
        severity: Severity.HIGH,
        action: {
          description: "Disponibilizar luvas adequadas e registrar a entrega.",
          status: CorrectiveActionStatus.COMPLETED,
        },
        ncStatus: NonConformityStatus.RESOLVED,
      },
      { item: 2, status: ResponseStatus.COMPLIANT },
      {
        item: 3,
        status: ResponseStatus.NON_COMPLIANT,
        observation: "Placa de risco ausente na área de solda.",
        severity: Severity.MEDIUM,
        action: {
          description: "Instalar placa de advertência na área de solda.",
          status: CorrectiveActionStatus.IN_PROGRESS,
        },
      },
      { item: 4, status: ResponseStatus.COMPLIANT },
    ],
  },
  {
    key: "armazem-incendio",
    company: "armazem",
    checklist: "incendio",
    date: "2026-07-08",
    state: InspectionStatus.COMPLETED,
    answers: [
      { item: 1, status: ResponseStatus.COMPLIANT },
      {
        item: 2,
        status: ResponseStatus.NON_COMPLIANT,
        observation: "Extintor do corredor bloqueado por materiais.",
        severity: Severity.CRITICAL,
        action: {
          description: "Desobstruir o extintor e demarcar sua área de acesso.",
          status: CorrectiveActionStatus.PENDING,
        },
      },
      { item: 3, status: ResponseStatus.COMPLIANT },
      { item: 4, status: ResponseStatus.COMPLIANT },
      {
        item: 5,
        status: ResponseStatus.NOT_APPLICABLE,
        observation: "Ponto de encontro externo será avaliado em outro ciclo.",
      },
    ],
  },
  {
    key: "oficina-maquinas",
    company: "oficina",
    checklist: "maquinas",
    date: "2026-08-19",
    state: InspectionStatus.COMPLETED,
    answers: [
      {
        item: 1,
        status: ResponseStatus.NON_COMPLIANT,
        observation: "Proteção lateral de uma máquina está incompleta.",
        severity: Severity.HIGH,
        action: {
          description: "Completar a proteção lateral antes da próxima operação.",
          status: CorrectiveActionStatus.IN_PROGRESS,
        },
      },
      { item: 2, status: ResponseStatus.COMPLIANT },
      { item: 3, status: ResponseStatus.COMPLIANT },
      {
        item: 4,
        status: ResponseStatus.NON_COMPLIANT,
        observation: "Identificação de bloqueio não está fixada no painel.",
        severity: Severity.MEDIUM,
      },
      { item: 5, status: ResponseStatus.COMPLIANT },
      { item: 6, status: ResponseStatus.COMPLIANT },
    ],
  },
  {
    key: "escritorio-epi",
    company: "escritorio",
    checklist: "epi",
    date: "2026-09-04",
    state: InspectionStatus.COMPLETED,
    answers: [
      { item: 1, status: ResponseStatus.COMPLIANT },
      { item: 2, status: ResponseStatus.COMPLIANT },
      { item: 3, status: ResponseStatus.COMPLIANT },
      { item: 4, status: ResponseStatus.COMPLIANT },
    ],
  },
  {
    key: "construcao-altura",
    company: "construcao",
    checklist: "altura",
    date: "2026-09-18",
    state: InspectionStatus.IN_PROGRESS,
    answers: [
      { item: 1, status: ResponseStatus.COMPLIANT },
      {
        item: 2,
        status: ResponseStatus.NON_COMPLIANT,
        observation: "Inspeção dos talabartes ainda não foi registrada.",
        severity: Severity.HIGH,
        action: {
          description: "Inspecionar os talabartes e registrar a verificação.",
          status: CorrectiveActionStatus.PENDING,
        },
      },
    ],
  },
  {
    key: "armazem-maquinas",
    company: "armazem",
    checklist: "maquinas",
    date: "2026-09-21",
    state: InspectionStatus.IN_PROGRESS,
    answers: [
      { item: 1, status: ResponseStatus.COMPLIANT },
      {
        item: 2,
        status: ResponseStatus.NON_COMPLIANT,
        observation: "Botão de parada requer teste funcional.",
        severity: Severity.MEDIUM,
      },
    ],
  },
  {
    key: "construcao-incendio",
    company: "construcao",
    checklist: "incendio",
    date: "2026-10-02",
    state: InspectionStatus.PLANNED,
    answers: [],
  },
  {
    key: "escritorio-altura",
    company: "escritorio",
    checklist: "altura",
    date: "2026-10-09",
    state: InspectionStatus.PLANNED,
    answers: [],
  },
];

function demoId(kind: string, key: string): string {
  const hash = createHash("sha256").update(`safe-watch-tcc-demo:${kind}:${key}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function requireSuccess<T>(result: Result<T>, context: string): T {
  if (!result.success) throw new Error(`${context}: ${result.message}`);
  return result.data;
}

async function ensureUser(): Promise<string> {
  const [byId, byEmail] = await Promise.all([
    prisma.user.findUnique({ where: { id: DEMO.id } }),
    prisma.user.findUnique({ where: { email: DEMO.email } }),
  ]);
  if (byId || byEmail) {
    if (
      !byId ||
      !byEmail ||
      byId.id !== byEmail.id ||
      byId.name !== DEMO.name ||
      byId.role !== UserRole.TECHNICIAN ||
      byId.deletedAt
    ) {
      throw new Error("Demo user identity collides with an unrelated or inactive account.");
    }
    if (!(await comparePassword(DEMO.password, byId.password))) {
      throw new Error(
        "Demo account password differs from the documented credential; it was not reset.",
      );
    }
    return byId.id;
  }
  const user = await prisma.user.create({
    data: {
      id: DEMO.id,
      name: DEMO.name,
      email: DEMO.email,
      password: await hashPassword(DEMO.password),
      role: UserRole.TECHNICIAN,
    },
  });
  return user.id;
}

async function ensureStandards(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const [code, title] of STANDARDS) {
    const existing = await prisma.standard.findUnique({ where: { code } });
    if (existing && existing.type !== StandardType.NR) {
      throw new Error(`Standard code collision: ${code}`);
    }
    const standard =
      existing ??
      (await prisma.standard.create({
        data: {
          type: StandardType.NR,
          code,
          title,
          summary: `Norma Regulamentadora ${code.slice(3)}.`,
          officialUrl: NR_URL,
          isActive: true,
        },
      }));
    ids.set(code, standard.id);
  }
  return ids;
}

async function ensureCompanies(userId: string): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const company of COMPANIES) {
    const id = demoId("company", company.key);
    const [existing, sameName] = await Promise.all([
      prisma.company.findUnique({ where: { id } }),
      prisma.company.findFirst({ where: { corporateName: company.name } }),
    ]);
    if (sameName && sameName.id !== id) throw new Error(`Company name collision: ${company.name}`);
    if (existing && (existing.createdById !== userId || existing.notes !== MARKER)) {
      throw new Error(`Company identity collision: ${company.key}`);
    }
    if (!existing) {
      await prisma.company.create({
        data: {
          id,
          corporateName: company.name,
          tradeName: company.name,
          cnae: company.cnae,
          riskLevel: company.risk,
          employeeCount: company.employees,
          notes: MARKER,
          createdById: userId,
        },
      });
    }
    ids.set(company.key, id);
  }
  return ids;
}

async function ensureChecklists(
  userId: string,
  standards: Map<string, string>,
): Promise<Map<string, { checklistId: string; versionId: string }>> {
  const ids = new Map<string, { checklistId: string; versionId: string }>();
  for (const definition of CHECKLISTS) {
    const checklistId = demoId("checklist", definition.key);
    const [existing, sameTitle] = await Promise.all([
      prisma.checklist.findUnique({ where: { id: checklistId } }),
      prisma.checklist.findFirst({ where: { title: definition.title } }),
    ]);
    if (sameTitle && sameTitle.id !== checklistId) {
      throw new Error(`Checklist title collision: ${definition.title}`);
    }
    if (existing && (existing.createdById !== userId || existing.description !== MARKER)) {
      throw new Error(`Checklist identity collision: ${definition.key}`);
    }
    if (!existing) {
      await prisma.checklist.create({
        data: {
          id: checklistId,
          title: definition.title,
          description: MARKER,
          isTemplate: true,
          createdById: userId,
          versions: {
            create: {
              versionNumber: 1,
              status: ChecklistVersionStatus.DRAFT,
              title: definition.title,
              description: MARKER,
              createdById: userId,
            },
          },
        },
      });
    }
    const versions = await prisma.checklistVersion.findMany({
      where: { checklistId },
      include: { items: true },
      orderBy: { versionNumber: "asc" },
    });
    let first = versions.find((version) => version.versionNumber === 1);
    if (!first || first.createdById !== userId) {
      throw new Error(`Checklist version identity collision: ${definition.key}`);
    }
    if (first.status === ChecklistVersionStatus.DRAFT) {
      for (const [index, item] of definition.items.entries()) {
        const existingItem = first.items.find((entry) => entry.orderIndex === index + 1);
        if (existingItem) {
          if (existingItem.description !== item.description) {
            throw new Error(`Checklist draft item collision: ${definition.key}/${index + 1}`);
          }
          continue;
        }
        const standardId = standards.get(item.standard);
        if (!standardId) throw new Error(`Missing standard: ${item.standard}`);
        requireSuccess(
          await checklistItemService.createChecklistItem({
            checklistId,
            updatedById: userId,
            description: item.description,
            orderIndex: index + 1,
            isRequired: item.required ?? true,
            standardIds: [standardId],
          }),
          `Create checklist item ${definition.key}/${index + 1}`,
        );
      }
      first = requireSuccess(
        await checklistVersionService.publishDraft(checklistId, userId),
        `Publish checklist ${definition.key}`,
      );
    }
    if (
      first.status !== ChecklistVersionStatus.PUBLISHED &&
      first.status !== ChecklistVersionStatus.RETIRED
    ) {
      throw new Error(`Checklist version unavailable: ${definition.key}`);
    }
    if (first.items.length !== definition.items.length || !first.contentHash) {
      throw new Error(`Checklist version content collision: ${definition.key}`);
    }
    ids.set(definition.key, { checklistId, versionId: first.id });
  }
  return ids;
}

async function ensureInspections(
  userId: string,
  companies: Map<string, string>,
  checklists: Map<string, { checklistId: string; versionId: string }>,
): Promise<void> {
  for (const definition of INSPECTIONS) {
    const id = demoId("inspection", definition.key);
    const companyId = companies.get(definition.company);
    const checklist = checklists.get(definition.checklist);
    if (!companyId || !checklist) throw new Error(`Invalid inspection dataset: ${definition.key}`);
    const existing = await prisma.inspection.findUnique({
      where: { id },
      include: {
        snapshot: { include: { items: true } },
        responses: true,
        evidence: true,
      },
    });
    if (existing) {
      if (
        existing.userId !== userId ||
        existing.companyId !== companyId ||
        existing.checklistId !== checklist.checklistId ||
        existing.checklistVersionId !== checklist.versionId ||
        !existing.snapshot ||
        existing.notes !== `${MARKER}: ${definition.key}`
      ) {
        throw new Error(`Inspection identity collision: ${definition.key}`);
      }
      // Preserve evaluator activity. Resume only an exact, unfinished seed inspection.
      if (
        existing.deletedAt ||
        existing.status === InspectionStatus.COMPLETED ||
        definition.state !== InspectionStatus.COMPLETED
      )
        continue;
      const matchesSeedSoFar =
        existing.evidence.length === 0 &&
        existing.responses.every((response) => {
          const item = existing.snapshot?.items.find(
            (entry) => entry.id === response.snapshotItemId,
          );
          const expected = definition.answers.find((answer) => answer.item === item?.orderIndex);
          return (
            expected?.status === response.status &&
            (expected.observation ?? null) === response.observation
          );
        });
      if (
        !matchesSeedSoFar ||
        (existing.status !== InspectionStatus.PLANNED &&
          existing.status !== InspectionStatus.IN_PROGRESS)
      ) {
        throw new Error(`Incomplete demo inspection contains user activity: ${definition.key}`);
      }
    }
    const date = new Date(`${definition.date}T12:00:00.000Z`);
    const created =
      existing ??
      requireSuccess(
        await inspectionService.createInspection({
          id,
          userId,
          companyId,
          checklistId: checklist.checklistId,
          checklistVersionId: checklist.versionId,
          inspectionDate: date,
          notes: `${MARKER}: ${definition.key}`,
        }),
        `Create inspection ${definition.key}`,
      );
    if (!created.snapshot) throw new Error(`Missing inspection snapshot: ${definition.key}`);
    for (const answer of definition.answers) {
      const snapshotItem = created.snapshot.items.find((item) => item.orderIndex === answer.item);
      if (!snapshotItem) throw new Error(`Missing snapshot item ${definition.key}/${answer.item}`);
      if (existing?.responses.some((response) => response.snapshotItemId === snapshotItem.id)) {
        continue;
      }
      const response = requireSuccess(
        await inspectionResponseService.saveInspectionResponse({
          userId,
          inspectionId: id,
          snapshotItemId: snapshotItem.id,
          status: answer.status,
          observation: answer.observation,
        }),
        `Save response ${definition.key}/${answer.item}`,
      );
      if (answer.status !== ResponseStatus.NON_COMPLIANT) continue;
      const nc = response.nonConformity;
      if (!nc) throw new Error(`Missing nonconformity: ${definition.key}/${answer.item}`);
      requireSuccess(
        await nonConformityService.updateNonConformity(
          nc.id,
          {
            severity: answer.severity ?? Severity.MEDIUM,
            dueDate: new Date("2026-10-20T12:00:00.000Z"),
          },
          userId,
        ),
        `Configure nonconformity ${definition.key}/${answer.item}`,
      );
      if (answer.action) {
        requireSuccess(
          await correctiveActionService.createCorrectiveAction(
            {
              nonConformityId: nc.id,
              description: answer.action.description,
              responsible: "Equipe fictícia de SST",
              location: "Unidade demonstrativa",
              why: answer.observation ?? null,
              method: "Executar e registrar a correção.",
              dueDate: new Date("2026-10-25T12:00:00.000Z"),
              status: answer.action.status,
            },
            userId,
          ),
          `Create corrective action ${definition.key}/${answer.item}`,
        );
      }
      if (answer.ncStatus) {
        requireSuccess(
          await nonConformityService.updateNonConformity(
            nc.id,
            {
              status: answer.ncStatus,
            },
            userId,
          ),
          `Set nonconformity status ${definition.key}/${answer.item}`,
        );
      }
    }
    if (definition.state === InspectionStatus.COMPLETED) {
      requireSuccess(
        await inspectionResponseService.finishInspection(id, userId),
        `Finish inspection ${definition.key}`,
      );
    }
  }
}

async function verifyDataset(userId: string): Promise<void> {
  const ids = INSPECTIONS.map((inspection) => demoId("inspection", inspection.key));
  const inspections = await prisma.inspection.findMany({
    where: { id: { in: ids }, userId },
    include: {
      snapshot: { include: { items: true } },
      responses: {
        include: { nonConformity: { include: { correctiveActions: true } } },
      },
    },
  });
  if (
    inspections.length !== INSPECTIONS.length ||
    inspections.some((inspection) => !inspection.snapshot || inspection.snapshot.items.length === 0)
  ) {
    throw new Error("Demo inspection count or snapshot integrity check failed.");
  }
  const active = inspections.filter((inspection) => !inspection.deletedAt);
  const completed = active.filter((inspection) => inspection.status === InspectionStatus.COMPLETED);
  const reports = requireSuccess(
    await reportService.listAvailableInspectionReports(userId),
    "List demo reports",
  );
  const dashboard = requireSuccess(
    await dashboardService.getDashboard(userId),
    "Read demo dashboard",
  );
  const login = requireSuccess(
    await userService.authenticate(DEMO.email, DEMO.password),
    "Authenticate demo account",
  );
  const untouchedBaseline =
    active.length === INSPECTIONS.length &&
    INSPECTIONS.every(
      (definition) =>
        inspections.find((inspection) => inspection.id === demoId("inspection", definition.key))
          ?.status === definition.state,
    );
  const reportHasAction = untouchedBaseline
    ? requireSuccess(
        await reportService.getInspectionReport(demoId("inspection", "oficina-epi"), userId),
        "Read demo inspection report",
      ).items.some((item) => (item.nonConformity?.correctiveActions.length ?? 0) > 0)
    : false;
  if (
    login.id !== userId ||
    (untouchedBaseline &&
      (completed.length < 4 ||
        reports.length < 4 ||
        dashboard.summary.totalInspections < 8 ||
        dashboard.summary.totalNonConformities < 6 ||
        !reportHasAction))
  ) {
    throw new Error(
      `Demo verification failed: ${JSON.stringify({
        loginMatches: login.id === userId,
        completed: completed.length,
        reports: reports.length,
        dashboard: dashboard.summary,
      })}`,
    );
  }
  const identity = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        passwordHash: identity.password,
        records: inspections
          .sort((left, right) => left.id.localeCompare(right.id))
          .map((inspection) => ({
            id: inspection.id,
            owner: inspection.userId,
            status: inspection.status,
            date: inspection.inspectionDate,
            deletedAt: inspection.deletedAt,
            snapshot: inspection.snapshot,
            responses: inspection.responses.sort((left, right) => left.id.localeCompare(right.id)),
          })),
      }),
    )
    .digest("hex");
  console.info(
    JSON.stringify({
      demoUser: DEMO.email,
      companies: COMPANIES.length,
      checklists: CHECKLISTS.length,
      publishedVersions: CHECKLISTS.length,
      inspections: active.length,
      completed: completed.length,
      responses: inspections.reduce((sum, inspection) => sum + inspection.responses.length, 0),
      nonConformities: inspections.reduce(
        (sum, inspection) =>
          sum +
          inspection.responses.filter(
            (response) => response.nonConformity && !response.nonConformity.deletedAt,
          ).length,
        0,
      ),
      correctiveActions: inspections.reduce(
        (sum, inspection) =>
          sum +
          inspection.responses.reduce(
            (count, response) =>
              count +
              (response.nonConformity?.correctiveActions.filter((action) => !action.deletedAt)
                .length ?? 0),
            0,
          ),
        0,
      ),
      fingerprint,
    }),
  );
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for the TCC Demo Seed.");
  console.info("Safe Watch Insight — synthetic TCC Demo Seed");
  const userId = await ensureUser();
  const standards = await ensureStandards();
  const companies = await ensureCompanies(userId);
  const checklists = await ensureChecklists(userId, standards);
  await ensureInspections(userId, companies, checklists);
  await verifyDataset(userId);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
