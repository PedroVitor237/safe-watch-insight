# DOCUMENTATION PHASE 10 — FINAL QA

Conferência final em **4 de outubro de 2026**, após as Fases documentais 2–9.
Fonte de verdade: arquivos e implementação presentes no checkpoint inicial,
comparados por leitura local e validação estática. Resultados funcionais de
agosto/setembro e do incremento de cópia permanecem evidências históricas.

## 1. Verdict

**FINAL QA — APPROVED WITH KNOWN LIMITATIONS**

A documentação operacional está consistente, rastreável e estruturalmente
completa para o escopo entregue do TCC. Não foi encontrada divergência que exija
alteração dos documentos operacionais ou do código. A contagem de índices no
relatório histórico da Fase 9 é corrigida neste relatório, sem reescrever aquele
registro. Existe uma pendência de formatação em um estudo histórico preservado.

O parecer aprova a consolidação documental, com os limites explicitados nas
seções 4–8. **Não é homologação funcional nem aprovação de concorrência em
produção.** Os 14 concerns da Fase 9 continuam válidos; o de concorrência
permanece **High** e requer trabalho de implementação e reprodução direcionada.
Passar checks documentais não resolve esses concerns.

## 2. Git checkpoint

| Campo           | Resultado                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Branch          | `docs/documentation-update`, mantida sem criar outra branch                                      |
| Initial HEAD    | `bdc5a8a3a9d0da76711a090cc64060dc3aa6d960`                                                       |
| Commit anterior | `docs: consolidate final documentation audit`                                                    |
| Final HEAD      | O commit único que adiciona `Documentation/RelatorioFase10.md`, identificado pelo comando abaixo |
| Commit message  | `docs: complete final documentation QA`                                                          |
| Working tree    | CLEAN no checkpoint inicial e no fechamento após o commit único                                  |
| Push status     | NOT PERFORMED; nenhum push nesta fase                                                            |
| Commits novos   | Exatamente 1, filho direto do Initial HEAD                                                       |

O hash literal do commit não pode integrar o próprio arquivo sem alterar esse
hash. Final HEAD possui identificação verificável, sem campo a preencher, amend
ou segundo commit:

```bash
git log -1 --format='%H %s' -- Documentation/RelatorioFase10.md
git rev-parse HEAD^
git rev-list --count bdc5a8a3a9d0da76711a090cc64060dc3aa6d960..HEAD
git status --porcelain=v1
```

No fechamento, o primeiro comando identifica o Final HEAD, o parent deve ser o
Initial HEAD, a contagem deve ser **1** e o status não deve produzir saída. O
hash literal e os resultados pós-commit são informados na entrega da Fase 10.

## 3. Files changed e controle de escopo

- Criado: `Documentation/RelatorioFase10.md`.
- Modificados: **nenhum arquivo preexistente**.
- Removidos: **nenhum**.

**Código da aplicação intocado.** Schema Prisma, migrations, seeds, testes,
arquivos gerados, dependências/lockfiles, configuração de deploy e ambiente
permanecem iguais ao Initial HEAD. Nenhum arquivo de segredo foi alterado.
Não houve operação de banco, acesso ao Neon/produção, upload ou chamada ao
Cloudinary. Os relatórios das Fases 3–9 foram preservados integralmente; a Fase 2
permanece registrada no commit `0a19b44` e em seus documentos de modelagem.

Scripts auxiliares de conferência foram escritos somente em `/tmp`, sem
adicioná-los ao repositório ou à suíte de testes. Não foram instaladas ferramentas
ou dependências. Nenhuma funcionalidade, rota ou layout foi alterado.

## 4. Validation results

### Checks executados

