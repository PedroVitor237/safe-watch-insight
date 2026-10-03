import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import bcrypt from "bcrypt";
import { prisma } from "../src/server/prisma/client";
import type { Result } from "../src/server/responses";
import { officialChecklistService } from "../src/server/services/official-checklist.service";
import { checklistService } from "../src/server/services/checklist.service";
import { checklistVersionService } from "../src/server/services/checklist-version.service";
import { checklistItemService } from "../src/server/services/checklist-item.service";
import { companyService } from "../src/server/services/company.service";
import { inspectionService } from "../src/server/services/inspection.service";
import { inspectionResponseService } from "../src/server/services/inspection-response.service";
import { reportService } from "../src/server/services/report.service";
import type { InspectionWithRelations } from "../src/server/repositories/inspection.repository";
import { ChecklistRepository } from "../src/server/repositories/checklist.repository";
import { ChecklistVersionRepository } from "../src/server/repositories/checklist-version.repository";
import { ChecklistVersionItemRepository } from "../src/server/repositories/checklist-version-item.repository";
import { OfficialChecklistRepository } from "../src/server/repositories/official-checklist.repository";
import { createChecklistContentHash } from "../src/server/utils/checklist-content-hash";

const database = new URL(process.env.DATABASE_URL ?? "postgresql://invalid");
if (
  process.env.OFFICIAL_TEMPLATE_TEST_DATABASE !== "local-only" ||
  !["localhost", "127.0.0.1"].includes(database.hostname)
) {
  throw new Error(
    "Use a migrated, disposable local PostgreSQL database and OFFICIAL_TEMPLATE_TEST_DATABASE=local-only.",
  );
}
function unwrap<T>(result: Result<T>): T {
  if (!result.success) throw new Error(result.message);
  return result.data;
}
function unavailable(result: Result<unknown>) {
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.code, "NOT_FOUND");
}

