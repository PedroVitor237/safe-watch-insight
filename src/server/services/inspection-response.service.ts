import { InspectionStatus, type ResponseStatus } from "@/generated/prisma/client";
import { ApiError, NotFoundError } from "@/server/errors";
import {
  inspectionResponseRepository,
  InspectionResponseRepository,
  type InspectionResponseWithRelations,
} from "@/server/repositories/inspection-response.repository";
import {
  inspectionRepository,
  InspectionRepository,
  type InspectionWithRelations,
} from "@/server/repositories/inspection.repository";
import type { Result } from "@/server/responses";

import { BaseService } from "./base.service";

export interface SaveInspectionResponseInput {
  inspectionId: string;
  checklistItemId: string;
  status: ResponseStatus;
  observation?: string | null;
}

export class InspectionResponseService extends BaseService<InspectionResponseRepository> {
  constructor(
    repository: InspectionResponseRepository = inspectionResponseRepository,
    private readonly inspectionRepository: InspectionRepository = inspectionRepository,
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
      this.ensureChecklistItemBelongsToInspection(inspection, input.checklistItemId);

      const response = await this.repository.upsertByInspectionAndItem(
        input.inspectionId,
        input.checklistItemId,
        {
          status: input.status,
          observation: input.observation ?? null,
        },
      );

      if (inspection.status === InspectionStatus.PLANNED) {
        await this.inspectionRepository.updateStatus(input.inspectionId, InspectionStatus.IN_PROGRESS);
      }

      return this.success(response);
    });
  }

  async finishInspection(inspectionId: string): Promise<Result<InspectionWithRelations>> {
    return this.execute(async () => {
      await this.ensureInspectionExists(inspectionId);

      const inspection = await this.inspectionRepository.updateStatus(
        inspectionId,
        InspectionStatus.COMPLETED,
      );

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

  private ensureChecklistItemBelongsToInspection(
    inspection: InspectionWithRelations,
    checklistItemId: string,
  ): void {
    const itemExists = inspection.checklist.items.some((item) => item.id === checklistItemId);

    if (!itemExists) {
      throw new NotFoundError("Checklist item not found for this inspection.");
    }
  }
}

export const inspectionResponseService = new InspectionResponseService();