| Verificação                  | Resultado e alcance                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkpoint Git               | Branch/HEAD exatos; índice e working tree inicialmente limpos                                                                                                 |
| Prettier amplo inicial       | 46 Markdown de AI/Documentation/raiz e READMEs locais: exit 1, somente `CHECKLIST_VERSIONING_ARCHITECTURE.md` com aviso preexistente                          |
| Prettier de fechamento       | Relatório novo e conjunto documental selecionado, excluindo somente o estudo histórico com dívida conhecida: PASS; sem reformatação de arquivos preexistentes |
| `git diff --check`           | PASS; whitespace verificado antes do staging                                                                                                                  |
| Referências internas         | PASS; contagem final e alcance abaixo, zero destinos/âncoras quebrados                                                                                        |
| Modelos/dicionário/DDL local | PASS: 19 models, 172 campos escalares, 12 enums, 36 FKs, 19 PKs, 74 índices explícitos e 13 CHECKs                                                            |
| Inventário da API            | PASS: 48 Server Functions em 14 arquivos, 45 POST/3 GET, presentes nas duas especificações                                                                    |
| Rotas/telas                  | PASS: 16 destinos, incluindo `/`, e 15 telas; tabela de navegação/especificação/tree gerada concordam                                                         |
| Diagramas                    | PASS estático/estrutural; 14 blocos Mermaid e 15 arquivos PlantUML, conforme seção 7                                                                          |
| Diff completo e staged diff  | Revisados; somente a criação deste Markdown; `git diff --cached --check` passou                                                                               |
| Fechamento Git               | Mensagem exata, parent inicial, 1 commit novo, working tree CLEAN; nenhum push                                                                                |

Os validadores locais conferem tipos, campos, nulabilidade, defaults, PK/FK/UK,
enums, cardinalidades, índices e estrutura dos diagramas. SQL foi **lido, não
executado**. Ações referenciais conhecidas são delimitadas na seção 5; não houve
consulta de drift remoto. Esses validadores usam expressões estruturais e não
são parsers oficiais dos frameworks ou diagramas.

Comandos de conferência usados nesta fase:

```bash
git status --short --branch
git rev-parse HEAD
git log -12 --oneline
python3 /tmp/swi-phase10-static.py
python3 /tmp/swi-phase10-links.py
python3 /tmp/swi-phase10-scope.py pre
git diff --check
node_modules/.bin/prettier --write Documentation/RelatorioFase10.md
node_modules/.bin/prettier --check Documentation/RelatorioFase10.md
git diff --no-index -- /dev/null Documentation/RelatorioFase10.md
git add -- Documentation/RelatorioFase10.md
git diff --cached --check
git diff --cached
python3 /tmp/swi-phase10-scope.py staged
git commit -m "docs: complete final documentation QA"
git status
git log -1 --oneline
python3 /tmp/swi-phase10-scope.py post
```

Prettier amplo e de fechamento também foram chamados via Python com lista
explícita de arquivos, evitando varredura de dependências/artefatos gerados.
Versão utilizada: Prettier **3.9.1**. `rg` indisponível; leituras/buscas usaram
Git, Python, grep, find, sed e cat. A adaptação inicial do validador temporário
teve colisão de nome interno; foi corrigida em `/tmp` e a execução final passou.

**Não executados:** testes da aplicação, E2E/browser, build, lint, TypeScript,
Prisma CLI/generate/validate, migrations, seeds, bootstrap, SQL, integração externa
ou homologação de deploy. Nenhum resultado histórico é atribuído a esta fase.

### Referências e higiene

A varredura final inclui todos os Markdown rastreados no repositório e este
relatório novo: AI/PROMPTS, Documentation, raiz, READMEs de backend/rotas e
`.lovable/plan.md`. Confere links Markdown relativos, imagens, referências
de links e destinos HTML, diretórios/arquivos, âncoras de títulos/HTML e fences.
URLs externas não foram requisitadas; a auditoria não atualiza fontes normativas.

Antes deste relatório: **47 documentos, 571 referências relativas, 32 âncoras
e 179 fences completas; zero referências internas não resolvidas**. A contagem
de fechamento, incluindo este relatório, é registrada após a varredura final
na seção 9. Referências a diagramas e caminhos renomeados estão válidas; a âncora
restaurada na Fase 9 continua existente.

Branches/checkpoints e workflows antigos em relatórios, estudo de versionamento,
AI_PROJECT_CONTEXT e wireframes permanecem identificados como históricos.
Não foram interpretados como instruções de implantação ou funcionalidades atuais.
O aviso Prettier do estudo histórico foi mantido para evitar reformatação
incidental; o check amplo não é apresentado como aprovação irrestrita.

## 5. Documentation integrity e classificação

