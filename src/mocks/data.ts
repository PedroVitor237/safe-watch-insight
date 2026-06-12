import type {
  Usuario,
  Empresa,
  Norma,
  Checklist,
  Inspecao,
  NaoConformidade,
} from "@/types/sst";

export const usuarios: Usuario[] = [
  { id: "u1", nome: "Ana Beatriz Lima", email: "ana.lima@sstapp.com.br", perfil: "inspetor", registroProfissional: "TST-12345", avatarColor: "oklch(0.62 0.16 152)" },
  { id: "u2", nome: "Carlos Mendes", email: "carlos.mendes@sstapp.com.br", perfil: "inspetor", registroProfissional: "TST-22781", avatarColor: "oklch(0.62 0.13 235)" },
  { id: "u3", nome: "Juliana Souza", email: "juliana.souza@sstapp.com.br", perfil: "gestor", avatarColor: "oklch(0.78 0.16 75)" },
  { id: "u4", nome: "Ricardo Pereira", email: "ricardo.pereira@sstapp.com.br", perfil: "auditor", registroProfissional: "ENG-89432", avatarColor: "oklch(0.58 0.22 27)" },
  { id: "u5", nome: "Fernanda Castro", email: "fernanda.castro@sstapp.com.br", perfil: "inspetor", registroProfissional: "TST-55401", avatarColor: "oklch(0.62 0.15 290)" },
];

export const empresas: Empresa[] = [
  {
    id: "e1", razaoSocial: "Metalúrgica Aço Forte Ltda", nomeFantasia: "Aço Forte",
    cnpj: "12345678000190", setor: "Metalurgia", endereco: "Av. Industrial, 1200",
    cidade: "São Bernardo do Campo", uf: "SP",
    unidades: [
      { id: "e1u1", nome: "Unidade Matriz", endereco: "Av. Industrial, 1200" },
      { id: "e1u2", nome: "Galpão de Usinagem", endereco: "Rua da Forja, 45" },
    ],
    riscos: ["Mecânico", "Ruído", "Calor", "Químico"],
  },
  {
    id: "e2", razaoSocial: "Construtora Horizonte S/A", nomeFantasia: "Horizonte Obras",
    cnpj: "98765432000155", setor: "Construção Civil", endereco: "Rua das Obras, 880",
    cidade: "Belo Horizonte", uf: "MG",
    unidades: [
      { id: "e2u1", nome: "Obra Residencial Vila Verde", endereco: "R. das Acácias, 100" },
      { id: "e2u2", nome: "Obra Edifício Comercial Norte", endereco: "Av. Norte, 2200" },
    ],
    riscos: ["Queda em altura", "Soterramento", "Elétrico"],
  },
  {
    id: "e3", razaoSocial: "Logística Express ME", nomeFantasia: "Express Log",
    cnpj: "55444333000122", setor: "Transporte e Logística", endereco: "Rod. BR-101, km 45",
    cidade: "Joinville", uf: "SC",
    unidades: [{ id: "e3u1", nome: "Centro de Distribuição", endereco: "Rod. BR-101, km 45" }],
    riscos: ["Ergonômico", "Atropelamento", "Esmagamento"],
  },
  {
    id: "e4", razaoSocial: "AgroTech Alimentos S/A", nomeFantasia: "AgroTech",
    cnpj: "33222111000180", setor: "Agroindústria", endereco: "Estr. Rural s/n",
    cidade: "Goiânia", uf: "GO",
    unidades: [{ id: "e4u1", nome: "Frigorífico Central", endereco: "Estr. Rural s/n" }],
    riscos: ["Frio", "Biológico", "Corte"],
  },
];

export const normas: Norma[] = [
  { id: "n1", codigo: "NR-1", titulo: "Disposições Gerais e GRO", descricao: "Estabelece o Gerenciamento de Riscos Ocupacionais (GRO) e o PGR.", topicos: ["GRO", "PGR", "Inventário de riscos", "Plano de ação"] },
  { id: "n5", codigo: "NR-5", titulo: "CIPA", descricao: "Comissão Interna de Prevenção de Acidentes e Assédio.", topicos: ["Composição", "Atribuições", "Treinamento"] },
  { id: "n6", codigo: "NR-6", titulo: "Equipamentos de Proteção Individual (EPI)", descricao: "Define obrigações sobre fornecimento e uso de EPIs.", topicos: ["CA", "Treinamento", "Substituição"] },
  { id: "n10", codigo: "NR-10", titulo: "Segurança em Instalações Elétricas", descricao: "Requisitos para trabalhos com energia elétrica.", topicos: ["Prontuário", "SEP", "Aterramento", "Bloqueio"] },
  { id: "n12", codigo: "NR-12", titulo: "Segurança em Máquinas e Equipamentos", descricao: "Proteções, dispositivos de segurança e operação segura.", topicos: ["Proteções fixas", "Botoeiras", "Manutenção"] },
  { id: "n17", codigo: "NR-17", titulo: "Ergonomia", descricao: "Adaptação das condições de trabalho às características psicofisiológicas.", topicos: ["Mobiliário", "Pausas", "AET"] },
  { id: "n35", codigo: "NR-35", titulo: "Trabalho em Altura", descricao: "Requisitos mínimos para trabalho em altura acima de 2 m.", topicos: ["APR", "PTA", "Cinto", "Resgate"] },
];

