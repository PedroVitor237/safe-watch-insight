import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import bcrypt from "bcrypt";

import { prisma } from "@/server/prisma/client";
import { evidenceRepository } from "@/server/repositories/evidence.repository";
import { inspectionRepository } from "@/server/repositories/inspection.repository";
import { nonConformityRepository } from "@/server/repositories/non-conformity.repository";
import type { Result } from "@/server/responses";
import { EvidenceService, type EvidenceFileInput } from "@/server/services/evidence.service";
import { nonConformityService } from "@/server/services/non-conformity.service";
import type {
  StorageService,
  StorageUploadInput,
  StoredFileMetadata,
} from "@/server/storage/storage.service";

interface FixtureIds {
  userAId?: string;
  userBId?: string;
  companyId?: string;
  checklistId?: string;
  checklistVersionId?: string;
  versionItemId?: string;
  inspectionId?: string;
  snapshotId?: string;
  snapshotItemId?: string;
  responseId?: string;
  nonConformityId?: string;
}

class ValidationStorageService implements StorageService {
  uploadInputs: StorageUploadInput[] = [];
  removedPublicIds: string[] = [];

  upload(input: StorageUploadInput): Promise<StoredFileMetadata> {
    this.uploadInputs.push(input);

    return Promise.resolve({
      publicId: `validation/evidence/${input.key}`,
      storageUrl: `https://validation.invalid/evidence/${input.key}.png`,
      fileSize: input.bytes.byteLength,
      width: 1,
      height: 1,
    });
  }

  remove(publicId: string): Promise<void> {
    this.removedPublicIds.push(publicId);
    return Promise.resolve();
  }
}

const fixtureIds: FixtureIds = {};
const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function createPngFile(): EvidenceFileInput {
  const bytes = new Uint8Array(PNG_SIGNATURE);

  return {
    name: "authorization-validation.png",
    type: "image/png",
    size: bytes.byteLength,
    arrayBuffer: () => Promise.resolve(bytes.buffer),
  };
}

