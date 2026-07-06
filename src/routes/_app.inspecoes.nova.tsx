import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useChecklists } from "@/hooks/useChecklists";
import { useCompanies } from "@/hooks/useCompanies";
import { useCreateInspection } from "@/hooks/useInspections";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/inspecoes/nova")({
  head: () => ({ meta: [{ title: "Nova inspeção — SST" }] }),
  component: NovaInspecao,
});

function NovaInspecao() {
  const navigate = useNavigate();
  const { data: companiesResult, isLoading: isLoadingCompanies } = useCompanies();
  const { data: checklistsResult, isLoading: isLoadingChecklists } = useChecklists({
    isActive: true,
  });
  const createInspection = useCreateInspection();
  const [passo, setPasso] = useState(1);
  const [empresaId, setEmpresaId] = useState("");
  const [checklistId, setChecklistId] = useState("");
  const [agendada, setAgendada] = useState("");
  const [obs, setObs] = useState("");

  const companies = companiesResult?.success ? companiesResult.data.items : [];
  const checklists = checklistsResult?.success ? checklistsResult.data.items : [];
  const selectedCompany = companies.find((company) => company.id === empresaId);
  const selectedChecklist = checklists.find((checklist) => checklist.id === checklistId);

  async function finalizar() {
    if (!selectedChecklist) {
      toast.error("Selecione um checklist antes de criar a inspeção.");
      return;
    }

    const result = await createInspection.mutateAsync({
      companyId: empresaId,
      checklistId,
      inspectionDate: agendada ? new Date(agendada) : new Date(),
      status: "PLANNED",
      syncStatus: "SYNCED",
      notes: obs,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Inspeção criada com sucesso!");
    navigate({ to: "/inspecoes" });
  }

  return (
    <div>
      <PageHeader title="Nova inspeção" description="Defina empresa, checklist e agendamento." />
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${
                  passo >= n
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {passo > n ? <Check className="h-4 w-4" /> : n}
              </div>
              {n < 3 && <div className={`h-px w-12 ${passo > n ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="space-y-4 p-6">
            {passo === 1 && (
              <>
                <h3 className="font-semibold">1. Empresa</h3>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Select value={empresaId} onValueChange={setEmpresaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.tradeName ?? company.corporateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isLoadingCompanies
                    ? "Carregando empresas..."
                    : "Selecione a empresa fiscalizada."}
                </div>
              </>
            )}

            {passo === 2 && (
              <>
                <h3 className="font-semibold">2. Checklist e observações</h3>
                <div className="space-y-2">
                  <Label>Checklist</Label>
                  <Select value={checklistId} onValueChange={setChecklistId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      {checklists.map((checklist) => (
                        <SelectItem key={checklist.id} value={checklist.id}>
                          {checklist.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Observações iniciais</Label>
                  <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3} />
                </div>
                <div className="text-sm text-muted-foreground">
                  {isLoadingChecklists
                    ? "Carregando checklists..."
                    : "Os itens serão executados na próxima etapa."}
                </div>
              </>
            )}

            {passo === 3 && (
              <>
                <h3 className="font-semibold">3. Agendamento</h3>
                <div className="space-y-2">
                  <Label>Data e hora</Label>
                  <Input
                    type="datetime-local"
                    value={agendada}
                    onChange={(e) => setAgendada(e.target.value)}
                  />
                </div>
                <div className="rounded-md border bg-muted/40 p-4 text-sm">
                  <div className="font-medium">Resumo</div>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>
                      Empresa: {selectedCompany?.tradeName ?? selectedCompany?.corporateName ?? "—"}
                    </li>
                    <li>Checklist: {selectedChecklist?.title ?? "—"}</li>
                    <li>Data: {agendada || "Agora"}</li>
                  </ul>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setPasso((p) => Math.max(1, p - 1))}
                disabled={passo === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              {passo < 3 ? (
                <Button
                  onClick={() => setPasso((p) => p + 1)}
                  disabled={(passo === 1 && !empresaId) || (passo === 2 && !checklistId)}
                >
                  Avançar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={finalizar} disabled={createInspection.isPending}>
                  Criar inspeção
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
