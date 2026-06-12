import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Printer, FileText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/mockStore";
import { checklists, empresas, usuarios } from "@/mocks/data";
import { fmtData, fmtDataHora } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — SST" }] }),
  component: Relatorios,
});

function Relatorios() {
  const inspecoes = useStore((s) => s.inspecoes);
  const concluidas = inspecoes.filter((i) => i.status === "concluida" || i.status === "pendente_sync");
  const [id, setId] = useState(concluidas[0]?.id ?? "");
  const ins = inspecoes.find((i) => i.id === id);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Geração e visualização de relatórios de inspeção."
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Imprimir</Button>
            <Button onClick={() => toast.success("PDF gerado (mock)")}><Download className="h-4 w-4" />Exportar PDF</Button>
          </>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        <Card className="p-3">
          <Select value={id} onValueChange={setId}>
            <SelectTrigger><SelectValue placeholder="Selecione uma inspeção…" /></SelectTrigger>
            <SelectContent>
              {concluidas.map((i) => <SelectItem key={i.id} value={i.id}>{i.codigo} — {i.titulo}</SelectItem>)}
            </SelectContent>
          </Select>
        </Card>

        {ins ? <PreviewRelatorio insId={ins.id} /> : (
          <Card className="p-12 text-center text-sm text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8" />Nenhuma inspeção concluída para gerar relatório.
          </Card>
        )}
      </div>
    </div>
  );
}

function PreviewRelatorio({ insId }: { insId: string }) {
  const ins = useStore((s) => s.inspecoes.find((x) => x.id === insId))!;
  const ncs = useStore((s) => s.ncs.filter((n) => n.inspecaoId === insId));
  const checklist = checklists.find((c) => c.id === ins.checklistId)!;
  const emp = empresas.find((e) => e.id === ins.empresaId)!;
  const insp = usuarios.find((u) => u.id === ins.inspetorId)!;
  const itens = checklist.secoes.flatMap((s) => s.itens);
  const conformes = itens.filter((i) => ins.respostas[i.id]?.resposta === "conforme").length;

  return (
    <Card className="bg-white p-6 sm:p-10 text-sm leading-relaxed shadow-sm">
      <CardContent className="space-y-6 p-0">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Relatório de Inspeção</div>
            <h2 className="mt-1 text-xl font-bold">{ins.titulo}</h2>
            <div className="text-xs text-muted-foreground">{ins.codigo}</div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Emitido em {fmtData(new Date().toISOString())}</div>
            <div>SST Inspeções v1.0</div>
          </div>
        </div>

        <section className="grid gap-2 sm:grid-cols-2">
          <Field k="Empresa" v={`${emp.nomeFantasia} (${emp.razaoSocial})`} />
          <Field k="CNPJ" v={emp.cnpj} />
          <Field k="Unidade" v={emp.unidades.find((u) => u.id === ins.unidadeId)?.nome ?? "—"} />
          <Field k="Setor" v={emp.setor} />
          <Field k="Inspetor" v={`${insp.nome} (${insp.registroProfissional})`} />
          <Field k="Checklist" v={`${checklist.titulo} v${checklist.versao}`} />
          <Field k="Início" v={fmtDataHora(ins.iniciadaEm)} />
          <Field k="Conclusão" v={fmtDataHora(ins.concluidaEm)} />
        </section>

        <section>
          <h3 className="font-semibold">Resumo</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <Box label="Total de itens" value={itens.length} />
            <Box label="Conformes" value={conformes} accent="success" />
            <Box label="Não conformes" value={itens.length - conformes} accent="destructive" />
          </div>
        </section>

        <section>
          <h3 className="font-semibold">Detalhamento</h3>
          <div className="mt-2 divide-y rounded-md border">
            {itens.map((it) => {
              const r = ins.respostas[it.id];
              return (
                <div key={it.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-3">
                  <div className="min-w-0">
                    <div className="text-sm">{it.texto}</div>
                    {r?.observacao && <div className="mt-1 text-xs italic text-muted-foreground">↳ {r.observacao}</div>}
                  </div>
                  <StatusBadge value={r?.resposta ?? "na"} />
                </div>
              );
            })}
          </div>
        </section>

        {ncs.length > 0 && (
          <section>
            <h3 className="font-semibold">Não conformidades registradas</h3>
            <div className="mt-2 space-y-2">
              {ncs.map((nc) => (
                <div key={nc.id} className="rounded-md border p-3">
                  <div className="flex justify-between"><strong>{nc.codigo}</strong><StatusBadge value={nc.criticidade} /></div>
                  <div className="text-sm">{nc.titulo}</div>
                  <div className="text-xs text-muted-foreground">{nc.descricao}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {ins.assinaturaResponsavel && (
          <section className="border-t pt-4">
            <div className="text-xs text-muted-foreground">Assinatura do responsável</div>
            <img src={ins.assinaturaResponsavel} alt="Assinatura" className="mt-2 h-24 border-b" />
          </section>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
function Box({ label, value, accent }: { label: string; value: number; accent?: "success" | "destructive" }) {
  const cls = accent === "success" ? "text-success" : accent === "destructive" ? "text-destructive" : "";
  return (
    <div className="rounded-md border p-3">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${cls}`}>{value}</div>
    </div>
  );
}
