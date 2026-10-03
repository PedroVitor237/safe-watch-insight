import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import bcrypt from "bcrypt";
import { prisma } from "@/server/prisma/client";
import type { Result } from "@/server/responses";
import { ChecklistRepository } from "@/server/repositories/checklist.repository";
import { checklistService } from "@/server/services/checklist.service";
import { checklistVersionService } from "@/server/services/checklist-version.service";
import { checklistItemService } from "@/server/services/checklist-item.service";
import { officialChecklistService } from "@/server/services/official-checklist.service";
import { createChecklistContentHash } from "@/server/utils/checklist-content-hash";

const database = new URL(process.env.DATABASE_URL ?? "postgresql://invalid");
if (!(
  ["localhost", "127.0.0.1"].includes(database.hostname) ||
  process.env.CHECKLIST_COPY_TEST_DATABASE === "configured-tcc"
)) {
  throw new Error(
    "Use local PostgreSQL or explicitly confirm the configured TCC fixture database with CHECKLIST_COPY_TEST_DATABASE=configured-tcc.",
  );
}
function unwrap<T>(result: Result<T>): T {
  if (!result.success) throw new Error(`${result.code}: ${result.message}`);
  return result.data;
}
function unavailable(result: Result<unknown>): void {
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.code, "NOT_FOUND");
}

