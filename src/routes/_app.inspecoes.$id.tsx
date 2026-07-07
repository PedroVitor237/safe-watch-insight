import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, FileSignature, MinusCircle, Trash2, XCircle } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useFinishInspection, useSaveInspectionResponse } from "@/hooks/useInspectionResponses";
import { useInspection } from "@/hooks/useInspections";
import { fmtDataHora } from "@/lib/format";
import { toast } from "sonner";

type UiInspectionStatus = "planejada" | "em_andamento" | "concluida" | "pendente_sync";
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
    CANCELLED: "pendente_sync",
  };

  return map[status] ?? "pendente_sync";
}

function DetalheInspecao() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const inspectionQuery = useInspection(id);
  const saveResponse = useSaveInspectionResponse();
  const finishInspection = useFinishInspection();

  const inspectionResult = inspectionQuery.data;
  const inspection = inspectionResult?.success ? inspectionResult.data : null;
  const items = inspection?.checklist.items ?? [];
  const responses = inspection?.responses ?? [];
  const responseByItemId = useMemo(
    () => new Map(responses.map((response) => [response.checklistItemId, response])),
    [responses],
  );

  const totalItens = items.length;
  const respondidos = responses.length;
  const ncCount = responses.filter((response) => response.status === "NON_COMPLIANT").length;
  const progresso = totalItens ? Math.round((respondidos / totalItens) * 100) : 0;
  const isCompleted = inspection?.status === "COMPLETED";

  async function setResposta(
    checklistItemId: string,
    status: UiResponseStatus,
    observation?: string | null,
  ) {
    const result = await saveResponse.mutateAsync({
      inspectionId: id,
      checklistItemId,
      status: uiResponseStatusToBackend[status],
      observation,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Resposta salva.");
  }

  async function setObservacao(
    checklistItemId: string,
    status: BackendResponseStatus,
    observation: string,
  ) {
    const result = await saveResponse.mutateAsync({
      inspectionId: id,
      checklistItemId,
      status,
      observation,
    });

    if (!result.success) {
      toast.error(result.message);
    }
  }

  async function concluir() {
    const result = await finishInspection.mutateAsync(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Inspeção concluída!");
    navigate({ to: "/inspecoes" });
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
        title={inspection.checklist.title}
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
                <CardTitle className="text-base">{inspection.checklist.title}</CardTitle>
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
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-1.5">
                            <Button
                              size="sm"
                              variant={uiStatus === "conforme" ? "default" : "outline"}
                              className={
                                uiStatus === "conforme" ? "bg-success hover:bg-success/90" : ""
                              }
                              disabled={isCompleted || saveResponse.isPending}
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
                              disabled={isCompleted || saveResponse.isPending}
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
                              disabled={isCompleted || saveResponse.isPending}
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
                              disabled={isCompleted || saveResponse.isPending}
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
              disabled={isCompleted || finishInspection.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EncerrarInspecao({ onConcluir, disabled }: { onConcluir: () => void; disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
    }
  }, []);

  function pos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();

    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Encerramento e assinatura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Após encerrar, a inspeção será marcada como concluída.
        </p>
        <div className="rounded-md border bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={180}
            className="block w-full touch-none rounded-md"
            onPointerDown={(e) => {
              if (disabled) {
                return;
              }

              setDrawing(true);
              const ctx = canvasRef.current!.getContext("2d")!;
              const point = pos(e);
              ctx.beginPath();
              ctx.moveTo(point.x, point.y);
            }}
            onPointerMove={(e) => {
              if (!drawing) {
                return;
              }

              const ctx = canvasRef.current!.getContext("2d")!;
              const point = pos(e);
              ctx.lineTo(point.x, point.y);
              ctx.stroke();
              setHasSig(true);
            }}
            onPointerUp={() => setDrawing(false)}
            onPointerLeave={() => setDrawing(false)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => {
              const canvas = canvasRef.current!;
              canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
              setHasSig(false);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Limpar
          </Button>
          <Button disabled={disabled || !hasSig} onClick={onConcluir}>
            <FileSignature className="h-4 w-4" />
            Concluir e assinar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
