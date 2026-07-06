import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Building2, MapPin } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { fmtCnpj } from "@/lib/format";

export const Route = createFileRoute("/_app/empresas")({
  head: () => ({ meta: [{ title: "Empresas — SST" }] }),
  component: Empresas,
});

function Empresas() {
  const { data: companiesResult, isLoading, isError } = useCompanies();
  const companies = companiesResult?.success ? companiesResult.data.items : [];
  const errorMessage =
    companiesResult && !companiesResult.success
      ? companiesResult.message
      : "Não foi possível carregar as empresas.";

  return (
    <div>
      <PageHeader
        title="Empresas e unidades"
        description="Cadastro das empresas e unidades fiscalizadas."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Nova empresa
          </Button>
        }
      />
      <div className="grid gap-4 p-4 sm:p-8 md:grid-cols-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
                    <div className="min-w-0 space-y-2">
                      <div className="h-4 w-40 rounded bg-muted" />
                      <div className="h-3 w-52 rounded bg-muted" />
                      <div className="h-3 w-28 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="h-5 w-20 rounded bg-muted" />
                </div>
                <div className="h-3 w-64 rounded bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-muted" />
                  <div className="h-4 w-36 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}

        {(isError || (companiesResult && !companiesResult.success)) && (
          <Card className="md:col-span-2">
            <CardContent className="p-5 text-sm text-muted-foreground">{errorMessage}</CardContent>
          </Card>
        )}

        {!isLoading && !isError && companiesResult?.success && companies.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="p-5 text-sm text-muted-foreground">
              Nenhuma empresa cadastrada.
            </CardContent>
          </Card>
        )}

        {companies.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{e.tradeName ?? e.corporateName}</div>
                    <div className="truncate text-xs text-muted-foreground">{e.corporateName}</div>
                    <div className="mt-1 font-mono text-xs">
                      {e.cnpj ? fmtCnpj(e.cnpj) : "CNPJ não informado"}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{e.cnae}</Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {e.address ?? "Endereço não informado"}
              </div>

              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Funcionários</div>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>{e.employeeCount}</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-[10px]">
                  Grau de risco {e.riskLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
