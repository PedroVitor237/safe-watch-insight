import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Search } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useNonConformities } from "@/hooks/useNonConformities";
import { fmtData } from "@/lib/format";
import type { NonConformityWithRelations } from "@/server/repositories/non-conformity.repository";

export const Route = createFileRoute("/_app/nao-conformidades/")({
  head: () => ({ meta: [{ title: "Não conformidades — SST" }] }),
  component: ListaNCs,
});

type UiStatus = "aberta" | "em_tratativa" | "resolvida" | "vencida";

const columns: { id: UiStatus; backendStatus: string; title: string }[] = [
  { id: "aberta", backendStatus: "OPEN", title: "Abertas" },
  { id: "em_tratativa", backendStatus: "IN_PROGRESS", title: "Em tratativa" },
  { id: "resolvida", backendStatus: "RESOLVED", title: "Resolvidas" },
  { id: "vencida", backendStatus: "OVERDUE", title: "Vencidas" },
];

function ListaNCs() {
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const nonConformitiesQuery = useNonConformities({
    search: search || undefined,
    severity:
      severity === "all"
        ? undefined
        : (severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"),
  });
  const result = nonConformitiesQuery.data;
  const nonConformities = result?.success ? result.data.items : [];

  return (
    <div>
      <PageHeader
        title="Não conformidades"
        description="Gestão de NCs e ações corretivas."
      />
      <div className="space-y-4 p-4 sm:p-8">
        <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por descrição, item ou empresa..."
              className="pl-9"
            />
          </div>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger aria-label="Filtrar severidade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as severidades</SelectItem>
              <SelectItem value="LOW">Baixa</SelectItem>
              <SelectItem value="MEDIUM">Média</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="CRITICAL">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {nonConformitiesQuery.isLoading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        )}

        {result?.success === false && (
          <Card>
            <CardContent className="p-6 text-sm text-destructive">
              {result.message}
            </CardContent>
          </Card>
        )}

        {!nonConformitiesQuery.isLoading &&
          result?.success &&
          nonConformities.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma não conformidade encontrada.
              </CardContent>
            </Card>
          )}

        {nonConformities.length > 0 && (
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="lista">Lista</TabsTrigger>
            </TabsList>

            <TabsContent value="kanban">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {columns.map((column) => {
                  const items = nonConformities.filter(
                    (item) => item.status === column.backendStatus,
                  );

                  return (
                    <div key={column.id} className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge value={column.id} />
                          <span className="text-xs text-muted-foreground">
                            {items.length}
                          </span>
                        </div>
                      </div>
                      <div className="min-h-[200px] space-y-2 rounded-lg bg-muted/40 p-2">
                        {items.map((nonConformity) => (
                          <NonConformityCard
                            key={nonConformity.id}
                            nonConformity={nonConformity}
                          />
                        ))}
                        {items.length === 0 && (
                          <div className="py-8 text-center text-xs text-muted-foreground">
                            Vazia
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="lista">
              <Card>
                <CardContent className="divide-y p-0">
                  {nonConformities.map((nonConformity) => {
                    const inspection =
                      nonConformity.inspectionResponse.inspection;

                    return (
                      <Link
                        key={nonConformity.id}
                        to="/nao-conformidades/$id"
                        params={{ id: nonConformity.id }}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3 hover:bg-accent/40"
                      >
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {getNonConformityTitle(nonConformity)}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {getNonConformityCode(nonConformity)} ·{" "}
                            {inspection.company.tradeName ??
                              inspection.company.corporateName}
                          </div>
                        </div>
                        <StatusBadge
                          value={toUiSeverity(nonConformity.severity)}
                        />
                        <StatusBadge value={toUiStatus(nonConformity.status)} />
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function NonConformityCard({
  nonConformity,
}: {
  nonConformity: NonConformityWithRelations;
}) {
  const inspection = nonConformity.inspectionResponse.inspection;

  return (
    <Link
      to="/nao-conformidades/$id"
      params={{ id: nonConformity.id }}
    >
      <Card className="transition hover:border-primary hover:shadow-sm">
        <CardContent className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="font-mono text-[10px] text-muted-foreground">
              {getNonConformityCode(nonConformity)}
            </div>
            <StatusBadge value={toUiSeverity(nonConformity.severity)} />
          </div>
          <div className="line-clamp-2 text-sm font-medium">
            {getNonConformityTitle(nonConformity)}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {inspection.company.tradeName ?? inspection.company.corporateName}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">
              Prazo {fmtData(nonConformity.dueDate)}
            </span>
            <span className="truncate text-muted-foreground">
              {inspection.user.name.split(" ")[0]}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function getNonConformityTitle(
  nonConformity: NonConformityWithRelations,
): string {
  return nonConformity.inspectionResponse.checklistItem.description;
}

function getNonConformityCode(
  nonConformity: NonConformityWithRelations,
): string {
  return `NC-${new Date(nonConformity.createdAt).getFullYear()}-${nonConformity.id
    .slice(0, 8)
    .toUpperCase()}`;
}

function toUiSeverity(severity: string): string {
  return (
    {
      LOW: "baixa",
      MEDIUM: "media",
      HIGH: "alta",
      CRITICAL: "critica",
    }[severity] ?? severity
  );
}

function toUiStatus(status: string): string {
  return (
    {
      OPEN: "aberta",
      IN_PROGRESS: "em_tratativa",
      RESOLVED: "resolvida",
      OVERDUE: "vencida",
    }[status] ?? status
  );
}
