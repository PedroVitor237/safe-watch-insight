import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { checklists, normas } from "@/mocks/data";

export const Route = createFileRoute("/_app/checklists/$id")({
  head: () => ({ meta: [{ title: "Editor de checklist — SST" }] }),
  component: EditorChecklist,
});

function EditorChecklist() {
  const { id } = Route.useParams();
  const c = checklists.find((x) => x.id === id);
  if (!c) return <div className="p-8">Checklist não encontrado.</div>;
  const n = normas.find((x) => x.id === c.normaId);

  return (
    <div>
      <PageHeader
        title={c.titulo}
        description={`${n?.codigo} · ${n?.titulo} · versão ${c.versao}`}
        actions={<Button asChild variant="outline"><Link to="/checklists"><ArrowLeft className="h-4 w-4" />Voltar</Link></Button>}
      />
      <div className="space-y-4 p-4 sm:p-8">
        {c.secoes.map((sec) => (
          <Card key={sec.id}>
            <CardHeader><CardTitle className="text-base">{sec.titulo}</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {sec.itens.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-3 py-3">
                  <div className="text-xs font-mono text-muted-foreground">{idx + 1}.</div>
                  <div className="min-w-0">
                    <div className="text-sm">{item.texto}</div>
                    {item.normaRef && <div className="text-xs text-muted-foreground">{item.normaRef}</div>}
                  </div>
                  <StatusBadge value={item.criticidade} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