Foram comparados os oito documentos centrais de [AI](../AI/), requisitos,
dicionário, modelos conceitual/lógico/físico, classes, casos de uso, API,
[telas](./ESPECIFICACAO_DE_TELAS.md), [navegação](./MAPA_DE_NAVEGACAO.md),
[guia do usuário](./GUIA_USUARIO.md), [professor](../GUIA_DO_PROFESSOR.md),
[README](../README.md), [contexto](../PROJECT_CONTEXT.md),
[plano](../IMPLEMENTATION_PLAN.md), [tarefas](../TASKS.md),
[decisões](../TECH_DECISIONS.md) e referências locais de backend/rotas.
[Fase 9](./RelatorioFase9.md) e concerns das Fases 3–8 foram confrontados com
as fontes atuais, sem usar parecer histórico como prova de resolução atual.

| Tema                             | Resultado final e classificação                                                                                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Banco/dicionário/modelos/classes | Concordam em entidades/campos/tipos e 36 relações de FK. Conceitual abstrai três associações N:N e tem 16 conceitos; lógico/físico preservam 19 tabelas. Constraints físicas e invariantes de fluxo estão separadas                                          |
| Contagem de índices na Fase 9    | **Discrepância documental de auditoria:** o relatório/validador anterior contou 49; DDL atual e inventários canônicos têm **74**, sendo 14 únicos e 60 não únicos, além dos 19 índices de PK                                                                 |
| FK de Checklist.createdById      | **Implementation concern:** nullable sem onDelete explícito no schema implica SetNull; migrations conservam RESTRICT. Divergência explicitada no dicionário, sem declaração de ausência de drift                                                             |
| Arquitetura/API                  | Mesmo projeto TanStack Start, sem backend REST separado. Login direto, cadastro por mutation, guard beforeLoad e sessão no servidor; execução local-first volta às mesmas Functions na sincronização                                                         |
| Autenticação/ownership           | Cookie de oito horas, bcrypt custo 12, registro TECHNICIAN sem auto-login. UserRole não implementa RBAC. Empresa/checklist pessoal usam createdById; inspeções userId; NC/ação/evidência seguem a inspeção                                                   |
| Publicação/cópia/snapshot        | PUBLISHED/RETIRED imutáveis pelo fluxo; edição deriva draft. Cópia independente cria identidade/DRAFT v1 e itens próprios; Standard reutilizado. Snapshot nasce com inspeção e congela checklist/itens/normas, sem congelar toda a operação                  |
| Compatibilidade legada           | **Histórico/legado:** backfill UNVERIFIED_LEGACY/formato 0. Inspeção aceita hash presente de formato não recalculado; rótulo VERIFIED desse caminho não prova verificação canônica. Cópia exige formato 1 íntegro                                            |
| Inspeções/respostas/NC/ações     | Primeira resposta inicia IN_PROGRESS. N/A atende obrigatoriedade; opcionais podem ficar pendentes. Concluir bloqueia novas respostas, mas tratativas continuam. Criar ação em NC OPEN muda-a para IN_PROGRESS; concluir ações não resolve NC automaticamente |
| Evidências                       | Online, contexto XOR inspeção ou NC própria, JPEG/PNG/WebP até 4.194.304 bytes. Banco guarda metadados, Cloudinary binário; compensações externas e autorização da URL têm limites documentados                                                              |
| Relatórios/dashboard             | Report persistível é distinto do DTO/HTML sob demanda; imprimir não insere Report/PDF. Lista COMPLETED e detalhe por ID sem exigir conclusão são distinguidos. Dashboard tem conformidade aplicável de concluídas, até cinco recentes e atraso sem escrita   |
| Offline/cache                    | **Limitação intencional:** respostas/conclusão de pacotes existentes, sem criação integral/binários/reconciliação assistida. IndexedDB, React Query e Cache Storage têm escopos distintos; concern de concorrência não é resolvido por idempotência          |
| Guias/backlog/escopo             | Solicitante RF12/RN07 ausente, RF14 e offline amplo parciais, equipe demonstrativa, edição geral/cancelamento/reabertura de inspeção sem operação pública. Enum/entidade não implica tela/operação/RBAC                                                      |

**Errata da contagem histórica:** 25 índices foram omitidos pelo regex que
exigia `INDEX ... ON ...` na mesma linha: 22 na migration de versionamento e
três na de idempotência. Não houve criação de índices nesta fase; os 74 já
existiam no DDL do Initial HEAD. O validador desta fase aceita whitespace entre
linhas e reconfere nomes, tabelas, ordem das colunas, unicidade e presença de
predicado nos dois inventários Markdown, além dos nomes no PlantUML físico.
O relatório da Fase 9 foi preservado; a contagem **49 não é o inventário final**.

