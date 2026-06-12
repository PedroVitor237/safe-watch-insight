import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { empresas, checklists, usuarios } from "@/mocks/data";
import { store } from "@/lib/mockStore";
import { toast } from "sonner";
import type { Inspecao } from "@/types/sst";

export const Route = createFileRoute("/_app/inspecoes/nova")({
  head: () => ({ meta: [{ title: "Nova inspeção — SST" }] }),
  component: NovaInspecao,
});

function NovaInspecao() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(1);
  const [empresaId, setEmpresaId] = useState("");
  const [unidadeId, setUnidadeId] = useState("");
  const [checklistId, setChecklistId] = useState("");
  const [inspetorId, setInspetorId] = useState("u1");
  const [agendada, setAgendada] = useState("");
  const [titulo, setTitulo] = useState("");
  const [obs, setObs] = useState("");

  const emp = empresas.find((e) => e.id === empresaId);

  function finalizar() {
    const id = `ins${Date.now()}`;
    const nova: Inspecao = {
      id,
      codigo: `INS-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      titulo: titulo || "Nova inspeção",
      empresaId, unidadeId, checklistId, inspetorId,
      agendadaPara: agendada || new Date().toISOString(),
      status: "planejada",
      respostas: {},
      timeline: [
        { id: "t1", data: new Date().toISOString(), autor: "Você", descricao: "Inspeção agendada" },
      ],
    };
    store.upsertInspecao(nova);
    toast.success("Inspeção criada com sucesso!");
    navigate({ to: "/inspecoes/$id", params: { id } });
  }

  return (
    <div>
      <PageHeader title="Nova inspeção" description="Defina empresa, checklist e agendamento." />
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${
                  passo >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {passo > n ? <Check className="h-4 w-4" /> : n}
              </div>
              {n < 3 && <div className={`h-px w-12 ${passo > n ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="space-y-4 p-6">
            {passo === 1 && (
              <>
                <h3 className="font-semibold">1. Empresa e unidade</h3>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Select value={empresaId} onValueChange={(v) => { setEmpresaId(v); setUnidadeId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
                    <SelectContent>
                      {empresas.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.nomeFantasia} — {e.setor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select value={unidadeId} onValueChange={setUnidadeId} disabled={!emp}>
                    <SelectTrigger><SelectValue placeholder={emp ? "Selecione…" : "Escolha a empresa antes"} /></SelectTrigger>
                    <SelectContent>
                      {emp?.unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {passo === 2 && (
              <>
                <h3 className="font-semibold">2. Checklist e título</h3>
                <div className="space-y-2">
                  <Label>Checklist / Norma</Label>
                  <Select value={checklistId} onValueChange={setChecklistId}>
                    <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
                    <SelectContent>
                      {checklists.map((c) => <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título da inspeção</Label>
                  <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Auditoria mensal de EPIs" />
                </div>
                <div className="space-y-2">
                  <Label>Observações iniciais</Label>
                  <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3} />
                </div>
              </>
            )}

            {passo === 3 && (
              <>
                <h3 className="font-semibold">3. Agendamento</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Data e hora</Label>
                    <Input type="datetime-local" value={agendada} onChange={(e) => setAgendada(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Inspetor responsável</Label>
                    <Select value={inspetorId} onValueChange={setInspetorId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {usuarios.filter((u) => u.perfil === "inspetor").map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-md border bg-muted/40 p-4 text-sm">
                  <div className="font-medium">Resumo</div>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>Empresa: {emp?.nomeFantasia ?? "—"}</li>
                    <li>Unidade: {emp?.unidades.find((u) => u.id === unidadeId)?.nome ?? "—"}</li>
                    <li>Checklist: {checklists.find((c) => c.id === checklistId)?.titulo ?? "—"}</li>
                  </ul>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setPasso((p) => Math.max(1, p - 1))} disabled={passo === 1}>
                <ChevronLeft className="h-4 w-4" />Voltar
              </Button>
              {passo < 3 ? (
                <Button
                  onClick={() => setPasso((p) => p + 1)}
                  disabled={(passo === 1 && (!empresaId || !unidadeId)) || (passo === 2 && !checklistId)}
                >
                  Avançar<ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={finalizar}>Criar inspeção</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
