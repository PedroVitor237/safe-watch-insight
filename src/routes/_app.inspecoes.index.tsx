import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useStore } from "@/lib/mockStore";
import { empresas, usuarios } from "@/mocks/data";
import { fmtData } from "@/lib/format";

export const Route = createFileRoute("/_app/inspecoes/")({
  head: () => ({ meta: [{ title: "Inspeções — SST" }] }),
  component: ListaInspecoes,
});

function ListaInspecoes() {
  const inspecoes = useStore((s) => s.inspecoes);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("todos");

  const filtradas = inspecoes.filter((i) => {
    const emp = empresas.find((e) => e.id === i.empresaId);
    const texto = `${i.titulo} ${i.codigo} ${emp?.nomeFantasia ?? ""}`.toLowerCase();
    if (q && !texto.includes(q.toLowerCase())) return false;
    if (status !== "todos" && i.status !== status) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Inspeções"
        description="Lista de inspeções planejadas, em andamento e concluídas."
        actions={
          <Button asChild>
            <Link to="/inspecoes/nova"><Plus className="h-4 w-4" />Nova inspeção</Link>
          </Button>
        }
      />

      <div className="space-y-4 p-4 sm:p-8">
        <Card className="p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, título ou empresa…"
                className="pl-8"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="planejada">Planejada</SelectItem>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="pendente_sync">Sync pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="divide-y">
            <div className="hidden grid-cols-[140px_minmax(0,2fr)_minmax(0,1fr)_140px_120px_140px] gap-3 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
              <div>Código</div><div>Inspeção</div><div>Empresa</div><div>Agendada</div><div>Inspetor</div><div>Status</div>
            </div>
            {filtradas.map((i) => {
              const emp = empresas.find((e) => e.id === i.empresaId);
              const insp = usuarios.find((u) => u.id === i.inspetorId);
              return (
                <Link
                  key={i.id}
                  to="/inspecoes/$id"
                  params={{ id: i.id }}
                  className="grid grid-cols-1 gap-1 px-4 py-3 hover:bg-accent/40 md:grid-cols-[140px_minmax(0,2fr)_minmax(0,1fr)_140px_120px_140px] md:items-center md:gap-3"
                >
                  <div className="font-mono text-xs text-muted-foreground">{i.codigo}</div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{i.titulo}</div>
                  </div>
                  <div className="min-w-0 truncate text-sm text-muted-foreground">{emp?.nomeFantasia}</div>
                  <div className="text-sm">{fmtData(i.agendadaPara)}</div>
                  <div className="truncate text-sm text-muted-foreground">{insp?.nome.split(" ")[0]}</div>
                  <div><StatusBadge value={i.status} /></div>
                </Link>
              );
            })}
            {filtradas.length === 0 && (
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
