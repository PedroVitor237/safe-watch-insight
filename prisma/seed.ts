import "dotenv/config";

import bcrypt from "bcrypt";
import process from "node:process";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  InspectionStatus,
  PrismaClient,
  StandardType,
  SyncStatus,
  UserRole,
} from "../src/generated/prisma/client";

const DEMO_ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const DEMO_COMPANY_ID = "22222222-2222-4222-8222-222222222222";
const DEMO_CHECKLIST_ID = "33333333-3333-4333-8333-333333333333";
const DEMO_INSPECTION_ID = "44444444-4444-4444-8444-444444444444";
const OFFICIAL_STANDARDS_URL =
  "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs";

const REGULATORY_STANDARDS = [
  ["NR-1", "Disposições Gerais e Gerenciamento de Riscos Ocupacionais", true],
  ["NR-2", "Inspeção Prévia", false],
  ["NR-3", "Embargo e Interdição", true],
  ["NR-4", "Serviços Especializados em Segurança e em Medicina do Trabalho", true],
  ["NR-5", "Comissão Interna de Prevenção de Acidentes", true],
  ["NR-6", "Equipamento de Proteção Individual - EPI", true],
  ["NR-7", "Programa de Controle Médico de Saúde Ocupacional", true],
  ["NR-8", "Edificações", true],
  [
    "NR-9",
    "Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos",
    true,
  ],
  ["NR-10", "Segurança em Instalações e Serviços em Eletricidade", true],
  ["NR-11", "Transporte, Movimentação, Armazenagem e Manuseio de Materiais", true],
  ["NR-12", "Segurança no Trabalho em Máquinas e Equipamentos", true],
  [
    "NR-13",
    "Caldeiras, Vasos de Pressão e Tubulações e Tanques Metálicos de Armazenamento",
    true,
  ],
  ["NR-14", "Fornos", true],
  ["NR-15", "Atividades e Operações Insalubres", true],
  ["NR-16", "Atividades e Operações Perigosas", true],
  ["NR-17", "Ergonomia", true],
  ["NR-18", "Segurança e Saúde no Trabalho na Indústria da Construção", true],
  ["NR-19", "Explosivos", true],
  ["NR-20", "Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis", true],
  ["NR-21", "Trabalhos a Céu Aberto", true],
  ["NR-22", "Segurança e Saúde Ocupacional na Mineração", true],
  ["NR-23", "Proteção Contra Incêndios", true],
  ["NR-24", "Condições Sanitárias e de Conforto nos Locais de Trabalho", true],
  ["NR-25", "Resíduos Industriais", true],
  ["NR-26", "Sinalização de Segurança", true],
  ["NR-27", "Registro Profissional do Técnico de Segurança do Trabalho", false],
  ["NR-28", "Fiscalização e Penalidades", true],
  ["NR-29", "Norma Regulamentadora de Segurança e Saúde no Trabalho Portuário", true],
  ["NR-30", "Segurança e Saúde no Trabalho Aquaviário", true],
  [
    "NR-31",
    "Segurança e Saúde no Trabalho na Agricultura, Pecuária, Silvicultura, Exploração Florestal e Aquicultura",
    true,
  ],
  ["NR-32", "Segurança e Saúde no Trabalho em Serviços de Saúde", true],
  ["NR-33", "Segurança e Saúde nos Trabalhos em Espaços Confinados", true],
  [
    "NR-34",
    "Condições e Meio Ambiente de Trabalho na Indústria da Construção, Reparação e Desmonte Naval",
    true,
  ],
  ["NR-35", "Trabalho em Altura", true],
  [
    "NR-36",
    "Segurança e Saúde no Trabalho em Empresas de Abate e Processamento de Carnes e Derivados",
    true,
  ],
  ["NR-37", "Segurança e Saúde em Plataformas de Petróleo", true],
  [
    "NR-38",
    "Segurança e Saúde no Trabalho nas Atividades de Limpeza Urbana e Manejo de Resíduos Sólidos",
    true,
  ],
] as const;

const DEMO_CHECKLIST_ITEMS = [
  {
    id: "55555555-5555-4555-8555-555555555551",
    description: "Verificar uso adequado de EPIs pelos colaboradores.",
    orderIndex: 1,
    isRequired: true,
  },
  {
    id: "55555555-5555-4555-8555-555555555552",
    description: "Verificar sinalização de segurança nas áreas operacionais.",
    orderIndex: 2,
    isRequired: true,
  },
  {
    id: "55555555-5555-4555-8555-555555555553",
    description: "Verificar condições de extintores e rotas de fuga.",
    orderIndex: 3,
    isRequired: true,
  },
  {
    id: "55555555-5555-4555-8555-555555555554",
    description: "Registrar observações gerais sobre organização e limpeza.",
    orderIndex: 4,
    isRequired: false,
  },
] as const;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to run Prisma seed.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