Não foram necessárias correções nos documentos operacionais. Pendências de
implementação abaixo não foram transformadas em defeitos documentais para
simular resolução. Propostas históricas/funcionalidades futuras continuam
delimitadas, sem redesign documental.

## 6. Traceability result

Cadeia reconferida: **requisito → regra/fluxo → tela/caso de uso → API/Server
Function → Service/Repository → persistência**. Referências de domínio:
[Requisitos](./DocumentoDeRequisitos.md), [BusinessRules](../AI/BusinessRules.md),
[casos de uso](./DiagramaDeCasosDeUso.md), [API](../AI/API.md),
[Entities](../AI/Entities.md) e [dicionário](./DicionarioDeDados.md).

| Requisito / fluxo                                     | Tela e cliente                                                           | Server Functions → Service → Repository                                                                                                                            | Persistência e regra conferida                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| RF01: cadastrar/entrar/sair                           | `/register` RHF/Zod/mutation; `/login` direto; menu logout               | register/login → UserService → UserRepository; getCurrentSession/logout → helpers de sessão                                                                        | User/bcrypt; cookie safe_watch_session; conta reconsultada; sem auto-login/RBAC                                             |
| RF02/RN01: criar/editar/excluir empresa               | `/empresas`, diálogos, useCompanies                                      | createCompany/updateCompany/deleteCompany; listCompanies/getCompanyById → CompanyService → CompanyRepository                                                       | Company criada pela sessão, consultas/mutações pelo dono; exclusão lógica                                                   |
| RF03–05: criar/manter checklist                       | `/checklists`, useChecklists                                             | createChecklist/updateChecklist/deleteChecklist/getChecklistById/listChecklists → ChecklistService → ChecklistRepository                                           | Checklist pessoal + ChecklistVersion DRAFT v1; alterações de conteúdo no draft                                              |
| RF04/RF08–10: adicionar/editar/remover itens e normas | `/checklists/$id`, useChecklistItems/useStandards                        | createChecklistItem/updateChecklistItem/deleteChecklistItem/listChecklistItems → ChecklistItemService → ChecklistVersionItemRepository; StandardService/Repository | ChecklistVersionItem/ChecklistVersionItemStandard; ordem/obrigatoriedade/normas da versão; legado não é editor atual        |
| RF04–06: publicar/retirar                             | Detalhe/useChecklistVersions; retirada somente API/hook                  | listChecklistVersions/publishChecklistVersion/retireChecklistVersion → ChecklistVersionService → ChecklistVersionRepository                                        | ChecklistVersion/hash/autoria/data/revisão; próximo draft preserva publicação; retirada sem botão atual                     |
| RF05: copiar/usar template                            | Biblioteca/detalhe → novo `$id`, useChecklists                           | copyChecklist/useOfficialTemplate → ChecklistService → ChecklistRepository.copyFromSource                                                                          | Checklist/DRAFT v1/itens/associações novos em RepeatableRead; nenhuma inspeção copiada                                      |
| RF06/RF11/RF18/RN01/RN04: criar/consultar inspeção    | `/inspecoes/nova`, lista/detalhe, useInspections/inspection-client       | createInspection/getInspectionById/listInspections/deleteInspection → InspectionService → InspectionRepository + Company/ChecklistVersion Repositories             | Inspection.userId + snapshot/itens/normas na transação; PLANNED/SYNCED; delete API sem botão                                |
| RF06–07/RN02/RN06: responder/concluir                 | `/inspecoes/$id`, useInspectionResponses → Dexie/fila                    | saveInspectionResponse/listInspectionResponses/finishInspection → InspectionResponseService → InspectionResponseRepository/InspectionRepository                    | InspectionResponse do snapshot; NC automática/arquivamento; obrigatórios/N/A; conclusão e bloqueio de novas respostas       |
| RF07/RF16–17/RN02: tratar NC                          | Lista/detalhe, useNonConformities                                        | createNonConformity/getNonConformityById/listNonConformities/updateNonConformity/deleteNonConformity → NonConformityService → NonConformityRepository              | NonConformity única por resposta, ownership da inspeção; leitura pode persistir OVERDUE                                     |
| RF15–17/RN03: ações                                   | Painel da NC, useCorrectiveActions                                       | createCorrectiveAction/listCorrectiveActions/updateCorrectiveAction/deleteCorrectiveAction → CorrectiveActionService → CorrectiveActionRepository                  | CorrectiveAction/NC; description obrigatório, demais 5W2H opcionais; completedAt do servidor                                |
| RF22: evidências                                      | Painéis de inspeção/NC, useEvidence/FormData                             | uploadEvidence/listEvidence/removeEvidence → EvidenceService → EvidenceRepository + Repositories de contexto + StorageService                                      | Evidence XOR/contexto próprio; metadados PostgreSQL/binário Cloudinary; upload somente online                               |
| RF13–14/RN08: relatório/imprimir                      | `/relatorios?inspectionId=UUID`, useReports/window.print                 | listAvailableInspectionReports/getInspectionReport → ReportService → ReportRepository                                                                              | Lê Inspection/snapshot/respostas/tratativas/evidências; não grava Report/PDF; snapshot normativo                            |
| RF19: dashboard                                       | `/dashboard`, useDashboard                                               | getDashboard → DashboardService → DashboardRepository                                                                                                              | Agregados reais por Inspection.userId; COMPLIANT/(COMPLIANT+NON_COMPLIANT) em COMPLETED; sem aplicáveis NULL                |
| RF20–21/RN05/RNF03–04/08: offline/PWA parcial         | Pacote existente, indicador/configurações, inspection-store/sync-manager | saveInspectionResponse/finishInspection reautenticadas → InspectionResponseService/Repositories                                                                    | Dexie sessions/packages/operations; OfflineSyncOperation remoto atômico com mutação; conflito bloqueia; HTML cache separado |

