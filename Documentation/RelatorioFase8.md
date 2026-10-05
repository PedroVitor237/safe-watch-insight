# Relatório da Fase 8 — Telas, Navegação e Guia do Usuário

Revisão documental em **4 de outubro de 2026**. A implementação vigente é fonte
de verdade; leitura estática não constitui homologação runtime ou aprovação de
Final QA.

## 1. Objetivo

Reconciliar especificação de telas, navegação e tarefas do usuário com as
funcionalidades consolidadas nas Fases 2–7. Sincronizar requisitos, guia acadêmico
e trechos de uso do README, preservando lacunas e artefatos históricos.

## 2. HEAD inicial e baseline

- Branch: `docs/documentation-update`, sem criar ou trocar branch.
- **HEAD inicial exato:** `5d323ae8d1e26d87198592564876616b04936f14`.
- Commit anterior: `docs: consolidate domain classes use cases and business flows`.
- Árvore inicial limpa, verificada antes das leituras/edições do repositório.

## 3. HEAD final

**HEAD final:** o único commit da Fase 8 que adiciona este relatório, filho direto
do HEAD inicial. O hash literal é fornecido na entrega; dentro do próprio commit,
usa-se identificação simbólica para evitar hash autorreferente. Verificação:

```bash
git log -1 --format='%H %s' -- Documentation/RelatorioFase8.md
```

Mensagem: `docs: consolidate screens navigation and user guide`.
Exatamente um commit, sem push; Fase 9 não iniciada. A conferência final de HEAD,
parent e árvore limpa ocorre após esse commit.

## 4. Documentos inspecionados

- Obrigatórios: AGENTS.md, PROJECT_CONTEXT.md, IMPLEMENTATION_PLAN.md, TASKS.md
  e TECH_DECISIONS.md (todos na raiz).
- Primários: [Telas](./ESPECIFICACAO_DE_TELAS.md),
  [Navegação](./MAPA_DE_NAVEGACAO.md), [Guia do usuário](./GUIA_USUARIO.md),
  [Requisitos](./DocumentoDeRequisitos.md),
  [Guia do Professor](../GUIA_DO_PROFESSOR.md) e [README](../README.md).
- Referências pertinentes das fases anteriores:
  [API](../AI/API.md), [Arquitetura](../AI/Architecture.md),
  [Regras](../AI/BusinessRules.md), [Cópia](../AI/ChecklistCopy.md),
  [Templates](../AI/OfficialTemplates.md), [Offline](../AI/Offline.md),
  [Entidades](../AI/Entities.md) e [Casos de uso](./DiagramaDeCasosDeUso.md).
- [Wireframes](./WIREFRAMES.md), [Relatório da Fase 6](./RelatorioFase6.md),
  [Relatório da Fase 7](./RelatorioFase7.md),
  [Navegação PlantUML](./diagrams/flows/navigation.puml) e
  [Fluxo offline](./diagrams/flows/offline-inspection.puml).

Fontes de implementação lidas: todos os arquivos de rota e
[README de rotas](../src/routes/README.md); AppShell, EvidencePanel,
CorrectiveActionsPanel, NonConformityEditForm, InspectionReport e
OfflineStatusIndicator; hooks de inspeções/respostas/checklists/relatórios/
dashboard; schema compartilhado de cadastro, schema/Service de empresas;
sessão/banco/fachada offline. `package.json` e `.nvmrc` conferidos somente por
leitura para requisito Node. Sem consultar banco ou serviços externos.

## 5. Documentos modificados

1. Documentation/ESPECIFICACAO_DE_TELAS.md
2. Documentation/MAPA_DE_NAVEGACAO.md
3. Documentation/GUIA_USUARIO.md
4. Documentation/DocumentoDeRequisitos.md
5. GUIA_DO_PROFESSOR.md
6. README.md
7. Documentation/diagrams/flows/navigation.puml

README recebeu alterações pontuais de uso; requisitos mantêm a proposta e as
classificações prévias. Wireframes históricos e documentos técnicos de referência
foram preservados.

## 6. Documentos criados

1. Documentation/RelatorioFase8.md

Validadores/auxiliares ficaram em `/tmp`, fora do commit. Não houve imagens
inventadas, novos screenshots ou arquivos duplicados de guia/diagrama.

## 7. Inventário de rotas e telas revisado