const prisma = createPrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      name: "Administrador",
      password,
      role: UserRole.ADMIN,
      deletedAt: null,
    },
    create: {
      id: DEMO_ADMIN_ID,
      name: "Administrador",
      email: "admin@demo.com",
      password,
      role: UserRole.ADMIN,
    },
  });

  const company = await prisma.company.upsert({
    where: { cnpj: "12345678000190" },
    update: {
      corporateName: "Empresa Demonstração SST Ltda.",
      tradeName: "Demo SST",
      cnpj: "12345678000190",
      cnae: "4120-4/00",
      riskLevel: 3,
      employeeCount: 85,
      address: "Av. Segurança do Trabalho, 1000",
      notes: "Empresa criada pelo seed de demonstração.",
      createdBy: {
        connect: {
          id: admin.id,
        },
      },
      deletedAt: null,
    },
    create: {
      id: DEMO_COMPANY_ID,
      corporateName: "Empresa Demonstração SST Ltda.",
      tradeName: "Demo SST",
      cnpj: "12345678000190",
      cnae: "4120-4/00",
      riskLevel: 3,
      employeeCount: 85,
      address: "Av. Segurança do Trabalho, 1000",
      notes: "Empresa criada pelo seed de demonstração.",
      createdBy: {
        connect: {
          id: admin.id,
        },
      },
    },
  });

  const checklist = await prisma.checklist.upsert({
    where: { id: DEMO_CHECKLIST_ID },
    update: {
      title: "Checklist demonstrativo de inspeção SST",
      description: "Modelo básico para apresentação do fluxo de inspeção.",
      isTemplate: true,
      isActive: true,
      createdBy: {
        connect: {
          id: admin.id,
        },
      },
      deletedAt: null,
    },
    create: {
      id: DEMO_CHECKLIST_ID,
      title: "Checklist demonstrativo de inspeção SST",
      description: "Modelo básico para apresentação do fluxo de inspeção.",
      isTemplate: true,
      isActive: true,
      createdBy: {
        connect: {
          id: admin.id,
        },
      },
    },
  });

  const standardsByCode = new Map<string, string>();

  for (const [code, title, isActive] of REGULATORY_STANDARDS) {
    const standard = await prisma.standard.upsert({
      where: { code },
      update: {
        type: StandardType.NR,
        title,
        summary: `Norma Regulamentadora ${code.replace("NR-", "")} do Ministério do Trabalho e Emprego.`,
        officialUrl: OFFICIAL_STANDARDS_URL,
        isActive,
      },
      create: {
        type: StandardType.NR,
        code,
        title,
        summary: `Norma Regulamentadora ${code.replace("NR-", "")} do Ministério do Trabalho e Emprego.`,
        officialUrl: OFFICIAL_STANDARDS_URL,
        isActive,
      },
    });

    standardsByCode.set(code, standard.id);
  }

  const itemStandardCodes = ["NR-6", "NR-26", "NR-23", "NR-1"] as const;

  for (const item of DEMO_CHECKLIST_ITEMS) {
    const checklistItem = await prisma.checklistItem.upsert({
      where: {
        checklistId_orderIndex: {
          checklistId: checklist.id,
          orderIndex: item.orderIndex,
        },
      },
      update: {
        checklist: {
          connect: {
            id: checklist.id,
          },
        },
        description: item.description,
        orderIndex: item.orderIndex,
        isRequired: item.isRequired,
      },
      create: {
        id: item.id,
        checklist: {
          connect: {
            id: checklist.id,
          },
        },
        description: item.description,
        orderIndex: item.orderIndex,
        isRequired: item.isRequired,
      },
    });

    const standardCode = itemStandardCodes[item.orderIndex - 1];
    const standardId = standardCode ? standardsByCode.get(standardCode) : undefined;

    if (standardId) {
      await prisma.checklistItemStandard.upsert({
        where: {
          checklistItemId_standardId: {
            checklistItemId: checklistItem.id,
            standardId,
          },
        },
        update: {},
        create: {
          checklistItemId: checklistItem.id,
          standardId,
        },
      });
    }
  }

  await prisma.inspection.upsert({
    where: { id: DEMO_INSPECTION_ID },
    update: {
      inspectionDate: new Date(),
      status: InspectionStatus.PLANNED,
      syncStatus: SyncStatus.SYNCED,
      notes: "Inspeção demonstrativa criada pelo seed.",
      user: {
        connect: {
          id: admin.id,
        },
      },
      company: {
        connect: {
          id: company.id,
        },
      },
      checklist: {
        connect: {
          id: checklist.id,
        },
      },
      deletedAt: null,
    },
    create: {
      id: DEMO_INSPECTION_ID,
      inspectionDate: new Date(),
      status: InspectionStatus.PLANNED,
      syncStatus: SyncStatus.SYNCED,
      notes: "Inspeção demonstrativa criada pelo seed.",
      user: {
        connect: {
          id: admin.id,
        },
      },
      company: {
        connect: {
          id: company.id,
        },
      },
      checklist: {
        connect: {
          id: checklist.id,
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
