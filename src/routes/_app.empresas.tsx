import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Building2, MapPin } from "lucide-react";
import { empresas } from "@/mocks/data";
import { fmtCnpj } from "@/lib/format";

export const Route = createFileRoute("/_app/empresas")({
  head: () => ({ meta: [{ title: "Empresas — SST" }] }),
  component: Empresas,
});

function Empresas() {
  return (
    <div>
      <PageHeader
        title="Empresas e unidades"
        description="Cadastro das empresas e unidades fiscalizadas."
        actions={<Button><Plus className="h-4 w-4" />Nova empresa</Button>}
      />
      <div className="grid gap-4 p-4 sm:p-8 md:grid-cols-2">
        {empresas.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{e.nomeFantasia}</div>
                    <div className="truncate text-xs text-muted-foreground">{e.razaoSocial}</div>
                    <div className="mt-1 font-mono text-xs">{fmtCnpj(e.cnpj)}</div>
                  </div>
                </div>
                <Badge variant="outline">{e.setor}</Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />{e.endereco} · {e.cidade}/{e.uf}
              </div>

              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Unidades ({e.unidades.length})</div>
                <ul className="mt-1 space-y-1 text-sm">
                  {e.unidades.map((u) => <li key={u.id}>· {u.nome}</li>)}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1">
                {e.riscos.map((r) => (
                  <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