test("official templates — PostgreSQL integration", async (t) => {
  const users: string[] = [];
  const checklists: string[] = [];
  const inspections: string[] = [];
  let companyId: string | undefined;
  const platformRepository = new OfficialChecklistRepository();
  try {
    const userCount = await prisma.user.count();
    const [templates] = await Promise.all([
      officialChecklistService.bootstrap(),
      officialChecklistService.bootstrap(),
    ]);
    const source = templates[0];
    const version = source.versions[0];
    const before = structuredClone(templates);
    await t.test(
      "bootstrap is concurrent-safe, repeatable and independent of demo users",
      async () => {
        assert.equal(await prisma.user.count(), userCount);
        assert.equal(templates.length, 2);
        assert.equal(await prisma.checklist.count({ where: { isOfficial: true } }), 2);
        assert.deepEqual(await officialChecklistService.bootstrap(), before);
        for (const template of templates) {
          assert.equal(template.createdById, null);
          assert.equal(template.versions[0].createdById, null);
          assert.equal(template.versions[0].publishedById, null);
          assert.equal(
            template.versions[0].contentHash,
            createChecklistContentHash(template.versions[0]),
          );
        }
      },
    );
    const password = await bcrypt.hash(randomUUID(), 4);
    for (const label of ["A", "B"]) {
      users.push(
        (
          await prisma.user.create({
            data: {
              name: `Template ${label}`,
              email: `template-${randomUUID()}@test.invalid`,
              role: "TECHNICIAN",
              password,
            },
          })
        ).id,
      );
    }
    const [userA, userB] = users;
    await t.test(
      "both users see the same official templates, items and published versions",
      async () => {
        for (const user of users) {
          const list = unwrap(await checklistService.listChecklists({ scope: "official" }, user));
          assert.deepEqual(
            list.items.map((item) => item.id).sort(),
            templates.map((item) => item.id).sort(),
          );
          assert.ok(list.items.every((item) => !item.canManage));
          const detail = unwrap(await checklistService.getChecklistById(source.id, user));
          assert.equal(detail.canManage, false);
          assert.deepEqual(
            unwrap(await checklistItemService.listChecklistItems(source.id, user)),
            version.items,
          );
          assert.deepEqual(
            unwrap(await checklistVersionService.listVersions(source.id, user)),
            source.versions,
          );
        }
      },
    );
    await t.test(
      "ordinary users cannot mutate template identity, items, drafts or publications",
      async () => {
        for (const user of users) {
          unavailable(
            await checklistService.updateChecklist(source.id, { title: "Changed" }, user),
          );
          unavailable(await checklistService.updateChecklist(source.id, { isActive: false }, user));
          unavailable(await checklistService.deleteChecklist(source.id, user));
          unavailable(
            await checklistItemService.createChecklistItem({
              checklistId: source.id,
              description: "Changed",
              updatedById: user,
            }),
          );
          unavailable(
            await checklistItemService.updateChecklistItem(version.items[0].id, {
              description: "Changed",
              updatedById: user,
            }),
          );
          unavailable(await checklistItemService.deleteChecklistItem(version.items[0].id, user));
          unavailable(await checklistVersionService.publishDraft(source.id, user));
          unavailable(await checklistVersionService.retireVersion(source.id, version.id, user));
          await assert.rejects(
            () => checklistVersionService.getOrCreateDraft(source.id, user),
            /not found/i,
          );
        }
        // Exercise ownership independently of publication immutability with an unpublished platform draft.
        const draft = await prisma.checklistVersion.create({
          data: {
            checklistId: source.id,
            versionNumber: 2,
            title: "Unpublished platform draft",
            items: { create: { description: "Private platform item", orderIndex: 1 } },
          },
          include: { items: true },
        });
        try {
          assert.deepEqual(
            unwrap(await checklistVersionService.listVersions(source.id, userA)),
            source.versions,
          );
          assert.equal(
            unwrap(await checklistService.getChecklistById(source.id, userA)).title,
            source.title,
          );
          unavailable(await checklistVersionService.publishDraft(source.id, userA));
          unavailable(
            await checklistItemService.updateChecklistItem(draft.items[0].id, {
              description: "Changed",
              updatedById: userA,
            }),
          );
          unavailable(await checklistItemService.deleteChecklistItem(draft.items[0].id, userA));
          // Persistence predicates also protect a draft when a caller omits a service guard.
          await assert.rejects(() =>
            new ChecklistRepository().updateOwnedWithItems(source.id, userA, { title: "Changed" }),
          );
          await assert.rejects(() =>
            new ChecklistVersionRepository().retirePublished(version.id, userA),
          );
          await assert.rejects(() =>
            new ChecklistVersionRepository().publishDraft(
              draft.id,
              {
                publishedById: userA,
                publishedAt: new Date(),
                contentHash: "a".repeat(64),
                contentSchemaVersion: 1,
                expectedUpdatedAt: draft.updatedAt,
              },
              userA,
            ),
          );
          const itemRepository = new ChecklistVersionItemRepository();
          await assert.rejects(() =>
            itemRepository.createInDraft({
              checklistVersionId: draft.id,
              userId: userA,
              description: "Changed",
              orderIndex: 99,
              isRequired: true,
              standards: [],
            }),
          );
          await assert.rejects(() =>
            itemRepository.updateInDraft(draft.items[0].id, draft.id, userA, {
              description: "Changed",
            }),
          );
          await assert.rejects(() =>
            itemRepository.deleteFromDraft(draft.items[0].id, draft.id, userA),
          );
        } finally {
          await prisma.checklistVersionItem.deleteMany({ where: { checklistVersionId: draft.id } });
          await prisma.checklistVersion.delete({ where: { id: draft.id } });
        }
        assert.deepEqual(await platformRepository.findById(source.id), source);
      },
    );
    const copy = unwrap(await checklistService.useOfficialTemplate(source.id, userA));
    checklists.push(copy.id);
    const otherCopy = unwrap(await checklistService.useOfficialTemplate(source.id, userB));
    checklists.push(otherCopy.id);
    await t.test(
      "derivation is an independent user-owned draft with item lineage and NR metadata",
      async () => {
        assert.equal(copy.createdById, userA);
        assert.equal(copy.isOfficial, false);
        assert.equal(copy.isTemplate, false);
        assert.equal(copy.versions[0].createdById, userA);
        assert.equal(copy.versions[0].versionNumber, 1);
        assert.equal(copy.versions[0].status, "DRAFT");
        assert.equal(copy.versions[0].contentHash, null);
        assert.equal(copy.versions[0].items.length, 12);
        assert.equal(otherCopy.createdById, userB);
        assert.notEqual(otherCopy.id, copy.id);
        copy.versions[0].items.forEach((item, index) => {
          assert.notEqual(item.id, version.items[index].id);
          assert.equal(item.sourceVersionItemId, version.items[index].id);
          assert.equal(item.description, version.items[index].description);
          assert.deepEqual(
            item.standards.map(({ checklistVersionItemId: _id, ...rest }) => rest),
            version.items[index].standards.map(({ checklistVersionItemId: _id, ...rest }) => rest),
          );
        });
        unavailable(await checklistService.useOfficialTemplate(copy.id, userA));
      },
    );
    await t.test(
      "private copies remain inaccessible to the other user; owners retain checklist CRUD",
      async () => {
        unavailable(await checklistService.getChecklistById(copy.id, userB));
        unavailable(await checklistVersionService.listVersions(copy.id, userB));
        unavailable(await checklistItemService.listChecklistItems(copy.id, userB));
        unavailable(await checklistService.updateChecklist(copy.id, { title: "Foreign" }, userB));
        const foreignList = unwrap(await checklistService.listChecklists({}, userB));
        assert.equal(
          foreignList.items.some((item) => item.id === copy.id),
          false,
        );
        unwrap(
          await checklistService.updateChecklist(
            copy.id,
            { title: "Minha inspeção em obra" },
            userA,
          ),
        );
        unwrap(
          await checklistItemService.updateChecklistItem(copy.versions[0].items[0].id, {
            description: "Verificação personalizada",
            updatedById: userA,
          }),
        );
        const item = unwrap(
          await checklistItemService.createChecklistItem({
            checklistId: copy.id,
            description: "Item pessoal temporário",
            updatedById: userA,
          }),
        );
        unwrap(await checklistItemService.deleteChecklistItem(item.id, userA));
        const personal = unwrap(
          await checklistService.createChecklist({ title: "CRUD pessoal", createdById: userA }),
        );
        checklists.push(personal.id);
        unwrap(await checklistService.deleteChecklist(personal.id, userA));
      },
    );
    await t.test(
      "copies publish normally; direct official inspections keep their own historical snapshots",
      async () => {
        const publication = unwrap(await checklistVersionService.publishDraft(copy.id, userA));
        assert.equal(publication.publishedById, userA);
        const company = unwrap(
          await companyService.createCompany({
            corporateName: "Template validation",
            cnae: "0000-0/00",
            employeeCount: 1,
            riskLevel: 1,
            createdById: userA,
          }),
        );
        companyId = company.id;
        for (const checklistId of [source.id, copy.id]) {
          const inspection: InspectionWithRelations = unwrap(
            await inspectionService.createInspection({
              checklistId,
              companyId,
              userId: userA,
              inspectionDate: new Date(),
            }),
          );
          inspections.push(inspection.id);
          assert.equal(inspection.snapshot?.items.length, 12);
          assert.ok(inspection.snapshot);
          for (const item of inspection.snapshot.items) {
            unwrap(
              await inspectionResponseService.saveInspectionResponse({
                inspectionId: inspection.id,
                snapshotItemId: item.id,
                status: "COMPLIANT",
                userId: userA,
              }),
            );
          }
          unwrap(await inspectionResponseService.finishInspection(inspection.id, userA));
          assert.equal(
            unwrap(await inspectionService.getInspectionById(inspection.id, userA)).status,
            "COMPLETED",
          );
          assert.equal(
            (await reportService.getInspectionReport(inspection.id, userA)).success,
            true,
          );
        }
        unwrap(await checklistVersionService.retireVersion(copy.id, publication.id, userA));
        assert.equal(
          (await inspectionService.getInspectionById(inspections[1], userA)).success,
          true,
        );
      },
    );
    await t.test(
      "all source publications remain byte-for-byte unchanged after mutations and inspections",
      async () => {
        assert.deepEqual(await officialChecklistService.bootstrap(), before);
      },
    );
  } finally {
    if (inspections.length) {
      await prisma.inspectionResponse.deleteMany({ where: { inspectionId: { in: inspections } } });
      await prisma.inspectionSnapshotItemStandard.deleteMany({
        where: { snapshotItem: { snapshot: { inspectionId: { in: inspections } } } },
      });
      await prisma.inspectionSnapshotItem.deleteMany({
        where: { snapshot: { inspectionId: { in: inspections } } },
      });
      await prisma.inspectionChecklistSnapshot.deleteMany({
        where: { inspectionId: { in: inspections } },
      });
      await prisma.inspection.deleteMany({ where: { id: { in: inspections } } });
    }
    await prisma.checklistVersionItemStandard.deleteMany({
      where: { checklistVersionItem: { checklistVersion: { checklistId: { in: checklists } } } },
    });
    // Clear lineage between disposable versions, never source content.
    await prisma.checklistVersionItem.updateMany({
      where: { checklistVersion: { checklistId: { in: checklists } } },
      data: { sourceVersionItemId: null },
    });
    await prisma.checklistVersionItem.deleteMany({
      where: { checklistVersion: { checklistId: { in: checklists } } },
    });
    await prisma.checklistVersion.deleteMany({ where: { checklistId: { in: checklists } } });
    await prisma.checklist.deleteMany({ where: { id: { in: checklists } } });
    if (companyId) await prisma.company.delete({ where: { id: companyId } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.$disconnect();
  }
});