async function main(): Promise<void> {
  const suffix = randomUUID();
  const passwordHash = await bcrypt.hash(randomUUID(), 4);
  const userA = await prisma.user.create({
    data: {
      name: "Evidence authorization owner",
      email: `evidence-owner-${suffix}@validation.invalid`,
      password: passwordHash,
      role: "TECHNICIAN",
    },
  });
  fixtureIds.userAId = userA.id;

  const userB = await prisma.user.create({
    data: {
      name: "Evidence authorization foreign user",
      email: `evidence-foreign-${suffix}@validation.invalid`,
      password: passwordHash,
      role: "TECHNICIAN",
    },
  });
  fixtureIds.userBId = userB.id;

  const company = await prisma.company.create({
    data: {
      corporateName: `Evidence authorization validation ${suffix}`,
      cnae: "0000-0/00",
      riskLevel: 1,
      employeeCount: 1,
      createdById: userA.id,
    },
  });
  fixtureIds.companyId = company.id;

  const checklist = await prisma.checklist.create({
    data: {
      title: `Evidence authorization validation ${suffix}`,
      createdById: userA.id,
    },
  });
  fixtureIds.checklistId = checklist.id;

  const checklistVersion = await prisma.checklistVersion.create({
    data: {
      checklistId: checklist.id,
      versionNumber: 1,
      status: "PUBLISHED",
      title: checklist.title,
      contentHash: "0".repeat(64),
      createdById: userA.id,
      publishedById: userA.id,
      publishedAt: new Date(),
    },
  });
  fixtureIds.checklistVersionId = checklistVersion.id;

  const versionItem = await prisma.checklistVersionItem.create({
    data: {
      checklistVersionId: checklistVersion.id,
      description: "Evidence authorization validation item",
      orderIndex: 1,
    },
  });
  fixtureIds.versionItemId = versionItem.id;

  const inspection = await prisma.inspection.create({
    data: {
      userId: userA.id,
      companyId: company.id,
      checklistId: checklist.id,
      checklistVersionId: checklistVersion.id,
      inspectionDate: new Date(),
    },
  });
  fixtureIds.inspectionId = inspection.id;

  const snapshot = await prisma.inspectionChecklistSnapshot.create({
    data: {
      inspectionId: inspection.id,
      sourceChecklistId: checklist.id,
      sourceChecklistVersionId: checklistVersion.id,
      sourceVersionNumber: 1,
      title: checklist.title,
      isTemplate: false,
      contentHash: "0".repeat(64),
      origin: "INSPECTION_CREATION",
      integrityStatus: "VERIFIED",
    },
  });
  fixtureIds.snapshotId = snapshot.id;

  const snapshotItem = await prisma.inspectionSnapshotItem.create({
    data: {
      snapshotId: snapshot.id,
      sourceVersionItemId: versionItem.id,
      description: versionItem.description,
      orderIndex: 1,
    },
  });
  fixtureIds.snapshotItemId = snapshotItem.id;

  const response = await prisma.inspectionResponse.create({
    data: {
      inspectionId: inspection.id,
      snapshotItemId: snapshotItem.id,
      status: "NON_COMPLIANT",
    },
  });
  fixtureIds.responseId = response.id;

  const nonConformity = await prisma.nonConformity.create({
    data: {
      inspectionResponseId: response.id,
      description: "Evidence authorization validation NC",
      severity: "MEDIUM",
    },
  });
  fixtureIds.nonConformityId = nonConformity.id;

  const storage = new ValidationStorageService();
  const service = new EvidenceService(
    evidenceRepository,
    inspectionRepository,
    nonConformityRepository,
    storage,
  );

  const inspectionEvidence = unwrap(
    await service.uploadEvidence({ inspectionId: inspection.id, file: createPngFile() }, userA.id),
  );
  const uploadsAfterOwnedInspection = storage.uploadInputs.length;
  assertNotFound(
    await service.uploadEvidence({ inspectionId: inspection.id, file: createPngFile() }, userB.id),
  );
  assert.equal(storage.uploadInputs.length, uploadsAfterOwnedInspection);
  const rejectedRepositoryEvidenceId = randomUUID();
  const rejectedRepositoryCreate = await evidenceRepository.createOwnedEvidence(
    {
      id: rejectedRepositoryEvidenceId,
      inspectionId: inspection.id,
      publicId: `validation/rejected/${rejectedRepositoryEvidenceId}`,
      storageUrl: `https://validation.invalid/rejected/${rejectedRepositoryEvidenceId}.png`,
      fileName: "rejected.png",
      mimeType: "image/png",
      fileSize: BigInt(PNG_SIGNATURE.byteLength),
      width: 1,
      height: 1,
      caption: null,
    },
    userB.id,
  );
  assert.equal(rejectedRepositoryCreate, null);
  assert.equal(await prisma.evidence.count({ where: { id: rejectedRepositoryEvidenceId } }), 0);

  const nonConformityEvidence = unwrap(
    await service.uploadEvidence(
      { nonConformityId: nonConformity.id, file: createPngFile() },
      userA.id,
    ),
  );
  const uploadsAfterOwnedNonConformity = storage.uploadInputs.length;
  assertNotFound(
    await service.uploadEvidence(
      { nonConformityId: nonConformity.id, file: createPngFile() },
      userB.id,
    ),
  );
  assert.equal(storage.uploadInputs.length, uploadsAfterOwnedNonConformity);

  const ownedInspectionEvidence = unwrap(
    await service.listEvidence({ inspectionId: inspection.id }, userA.id),
  );
  assert.deepEqual(
    ownedInspectionEvidence.map((evidence) => evidence.id),
    [inspectionEvidence.id],
  );
  assertNotFound(await service.listEvidence({ inspectionId: inspection.id }, userB.id));
  assert.deepEqual(
    await evidenceRepository.listActiveOwned({ inspectionId: inspection.id }, userB.id),
    [],
  );
  assert.equal(await evidenceRepository.findActiveOwnedById(inspectionEvidence.id, userB.id), null);

  const removalsBeforeForeignAttempt = storage.removedPublicIds.length;
  assertNotFound(await service.removeEvidence(inspectionEvidence.id, userB.id));
  assert.equal(await evidenceRepository.softDeleteOwned(inspectionEvidence.id, userB.id), null);
  assert.equal(storage.removedPublicIds.length, removalsBeforeForeignAttempt);
  assert.equal(
    (
      await prisma.evidence.findUniqueOrThrow({
        where: { id: inspectionEvidence.id },
        select: { deletedAt: true },
      })
    ).deletedAt,
    null,
  );

  unwrap(await service.removeEvidence(inspectionEvidence.id, userA.id));
  assert.equal(await evidenceRepository.restoreOwned(inspectionEvidence.id, userB.id), null);
  assert.equal(storage.removedPublicIds.length, removalsBeforeForeignAttempt + 1);
  assert.notEqual(
    (
      await prisma.evidence.findUniqueOrThrow({
        where: { id: inspectionEvidence.id },
        select: { deletedAt: true },
      })
    ).deletedAt,
    null,
  );

  const ownedNonConformity = unwrap(
    await nonConformityService.getNonConformityById(nonConformity.id, userA.id),
  );
  assert.deepEqual(
    ownedNonConformity.evidence.map((evidence) => evidence.id),
    [nonConformityEvidence.id],
  );
  assertNotFound(await nonConformityService.getNonConformityById(nonConformity.id, userB.id));

  const ownedNonConformities = unwrap(await nonConformityService.listNonConformities({}, userA.id));
  assert.deepEqual(
    ownedNonConformities.items.flatMap((item) => item.evidence.map((evidence) => evidence.id)),
    [nonConformityEvidence.id],
  );
  const foreignNonConformities = unwrap(
    await nonConformityService.listNonConformities({}, userB.id),
  );
  assert.equal(foreignNonConformities.totalItems, 0);

  const missingEvidenceResult = await service.removeEvidence(randomUUID(), userA.id);
  const foreignEvidenceResult = await service.removeEvidence(nonConformityEvidence.id, userB.id);
  assertNotFound(missingEvidenceResult);
  assertNotFound(foreignEvidenceResult);
  if (!missingEvidenceResult.success && !foreignEvidenceResult.success) {
    assert.deepEqual(
      {
        code: foreignEvidenceResult.code,
        statusCode: foreignEvidenceResult.statusCode,
        message: foreignEvidenceResult.message,
      },
      {
        code: missingEvidenceResult.code,
        statusCode: missingEvidenceResult.statusCode,
        message: missingEvidenceResult.message,
      },
    );
  }

  console.log(
    JSON.stringify(
      {
        validation: "Evidence ownership authorization validation passed",
        inspectionOwnershipPath: true,
        nonConformityOwnershipPath: true,
        repositoryPredicatesExercised: true,
        foreignUploadBlockedBeforeStorage: true,
        foreignListingBlocked: true,
        foreignRemovalBlockedBeforeStorageAndMutation: true,
        ownedRemovalSoftDeletedMetadata: true,
        indirectNonConformityExposureBlocked: true,
        notFoundSemanticsEquivalent: true,
      },
      null,
      2,
    ),
  );
}

