import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MinusCircle, XCircle } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useFinishInspection, useSaveInspectionResponse } from "@/hooks/useInspectionResponses";
import { useInspection } from "@/hooks/useInspections";
import { fmtDataHora } from "@/lib/format";
import { toast } from "sonner";

type UiInspectionStatus = "planejada" | "em_andamento" | "concluida" | "cancelada";
type UiResponseStatus = "conforme" | "nao_conforme" | "na";
type BackendResponseStatus = "COMPLIANT" | "NON_COMPLIANT" | "NOT_APPLICABLE";

const responseStatusToUi: Record<BackendResponseStatus, UiResponseStatus> = {
  COMPLIANT: "conforme",
  NON_COMPLIANT: "nao_conforme",
  NOT_APPLICABLE: "na",
};

const uiResponseStatusToBackend: Record<UiResponseStatus, BackendResponseStatus> = {
  conforme: "COMPLIANT",
  nao_conforme: "NON_COMPLIANT",
  na: "NOT_APPLICABLE",
};

export const Route = createFileRoute("/_app/inspecoes/$id")({
  head: () => ({ meta: [{ title: "Inspeção — SST" }] }),
  component: DetalheInspecao,
  notFoundComponent: () => <div className="p-8">Inspeção não encontrada</div>,
});

function toUiInspectionStatus(status: string): UiInspectionStatus {
  const map: Record<string, UiInspectionStatus> = {
    PLANNED: "planejada",
    IN_PROGRESS: "em_andamento",
    COMPLETED: "concluida",
    CANCELLED: "cancelada",
  };

  return map[status] ?? "cancelada";
}

