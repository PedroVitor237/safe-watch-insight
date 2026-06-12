import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useStore } from "@/lib/mockStore";
import { empresas, usuarios } from "@/mocks/data";
import { fmtData } from "@/lib/format";
import { AlertTriangle } from "lucide-react";
import type { NaoConformidade, StatusNC } from "@/types/sst";

export const Route = createFileRoute("/_app/nao-conformidades/")({
  head: () => ({ meta: [{ title: "Não conformidades — SST" }] }),
  component: ListaNCs,
});

const colunas: { id: StatusNC; titulo: string }[] = [
  { id: "aberta", titulo: "Abertas" },
  { id: "em_tratativa", titulo: "Em tratativa" },
  { id: "resolvida", titulo: "Resolvidas" },
  { id: "vencida", titulo: "Vencidas" },
];

function NCCardMini({ nc }: { nc: NaoConformidade }) {
  const emp = empresas.find((e) => e.id === nc.empresaId);
  const resp = usuarios.find((u) => u.id === nc.responsavelId);
  return (
    <Link to="/nao-conformidades/$id" params={{ id: nc.id }}>
      <Card className="transition hover:border-primary hover:shadow-sm">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="font-mono text-[10px] text-muted-foreground">{nc.codigo}</div>
            <StatusBadge value={nc.criticidade} />
          </div>
          <div className="line-clamp-2 text-sm font-medium">{nc.titulo}</div>
          <div className="truncate text-xs text-muted-foreground">{emp?.nomeFantasia}</div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Prazo {fmtData(nc.prazo)}</span>
            <span className="truncate text-muted-foreground">{resp?.nome.split(" ")[0]}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ListaNCs() {
  const ncs = useStore((s) => s.ncs);
  const [view, setView] = useState("kanban");

  return (
    <div>
      <PageHeader title="Não conformidades" description="Gestão de NCs, planos de ação 5W2H e tratativas." />
      <div className="space-y-4 p-4 sm:p-8">
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {colunas.map((col) => {
                const itens = ncs.filter((n) => n.status === col.id);
                return (
                  <div key={col.id} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge value={col.id} />
                        <span className="text-xs text-muted-foreground">{itens.length}</span>
                      </div>
                    </div>
                    <div className="min-h-[200px] space-y-2 rounded-lg bg-muted/40 p-2">
                      {itens.map((nc) => <NCCardMini key={nc.id} nc={nc} />)}
                      {itens.length === 0 && (
                        <div className="py-8 text-center text-xs text-muted-foreground">Vazia</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="lista">
            <Card>
              <CardContent className="divide-y p-0">
                {ncs.map((nc) => {
                  const emp = empresas.find((e) => e.id === nc.empresaId);
                  return (
                    <Link
                      key={nc.id}
                      to="/nao-conformidades/$id"
                      params={{ id: nc.id }}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3 hover:bg-accent/40"
                    >
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{nc.titulo}</div>
                        <div className="truncate text-xs text-muted-foreground">{nc.codigo} · {emp?.nomeFantasia}</div>
                      </div>
                      <StatusBadge value={nc.criticidade} />
                      <StatusBadge value={nc.status} />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
