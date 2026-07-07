import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useInspections } from "@/hooks/useInspections";
import { fmtData } from "@/lib/format";

export const Route = createFileRoute("/_app/inspecoes/")({
  head: () => ({ meta: [{ title: "Inspeções — SST" }] }),
  component: ListaInspecoes,
});

function ListaInspecoes() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("todos");
  const {
    data: inspectionsResult,
    isError,
    isLoading,
  } = useInspections({
    search: q,
    status: status === "todos" ? undefined : toInspectionStatus(status),
  });
  const inspections = inspectionsResult?.success ? inspectionsResult.data.items : [];
  const errorMessage =
    inspectionsResult && !inspectionsResult.success
      ? inspectionsResult.message
      : "Não foi possível carregar as inspeções.";

  return (
    <div>
      <PageHeader
        title="Inspeções"
        description="Lista de inspeções planejadas, em andamento e concluídas."
        actions={
          <Button asChild>
            <Link to="/inspecoes/nova">
              <Plus className="h-4 w-4" />
              Nova inspeção
            </Link>
          </Button>
        }
      />

      <div className="space-y-4 p-4 sm:p-8">
        <Card className="p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa, checklist ou observações…"
                className="pl-8"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="planejada">Planejada</SelectItem>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="divide-y">
            <div className="hidden grid-cols-[140px_minmax(0,2fr)_minmax(0,1fr)_140px_120px_140px] gap-3 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
              <div>Código</div>
              <div>Inspeção</div>
              <div>Empresa</div>
              <div>Agendada</div>
              <div>Inspetor</div>
              <div>Status</div>
            </div>
            {isLoading && (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                Carregando inspeções...
              </div>
            )}
            {(isError || (inspectionsResult && !inspectionsResult.success)) && (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                {errorMessage}
              </div>
            )}
            {inspections.map((i) => (
              <Link
                key={i.id}
                to="/inspecoes/$id"
                params={{ id: i.id }}
                className="grid grid-cols-1 gap-1 px-4 py-3 hover:bg-accent/40 md:grid-cols-[140px_minmax(0,2fr)_minmax(0,1fr)_140px_120px_140px] md:items-center md:gap-3"
              >
                <div className="font-mono text-xs text-muted-foreground">{i.id.slice(0, 8)}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{i.checklist.title}</div>
                </div>
                <div className="min-w-0 truncate text-sm text-muted-foreground">
                  {i.company.tradeName ?? i.company.corporateName}
                </div>
                <div className="text-sm">{fmtData(i.inspectionDate)}</div>
                <div className="truncate text-sm text-muted-foreground">
                  {i.user.name.split(" ")[0]}
                </div>
                <div>
                  <StatusBadge value={toUiInspectionStatus(i.status)} />
                </div>
              </Link>
            ))}
            {!isLoading && !isError && inspectionsResult?.success && inspections.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                Nenhuma inspeção corresponde aos filtros.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function toInspectionStatus(status: string) {
  const map = {
    planejada: "PLANNED",
    em_andamento: "IN_PROGRESS",
    concluida: "COMPLETED",
    cancelada: "CANCELLED",
  } as const;

  return map[status as keyof typeof map];
}

function toUiInspectionStatus(status: string): string {
  const map = {
    PLANNED: "planejada",
    IN_PROGRESS: "em_andamento",
    COMPLETED: "concluida",
    CANCELLED: "cancelada",
  } as const;

  return map[status as keyof typeof map] ?? status;
}
