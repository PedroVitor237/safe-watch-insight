import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useChecklist } from "@/hooks/useChecklists";

export const Route = createFileRoute("/_app/checklists/$id")({
  head: () => ({ meta: [{ title: "Editor de checklist — SST" }] }),
  component: EditorChecklist,
});

function EditorChecklist() {
  const { id } = Route.useParams();
  const { data: checklistResult, isError, isLoading } = useChecklist(id);
  const checklist = checklistResult?.success ? checklistResult.data : null;

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando checklist...</div>;
  }

  if (isError || !checklistResult?.success || !checklist) {
    return <div className="p-8">Checklist não encontrado.</div>;
  }

  return (
    <div>
      <PageHeader
        title={checklist.title}
        description={checklist.description ?? "Sem descrição cadastrada."}
        actions={
          <Button asChild variant="outline">
            <Link to="/checklists">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do checklist</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="outline">{checklist.isTemplate ? "Template" : "Personalizado"}</Badge>
            <StatusBadge value={checklist.isActive ? "ativo" : "inativo"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Itens do checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-sm text-muted-foreground">
              Os itens serão integrados na próxima etapa.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
