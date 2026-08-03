import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import { ChecklistVersionStatus, StandardType } from "@/generated/prisma/client";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import {
  ChecklistVersionRepository,
  type ChecklistVersionWithItems,
  type CreateDraftPersistenceInput,
  type PublishVersionPersistenceInput,
} from "@/server/repositories/checklist-version.repository";

import { ChecklistVersionService } from "./checklist-version.service";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CHECKLIST_ID = "22222222-2222-4222-8222-222222222222";
const VERSION_ID = "33333333-3333-4333-8333-333333333333";
const VERSION_ITEM_ID = "44444444-4444-4444-8444-444444444444";
const STANDARD_ID = "55555555-5555-4555-8555-555555555555";

class FakeChecklistRepository extends ChecklistRepository {
  override findActiveById() {
    const now = new Date("2026-08-03T12:00:00.000Z");

    return Promise.resolve({
      id: CHECKLIST_ID,
      title: "Checklist",
      description: null,
      isTemplate: false,
      isActive: true,
      createdById: USER_ID,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      versions: [],
    });
  }
}

class FakeChecklistVersionRepository extends ChecklistVersionRepository {
  publishInput: PublishVersionPersistenceInput | null = null;
  draftInput: CreateDraftPersistenceInput | null = null;

  constructor(
    private draft: ChecklistVersionWithItems | null,
    private versions: ChecklistVersionWithItems[],
  ) {
    super();
  }

  override findDraftByChecklistId(): Promise<ChecklistVersionWithItems | null> {
    return Promise.resolve(this.draft);
  }

  override listByChecklistId(): Promise<ChecklistVersionWithItems[]> {
    return Promise.resolve(this.versions);
  }

  override publishDraft(
    _id: string,
    input: PublishVersionPersistenceInput,
  ): Promise<ChecklistVersionWithItems> {
    this.publishInput = input;

    if (!this.draft) {
      throw new Error("Unexpected missing draft.");
    }

    return Promise.resolve({
      ...this.draft,
      status: ChecklistVersionStatus.PUBLISHED,
      contentSchemaVersion: input.contentSchemaVersion,
      contentHash: input.contentHash,
      publishedById: input.publishedById,
      publishedAt: input.publishedAt,
    });
  }

  override createDraft(input: CreateDraftPersistenceInput): Promise<ChecklistVersionWithItems> {
    this.draftInput = input;
    const now = new Date("2026-08-03T13:00:00.000Z");
    const created = createVersion(ChecklistVersionStatus.DRAFT, input.versionNumber);

    return Promise.resolve({
      ...created,
      title: input.title,
      description: input.description,
      items: input.items.map((item, index) => ({
        id: `99999999-9999-4999-8999-99999999999${index}`,
        checklistVersionId: created.id,
        sourceVersionItemId: item.sourceVersionItemId ?? null,
        sourceChecklistItemId: item.sourceChecklistItemId ?? null,
        description: item.description,
        orderIndex: item.orderIndex,
        isRequired: item.isRequired,
        createdAt: now,
        updatedAt: now,
        standards: item.standards.map((standard) => ({
          checklistVersionItemId: created.id,
          ...standard,
        })),
      })),
    });
  }
}

test("publishing fixes a SHA-256 hash and transitions the draft once", async () => {
  const draft = createVersion(ChecklistVersionStatus.DRAFT, 1);
  const repository = new FakeChecklistVersionRepository(draft, [draft]);
  const service = new ChecklistVersionService(repository, new FakeChecklistRepository());

  const result = await service.publishDraft(CHECKLIST_ID, USER_ID);

  assert.equal(result.success, true);
  assert.match(repository.publishInput?.contentHash ?? "", /^[0-9a-f]{64}$/);
  assert.equal(repository.publishInput?.expectedUpdatedAt, draft.updatedAt);

  if (result.success) {
    assert.equal(result.data.status, ChecklistVersionStatus.PUBLISHED);
    assert.equal(result.data.contentHash, repository.publishInput?.contentHash);
  }
});

test("editing after publication clones the immutable version into the next draft", async () => {
  const published = createVersion(ChecklistVersionStatus.PUBLISHED, 1);
  const repository = new FakeChecklistVersionRepository(null, [published]);
  const service = new ChecklistVersionService(repository, new FakeChecklistRepository());

  const draft = await service.getOrCreateDraft(CHECKLIST_ID, USER_ID);

  assert.equal(draft.status, ChecklistVersionStatus.DRAFT);
  assert.equal(draft.versionNumber, 2);
  assert.equal(repository.draftInput?.items[0]?.sourceVersionItemId, VERSION_ITEM_ID);
  assert.equal(repository.draftInput?.items[0]?.standards[0]?.code, "NR-10");
});

test("publishing without a draft is rejected and does not rewrite a published version", async () => {
  const published = createVersion(ChecklistVersionStatus.PUBLISHED, 1);
  const repository = new FakeChecklistVersionRepository(null, [published]);
  const service = new ChecklistVersionService(repository, new FakeChecklistRepository());

  const result = await service.publishDraft(CHECKLIST_ID, USER_ID);

  assert.equal(result.success, false);
  assert.equal(repository.publishInput, null);
});

function createVersion(
  status: ChecklistVersionStatus,
  versionNumber: number,
): ChecklistVersionWithItems {
  const now = new Date("2026-08-03T12:00:00.000Z");
  const published = status !== ChecklistVersionStatus.DRAFT;

  return {
    id: VERSION_ID,
    checklistId: CHECKLIST_ID,
    versionNumber,
    status,
    title: "Checklist publicado",
    description: "Versão estável",
    contentSchemaVersion: 1,
    contentHash: published ? "a".repeat(64) : null,
    createdById: USER_ID,
    publishedById: published ? USER_ID : null,
    publishedAt: published ? now : null,
    createdAt: now,
    updatedAt: now,
    items: [
      {
        id: VERSION_ITEM_ID,
        checklistVersionId: VERSION_ID,
        sourceVersionItemId: null,
        sourceChecklistItemId: null,
        description: "Pergunta v1",
        orderIndex: 1,
        isRequired: true,
        createdAt: now,
        updatedAt: now,
        standards: [
          {
            checklistVersionItemId: VERSION_ITEM_ID,
            standardId: STANDARD_ID,
            type: StandardType.NR,
            code: "NR-10",
            title: "Segurança em eletricidade",
            summary: null,
            officialUrl: null,
          },
        ],
      },
    ],
  };
}
