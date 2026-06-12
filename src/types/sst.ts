export type PerfilUsuario = "inspetor" | "gestor" | "auditor";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  registroProfissional?: string;
  avatarColor: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  setor: string;
  endereco: string;
  cidade: string;
  uf: string;
  unidades: Unidade[];
  riscos: string[];
}

export interface Unidade {
  id: string;
  nome: string;
  endereco: string;
}

export interface Norma {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  topicos: string[];
}

export type Criticidade = "baixa" | "media" | "alta" | "critica";
export type RespostaItem = "conforme" | "nao_conforme" | "na" | null;

export interface ItemChecklist {
  id: string;
  texto: string;
  criticidade: Criticidade;
  normaRef?: string;
  resposta?: RespostaItem;
  observacao?: string;
  evidencias?: string[];
}

export interface SecaoChecklist {
  id: string;
  titulo: string;
  itens: ItemChecklist[];
}

export interface Checklist {
  id: string;
  titulo: string;
  normaId: string;
  versao: string;
  descricao: string;
  secoes: SecaoChecklist[];
}

export type StatusInspecao =
  | "planejada"
  | "em_andamento"
  | "concluida"
  | "pendente_sync";

export interface EventoTimeline {
  id: string;
  data: string;
  autor: string;
  descricao: string;
}

export interface Inspecao {
  id: string;
  codigo: string;
  titulo: string;
  empresaId: string;
  unidadeId: string;
  checklistId: string;
  inspetorId: string;
  agendadaPara: string;
  iniciadaEm?: string;
  concluidaEm?: string;
  status: StatusInspecao;
  respostas: Record<string, { resposta: RespostaItem; observacao?: string; evidencias?: string[] }>;
  assinaturaResponsavel?: string;
  geolocalizacao?: { lat: number; lng: number };
  timeline: EventoTimeline[];
}

export type StatusNC = "aberta" | "em_tratativa" | "resolvida" | "vencida";

export interface PlanoAcao {
  oQue: string;
  porQue: string;
  onde: string;
  quem: string;
  quando: string;
  como: string;
  quanto?: string;
}

export interface NaoConformidade {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  inspecaoId: string;
  empresaId: string;
  itemChecklistId: string;
  criticidade: Criticidade;
  status: StatusNC;
  abertaEm: string;
  prazo: string;
  responsavelId: string;
  planoAcao?: PlanoAcao;
  evidencias: string[];
  timeline: EventoTimeline[];
}
