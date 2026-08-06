import { randomUUID } from "node:crypto";

import type { Evidence } from "@/generated/prisma/client";
import { MAX_EVIDENCE_FILE_SIZE, SUPPORTED_EVIDENCE_MIME_TYPES } from "@/lib/evidence";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import {
  evidenceRepository,
  type CreateEvidencePersistenceInput,
  type EvidencePersistenceTarget,
} from "@/server/repositories/evidence.repository";
import {
  inspectionRepository,
  type InspectionEvidenceContext,
} from "@/server/repositories/inspection.repository";
import {
  nonConformityRepository,
  type NonConformityEvidenceContext,
} from "@/server/repositories/non-conformity.repository";
import type { Result } from "@/server/responses";
import { resultFromError, success } from "@/server/responses";
import { cloudinaryStorageService } from "@/server/storage/cloudinary-storage.service.server";
import type { StorageService } from "@/server/storage/storage.service";

export interface EvidenceFileInput {
  name: string;
  type: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface CreateEvidenceInput extends EvidencePersistenceTarget {
  caption?: string;
  file: EvidenceFileInput;
}

export interface EvidenceDto {
  id: string;
  inspectionId: string | null;
  nonConformityId: string | null;
  storageUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EvidenceRepositoryPort {
  createEvidence(input: CreateEvidencePersistenceInput): Promise<Evidence>;
  findActiveById(id: string): Promise<Evidence | null>;
  listActive(target: EvidencePersistenceTarget): Promise<Evidence[]>;
  softDelete(id: string): Promise<Evidence>;
  restore(id: string): Promise<Evidence>;
}

interface InspectionContextRepositoryPort {
  findEvidenceContextById(id: string): Promise<InspectionEvidenceContext | null>;
}

interface NonConformityContextRepositoryPort {
  findEvidenceContextById(id: string): Promise<NonConformityEvidenceContext | null>;
}

const FILE_SIGNATURES: Record<(typeof SUPPORTED_EVIDENCE_MIME_TYPES)[number], number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

function hasPrefix(bytes: Uint8Array, prefix: number[]): boolean {
  return prefix.every((value, index) => bytes[index] === value);
}

function hasValidImageSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (!SUPPORTED_EVIDENCE_MIME_TYPES.includes(mimeType as keyof typeof FILE_SIGNATURES)) {
    return false;
  }

  const supportedMimeType = mimeType as keyof typeof FILE_SIGNATURES;

  if (!hasPrefix(bytes, FILE_SIGNATURES[supportedMimeType])) {
    return false;
  }

