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
- **Estado:** demonstrativo

### Objetivo

Apresentar uma prévia da visão analítica de inspeções e conformidade.

### Componentes

- aviso **Dados demonstrativos**;
- cards de KPI;
- gráficos de inspeções e não conformidades;
- listas de não conformidades críticas e próximas inspeções;
- botão **Ver todas** para a lista de inspeções.

Os valores não são consultas agregadas do PostgreSQL.

## 3. Lista de inspeções

- **Rota:** `/inspecoes`
- **Estado:** integrado

### Objetivo

Consultar inspeções persistidas e abrir o fluxo de criação ou execução.

### Componentes

- busca por empresa, checklist ou observações;
- filtro por Planejada, Em andamento, Concluída ou Cancelada;
- botão **Nova inspeção**;
- lista responsiva com código, snapshot/versão, empresa, data, inspetor e
  status;
- estados de carregamento, erro e lista vazia.

Cada registro navega para `/inspecoes/$id`.

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
criação usa o usuário autenticado como responsável e retorna à lista de
inspeções.

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
são persistidas localmente antes da tentativa de sincronização.

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

O identificador da inspeção de origem é um link para `/inspecoes/$id`.

## 10. Relatórios

- **Rota:** `/relatorios`
- **Estado:** demonstrativo

### Objetivo

Apresentar uma prévia visual do relatório previsto.

### Componentes

- aviso de que os dados são locais e demonstrativos;
- seletor de inspeção demonstrativa concluída;
- prévia com dados cadastrais, resumo, respostas e não conformidades;
- botões **Impressão indisponível** e **PDF indisponível**, desabilitados.

Esta tela não representa inspeções persistidas e não recebe redirecionamento
automático ao concluir o fluxo real.

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
| Dashboard         | Demonstrativo               | Prévia analítica                                   |
| Inspeções         | Integrado                   | Consulta e criação                                 |
| Execução          | Integrado + offline parcial | Respostas, evidências e conclusão                  |
| Checklists        | Integrado                   | Catálogo, itens, normas e versões                  |
| Não conformidades | Integrado                   | Tratativa, ações e evidências                      |
| Relatórios        | Demonstrativo               | Prévia do documento                                |
| Empresas          | Integrado                   | Cadastro de empresas                               |
| Normas            | Integrado                   | Consulta de NRs                                    |
| Equipe            | Demonstrativo               | Prévia da equipe                                   |
| Configurações     | Misto                       | Preferências, sincronização e dados demonstrativos |
