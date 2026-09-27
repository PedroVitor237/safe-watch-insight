import { CorrectiveActionStatus, NonConformityStatus, Prisma } from "@/generated/prisma/client";
import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import {
  correctiveActionRepository,
  CorrectiveActionRepository,
  NonConformityStatePersistenceConflictError,
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
type CorrectiveActionCreateData = Parameters<CorrectiveActionRepository["create"]>[0];
type CorrectiveActionUpdateData = Parameters<CorrectiveActionRepository["update"]>[1];

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
    private readonly nonConformityRepository: NonConformityRepository = defaultNonConformityRepository,
  ) {
    super(repository);
  }

  async createCorrectiveAction(
    input: CreateCorrectiveActionInput,
    userId: string,
  ): Promise<Result<CorrectiveActionEntity>> {
    return this.execute(async () => {
      const nonConformity = await this.nonConformityRepository.findActiveOwnedById(
        input.nonConformityId,
        userId,
      );

      if (!nonConformity) {
        throw new NotFoundError("Non-conformity not found.");
      }

      let action: CorrectiveActionEntity;

      try {
        action = await this.repository.createWithNonConformityTransition(
          this.toCreateData(input),
          nonConformity.status === NonConformityStatus.OPEN
            ? {
                id: nonConformity.id,
                from: NonConformityStatus.OPEN,
                to: NonConformityStatus.IN_PROGRESS,
              }
            : undefined,
          userId,
        );
      } catch (error) {
        if (error instanceof NonConformityStatePersistenceConflictError) {
          throw new ConflictError(
            "The non-conformity changed while the corrective action was being created. Try again.",
          );
        }

        throw error;
      }

      return this.success(action);
    });
  }

  async listCorrectiveActions(
    nonConformityId: string,
    userId: string,
  ): Promise<Result<CorrectiveActionEntity[]>> {
    return this.execute(async () => {
      const nonConformity = await this.nonConformityRepository.findActiveOwnedById(
        nonConformityId,
        userId,
      );

      if (!nonConformity) {
        throw new NotFoundError("Non-conformity not found.");
      }

      await this.repository.markOverdue(new Date(), userId);
      const actions = await this.repository.findByNonConformityId(nonConformityId);

      return this.success(actions);
    });
  }

  async updateCorrectiveAction(
    id: string,
    input: UpdateCorrectiveActionInput,
    userId: string,
  ): Promise<Result<CorrectiveActionEntity>> {
    return this.execute(async () => {
      await this.ensureCorrectiveActionExists(id, userId);
      const action = await this.repository.updateOwned(id, userId, this.toUpdateData(input));

      return this.success(action);
    });
  }

  async deleteCorrectiveAction(
    id: string,
    userId: string,
  ): Promise<Result<CorrectiveActionEntity>> {
    return this.execute(async () => {
      await this.ensureCorrectiveActionExists(id, userId);
      const action = await this.repository.softDeleteOwned(id, userId);

      return this.success(action);
    });
  }

  private async execute<TData>(operation: () => Promise<Result<TData>>): Promise<Result<TData>> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError) {
        return this.failure(error);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return this.failure(new NotFoundError("Corrective action or non-conformity not found."));
      }

      throw error;
    }
  }

  private async ensureCorrectiveActionExists(
    id: string,
    userId: string,
  ): Promise<CorrectiveActionEntity> {
    const action = await this.repository.findActiveOwnedById(id, userId);

    if (!action) {
      throw new NotFoundError("Corrective action not found.");
    }

    return action;
  }

  private toCreateData(input: CreateCorrectiveActionInput): CorrectiveActionCreateData {
    return {
      description: input.description,
      why: input.why ?? null,
      location: input.location ?? null,
      responsible: input.responsible ?? null,
      dueDate: input.dueDate ?? null,
      method: input.method ?? null,
      estimatedCost: input.estimatedCost ?? null,
      status: input.status,
      completedAt: input.status === CorrectiveActionStatus.COMPLETED ? new Date() : null,
      nonConformity: {
        connect: {
          id: input.nonConformityId,
        },
      },
    };
  }

  private toUpdateData(input: UpdateCorrectiveActionInput): CorrectiveActionUpdateData {
    const data: Prisma.CorrectiveActionUpdateInput = {
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.why !== undefined ? { why: input.why } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.responsible !== undefined ? { responsible: input.responsible } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.method !== undefined ? { method: input.method } : {}),
      ...(input.estimatedCost !== undefined ? { estimatedCost: input.estimatedCost } : {}),
      ...(input.status !== undefined
        ? {
            status: input.status,
            completedAt: input.status === CorrectiveActionStatus.COMPLETED ? new Date() : null,
          }
        : {}),
    };

    return data;
  }
}

export const correctiveActionService = new CorrectiveActionService();
