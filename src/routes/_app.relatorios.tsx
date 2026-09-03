import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, Printer, RefreshCw } from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/common/PageHeader";
import { InspectionReport } from "@/components/reports/InspectionReport";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableInspectionReports, useInspectionReport } from "@/hooks/useReports";
import { fmtData } from "@/lib/format";

const reportSearchSchema = z.object({
  inspectionId: z.string().uuid().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/relatorios")({
  validateSearch: reportSearchSchema,
  head: () => ({ meta: [{ title: "Relatórios — SST" }] }),
  component: Relatorios,
});

function Relatorios() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { inspectionId: requestedInspectionId } = Route.useSearch();
  const availableQuery = useAvailableInspectionReports();
  const availableResult = availableQuery.data;
  const availableReports = availableResult?.success ? availableResult.data : [];
  const selectedInspectionId = requestedInspectionId ?? availableReports[0]?.id ?? "";
  const reportQuery = useInspectionReport(selectedInspectionId);
  const reportResult = reportQuery.data;
  const report = reportResult?.success ? reportResult.data : null;

  function selectInspection(inspectionId: string) {
    void navigate({
      search: { inspectionId },
      replace: true,
    });
  }

  return (
    <div>
      <div className="print-hidden">
        <PageHeader
          title="Relatórios"
          description="Relatório histórico com dados persistidos. Use a impressão do navegador para imprimir ou salvar em PDF."
          actions={
            <Button type="button" disabled={!report} onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          }
        />
      </div>

      <div className="space-y-4 p-4 sm:p-8 print:p-0">
        <Card className="print-hidden p-3">
          {availableQuery.isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : availableQuery.isError || availableResult?.success === false ? (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível carregar as inspeções</AlertTitle>
              <AlertDescription className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <span>
                  {availableResult?.success === false
                    ? availableResult.message
                    : "Tente novamente em alguns instantes."}
                </span>
                <Button variant="outline" size="sm" onClick={() => availableQuery.refetch()}>
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          ) : availableReports.length > 0 ? (
            <Select value={selectedInspectionId} onValueChange={selectInspection}>
              <SelectTrigger aria-label="Selecionar inspeção concluída">
                <SelectValue placeholder="Selecione uma inspeção concluída" />
              </SelectTrigger>
              <SelectContent>
                {availableReports.map((inspection) => (
                  <SelectItem key={inspection.id} value={inspection.id}>
                    {inspection.id.slice(0, 8)} — {inspection.title} · {inspection.companyName} ·{" "}
                    {fmtData(inspection.inspectionDate)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <FileText className="mx-auto mb-2 h-8 w-8" />
              Nenhuma inspeção concluída está disponível para relatório.
            </div>
          )}
        </Card>

        {selectedInspectionId && reportQuery.isLoading && <ReportLoading />}

        {selectedInspectionId && (reportQuery.isError || reportResult?.success === false) && (
          <Alert variant="destructive" className="print-hidden">
            <AlertTitle>Relatório indisponível</AlertTitle>
            <AlertDescription className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <span>
                {reportResult?.success === false
                  ? reportResult.message
                  : "Não foi possível carregar os dados históricos da inspeção."}
              </span>
              <Button variant="outline" size="sm" onClick={() => reportQuery.refetch()}>
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {report && <InspectionReport report={report} />}
      </div>
    </div>
  );
}

function ReportLoading() {
  return (
    <Card className="space-y-6 p-6 sm:p-10">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-2/3" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-16" />
        ))}
      </div>
      <Skeleton className="h-48" />
    </Card>
  );
}