| URL                      | Arquivo em src/routes            | Uso conferido                               |
| ------------------------ | -------------------------------- | ------------------------------------------- |
| `/`                      | index.tsx                        | Redirecionamento para login                 |
| `/register`              | register.tsx                     | Cadastro público                            |
| `/login`                 | login.tsx                        | Autenticação, demo e redirecionamento       |
| `/dashboard`             | _app.dashboard.tsx               | Indicadores próprios e atalhos              |
| `/empresas`              | _app.empresas.tsx                | Lista e diálogos pessoais                   |
| `/checklists`            | _app.checklists.index.tsx        | Três catálogos, metadados e uso de template |
| `/checklists/$id`        | _app.checklists.$id.tsx          | Consulta/itens/normas/publicação/cópia      |
| `/inspecoes`             | _app.inspecoes.index.tsx         | Lista, busca e filtro                       |
| `/inspecoes/nova`        | _app.inspecoes.nova.tsx          | Assistente online de três passos            |
| `/inspecoes/$id`         | _app.inspecoes.$id.tsx           | Execução, evidências, conclusão e relatório |
| `/nao-conformidades`     | _app.nao-conformidades.index.tsx | Kanban/lista e filtros                      |
| `/nao-conformidades/$id` | _app.nao-conformidades.$id.tsx   | Tratativa/ações/evidências/link de origem   |
| `/relatorios`            | _app.relatorios.tsx              | HTML, seleção por inspectionId e impressão  |
| `/normas`                | _app.normas.tsx                  | Catálogo autenticado de NRs                 |
| `/equipe`                | _app.equipe.tsx                  | Prévia demonstrativa                        |
| `/configuracoes`         | _app.configuracoes.tsx           | Preferências, diagnóstico offline e retry   |

16 destinos, incluindo raiz de redirecionamento; 15 telas e dois layouts
(`__root.tsx`, `_app.tsx`). `_app` não é URL pública. Não há rotas autônomas de
cópia, edição de empresa, ações, evidências, impressão ou sincronização.

## 8. Principais correções documentais

- Cadastro adicionado à especificação e ao roteiro de tarefas.
- Biblioteca com catálogos/ownership, paginação e restrição a ativos; desativado
  não possui filtro de redescoberta na UI atual.
- Empresa com campos obrigatórios/opcionais e CNPJ único inclusive em soft delete.
- Criação de inspeção: data/hora opcional, sem campo solicitante/outro inspetor.
- Guia reordenado em 18 tarefas/seções, com menos detalhes internos de segurança,
  persistência e provedor.
- Estado real de dashboard/relatórios preservado; texto antigo de Configurações
  sobre restauração demo explicitamente delimitado, sem alterar a aplicação.
- Lacunas RF12/RN07, RF14, RF20/RNF03, RBAC/administração e históricos preservadas.

## 9. Cadastro, login e sessão

Quatro campos, validação, senha mínima, confirmação e duplicidade; TECHNICIAN
fixado pelo servidor, sem seletor. Sucesso encaminha ao login sem sessão
automática. Login expõe conta técnica de demonstração e navega ao dashboard;
sessão válida evita o formulário e expiração pode exigir autenticar novamente.
Não se anuncia confirmação de e-mail, recuperação de senha ou administração.

## 10. Checklists, templates e cópia

Distinguidos pessoal, publicação, template oficial institucional e cópia
independente. Itens/normas editáveis só no contexto pessoal; publicação é
preservada e próxima edição deriva rascunho. Retirada/histórico completo sem
controle de UI. Quantidade de oficiais não foi fixada nos guias genéricos.

Copiar abre novo identificador pessoal ativo com rascunho v1 e itens próprios,
preservando metadados normativos e linhagem disponível por item. Não copia
inspeções/histórico/tratativas nem oficialidade/template. Próprio prefere draft;
terceiro/oficial usa última publicação acessível elegível, sem draft alheio.
Fontes/limites remetem a AI/OfficialTemplates.md; altura não atribuída a Murbach.

## 11. Inspeções, respostas, tratativas e evidências

Ciclo usual PLANNED → IN_PROGRESS → COMPLETED; cancelar/editar dados gerais/
reabrir/excluir não foram apresentados como ações atuais de inspeção. Conteúdo
histórico capturado preservado; obrigatórios respondidos, N/A válido e opcionais
pendentes. Conclusão bloqueia respostas/observações, sem congelar tratativas.

NC automática cria/restaura; conforme/N/A arquiva. Ações têm descrição
obrigatória e demais campos 5W2H opcionais; conclusão por edição de status,
data automática e NC resolvida explicitamente. Acesso segue inspeção própria.
Evidência JPEG/PNG/WebP até 4 MB, legenda opcional, prévia/lista/abertura/remoção,
associada a inspeção ou NC, somente online. Sem prometer binários/compressão/
quota offline ou operação direta pelo usuário no provedor.

## 12. Relatórios e dashboard

HTML real sob demanda com identificação, checklist histórico, respostas/normas,
resumo, empresa/inspetor atuais, NCs/ações/evidências ativas. Imprimir abre diálogo
do navegador e permite Salvar como PDF, sem arquivo backend, download direto
ou inserção de Report por visualização. Seletor de concluídas e acesso direto
por ID diferenciados, com concern preservado.

Dashboard próprio: cinco cards, distribuição por status, atenção e até cinco
recentes. Conformidade arredondada de COMPLIANT/(COMPLIANT+NON_COMPLIANT) em
concluídas; N/A/pendentes excluídos e sem aplicáveis exibe “—”. Atenção soma
recursos, sem deduplicar inspeções. Sem filtros inventados ou BI.

## 13. Experiência offline e identidade

