## Plataforma SST — Frontend (React 19 + TS + Tailwind)

Stack: React 19 + TypeScript + Tailwind v4 + shadcn/ui + TanStack Router (file-based, equivalente ao App Router). Sem backend, sem auth real, **100% dados mockados** em `src/mocks/`.

### Estrutura de pastas

```text
src/
  routes/
    __root.tsx                 layout global (sidebar + header)
    index.tsx                  redirect -> /login
    login.tsx                  login fake (qualquer credencial entra)
    _app.tsx                   layout autenticado (sidebar shadcn)
    _app.dashboard.tsx         dashboard com KPIs e gráficos
    _app.inspecoes.index.tsx   lista de inspeções (filtros, status)
    _app.inspecoes.nova.tsx    wizard de nova inspeção
    _app.inspecoes.$id.tsx     detalhe + execução do checklist
    _app.checklists.index.tsx  biblioteca de checklists/modelos
    _app.checklists.$id.tsx    editor de checklist
    _app.nao-conformidades.tsx lista de NCs com kanban (aberta/em tratativa/resolvida)
    _app.nao-conformidades.$id.tsx detalhe da NC + plano de ação 5W2H
    _app.relatorios.tsx        geração/preview de relatórios PDF (mock)
    _app.empresas.tsx          empresas/unidades fiscalizadas
    _app.normas.tsx            biblioteca de NRs (mock)
    _app.equipe.tsx            usuários/inspetores
    _app.configuracoes.tsx     preferências + status offline
  components/
    layout/{AppSidebar,Header,OfflineBanner}.tsx
    inspecoes/{InspecaoCard,StatusBadge,ChecklistRunner,EvidenciaUploader,AssinaturaCanvas}.tsx
    ncs/{NCKanban,NCCard,PlanoAcaoForm}.tsx
    dashboard/{KpiCard,GraficoNCs,GraficoConformidade}.tsx
    common/{PageHeader,EmptyState,FiltrosBar}.tsx
  mocks/
    empresas.ts, inspecoes.ts, checklists.ts, ncs.ts, normas.ts, usuarios.ts, kpis.ts
  types/sst.ts                 tipos do domínio
  lib/{mockStore.ts,format.ts,offline.ts}
```

`mockStore.ts` mantém estado em memória + `localStorage` para simular persistência e modo offline (toggle no header dispara `OfflineBanner` e bloqueia "sincronização").

### Telas (todas com dados mockados realistas)

1. **Login** — formulário fake, seleção de perfil (Inspetor / Gestor / Auditor) que muda permissões visuais.
2. **Dashboard** — KPIs (inspeções no mês, NCs abertas, % conformidade, prazo médio), gráficos (recharts) por norma/unidade/severidade, lista de pendências.
3. **Inspeções**
   - Lista: filtros (status, empresa, inspetor, período), busca, badges de status (Planejada / Em andamento / Concluída / Sincronização pendente).
   - Nova: wizard 3 passos (empresa+unidade → checklist/norma → agendamento+responsáveis).
   - Detalhe/execução: header com dados, **ChecklistRunner** (itens com Conforme/Não conforme/N/A, observação, upload de evidência mock, geolocalização fake), criação de NC inline, assinatura em canvas, finalização gera relatório.
4. **Checklists** — biblioteca por NR; editor com seções, itens, peso, criticidade.
5. **Não conformidades** — visualizações Lista + Kanban; detalhe com plano de ação 5W2H, prazo, responsável, anexos, histórico/timeline, status.
6. **Relatórios** — seleção de inspeção + template, preview HTML estilo PDF, botão "Exportar PDF" (mock: window.print / download fake).
7. **Empresas/Unidades** — CRUD mock com CNPJ, endereço, setor, riscos.
8. **Normas (NRs)** — catálogo NR-1, NR-5, NR-6, NR-10, NR-12, NR-17, NR-35 etc. com descrição resumida.
9. **Equipe** — inspetores/auditores com perfil e estatísticas.
10. **Configurações** — tema, modo offline (toggle), limpar dados mockados, idioma.

### Características transversais

- **Offline-first simulado**: banner persistente quando offline; ações ficam em fila (`mockStore.pendingSync`) e "sincronizam" ao voltar online.
- **Mobilidade**: layout responsivo mobile-first (sidebar vira sheet em < md).
- **Rastreabilidade**: cada NC/inspeção tem timeline de eventos no detalhe.
- **Acessibilidade**: tokens semânticos do design system, labels em ícones, contraste AA.
- **Design**: paleta sóbria profissional (azul petróleo + âmbar de alerta + verde de conformidade), Inter, cards densos, badges de severidade.

### Bibliotecas a adicionar

`recharts` (já comum no template), `date-fns`, `react-signature-canvas` (assinatura), `zod` + `react-hook-form` (validação de formulários).

### Observação sobre o framework

Mantém-se TanStack Router (file-based) — equivalente ao App Router pedido no documento. Toda a lógica é **React puro**; trocar para Next/CRA depois é só portar `src/routes/` para `app/` (mesmos componentes e mocks). Documentarei isso no README.
