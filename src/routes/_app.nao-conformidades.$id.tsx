import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Paperclip, Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useStore, store } from "@/lib/mockStore";
import { empresas, usuarios } from "@/mocks/data";
import { fmtData, fmtDataHora } from "@/lib/format";
import { toast } from "sonner";
import type { PlanoAcao, StatusNC } from "@/types/sst";

export const Route = createFileRoute("/_app/nao-conformidades/$id")({
  head: () => ({ meta: [{ title: "Não conformidade — SST" }] }),
  component: DetalheNC,
});

function DetalheNC() {
  const { id } = Route.useParams();
  const nc = useStore((s) => s.ncs.find((x) => x.id === id));
  const [plano, setPlano] = useState<PlanoAcao>(
    nc?.planoAcao ?? { oQue: "", porQue: "", onde: "", quem: "", quando: "", como: "", quanto: "" }
  );

  if (!nc) return <div className="p-8">NC não encontrada.</div>;
  const emp = empresas.find((e) => e.id === nc.empresaId);
  const resp = usuarios.find((u) => u.id === nc.responsavelId);

  function salvarPlano() {
    store.upsertNC({
      ...nc!,
      planoAcao: plano,
      status: nc!.status === "aberta" ? "em_tratativa" : nc!.status,
      timeline: [
        ...nc!.timeline,
        { id: `t${Date.now()}`, data: new Date().toISOString(), autor: "Você", descricao: "Plano de ação atualizado" },
      ],
    });
    toast.success("Plano de ação salvo");
  }

  function mudarStatus(s: StatusNC) {
    store.upsertNC({
      ...nc!,
      status: s,
      timeline: [
        ...nc!.timeline,
        { id: `t${Date.now()}`, data: new Date().toISOString(), autor: "Você", descricao: `Status alterado para ${s}` },
      ],
    });
    toast.success("Status atualizado");
  }

  return (
    <div>
      <PageHeader
        title={nc.titulo}
        description={`${nc.codigo} · ${emp?.nomeFantasia}`}
        actions={
          <>
            <StatusBadge value={nc.criticidade} />
            <StatusBadge value={nc.status} />
            <Button asChild variant="outline" size="sm">
              <Link to="/nao-conformidades"><ArrowLeft className="h-4 w-4" />Voltar</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 p-4 sm:p-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Descrição</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{nc.descricao}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Plano de ação 5W2H</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {([
                ["oQue", "O quê?"], ["porQue", "Por quê?"], ["onde", "Onde?"],
                ["quem", "Quem?"], ["quando", "Quando?"], ["como", "Como?"], ["quanto", "Quanto custa?"],
              ] as const).map(([k, l]) => (
                <div key={k} className={k === "como" ? "sm:col-span-2 space-y-2" : "space-y-2"}>
                  <Label>{l}</Label>
                  {k === "como" ? (
                    <Textarea rows={3} value={plano[k] ?? ""} onChange={(e) => setPlano({ ...plano, [k]: e.target.value })} />
                  ) : (
                    <Input value={plano[k] ?? ""} onChange={(e) => setPlano({ ...plano, [k]: e.target.value })} />
                  )}
                </div>
              ))}
              <div className="sm:col-span-2 flex justify-end">
                <Button onClick={salvarPlano}><Save className="h-4 w-4" />Salvar plano</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative space-y-6 border-l pl-6">
                {nc.timeline.map((ev) => (
                  <li key={ev.id} className="relative">
                    <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary" />
                    <div className="text-sm font-medium">{ev.descricao}</div>
                    <div className="text-xs text-muted-foreground">{fmtDataHora(ev.data)} · {ev.autor}</div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Detalhes</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row k="Aberta em" v={fmtData(nc.abertaEm)} />
              <Row k="Prazo" v={fmtData(nc.prazo)} />
              <Row k="Empresa" v={emp?.nomeFantasia ?? "—"} />
              <Row k="Responsável" v={resp?.nome ?? "—"} />
              <Row k="Inspeção" v={nc.inspecaoId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent>
              <Select value={nc.status} onValueChange={(v) => mudarStatus(v as StatusNC)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em_tratativa">Em tratativa</SelectItem>
                  <SelectItem value="resolvida">Resolvida</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Evidências</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {nc.evidencias.length === 0 && <div className="text-sm text-muted-foreground">Sem anexos</div>}
              {nc.evidencias.map((e, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />{e}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info("Anexo mock")}>
                <Paperclip className="h-4 w-4" />Anexar evidência
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}