Fontes locais verificadas: [rotas](../src/routes/), [hooks](../src/hooks/),
[Functions](../src/lib/api/), [Services](../src/server/services/),
[Repositories](../src/server/repositories/), [schemas](../src/server/schemas/),
[schema Prisma](../prisma/schema.prisma) e [migrations](../prisma/migrations/).
Login não usa React Query e execução grava local antes de enviar; essas variações
estão documentadas, sem inventar camada/API ausente.

Fluxo principal rastreável:

```text
Login
→ Criar / editar / excluir logicamente empresa própria
→ Criar checklist pessoal
→ Adicionar / editar / remover itens e associar normas opcionais
→ Publicar versão
→ Criar inspeção própria com snapshot da publicação
→ Responder / observar no snapshot; NC nasce de NON_COMPLIANT
→ Concluir após responder obrigatórios
→ Confirmar sincronização
→ Consultar relatório / imprimir / ver dashboard
```

NCs, ações e evidências complementam esse fluxo, sem serem pré-condições de
conclusão. Publicação/versionamento e cópia preservam a distinção entre conteúdo
editável e histórico. Reutilizar publicação não compartilha inspeções.
RF12/RN07 continuam sem implementação; não existe elo artificial para solicitante.

## 7. Diagrams audit

| Artefato vigente / PlantUML em diagrams/                        | Resultado estático                                                                                                                            |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Conceitual / database/conceptual.puml                           | 16 conceitos, relações/cardinalidades equivalentes; três associações normativas abstraídas como N:N                                           |
| Lógico e físico / database/logical.puml, database/physical.puml | 19 entidades/172 campos/36 FKs; nomes/tipos/nulabilidade/PK/FK/UK; físico com defaults e 74 índices explícitos/13 CHECKs                      |
| Classes / domain/classes.puml                                   | 19 classes persistidas e seis enums selecionados; 36 FKs e seis dependências de enum; membros/tipos equivalentes                              |
| Casos de uso / domain/use-cases.puml                            | Dois atores e 22 casos; associações/nomes equivalentes, sem includes que tornem foto/NC/norma obrigatórias                                    |
| Arquitetura / architecture/application.puml                     | 16 nós/17 arestas; direção e fronteiras equivalentes                                                                                          |
| Autenticação / architecture/authentication.puml                 | Seis participantes/19 mensagens; alternativas e revalidação equivalentes                                                                      |
| Cópia / flows/checklist-copy.puml                               | Flowchart/atividade equivalentes nas decisões, hash, linhagem, inserts ordenados, transação e rollback; seis if/endif balanceados no PlantUML |
| Inspeção / flows/inspection.puml                                | 12 nós/13 arestas; inclui conclusão de PLANNED sem obrigatórios pendentes e tratativas após conclusão                                         |
| Evidência / flows/evidence.puml                                 | 14 nós/13 arestas; contextos exclusivos e falhas/compensações explícitos                                                                      |
| Relatório/dashboard / flows/reports-dashboard.puml              | 13 nós/14 arestas; acesso por ID sem exigir COMPLETED, fontes históricas/atuais e impressão nativa                                            |
| Offline / flows/offline-inspection.puml                         | 12 nós/15 arestas; fila, confirmação, retry, ERROR e CONFLICT com bloqueio                                                                    |
| Navegação / flows/navigation.puml                               | 19 nós/37 arestas; rotas/destinos atuais, cópia com novo ID e relatório pela busca                                                            |

