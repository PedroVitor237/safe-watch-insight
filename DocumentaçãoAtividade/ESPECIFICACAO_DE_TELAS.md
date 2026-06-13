# Especificação de Telas — Plataforma SST Inspeções

Documento de especificação das interfaces que compõem o protótipo funcional da plataforma de apoio a inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST). A descrição segue padrões da Engenharia de Requisitos e tem por objetivo subsidiar a documentação de Trabalho de Conclusão de Curso, registrando, para cada tela, sua finalidade, os elementos de interface presentes e os fluxos de navegação aplicáveis.

> **Observações gerais sobre o ambiente de execução.** Todas as telas internas são apresentadas dentro de um *layout shell* persistente (`AppShell`) composto por: (i) **menu lateral de navegação** segmentado em dois grupos — *Operação* (Dashboard, Inspeções, Checklists, Não Conformidades, Relatórios) e *Cadastros* (Empresas, Normas, Equipe, Configurações) — com opção de colapso; (ii) **barra superior** contendo o gatilho do menu lateral, indicadores de estado *offline* e de itens pendentes de sincronização, alternância manual de conexão, botão de notificações e acesso ao perfil do usuário; e (iii) **faixa informativa** exibida quando o modo *offline* está ativo, comunicando que as alterações serão enfileiradas para sincronização posterior.

---

## 1. Tela de Login

- **Rota:** `/login`

### Objetivo
Constitui o ponto de entrada da aplicação, permitindo a autenticação simulada do usuário e a seleção do perfil operacional (Inspetor, Gestor SST ou Auditor), parâmetro que condiciona as permissões e elementos visuais apresentados nas demais telas. Apresenta também o posicionamento institucional da plataforma, contextualizando o usuário quanto às suas funcionalidades centrais.

### Componentes
- **Campos:** entrada de *e-mail*, entrada de *senha* (mascarada) e seletor de *perfil* implementado por grupo de botões de rádio em formato de cartões selecionáveis (Inspetor, Gestor, Auditor).
- **Botões:** botão primário **Entrar**, responsável por persistir o usuário e perfil escolhidos no *store* local e redirecionar ao Dashboard.
- **Cards:** cartão principal de autenticação, contendo título, descrição e formulário; painel lateral institucional (visível em telas largas) apresentando o logotipo, *headline* e síntese das funcionalidades.
- **Tabelas, Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** tela inicial do sistema (`/`), acessada por usuários não autenticados.
- **Destino:** após submissão bem-sucedida, o usuário é direcionado ao **Dashboard** (`/dashboard`).

---

## 2. Dashboard

- **Rota:** `/dashboard`

### Objetivo
Oferece uma visão consolidada e analítica do estado das inspeções e da conformidade organizacional, apresentando indicadores-chave de desempenho (KPIs), distribuições gráficas e listas de exceção. Destina-se a apoiar a tomada de decisão de gestores e auditores, bem como a orientar a próxima ação operacional do inspetor.

### Componentes
- **Cards (KPIs):** *Inspeções no mês*, *NCs abertas*, *Taxa de conformidade* e *Prazo médio de resolução*, cada qual contendo valor numérico, variação percentual frente ao período anterior e ícone identificador.
- **Cards de gráficos:**
  - *Inspeções por mês* — gráfico de barras agrupadas (planejadas × concluídas).
  - *NCs por criticidade* — gráfico de rosca.
  - *NCs por norma* — gráfico de barras horizontais.
- **Cards de listagem:**
  - *NCs críticas* — relação das não conformidades de criticidade crítica, cada item navegável.
  - *Próximas inspeções* — agendamentos vindouros, com indicação de empresa, data e *status*.
- **Botões:** botão **Ver todas** (no card de próximas inspeções), botão **Sair** (no rodapé do menu lateral) e itens do menu lateral.
- **Campos, Tabelas e Modais:** não se aplicam.

### Navegação
- **Origem:** Tela de Login (após autenticação) ou qualquer item do menu lateral *Dashboard*.
- **Destinos:** *Lista de Inspeções* (via botão **Ver todas** ou via clique em item da lista de próximas inspeções, indo ao **Detalhe de Inspeção**); *Detalhe de Não Conformidade* (via clique em item da lista de NCs críticas); demais telas via menu lateral.

---

## 3. Lista de Inspeções

- **Rota:** `/inspecoes`

### Objetivo
Disponibiliza a relação completa das inspeções cadastradas, permitindo a triagem por *status* e a busca textual, com vistas a localizar registros e iniciar a execução, o acompanhamento ou a auditoria de inspeções.

