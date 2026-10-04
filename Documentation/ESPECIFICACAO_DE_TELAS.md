# Especificação de Telas — Safe Watch Insight

Este documento descreve as interfaces atuais da plataforma de apoio a
inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST).
Ele compõe a documentação de requisitos e do TCC, mas organiza as telas por
responsabilidade permanente do produto.

## Convenções de estado

- **Integrado:** usa Server Functions, Services, Repositories, Prisma e
  PostgreSQL.
- **Integrado com offline parcial:** usa o backend e também a persistência local
  do primeiro incremento Offline/PWA.
- **Demonstrativo:** apresenta a experiência planejada com dados locais
  identificados na interface; não deve ser interpretado como módulo concluído.

Todas as telas internas usam o `AppShell`, com menu lateral recolhível, barra
superior, indicador de sincronização, notificações e acesso ao usuário
autenticado. O menu é dividido entre **Operação** e **Cadastros**.

## 1. Login

- **Rota:** `/login`
- **Estado:** integrado

### Objetivo

Autenticar um usuário cadastrado e iniciar uma sessão protegida.

### Componentes

- campos de e-mail e senha;
- botão **Entrar** com estado de envio;
- painel institucional em telas largas;
- bloco com as credenciais do ambiente demonstrativo.

O formulário não possui seletor de perfil. Credenciais inválidas são rejeitadas
pelo backend.

### Navegação

`/` redireciona para esta tela. Um login válido leva a `/dashboard`; uma
sessão já ativa também evita a reapresentação do formulário.

## 2. Dashboard

- **Rota:** `/dashboard`
- **Estado:** integrado

### Objetivo

Exibir a visão operacional das inspeções do usuário autenticado, com agregações
reais do PostgreSQL via useDashboard/getDashboard/Service/Repository.

### Componentes

- cinco cards: Total de inspeções, Concluídas, Em andamento, NCs abertas e
  Conformidade;
- gráfico de barras **Inspeções por status** (Planejadas, Em andamento,
  Concluídas e Canceladas);
- **Requer atenção**: planejadas, NCs vencidas e ações vencidas; o badge soma
  essas contagens, sem deduplicar inspeções;
- até cinco **Inspeções recentes**, título/versão do snapshot, empresa/inspetor
  atuais e status;
- **Nova inspeção**, **Ver todas**, **Ver inspeção** ou **Ver relatório** para
  concluídas (/relatorios?inspectionId=UUID);
- skeletons, erro com **Tentar novamente** e estado sem inspeções.

Recentes são ordenadas por inspectionDate DESC, createdAt DESC, id DESC.
NCs abertas incluem OPEN/IN_PROGRESS/OVERDUE. Conformidade =
round(100 × COMPLIANT/(COMPLIANT+NON_COMPLIANT)) nas respostas com snapshotItemId
em inspeções COMPLETED. N/A e pendentes ficam fora; sem aplicáveis exibe **—**.
Atrasos são calculados sem alterar status no banco. Não há BI, filtros avançados,
séries históricas ou exportação. A query não tem pacote offline próprio.
Fórmulas completas: [BusinessRules.md](../AI/BusinessRules.md).

## 3. Lista de inspeções

- **Rota:** `/inspecoes`
- **Estado:** integrado com offline parcial

### Objetivo

Consultar inspeções persistidas e abrir o fluxo de criação ou execução.

### Componentes

- busca por empresa, checklist ou observações;
- filtro por Planejada, Em andamento, Concluída ou Cancelada;
- botão **Nova inspeção**;
- lista responsiva com código, snapshot/versão, empresa, data, inspetor e
  status;
- estados de carregamento, erro e lista vazia.

Cada registro navega para `/inspecoes/$id`. Lista própria com fallback para
pacotes previamente cacheados no dispositivo; não inclui todo o banco offline.
Não há ação de edição/cancelamento/reabertura/exclusão nessa UI, embora exclusão
lógica exista na Server Function/hook.

## 4. Nova inspeção

- **Rota:** `/inspecoes/nova`
- **Estado:** integrado

### Objetivo

Criar uma inspeção e seu snapshot histórico a partir de uma versão publicada.

### Componentes

O assistente possui três etapas:

1. seleção da empresa;
2. seleção da versão publicada e observações iniciais;
3. data/hora e resumo.

Os botões **Voltar**, **Avançar** e **Criar inspeção** controlam o fluxo. A
criação online usa o usuário autenticado como responsável, empresa própria,
checklist ativo acessível e versão PUBLISHED; persiste PLANNED/SYNCED com snapshot
na mesma transação e retorna à lista de inspeções.

Não há seleção de unidade, título independente ou outro inspetor nesta versão da
tela.

## 5. Detalhe e execução de inspeção

