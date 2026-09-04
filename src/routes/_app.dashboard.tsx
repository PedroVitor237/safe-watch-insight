import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  CircleCheckBig,
  ClipboardCheck,
  ClockAlert,
  FileText,
  Plus,
  RefreshCw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/useDashboard";
import { fmtData } from "@/lib/format";
import type { DashboardDto } from "@/server/services/dashboard.service";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SST Inspeções" }] }),
  component: Dashboard,
});

const inspectionStatusLabels: Record<string, string> = {
  PLANNED: "Planejadas",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluídas",
  CANCELLED: "Canceladas",
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const dashboardQuery = useDashboard();
  const result = dashboardQuery.data;
  const dashboard = result?.success ? result.data : null;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão operacional das inspeções e pendências registradas."
        actions={
          <Button asChild>
            <Link to="/inspecoes/nova">
              <Plus className="h-4 w-4" />
              Nova inspeção
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-8">
        {dashboardQuery.isLoading && <DashboardLoading />}

        {(dashboardQuery.isError || result?.success === false) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Não foi possível carregar o Dashboard</AlertTitle>
            <AlertDescription className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <span>Tente novamente em alguns instantes.</span>
              <Button variant="outline" size="sm" onClick={() => dashboardQuery.refetch()}>
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {dashboard && dashboard.summary.totalInspections === 0 && <DashboardEmptyState />}

        {dashboard && dashboard.summary.totalInspections > 0 && (
          <DashboardContent dashboard={dashboard} />
        )}
      </div>
    </div>
  );
}

function DashboardContent({ dashboard }: { dashboard: DashboardDto }) {
  const { summary, compliance } = dashboard;
  const chartData = dashboard.inspectionStatusDistribution.map((item) => ({
    label: inspectionStatusLabels[item.status] ?? item.status,
    quantidade: item.count,
  }));
  const attentionTotal =
    summary.plannedInspections + summary.overdueNonConformities + summary.overdueCorrectiveActions;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          icon={ClipboardCheck}
          label="Total de inspeções"
          value={summary.totalInspections}
          detail={`${summary.plannedInspections} planejadas · ${summary.cancelledInspections} canceladas`}
        />
        <SummaryCard
          icon={CircleCheckBig}
          label="Concluídas"
          value={summary.completedInspections}
          detail="Inspeções com execução finalizada"
        />
        <SummaryCard
          icon={Activity}
          label="Em andamento"
          value={summary.inProgressInspections}
          detail="Inspeções com respostas em edição"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="NCs abertas"
          value={summary.openNonConformities}
          detail={`${summary.totalNonConformities} no total · ${summary.resolvedNonConformities} resolvidas`}
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Conformidade"
          value={compliance.percentage === null ? "—" : `${compliance.percentage}%`}
          detail={
            compliance.percentage === null
              ? "Sem respostas aplicáveis em inspeções concluídas"
              : `${compliance.compliantResponses} conformes · ${compliance.nonCompliantResponses} não conformes`
          }
        />
      </div>

      <p className="text-xs text-muted-foreground">
        A conformidade considera somente respostas aplicáveis de inspeções concluídas; respostas
        “não aplicável” não entram no cálculo.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Inspeções por status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" allowDecimals={false} className="text-xs" />
                <YAxis type="category" dataKey="label" width={105} className="text-xs" />
                <Tooltip
                  formatter={(value) => [value, "Inspeções"]}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="oklch(0.42 0.09 220)"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Requer atenção
              {attentionTotal > 0 && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                  {attentionTotal}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AttentionItem
              icon={ClipboardCheck}
              label="Inspeções planejadas"
              value={summary.plannedInspections}
              to="/inspecoes"
            />
            <AttentionItem
              icon={AlertTriangle}
              label="Não conformidades vencidas"
              value={summary.overdueNonConformities}
              to="/nao-conformidades"
            />
            <AttentionItem
              icon={ClockAlert}
              label="Ações corretivas vencidas"
              value={summary.overdueCorrectiveActions}
              to="/nao-conformidades"
            />
            {attentionTotal === 0 && (
              <p className="pt-2 text-center text-sm text-muted-foreground">
                Nenhum item requer atenção imediata.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3 text-base">
            Inspeções recentes
            <Button asChild variant="ghost" size="sm">
              <Link to="/inspecoes">Ver todas</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y pt-0">
          {dashboard.recentInspections.map((inspection) => (
            <div
              key={inspection.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {inspection.title}
                  {inspection.sourceVersionNumber !== null
                    ? ` · v${inspection.sourceVersionNumber}`
                    : ""}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {inspection.companyName} · {fmtData(inspection.inspectionDate)} ·{" "}
                  {inspection.inspectorName}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={toUiInspectionStatus(inspection.status)} />
                {inspection.status === "COMPLETED" ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/relatorios" search={{ inspectionId: inspection.id }}>
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Ver relatório</span>
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="ghost" size="icon" aria-label="Ver inspeção">
                    <Link to="/inspecoes/$id" params={{ id: inspection.id }}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function AttentionItem({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  to: "/inspecoes" | "/nao-conformidades";
}) {
  return (
    <Button asChild variant="outline" className="h-auto w-full justify-between px-3 py-3">
      <Link to={to}>
        <span className="flex min-w-0 items-center gap-2 text-left">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm">{label}</span>
        </span>
        <span className="font-semibold tabular-nums">{value}</span>
      </Link>
    </Button>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Carregando Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-36" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

function DashboardEmptyState() {
  return (
    <Card>
      <CardContent className="px-6 py-16 text-center">
        <ClipboardCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Nenhuma inspeção registrada</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Crie a primeira inspeção para começar a acompanhar status, conformidade e pendências.
        </p>
        <Button asChild className="mt-5">
          <Link to="/inspecoes/nova">
            <Plus className="h-4 w-4" />
            Criar inspeção
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function toUiInspectionStatus(status: string): string {
  const map: Record<string, string> = {
    PLANNED: "planejada",
    IN_PROGRESS: "em_andamento",
    COMPLETED: "concluida",
    CANCELLED: "cancelada",
  };

  return map[status] ?? status;
}