function DetalheInspecao() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const inspectionQuery = useInspection(id);
  const saveResponse = useSaveInspectionResponse();
  const finishInspection = useFinishInspection();

  const inspectionResult = inspectionQuery.data;
  const inspection = inspectionResult?.success ? inspectionResult.data : null;
  const items = inspection?.snapshot?.items ?? [];
  const responses = inspection?.responses ?? [];
  const responseByItemId = new Map(
    responses
      .filter((response) => response.snapshotItemId !== null)
      .map((response) => [response.snapshotItemId as string, response]),
  );

  const totalItens = items.length;
  const respondidos = responses.length;
  const ncCount = responses.filter((response) => response.status === "NON_COMPLIANT").length;
  const progresso = totalItens ? Math.round((respondidos / totalItens) * 100) : 0;
  const isReadOnly = inspection?.status === "COMPLETED" || inspection?.status === "CANCELLED";

  async function setResposta(
    snapshotItemId: string,
    status: UiResponseStatus,
    observation?: string | null,
  ) {
    try {
      const result = await saveResponse.mutateAsync({
        inspectionId: id,
        snapshotItemId,
        status: uiResponseStatusToBackend[status],
        observation,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Resposta salva.");
    } catch {
      toast.error("Não foi possível salvar a resposta. Tente novamente.");
    }
  }

  async function setObservacao(
    snapshotItemId: string,
    status: BackendResponseStatus,
    observation: string,
  ) {
    try {
      const result = await saveResponse.mutateAsync({
        inspectionId: id,
        snapshotItemId,
        status,
        observation,
      });

      if (!result.success) {
        toast.error(result.message);
      }
    } catch {
      toast.error("Não foi possível salvar a observação. Tente novamente.");
    }
  }

  async function concluir() {
    try {
      const result = await finishInspection.mutateAsync(id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Inspeção concluída!");
      navigate({ to: "/inspecoes" });
    } catch {
      toast.error("Não foi possível concluir a inspeção. Tente novamente.");
    }
  }

  if (inspectionQuery.isLoading) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Carregando inspeção...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="p-8">
        <Button asChild variant="ghost">
          <Link to="/inspecoes">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <p className="mt-4 text-muted-foreground">
          {inspectionResult?.success === false
            ? inspectionResult.message
            : "Inspeção não encontrada."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={inspection.snapshot?.title ?? "Snapshot indisponível"}
        description={`${inspection.id.slice(0, 8)} · ${
          inspection.company.tradeName ?? inspection.company.corporateName
        }`}
        actions={
          <>
            <StatusBadge value={toUiInspectionStatus(inspection.status)} />
            <Button asChild variant="outline" size="sm">
              <Link to="/inspecoes">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-4 sm:p-8">
        {inspection.snapshot?.integrityStatus === "UNVERIFIED_LEGACY" && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="p-4 text-sm text-muted-foreground">
              Este registro foi estabilizado a partir dos dados legados disponíveis. O conteúdo não
              pode ser certificado como a versão exata existente na data original, mas não será mais
              alterado por edições no checklist.
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Progresso</div>
              <div className="mt-1 text-2xl font-bold">{progresso}%</div>
              <div className="text-xs text-muted-foreground">
                {respondidos}/{totalItens} itens
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Não conformidades</div>
              <div className="mt-1 text-2xl font-bold text-destructive">{ncCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Inspetor</div>
              <div className="mt-1 text-sm font-medium">{inspection.user.name}</div>
              <div className="text-xs text-muted-foreground">{inspection.user.email}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Data da inspeção</div>
              <div className="mt-1 text-sm font-medium">
                {fmtDataHora(inspection.inspectionDate)}
              </div>
              <div className="text-xs text-muted-foreground">
                Atualizada em {fmtDataHora(inspection.updatedAt)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="execucao">
          <TabsList>
            <TabsTrigger value="execucao">Execução do checklist</TabsTrigger>
            <TabsTrigger value="encerrar">Encerrar</TabsTrigger>
          </TabsList>

          <TabsContent value="execucao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  {inspection.snapshot?.title ?? "Snapshot indisponível"}
                  {inspection.snapshot && (
                    <Badge variant="secondary">v{inspection.snapshot.sourceVersionNumber}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Este checklist ainda não possui itens cadastrados.
                  </p>
                ) : (
                  items.map((item) => {
                    const response = responseByItemId.get(item.id);
                    const uiStatus = response
                      ? responseStatusToUi[response.status as BackendResponseStatus]
                      : null;

                    return (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{item.description}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Item {item.orderIndex}
                              {item.isRequired ? " · obrigatório" : ""}
                            </div>
                            {item.standards.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.standards.map((standard) => (
                                  <Badge key={standard.standardId} variant="outline">
                                    {standard.code}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-1.5">
                            <Button
                              size="sm"
                              variant={uiStatus === "conforme" ? "default" : "outline"}
                              className={
                                uiStatus === "conforme" ? "bg-success hover:bg-success/90" : ""
                              }
                              disabled={isReadOnly || saveResponse.isPending}
                              onClick={() =>
                                setResposta(item.id, "conforme", response?.observation ?? null)
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Conforme
                            </Button>
                            <Button
                              size="sm"
                              variant={uiStatus === "nao_conforme" ? "destructive" : "outline"}
                              disabled={isReadOnly || saveResponse.isPending}
                              onClick={() =>
                                setResposta(item.id, "nao_conforme", response?.observation ?? null)
                              }
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              NC
                            </Button>
                            <Button
                              size="sm"
                              variant={uiStatus === "na" ? "secondary" : "outline"}
                              disabled={isReadOnly || saveResponse.isPending}
                              onClick={() =>
                                setResposta(item.id, "na", response?.observation ?? null)
                              }
                            >
                              <MinusCircle className="h-3.5 w-3.5" />
                              N/A
                            </Button>
                          </div>
                        </div>
                        {response && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder="Observações, evidências verbais, contexto..."
                              defaultValue={response.observation ?? ""}
                              disabled={isReadOnly || saveResponse.isPending}
                              rows={2}
                              onBlur={(event) =>
                                setObservacao(item.id, response.status, event.target.value)
                              }
                            />
                            {uiStatus === "nao_conforme" && (
                              <span className="inline-flex items-center text-xs text-destructive">
                                Não conformidade identificada.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encerrar">
            <EncerrarInspecao
              onConcluir={concluir}
              disabled={isReadOnly || finishInspection.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EncerrarInspecao({ onConcluir, disabled }: { onConcluir: () => void; disabled: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Encerramento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Após encerrar, a inspeção será marcada como concluída e não poderá mais receber respostas.
        </p>
        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          A assinatura digital ainda não está disponível. Ela será habilitada somente quando houver
          persistência segura, vínculo com o signatário e trilha de auditoria.
        </div>
        <Button disabled={disabled} onClick={onConcluir}>
          <CheckCircle2 className="h-4 w-4" />
          Concluir inspeção
        </Button>
      </CardContent>
    </Card>
  );
}