Preparar inspeções online, continuar respostas/observações/conclusão local e
acompanhar envio. Disponibilidade da página e validade da sessão local delimitadas.
Reconexão/retry exige conexão e autenticação; erro retentável, conflito bloqueia
sem solução automática/assistida e pode impedir o restante da fila.

Limpeza no logout/troca de identidade confirmada em AppShell/session/database:
guia orienta sincronizar antes, pois dados locais e pendências podem ser removidos.
Renovar login da mesma conta difere de sair/trocar identidade. Dashboard/relatório
não refletem pendências locais nem possuem pacote offline próprio.

## 14. Navegação

Inventário de URLs conferido com createFileRoute e estrutura gerada existente.
Diálogos/ações continuam nas mesmas telas; cópia retorna à rota de detalhe com
novo ID. Árvore pública/autenticada inclui todos os módulos reais, inclusive
Normas, NCs, Equipe e Configurações.

Mermaid e PlantUML sincronizados: **19 nós e 37 transições**, incluindo atalhos
de dashboard, relatório por inspectionId, seleção na mesma rota e avatar.
Nenhum segundo modelo contraditório criado; fluxos da Fase 6/7 reutilizados.

## 15. Guia do Professor

Roteiro atual termina em confirmação de sync → relatório/impressão → dashboard,
com tratativa e demonstrações complementares de cadastro, template/cópia,
evidência e continuidade offline. Contexto histórico da Atividade 2 mantido.
Requisito Node corrigido para `^22.12.0`/`.nvmrc` 22.23.2, sem aceitar qualquer
versão superior. Comandos de instalação/migrations/seed são orientação de
preparação pré-existente, **não executados nesta fase**.

## 16. Validações realizadas

- Baseline: branch, HEAD exato e árvore limpa.
- Prettier local nos sete Markdown modificados/criado; write e check.
- `git diff --check` e `git diff --cached --check`.
- Validador estático temporário: referências relativas/âncoras, fences,
  inventário das rotas, allowlist documental, estrutura PlantUML e equivalência
  de nós/arestas/rótulos com Mermaid de navegação.
- Revisão completa do diff e do staged diff; conferência de tarefas com os
  casos de uso da Fase 7 e comportamento dos componentes/hooks atuais.
- Após commit: branch, HEAD/parent, um commit sobre baseline e árvore limpa.

Resultado dos checks estáticos: **101 referências relativas válidas** (sem
âncoras explícitas nos documentos alterados), **38 blocos completos**, 16 destinos
conferidos e navegação equivalente com 19 nós/37 transições. Allowlist com oito
arquivos documentais, sete Markdown formatados e um PlantUML.

Comandos de formatação e validação, restritos aos documentos desta fase:

```bash
node_modules/.bin/prettier --write <Markdown da Fase 8>
node_modules/.bin/prettier --check <Markdown da Fase 8>
python3 /tmp/swi-phase8-doc-validation.py
git diff --check
git status --short
git diff
git diff --cached --check
git diff --cached
git log -1 --format='%H %P %s'
git status --porcelain=v1
git rev-list --count 5d323ae8d1e26d87198592564876616b04936f14..HEAD
```

## 17. Limitações da validação

Mermaid CLI e PlantUML não disponíveis; nenhuma instalação feita. Renderização
oficial não executada, apenas conferência estática/estrutural. `rg` indisponível;
usados find/grep/sed/cat e Python local. Sem screenshots novos, testes runtime,
execução browser, build, migrations, seeds ou escritas no banco. Homologações
anteriores citadas são históricas e não resultados desta fase.

## 18. Implementation Concerns referenciados

Nenhuma correção de implementação nesta fase. Mantidas referências a
[RelatorioFase6.md](./RelatorioFase6.md),
[RelatorioFase7.md](./RelatorioFase7.md),
[BusinessRules.md](../AI/BusinessRules.md) e
[Architecture.md](../AI/Architecture.md):

- IC-P6-01: relatório por ID próprio sem exigir COMPLETED, diferente do seletor.
- IC-P6-02: isolamento do cache React Query em mudança de identidade.
- IC-P6-03: concorrência de resposta/sincronização entre abas/dispositivos.
- IC-P6-04: projeção local durante confirmação de operações dependentes.
- Concerns anteriores de prazo vazio/NULL, HTML autenticado no cache de navegação
  e demais questões de integridade/compensações externas permanecem para Final QA.

O prazo vazio pode reaparecer como data antiga; o guia orienta conferir sem
transformar campo opcional em obrigatório. O texto residual de restauração demo
em Configurações é delimitado nos guias, sem alteração de código. Ausências
previstas (BI, solicitante, PDF customizado, offline amplo) mantêm classificação
de escopo, sem serem apresentadas como novas correções ou testes aprovados.

## 19. Declaração de escopo preservado

**Nenhum código de aplicação, schema Prisma, migration, seed, teste, dependência,
configuração ou comportamento runtime foi modificado.** Somente os sete arquivos
documentais listados e este relatório compõem a Fase 8. Exatamente um commit
local; push não realizado e Fase 9 não iniciada.
