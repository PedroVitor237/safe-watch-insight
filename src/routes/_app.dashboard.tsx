import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertTriangle, ClipboardCheck, TrendingDown, TrendingUp, Timer, ShieldCheck, ChevronRight,
} from "lucide-react";
import { kpisMock, empresas } from "@/mocks/data";
import { useStore } from "@/lib/mockStore";
import { fmtData } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SST Inspeções" }] }),
  component: Dashboard,
});

function Kpi({
  icon: Icon, label, value, suffix, variation, positiveIsGood = true,
}: {
  icon: any; label: string; value: number | string; suffix?: string;
  variation: number; positiveIsGood?: boolean;
}) {
  const positive = variation >= 0;
  const isGood = positiveIsGood ? positive : !positive;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-2 text-3xl font-bold tracking-tight">
              {value}
              {suffix && <span className="ml-1 text-base font-medium text-muted-foreground">{suffix}</span>}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className={`mt-3 flex items-center gap-1 text-xs ${isGood ? "text-success" : "text-destructive"}`}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(variation)}% vs mês anterior
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { inspecoes, ncs } = useStore((s) => s);
  const proximas = inspecoes
    .filter((i) => i.status === "planejada" || i.status === "em_andamento")
    .slice(0, 5);
  const ncsCriticas = ncs.filter((n) => n.criticidade === "critica").slice(0, 4);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral das inspeções, conformidade e não conformidades."
      />

      <div className="space-y-6 p-4 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={ClipboardCheck} label="Inspeções no mês" value={kpisMock.inspecoesMes} variation={kpisMock.inspecoesMesVar} />
          <Kpi icon={AlertTriangle} label="NCs abertas" value={kpisMock.ncsAbertas} variation={kpisMock.ncsAbertasVar} positiveIsGood={false} />
          <Kpi icon={ShieldCheck} label="Taxa de conformidade" value={kpisMock.taxaConformidade} suffix="%" variation={kpisMock.taxaConformidadeVar} />
          <Kpi icon={Timer} label="Prazo médio resolução" value={kpisMock.prazoMedioResolucaoDias} suffix="dias" variation={kpisMock.prazoMedioVar} positiveIsGood={false} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Inspeções por mês</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpisMock.inspecoesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Legend />
                  <Bar dataKey="planejadas" name="Planejadas" fill="oklch(0.62 0.13 235)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="concluidas" name="Concluídas" fill="oklch(0.62 0.16 152)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">NCs por criticidade</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={kpisMock.ncsPorCriticidade} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                    {kpisMock.ncsPorCriticidade.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">NCs por norma</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpisMock.ncsPorNorma} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="norma" className="text-xs" width={60} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="quantidade" fill="oklch(0.42 0.09 220)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                NCs críticas
                <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
                  {ncsCriticas.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {ncsCriticas.map((nc) => (
                <Link
                  key={nc.id}
                  to="/nao-conformidades/$id"
                  params={{ id: nc.id }}
                  className="flex items-start gap-2 rounded-md border p-3 text-left hover:bg-accent"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{nc.titulo}</div>
                    <div className="text-xs text-muted-foreground">
                      {nc.codigo} · prazo {fmtData(nc.prazo)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
              {ncsCriticas.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">Sem NCs críticas.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Próximas inspeções
              <Button asChild variant="ghost" size="sm">
                <Link to="/inspecoes">Ver todas</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {proximas.map((i) => {
              const emp = empresas.find((e) => e.id === i.empresaId);
              return (
                <Link
                  key={i.id}
                  to="/inspecoes/$id"
                  params={{ id: i.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{i.titulo}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {emp?.nomeFantasia} · {fmtData(i.agendadaPara)}
                    </div>
                  </div>
                  <StatusBadge value={i.status} />
                </Link>
              );
            })}
            {proximas.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma inspeção em andamento ou planejada.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
