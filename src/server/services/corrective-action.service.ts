import {
  CorrectiveActionStatus,
  type Prisma,
} from "@/generated/prisma/client";
import { ApiError, NotFoundError } from "@/server/errors";
import {
  correctiveActionRepository,
  CorrectiveActionRepository,
} from "@/server/repositories/corrective-action.repository";
import {
  nonConformityRepository as defaultNonConformityRepository,
  NonConformityRepository,
} from "@/server/repositories/non-conformity.repository";
import type { Result } from "@/server/responses";

import { BaseService } from "./base.service";

type CorrectiveActionEntity = NonNullable<
  Awaited<ReturnType<CorrectiveActionRepository["findActiveById"]>>
>;
type CorrectiveActionCreateData = Parameters<
  CorrectiveActionRepository["create"]
>[0];
type CorrectiveActionUpdateData = Parameters<
  CorrectiveActionRepository["update"]
>[1];

export interface CreateCorrectiveActionInput {
  nonConformityId: string;
  description: string;
  why?: string | null;
  location?: string | null;
  responsible?: string | null;
  dueDate?: Date | null;
  method?: string | null;
  estimatedCost?: string | null;
  status?: CorrectiveActionStatus;
}

export interface UpdateCorrectiveActionInput {
  description?: string;
  why?: string | null;
  location?: string | null;
  responsible?: string | null;
  dueDate?: Date | null;
  method?: string | null;
  estimatedCost?: string | null;
  status?: CorrectiveActionStatus;
}

export class CorrectiveActionService extends BaseService<CorrectiveActionRepository> {
  constructor(
    repository: CorrectiveActionRepository = correctiveActionRepository,
    private readonly nonConformityRepository: NonConformityRepository =
      defaultNonConformityRepository,
  ) {
    super(repository);
  }

  async createCorrectiveAction(
    input: CreateCorrectiveActionInput,
  ): Promise<Result<CorrectiveActionEntity>> {
    return this.execute(async () => {
      const nonConformity = await this.nonConformityRepository.findActiveById(
        input.nonConformityId,
      );

      if (!nonConformity) {
        throw new NotFoundError("Non-conformity not found.");
      }

      const action = await this.repository.create(this.toCreateData(input));

      if (nonConformity.status === "OPEN") {
        await this.nonConformityRepository.updateWithRelations(
          nonConformity.id,
          { status: "IN_PROGRESS" },
        );
      }

      return this.success(action);
    });
  }

  async listCorrectiveActions(
    nonConformityId: string,
  ): Promise<Result<CorrectiveActionEntity[]>> {
    return this.execute(async () => {
      const nonConformity =
        await this.nonConformityRepository.findActiveById(nonConformityId);

      if (!nonConformity) {
        throw new NotFoundError("Non-conformity not found.");
      }

      await this.repository.markOverdue(new Date());
      const actions = await this.repository.findByNonConformityId(
        nonConformityId,
      );

      return this.success(actions);
    });
  }

  async updateCorrectiveAction(
    id: string,
    input: UpdateCorrectiveActionInput,
  ): Promise<Result<CorrectiveActionEntity>> {
    return this.execute(async () => {
      await this.ensureCorrectiveActionExists(id);
      const action = await this.repository.update(
        { id },
        this.toUpdateData(input),
      );

      return this.success(action);
    });
  }

  async deleteCorrectiveAction(
    id: string,
  ): Promise<Result<CorrectiveActionEntity>> {
    return this.execute(async () => {
      await this.ensureCorrectiveActionExists(id);
      const action = await this.repository.softDelete(id);

      return this.success(action);
    });
  }

  private async execute<TData>(
    operation: () => Promise<Result<TData>>,
  ): Promise<Result<TData>> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError) {
        return this.failure(error);
      }

      throw error;
    }
  }

  private async ensureCorrectiveActionExists(
    id: string,
  ): Promise<CorrectiveActionEntity> {
    const action = await this.repository.findActiveById(id);

    if (!action) {
      throw new NotFoundError("Corrective action not found.");
    }

    return action;
  }

  private toCreateData(
    input: CreateCorrectiveActionInput,
  ): CorrectiveActionCreateData {
    return {
      description: input.description,
      why: input.why ?? null,
      location: input.location ?? null,
      responsible: input.responsible ?? null,
      dueDate: input.dueDate ?? null,
      method: input.method ?? null,
      estimatedCost: input.estimatedCost ?? null,
      status: input.status,
      completedAt:
        input.status === CorrectiveActionStatus.COMPLETED ? new Date() : null,
      nonConformity: {
        connect: {
          id: input.nonConformityId,
        },
      },
    };
  }

  private toUpdateData(
    input: UpdateCorrectiveActionInput,
  ): CorrectiveActionUpdateData {
    const data: Prisma.CorrectiveActionUpdateInput = {
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.why !== undefined ? { why: input.why } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.responsible !== undefined
        ? { responsible: input.responsible }
        : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.method !== undefined ? { method: input.method } : {}),
      ...(input.estimatedCost !== undefined
        ? { estimatedCost: input.estimatedCost }
        : {}),
      ...(input.status !== undefined
        ? {
            status: input.status,
            completedAt:
              input.status === CorrectiveActionStatus.COMPLETED
                ? new Date()
                : null,
          }
        : {}),
    };

    return data;
  }
}

export const correctiveActionService = new CorrectiveActionService();
