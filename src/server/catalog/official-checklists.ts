export interface OfficialChecklistDefinition {
  id: string;
  title: string;
  description: string;
  items: { description: string; standardCodes: string[] }[];
}

export const MURBACH_REFERENCE =
  "MURBACH, Tiago. Desenvolvimento de uma ferramenta de verificação para gestão e fiscalização da segurança do trabalho na indústria da construção. 2019. Monografia (Especialização em Engenharia de Segurança do Trabalho) — Universidade Tecnológica Federal do Paraná, Curitiba.";
export const MURBACH_URL = "https://riut.utfpr.edu.br/jspui/handle/1/17523";

const scopeNotice =
  "Template curado pela Safe Watch Insight. Não é documento governamental, não implica endosso do autor e não garante conformidade legal atual. Avalie a aplicabilidade e consulte as normas vigentes do catálogo antes de usar.";

// Stable platform identities, unrelated to demo accounts. Published revisions are never overwritten.
export const OFFICIAL_CHECKLISTS: readonly OfficialChecklistDefinition[] = [
  {
    id: "a0180000-0000-4000-8000-000000000001",
    title: "Construção — treinamento, escavações e transporte vertical",
    description: [
      "NR-18 · Verificações iniciais no canteiro: capacitação, escavações/tubulões e equipamentos de transporte de pessoas e materiais. Recorte representativo, não exaustivo.",
      "Fonte: adaptação do Apêndice A de Murbach (2019), páginas impressas 73–74, 83–84 e 113–114. Foram omitidos parâmetros numéricos e referências de subitens de 2019, sem revisão normativa ampla.",
      MURBACH_REFERENCE,
      MURBACH_URL,
      scopeNotice,
    ].join("\n\n"),
    items: [
      "Treinamento: antes de iniciar a atividade, a equipe recebeu orientação sobre os riscos de sua função no canteiro?",
      "Treinamento: os trabalhadores foram orientados sobre uso de proteções coletivas e individuais?",
      "Treinamento: os procedimentos abordados na capacitação estão disponíveis aos trabalhadores?",
      "Escavações: as interferências subterrâneas, como cabos e canalizações, foram identificadas antes do serviço?",
      "Escavações: há verificação das condições dos taludes, escoramentos e estruturas vizinhas pelo responsável técnico?",
      "Escavações: a área possui isolamento, sinalização e controle de acesso de pessoas não autorizadas?",
      "Tubulões, quando aplicáveis: há planejamento de resgate e preparação da equipe envolvida?",
      "Transporte vertical: o operador possui capacitação específica para o equipamento utilizado?",
      "Transporte vertical: as verificações antes do uso e as intervenções de manutenção estão registradas?",
      "Içamento: a área sob a movimentação da carga permanece isolada e sem circulação de pessoas?",
      "Transporte de pessoas: o equipamento utilizado foi projetado para essa finalidade?",
      "Elevadores: a documentação de entrega técnica e dos testes dos dispositivos de segurança está disponível?",
    ].map((description) => ({ description, standardCodes: ["NR-18"] })),
  },
  {
    id: "a0350000-0000-4000-8000-000000000002",
    title: "Trabalho em altura — preparação e proteção da equipe",
    description: [
      "NR-1, NR-6 e NR-35 · Inspeção preparatória de uma atividade em altura: riscos da tarefa, capacitação, equipamentos de proteção e resposta a emergências. Não substitui análise de risco, projeto ou autorização de trabalho.",
      "Fonte: curadoria Safe Watch Insight, 2026, organizada a partir dos temas das NRs já presentes no catálogo da aplicação. As associações consultam o catálogo Standard; não reproduzem texto legal nem números de subitens.",
      scopeNotice,
    ].join("\n\n"),
    items: [
      {
        description:
          "Os riscos da atividade em altura e as medidas de prevenção foram identificados e comunicados à equipe?",
        standardCodes: ["NR-1", "NR-35"],
      },
      {
        description:
          "A execução foi planejada considerando acesso, condições do local e possibilidade de evitar a exposição à queda?",
        standardCodes: ["NR-35"],
      },
      {
        description:
          "A capacitação e a autorização dos trabalhadores foram verificadas para a atividade prevista?",
        standardCodes: ["NR-35"],
      },
      {
        description: "Os EPIs selecionados correspondem aos riscos identificados para a tarefa?",
        standardCodes: ["NR-6", "NR-35"],
      },
      {
        description:
          "O estado de conservação e as verificações dos equipamentos de proteção foram conferidos antes do uso?",
        standardCodes: ["NR-6", "NR-35"],
      },
      {
        description: "A equipe recebeu orientação sobre utilização, ajuste e conservação dos EPIs?",
        standardCodes: ["NR-6"],
      },
      {
        description:
          "As condições impeditivas da atividade e os critérios de interrupção foram comunicados aos trabalhadores?",
        standardCodes: ["NR-1", "NR-35"],
      },
      {
        description:
          "O planejamento de emergência e resgate considera a atividade, os recursos e a equipe disponíveis?",
        standardCodes: ["NR-35"],
      },
    ],
  },
];

// Existing catalogue codes; create only if absent, never overwrite normative metadata.
export const PLATFORM_STANDARD_BASELINE = [
  { code: "NR-1", title: "Disposições Gerais e Gerenciamento de Riscos Ocupacionais" },
  { code: "NR-6", title: "Equipamento de Proteção Individual - EPI" },
  { code: "NR-18", title: "Segurança e Saúde no Trabalho na Indústria da Construção" },
  { code: "NR-35", title: "Trabalho em Altura" },
] as const;
export const STANDARD_CATALOGUE_URL =
  "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs";
