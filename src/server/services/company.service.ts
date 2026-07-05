import { ApiError, ConflictError, NotFoundError } from "@/server/errors";
import { companyRepository, CompanyRepository } from "@/server/repositories";
import type { CompanyFindManyFilters } from "@/server/repositories";
import type { Result } from "@/server/responses";
import type { PaginatedResult } from "@/server/types";

import { BaseService } from "./base.service";

type CompanyEntity = NonNullable<Awaited<ReturnType<CompanyRepository["findActiveById"]>>>;
type CompanyCreateData = Parameters<CompanyRepository["create"]>[0];
type CompanyUpdateData = Parameters<CompanyRepository["update"]>[1];

export interface CreateCompanyInput {
  corporateName: string;
  tradeName?: string | null;
  cnpj?: string | null;
  cnae: string;
  riskLevel: number;
  employeeCount: number;
  address?: string | null;
  notes?: string | null;
  createdById: string;
}

export interface UpdateCompanyInput {
  corporateName?: string;
  tradeName?: string | null;
  cnpj?: string | null;
  cnae?: string;
  riskLevel?: number;
  employeeCount?: number;
  address?: string | null;
  notes?: string | null;
}

export class CompanyService extends BaseService<CompanyRepository> {
  constructor(repository: CompanyRepository = companyRepository) {
    super(repository);
  }

  async createCompany(input: CreateCompanyInput): Promise<Result<CompanyEntity>> {
    return this.execute(async () => {
      await this.ensureCnpjIsAvailable(input.cnpj);

      const company = await this.repository.create(this.toCreateData(input));

      return this.success(company);
    });
  }

  async updateCompany(id: string, input: UpdateCompanyInput): Promise<Result<CompanyEntity>> {
    return this.execute(async () => {
      await this.ensureCompanyExists(id);
      await this.ensureCnpjIsAvailable(input.cnpj, id);

      const company = await this.repository.update({ id }, this.toUpdateData(input));

      return this.success(company);
    });
  }

  async deleteCompany(id: string): Promise<Result<CompanyEntity>> {
    return this.execute(async () => {
      await this.ensureCompanyExists(id);

      const company = await this.repository.softDelete(id);

      return this.success(company);
    });
  }

  async getCompanyById(id: string): Promise<Result<CompanyEntity>> {
    return this.execute(async () => {
      const company = await this.repository.findActiveById(id);

      if (!company) {
        throw new NotFoundError("Company not found.");
      }

      return this.success(company);
    });
  }

  async listCompanies(
    filters: CompanyFindManyFilters = {},
  ): Promise<Result<PaginatedResult<CompanyEntity>>> {
    return this.execute(async () => {
      const companies = await this.repository.findManyPaginated({
        ...filters,
        includeDeleted: false,
      });

      return this.success(companies);
    });
  }

  async companyExistsByCnpj(cnpj: string, excludeId?: string): Promise<Result<boolean>> {
    return this.execute(async () => {
      const normalizedCnpj = this.normalizeCnpj(cnpj);

      if (!normalizedCnpj) {
        return this.success(false);
      }

      const exists = await this.repository.existsByCnpj(normalizedCnpj, excludeId);

      return this.success(exists);
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

  private async ensureCompanyExists(id: string): Promise<CompanyEntity> {
    const company = await this.repository.findActiveById(id);

    if (!company) {
      throw new NotFoundError("Company not found.");
    }

    return company;
  }

  private async ensureCnpjIsAvailable(cnpj?: string | null, excludeId?: string): Promise<void> {
    const normalizedCnpj = this.normalizeCnpj(cnpj);

    if (!normalizedCnpj) {
      return;
    }

    const exists = await this.repository.existsByCnpj(normalizedCnpj, excludeId);

    if (exists) {
      throw new ConflictError("A company with this CNPJ already exists.");
    }
  }

  private normalizeCnpj(cnpj?: string | null): string | null {
    const trimmedCnpj = cnpj?.trim();

    return trimmedCnpj ? trimmedCnpj : null;
  }

  private toCreateData(input: CreateCompanyInput): CompanyCreateData {
    return {
      corporateName: input.corporateName,
      tradeName: input.tradeName,
      cnpj: this.normalizeCnpj(input.cnpj),
      cnae: input.cnae,
      riskLevel: input.riskLevel,
      employeeCount: input.employeeCount,
      address: input.address,
      notes: input.notes,
      createdBy: {
        connect: {
          id: input.createdById,
        },
      },
    };
  }

  private toUpdateData(input: UpdateCompanyInput): CompanyUpdateData {
    return {
      ...(input.corporateName !== undefined ? { corporateName: input.corporateName } : {}),
      ...(input.tradeName !== undefined ? { tradeName: input.tradeName } : {}),
      ...(input.cnpj !== undefined ? { cnpj: this.normalizeCnpj(input.cnpj) } : {}),
      ...(input.cnae !== undefined ? { cnae: input.cnae } : {}),
      ...(input.riskLevel !== undefined ? { riskLevel: input.riskLevel } : {}),
      ...(input.employeeCount !== undefined ? { employeeCount: input.employeeCount } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    };
  }
}

export const companyService = new CompanyService();
