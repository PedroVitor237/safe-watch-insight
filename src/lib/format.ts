import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const fmtData = (iso?: string) =>
  iso ? format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR }) : "—";

export const fmtDataHora = (iso?: string) =>
  iso ? format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—";

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
