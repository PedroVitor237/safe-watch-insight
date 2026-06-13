# Plano: Geração do documento `ESPECIFICACAO_DE_TELAS.md`

## Objetivo
Criar, na raiz do projeto, o arquivo `ESPECIFICACAO_DE_TELAS.md` contendo a especificação acadêmica de todas as telas existentes na aplicação de apoio a inspeções de SST, em linguagem adequada para TCC e documentação de requisitos.

## Telas a serem documentadas
A partir da análise das rotas em `src/routes/`, serão descritas as seguintes telas:

1. **Login** (`/login`) — autenticação simulada com seleção de perfil (Inspetor, Gestor, Auditor).
2. **Dashboard** (`/dashboard`) — KPIs, gráficos de inspeções por mês, NCs por criticidade, NCs por norma, NCs críticas e próximas inspeções.
3. **Lista de Inspeções** (`/inspecoes`) — listagem com filtros por status e busca.
4. **Nova Inspeção** (`/inspecoes/nova`) — wizard de criação (empresa/unidade, checklist, agendamento).
5. **Detalhe / Execução de Inspeção** (`/inspecoes/$id`) — execução do checklist, registro de respostas, evidências, geolocalização, assinatura digital e finalização.
6. **Biblioteca de Checklists** (`/checklists`) — catálogo de modelos por NR.
7. **Editor de Checklist** (`/checklists/$id`) — visualização das seções e itens com criticidade.
8. **Lista de Não Conformidades** (`/nao-conformidades`) — visualização em lista e Kanban.
9. **Detalhe de Não Conformidade** (`/nao-conformidades/$id`) — Plano de Ação 5W2H, prazo, responsável, evidências, timeline.
10. **Relatórios** (`/relatorios`) — seleção de inspeção, preview e exportação simulada.
11. **Empresas** (`/empresas`) — cadastro de empresas/unidades fiscalizadas.
12. **Normas Regulamentadoras** (`/normas`) — biblioteca de NRs.
13. **Equipe** (`/equipe`) — inspetores, gestores e auditores.
14. **Configurações** (`/configuracoes`) — preferências, tema escuro, modo offline.

## Estrutura de cada tela no documento
Para cada uma das 14 telas:

- **Nome da Tela**
- **Rota**
- **Objetivo** — parágrafo em linguagem acadêmica explicando a finalidade.
- **Componentes**, organizados nas subseções:
  - Campos (inputs, selects, textareas, uploads, canvas de assinatura, etc.)
  - Botões (com ação associada)
  - Tabelas (colunas e finalidade)
  - Cards (conteúdo e função informacional)
  - Menus (sidebar, dropdowns, abas)
  - Modais (diálogos de confirmação, criação de NC, etc.)
- **Navegação** — descrição de quais telas precedem e sucedem o fluxo do usuário.

## Tabela-resumo final
Tabela em Markdown com duas colunas: **Tela** e **Objetivo** (resumo de uma linha por tela).

## Investigação prévia (modo build)
Antes de redigir o documento, ler os arquivos de rota ainda não totalmente visíveis para garantir fidelidade dos componentes descritos:
- `src/routes/_app.inspecoes.index.tsx`
- `src/routes/_app.inspecoes.nova.tsx`
- `src/routes/_app.inspecoes.$id.tsx`
- `src/routes/_app.nao-conformidades.index.tsx`
- `src/routes/_app.nao-conformidades.$id.tsx`
- `src/routes/_app.relatorios.tsx`
- `src/routes/_app.configuracoes.tsx`
- `src/routes/login.tsx`
- `src/components/layout/AppShell.tsx` (para descrever o menu lateral global)

## Entregável
Um único arquivo novo: `ESPECIFICACAO_DE_TELAS.md` na raiz do projeto. Nenhum código de aplicação será alterado.