export const checklists: Checklist[] = [
  {
    id: "c1", titulo: "Inspeção de EPIs - NR-6", normaId: "n6", versao: "1.3",
    descricao: "Checklist padrão para verificação de fornecimento, CA e uso correto de EPIs.",
    secoes: [
      {
        id: "s1", titulo: "Fornecimento e Documentação",
        itens: [
          { id: "i1", texto: "Existe ficha de entrega de EPIs assinada pelos trabalhadores?", criticidade: "alta", normaRef: "NR-6 6.6.1" },
          { id: "i2", texto: "Todos os EPIs possuem Certificado de Aprovação (CA) válido?", criticidade: "critica", normaRef: "NR-6 6.2" },
          { id: "i3", texto: "Há controle de substituição periódica dos EPIs?", criticidade: "media" },
        ],
      },
      {
        id: "s2", titulo: "Uso e Conservação",
        itens: [
          { id: "i4", texto: "Os trabalhadores estão utilizando os EPIs adequados à atividade?", criticidade: "critica" },
          { id: "i5", texto: "Os EPIs encontram-se em bom estado de conservação?", criticidade: "alta" },
          { id: "i6", texto: "Há local apropriado para guarda dos EPIs?", criticidade: "baixa" },
        ],
      },
    ],
  },
  {
    id: "c2", titulo: "Trabalho em Altura - NR-35", normaId: "n35", versao: "2.0",
    descricao: "Verificação de requisitos para atividades acima de 2 metros.",
    secoes: [
      {
        id: "s1", titulo: "Planejamento",
        itens: [
          { id: "i1", texto: "Existe Análise de Risco (APR) específica da atividade?", criticidade: "critica", normaRef: "NR-35 35.4.5" },
          { id: "i2", texto: "Foi emitida Permissão de Trabalho (PT)?", criticidade: "critica" },
          { id: "i3", texto: "Há plano de resgate elaborado e divulgado?", criticidade: "alta" },
        ],
      },
      {
        id: "s2", titulo: "Equipamentos",
        itens: [
          { id: "i4", texto: "Cintos de segurança tipo paraquedista em conformidade e inspecionados?", criticidade: "critica" },
          { id: "i5", texto: "Pontos de ancoragem certificados e em uso?", criticidade: "critica" },
          { id: "i6", texto: "Trabalhadores treinados na NR-35 (capacitação válida)?", criticidade: "alta" },
        ],
      },
    ],
  },
  {
    id: "c3", titulo: "Segurança em Máquinas - NR-12", normaId: "n12", versao: "1.1",
    descricao: "Verificação de proteções e dispositivos de segurança em máquinas.",
    secoes: [
      {
        id: "s1", titulo: "Proteções",
        itens: [
          { id: "i1", texto: "Zonas de perigo possuem proteção fixa ou móvel adequada?", criticidade: "critica" },
          { id: "i2", texto: "Botão de emergência acessível e funcional?", criticidade: "critica" },
          { id: "i3", texto: "Procedimento de bloqueio e etiquetagem (LOTO) implementado?", criticidade: "alta" },
        ],
      },
    ],
  },
];

