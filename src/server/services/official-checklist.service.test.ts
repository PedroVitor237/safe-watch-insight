import "dotenv/config";
import assert from "node:assert/strict";
import test from "node:test";
import { StandardType, type Standard } from "@/generated/prisma/client";
import { OFFICIAL_CHECKLISTS } from "@/server/catalog/official-checklists";
import {
  OfficialChecklistRepository,
  type OfficialChecklistRecord,
  type OfficialChecklistPersistenceInput,
} from "@/server/repositories/official-checklist.repository";
import { createChecklistContentHash } from "@/server/utils/checklist-content-hash";
import {
  createChecklistClientSchema,
  updateChecklistSchema,
} from "@/server/schemas/checklist.schema";
import { OfficialChecklistService } from "./official-checklist.service";

class MemoryPlatformRepository extends OfficialChecklistRepository {
  records = new Map<string, OfficialChecklistRecord>();
  standardTitleSuffix = "";
  creates = 0;

  override async ensureStandard(data: { code: string; title: string }): Promise<Standard> {
    return {
      id: data.code,
      code: data.code,
      title: data.title + this.standardTitleSuffix,
      summary: null,
      officialUrl: null,
      type: StandardType.NR,
      isActive: true,
    };
  }
  override async findById(id: string) {
    return this.records.get(id) ?? null;
  }
  override async createPublished(input: OfficialChecklistPersistenceInput) {
    this.creates++;
    const now = new Date();
    const versionId = `${input.id}-v1`;
    const record: OfficialChecklistRecord = {
      id: input.id,
      title: input.title,
      description: input.description,
      createdById: null,
      isOfficial: true,
      isTemplate: true,
      isActive: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      versions: [
        {
          id: versionId,
          checklistId: input.id,
          versionNumber: 1,
          status: "PUBLISHED",
          createdById: null,
          createdAt: now,
          updatedAt: now,
          title: input.title,
          description: input.description,
          ...input.publication,
          items: input.items.map((item, index) => ({
            id: `${versionId}-${index}`,
            checklistVersionId: versionId,
            description: item.description,
            orderIndex: item.orderIndex,
            isRequired: item.isRequired,
            sourceVersionItemId: null,
            sourceChecklistItemId: null,
            createdAt: now,
            updatedAt: now,
            standards: item.standards.map((standard) => ({
              ...standard,
              checklistVersionItemId: `${versionId}-${index}`,
            })),
          })),
        },
      ],
    };
    this.records.set(input.id, record);
    return record;
  }
}

test("platform bootstrap publishes exactly two templates with catalogue standards and stable hashes", async () => {
  const repository = new MemoryPlatformRepository();
  const templates = await new OfficialChecklistService(repository).bootstrap();
  assert.equal(templates.length, 2);
  assert.deepEqual(
    templates.map((template) => template.versions[0].items.length),
    [12, 8],
  );
  for (const template of templates) {
    const version = template.versions[0];
    assert.equal(template.createdById, null);
    assert.equal(template.isOfficial, true);
    assert.equal(version.status, "PUBLISHED");
    assert.equal(version.createdById, null);
    assert.equal(version.publishedById, null);
    assert.equal(version.contentHash, createChecklistContentHash(version));
  }
  assert.match(templates[0].description ?? "", /MURBACH, Tiago/);
  assert.deepEqual(
    [
      ...new Set(
        templates[1].versions[0].items.flatMap((item) =>
          item.standards.map((standard) => standard.code),
        ),
      ),
    ].sort(),
    ["NR-1", "NR-35", "NR-6"],
  );
});

test("repeated bootstrap preserves published content even if catalogue metadata changes", async () => {
  const repository = new MemoryPlatformRepository();
  const service = new OfficialChecklistService(repository);
  const first = structuredClone(await service.bootstrap());
  repository.standardTitleSuffix = " updated";
  const second = await service.bootstrap();
  assert.deepEqual(second, first);
  assert.equal(repository.creates, 2);
});

test("bootstrap refuses an existing user-owned identity without changing it", async () => {
  const repository = new MemoryPlatformRepository();
  const service = new OfficialChecklistService(repository);
  await service.bootstrap();
  const template = repository.records.get(OFFICIAL_CHECKLISTS[0].id)!;
  template.isOfficial = false;
  template.createdById = "user";
  const before = structuredClone(template);
  await assert.rejects(() => service.bootstrap(), /identity collision/);
  assert.deepEqual(repository.records.get(template.id), before);
});

test("bootstrap refuses a corrupted publication instead of silently repairing historical content", async () => {
  const repository = new MemoryPlatformRepository();
  const service = new OfficialChecklistService(repository);
  await service.bootstrap();
  repository.records.get(OFFICIAL_CHECKLISTS[0].id)!.versions[0].items[0].description = "tampered";
  await assert.rejects(() => service.bootstrap(), /integrity failed/);
});

test("client schemas cannot assign official status or change ownership", () => {
  const forged = { title: "Personal", isOfficial: true, createdById: "attacker" };
  assert.deepEqual(createChecklistClientSchema.parse(forged), {
    title: "Personal",
    isTemplate: false,
    isActive: true,
  });
  assert.deepEqual(updateChecklistSchema.parse(forged), { title: "Personal" });
  assert.equal(updateChecklistSchema.safeParse({ isOfficial: true }).success, false);
});