test("checklist copy — real database, default transaction timeout", async (t) => {
  const users: string[] = [];
  const copies: string[] = [];
  const repository = new ChecklistRepository();
  const copy = async (id: string, user: string) => {
    const result = unwrap(await checklistService.copyChecklist(id, user));
    copies.push(result.id);
    return result;
  };
  try {
    const sourceBefore = structuredClone(await officialChecklistService.bootstrap());
    for (const label of ["A", "B"]) {
      users.push(
        (
          await prisma.user.create({
            data: {
              name: `Copy ${label}`,
              email: `copy-${randomUUID()}@test.invalid`,
              role: "TECHNICIAN",
              password: await bcrypt.hash(randomUUID(), 4),
            },
          })
        ).id,
      );
    }
    const [a, b] = users;
    const official = sourceBefore[0];
    const snapshotCount = await prisma.inspectionChecklistSnapshot.count();
    const aCopy = await copy(official.id, a);
    const bCopy = unwrap(await checklistService.useOfficialTemplate(official.id, b));
    copies.push(bCopy.id);
    await t.test(
      "official copies have independent IDs, ownership, draft v1 and normative records",
      async () => {
        for (const [owned, user] of [
          [aCopy, a],
          [bCopy, b],
        ] as const) {
          assert.equal(owned.createdById, user);
          assert.equal(owned.isOfficial, false);
          assert.equal(owned.isTemplate, false);
          assert.equal(owned.versions.length, 1);
          const draft = owned.versions[0];
          assert.equal(draft.status, "DRAFT");
          assert.equal(draft.versionNumber, 1);
          assert.equal(draft.createdById, user);
          assert.equal(draft.contentHash, null);
          assert.equal(draft.publishedAt, null);
          assert.notEqual(draft.id, official.versions[0].id);
          assert.equal(draft.items.length, 12);
          draft.items.forEach((item, index) => {
            const original = official.versions[0].items[index];
            assert.notEqual(item.id, original.id);
            assert.equal(item.sourceVersionItemId, original.id);
            assert.equal(item.description, original.description);
            assert.deepEqual(
              item.standards.map(({ checklistVersionItemId: _id, ...rest }) => rest),
              original.standards.map(({ checklistVersionItemId: _id, ...rest }) => rest),
            );
          });
        }
        assert.notEqual(aCopy.id, bCopy.id);
        assert.equal(await prisma.inspectionChecklistSnapshot.count(), snapshotCount);
      },
    );
    await t.test(
      "direct service requests reject another user's private source and missing IDs",
      async () => {
        unavailable(await checklistService.copyChecklist(aCopy.id, b));
        unavailable(await checklistService.copyChecklist(randomUUID(), a));
      },
    );
    await t.test(
      "personal draft duplication preserves working content and deterministic names",
      async () => {
        const original = unwrap(await checklistService.getChecklistById(aCopy.id, a));
        const duplicated = await copy(aCopy.id, a);
        assert.equal(duplicated.title, `${original.title} — Cópia`);
        unwrap(
          await checklistService.updateChecklist(duplicated.id, { title: "Changed duplicate" }, a),
        );
        unwrap(
          await checklistItemService.updateChecklistItem(duplicated.versions[0].items[0].id, {
            description: "Changed duplicated item",
            updatedById: a,
          }),
        );
        assert.deepEqual(unwrap(await checklistService.getChecklistById(aCopy.id, a)), original);
        const second = await copy(official.id, a);
        assert.equal(second.title, `${official.versions[0].title} — Cópia (2)`);
      },
    );
    await t.test(
      "duplicating a draft never prevents the owner from deleting its source item",
      async () => {
        const editable = unwrap(
          await checklistService.createChecklist({ title: "Mutable source", createdById: a }),
        );
        copies.push(editable.id);
        const item = unwrap(
          await checklistItemService.createChecklistItem({
            checklistId: editable.id,
            description: "Editable source item",
            updatedById: a,
          }),
        );
        const independent = await copy(editable.id, a);
        assert.equal(independent.versions[0].items[0].sourceVersionItemId, null);
        unwrap(await checklistItemService.deleteChecklistItem(item.id, a));
        assert.equal(
          unwrap(await checklistService.getChecklistById(independent.id, a)).versions[0].items[0]
            .description,
          "Editable source item",
        );
      },
    );
    await t.test(
      "A edits and publishes its copy without modifying B or either official template",
      async () => {
        unwrap(await checklistService.updateChecklist(aCopy.id, { title: "Edited by A" }, a));
        unwrap(
          await checklistItemService.updateChecklistItem(aCopy.versions[0].items[0].id, {
            description: "A independent content",
            updatedById: a,
          }),
        );
        const published = unwrap(await checklistVersionService.publishDraft(aCopy.id, a));
        assert.equal(published.contentHash, createChecklistContentHash(published));
        assert.deepEqual(
          unwrap(await checklistService.getChecklistById(bCopy.id, b)).versions,
          bCopy.versions,
        );
        assert.deepEqual(await officialChecklistService.bootstrap(), sourceBefore);
      },
    );
    await t.test(
      "foreign readers copy published content, never the owner's newer private draft",
      async () => {
        const publication = unwrap(await checklistService.getChecklistById(aCopy.id, a))
          .versions[0];
        const draft = await checklistVersionService.getOrCreateDraft(aCopy.id, a);
        unwrap(
          await checklistItemService.updateChecklistItem(draft.items[0].id, {
            description: "Secret draft",
            updatedById: a,
          }),
        );
        const source = unwrap(await checklistService.getChecklistById(aCopy.id, a));
        const foreignCopy = await copy(aCopy.id, b);
        assert.equal(foreignCopy.createdById, b);
        assert.equal(foreignCopy.title, `${publication.title} — Cópia`);
        assert.equal(foreignCopy.versions[0].items[0].description, "A independent content");
        unwrap(
          await checklistService.updateChecklist(foreignCopy.id, { title: "B published copy" }, b),
        );
        unwrap(
          await checklistItemService.updateChecklistItem(foreignCopy.versions[0].items[0].id, {
            description: "B change",
            updatedById: b,
          }),
        );
        unwrap(await checklistVersionService.publishDraft(foreignCopy.id, b));
        assert.deepEqual(unwrap(await checklistService.getChecklistById(aCopy.id, a)), source);
        const ownerCopy = await copy(aCopy.id, a);
        assert.equal(ownerCopy.versions[0].items[0].description, "Secret draft");
      },
    );
    await t.test(
      "inactive, withdrawn and deleted foreign sources remain inaccessible",
      async () => {
        const source = unwrap(await checklistService.getChecklistById(aCopy.id, a));
        const publication = source.versions.find((version) => version.status === "PUBLISHED")!;
        unwrap(await checklistService.updateChecklist(aCopy.id, { isActive: false }, a));
        unavailable(await checklistService.copyChecklist(aCopy.id, b));
        unwrap(await checklistService.updateChecklist(aCopy.id, { isActive: true }, a));
        unwrap(await checklistVersionService.retireVersion(aCopy.id, publication.id, a));
        unavailable(await checklistService.copyChecklist(aCopy.id, b));
        const retiredOnly = await copy(official.id, a);
        const retired = unwrap(await checklistVersionService.publishDraft(retiredOnly.id, a));
        unwrap(await checklistVersionService.retireVersion(retiredOnly.id, retired.id, a));
        unavailable(await checklistService.copyChecklist(retiredOnly.id, a));
        unwrap(await checklistService.deleteChecklist(aCopy.id, a));
        unavailable(await checklistService.copyChecklist(aCopy.id, a));
      },
    );
    await t.test(
      "failure in the last bulk write rolls back checklist, version, items and associations",
      async () => {
        const before = await Promise.all([
          prisma.checklist.count(),
          prisma.checklistVersion.count(),
          prisma.checklistVersionItem.count(),
          prisma.checklistVersionItemStandard.count(),
        ]);
        await assert.rejects(
          () =>
            repository.copyFromSource(official.id, a, (source) => ({
              title: "Must rollback",
              description: null,
              createdById: a,
              items: checklistVersionService.toDraftItems(source.versions[0]).map((item) => ({
                ...item,
                standards: item.standards.map((standard) => ({
                  ...standard,
                  standardId: randomUUID(),
                })),
              })),
            })),
          (error: unknown) => error instanceof Error && "code" in error && error.code === "P2003",
        );
        assert.deepEqual(
          await Promise.all([
            prisma.checklist.count(),
            prisma.checklistVersion.count(),
            prisma.checklistVersionItem.count(),
            prisma.checklistVersionItemStandard.count(),
          ]),
          before,
        );
      },
    );
    await t.test(
      "repeated official copies pass on the unchanged default Prisma client",
      async () => {
        for (let i = 0; i < 4; i++) {
          const started = Date.now();
          await copy(sourceBefore[i % 2].id, users[i % 2]);
          console.info(`Copy ${i + 1}: ${Date.now() - started} ms`);
        }
        assert.deepEqual(await officialChecklistService.bootstrap(), sourceBefore);
      },
    );
  } finally {
    // Scope cleanup by the generated user IDs, including any resource created before an assertion failed.
    const versionWhere = { checklist: { createdById: { in: users } } };
    await prisma.checklistVersionItemStandard.deleteMany({
      where: { checklistVersionItem: { checklistVersion: versionWhere } },
    });
    await prisma.checklistVersionItem.updateMany({
      where: { checklistVersion: versionWhere },
      data: { sourceVersionItemId: null },
    });
    await prisma.checklistVersionItem.deleteMany({ where: { checklistVersion: versionWhere } });
    await prisma.checklistVersion.deleteMany({ where: versionWhere });
    await prisma.checklist.deleteMany({ where: { createdById: { in: users } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    assert.equal(await prisma.user.count({ where: { id: { in: users } } }), 0);
    await prisma.$disconnect();
  }
});
