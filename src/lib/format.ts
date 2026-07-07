import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export type DateFormatInput = Date | string | null | undefined;

export const fmtData = (value: DateFormatInput) => formatDate(value, "dd/MM/yyyy");

export const fmtDataHora = (value: DateFormatInput) => formatDate(value, "dd/MM/yyyy HH:mm");

function formatDate(value: DateFormatInput, pattern: string): string {
  const date = normalizeDate(value);

  if (!date) {
    return "—";
  }

  try {
    return format(date, pattern, { locale: ptBR });
  } catch {
    return "—";
  }
}

function normalizeDate(value: DateFormatInput): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : parseISO(value);

  return isValid(date) ? date : null;
}

export const fmtCnpj = (v: string) =>
  v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

export const labelStatus: Record<string, string> = {
  planejada: "Planejada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  pendente_sync: "Sync pendente",
  aberta: "Aberta",
  em_tratativa: "Em tratativa",
  resolvida: "Resolvida",
  vencida: "Vencida",
  conforme: "Conforme",
  nao_conforme: "Não conforme",
  na: "N/A",
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};