### Componentes
- **Campos:** caixa de busca textual (filtra por código, título ou empresa) e seletor de *status* (Todos, Planejada, Em andamento, Concluída, *Sync* pendente).
- **Botões:** botão primário **Nova inspeção**, que conduz ao formulário de criação.
- **Tabelas:** listagem em formato tabular responsivo com as colunas *Código*, *Inspeção*, *Empresa*, *Agendada*, *Inspetor* e *Status*; cada linha funciona como *link* para o detalhe correspondente.
- **Cards:** cartão envoltório do bloco de filtros e cartão envoltório da listagem.
- **Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** menu lateral (*Inspeções*) ou ações de retorno em telas filhas.
- **Destinos:** *Nova Inspeção* (`/inspecoes/nova`) e *Detalhe de Inspeção* (`/inspecoes/$id`).

---

## 4. Nova Inspeção (Assistente em Três Passos)

- **Rota:** `/inspecoes/nova`

### Objetivo
Conduzir o usuário pelo processo de planejamento de uma inspeção, dividido em três etapas sequenciais — *Empresa e unidade*, *Checklist e título* e *Agendamento* — minimizando a sobrecarga cognitiva e validando, em cada etapa, a completude dos dados necessários antes do avanço.

### Componentes
- **Campos:**
  - Passo 1: seletor de *Empresa* e seletor dependente de *Unidade*.
  - Passo 2: seletor de *Checklist/Norma*, campo de *Título* e área de texto para *Observações iniciais*.
  - Passo 3: campo de *Data e hora* (entrada *datetime-local*) e seletor de *Inspetor responsável*.
- **Botões:** **Voltar** e **Avançar** (com validação condicional por passo) e **Criar inspeção** (no passo final, persiste a entidade e redireciona).
- **Cards:** cartão único contendo o formulário e o indicador de progresso composto por círculos numerados.
- **Tabelas, Menus e Modais:** não se aplicam. Há, no terceiro passo, um quadro-resumo das escolhas realizadas.

### Navegação
- **Origem:** *Lista de Inspeções* (botão **Nova inspeção**).
- **Destino:** após a criação, o usuário é direcionado ao *Detalhe de Inspeção* (`/inspecoes/$id`) da entidade recém-criada.

---

## 5. Detalhe e Execução de Inspeção

- **Rota:** `/inspecoes/$id`

### Objetivo
Constitui o núcleo operacional da plataforma. Permite a execução do checklist em campo, com registro de respostas por item (Conforme, Não Conforme ou Não Aplicável), inserção de observações e evidências, acompanhamento do progresso, visualização da linha do tempo (rastreabilidade) e encerramento com coleta de assinatura digital do responsável pela área inspecionada. Caso um item seja marcado como *Não Conforme*, uma Não Conformidade é gerada automaticamente, com prazo padrão e responsável pré-atribuído.

### Componentes
- **Cards de cabeçalho:** *Progresso*, *Não conformidades* (contagem), *Inspetor* (com registro profissional) e *Geolocalização* (coordenadas e data/hora de início).
- **Menu de abas (Tabs):** *Execução do checklist*, *Timeline* e *Encerrar*.
- **Aba *Execução do checklist*:** cartões por seção contendo, para cada item, descrição, criticidade, referência normativa e três **botões** de resposta — *Conforme*, *NC* e *N/A*. Ao registrar NC, são exibidos uma *área de texto* para observações e um **botão Anexar foto** (mock).
- **Aba *Timeline*:** lista ordenada de eventos com data, autor e descrição, representando a trajetória da inspeção.
- **Aba *Encerrar*:** canvas para coleta de **assinatura digital** do responsável e botões **Limpar** e **Concluir e assinar**.
- **Botões adicionais:** **Voltar** (retorno à lista) e *badge* de *status* da inspeção.
- **Modais:** não se aplicam (notificações ocorrem via *toasts*).

### Navegação
- **Origem:** *Lista de Inspeções*, *Nova Inspeção* (após criação) ou *Dashboard* (clique em próxima inspeção).
- **Destinos:** *Lista de Inspeções* (retorno) e *Relatórios* (ao concluir e assinar, o sistema direciona para a geração do relatório).

---

## 6. Biblioteca de Checklists

- **Rota:** `/checklists`

### Objetivo
Apresenta o catálogo de modelos de checklist disponíveis, organizados por norma regulamentadora, permitindo ao usuário consultar os instrumentos vigentes e acessar seus detalhes para revisão ou edição.

