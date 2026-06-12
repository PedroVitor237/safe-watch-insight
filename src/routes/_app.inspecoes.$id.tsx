import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  ArrowLeft, MapPin, Camera, CheckCircle2, XCircle, MinusCircle,
  AlertTriangle, FileSignature, Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useStore, store } from "@/lib/mockStore";
import { checklists, empresas, usuarios } from "@/mocks/data";
import { fmtDataHora } from "@/lib/format";
import type { RespostaItem, NaoConformidade } from "@/types/sst";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/inspecoes/$id")({
  head: () => ({ meta: [{ title: "Inspeção — SST" }] }),
  component: DetalheInspecao,
  notFoundComponent: () => <div className="p-8">Inspeção não encontrada</div>,
});

function DetalheInspecao() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const inspecao = useStore((s) => s.inspecoes.find((i) => i.id === id));

  if (!inspecao) {
    return (
      <div className="p-8">
        <Button asChild variant="ghost"><Link to="/inspecoes"><ArrowLeft className="h-4 w-4" />Voltar</Link></Button>
        <p className="mt-4 text-muted-foreground">Inspeção não encontrada.</p>
      </div>
    );
  }

  const checklist = checklists.find((c) => c.id === inspecao.checklistId)!;
  const emp = empresas.find((e) => e.id === inspecao.empresaId)!;
  const insp = usuarios.find((u) => u.id === inspecao.inspetorId)!;

  const totalItens = checklist.secoes.reduce((s, sec) => s + sec.itens.length, 0);
  const respondidos = Object.keys(inspecao.respostas).length;
  const ncCount = Object.values(inspecao.respostas).filter((r) => r?.resposta === "nao_conforme").length;
  const progresso = totalItens ? Math.round((respondidos / totalItens) * 100) : 0;

  function setResposta(itemId: string, resposta: RespostaItem, observacao?: string) {
    const atual = inspecao!.respostas[itemId];
    const novas = {
      ...inspecao!.respostas,
      [itemId]: { resposta, observacao: observacao ?? atual?.observacao },
    };
    store.upsertInspecao({
      ...inspecao!,
      respostas: novas,
      status: inspecao!.status === "planejada" ? "em_andamento" : inspecao!.status,
      iniciadaEm: inspecao!.iniciadaEm ?? new Date().toISOString(),
    });

    if (resposta === "nao_conforme" && atual?.resposta !== "nao_conforme") {
      const nc: NaoConformidade = {
        id: `nc${Date.now()}`,
        codigo: `NC-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        titulo: `NC identificada em ${checklist.titulo}`,
        descricao: observacao ?? "Não conformidade registrada durante a inspeção.",
        inspecaoId: inspecao!.id,
        empresaId: inspecao!.empresaId,
        itemChecklistId: itemId,
        criticidade: "alta",
        status: "aberta",
        abertaEm: new Date().toISOString(),
        prazo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        responsavelId: "u3",
        evidencias: [],
        timeline: [
          { id: "t1", data: new Date().toISOString(), autor: insp.nome, descricao: "NC criada a partir de inspeção" },
        ],
      };
      store.upsertNC(nc);
      toast.warning("Não conformidade criada automaticamente");
    }
  }

  function setObservacao(itemId: string, observacao: string) {
    const atual = inspecao!.respostas[itemId];
    store.upsertInspecao({
      ...inspecao!,
      respostas: { ...inspecao!.respostas, [itemId]: { resposta: atual?.resposta ?? null, observacao } },
    });
  }

  function concluir(assinatura: string) {
    store.upsertInspecao({
      ...inspecao!,
      status: "concluida",
      concluidaEm: new Date().toISOString(),
      assinaturaResponsavel: assinatura,
      timeline: [
        ...inspecao!.timeline,
        { id: `t${Date.now()}`, data: new Date().toISOString(), autor: insp.nome, descricao: "Inspeção concluída e assinada" },
      ],
    });
    toast.success("Inspeção concluída!");
    navigate({ to: "/relatorios" });
  }

  return (
    <div>
      <PageHeader
        title={inspecao.titulo}
        description={`${inspecao.codigo} · ${emp.nomeFantasia}`}
        actions={
          <>
            <StatusBadge value={inspecao.status} />
            <Button asChild variant="outline" size="sm">
              <Link to="/inspecoes"><ArrowLeft className="h-4 w-4" />Voltar</Link>
            </Button>
          </>
        }
      />

      <div className="p-4 sm:p-8 space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Progresso</div><div className="mt-1 text-2xl font-bold">{progresso}%</div><div className="text-xs text-muted-foreground">{respondidos}/{totalItens} itens</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Não conformidades</div><div className="mt-1 text-2xl font-bold text-destructive">{ncCount}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Inspetor</div><div className="mt-1 text-sm font-medium">{insp.nome}</div><div className="text-xs text-muted-foreground">{insp.registroProfissional}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Geolocalização</div><div className="mt-1 flex items-center gap-1 text-sm"><MapPin className="h-3.5 w-3.5" />-23.6815, -46.5658</div><div className="text-xs text-muted-foreground">{fmtDataHora(inspecao.iniciadaEm)}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="execucao">
          <TabsList>
            <TabsTrigger value="execucao">Execução do checklist</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="encerrar">Encerrar</TabsTrigger>
          </TabsList>

          <TabsContent value="execucao" className="space-y-4">
            {checklist.secoes.map((sec) => (
              <Card key={sec.id}>
                <CardHeader><CardTitle className="text-base">{sec.titulo}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {sec.itens.map((item) => {
                    const resp = inspecao.respostas[item.id];
                    return (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{item.texto}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <StatusBadge value={item.criticidade} className="text-[10px]" />
                              {item.normaRef && <span>· {item.normaRef}</span>}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-1.5">
                            <Button size="sm" variant={resp?.resposta === "conforme" ? "default" : "outline"} className={resp?.resposta === "conforme" ? "bg-success hover:bg-success/90" : ""} onClick={() => setResposta(item.id, "conforme")}>
                              <CheckCircle2 className="h-3.5 w-3.5" />Conforme
                            </Button>
                            <Button size="sm" variant={resp?.resposta === "nao_conforme" ? "destructive" : "outline"} onClick={() => setResposta(item.id, "nao_conforme", resp?.observacao)}>
                              <XCircle className="h-3.5 w-3.5" />NC
                            </Button>
                            <Button size="sm" variant={resp?.resposta === "na" ? "secondary" : "outline"} onClick={() => setResposta(item.id, "na")}>
                              <MinusCircle className="h-3.5 w-3.5" />N/A
                            </Button>
                          </div>
                        </div>
                        {(resp?.resposta === "nao_conforme" || resp?.observacao) && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder="Observações, evidências verbais, contexto…"
                              value={resp?.observacao ?? ""}
                              onChange={(e) => setObservacao(item.id, e.target.value)}
                              rows={2}
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" onClick={() => toast.info("Evidência (mock) anexada")}>
                                <Camera className="h-3.5 w-3.5" />Anexar foto
                              </Button>
                              {resp?.resposta === "nao_conforme" && (
                                <span className="inline-flex items-center gap-1 text-xs text-destructive">
                                  <AlertTriangle className="h-3.5 w-3.5" />NC gerada automaticamente
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="timeline">
            <Card><CardContent className="p-6">
              <ol className="relative space-y-6 border-l pl-6">
                {inspecao.timeline.map((ev) => (
                  <li key={ev.id} className="relative">
                    <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary" />
                    <div className="text-sm font-medium">{ev.descricao}</div>
                    <div className="text-xs text-muted-foreground">{fmtDataHora(ev.data)} · {ev.autor}</div>
                  </li>
                ))}
              </ol>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="encerrar">
            <EncerrarInspecao onConcluir={concluir} disabled={inspecao.status === "concluida"} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EncerrarInspecao({ onConcluir, disabled }: { onConcluir: (sig: string) => void; disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
    }
  }, []);

  function pos(e: React.PointerEvent) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Encerramento e assinatura</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Coleta de assinatura do responsável pela área inspecionada. Após encerrar, a inspeção será marcada como
          concluída e estará disponível para geração de relatório.
        </p>
        <div className="rounded-md border bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={180}
            className="block w-full touch-none rounded-md"
            onPointerDown={(e) => {
              if (disabled) return;
              setDrawing(true);
              const ctx = canvasRef.current!.getContext("2d")!;
              const p = pos(e);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
            }}
            onPointerMove={(e) => {
              if (!drawing) return;
              const ctx = canvasRef.current!.getContext("2d")!;
              const p = pos(e);
              ctx.lineTo(p.x, p.y);
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
            onClick={() => {
              const c = canvasRef.current!;
              c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
              setHasSig(false);
            }}
          >
            <Trash2 className="h-4 w-4" />Limpar
          </Button>
          <Button
            disabled={disabled || !hasSig}
            onClick={() => onConcluir(canvasRef.current!.toDataURL())}
          >
            <FileSignature className="h-4 w-4" />Concluir e assinar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
