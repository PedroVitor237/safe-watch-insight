import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, Search } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useStandards } from "@/hooks/useStandards";

export const Route = createFileRoute("/_app/normas")({
  head: () => ({ meta: [{ title: "Normas — SST" }] }),
  component: Normas,
});

function Normas() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "revoked">("active");
  const standardsQuery = useStandards({
    search: search || undefined,
    type: "NR",
    isActive: status === "all" ? undefined : status === "active",
  });
  const result = standardsQuery.data;
  const standards = useMemo(() => {
    const items = result?.success ? [...result.data.items] : [];

    return items.sort(
      (left, right) => standardNumber(left.code) - standardNumber(right.code),
    );
  }, [result]);

  return (
    <div>
      <PageHeader title="Normas Regulamentadoras" description="Biblioteca de NRs aplicáveis." />
      <div className="space-y-4 p-4 sm:p-8">
        <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código, título ou descrição..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
            <SelectTrigger aria-label="Filtrar vigência">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Somente vigentes</SelectItem>
              <SelectItem value="revoked">Somente revogadas</SelectItem>
              <SelectItem value="all">Todas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {standardsQuery.isLoading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-52" />
            ))}
          </div>
        )}

        {result?.success === false && (
          <Card>
            <CardContent className="p-6 text-sm text-destructive">{result.message}</CardContent>
          </Card>
        )}

        {!standardsQuery.isLoading && result?.success && standards.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Nenhuma norma encontrada para os filtros informados.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {standards.map((standard) => (
          <Card key={standard.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex gap-2">
                  {!standard.isActive && <Badge variant="destructive">Revogada</Badge>}
                  <Badge>{standard.code}</Badge>
                </div>
              </div>
              <div>
                <div className="font-semibold">{standard.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {standard.summary ?? "Sem resumo cadastrado."}
                </p>
              </div>
              {standard.officialUrl && (
                <a
                  href={standard.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Consultar fonte oficial
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardContent>
          </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function standardNumber(code: string): number {
  const value = Number(code.replace(/\D/g, ""));

  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}
