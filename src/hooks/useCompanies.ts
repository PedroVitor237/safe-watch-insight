import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCompany,
  deleteCompany,
  getCompanyById,
  listCompanies,
  updateCompany,
} from "@/lib/api/company.functions";
import {
  companyQueryKeys,
  getCompanyListFilters,
  type CompanyQueryFilters,
} from "@/lib/api/company.query-keys";
import type { CreateCompanySchemaInput, UpdateCompanySchemaInput } from "@/server/schemas";

export interface UseCompanyOptions {
  enabled?: boolean;
}

export interface UpdateCompanyVariables {
  id: string;
  data: UpdateCompanySchemaInput;
}

export function useCompanies(filters: CompanyQueryFilters = {}) {
  const listFilters = getCompanyListFilters(filters);

  return useQuery({
    queryKey: companyQueryKeys.list(listFilters),
    queryFn: () => listCompanies({ data: listFilters }),
  });
}

export function useCompany(id: string, options: UseCompanyOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: companyQueryKeys.detail(id),
    queryFn: () => getCompanyById({ data: { id } }),
    enabled: enabled && id.length > 0,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanySchemaInput) => createCompany({ data }),
    onSuccess: async (result) => {
      if (!result.success) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCompanyVariables) => updateCompany({ data: { id, data } }),
    onSuccess: async (result, variables) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.detail(variables.id) }),
      ]);
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCompany({ data: { id } }),
    onSuccess: async (result, id) => {
      if (!result.success) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: companyQueryKeys.detail(id) }),
      ]);
    },
  });
}
