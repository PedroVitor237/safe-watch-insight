import { AlertTriangle, CheckCircle2, Clock3, ImageIcon, MinusCircle, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { fmtCnpj, fmtData, fmtDataHora } from "@/lib/format";
import type { InspectionReportDto, ReportEvidenceDto } from "@/server/services/report.service";

export interface InspectionReportProps {
  report: InspectionReportDto;
}

const inspectionStatus = {
  PLANNED: "planejada",
  IN_PROGRESS: "em_andamento",
  COMPLETED: "concluida",
  CANCELLED: "cancelada",
} as const;

const responseStatus = {
  COMPLIANT: "conforme",
  NON_COMPLIANT: "nao_conforme",
  NOT_APPLICABLE: "na",
} as const;

const nonConformityStatus = {
  OPEN: "aberta",
  IN_PROGRESS: "em_tratativa",
  RESOLVED: "resolvida",
  OVERDUE: "vencida",
} as const;

const correctiveActionStatus = {
  PENDING: "pendente",
  IN_PROGRESS: "em_andamento",
  COMPLETED: "concluida",
  OVERDUE: "vencida",
} as const;

const severityStatus = {
  LOW: "baixa",
  MEDIUM: "media",
  HIGH: "alta",
  CRITICAL: "critica",
} as const;

export function InspectionReport({ report }: InspectionReportProps) {
  const nonConformingItems = report.items.filter((item) => item.nonConformity !== null);

  return (
    <article className="print-report mx-auto max-w-5xl bg-white text-sm leading-relaxed text-slate-950 shadow-sm">
      <div className="space-y-8 p-5 sm:p-10">
        <header className="flex flex-col gap-4 border-b-2 border-slate-800 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Relatório de inspeção
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{report.snapshot.title}</h2>
            {report.snapshot.description && (
              <p className="mt-1 max-w-2xl text-sm text-slate-600">{report.snapshot.description}</p>
            )}
          </div>
          <div className="shrink-0 text-left text-xs text-slate-600 sm:text-right">
            <p className="font-mono">Inspeção {report.id}</p>
            <p>Snapshot capturado em {fmtDataHora(report.snapshot.capturedAt)}</p>
          </div>
        </header>

        {report.snapshot.integrityStatus === "UNVERIFIED_LEGACY" && (
          <div className="print-avoid-break rounded-md border border-amber-400 bg-amber-50 p-3 text-xs text-amber-950">
            Registro histórico legado: o conteúdo foi estabilizado com os dados disponíveis e não
            pode ser certificado como a versão exata da data original. Ele não depende mais de
            alterações no checklist atual.
          </div>
        )}

        <ReportSection title="Identificação da inspeção">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Empresa"
              value={report.company.tradeName ?? report.company.corporateName}
            />
            <Field label="Razão social" value={report.company.corporateName} />
            <Field label="CNPJ" value={report.company.cnpj ? fmtCnpj(report.company.cnpj) : "—"} />
            <Field label="CNAE" value={report.company.cnae} />
            <Field label="Grau de risco" value={String(report.company.riskLevel)} />
            <Field label="Funcionários" value={String(report.company.employeeCount)} />
            <Field label="Endereço" value={report.company.address ?? "—"} />
            <Field label="Data da inspeção" value={fmtDataHora(report.inspectionDate)} />
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </dt>
              <dd className="mt-1">
                <StatusBadge value={inspectionStatus[report.status]} />
              </dd>
            </div>
            <Field label="Inspetor responsável" value={report.inspector.name} />
            <Field label="E-mail do inspetor" value={report.inspector.email} />
            <Field
              label="Checklist / versão"
              value={`${report.snapshot.title} · v${report.snapshot.sourceVersionNumber}`}
            />
          </dl>
        </ReportSection>

        <ReportSection title="Resumo da inspeção">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <SummaryBox label="Total" value={report.summary.totalItems} />
            <SummaryBox label="Respondidos" value={report.summary.answeredItems} />
            <SummaryBox label="Conformes" value={report.summary.compliantItems} tone="success" />
            <SummaryBox
              label="Não conformes"
              value={report.summary.nonCompliantItems}
              tone="danger"
            />
            <SummaryBox label="Não aplicáveis" value={report.summary.notApplicableItems} />
            <SummaryBox label="Pendentes" value={report.summary.pendingItems} tone="warning" />
            <SummaryBox label="Preenchimento" value={`${report.summary.completionPercentage}%`} />
          </div>
        </ReportSection>

        {report.notes && (
          <ReportSection title="Observações gerais">
            <p className="whitespace-pre-wrap rounded-md border bg-slate-50 p-3">{report.notes}</p>
          </ReportSection>
        )}

        <ReportSection title="Resultados item a item">
          {report.items.length === 0 ? (
            <EmptyText>O snapshot histórico desta inspeção não possui itens.</EmptyText>
          ) : (
            <div className="space-y-3">
              {report.items.map((item) => (
                <article key={item.id} className="print-avoid-break rounded-md border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Item {item.orderIndex}
                        {item.isRequired ? " · obrigatório" : ""}
                      </p>
                      <h4 className="mt-1 font-semibold">{item.description}</h4>
                    </div>
                    {item.response ? (
                      <StatusBadge
                        className="shrink-0"
                        value={responseStatus[item.response.status]}
                      />
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        Pendente
                      </Badge>
                    )}
                  </div>

                  {item.standards.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">Fundamentação normativa</p>
                      {item.standards.map((standard) => (
                        <p key={standard.standardId}>
                          <span className="font-medium">{standard.code}</span> — {standard.title}
                        </p>
                      ))}
                    </div>
                  )}

                  {item.response?.observation && (
                    <div className="mt-3 rounded bg-slate-50 px-3 py-2 text-xs">
                      <span className="font-semibold">Observação:</span>{" "}
                      <span className="whitespace-pre-wrap">{item.response.observation}</span>
                    </div>
                  )}

                  {item.nonConformity && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-semibold">Não conformidade associada</span>
                      <StatusBadge value={severityStatus[item.nonConformity.severity]} />
                      {item.nonConformity.evidence.length > 0 && (
                        <span>{item.nonConformity.evidence.length} evidência(s)</span>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </ReportSection>

        <ReportSection title="Evidências gerais da inspeção">
          <EvidenceGallery evidence={report.evidence} />
        </ReportSection>

        <ReportSection title="Não conformidades e ações corretivas">
          {nonConformingItems.length === 0 ? (
            <EmptyText>Nenhuma não conformidade ativa está associada a esta inspeção.</EmptyText>
          ) : (
            <div className="space-y-5">
              {nonConformingItems.map((item) => {
                const nonConformity = item.nonConformity;

                if (!nonConformity) {
                  return null;
                }

                return (
                  <article
                    key={nonConformity.id}
                    className="print-avoid-break rounded-md border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Item {item.orderIndex}
                        </p>
                        <h4 className="font-semibold">{item.description}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge value={severityStatus[nonConformity.severity]} />
                        <StatusBadge value={nonConformityStatus[nonConformity.status]} />
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap">{nonConformity.description}</p>
                    {item.response?.observation && (
                      <p className="mt-2 text-xs text-slate-600">
                        <span className="font-semibold">Observação da resposta:</span>{" "}
                        {item.response.observation}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-600">
                      <span className="font-semibold">Prazo da não conformidade:</span>{" "}
                      {fmtData(nonConformity.dueDate)}
                    </p>

                    <div className="mt-4 border-t pt-3">
                      <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Ações corretivas
                      </h5>
                      {nonConformity.correctiveActions.length === 0 ? (
                        <p className="mt-2 text-xs text-slate-500">
                          Nenhuma ação corretiva registrada.
                        </p>
                      ) : (
                        <div className="mt-2 space-y-3">
                          {nonConformity.correctiveActions.map((action) => (
                            <div key={action.id} className="rounded border bg-slate-50 p-3 text-xs">
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-semibold">{action.description}</p>
                                <StatusBadge
                                  className="shrink-0"
                                  value={correctiveActionStatus[action.status]}
                                />
                              </div>
                              <dl className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                                <CompactField label="Responsável" value={action.responsible} />
                                <CompactField label="Prazo" value={fmtData(action.dueDate)} />
                                <CompactField label="Por quê" value={action.why} />
                                <CompactField label="Onde" value={action.location} />
                                <CompactField label="Como" value={action.method} />
                                <CompactField label="Custo estimado" value={action.estimatedCost} />
                              </dl>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {nonConformity.evidence.length > 0 && (
                      <div className="mt-4 border-t pt-3">
                        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Evidências da não conformidade
                        </h5>
                        <EvidenceGallery evidence={nonConformity.evidence} />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </ReportSection>

        <footer className="border-t pt-4 text-[10px] text-slate-500">
          Relatório emitido pelo Safe Watch Insight com base no snapshot histórico da inspeção.
          Impressão em {fmtDataHora(new Date())}.
        </footer>
      </div>
    </article>
  );
}

function ReportSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 border-b pb-2 text-base font-bold">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function CompactField({ label, value }: { label: string; value: string | null }) {
  if (!value || value === "—") {
    return null;
  }

  return (
    <div>
      <dt className="font-semibold text-slate-600">{label}</dt>
      <dd className="whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const icon = {
    default: <Clock3 className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    danger: <XCircle className="h-4 w-4" />,
    warning: <MinusCircle className="h-4 w-4" />,
  }[tone];
  const toneClass = {
    default: "text-slate-700",
    success: "text-emerald-700",
    danger: "text-red-700",
    warning: "text-amber-700",
  }[tone];

  return (
    <div className="print-avoid-break rounded-md border p-3">
      <div className={`flex items-center gap-1.5 ${toneClass}`}>
        {icon}
        <span className="text-[10px] font-semibold uppercase">{label}</span>
      </div>
      <p className={`mt-1 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function EvidenceGallery({ evidence }: { evidence: ReportEvidenceDto[] }) {
  if (evidence.length === 0) {
    return <EmptyText>Nenhuma evidência registrada neste contexto.</EmptyText>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {evidence.map((item) => (
        <figure key={item.id} className="print-avoid-break overflow-hidden rounded-md border">
          <img
            src={item.storageUrl}
            alt={item.caption ?? item.fileName}
            className="h-36 w-full object-cover"
            loading="eager"
          />
          <figcaption className="p-2 text-[10px] text-slate-600">
            <p className="truncate font-semibold text-slate-800">{item.fileName}</p>
            {item.caption && <p className="mt-0.5 whitespace-pre-wrap">{item.caption}</p>}
            <p className="mt-0.5">
              {formatFileSize(item.fileSize)} · {fmtDataHora(item.createdAt)}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed p-5 text-center text-xs text-slate-500">
      <ImageIcon className="mx-auto mb-1 h-5 w-5" />
      {children}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
