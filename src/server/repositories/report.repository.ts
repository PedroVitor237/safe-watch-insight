import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

const evidenceSelect = {
  id: true,
  storageUrl: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  width: true,
  height: true,
  caption: true,
  createdAt: true,
} satisfies Prisma.EvidenceSelect;

const inspectionReportSelect = {
  id: true,
  inspectionDate: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      corporateName: true,
      tradeName: true,
      cnpj: true,
      cnae: true,
      riskLevel: true,
      employeeCount: true,
      address: true,
    },
  },
  user: {
    select: {
      name: true,
      email: true,
      role: true,
    },
  },
  snapshot: {
    select: {
      id: true,
      sourceVersionNumber: true,
      title: true,
      description: true,
      snapshotSchemaVersion: true,
      origin: true,
      integrityStatus: true,
      capturedAt: true,
      items: {
        orderBy: [{ orderIndex: "asc" }, { id: "asc" }],
        select: {
          id: true,
          description: true,
          orderIndex: true,
          isRequired: true,
          standards: {
            orderBy: [{ type: "asc" }, { code: "asc" }],
            select: {
              standardId: true,
              type: true,
              code: true,
              title: true,
              summary: true,
              officialUrl: true,
            },
          },
        },
      },
    },
  },
  responses: {
    select: {
      id: true,
      snapshotItemId: true,
      status: true,
      observation: true,
      updatedAt: true,
      nonConformity: {
        select: {
          id: true,
          description: true,
          severity: true,
          dueDate: true,
          status: true,
          deletedAt: true,
          correctiveActions: {
            where: { deletedAt: null },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            select: {
              id: true,
              description: true,
              why: true,
              location: true,
              responsible: true,
              dueDate: true,
              method: true,
              estimatedCost: true,
              status: true,
              completedAt: true,
            },
          },
          evidence: {
            where: { deletedAt: null },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            select: evidenceSelect,
          },
        },
      },
    },
  },
  evidence: {
    where: { deletedAt: null },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: evidenceSelect,
  },
} satisfies Prisma.InspectionSelect;

const availableReportSelect = {
  id: true,
  inspectionDate: true,
  status: true,
  company: {
    select: {
      corporateName: true,
      tradeName: true,
    },
  },
  snapshot: {
    select: {
      title: true,
      sourceVersionNumber: true,
    },
  },
} satisfies Prisma.InspectionSelect;

export type InspectionReportSource = Prisma.InspectionGetPayload<{
  select: typeof inspectionReportSelect;
}>;

export type AvailableInspectionReportSource = Prisma.InspectionGetPayload<{
  select: typeof availableReportSelect;
}>;

export class ReportRepository {
  findOwnedInspectionReport(
    inspectionId: string,
    userId: string,
  ): Promise<InspectionReportSource | null> {
    return prisma.inspection.findFirst({
      where: {
        id: inspectionId,
        userId,
        deletedAt: null,
      },
      select: inspectionReportSelect,
    });
  }

  listAvailableInspectionReports(userId: string): Promise<AvailableInspectionReportSource[]> {
    return prisma.inspection.findMany({
      where: {
        userId,
        status: "COMPLETED",
        deletedAt: null,
        snapshot: { isNot: null },
      },
      orderBy: [{ inspectionDate: "desc" }, { id: "desc" }],
      select: availableReportSelect,
    });
  }
}

export const reportRepository = new ReportRepository();
