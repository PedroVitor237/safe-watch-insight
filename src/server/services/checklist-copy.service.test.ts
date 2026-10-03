import "dotenv/config";
import { getOfficialChecklistDescription } from "@/lib/official-checklist-attribution";
import assert from "node:assert/strict";
import test from "node:test";
import { OFFICIAL_CHECKLISTS } from "@/server/catalog/official-checklists";
import {
  ChecklistRepository,
  type ChecklistWithItems,
  type InitialChecklistDraftInput,
} from "@/server/repositories/checklist.repository";
import { ChecklistService, getChecklistCopyTitle } from "./checklist.service";
import { createChecklistContentHash } from "@/server/utils/checklist-content-hash";

class CopyRepository extends ChecklistRepository {
  source: ChecklistWithItems = {
    id: "source",
    createdById: "A",
    isOfficial: false,
    isTemplate: false,
    isActive: true,
    title: "Source",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    versions: [
      {
        id: "version",
        checklistId: "source",
        title: "Published",
        description: null,
        versionNumber: 1,
        status: "PUBLISHED",
        contentHash: null,
        contentSchemaVersion: 1,
        publishedAt: new Date(),
        publishedById: "A",
        createdById: "A",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      },
    ],
  };
  prepared?: InitialChecklistDraftInput;
  constructor() {
    super();
    this.source.versions[0].contentHash = createChecklistContentHash(this.source.versions[0]);
  }
  override async copyFromSource(
    _id: string,
    _user: string,
    prepare: (source: ChecklistWithItems, titles: string[]) => InitialChecklistDraftInput,
  ) {
    this.prepared = prepare(this.source, []);
    return this.source;
  }
}

test("copy names are deterministic and keep the suffix within the title limit", () => {
  assert.equal(getChecklistCopyTitle("Safety", []), "Safety — Cópia");
  assert.equal(
    getChecklistCopyTitle("Safety", ["Safety — Cópia", "Safety — Cópia (2)"]),
    "Safety — Cópia (3)",
  );
  const long = getChecklistCopyTitle("x".repeat(255), []);
  assert.equal(long.length, 255);
  assert.ok(long.endsWith(" — Cópia"));
});

test("owner copies draft content; other readers copy only the publication", async () => {
  const repository = new CopyRepository();
  repository.source.versions.unshift({
    ...repository.source.versions[0],
    id: "draft",
    versionNumber: 2,
    status: "DRAFT",
    title: "Private draft",
    contentHash: null,
  });
  const service = new ChecklistService(repository);
  assert.equal((await service.copyChecklist("source", "A")).success, true);
  assert.equal(repository.prepared?.title, "Private draft — Cópia");
  assert.equal((await service.copyChecklist("source", "B")).success, true);
  assert.equal(repository.prepared?.title, "Published — Cópia");
  assert.equal(repository.prepared?.createdById, "B");
});

test("retired content is not a copy source; corrupted publications are rejected", async () => {
  const repository = new CopyRepository();
  const service = new ChecklistService(repository);
  repository.source.versions[0].status = "RETIRED";
  const retired = await service.copyChecklist("source", "A");
  assert.equal(retired.success, false);
  if (!retired.success) assert.equal(retired.code, "NOT_FOUND");
  repository.source.versions[0].status = "PUBLISHED";
  repository.source.versions[0].title = "Corrupt";
  const corrupt = await service.copyChecklist("source", "B");
  assert.equal(corrupt.success, false);
  if (!corrupt.success) assert.equal(corrupt.code, "CONFLICT");
});

test("official alias rejects personal checklists and uses the common copy operation", async () => {
  const repository = new CopyRepository();
  const service = new ChecklistService(repository);
  assert.equal((await service.useOfficialTemplate("source", "A")).success, false);
  repository.source.isOfficial = true;
  repository.source.createdById = null;
  assert.equal((await service.useOfficialTemplate("source", "B")).success, true);
  assert.equal(repository.prepared?.createdById, "B");
});

test("bibliographic correction preserves immutable old content and covers page 72", () => {
  const old = "Fonte: páginas impressas 73–74 de Murbach.";
  const corrected = getOfficialChecklistDescription(OFFICIAL_CHECKLISTS[0].id, old);
  assert.ok(corrected?.startsWith(old));
  assert.match(corrected ?? "", /72–74/);
  assert.equal(getOfficialChecklistDescription("personal", old), old);
  assert.match(OFFICIAL_CHECKLISTS[0].description, /72–74/);
});

test("draft copies keep ancestry without referencing mutable source items", async () => {
  const repository = new CopyRepository();
  const draft = repository.source.versions[0];
  draft.status = "DRAFT";
  draft.contentHash = null;
  draft.items.push({
    id: "mutable-item",
    checklistVersionId: draft.id,
    description: "Editable",
    orderIndex: 1,
    isRequired: true,
    sourceVersionItemId: null,
    sourceChecklistItemId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    standards: [],
  });
  const service = new ChecklistService(repository);
  assert.equal((await service.copyChecklist("source", "A")).success, true);
  assert.equal(repository.prepared?.items?.[0].sourceVersionItemId, null);
  draft.items[0].sourceVersionItemId = "published-ancestor";
  assert.equal((await service.copyChecklist("source", "A")).success, true);
  assert.equal(repository.prepared?.items?.[0].sourceVersionItemId, "published-ancestor");
});
