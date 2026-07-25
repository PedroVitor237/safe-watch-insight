import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { CorrectiveActionsPanel } from "@/components/non-conformities/CorrectiveActionsPanel";
import { NonConformityEditForm } from "@/components/non-conformities/NonConformityEditForm";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteNonConformity,
  useNonConformity,
  useUpdateNonConformity,
} from "@/hooks/useNonConformities";
import { fmtData, fmtDataHora } from "@/lib/format";

type NonConformityStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "OVERDUE";

export const Route = createFileRoute("/_app/nao-conformidades/$id")({
  head: () => ({ meta: [{ title: "Não conformidade — SST" }] }),
  component: NonConformityDetail,
});

function NonConformityDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const nonConformityQuery = useNonConformity(id);
  const updateNonConformity = useUpdateNonConformity();
  const deleteNonConformity = useDeleteNonConformity();
  const result = nonConformityQuery.data;
  const nonConformity = result?.success ? result.data : null;

  if (nonConformityQuery.isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Carregando não conformidade...
      </div>
    );
  }

  if (!nonConformity) {
    return (
      <div className="p-8">
        <Button asChild variant="ghost">
          <Link to="/nao-conformidades">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <p className="mt-4 text-muted-foreground">
          {result?.success === false
            ? result.message
            : "Não conformidade não encontrada."}
        </p>
      </div>
    );
  }

  const response = nonConformity.inspectionResponse;
  const inspection = response.inspection;
  const item = response.checklistItem;
  const companyName =
    inspection.company.tradeName ?? inspection.company.corporateName;
  const code = `NC-${new Date(nonConformity.createdAt).getFullYear()}-${nonConformity.id
    .slice(0, 8)
    .toUpperCase()}`;

  async function changeStatus(status: NonConformityStatus) {
    const updateResult = await updateNonConformity.mutateAsync({
      id,
      data: { status },
    });

    if (!updateResult.success) {
      toast.error(updateResult.message);
      return;
    }

    toast.success("Status atualizado.");
  }

  async function archiveNonConformity() {
    if (
      !window.confirm(
        "Excluir esta não conformidade? O registro será arquivado para preservar o histórico.",
      )
    ) {
      return;
    }

    const deleteResult = await deleteNonConformity.mutateAsync(id);

    if (!deleteResult.success) {
      toast.error(deleteResult.message);
      return;
    }

    toast.success("Não conformidade arquivada.");
    navigate({ to: "/nao-conformidades" });
  }

  return (
    <div>
      <PageHeader
        title={item.description}
        description={`${code} · ${companyName}`}
        actions={
          <>
            <StatusBadge value={toUiSeverity(nonConformity.severity)} />
            <StatusBadge value={toUiStatus(nonConformity.status)} />
            <Button
              variant="outline"
              size="sm"
              onClick={archiveNonConformity}
              disabled={deleteNonConformity.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Arquivar
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/nao-conformidades">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 p-4 sm:p-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <NonConformityEditForm
            id={id}
            description={nonConformity.description}
            severity={nonConformity.severity}
            dueDate={nonConformity.dueDate}
          />

          <CorrectiveActionsPanel
            nonConformityId={id}
            initialActions={nonConformity.correctiveActions}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-6 border-l pl-6">
                <TimelineItem
                  title="Não conformidade registrada"
                  date={nonConformity.createdAt}
                  author={inspection.user.name}
                />
                {String(nonConformity.updatedAt) !==
                  String(nonConformity.createdAt) && (
                  <TimelineItem
                    title="Não conformidade atualizada"
                    date={nonConformity.updatedAt}
                    author="Sistema"
                  />
                )}
                {nonConformity.correctiveActions.map((action) => (
                  <TimelineItem
                    key={action.id}
                    title={`Ação corretiva: ${action.description}`}
                    date={action.createdAt}
                    author={action.responsible ?? "Responsável não definido"}
                  />
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <DetailsCard
            createdAt={nonConformity.createdAt}
            dueDate={nonConformity.dueDate}
            companyName={companyName}
            inspectorName={inspection.user.name}
            inspectionId={inspection.id}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Normas relacionadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {item.standards.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma norma associada ao item.
                </p>
              )}
              {item.standards.map(({ standard }) => (
                <div key={standard.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{standard.code}</div>
                      <div className="text-xs text-muted-foreground">
                        {standard.title}
                      </div>
                    </div>
                    {standard.officialUrl && (
                      <a
                        href={standard.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Consultar ${standard.code}`}
                        className="text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={nonConformity.status}
                onValueChange={(value) =>
                  changeStatus(value as NonConformityStatus)
                }
                disabled={updateNonConformity.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Aberta</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em tratativa</SelectItem>
                  <SelectItem value="RESOLVED">Resolvida</SelectItem>
                  <SelectItem value="OVERDUE">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <EvidenceCard evidence={nonConformity.evidence} />
        </div>
      </div>
    </div>
  );
}

function DetailsCard({
  createdAt,
  dueDate,
  companyName,
  inspectorName,
  inspectionId,
}: {
  createdAt: Date | string;
  dueDate: Date | string | null;
  companyName: string;
  inspectorName: string;
  inspectionId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Detalhes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <DetailRow label="Aberta em" value={fmtData(createdAt)} />
        <DetailRow label="Prazo" value={fmtData(dueDate)} />
        <DetailRow label="Empresa" value={companyName} />
        <DetailRow label="Inspetor" value={inspectorName} />
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Inspeção</span>
          <Link
            to="/inspecoes/$id"
            params={{ id: inspectionId }}
            className="inline-flex items-center gap-1 text-right font-medium text-primary hover:underline"
          >
            {inspectionId.slice(0, 8)}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function EvidenceCard({
  evidence,
}: {
  evidence: Array<{
    id: string;
    storageUrl: string;
    fileName: string;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evidências</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {evidence.length === 0 && (
          <div className="text-sm text-muted-foreground">Sem anexos</div>
        )}
        {evidence.map((item) => (
          <a
            key={item.id}
            href={item.storageUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-muted"
          >
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            {item.fileName}
          </a>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled
          title="Upload será implementado em sprint futura."
        >
          <Paperclip className="h-4 w-4" />
          Anexar evidência
        </Button>
        <p className="text-xs text-muted-foreground">
          Upload previsto para a etapa de evidências.
        </p>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function TimelineItem({
  title,
  date,
  author,
}: {
  title: string;
  date: Date | string;
  author: string;
}) {
  return (
    <li className="relative">
      <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary" />
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">
        {fmtDataHora(date)} · {author}
      </div>
    </li>
  );
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