Os cinco últimos pares tiveram comparação de nós/rótulos/direções/arestas e
distinção de seta tracejada automatizada. Modelos/classes/casos/arquitetura/
autenticação também tiveram comparação estrutural; cópia teve conferência
semântica das etapas e checks básicos. Não se exige igual contagem de nós entre
flowchart Mermaid e atividade PlantUML.

Há **13 pares vigentes**, um Mermaid adicional no estudo histórico de
versionamento e dois PlantUML históricos/referenciais: DiagramTest e
flows/use-cases. Seus limites estão explícitos e eles não definem funcionalidades
atuais. Os 15 PlantUML tiveram delimitadores/estrutura básica verificados, sem
includes externos; os 14 Mermaid tiveram declaração de tipo/fences conferidos.

`plantuml` e `mmdc` não estão no PATH nem nos binários locais de node_modules.
Nenhum renderizador, Java ou dependência foi instalado.

```text
rendering not executed
static/structural validation performed
```

Não houve renderização visual nem validação por parser oficial. Estrutura
coerente não comprova disposição visual, legibilidade ou exportação das figuras.

## 8. Implementation Concerns — status final

IDs IC-P6/IC-P9 preservam a origem das Fases 3–9. Prioridade é avaliação de
revisão, sem nova reprodução de impacto. **Nenhum dos 14 concerns da Fase 9 foi
corrigido nesta fase ou resolvido por mera atualização documental.**

“Requer implementação futura” significa mecanismo ainda presente; “adiado”
mantém a pendência; “limitação aceita no parecer documental” reconhece o alcance
do TCC e não aprova seu uso irrestrito em produção. “Documentação/informativo”
descreve uma garantia ausente, sem atribuir defeito funcional não demonstrado.
Itens históricos resolvidos abaixo possuem evidência anterior identificada.

