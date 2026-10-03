import { ChecklistVersionStatus, type Prisma, type Standard } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import {
  checklistVersionRelations,
  publishChecklistDraft,
  toVersionItemsCreate,
  type PublishVersionPersistenceInput,
  type VersionItemPersistenceInput,
} from "./checklist-version.repository";

const officialRelations = {
  versions: { orderBy: { versionNumber: "desc" }, include: checklistVersionRelations },
} satisfies Prisma.ChecklistInclude;
export type OfficialChecklistRecord = Prisma.ChecklistGetPayload<{
  include: typeof officialRelations;
}>;

export interface OfficialChecklistPersistenceInput {
  id: string;
  title: string;
  description: string;
  items: VersionItemPersistenceInput[];
  publication: Omit<PublishVersionPersistenceInput, "expectedUpdatedAt">;
}

// Used only by the deployment/bootstrap service. No Server Function exposes these writes.
export class OfficialChecklistRepository {
  async ensureStandard(data: Prisma.StandardCreateManyInput): Promise<Standard> {
    await prisma.standard.createMany({ data: [data], skipDuplicates: true });
    return prisma.standard.findUniqueOrThrow({ where: { code: data.code } });
  }

  findById(id: string): Promise<OfficialChecklistRecord | null> {
    return prisma.checklist.findUnique({ where: { id }, include: officialRelations });
  }

  createPublished(input: OfficialChecklistPersistenceInput): Promise<OfficialChecklistRecord> {
    return prisma.$transaction(async (transaction) => {
      const checklist = await transaction.checklist.create({
        data: {
          id: input.id,
          title: input.title,
          description: input.description,
          isOfficial: true,
          isTemplate: true,
          versions: {
            create: {
              versionNumber: 1,
              status: ChecklistVersionStatus.DRAFT,
              title: input.title,
              description: input.description,
              items: { create: toVersionItemsCreate(input.items) },
            },
          },
        },
        include: officialRelations,
      });
      const draft = checklist.versions[0];
      await publishChecklistDraft(
        transaction,
        draft.id,
        {
          ...input.publication,
          expectedUpdatedAt: draft.updatedAt,
        },
        { id: input.id, isOfficial: true, createdById: null, deletedAt: null },
      );
      return transaction.checklist.findUniqueOrThrow({
        where: { id: input.id },
        include: officialRelations,
      });
    });
  }
}