export const inspecoes: Inspecao[] = [
  {
    id: "ins1", codigo: "INS-2026-0142", titulo: "Auditoria mensal EPIs - Galpão Usinagem",
    empresaId: "e1", unidadeId: "e1u2", checklistId: "c1", inspetorId: "u1",
    agendadaPara: "2026-06-10T09:00:00", iniciadaEm: "2026-06-10T09:12:00",
    concluidaEm: "2026-06-10T11:45:00", status: "concluida",
    respostas: {
      i1: { resposta: "conforme" },
      i2: { resposta: "nao_conforme", observacao: "Encontrados 4 capacetes com CA vencido." },
      i3: { resposta: "conforme" },
      i4: { resposta: "conforme" },
      i5: { resposta: "nao_conforme", observacao: "Luvas de raspa rasgadas em 3 operadores." },
      i6: { resposta: "na" },
    },
    geolocalizacao: { lat: -23.6815, lng: -46.5658 },
    timeline: [
      { id: "t1", data: "2026-06-09T15:00:00", autor: "Juliana Souza", descricao: "Inspeção agendada" },
      { id: "t2", data: "2026-06-10T09:12:00", autor: "Ana Beatriz Lima", descricao: "Inspeção iniciada in loco" },
      { id: "t3", data: "2026-06-10T11:45:00", autor: "Ana Beatriz Lima", descricao: "Inspeção concluída e assinada" },
    ],
  },
  {
    id: "ins2", codigo: "INS-2026-0156", titulo: "Inspeção trabalho em altura - Obra Vila Verde",
    empresaId: "e2", unidadeId: "e2u1", checklistId: "c2", inspetorId: "u2",
    agendadaPara: "2026-06-12T08:00:00", iniciadaEm: "2026-06-12T08:20:00",
    status: "em_andamento",
    respostas: {
      i1: { resposta: "conforme" },
      i2: { resposta: "nao_conforme", observacao: "Permissão de trabalho vencida há 2 dias." },
    },
    timeline: [
      { id: "t1", data: "2026-06-11T10:00:00", autor: "Juliana Souza", descricao: "Inspeção agendada" },
      { id: "t2", data: "2026-06-12T08:20:00", autor: "Carlos Mendes", descricao: "Inspeção iniciada" },
    ],
  },
  {
    id: "ins3", codigo: "INS-2026-0161", titulo: "Verificação NR-12 - linha de envase",
    empresaId: "e4", unidadeId: "e4u1", checklistId: "c3", inspetorId: "u5",
    agendadaPara: "2026-06-15T14:00:00", status: "planejada",
    respostas: {}, timeline: [
      { id: "t1", data: "2026-06-08T11:00:00", autor: "Juliana Souza", descricao: "Inspeção agendada" },
    ],
  },
  {
    id: "ins4", codigo: "INS-2026-0138", titulo: "Auditoria EPIs CD Joinville",
    empresaId: "e3", unidadeId: "e3u1", checklistId: "c1", inspetorId: "u1",
    agendadaPara: "2026-06-06T09:00:00", iniciadaEm: "2026-06-06T09:05:00",
    status: "pendente_sync",
    respostas: {
      i1: { resposta: "conforme" }, i2: { resposta: "conforme" }, i3: { resposta: "conforme" },
      i4: { resposta: "conforme" }, i5: { resposta: "conforme" }, i6: { resposta: "conforme" },
    },
    timeline: [
      { id: "t1", data: "2026-06-06T09:05:00", autor: "Ana Beatriz Lima", descricao: "Inspeção iniciada offline" },
    ],
  },
];