| ID               | Concern                                                                   | Status                                                                                                   | Priority      | Action                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IC-P6-01         | Relatório por ID próprio sem exigir conclusão                             | Ainda válido; limitação aceita no parecer documental, política pendente                                  | Low           | Decidir política/identificação de relatório parcial e verificar acesso em cada estado; lista COMPLETED não é filtro do detalhe                                  |
| IC-P6-02         | React Query retém cache entre identidades                                 | Ainda válido; requer implementação futura                                                                | Medium        | Reproduzir A→B na SPA com rede lenta/offline/erro; segregar ou limpar cache; logout atual não limpa QueryClient explicitamente                                  |
| IC-P6-03         | Concorrência de revisão/sync entre abas/dispositivos                      | **Ainda válido; requer implementação futura**                                                            | **High**      | Priorizar revisão atômica/coordenação entre abas e validar mesma revisão, mesmo UUID e conclusão concorrente; transação/PK não provam proteção global           |
| IC-P6-04         | Confirmação remota substitui projeção local mais recente                  | Ainda válido; requer implementação futura                                                                | Medium        | Preservar edição dependente na projeção e testar pausa/falha/reabertura entre confirmações; payload da fila não é perdido pela simples substituição             |
| IC-P9-01         | Limpar prazo com JSON null produz epoch                                   | Ainda válido; requer implementação futura                                                                | Medium        | Ajustar contrato/coerção de NC/ação e verificar omissão, string vazia e null; não tratar coluna nullable como garantia de limpeza                               |
| IC-P9-02         | Retenção de HTML autenticado no cache de navegação                        | Ainda válido; requer implementação futura                                                                | Medium        | Rever retenção/expiração/segregação e testar SSR offline após expiração/logout/troca; cache HTML é distinto de React Query e IndexedDB                          |
| IC-P9-03         | Exceções fora de Result e classificação de retry                          | Ainda válido; requer implementação futura                                                                | Low           | Distinguir validação, falha interna/local e transporte; catch atual rotula tudo NETWORK_ERROR; falhas retornadas 401/422 e 409 recebem tratamento específico    |
| IC-P9-04         | Formato de publicação não recalculado recebe VERIFIED no snapshot novo    | Ainda válido; histórico/legado com política adiada                                                       | Medium        | Definir elegibilidade/rótulo de integridade por formato; backfill original continua UNVERIFIED_LEGACY, sem promover prova histórica                             |
| IC-P9-05         | Busca/ordenação usa metadados atuais, DTO alheio usa publicação           | Ainda válido; inferência de sinalização de draft, investigação adiada                                    | Low           | Alterar draft e pesquisar como outro usuário; não foi demonstrado vazamento de conteúdo nesta fase                                                              |
| IC-P9-06         | Nome da cópia sem UNIQUE/reserva concorrente                              | Ainda válido; hardening adiado                                                                           | Low           | Decidir se exclusividade de título é necessária e testar cópias simultâneas; RepeatableRead não reserva nome                                                    |
| IC-P9-07         | UNIQUE SQL de email é sensível à caixa                                    | Ainda válido; documentação/informativo, hardening condicionado à política                                | Informational | Preservar distinção entre normalização da aplicação e índice SQL; avaliar importações/concorrência caso se exija garantia física case-insensitive               |
| IC-P9-08         | Ação referencial de Checklist.createdById diverge entre schema/migrations | Ainda válido; requer implementação futura em tarefa própria                                              | Medium        | Alinhar política/migration e conferir drift autorizado; não executar db push como substituto das migrations                                                     |
| IC-P9-09         | Compensação Cloudinary/banco pode falhar                                  | Ainda válido; limitação externa reconhecida, hardening adiado                                            | Medium        | Injetar falhas e monitorar/reconciliar órfãos/restauração incompleta; sem transação distribuída                                                                 |
| IC-P9-10         | URL externa de evidência não revalida sessão por download                 | Ainda válido; política de entrega pendente                                                               | Medium        | Avaliar política do provedor/acesso por URL conhecida após logout/remoção; ownership de metadados não protege automaticamente binário                           |
| HIST-COPY-P2003  | Derivação com escrita N+1 ultrapassava transação e gerava P2003           | Resolvido anteriormente pela implementação atual, sem reexecução aqui                                    | Historical    | Código atual usa lotes ordenados/UUIDs na transação; validação funcional final em OfficialTemplates supersede diagnóstico anterior                              |
| HIST-MURBACH     | Referência de páginas incompleta no template                              | Resolvido anteriormente no catálogo/exibição/cópias por errata documental; histórico imutável preservado | Historical    | Manter alcance da errata; publicação/snapshot original não são reescritos e relatório direto da versão histórica conserva descrição original                    |
| HIST-TS-AMPLIADO | Diagnósticos de nulabilidade em scripts/E2E fora do tsconfig oficial      | Adiado; registro histórico não revalidado nem declarado corrigido                                        | Low           | Revisar arquivos preexistentes em tarefa de implementação e repetir configuração ampliada; aprovação do TypeScript oficial anterior não aprova todos os scripts |

### Evidência atual dos concerns prioritários

[InspectionResponseRepository](../src/server/repositories/inspection-response.repository.ts)
lê updatedAt e compara a revisão **antes** do update da inspeção; o upsert da
resposta não condiciona a escrita à mesma revisão. O update da inspeção pode
serializar essa linha, mas não recompõe a comparação de revisão já feita.
Duas transações podem ter lido a mesma revisão antes de uma aguardar a outra;
isso sustenta o concern de perda de atualização, sem alegar reprodução nesta
fase. A confirmação idempotente na mesma transação evita commit parcial e a PK
impede duplicar registro de operação, mas não prova que tentativas concorrentes
sempre retornem sucesso idempotente/conflict corretamente classificado.

[sync-manager](../src/offline/sync-manager.ts) mantém activeSynchronization
somente na instância JavaScript. Recuperar SYNCING não coordena outra aba que
ainda esteja enviando. Duas abas e dispositivos, mesma revisão/UUID e
resposta/conclusão simultâneas permanecem cenários de homologação pendente.
Não se classificou a sincronização como globalmente segura em concorrência.