function unwrap<TData>(result: Result<TData>): TData {
  if (!result.success) {
    throw new Error(`${result.code}: ${result.message}`);
  }

  return result.data;
}

function assertNotFound(result: Result<unknown>): void {
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.code, "NOT_FOUND");
    assert.equal(result.statusCode, 404);
  }
}

async function cleanup(): Promise<void> {
  if (fixtureIds.inspectionId) {
    await prisma.evidence.deleteMany({ where: { inspectionId: fixtureIds.inspectionId } });
  }
  if (fixtureIds.nonConformityId) {
    await prisma.evidence.deleteMany({
      where: { nonConformityId: fixtureIds.nonConformityId },
    });
    await prisma.nonConformity.deleteMany({ where: { id: fixtureIds.nonConformityId } });
  }
  if (fixtureIds.responseId) {
    await prisma.inspectionResponse.deleteMany({ where: { id: fixtureIds.responseId } });
  }
  if (fixtureIds.snapshotItemId) {
    await prisma.inspectionSnapshotItem.deleteMany({ where: { id: fixtureIds.snapshotItemId } });
  }
  if (fixtureIds.snapshotId) {
    await prisma.inspectionChecklistSnapshot.deleteMany({ where: { id: fixtureIds.snapshotId } });
  }
  if (fixtureIds.inspectionId) {
    await prisma.inspection.deleteMany({ where: { id: fixtureIds.inspectionId } });
  }
  if (fixtureIds.versionItemId) {
    await prisma.checklistVersionItem.deleteMany({ where: { id: fixtureIds.versionItemId } });
  }
  if (fixtureIds.checklistVersionId) {
    await prisma.checklistVersion.deleteMany({ where: { id: fixtureIds.checklistVersionId } });
  }
  if (fixtureIds.checklistId) {
    await prisma.checklist.deleteMany({ where: { id: fixtureIds.checklistId } });
  }
  if (fixtureIds.companyId) {
    await prisma.company.deleteMany({ where: { id: fixtureIds.companyId } });
  }
  if (fixtureIds.userAId || fixtureIds.userBId) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [fixtureIds.userAId, fixtureIds.userBId].filter(
            (id): id is string => typeof id === "string",
          ),
        },
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Evidence validation failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });
