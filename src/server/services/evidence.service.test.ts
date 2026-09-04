import "dotenv/config";

import assert from "node:assert/strict";
import test from "node:test";

import type { Evidence } from "@/generated/prisma/client";
import { StorageError } from "@/server/errors";
import type {
  CreateEvidencePersistenceInput,
  EvidencePersistenceTarget,
} from "@/server/repositories/evidence.repository";
import type { InspectionEvidenceContext } from "@/server/repositories/inspection.repository";
import type { NonConformityEvidenceContext } from "@/server/repositories/non-conformity.repository";
import type {
  StorageService,
  StorageUploadInput,
  StoredFileMetadata,
} from "@/server/storage/storage.service";

import { EvidenceService, type EvidenceFileInput } from "./evidence.service";

const INSPECTION_ID = "11111111-1111-4111-8111-111111111111";
const NON_CONFORMITY_ID = "22222222-2222-4222-8222-222222222222";
const EVIDENCE_ID = "33333333-3333-4333-8333-333333333333";
const SNAPSHOT_ID = "44444444-4444-4444-8444-444444444444";
const SNAPSHOT_ITEM_ID = "55555555-5555-4555-8555-555555555555";
const USER_A_ID = "66666666-6666-4666-8666-666666666661";
const USER_B_ID = "66666666-6666-4666-8666-666666666662";

function createPngFile(
  bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
): EvidenceFileInput {
  const copiedBytes = new Uint8Array(bytes);

  return {
    name: "extintor.png",
    type: "image/png",
    size: copiedBytes.byteLength,
    arrayBuffer: () => Promise.resolve(copiedBytes.buffer),
  };
}

