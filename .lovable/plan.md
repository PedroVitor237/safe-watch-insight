# Plano: Geração do documento `MAPA_DE_NAVEGACAO.md`

## Objetivo
Criar, na raiz do projeto, o arquivo `MAPA_DE_NAVEGACAO.md` contendo o mapa de navegação completo da plataforma SST, em linguagem acadêmica adequada para entrega de TCC, baseado nas rotas existentes em `src/routes/` e nos vínculos de navegação reais entre elas (já levantados ao produzir `ESPECIFICACAO_DE_TELAS.md`).

## Estrutura do documento

1. **Introdução** — propósito do documento e escopo (frontend protótipo, dados mockados).
2. **Visão geral do fluxo do usuário** — narrativa textual percorrendo a jornada típica desde a autenticação até a emissão de relatórios, destacando o papel do *AppShell* (menu lateral persistente) como hub de navegação.
3. **Diagrama Mermaid global** — `flowchart` (TD) representando todas as rotas e arestas de navegação, agrupadas por subgrafos:
   - *Acesso* (Login, raiz `/`)
   - *Operação* (Dashboard, Inspeções, Checklists, NCs, Relatórios)
   - *Cadastros* (Empresas, Normas, Equipe, Configurações)
   - Nós para rotas dinâmicas (`/inspecoes/$id`, `/checklists/$id`, `/nao-conformidades/$id`) e ações relevantes (criação automática de NC, conclusão de inspeção → Relatórios).
4. **Fluxos principais** — uma subseção por fluxo, cada uma com:
   - Descrição textual em prosa acadêmica;
   - Sequência de telas (lista ordenada);
   - Pequeno diagrama Mermaid `flowchart LR` específico do fluxo.
   Fluxos cobertos:
   1. Autenticação (Login)
   2. Cadastro de Empresa
   3. Cadastro de Checklist
   4. Execução de Inspeção
   5. Registro de Não Conformidades
   6. Consulta de Histórico (timeline da inspeção e da NC; listagem filtrável)
   7. Geração de Relatórios
5. **Matriz de navegação** — tabela com colunas *Tela de origem*, *Telas de destino possíveis* e *Gatilho* (botão/link), consolidando as relações.
6. **Observações sobre persistência e navegação programática** — nota explicando o uso do `mockStore` (sem backend) e dos *toasts* como feedback substituto a modais.

## Entregável
Único arquivo novo: `MAPA_DE_NAVEGACAO.md` na raiz do projeto. Os diagramas Mermaid são incluídos *inline* em blocos ```mermaid```, prática suportada por GitHub e por leitores acadêmicos comuns. Nenhum código de aplicação será alterado.
