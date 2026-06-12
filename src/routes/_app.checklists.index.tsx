import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ListChecks } from "lucide-react";
import { checklists, normas } from "@/mocks/data";

export const Route = createFileRoute("/_app/checklists/")({
  head: () => ({ meta: [{ title: "Checklists — SST" }] }),
  component: ListaChecklists,
});

function ListaChecklists() {
  return (
    <div>
      <PageHeader
        title="Biblioteca de checklists"
        description="Modelos de checklist por norma regulamentadora."
        actions={<Button><Plus className="h-4 w-4" />Novo modelo</Button>}
      />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
        {checklists.map((c) => {
          const n = normas.find((x) => x.id === c.normaId);
          const total = c.secoes.reduce((s, sec) => s + sec.itens.length, 0);
          return (
            <Link key={c.id} to="/checklists/$id" params={{ id: c.id }}>
              <Card className="h-full transition hover:border-primary hover:shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <ListChecks className="h-5 w-5" />
                    </div>
                    <Badge variant="outline">v{c.versao}</Badge>
                  </div>
                  <div className="mt-3 font-semibold">{c.titulo}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{n?.codigo} · {n?.titulo}</div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{c.descricao}</p>
                  <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
                    <span>{c.secoes.length} seções</span>
                    <span>{total} itens</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