function createEvidence(overrides: Partial<Evidence> = {}): Evidence {
  const now = new Date("2026-08-06T12:00:00.000Z");

  return {
    id: EVIDENCE_ID,
    inspectionId: INSPECTION_ID,
    nonConformityId: null,
    publicId: `safe-watch-insight/evidence/${EVIDENCE_ID}`,
    storageUrl: "https://res.cloudinary.com/demo/image/upload/evidence.png",
    fileName: "extintor.png",
    mimeType: "image/png",
    fileSize: 8n,
    width: 640,
    height: 480,
    caption: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

class FakeEvidenceRepository {
  createdInput: CreateEvidencePersistenceInput | null = null;
  requestedUserIds: string[] = [];
  listCalled = false;
  softDeleted = false;
  restored = false;
  failOnCreate = false;
  evidence: Evidence | null = createEvidence();
  ownerUserId = USER_A_ID;

  createOwnedEvidence(
    input: CreateEvidencePersistenceInput,
    userId: string,
  ): Promise<Evidence | null> {
    this.requestedUserIds.push(userId);

    if (userId !== this.ownerUserId) {
      return Promise.resolve(null);
    }

    this.createdInput = input;

    if (this.failOnCreate) {
      return Promise.reject(new Error("Database unavailable"));
    }

    return Promise.resolve(
      createEvidence({
        id: input.id,
        inspectionId: input.inspectionId ?? null,
        nonConformityId: input.nonConformityId ?? null,
        publicId: input.publicId,
        storageUrl: input.storageUrl,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        width: input.width,
        height: input.height,
        caption: input.caption,
      }),
    );
  }

  findActiveOwnedById(_id: string, userId: string): Promise<Evidence | null> {
    this.requestedUserIds.push(userId);
    return Promise.resolve(userId === this.ownerUserId ? this.evidence : null);
  }

  listActiveOwned(_target: EvidencePersistenceTarget, userId: string): Promise<Evidence[]> {
    this.requestedUserIds.push(userId);
    this.listCalled = true;
    return Promise.resolve(userId === this.ownerUserId && this.evidence ? [this.evidence] : []);
  }

  softDeleteOwned(_id: string, userId: string): Promise<Evidence | null> {
    this.requestedUserIds.push(userId);

    if (userId !== this.ownerUserId) {
      return Promise.resolve(null);
    }

    this.softDeleted = true;
    return Promise.resolve(createEvidence({ deletedAt: new Date("2026-08-06T12:10:00.000Z") }));
  }

  restoreOwned(_id: string, userId: string): Promise<Evidence | null> {
    this.requestedUserIds.push(userId);

    if (userId !== this.ownerUserId) {
      return Promise.resolve(null);
    }

    this.restored = true;
    return Promise.resolve(createEvidence());
  }
}

class FakeInspectionContextRepository {
  requestedUserIds: string[] = [];
  ownerUserId = USER_A_ID;
  context: InspectionEvidenceContext | null = {
    id: INSPECTION_ID,
    snapshot: { id: SNAPSHOT_ID },
  };

  findOwnedEvidenceContextById(
    _id: string,
    userId: string,
  ): Promise<InspectionEvidenceContext | null> {
    this.requestedUserIds.push(userId);
    return Promise.resolve(userId === this.ownerUserId ? this.context : null);
  }
}

class FakeNonConformityContextRepository {
  requestedUserIds: string[] = [];
  ownerUserId = USER_A_ID;
  context: NonConformityEvidenceContext | null = {
    id: NON_CONFORMITY_ID,
    inspectionResponse: {
      snapshotItemId: SNAPSHOT_ITEM_ID,
      inspection: {
        snapshot: { id: SNAPSHOT_ID },
      },
    },
  };

  findOwnedEvidenceContextById(
    _id: string,
    userId: string,
  ): Promise<NonConformityEvidenceContext | null> {
    this.requestedUserIds.push(userId);
    return Promise.resolve(userId === this.ownerUserId ? this.context : null);
  }
}

class FakeStorageService implements StorageService {
  uploadInput: StorageUploadInput | null = null;
  removedPublicIds: string[] = [];
  failOnRemove = false;

  upload(input: StorageUploadInput): Promise<StoredFileMetadata> {
    this.uploadInput = input;

    return Promise.resolve({
      publicId: `safe-watch-insight/evidence/${input.key}`,
      storageUrl: "https://res.cloudinary.com/demo/image/upload/evidence.png",
      fileSize: input.bytes.byteLength,
      width: 640,
      height: 480,
    });
  }

  remove(publicId: string): Promise<void> {
    this.removedPublicIds.push(publicId);

    return this.failOnRemove
      ? Promise.reject(new StorageError("Storage removal failed."))
      : Promise.resolve();
  }
}

function createService() {
  const repository = new FakeEvidenceRepository();
  const inspectionRepository = new FakeInspectionContextRepository();
  const nonConformityRepository = new FakeNonConformityContextRepository();
  const storage = new FakeStorageService();
  const service = new EvidenceService(
    repository,
    inspectionRepository,
    nonConformityRepository,
    storage,
  );

  return { service, repository, inspectionRepository, nonConformityRepository, storage };
}

test("uploads valid image bytes and persists only metadata in an inspection snapshot context", async () => {
  const { service, repository, storage } = createService();
  const result = await service.uploadEvidence(
    {
      inspectionId: INSPECTION_ID,
      file: createPngFile(),
      caption: "  Extintor da entrada  ",
    },
    USER_A_ID,
  );

  assert.equal(result.success, true);
  assert.equal(storage.uploadInput?.mimeType, "image/png");
  assert.equal(repository.createdInput?.inspectionId, INSPECTION_ID);
  assert.equal(repository.createdInput?.nonConformityId, undefined);
  assert.equal(repository.createdInput?.caption, "Extintor da entrada");
  assert.equal(repository.createdInput?.fileSize, 8n);
  assert.equal(result.success && result.data.fileSize, 8);
});

test("rejects spoofed image content before calling storage", async () => {
  const { service, storage } = createService();
  const result = await service.uploadEvidence(
    {
      inspectionId: INSPECTION_ID,
      file: createPngFile(new Uint8Array([0x00, 0x01, 0x02, 0x03])),
    },
    USER_A_ID,
  );

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "VALIDATION_ERROR");
  assert.equal(storage.uploadInput, null);
});

test("rejects an inspection without its immutable snapshot", async () => {
  const { service, inspectionRepository, storage } = createService();
  inspectionRepository.context = { id: INSPECTION_ID, snapshot: null };
  const result = await service.uploadEvidence(
    {
      inspectionId: INSPECTION_ID,
      file: createPngFile(),
    },
    USER_A_ID,
  );

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "CONFLICT");
  assert.equal(storage.uploadInput, null);
});

test("rejects a non-conformity that is not linked to a snapshot item", async () => {
  const { service, nonConformityRepository, storage } = createService();
  nonConformityRepository.context = {
    id: NON_CONFORMITY_ID,
    inspectionResponse: {
      snapshotItemId: null,
      inspection: { snapshot: { id: SNAPSHOT_ID } },
    },
  };
  const result = await service.uploadEvidence(
    {
      nonConformityId: NON_CONFORMITY_ID,
      file: createPngFile(),
    },
    USER_A_ID,
  );

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "CONFLICT");
  assert.equal(storage.uploadInput, null);
});

