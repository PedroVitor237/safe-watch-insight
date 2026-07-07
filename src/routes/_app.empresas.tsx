import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, MapPin, Pencil, Trash2 } from "lucide-react";
import { useCompanies, useCreateCompany, useDeleteCompany, useUpdateCompany } from "@/hooks/useCompanies";
import { fmtCnpj } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/empresas")({
  head: () => ({ meta: [{ title: "Empresas — SST" }] }),
  component: Empresas,
});

function Empresas() {
  const { data: companiesResult, isLoading, isError } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [form, setForm] = useState<CompanyFormState>(emptyCompanyForm);
  const companies = companiesResult?.success ? companiesResult.data.items : [];
  const errorMessage =
    companiesResult && !companiesResult.success
      ? companiesResult.message
      : "Não foi possível carregar as empresas.";

  function openCreateDialog() {
    setEditingCompanyId(null);
    setForm(emptyCompanyForm);
    setDialogOpen(true);
  }

  function openEditDialog(company: (typeof companies)[number]) {
    setEditingCompanyId(company.id);
    setForm({
      corporateName: company.corporateName,
      tradeName: company.tradeName ?? "",
      cnpj: company.cnpj ?? "",
      cnae: company.cnae,
      riskLevel: String(company.riskLevel),
      employeeCount: String(company.employeeCount),
      address: company.address ?? "",
      notes: company.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      corporateName: form.corporateName,
      tradeName: form.tradeName,
      cnpj: form.cnpj,
      cnae: form.cnae,
      riskLevel: Number(form.riskLevel),
      employeeCount: Number(form.employeeCount),
      address: form.address,
      notes: form.notes,
    };

    const result = editingCompanyId
      ? await updateCompany.mutateAsync({ id: editingCompanyId, data: payload })
      : await createCompany.mutateAsync(payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(editingCompanyId ? "Empresa atualizada." : "Empresa cadastrada.");
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir esta empresa?")) {
      return;
    }

    const result = await deleteCompany.mutateAsync(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Empresa excluída.");
  }

  return (
    <div>
      <PageHeader
        title="Empresas e unidades"
        description="Cadastro das empresas e unidades fiscalizadas."
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Nova empresa
          </Button>
        }
      />
      <div className="grid gap-4 p-4 sm:p-8 md:grid-cols-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
                    <div className="min-w-0 space-y-2">
                      <div className="h-4 w-40 rounded bg-muted" />
                      <div className="h-3 w-52 rounded bg-muted" />
                      <div className="h-3 w-28 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="h-5 w-20 rounded bg-muted" />
                </div>
                <div className="h-3 w-64 rounded bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-muted" />
                  <div className="h-4 w-36 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}

        {(isError || (companiesResult && !companiesResult.success)) && (
          <Card className="md:col-span-2">
            <CardContent className="p-5 text-sm text-muted-foreground">{errorMessage}</CardContent>
          </Card>
        )}

        {!isLoading && !isError && companiesResult?.success && companies.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="p-5 text-sm text-muted-foreground">
              Nenhuma empresa cadastrada.
            </CardContent>
          </Card>
        )}

        {companies.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{e.tradeName ?? e.corporateName}</div>
                    <div className="truncate text-xs text-muted-foreground">{e.corporateName}</div>
                    <div className="mt-1 font-mono text-xs">
                      {e.cnpj ? fmtCnpj(e.cnpj) : "CNPJ não informado"}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{e.cnae}</Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {e.address ?? "Endereço não informado"}
              </div>

              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Funcionários</div>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>{e.employeeCount}</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-[10px]">
                  Grau de risco {e.riskLevel}
                </Badge>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(e)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(e.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCompanyId ? "Editar empresa" : "Nova empresa"}</DialogTitle>
            <DialogDescription>Preencha os dados cadastrais da empresa fiscalizada.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Razão social" value={form.corporateName} onChange={(value) => setForm({ ...form, corporateName: value })} required />
              <FormField label="Nome fantasia" value={form.tradeName} onChange={(value) => setForm({ ...form, tradeName: value })} />
              <FormField label="CNPJ" value={form.cnpj} onChange={(value) => setForm({ ...form, cnpj: value })} />
              <FormField label="CNAE" value={form.cnae} onChange={(value) => setForm({ ...form, cnae: value })} required />
              <FormField label="Grau de risco" type="number" min="1" max="4" value={form.riskLevel} onChange={(value) => setForm({ ...form, riskLevel: value })} required />
              <FormField label="Funcionários" type="number" min="0" value={form.employeeCount} onChange={(value) => setForm({ ...form, employeeCount: value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Endereço</Label>
              <Input id="company-address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-notes">Observações</Label>
              <Textarea id="company-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCompany.isPending || updateCompany.isPending}>
                {editingCompanyId ? "Salvar alterações" : "Cadastrar empresa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CompanyFormState {
  corporateName: string;
  tradeName: string;
  cnpj: string;
  cnae: string;
  riskLevel: string;
  employeeCount: string;
  address: string;
  notes: string;
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  max?: string;
  required?: boolean;
}

const emptyCompanyForm: CompanyFormState = {
  corporateName: "",
  tradeName: "",
  cnpj: "",
  cnae: "",
  riskLevel: "1",
  employeeCount: "0",
  address: "",
  notes: "",
};

function FormField({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
  required = false,
}: FormFieldProps) {
  const id = `company-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        min={min}
        max={max}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