### Componentes
- **Cards:** cartões clicáveis por modelo, exibindo ícone, versão, título, norma associada, descrição e métricas (número de seções e de itens).
- **Botões:** botão primário **Novo modelo** (preparado para fluxo de criação).
- **Campos, Tabelas, Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** menu lateral (*Checklists*).
- **Destinos:** *Editor de Checklist* (`/checklists/$id`) ao selecionar um cartão.

---

## 7. Editor / Visualizador de Checklist

- **Rota:** `/checklists/$id`

### Objetivo
Permite a inspeção estrutural de um modelo de checklist, expondo suas seções e itens, suas referências normativas e a criticidade associada a cada item, a fim de subsidiar revisões, auditorias internas e a manutenção da biblioteca normativa.

### Componentes
- **Cards:** um cartão por seção, contendo o título da seção e a lista numerada de itens.
- **Itens:** cada item apresenta texto descritivo, referência normativa e *badge* de criticidade.
- **Botões:** **Voltar** para a biblioteca.
- **Campos, Tabelas, Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** *Biblioteca de Checklists*.
- **Destino:** retorno à *Biblioteca de Checklists*.

---

## 8. Lista de Não Conformidades

- **Rota:** `/nao-conformidades`

### Objetivo
Concentra a gestão das não conformidades identificadas nas inspeções, oferecendo dois modos de visualização — *Kanban* (segmentado por estágio do ciclo de tratativa) e *Lista* (visão tabular) — de modo a apoiar o acompanhamento do fluxo de resolução e a priorização de ações.

### Componentes
- **Menu de abas (Tabs):** alternância entre as visões *Kanban* e *Lista*.
- **Cards:** na visão *Kanban*, cartões compactos por NC contendo código, criticidade, título, empresa, prazo e responsável; agrupados em colunas *Abertas*, *Em tratativa*, *Resolvidas* e *Vencidas*.
- **Tabelas:** na visão *Lista*, linhas com ícone de alerta, título, código, empresa e *badges* de criticidade e *status*; cada linha é navegável.
- **Botões, Campos e Modais:** não se aplicam diretamente nesta tela.

### Navegação
- **Origem:** menu lateral (*Não conformidades*) ou *Dashboard* (via NCs críticas).
- **Destino:** *Detalhe de Não Conformidade* (`/nao-conformidades/$id`).

---

## 9. Detalhe de Não Conformidade

- **Rota:** `/nao-conformidades/$id`

### Objetivo
Centraliza o tratamento de uma NC específica, possibilitando descrever a ocorrência, elaborar e versionar o **Plano de Ação 5W2H** (*O quê, Por quê, Onde, Quem, Quando, Como, Quanto*), atualizar o *status* do ciclo de tratativa, anexar evidências e acompanhar a linha do tempo de eventos relacionados.

### Componentes
- **Cards principais (coluna esquerda):** *Descrição*, *Plano de ação 5W2H* (formulário) e *Timeline*.
- **Cards laterais (coluna direita):** *Detalhes* (data de abertura, prazo, empresa, responsável, inspeção de origem), *Status* (seletor) e *Evidências* (lista de anexos e botão de anexação).
- **Campos:** sete campos do 5W2H (seis campos de texto curto e um campo de texto longo para o *Como*), além do seletor de *status*.
- **Botões:** **Salvar plano**, **Anexar evidência** e **Voltar**.
- **Tabelas, Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** *Lista de Não Conformidades* ou *Dashboard* (lista de NCs críticas).
- **Destino:** retorno à *Lista de Não Conformidades*.

---

## 10. Relatórios

- **Rota:** `/relatorios`

### Objetivo
Permite a seleção de uma inspeção concluída e a visualização de seu relatório consolidado em formato apropriado para impressão e exportação. O relatório agrega dados cadastrais, indicadores quantitativos, detalhamento item a item, lista de NCs registradas e a assinatura digital coletada no encerramento.

### Componentes
- **Campos:** seletor de *inspeção concluída*.
- **Botões:** **Imprimir** (acionando a impressão nativa do navegador) e **Exportar PDF** (simulação).
- **Cards:** cartão de seleção e cartão de pré-visualização do relatório, com seções *Cabeçalho*, *Dados cadastrais*, *Resumo* (totais), *Detalhamento*, *Não conformidades registradas* e *Assinatura do responsável*.
- **Tabelas, Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** menu lateral (*Relatórios*) ou *Detalhe de Inspeção* (após encerramento).
- **Destino:** demais telas via menu lateral; impressão local ou exportação simulada não geram navegação.

---

## 11. Empresas e Unidades

- **Rota:** `/empresas`