test("removes the uploaded provider file when metadata persistence fails", async () => {
  const { service, repository, storage } = createService();
  repository.failOnCreate = true;
  const result = await service.uploadEvidence(
    {
      inspectionId: INSPECTION_ID,
      file: createPngFile(),
    },
    USER_A_ID,
  );

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "INTERNAL_SERVER_ERROR");
  assert.equal(storage.removedPublicIds.length, 1);
});

test("restores soft-deleted metadata when provider removal fails", async () => {
  const { service, repository, storage } = createService();
  storage.failOnRemove = true;
  const result = await service.removeEvidence(EVIDENCE_ID, USER_A_ID);

  assert.equal(repository.softDeleted, true);
  assert.equal(repository.restored, true);
  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "STORAGE_ERROR");
});

test("uploads evidence to an owned non-conformity historical context", async () => {
  const { service, repository, nonConformityRepository, storage } = createService();
  const result = await service.uploadEvidence(
    {
      nonConformityId: NON_CONFORMITY_ID,
      file: createPngFile(),
    },
    USER_A_ID,
  );

  assert.equal(result.success, true);
  assert.equal(repository.createdInput?.nonConformityId, NON_CONFORMITY_ID);
  assert.equal(storage.uploadInput !== null, true);
  assert.deepEqual(nonConformityRepository.requestedUserIds, [USER_A_ID]);
});

test("rejects a cross-user inspection upload before storage or persistence", async () => {
  const { service, repository, storage } = createService();
  const result = await service.uploadEvidence(
    {
      inspectionId: INSPECTION_ID,
      file: createPngFile(),
    },
    USER_B_ID,
  );

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "NOT_FOUND");
  assert.equal(!result.success && result.statusCode, 404);
  assert.equal(storage.uploadInput, null);
  assert.equal(repository.createdInput, null);
});

test("rejects a cross-user non-conformity upload before storage or persistence", async () => {
  const { service, repository, storage } = createService();
  const result = await service.uploadEvidence(
    {
      nonConformityId: NON_CONFORMITY_ID,
      file: createPngFile(),
    },
    USER_B_ID,
  );

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "NOT_FOUND");
  assert.equal(storage.uploadInput, null);
  assert.equal(repository.createdInput, null);
});

test("lists only active evidence from an owned inspection", async () => {
  const { service, repository, inspectionRepository } = createService();
  const result = await service.listEvidence({ inspectionId: INSPECTION_ID }, USER_A_ID);

  assert.equal(result.success, true);
  assert.equal(result.success && result.data.length, 1);
  assert.equal(repository.listCalled, true);
  assert.deepEqual(inspectionRepository.requestedUserIds, [USER_A_ID]);
  assert.deepEqual(repository.requestedUserIds, [USER_A_ID]);
});

test("does not list evidence from another user's inspection", async () => {
  const { service, repository } = createService();
  const result = await service.listEvidence({ inspectionId: INSPECTION_ID }, USER_B_ID);

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "NOT_FOUND");
  assert.equal(repository.listCalled, false);
});

test("removes owned evidence through ownership-scoped metadata operations", async () => {
  const { service, repository, storage } = createService();
  const result = await service.removeEvidence(EVIDENCE_ID, USER_A_ID);

  assert.equal(result.success, true);
  assert.equal(repository.softDeleted, true);
  assert.equal(repository.restored, false);
  assert.deepEqual(storage.removedPublicIds, [createEvidence().publicId]);
  assert.deepEqual(repository.requestedUserIds, [USER_A_ID, USER_A_ID]);
});

test("rejects cross-user evidence removal without storage or metadata mutation", async () => {
  const { service, repository, storage } = createService();
  const result = await service.removeEvidence(EVIDENCE_ID, USER_B_ID);

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "NOT_FOUND");
  assert.equal(!result.success && result.statusCode, 404);
  assert.equal(repository.softDeleted, false);
  assert.equal(repository.restored, false);
  assert.deepEqual(storage.removedPublicIds, []);
  assert.equal(repository.evidence?.deletedAt, null);
});

test("uses indistinguishable not-found semantics for foreign and missing evidence", async () => {
  const foreign = createService();
  const missing = createService();
  missing.repository.evidence = null;

  const foreignResult = await foreign.service.removeEvidence(EVIDENCE_ID, USER_B_ID);
  const missingResult = await missing.service.removeEvidence(EVIDENCE_ID, USER_A_ID);

  assert.equal(foreignResult.success, false);
  assert.equal(missingResult.success, false);
  if (!foreignResult.success && !missingResult.success) {
    assert.deepEqual(
      {
        code: foreignResult.code,
        statusCode: foreignResult.statusCode,
        message: foreignResult.message,
      },
      {
        code: missingResult.code,
        statusCode: missingResult.statusCode,
        message: missingResult.message,
      },
    );
  }
});