No mesmo arquivo, acknowledgeResponseOperation atualiza revisão/dependência da
fila, remove a operação confirmada e substitui a resposta do pacote pelo retorno
remoto mesmo havendo edição dependente mais nova. A fila conserva esse payload,
mas a projeção pode regredir até a próxima confirmação. Catch genérico também
abrange falhas de confirmação local, além do transporte, e classifica-as como
NETWORK_ERROR. Esses fatos reconfirmam IC-P6-04/IC-P9-03.

[router](../src/router.tsx), [query keys](../src/lib/api/dashboard.query-keys.ts),
[AppShell](../src/components/layout/AppShell.tsx) e
[sessão local](../src/offline/session.ts) distinguem limpeza de IndexedDB/cache
de navegação de limpeza de QueryClient. Não foi encontrada limpeza explícita
do QueryClient na troca/logout. [sw.js](../public/sw.js) cacheia navegação OK
exceto /login, sem chave por usuário/TTL; expiração local apaga a sessão, não o
HTML cacheado. Alcance visual entre identidades/SSR ainda exige reprodução.

Nos [schemas](../src/server/schemas/), z.coerce.date precede z.null: o caso
JSON null → epoch permanece documentado; string vazia vira NULL no schema e
omissão na criação vira NULL pelo Service. Formulário pode transformar vazio em
null antes da Function. Reprodução isolada anterior pertence à Fase 4; não foi
executada novamente e não se afirmou que string vazia, sozinha, vira epoch.

Demais fontes: [ReportRepository](../src/server/repositories/report.repository.ts),
[InspectionService](../src/server/services/inspection.service.ts),
[ChecklistRepository](../src/server/repositories/checklist.repository.ts),
[EvidenceService](../src/server/services/evidence.service.ts),
[dicionário — divergência](./DicionarioDeDados.md#8-divergência-constatada-entre-schema-e-migrations),
[Fase 4](./RelatorioFase4.md), [Fase 5](./RelatorioFase5.md),
[Fase 6](./RelatorioFase6.md) e [templates — resultados históricos](../AI/OfficialTemplates.md).

Nenhum concern de implementação novo foi identificado. A errata de índices é
documental; a pendência Prettier é formatação preexistente. RBAC, solicitante,
gestão de equipe, PDF customizado, BI, UI completa de histórico/retirada e
ampliação offline são lacunas/roadmap explícitos, sem classificação automática
como bug. A homologação autenticada em produção/outros navegadores, renderização
de diagramas e cobertura concorrente continuam pendentes.

## 9. Final TCC readiness e fechamento

| Uso                      | Avaliação                                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Submissão acadêmica      | Adequada ao escopo implementado: requisitos, domínio, modelos, dicionário, arquitetura/API, telas, casos e guias rastreáveis; lacunas identificadas                               |
| Avaliação pelo professor | Guia e roteiro coerentes com a entrega; não atribuem RBAC, solicitante, offline integral ou PDF backend à aplicação                                                               |
| Demonstração técnica     | Roteiro documentado adequado em ambiente preparado; aguardar sincronização, usar evidência online e pacotes previamente disponíveis. Esta fase não executou a demonstração        |
| Revisão/manutenção       | Base consistente com fontes e histórico preservado; concerns com IDs/prioridade/ação. Concorrência High requer implementação/homologação futura antes de alegar garantia ampliada |

Leitores devem conhecer o concern High de concorrência e os limites de cache,
projeção, prazo, hash legado e armazenamento externo. Figuras ainda exigem
renderização oficial antes de afirmar legibilidade/exportação visual. Recursos
PWA/HTTPS tiveram validação histórica limitada; execução autenticada completa
em produção/outros navegadores não é demonstrada por esta revisão.

O único artefato novo é este relatório final. As verificações pós-staging e
pós-commit encerram a Fase 10 com **um commit**, árvore limpa e **sem push**.
O parecer permanece **FINAL QA — APPROVED WITH KNOWN LIMITATIONS**.

Varredura de fechamento, incluindo este relatório: **48 documentos, 613
referências relativas internas, 33 referências com âncora e 183 fences
completas; zero caminhos ou âncoras não resolvidos**. Prettier passou nos
**46 Markdown selecionados**, incluindo este relatório; a pendência no estudo
histórico está explicitada na seção 4. Não houve renderização ou validação
runtime nesta fase.
