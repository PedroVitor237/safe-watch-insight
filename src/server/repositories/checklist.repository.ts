import { randomUUID } from "node:crypto";

import { ChecklistVersionStatus, type Checklist, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import { paginate } from "@/server/responses/pagination";
import type { PaginatedResult, SortOrder } from "@/server/types";
import { getPaginationOffset, normalizePagination } from "@/server/utils/pagination.utils";

import { BaseRepository } from "./base.repository";
import {
  toVersionItemsCreate,
  checklistVersionRelations,
  type VersionItemPersistenceInput,
} from "./checklist-version.repository";

const checklistRelations = {
  versions: {
    orderBy: {
      versionNumber: "desc",
    },
    include: checklistVersionRelations,
  },
} satisfies Prisma.ChecklistInclude;

const checklistListRelations = {
  versions: {
    orderBy: {
      versionNumber: "desc",
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  },
} satisfies Prisma.ChecklistInclude;

export type ChecklistWithItems = Prisma.ChecklistGetPayload<{
  include: typeof checklistRelations;
}>;

export type ChecklistWithVersionSummaries = Prisma.ChecklistGetPayload<{
  include: typeof checklistListRelations;
}>;

const CHECKLIST_SORT_FIELDS = {
  title: "title",
  isTemplate: "isTemplate",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

export type ChecklistSortField = keyof typeof CHECKLIST_SORT_FIELDS;

export interface ChecklistFindManyFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: ChecklistSortField;
  sortOrder?: SortOrder;
  createdById?: string;
  visibleToUserId?: string;
  scope?: "official" | "mine" | "shared";
  isTemplate?: boolean;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export interface InitialChecklistDraftInput {
  title: string;
  description: string | null;
  createdById: string;
  items?: VersionItemPersistenceInput[];
}

export class ChecklistRepository extends BaseRepository<
  Checklist,
  Prisma.ChecklistCreateInput,
  Prisma.ChecklistUpdateInput,
  Prisma.ChecklistWhereUniqueInput,
  Prisma.ChecklistFindManyArgs,
  Prisma.ChecklistCountArgs
> {
  constructor() {
    super(prisma.checklist);
  }

  createWithItems(data: Prisma.ChecklistCreateInput): Promise<ChecklistWithItems> {
    return prisma.checklist.create({
      data,
      include: checklistRelations,
    });
  }

  createWithDraft(
    data: Prisma.ChecklistCreateInput,
    draft: InitialChecklistDraftInput,
    database: Pick<Prisma.TransactionClient, "checklist"> = prisma,
  ): Promise<ChecklistWithItems> {
    return database.checklist.create({
      data: {
        ...data,
        versions: {
          create: {
            versionNumber: 1,
            title: draft.title,
            description: draft.description,
            items: { create: toVersionItemsCreate(draft.items ?? []) },
            createdBy: {
              connect: { id: draft.createdById },
            },
          },
        },
      },
      include: checklistRelations,
    });
  }

  copyFromSource(
    sourceId: string,
    userId: string,
    prepare: (source: ChecklistWithItems, existingTitles: string[]) => InitialChecklistDraftInput,
  ): Promise<ChecklistWithItems> {
    return prisma.$transaction(
      async (transaction) => {
        const source = await transaction.checklist.findFirstOrThrow({
          where: {
            id: sourceId,
            deletedAt: null,
            OR: [
              { createdById: userId, isOfficial: false },
              { isActive: true, versions: { some: { status: ChecklistVersionStatus.PUBLISHED } } },
            ],
          },
          include: checklistRelations,
        });
        const existing = await transaction.checklist.findMany({
          where: { createdById: userId, deletedAt: null },
          select: { title: true },
        });
        const draft = prepare(
          source,
          existing.map(({ title }) => title),
        );
        // Ownership comes from the trusted session argument, never the source or prepared content.
        const checklistId = randomUUID();
        const versionId = randomUUID();
        await transaction.checklist.create({
          data: {
            id: checklistId,
            title: draft.title,
            description: draft.description,
            createdById: userId,
            isOfficial: false,
            isTemplate: false,
          },
        });
        await transaction.checklistVersion.create({
          data: {
            id: versionId,
            checklistId,
            versionNumber: 1,
            status: ChecklistVersionStatus.DRAFT,
            title: draft.title,
            description: draft.description,
            createdById: userId,
          },
        });
        // Bounded bulk writes avoid per-item connect/create round trips inside the transaction.
        const items = (draft.items ?? []).map((item) => ({ ...item, id: randomUUID() }));
        if (items.length) {
          await transaction.checklistVersionItem.createMany({
            data: items.map(({ standards: _standards, ...item }) => ({
              ...item,
              checklistVersionId: versionId,
            })),
          });
          const standards = items.flatMap((item) =>
            item.standards.map((standard) => ({
              ...standard,
              checklistVersionItemId: item.id,
            })),
          );
          if (standards.length) {
            await transaction.checklistVersionItemStandard.createMany({ data: standards });
          }
        }
        return transaction.checklist.findUniqueOrThrow({
          where: { id: checklistId },
          include: checklistRelations,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  updateWithItems(
    where: Prisma.ChecklistWhereUniqueInput,
    data: Prisma.ChecklistUpdateInput,
  ): Promise<ChecklistWithItems> {
    return prisma.checklist.update({
      where,
      data,
      include: checklistRelations,
    });
  }

  findActiveById(id: string): Promise<ChecklistWithItems | null> {
    return prisma.checklist.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: checklistRelations,
    });
  }

  findActiveOwnedById(id: string, userId: string): Promise<ChecklistWithItems | null> {
    return prisma.checklist.findFirst({
      where: { id, createdById: userId, isOfficial: false, deletedAt: null },
      include: checklistRelations,
    });
  }

  findVisibleById(id: string, userId: string): Promise<ChecklistWithItems | null> {
    return prisma.checklist.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { createdById: userId },
          { isActive: true, versions: { some: { status: ChecklistVersionStatus.PUBLISHED } } },
        ],
      },
      include: checklistRelations,
    });
  }

  updateOwnedWithItems(
    id: string,
    userId: string,
    data: Prisma.ChecklistUpdateInput,
  ): Promise<ChecklistWithItems> {
    return prisma.checklist.update({
      where: { id, createdById: userId, isOfficial: false, deletedAt: null },
      data,
      include: checklistRelations,
    });
  }

  softDeleteOwned(id: string, userId: string): Promise<ChecklistWithItems> {
    return this.updateOwnedWithItems(id, userId, { deletedAt: new Date() });
  }

  findManyPaginated(
    filters: ChecklistFindManyFilters = {},
  ): Promise<PaginatedResult<ChecklistWithVersionSummaries>> {
    const pagination = normalizePagination(filters.page, filters.pageSize);
    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder);

    return Promise.all([
      prisma.checklist.findMany({
        where,
        orderBy,
        skip: getPaginationOffset(pagination),
        take: pagination.pageSize,
        include: checklistListRelations,
      }),
      prisma.checklist.count({ where }),
    ]).then(([items, totalItems]) => paginate(items, totalItems, pagination));
  }

  softDelete(id: string): Promise<ChecklistWithItems> {
    return prisma.checklist.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: checklistRelations,
    });
  }

  private buildWhere(filters: ChecklistFindManyFilters): Prisma.ChecklistWhereInput {
    const conditions: Prisma.ChecklistWhereInput[] = [];

    if (!filters.includeDeleted) {
      conditions.push({ deletedAt: null });
    }

    if (filters.createdById) {
      conditions.push({ createdById: filters.createdById });
    }

    if (filters.visibleToUserId) {
      conditions.push({
        OR: [
          { createdById: filters.visibleToUserId },
          { isActive: true, versions: { some: { status: ChecklistVersionStatus.PUBLISHED } } },
        ],
      });
    }

    if (filters.scope === "official") conditions.push({ isOfficial: true });
    if (filters.scope === "mine")
      conditions.push({ createdById: filters.visibleToUserId, isOfficial: false });
    if (filters.scope === "shared")
      conditions.push({ createdById: { not: filters.visibleToUserId }, isOfficial: false });

    if (filters.isTemplate !== undefined) {
      conditions.push({ isTemplate: filters.isTemplate });
    }

    if (filters.isActive !== undefined) {
      conditions.push({ isActive: filters.isActive });
    }

    const search = filters.search?.trim();
    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (conditions.length === 0) {
      return {};
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  }

  private buildOrderBy(
    sortBy?: ChecklistSortField,
    sortOrder: SortOrder = "desc",
  ): Prisma.ChecklistOrderByWithRelationInput {
    const field = sortBy && sortBy in CHECKLIST_SORT_FIELDS ? sortBy : "createdAt";

    return { [field]: sortOrder };
  }
}

export const checklistRepository = new ChecklistRepository();