  return (
    supportedMimeType !== "image/webp" || String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

function normalizeFileName(fileName: string): string {
  return fileName.split(/[\\/]/).pop()?.trim() ?? "";
}

function toEvidenceDto(evidence: Evidence): EvidenceDto {
  return {
    id: evidence.id,
    inspectionId: evidence.inspectionId,
    nonConformityId: evidence.nonConformityId,
    storageUrl: evidence.storageUrl,
    fileName: evidence.fileName,
    mimeType: evidence.mimeType,
    fileSize: Number(evidence.fileSize),
    width: evidence.width,
    height: evidence.height,
    caption: evidence.caption,
    createdAt: evidence.createdAt,
    updatedAt: evidence.updatedAt,
  };
}

export class EvidenceService {
  constructor(
    private readonly repository: EvidenceRepositoryPort = evidenceRepository,
    private readonly inspectionContextRepository: InspectionContextRepositoryPort = inspectionRepository,
    private readonly nonConformityContextRepository: NonConformityContextRepositoryPort = nonConformityRepository,
    private readonly storageService: StorageService = cloudinaryStorageService,
  ) {}

  async uploadEvidence(input: CreateEvidenceInput): Promise<Result<EvidenceDto>> {
    try {
      const target = this.normalizeTarget(input);
      await this.ensureHistoricalContext(target);

      const fileName = normalizeFileName(input.file.name);
      const bytes = new Uint8Array(await input.file.arrayBuffer());
      this.validateFile(input.file, fileName, bytes);

      const evidenceId = randomUUID();
      const storedFile = await this.storageService.upload({
        key: evidenceId,
        bytes,
        fileName,
        mimeType: input.file.type,
      });

      try {
        const evidence = await this.repository.createEvidence({
          id: evidenceId,
          ...target,
          publicId: storedFile.publicId,
          storageUrl: storedFile.storageUrl,
          fileName,
          mimeType: input.file.type,
          fileSize: BigInt(storedFile.fileSize),
          width: storedFile.width,
          height: storedFile.height,
          caption: input.caption?.trim() || null,
        });

        return success(toEvidenceDto(evidence), "Evidence uploaded.");
      } catch (error) {
        await this.removeStoredFileAfterPersistenceFailure(storedFile.publicId);
        throw error;
      }
    } catch (error) {
      return resultFromError(error);
    }
  }

  async listEvidence(target: EvidencePersistenceTarget): Promise<Result<EvidenceDto[]>> {
    try {
      const normalizedTarget = this.normalizeTarget(target);
      await this.ensureHistoricalContext(normalizedTarget);
      const evidence = await this.repository.listActive(normalizedTarget);

      return success(evidence.map(toEvidenceDto));
    } catch (error) {
      return resultFromError(error);
    }
  }

  async removeEvidence(id: string): Promise<Result<EvidenceDto>> {
    try {
      const evidence = await this.repository.findActiveById(id);

      if (!evidence) {
        throw new NotFoundError("Evidence not found.");
      }

      const archivedEvidence = await this.repository.softDelete(id);

      try {
        await this.storageService.remove(evidence.publicId);
      } catch (error) {
        await this.repository.restore(id);
        throw error;
      }

      return success(toEvidenceDto(archivedEvidence), "Evidence removed.");
    } catch (error) {
      return resultFromError(error);
    }
  }

  private normalizeTarget(target: EvidencePersistenceTarget): EvidencePersistenceTarget {
    const hasInspection = typeof target.inspectionId === "string";
    const hasNonConformity = typeof target.nonConformityId === "string";

    if (Number(hasInspection) + Number(hasNonConformity) !== 1) {
      throw new ValidationError("Evidence must belong to exactly one historical context.", [
        {
          field: "inspectionId",
          message: "Provide exactly one inspectionId or nonConformityId.",
        },
      ]);
    }

    return hasInspection
      ? { inspectionId: target.inspectionId }
      : { nonConformityId: target.nonConformityId };
  }

  private async ensureHistoricalContext(target: EvidencePersistenceTarget): Promise<void> {
    if (target.inspectionId) {
      const inspection = await this.inspectionContextRepository.findEvidenceContextById(
        target.inspectionId,
      );

      if (!inspection) {
        throw new NotFoundError("Inspection not found.");
      }

      if (!inspection.snapshot) {
        throw new ConflictError("Evidence requires an immutable inspection snapshot.");
      }

      return;
    }

    const nonConformity = await this.nonConformityContextRepository.findEvidenceContextById(
      target.nonConformityId as string,
    );

    if (!nonConformity) {
      throw new NotFoundError("Non-conformity not found.");
    }

    if (
      !nonConformity.inspectionResponse.snapshotItemId ||
      !nonConformity.inspectionResponse.inspection.snapshot
    ) {
      throw new ConflictError(
        "Evidence requires a non-conformity linked to an immutable inspection snapshot item.",
      );
    }
  }

  private validateFile(file: EvidenceFileInput, fileName: string, bytes: Uint8Array): void {
    if (
      !SUPPORTED_EVIDENCE_MIME_TYPES.includes(
        file.type as (typeof SUPPORTED_EVIDENCE_MIME_TYPES)[number],
      )
    ) {
      throw new ValidationError("Unsupported evidence file type.", [
        { field: "file", message: "Only JPEG, PNG and WebP images are supported." },
      ]);
    }

    if (file.size <= 0 || file.size > MAX_EVIDENCE_FILE_SIZE || bytes.byteLength !== file.size) {
      throw new ValidationError("Invalid evidence file size.", [
        { field: "file", message: "The image must be larger than zero bytes and at most 4 MB." },
      ]);
    }

    if (!fileName || fileName.length > 255) {
      throw new ValidationError("Invalid evidence file name.", [
        { field: "file", message: "The image file name is invalid." },
      ]);
    }

    if (!hasValidImageSignature(bytes, file.type)) {
      throw new ValidationError("The file content does not match its declared image type.", [
        { field: "file", message: "Select a valid JPEG, PNG or WebP image." },
      ]);
    }
  }

  private async removeStoredFileAfterPersistenceFailure(publicId: string): Promise<void> {
    try {
      await this.storageService.remove(publicId);
    } catch {
      // The original persistence error remains authoritative. Provider-side
      // lifecycle monitoring can identify this rare orphan for later cleanup.
    }
  }
}

export const evidenceService = new EvidenceService(
  evidenceRepository,
  inspectionRepository,
  nonConformityRepository,
  cloudinaryStorageService,
);
