import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { InspectionStatus, ResponseStatus } from "@/generated/prisma/client";
import { prisma } from "@/server/prisma/client";
import type { Result } from "@/server/responses";
import { inspectionResponseService } from "@/server/services/inspection-response.service";
import { inspectionService } from "@/server/services/inspection.service";
import { userService } from "@/server/services/user.service";

let inspectionId: string | null = null;

async function main(): Promise<void> {
  const user = unwrap(await userService.authenticate("admin@demo.com", "Admin@123"));
  const company = await prisma.company.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  const publishedVersion = await prisma.checklistVersion.findFirst({
    where: {
      status: "PUBLISHED",
      checklist: { isActive: true, deletedAt: null },
      items: { some: {} },
    },
    orderBy: [{ publishedAt: "desc" }, { versionNumber: "desc" }],
    include: { checklist: true },
  });

  if (!company || !publishedVersion) {
    throw new Error("An active company and a published checklist with items are required.");
  }

  const inspection = unwrap(
    await inspectionService.createInspection({
      userId: user.id,
      companyId: company.id,
      checklistId: publishedVersion.checklistId,
      checklistVersionId: publishedVersion.id,
      inspectionDate: new Date(),
      notes: "Validação temporária da sincronização offline.",
    }),
  );
  inspectionId = inspection.id;

  if (!inspection.snapshot || inspection.snapshot.items.length === 0) {
    throw new Error("The validation inspection did not receive its snapshot items.");
  }

  const firstItem = inspection.snapshot.items[0];
  const firstOperationId = randomUUID();
  const firstClientTime = new Date();
  const firstResponse = unwrap(
    await inspectionResponseService.saveInspectionResponse({
      inspectionId: inspection.id,
      snapshotItemId: firstItem.id,
      status: ResponseStatus.COMPLIANT,
      observation: "Resposta offline inicial.",
      offlineOperation: {
        id: firstOperationId,
        userId: user.id,
        clientCreatedAt: firstClientTime,
        expectedResponseUpdatedAt: null,
      },
    }),
  );

  const duplicateResponse = unwrap(
    await inspectionResponseService.saveInspectionResponse({
      inspectionId: inspection.id,
      snapshotItemId: firstItem.id,
      status: ResponseStatus.COMPLIANT,
      observation: "Resposta offline inicial.",
      offlineOperation: {
        id: firstOperationId,
        userId: user.id,
        clientCreatedAt: firstClientTime,
        expectedResponseUpdatedAt: null,
      },
    }),
  );
  assert.equal(duplicateResponse.id, firstResponse.id);
  assert.equal(duplicateResponse.clientUpdatedAt?.getTime(), firstClientTime.getTime());

  const divergentRetry = await inspectionResponseService.saveInspectionResponse({
    inspectionId: inspection.id,
    snapshotItemId: firstItem.id,
    status: ResponseStatus.NON_COMPLIANT,
    observation: "Mesmo ID com conteúdo divergente.",
    offlineOperation: {
      id: firstOperationId,
      userId: user.id,
      clientCreatedAt: firstClientTime,
      expectedResponseUpdatedAt: null,
    },
  });
  assert.equal(divergentRetry.success, false);
  if (divergentRetry.success) throw new Error("A divergent retry should fail.");
  assert.equal(divergentRetry.statusCode, 409);

  const nonCompliantOperationId = randomUUID();
  const nonCompliantResponse = unwrap(
    await inspectionResponseService.saveInspectionResponse({
      inspectionId: inspection.id,
      snapshotItemId: firstItem.id,
      status: ResponseStatus.NON_COMPLIANT,
      observation: "Não conformidade registrada durante trabalho offline.",
      offlineOperation: {
        id: nonCompliantOperationId,
        userId: user.id,
        clientCreatedAt: new Date(),
        expectedResponseUpdatedAt: firstResponse.updatedAt,
      },
    }),
  );
  assert.ok(nonCompliantResponse.nonConformity);

  const staleRevision = await inspectionResponseService.saveInspectionResponse({
    inspectionId: inspection.id,
    snapshotItemId: firstItem.id,
    status: ResponseStatus.COMPLIANT,
    offlineOperation: {
      id: randomUUID(),
      userId: user.id,
      clientCreatedAt: new Date(),
      expectedResponseUpdatedAt: firstResponse.updatedAt,
    },
  });
  assert.equal(staleRevision.success, false);
  if (staleRevision.success) throw new Error("A stale revision should fail.");
  assert.equal(staleRevision.statusCode, 409);

  for (const item of inspection.snapshot.items.slice(1)) {
    unwrap(
      await inspectionResponseService.saveInspectionResponse({
        inspectionId: inspection.id,
        snapshotItemId: item.id,
        status: ResponseStatus.COMPLIANT,
        offlineOperation: {
          id: randomUUID(),
          userId: user.id,
          clientCreatedAt: new Date(),
          expectedResponseUpdatedAt: null,
        },
      }),
    );
  }

  const finishOperationId = randomUUID();
  const finishClientTime = new Date();
  const completed = unwrap(
    await inspectionResponseService.finishInspection(inspection.id, {
      id: finishOperationId,
      userId: user.id,
      clientCreatedAt: finishClientTime,
    }),
  );
  const duplicateCompletion = unwrap(
    await inspectionResponseService.finishInspection(inspection.id, {
      id: finishOperationId,
      userId: user.id,
      clientCreatedAt: finishClientTime,
    }),
  );
  assert.equal(completed.status, InspectionStatus.COMPLETED);
  assert.equal(duplicateCompletion.id, completed.id);

  const operationCount = await prisma.offlineSyncOperation.count({
    where: { inspectionId: inspection.id },
  });
  assert.equal(operationCount, inspection.snapshot.items.length + 2);

  console.log(
    JSON.stringify({
      snapshotPreserved: completed.snapshot?.contentHash === inspection.snapshot.contentHash,
      responsePersistedWithClientTime: true,
      duplicateRetryIdempotent: true,
      divergentOperationRejected: true,
      staleRevisionRejected: true,
      localNonConformityRevalidatedByServer: true,
      completionRetryIdempotent: true,
      completedOperationCount: operationCount,
    }),
  );
}

function unwrap<TData>(result: Result<TData>): TData {
  if (!result.success) {
    throw new Error(`${result.code}: ${result.message}`);
  }

  return result.data;
}

async function cleanup(): Promise<void> {
  if (!inspectionId) return;

  const snapshot = await prisma.inspectionChecklistSnapshot.findUnique({
    where: { inspectionId },
  });

  await prisma.$transaction(async (transaction) => {
    await transaction.offlineSyncOperation.deleteMany({ where: { inspectionId } });
    await transaction.correctiveAction.deleteMany({
      where: { nonConformity: { inspectionResponse: { inspectionId } } },
    });
    await transaction.evidence.deleteMany({
      where: {
        OR: [{ inspectionId }, { nonConformity: { inspectionResponse: { inspectionId } } }],
      },
    });
    await transaction.nonConformity.deleteMany({
      where: { inspectionResponse: { inspectionId } },
    });
    await transaction.inspectionResponse.deleteMany({ where: { inspectionId } });

    if (snapshot) {
      await transaction.inspectionSnapshotItemStandard.deleteMany({
        where: { snapshotItem: { snapshotId: snapshot.id } },
      });
      await transaction.inspectionSnapshotItem.deleteMany({ where: { snapshotId: snapshot.id } });
      await transaction.inspectionChecklistSnapshot.delete({ where: { id: snapshot.id } });
    }

    await transaction.inspection.delete({ where: { id: inspectionId } });
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });
