import {
  InspectionStatus,
  NonConformityStatus,
  OfflineOperationType,
  ResponseStatus,
  Severity,
} from "@/generated/prisma/client";
import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import {
  inspectionResponseRepository,
  InspectionResponseRepository,
  InspectionStatePersistenceConflictError,
  type InspectionResponseWithRelations,
} from "@/server/repositories/inspection-response.repository";
import {
  InspectionResponseRevisionConflictError,
  OfflineOperationPayloadConflictError,
} from "@/server/repositories/offline-sync.errors";
import {
  inspectionRepository as defaultInspectionRepository,
  InspectionRepository,
  type InspectionWithRelations,
} from "@/server/repositories/inspection.repository";
import type { Result } from "@/server/responses";
import { createOfflineOperationPayloadHash } from "@/server/utils/offline-operation-hash";

import { BaseService } from "./base.service";

export interface SaveInspectionResponseInput {
  inspectionId: string;
  snapshotItemId?: string;
  checklistItemId?: string;
  status: ResponseStatus;
  observation?: string | null;
  offlineOperation?: {
    id: string;
    userId: string;
    clientCreatedAt: Date;
    expectedResponseUpdatedAt: Date | null;
  };
}

export interface FinishInspectionOfflineOperationInput {
  id: string;
  userId: string;
  clientCreatedAt: Date;
}

export class InspectionResponseService extends BaseService<InspectionResponseRepository> {
  constructor(
    repository: InspectionResponseRepository = inspectionResponseRepository,
    private readonly inspectionRepository: InspectionRepository = defaultInspectionRepository,
  ) {
    super(repository);
  }

  async listInspectionResponses(
    inspectionId: string,
  ): Promise<Result<InspectionResponseWithRelations[]>> {
    return this.execute(async () => {
      await this.ensureInspectionExists(inspectionId);

      const responses = await this.repository.findByInspectionId(inspectionId);

      return this.success(responses);
    });
  }

  async saveInspectionResponse(
    input: SaveInspectionResponseInput,
  ): Promise<Result<InspectionResponseWithRelations>> {
    return this.execute(async () => {
      const inspection = await this.ensureInspectionExists(input.inspectionId);
      this.ensureInspectionCanBeEdited(inspection);
      const snapshotItem = this.getSnapshotItem(
        inspection,
        input.snapshotItemId,
        input.checklistItemId,
      );

      let response: InspectionResponseWithRelations;
      const normalizedObservation = input.observation?.trim() || null;
      const offlineOperation = input.offlineOperation
        ? {
            id: input.offlineOperation.id,
            userId: input.offlineOperation.userId,
            type: OfflineOperationType.SAVE_INSPECTION_RESPONSE,
            payloadHash: createOfflineOperationPayloadHash({
              type: OfflineOperationType.SAVE_INSPECTION_RESPONSE,
              inspectionId: input.inspectionId,
              snapshotItemId: snapshotItem.id,
              status: input.status,
              observation: normalizedObservation,
              expectedResponseUpdatedAt: input.offlineOperation.expectedResponseUpdatedAt,
              clientCreatedAt: input.offlineOperation.clientCreatedAt,
            }),
            clientCreatedAt: input.offlineOperation.clientCreatedAt,
            expectedResponseUpdatedAt: input.offlineOperation.expectedResponseUpdatedAt,
          }
        : undefined;

      try {
        response = await this.repository.saveWithNonConformity(
          input.inspectionId,
          snapshotItem.id,
          {
            status: input.status,
            observation: normalizedObservation,
            ...(offlineOperation ? { clientUpdatedAt: offlineOperation.clientCreatedAt } : {}),
          },
          input.status === ResponseStatus.NON_COMPLIANT
            ? {
                action: "ensure",
                description: normalizedObservation || snapshotItem.description,
                severity: Severity.MEDIUM,
                dueDate: addDays(new Date(), 7),
                status: NonConformityStatus.OPEN,
              }
            : {
                action: "archive",
                archivedAt: new Date(),
              },
          {
            allowedStatuses: [InspectionStatus.PLANNED, InspectionStatus.IN_PROGRESS],
            nextStatus: InspectionStatus.IN_PROGRESS,
          },
          offlineOperation,
        );
      } catch (error) {
        if (error instanceof InspectionStatePersistenceConflictError) {
          throw new ConflictError("Completed or cancelled inspections cannot be edited.");
        }

        if (error instanceof InspectionResponseRevisionConflictError) {
          throw new ConflictError(
            "This response changed on the server after the inspection was cached. Review it before retrying.",
          );
        }

        if (error instanceof OfflineOperationPayloadConflictError) {
          throw new ConflictError(
            "This offline operation ID was already used with different data.",
          );
        }

        throw error;
      }

      return this.success(response);
    });
  }

  async finishInspection(
    inspectionId: string,
    offlineOperation?: FinishInspectionOfflineOperationInput,
  ): Promise<Result<InspectionWithRelations>> {
    return this.execute(async () => {
      const currentInspection = await this.ensureInspectionExists(inspectionId);
      this.ensureRequiredItemsWereAnswered(currentInspection);

      if (offlineOperation) {
        try {
          const inspection = await this.inspectionRepository.completeWithOfflineOperation(
            inspectionId,
            {
              id: offlineOperation.id,
              userId: offlineOperation.userId,
              type: OfflineOperationType.FINISH_INSPECTION,
              payloadHash: createOfflineOperationPayloadHash({
                type: OfflineOperationType.FINISH_INSPECTION,
                inspectionId,
                clientCreatedAt: offlineOperation.clientCreatedAt,
              }),
              clientCreatedAt: offlineOperation.clientCreatedAt,
            },
          );

          if (!inspection) {
            throw new ConflictError(
              "The inspection changed on the server and could not be completed automatically.",
            );
          }

          return this.success(inspection);
        } catch (error) {
          if (error instanceof OfflineOperationPayloadConflictError) {
            throw new ConflictError(
              "This offline operation ID was already used with different data.",
            );
          }

          throw error;
        }
      }

      this.ensureInspectionCanBeEdited(currentInspection);

      const inspection = await this.inspectionRepository.updateStatusIfCurrent(
        inspectionId,
        [InspectionStatus.PLANNED, InspectionStatus.IN_PROGRESS],
        InspectionStatus.COMPLETED,
      );

      if (!inspection) {
        throw new ConflictError("Completed or cancelled inspections cannot be completed again.");
      }

      return this.success(inspection);
    });
  }

  private async execute<TData>(operation: () => Promise<Result<TData>>): Promise<Result<TData>> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError) {
        return this.failure(error);
      }

      throw error;
    }
  }

  private async ensureInspectionExists(id: string): Promise<InspectionWithRelations> {
    const inspection = await this.inspectionRepository.findActiveById(id);

    if (!inspection) {
      throw new NotFoundError("Inspection not found.");
    }

    return inspection;
  }

  private getSnapshotItem(
    inspection: InspectionWithRelations,
    snapshotItemId?: string,
    checklistItemId?: string,
  ): NonNullable<InspectionWithRelations["snapshot"]>["items"][number] {
    if (!inspection.snapshot) {
      throw new ConflictError("Inspection historical snapshot is unavailable.");
    }

    const item = inspection.snapshot.items.find(
      (candidate) =>
        candidate.id === snapshotItemId ||
        (checklistItemId !== undefined && candidate.sourceChecklistItemId === checklistItemId),
    );

    if (!item) {
      throw new NotFoundError("Snapshot item not found for this inspection.");
    }

    return item;
  }

  private ensureInspectionCanBeEdited(inspection: InspectionWithRelations): void {
    if (
      inspection.status === InspectionStatus.COMPLETED ||
      inspection.status === InspectionStatus.CANCELLED
    ) {
      throw new ConflictError("Completed or cancelled inspections cannot be edited.");
    }
  }

  private ensureRequiredItemsWereAnswered(inspection: InspectionWithRelations): void {
    if (!inspection.snapshot) {
      throw new ConflictError("Inspection historical snapshot is unavailable.");
    }

    const answeredItemIds = new Set(
      inspection.responses
        .map((response) => response.snapshotItemId)
        .filter((snapshotItemId): snapshotItemId is string => snapshotItemId !== null),
    );
    const missingRequiredItems = inspection.snapshot.items.filter(
      (item) => item.isRequired && !answeredItemIds.has(item.id),
    );

    if (missingRequiredItems.length > 0) {
      throw new ConflictError(
        `${missingRequiredItems.length} required checklist item(s) still need a response.`,
      );
    }
  }
}

export const inspectionResponseService = new InspectionResponseService();

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);

  return result;
}
