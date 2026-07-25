import { ApiError, NotFoundError } from "@/server/errors";
import {
  standardRepository,
  StandardRepository,
  type StandardFindManyFilters,
} from "@/server/repositories/standard.repository";
import type { Result } from "@/server/responses";
import type { PaginatedResult } from "@/server/types";

import { BaseService } from "./base.service";

type StandardEntity = NonNullable<Awaited<ReturnType<StandardRepository["findById"]>>>;

export class StandardService extends BaseService<StandardRepository> {
  constructor(repository: StandardRepository = standardRepository) {
    super(repository);
  }

  async getStandardById(id: string): Promise<Result<StandardEntity>> {
    return this.execute(async () => {
      const standard = await this.repository.findById({ id });

      if (!standard) {
        throw new NotFoundError("Standard not found.");
      }

      return this.success(standard);
    });
  }

  async listStandards(
    filters: StandardFindManyFilters = {},
  ): Promise<Result<PaginatedResult<StandardEntity>>> {
    return this.execute(async () => {
      const standards = await this.repository.findManyPaginated(filters);

      return this.success(standards);
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
}

export const standardService = new StandardService();
