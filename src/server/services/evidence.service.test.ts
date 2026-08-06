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
  softDeleted = false;
  restored = false;
  failOnCreate = false;
  evidence: Evidence | null = createEvidence();

  createEvidence(input: CreateEvidencePersistenceInput): Promise<Evidence> {
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

  findActiveById(): Promise<Evidence | null> {
    return Promise.resolve(this.evidence);
  }

  listActive(_target: EvidencePersistenceTarget): Promise<Evidence[]> {
    return Promise.resolve(this.evidence ? [this.evidence] : []);
  }

  softDelete(): Promise<Evidence> {
    this.softDeleted = true;
    return Promise.resolve(createEvidence({ deletedAt: new Date("2026-08-06T12:10:00.000Z") }));
  }

  restore(): Promise<Evidence> {
    this.restored = true;
    return Promise.resolve(createEvidence());
  }
}

class FakeInspectionContextRepository {
  context: InspectionEvidenceContext | null = {
    id: INSPECTION_ID,
    snapshot: { id: SNAPSHOT_ID },
  };

  findEvidenceContextById(): Promise<InspectionEvidenceContext | null> {
    return Promise.resolve(this.context);
  }
}

class FakeNonConformityContextRepository {
  context: NonConformityEvidenceContext | null = {
    id: NON_CONFORMITY_ID,
    inspectionResponse: {
      snapshotItemId: SNAPSHOT_ITEM_ID,
      inspection: {
        snapshot: { id: SNAPSHOT_ID },
      },
    },
  };

  findEvidenceContextById(): Promise<NonConformityEvidenceContext | null> {
    return Promise.resolve(this.context);
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
  const result = await service.uploadEvidence({
    inspectionId: INSPECTION_ID,
    file: createPngFile(),
    caption: "  Extintor da entrada  ",
  });

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
  const result = await service.uploadEvidence({
    inspectionId: INSPECTION_ID,
    file: createPngFile(new Uint8Array([0x00, 0x01, 0x02, 0x03])),
  });

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "VALIDATION_ERROR");
  assert.equal(storage.uploadInput, null);
});

test("rejects an inspection without its immutable snapshot", async () => {
  const { service, inspectionRepository, storage } = createService();
  inspectionRepository.context = { id: INSPECTION_ID, snapshot: null };
  const result = await service.uploadEvidence({
    inspectionId: INSPECTION_ID,
    file: createPngFile(),
  });

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
  const result = await service.uploadEvidence({
    nonConformityId: NON_CONFORMITY_ID,
    file: createPngFile(),
  });

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "CONFLICT");
  assert.equal(storage.uploadInput, null);
});

test("removes the uploaded provider file when metadata persistence fails", async () => {
  const { service, repository, storage } = createService();
  repository.failOnCreate = true;
  const result = await service.uploadEvidence({
    inspectionId: INSPECTION_ID,
    file: createPngFile(),
  });

  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "INTERNAL_SERVER_ERROR");
  assert.equal(storage.removedPublicIds.length, 1);
});

test("restores soft-deleted metadata when provider removal fails", async () => {
  const { service, repository, storage } = createService();
  storage.failOnRemove = true;
  const result = await service.removeEvidence(EVIDENCE_ID);

  assert.equal(repository.softDeleted, true);
  assert.equal(repository.restored, true);
  assert.equal(result.success, false);
  assert.equal(!result.success && result.code, "STORAGE_ERROR");
});
