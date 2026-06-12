import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usuarios } from "@/mocks/data";
import { useStore } from "@/lib/mockStore";

export const Route = createFileRoute("/_app/equipe")({
  head: () => ({ meta: [{ title: "Equipe — SST" }] }),
  component: Equipe,
});

function Equipe() {
  const inspecoes = useStore((s) => s.inspecoes);
  const ncs = useStore((s) => s.ncs);

  return (
    <div>
      <PageHeader title="Equipe" description="Inspetores, gestores e auditores cadastrados." />
      <div className="grid gap-4 p-4 sm:p-8 md:grid-cols-2 xl:grid-cols-3">
        {usuarios.map((u) => {
          const insCount = inspecoes.filter((i) => i.inspetorId === u.id).length;
          const ncCount = ncs.filter((n) => n.responsavelId === u.id).length;
          return (
            <Card key={u.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: u.avatarColor }}
                  >
                    {u.nome.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{u.nome}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{u.perfil}</Badge>
                  {u.registroProfissional && (
                    <span className="font-mono text-xs text-muted-foreground">{u.registroProfissional}</span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-md border p-2">
                    <div className="text-lg font-bold">{insCount}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Inspeções</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-lg font-bold">{ncCount}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">NCs sob responsa.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
