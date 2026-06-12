import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { normas } from "@/mocks/data";

export const Route = createFileRoute("/_app/normas")({
  head: () => ({ meta: [{ title: "Normas — SST" }] }),
  component: Normas,
});

function Normas() {
  return (
    <div>
      <PageHeader title="Normas Regulamentadoras" description="Biblioteca de NRs aplicáveis." />
      <div className="grid gap-4 p-4 sm:p-8 md:grid-cols-2 xl:grid-cols-3">
        {normas.map((n) => (
          <Card key={n.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <Badge>{n.codigo}</Badge>
              </div>
              <div>
                <div className="font-semibold">{n.titulo}</div>
                <p className="mt-1 text-sm text-muted-foreground">{n.descricao}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {n.topicos.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