### Objetivo
Apresenta o cadastro das empresas fiscalizadas e suas respectivas unidades operacionais, incluindo dados de identificação, localização, setor de atividade e riscos associados, servindo de base para o vínculo com as inspeções.

### Componentes
- **Cards:** um cartão por empresa, contendo razão social, nome fantasia, CNPJ formatado, setor, endereço, lista de unidades e *badges* de riscos.
- **Botões:** botão primário **Nova empresa** (previsto para fluxo de criação).
- **Campos, Tabelas, Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** menu lateral (*Empresas*).
- **Destinos:** demais telas via menu lateral. No protótipo atual, não há subtela dedicada por empresa.

---

## 12. Normas Regulamentadoras

- **Rota:** `/normas`

### Objetivo
Constitui a biblioteca de Normas Regulamentadoras (NRs) aplicáveis ao contexto fiscalizado, oferecendo descrição sumária e tópicos relacionados, com a finalidade de apoiar a consulta normativa durante a elaboração de checklists e a análise de não conformidades.

### Componentes
- **Cards:** um cartão por NR, contendo código, título, descrição e *badges* dos tópicos cobertos.
- **Botões, Campos, Tabelas, Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** menu lateral (*Normas (NRs)*).
- **Destinos:** demais telas via menu lateral.

---

## 13. Equipe

- **Rota:** `/equipe`

### Objetivo
Apresenta os profissionais cadastrados — inspetores, gestores e auditores — com seus dados de contato, registro profissional e métricas de carga de trabalho (inspeções executadas e NCs sob responsabilidade), favorecendo a gestão da capacidade operacional.

### Componentes
- **Cards:** um cartão por usuário, contendo avatar com iniciais, nome, e-mail, *badge* de perfil, registro profissional e dois indicadores numéricos (*Inspeções* e *NCs sob responsabilidade*).
- **Botões, Campos, Tabelas, Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** menu lateral (*Equipe*).
- **Destinos:** demais telas via menu lateral.

---

## 14. Configurações

- **Rota:** `/configuracoes`

### Objetivo
Reúne as preferências do aplicativo e os controles de sincronização e dados do protótipo. Permite alternar o tema visual, trocar o perfil ativo, simular o modo *offline* (com fila de sincronização) e restaurar os dados mockados para fins de demonstração.

### Componentes
- **Cards:** *Aparência*, *Perfil ativo*, *Sincronização* e *Dados do protótipo*.
- **Campos:** alternador (*switch*) de **Modo escuro**, seletor de **Perfil ativo**, alternador de **Modo offline** e indicador numérico de itens pendentes.
- **Botões:** **Sincronizar agora** (habilitado quando há pendências e a conexão está ativa) e **Restaurar dados mock**.
- **Tabelas, Menus e Modais:** não se aplicam.

### Navegação
- **Origem:** menu lateral (*Configurações*) ou clique sobre o avatar do usuário na barra superior.
- **Destinos:** demais telas via menu lateral.

---

## Tabela-Resumo

| Tela | Objetivo |
|---|---|
| Login | Autenticar o usuário (simulado) e definir o perfil operacional ativo. |
| Dashboard | Apresentar KPIs, gráficos e listas de exceção para apoio à decisão. |
| Lista de Inspeções | Listar, filtrar e buscar inspeções planejadas, em andamento e concluídas. |
| Nova Inspeção | Planejar uma inspeção por meio de assistente em três passos (empresa, checklist, agendamento). |
| Detalhe de Inspeção | Executar o checklist em campo, registrar evidências, gerar NCs e encerrar com assinatura digital. |
| Biblioteca de Checklists | Catalogar modelos de checklist por norma regulamentadora. |
| Editor de Checklist | Visualizar a estrutura, itens, criticidades e referências normativas de um checklist. |
| Lista de Não Conformidades | Gerenciar NCs em visões *Kanban* e *Lista* por estágio do ciclo de tratativa. |
| Detalhe de Não Conformidade | Tratar uma NC com Plano de Ação 5W2H, evidências, alteração de *status* e *timeline*. |
| Relatórios | Selecionar uma inspeção concluída e gerar relatório consolidado para impressão/exportação. |
| Empresas | Manter o cadastro de empresas e unidades fiscalizadas, com setor, endereço e riscos. |
| Normas (NRs) | Disponibilizar biblioteca de Normas Regulamentadoras aplicáveis. |
| Equipe | Apresentar os profissionais cadastrados e suas métricas de carga de trabalho. |
| Configurações | Gerenciar aparência, perfil ativo, modo *offline*, sincronização e restauração de dados. |