export const ncs: NaoConformidade[] = [
  {
    id: "nc1", codigo: "NC-2026-0091", titulo: "EPIs com CA vencido",
    descricao: "4 capacetes encontrados na linha de usinagem com Certificado de Aprovação vencido.",
    inspecaoId: "ins1", empresaId: "e1", itemChecklistId: "i2",
    criticidade: "critica", status: "em_tratativa",
    abertaEm: "2026-06-10T11:30:00", prazo: "2026-06-20T23:59:00", responsavelId: "u3",
    planoAcao: {
      oQue: "Substituir capacetes com CA vencido",
      porQue: "Não conformidade com NR-6 6.2 - risco grave aos operadores",
      onde: "Galpão de Usinagem - Aço Forte",
      quem: "Juliana Souza (SESMT)",
      quando: "20/06/2026",
      como: "Cotação com fornecedor homologado, descarte controlado dos antigos e nova entrega com ficha assinada",
      quanto: "R$ 2.400,00",
    },
    evidencias: ["foto-capacete-ca.jpg", "ficha-entrega.pdf"],
    timeline: [
      { id: "t1", data: "2026-06-10T11:30:00", autor: "Ana Beatriz Lima", descricao: "NC registrada durante inspeção" },
      { id: "t2", data: "2026-06-11T09:00:00", autor: "Juliana Souza", descricao: "Plano de ação 5W2H elaborado" },
    ],
  },
  {
    id: "nc2", codigo: "NC-2026-0092", titulo: "Luvas de raspa danificadas",
    descricao: "3 operadores utilizando luvas com rasgos significativos.",
    inspecaoId: "ins1", empresaId: "e1", itemChecklistId: "i5",
    criticidade: "alta", status: "aberta",
    abertaEm: "2026-06-10T11:35:00", prazo: "2026-06-17T23:59:00", responsavelId: "u3",
    evidencias: ["foto-luvas.jpg"],
    timeline: [{ id: "t1", data: "2026-06-10T11:35:00", autor: "Ana Beatriz Lima", descricao: "NC registrada" }],
  },
  {
    id: "nc3", codigo: "NC-2026-0095", titulo: "Permissão de Trabalho vencida",
    descricao: "PT para trabalho em altura vencida há 2 dias e atividade em andamento.",
    inspecaoId: "ins2", empresaId: "e2", itemChecklistId: "i2",
    criticidade: "critica", status: "aberta",
    abertaEm: "2026-06-12T08:45:00", prazo: "2026-06-12T18:00:00", responsavelId: "u3",
    evidencias: ["pt-vencida.pdf"],
    timeline: [{ id: "t1", data: "2026-06-12T08:45:00", autor: "Carlos Mendes", descricao: "NC registrada - paralisação imediata da atividade" }],
  },
  {
    id: "nc4", codigo: "NC-2026-0078", titulo: "Falta de plano de resgate em altura",
    descricao: "Equipe não possui plano de resgate documentado para trabalhos acima de 5m.",
    inspecaoId: "ins2", empresaId: "e2", itemChecklistId: "i3",
    criticidade: "alta", status: "resolvida",
    abertaEm: "2026-05-20T10:00:00", prazo: "2026-06-05T23:59:00", responsavelId: "u4",
    planoAcao: {
      oQue: "Elaborar e treinar equipe no plano de resgate",
      porQue: "Atendimento à NR-35.5.3",
      onde: "Todas as frentes de obra Horizonte",
      quem: "Ricardo Pereira",
      quando: "05/06/2026",
      como: "Contratação de empresa especializada para elaboração e simulado",
      quanto: "R$ 8.500,00",
    },
    evidencias: ["plano-resgate.pdf", "lista-presenca-treinamento.pdf"],
    timeline: [
      { id: "t1", data: "2026-05-20T10:00:00", autor: "Carlos Mendes", descricao: "NC registrada" },
      { id: "t2", data: "2026-06-04T16:00:00", autor: "Ricardo Pereira", descricao: "Treinamento realizado" },
      { id: "t3", data: "2026-06-05T18:00:00", autor: "Ricardo Pereira", descricao: "NC resolvida e evidências anexadas" },
    ],
  },
  {
    id: "nc5", codigo: "NC-2026-0061", titulo: "Botão de emergência inoperante",
    descricao: "Máquina envasadora 03 com botão de emergência travado mecanicamente.",
    inspecaoId: "ins3", empresaId: "e4", itemChecklistId: "i2",
    criticidade: "critica", status: "vencida",
    abertaEm: "2026-05-01T09:00:00", prazo: "2026-05-15T23:59:00", responsavelId: "u3",
    evidencias: [],
    timeline: [{ id: "t1", data: "2026-05-01T09:00:00", autor: "Fernanda Castro", descricao: "NC registrada" }],
  },
];

export const kpisMock = {
  inspecoesMes: 18,
  inspecoesMesVar: 12,
  ncsAbertas: 7,
  ncsAbertasVar: -3,
  taxaConformidade: 84,
  taxaConformidadeVar: 4,
  prazoMedioResolucaoDias: 9,
  prazoMedioVar: -2,
  inspecoesPorMes: [
    { mes: "Jan", planejadas: 12, concluidas: 10 },
    { mes: "Fev", planejadas: 15, concluidas: 14 },
    { mes: "Mar", planejadas: 18, concluidas: 17 },
    { mes: "Abr", planejadas: 16, concluidas: 16 },
    { mes: "Mai", planejadas: 20, concluidas: 19 },
    { mes: "Jun", planejadas: 22, concluidas: 18 },
  ],
  ncsPorNorma: [
    { norma: "NR-6", quantidade: 12 },
    { norma: "NR-10", quantidade: 4 },
    { norma: "NR-12", quantidade: 9 },
    { norma: "NR-17", quantidade: 6 },
    { norma: "NR-35", quantidade: 11 },
  ],
  ncsPorCriticidade: [
    { name: "Crítica", value: 6, color: "oklch(0.58 0.22 27)" },
    { name: "Alta", value: 11, color: "oklch(0.78 0.16 75)" },
    { name: "Média", value: 14, color: "oklch(0.62 0.13 235)" },
    { name: "Baixa", value: 8, color: "oklch(0.62 0.16 152)" },
  ],
};
