import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ListChecks } from "lucide-react";
import { useChecklists } from "@/hooks/useChecklists";

export const Route = createFileRoute("/_app/checklists/")({
  head: () => ({ meta: [{ title: "Checklists — SST" }] }),
  component: ListaChecklists,
});

function ListaChecklists() {
  const {
    data: checklistsResult,
    isError,
    isLoading,
  } = useChecklists({
    isActive: true,
  });
  const checklists = checklistsResult?.success ? checklistsResult.data.items : [];
  const errorMessage =
    checklistsResult && !checklistsResult.success
      ? checklistsResult.message
      : "Não foi possível carregar os checklists.";

  return (
    <div>
      <PageHeader
        title="Biblioteca de checklists"
        description="Modelos de checklist por norma regulamentadora."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Novo modelo
          </Button>
        }
      />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="h-5 w-20 rounded bg-muted" />
                </div>
                <div className="mt-3 h-4 w-44 rounded bg-muted" />
                <div className="mt-2 h-3 w-32 rounded bg-muted" />
                <div className="mt-4 h-10 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}

        {(isError || (checklistsResult && !checklistsResult.success)) && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="p-5 text-sm text-muted-foreground">{errorMessage}</CardContent>
          </Card>
        )}

        {!isLoading && !isError && checklistsResult?.success && checklists.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="p-5 text-sm text-muted-foreground">
              Nenhum checklist cadastrado.
            </CardContent>
          </Card>
        )}

        {checklists.map((c) => (
          <Link key={c.id} to="/checklists/$id" params={{ id: c.id }}>
            <Card className="h-full transition hover:border-primary hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{c.isTemplate ? "Template" : "Personalizado"}</Badge>
                </div>
                <div className="mt-3 font-semibold">{c.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {c.isActive ? "Ativo" : "Inativo"}
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {c.description ?? "Sem descrição cadastrada."}
                </p>
                <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
                  <span>Itens serão integrados na próxima etapa</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
