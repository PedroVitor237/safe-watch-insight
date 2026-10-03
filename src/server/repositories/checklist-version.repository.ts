import { ChecklistVersionStatus, type Prisma, type StandardType } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";

export const checklistVersionItemRelations = {
  standards: {
    orderBy: [{ type: "asc" }, { code: "asc" }],
  },
} satisfies Prisma.ChecklistVersionItemInclude;

export const checklistVersionRelations = {
  items: {
    orderBy: [{ orderIndex: "asc" }, { id: "asc" }],
    include: checklistVersionItemRelations,
  },
} satisfies Prisma.ChecklistVersionInclude;

export type ChecklistVersionWithItems = Prisma.ChecklistVersionGetPayload<{
  include: typeof checklistVersionRelations;
}>;

export interface VersionStandardPersistenceInput {
  standardId: string;
  type: StandardType;
  code: string;
  title: string;
  summary: string | null;
  officialUrl: string | null;
}

export interface VersionItemPersistenceInput {
  sourceVersionItemId?: string | null;
  sourceChecklistItemId?: string | null;
  description: string;
  orderIndex: number;
  isRequired: boolean;
  standards: VersionStandardPersistenceInput[];
}

export interface CreateDraftPersistenceInput {
  checklistId: string;
  versionNumber: number;
  title: string;
  description: string | null;
  createdById: string;
  items: VersionItemPersistenceInput[];
}

export interface PublishVersionPersistenceInput {
  publishedById: string | null;
  publishedAt: Date;
  contentHash: string;
  contentSchemaVersion: number;
  expectedUpdatedAt: Date;
}

export class ChecklistVersionPersistenceConflictError extends Error {
  constructor(message = "Checklist version state changed concurrently.") {
    super(message);
    this.name = "ChecklistVersionPersistenceConflictError";
  }
}

export class ChecklistVersionRepository {
  findByIdWithItems(id: string): Promise<ChecklistVersionWithItems | null> {
    return prisma.checklistVersion.findUnique({
      where: { id },
      include: checklistVersionRelations,
    });
  }

  findDraftByChecklistId(checklistId: string): Promise<ChecklistVersionWithItems | null> {
    return prisma.checklistVersion.findFirst({
      where: {
        checklistId,
        status: ChecklistVersionStatus.DRAFT,
      },
      include: checklistVersionRelations,
    });
  }

  findLatestPublishedByChecklistId(checklistId: string): Promise<ChecklistVersionWithItems | null> {
    return prisma.checklistVersion.findFirst({
      where: {
        checklistId,
        status: ChecklistVersionStatus.PUBLISHED,
      },
      orderBy: {
        versionNumber: "desc",
      },
      include: checklistVersionRelations,
    });
  }

  listByChecklistId(checklistId: string): Promise<ChecklistVersionWithItems[]> {
    return prisma.checklistVersion.findMany({
      where: { checklistId },
      orderBy: {
        versionNumber: "desc",
      },
      include: checklistVersionRelations,
    });
  }

  createDraft(input: CreateDraftPersistenceInput): Promise<ChecklistVersionWithItems> {
    return prisma.checklistVersion.create({
      data: {
        checklist: {
          connect: {
            id: input.checklistId,
            createdById: input.createdById,
            isOfficial: false,
            deletedAt: null,
          },
        },
        versionNumber: input.versionNumber,
        status: ChecklistVersionStatus.DRAFT,
        title: input.title,
        description: input.description,
        createdBy: {
          connect: { id: input.createdById },
        },
        items: {
          create: toVersionItemsCreate(input.items),
        },
      },
      include: checklistVersionRelations,
    });
  }

  updateDraftMetadataAndChecklist(
    checklistId: string,
    versionId: string,
    userId: string,
    versionData: { title?: string; description?: string | null },
    checklistData: {
      title?: string;
      description?: string | null;
      isTemplate?: boolean;
      isActive?: boolean;
    },
  ): Promise<ChecklistVersionWithItems> {
    return prisma.$transaction(async (transaction) => {
      const update = await transaction.checklistVersion.updateMany({
        where: {
          id: versionId,
          checklistId,
          checklist: { createdById: userId, isOfficial: false, deletedAt: null },
          status: ChecklistVersionStatus.DRAFT,
        },
        data: versionData,
      });

      if (update.count !== 1) {
        throw new ChecklistVersionPersistenceConflictError(
          "Only a draft checklist version can be edited.",
        );
      }

      await transaction.checklist.update({
        where: { id: checklistId, createdById: userId, isOfficial: false, deletedAt: null },
        data: checklistData,
      });

      return transaction.checklistVersion.findUniqueOrThrow({
        where: { id: versionId },
        include: checklistVersionRelations,
      });
    });
  }

  publishDraft(
    id: string,
    input: PublishVersionPersistenceInput,
    userId: string,
  ): Promise<ChecklistVersionWithItems> {
    return prisma.$transaction((transaction) =>
      publishChecklistDraft(transaction, id, input, {
        createdById: userId,
        isOfficial: false,
        deletedAt: null,
      }),
    );
  }

  retirePublished(id: string, userId: string): Promise<ChecklistVersionWithItems> {
    return prisma.$transaction(async (transaction) => {
      const update = await transaction.checklistVersion.updateMany({
        where: {
          id,
          checklist: { createdById: userId, isOfficial: false, deletedAt: null },
          status: ChecklistVersionStatus.PUBLISHED,
        },
        data: {
          status: ChecklistVersionStatus.RETIRED,
        },
      });

      if (update.count !== 1) {
        throw new ChecklistVersionPersistenceConflictError(
          "Only a published checklist version can be retired.",
        );
      }

      return transaction.checklistVersion.findUniqueOrThrow({
        where: { id },
        include: checklistVersionRelations,
      });
    });
  }
}

export const checklistVersionRepository = new ChecklistVersionRepository();

// Shared persistence path for user publication and the deployment platform bootstrap.
export async function publishChecklistDraft(
  transaction: Prisma.TransactionClient,
  id: string,
  input: PublishVersionPersistenceInput,
  checklist: Prisma.ChecklistWhereInput,
): Promise<ChecklistVersionWithItems> {
  const update = await transaction.checklistVersion.updateMany({
    where: {
      id,
      checklist,
      status: ChecklistVersionStatus.DRAFT,
      updatedAt: input.expectedUpdatedAt,
    },
    data: {
      status: ChecklistVersionStatus.PUBLISHED,
      publishedById: input.publishedById,
      publishedAt: input.publishedAt,
      contentHash: input.contentHash,
      contentSchemaVersion: input.contentSchemaVersion,
    },
  });
  if (update.count !== 1) throw new ChecklistVersionPersistenceConflictError();
  return transaction.checklistVersion.findUniqueOrThrow({
    where: { id },
    include: checklistVersionRelations,
  });
}

export function toVersionItemsCreate(
  items: VersionItemPersistenceInput[],
): Prisma.ChecklistVersionItemCreateWithoutChecklistVersionInput[] {
  return items.map((item) => ({
    description: item.description,
    orderIndex: item.orderIndex,
    isRequired: item.isRequired,
    ...(item.sourceVersionItemId
      ? { sourceVersionItem: { connect: { id: item.sourceVersionItemId } } }
      : {}),
    ...(item.sourceChecklistItemId
      ? { sourceChecklistItem: { connect: { id: item.sourceChecklistItemId } } }
      : {}),
    standards: {
      create: item.standards.map(({ standardId, ...metadata }) => ({
        ...metadata,
        standard: { connect: { id: standardId } },
      })),
    },
  }));
}
