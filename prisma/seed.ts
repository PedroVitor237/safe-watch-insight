import "dotenv/config";

import bcrypt from "bcrypt";
import process from "node:process";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  InspectionStatus,
  PrismaClient,
  SyncStatus,
  UserRole,
} from "../src/generated/prisma/client";

const DEMO_ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const DEMO_COMPANY_ID = "22222222-2222-4222-8222-222222222222";
const DEMO_CHECKLIST_ID = "33333333-3333-4333-8333-333333333333";
const DEMO_INSPECTION_ID = "44444444-4444-4444-8444-444444444444";

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

  for (const item of DEMO_CHECKLIST_ITEMS) {
    await prisma.checklistItem.upsert({
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