- **Rota:** `/inspecoes/$id`
- **Estado:** integrado com offline parcial

### Objetivo

Executar o snapshot histórico do checklist, registrar respostas e evidências e
concluir a inspeção.

### Componentes

- cabeçalho com status da inspeção e da sincronização;
- aviso para snapshots legados não verificáveis;
- cards de progresso, não conformidades, inspetor e data;
- abas **Execução do checklist**, **Evidências** e **Encerrar**.

Na execução, cada item exibe descrição, ordem, obrigatoriedade e normas
históricas. As respostas disponíveis são **Conforme**, **NC** e **N/A**. Após
uma resposta, o campo de observação é exibido. Uma resposta NC gera a não
conformidade correspondente por regra de negócio.

A aba de evidências permite seleção múltipla, prévia, legenda, upload, consulta e
remoção de JPEG, PNG ou WebP de até 4 MB por arquivo. O upload fica indisponível
sem conexão.

A aba de encerramento informa a imutabilidade após conclusão e apresenta o botão
**Concluir inspeção**. A assinatura não está disponível. Respostas e conclusão
são persistidas localmente antes da tentativa de sincronização, inclusive online.
N/A atende item obrigatório; opcionais podem ficar pendentes. Não exige NC
resolvida/fotos/ações concluídas. COMPLETED/CANCELLED desabilitam respostas e
observações; não congela NCs/ações/evidências. Em COMPLETED aparece **Ver relatório**
com inspectionId na busca; encerramento retorna à lista e só se confirma no
servidor após sync. Sem reabertura de inspeção.

## 6. Biblioteca de checklists

- **Rota:** `/checklists`
- **Estado:** integrado

### Objetivo

Manter o catálogo de checklists ativos.

### Componentes

- cards com título, descrição, tipo, estado, versão e quantidade de itens;
- botão **Novo modelo**;
- ações **Abrir**, **Editar** e **Excluir**;
- diálogos de criação e edição com título, descrição, indicação de template e
  estado ativo;
- estados de carregamento, erro e lista vazia.

## 7. Editor de checklist

- **Rota:** `/checklists/$id`
- **Estado:** integrado

### Objetivo

Manter itens e associações normativas do rascunho e publicar versões imutáveis.

### Componentes

- dados e badges do checklist e da versão;
- lista ordenada de itens;
- botão **Novo item**;
- ações **Editar** e **Excluir** por item;
- seleção de NRs aplicáveis no diálogo do item;
- botão **Publicar vN** quando há rascunho;
- botão **Voltar**.

A interface informa que editar conteúdo já publicado cria o próximo rascunho e
não altera versões anteriores.

## 8. Lista de não conformidades

- **Rota:** `/nao-conformidades`
- **Estado:** integrado

### Objetivo

Pesquisar e acompanhar as não conformidades geradas nas inspeções.

### Componentes

- busca por descrição, item ou empresa;
- filtro por severidade;
- abas **Kanban** e **Lista**;
- colunas Abertas, Em tratativa, Resolvidas e Vencidas;
- cards e linhas com código, item histórico, empresa, prazo, responsável,
  severidade e status.

Cards e linhas levam a `/nao-conformidades/$id`.

## 9. Detalhe de não conformidade

- **Rota:** `/nao-conformidades/$id`
- **Estado:** integrado

### Objetivo

Tratar uma não conformidade sem perder o contexto histórico da inspeção.

### Componentes

- edição de descrição, severidade e prazo;
- painel de ações corretivas com campos aplicáveis do 5W2H;
- histórico de criação, atualização e ações;
- detalhes da empresa, inspetor, prazo e inspeção de origem;
- normas históricas e links oficiais quando disponíveis;
- seletor de status;
- painel de evidências;
- ações **Arquivar** e **Voltar**.

O identificador da inspeção de origem é um link para `/inspecoes/$id`. A NC é
isolada pela inspeção do usuário; descrição/severidade/prazo/status continuam
editáveis após conclusão da inspeção. Arquivar oculta NC/filhos na API sem
exclusão física; mudar resposta de NC para Conforme/N/A também arquiva a NC.
Nova NC automática é MEDIUM/OPEN com prazo de sete dias; restauração conserva
prazo/descrição/severidade/filhos e volta a OPEN.

No 5W2H, apenas descrição é conteúdo obrigatório; justificativa, local,
responsável, prazo, método e custo são opcionais. Criar ação em NC OPEN muda NC
para IN_PROGRESS; concluir ações não resolve NC automaticamente. completedAt
é do servidor. Listas/detalhes de NC e listagem de ações persistem atrasos,
diferentemente de dashboard/relatório. UI possui histórico derivado de datas,
sem audit log completo. Coerção de prazo vazio/NULL e concerns em
[BusinessRules.md](../AI/BusinessRules.md).

## 10. Relatórios

- **Rota:** `/relatorios`, busca opcional `inspectionId` UUID
- **Estado:** integrado

### Objetivo

Visualizar relatório por inspeção própria, montado sob demanda a partir de dados
persistidos, e imprimir pelo navegador.

### Componentes

- seletor de inspeções COMPLETED próprias com snapshot, ordenadas por data DESC/
  id DESC; sem busca seleciona a primeira disponível;
- identificação, empresa e inspetor atuais, título/versão/captura do snapshot;
- alerta UNVERIFIED_LEGACY quando aplicável;
- resumo (total/respondidos/conformes/NC/N/A/pendentes/preenchimento), notas,
  resultados item a item, fundamentação normativa, evidências gerais, NCs e
  ações corretivas/evidências ativas;
- skeletons, ausência de concluídas, erros e **Tentar novamente**;
- **Imprimir** habilitado quando há relatório: window.print() → diálogo do
  navegador → impressão ou salvar como PDF. CSS A4 oculta menu/controles.

O parâmetro inspectionId consulta diretamente mesmo fora da lista: backend
valida dono/snapshot, sem exigir COMPLETED. Essa diferença está registrada para
Final QA em [RelatorioFase6.md](./RelatorioFase6.md). Nenhuma visualização insere
Report ou gera arquivo PDF backend; Report é model persistível separado.
Preenchimento conta N/A e retorna 0 sem itens; não é taxa de conformidade.
Opcionais pendentes podem existir em concluídas. Conclusão não redireciona
automaticamente a esta tela; **Ver relatório** existe no detalhe/dashboard.
Não há pacote/fila offline dedicado para relatórios.

## 11. Empresas

- **Rota:** `/empresas`
- **Estado:** integrado

### Objetivo

Manter as empresas fiscalizadas utilizadas nas inspeções.

### Componentes

- cards com razão social, nome fantasia, CNPJ, CNAE, endereço, funcionários e
  grau de risco;
- botão **Nova empresa**;
- ações **Editar** e **Excluir**;
- diálogo com razão social, nome fantasia, CNPJ, CNAE, grau de risco,
  funcionários, endereço e observações.

Não há rota de detalhe da empresa.

## 12. Normas Regulamentadoras

- **Rota:** `/normas`
- **Estado:** integrado

### Objetivo

Consultar o catálogo de Normas Regulamentadoras persistido.

### Componentes

- busca por código, título ou descrição;
- filtro por vigentes, revogadas ou todas;
- cards com código, título, resumo e estado;
- link **Consultar fonte oficial** quando o endereço está cadastrado.

## 13. Equipe

- **Rota:** `/equipe`
- **Estado:** demonstrativo

### Objetivo

Apresentar a experiência planejada para consulta da equipe.

### Componentes

- aviso **Dados demonstrativos**;
- cards de usuários com nome, e-mail, perfil, registro e métricas locais.

Não há gestão de usuários integrada ao backend nesta tela.

## 14. Configurações

- **Rota:** `/configuracoes`
- **Estado:** misto

### Objetivo

Reunir preferências locais, diagnóstico da persistência offline e controles dos
módulos demonstrativos.

### Componentes

- **Aparência:** alternância local de modo escuro;
- **Perfil ativo:** seleção demonstrativa que afeta apenas telas mockadas;
- **Funcionamento offline:** conexão detectada, inspeções no dispositivo,
  operações pendentes, falhas, conflitos e **Sincronizar agora**;
- **Dados do protótipo:** restauração somente dos dados demonstrativos.

Não existe alternância manual para simular conectividade. O estado online vem do
navegador e o resultado das operações é confirmado pelo servidor.

## 15. Estados globais

O componente raiz oferece telas para:

- página não encontrada;
- falha de carregamento, com ações de tentar novamente e voltar ao início.

## Resumo

| Tela              | Estado                      | Responsabilidade                                   |
| ----------------- | --------------------------- | -------------------------------------------------- |
| Login             | Integrado                   | Autenticação e sessão                              |
| Dashboard         | Integrado                   | Indicadores operacionais próprios                  |
| Inspeções         | Integrado + offline parcial | Consulta e criação                                 |
| Execução          | Integrado + offline parcial | Respostas, evidências e conclusão                  |
| Checklists        | Integrado                   | Catálogo, itens, normas e versões                  |
| Não conformidades | Integrado                   | Tratativa, ações e evidências                      |
| Relatórios        | Integrado                   | DTO/HTML sob demanda e impressão nativa            |
| Empresas          | Integrado                   | Cadastro de empresas                               |
| Normas            | Integrado                   | Consulta de NRs                                    |
| Equipe            | Demonstrativo               | Prévia da equipe                                   |
| Configurações     | Misto                       | Preferências, sincronização e dados demonstrativos |
