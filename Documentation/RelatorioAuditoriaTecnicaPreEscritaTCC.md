# Auditoria técnica pós-merge antes da escrita do TCC

**Projeto:** Safe Watch Insight

**Data:** 11 de outubro de 2026 (America/Fortaleza)

**Baseline:** main — ff94c6c22ee8f8f986d0e376a5cf7e3b01fbec13

**Natureza:** auditoria de leitura; somente este relatório é adicionado.

**Parecer:** APPROVED WITH REQUIRED QUALIFICATIONS.

## 1. Resumo executivo

O projeto pode avançar para a retrospectiva técnica e a escrita do TCC, desde que descreva o incremento efetivamente entregue e preserve as limitações verificadas. Há backend real no fluxo principal, ownership no servidor, versões publicadas, snapshots de checklist, evidências online, relatórios sob demanda, dashboard e execução offline de inspeções previamente disponibilizadas. Isso é suficiente para relatar desenvolvimento e metodologia; não demonstra segurança completa, consistência concorrente garantida ou prontidão comercial.

Foram recuperados e avaliados **os 14 concerns históricos** das Fases 9–11: **5 CONFIRMED_DEFECT, 5 POTENTIAL_RISK e 4 ACCEPTED_SCOPE_LIMITATION**. Nesse inventário, há **zero RESOLVED, FALSE_POSITIVE, CONFIRMED_SECURITY_RISK e INSUFFICIENT_EVIDENCE**. Os defeitos confirmados são a regressão da projeção local durante confirmação de sincronização, a coerção de prazo null para epoch, a classificação indiscriminada de exceções como erro de rede, o rótulo VERIFIED sem recálculo em formatos de publicação diferentes de 1 e a divergência da ação referencial de Checklist.createdById. Confirmação estática de mecanismo não significa reprodução integral do impacto.

O risco de maior prioridade funcional permanece **IC-P6-03: concorrência sobre a mesma revisão entre abas/dispositivos**. A comparação precede a escrita e não condiciona o upsert; o mutex cliente só coordena uma instância JavaScript. Não houve corrida reproduzida nem perda de dados observada nesta auditoria. Os caches React Query e de HTML, a busca compartilhada e a entrega de imagens por URL externa têm riscos delimitados; não foi comprovada quebra de ownership remoto.

A correção do **GHSA-qx66-fv34-fjm8 / CVE-2026-102989** está presente no manifesto, no lockfile npm e na árvore instalada: Start 1.168.60 e start-server-core 1.169.39. O status GitHub/Vercel do HEAD está em success. A consulta npm atual confirmou **19 entradas de pacotes vulneráveis: 14 altas, 5 moderadas, zero críticas**. Várias entradas propagam o mesmo advisory; não representam 19 explorações independentes da aplicação. O inventário Dependabot não pôde ser obtido: HTTP 403, com mensagem de alertas desativados e escopo adicional requerido.

Há uma ressalva de reprodução: **bun.lock ainda resolve Start 1.167.50 e Core 1.167.22, dentro das faixas afetadas pelo advisory corrigido no npm**. Esse lockfile não descreve a instalação atual. Deve-se documentar o caminho npm usado para reproduzir a versão auditada; não se pode declarar ambos os lockfiles atualizados/seguros.

**Nenhuma correção de aplicação foi estabelecida como pré-requisito para começar a escrita inteira do TCC.** É bloqueante para as _alegações afetadas_ corrigir ou qualificar garantias absolutas de concorrência, segurança, verificação de integridade e funcionamento offline integral. O defeito de prazo merece correção antes da demonstração final do fluxo de ações; a escrita pode registrar sua existência sem esperar a correção. A prioridade é acadêmica, não um parecer de implantação comercial.

## 2. Escopo e metodologia

### 2.1. Segurança e baseline do repositório

| Verificação                            | Resultado observado                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Branch                                 | main; não houve troca/criação de branch                                                                                                |
| Working tree inicial                   | Limpa, inclusive índice e arquivos não rastreados                                                                                      |
| HEAD e origin/main local               | ff94c6c22ee8f8f986d0e376a5cf7e3b01fbec13                                                                                               |
| main remoto consultado pela API GitHub | Mesmo SHA; não foi necessário fetch                                                                                                    |
| Remote configurado                     | origin: PedroVitor237/safe-watch-insight, GitHub                                                                                       |
| PR #1                                  | Merge cac205034ce59f3d750b9ce6413ddb9370bc2a1e, presente no histórico; API confirmou merged=true                                       |
| PR #2                                  | Commit de correção 570f1aec634aad5300263c725951ed39bc8d1d78; merge ff94c6c22ee8f8f986d0e376a5cf7e3b01fbec13; API confirmou merged=true |
| Delta de aplicação do PR #2            | Apenas ErrorComponentProps em src/routes/__root.tsx, além de package.json/package-lock.json                                            |
| Destino deste relatório                | Ausência verificada no início e imediatamente antes da criação                                                                         |

Fontes externas de rastreabilidade: [PR #1](https://github.com/PedroVitor237/safe-watch-insight/pull/1), [PR #2](https://github.com/PedroVitor237/safe-watch-insight/pull/2) e [commit auditado](https://github.com/PedroVitor237/safe-watch-insight/commit/ff94c6c22ee8f8f986d0e376a5cf7e3b01fbec13). O texto de validação de um PR é evidência histórica declarada por seu autor; não substitui execução nesta auditoria.

### 2.2. Fontes e método

Foram lidos o [AGENTS](../AGENTS.md), o [PROJECT_CONTEXT](../PROJECT_CONTEXT.md), o snapshot histórico [AI_PROJECT_CONTEXT](../AI_PROJECT_CONTEXT.md), o [plano](../IMPLEMENTATION_PLAN.md), o [backlog](../TASKS.md) e as [decisões técnicas](../TECH_DECISIONS.md). Foram inspecionadas as partes pertinentes de [Architecture](../AI/Architecture.md), [API](../AI/API.md), [Database](../AI/Database.md), [BusinessRules](../AI/BusinessRules.md), [Offline](../AI/Offline.md), [OfficialTemplates](../AI/OfficialTemplates.md) e [ChecklistCopy](../AI/ChecklistCopy.md).

As fontes históricas principais são as [Fases 5](./RelatorioFase5.md), [6](./RelatorioFase6.md), [9](./RelatorioFase9.md), [10](./RelatorioFase10.md) e [11](./RelatorioFase11.md), complementadas pela [Fase 4](./RelatorioFase4.md), pelo [dicionário](./DicionarioDeDados.md), README, requisitos e guia do usuário. AI/IMPLEMENTATION_PLAN.md e AI/TASKS.md não existem; os arquivos vigentes estão na raiz. Não foram inventados relatórios de segurança autônomos: a evidência específica do PR #2 veio da API e do diff Git.

A inspeção cruzou rotas/hooks/Server Functions com Services, Repositories, schemas Zod, migrations, worker e sincronizador. Históricos Git delimitaram o que mudou após homologações. Buscas usaram find/grep/Python porque rg não está instalado. Scripts auxiliares foram executados por stdin, sem criar arquivos auxiliares no repositório.

### 2.3. Verificações efetivamente executadas

| Método/comando                                                                                            | Resultado e alcance                                                                                                            |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| git status, branch, log, remote, rev-parse, show e diff                                                   | Baseline limpa; merges presentes; comparação com homologação e PR #2                                                           |
| gh api: commits/main, PRs 1/2, HEAD/status e HEAD/check-runs                                              | main remoto igual; Vercel success; zero check-runs no HEAD                                                                     |
| npm audit --json --ignore-scripts --package-lock-only                                                     | Consulta ao registro npm; 19 entradas. Exit 1 indica vulnerabilidades remanescentes                                            |
| Primeira tentativa de npm audit no sandbox                                                                | Falhou por DNS EAI_AGAIN; não foi tratada como scan válido                                                                     |
| Repetição autorizada de npm audit com acesso de rede                                                      | Produziu o inventário válido utilizado na seção 4; nenhuma instalação/fix                                                      |
| npm ls dos quatro pacotes TanStack e npm explain de fast-uri/js-yaml/mysql2/source-map-js                 | TanStack deduplicado; cadeias de dependência identificadas                                                                     |
| Leitura JSON de package.json/package-lock.json e package.json instalados                                  | Manifesto/raiz do lock consistentes; 607 entradas instaladas conferidas, sem divergência de versão; 141 ausentes são opcionais |
| gh api advisories/{GHSA} para os 19 identificadores únicos do npm                                         | CVEs/faixas/primeiras correções recuperados, inclusive ausência de patch para braces                                           |
| Consulta web ao advisory do repositório TanStack e a advisories selecionados                              | Confirmação das faixas e correções; a URL global do advisory TanStack retornou 404, mas a URL oficial do repositório respondeu |
| Node 22.23.2 executando node_modules/typescript/bin/tsc --noEmit                                          | Exit 0; configuração oficial aprovada hoje, sem emissão                                                                        |
| Diagnóstico isolado das expressões optionalNullableDateSchema dos dois arquivos atuais, com Zod instalado | null → epoch; vazio → null; omissão → undefined; data válida aceita; texto inválido rejeitado                                  |
| Revisão final de Markdown, links locais, escopo Git e whitespace                                          | Conferência limitada a este relatório; não é nova auditoria documental completa                                                |

O shell padrão disponibiliza Node 20.19.2/npm 9.2.0. O typecheck usou o binário **22.23.2 já existente**, sem alterar PATH, configuração ou variáveis de ambiente. O diagnóstico Zod usou Node 20.19.2, não executou Services/Prisma e não persistiu dados. Leu as expressões atuais e as avaliou em memória; não foi um teste de UI ou de transporte da Server Function.

### 2.4. Limites

Não foram executados npm test, build, lint de aplicação, E2E, seeds, migrations, Prisma generate, SQL, upload/destroy Cloudinary ou testes contra banco compartilhado. [package.json](../package.json), linhas 11 e 16–33, mostra geração de arquivos no build e validadores operacionais; [e2e/offline-pwa.spec.ts](../e2e/offline-pwa.spec.ts), linhas 88–99, cria/limpa fixtures. Essas rotinas não foram acionadas nesta tarefa.

Não houve nova homologação offline, exploração de XSS, corrida real, troca A→B em navegador, consulta autenticada aos headers do deploy, inspeção da configuração privada da Vercel/Cloudinary ou análise de drift remoto. O status de implantação veio da API GitHub, sem acesso aos logs privados do build ou certificação do fluxo autenticado publicado. Não se atribui validade irrestrita às 19 correções sugeridas pelo npm nem aos resultados históricos.

## 3. Inventário dos achados históricos

### 3.1. Origem, classificação e contagem

O conjunto completo está na [Fase 9, seção 10](./RelatorioFase9.md), linhas 253–276: quatro IDs IC-P6 e dez IDs IC-P9. A [Fase 10, seção 8](./RelatorioFase10.md), linhas 283–317, e a [Fase 11](./RelatorioFase11.md), linhas 275–305, preservam esses 14 IDs. Os IC-P6 têm origem na [Fase 6, seção 16](./RelatorioFase6.md), linhas 241–265; IC-P9 organiza concerns anteriores das Fases 2–6. A tabela abaixo resume fielmente as descrições recuperadas, sem adicionar os três registros HIST à contagem.

CONFIRMED_DEFECT significa discrepância de comportamento/contrato ou configuração demonstrável. POTENTIAL_RISK significa mecanismo de risco presente, sem impacto integral reproduzido. ACCEPTED_SCOPE_LIMITATION reconhece ausência de garantia explicitamente delimitada, sem declarar o risco eliminado. RESOLVED exigiria evidência de correção; FALSE_POSITIVE exigiria refutação do concern original; INSUFFICIENT_EVIDENCE seria usado se nem o mecanismo pudesse ser determinado. Prioridade de escrita considera a alegação afetada, não apenas a severidade histórica.

| ID       | Concern histórico e origem                                                                    | Status atual              | Evidência atual e verificação                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Impacto                                                                                                                                              | Ação recomendada                                                                                                                           | Prioridade para a escrita                                                     |
| -------- | --------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| IC-P6-01 | Relatório próprio por ID sem exigir conclusão; Fase 6 §16 / Fase 9 linha 263                  | ACCEPTED_SCOPE_LIMITATION | [ReportRepository](../src/server/repositories/report.repository.ts): findOwnedInspectionReport, linhas 146–158, exige dono/deletedAt; listAvailableInspectionReports, 161–170, exige COMPLETED. [ReportService](../src/server/services/report.service.ts): getInspectionReport, 138–153, exige snapshot. [InspectionReport](../src/components/reports/InspectionReport.tsx), 92–118, exibe status e pendentes. [BusinessRules](../AI/BusinessRules.md), 621–630, documenta acesso direto. Testes de relatório existentes verificam escopo, não matriz completa de estados. | Relatório de leitura parcial possível; sem quebra de autorização identificada. Não pode ser descrito como sempre final/concluído.                    | Manter descrição de leitura sob demanda; decidir aviso de parcialidade ou bloqueio de impressão final em tarefa futura.                    | DEFERRED para produto; qualificação obrigatória da alegação                   |
| IC-P6-02 | Cache React Query entre identidades; Fase 6 §16 / Fase 9 linha 264                            | POTENTIAL_RISK            | [router](../src/router.tsx), 5–13: QueryClient por router. [dashboard keys](../src/lib/api/dashboard.query-keys.ts), 1–4, não inclui usuário. [AppShell](../src/components/layout/AppShell.tsx): handleLogout, 61–89, e [login](../src/routes/login.tsx), 43–54, não limpam QueryClient. [useDashboard](../src/hooks/useDashboard.ts), 6–10, usa a mesma chave; [Dashboard](../src/routes/_app.dashboard.tsx), 70–73, lê dados do cache. Tests de isolamento local cobrem Dexie, não essa SPA; sem reprodução A→B hoje.                                                    | Possível exibição temporária de dados anteriores ao refetch, no mesmo navegador; ownership servidor continua distinto.                               | Segregar/limpar queries em mudança de sessão e testar A→B com atraso/falha de rede.                                                        | RECOMMENDED; não alegar isolamento completo de todo cache                     |
| IC-P6-03 | Concorrência de revisão/sync entre abas/dispositivos; Fase 6 §16 / Fase 9 linha 265           | POTENTIAL_RISK            | [InspectionResponseRepository](../src/server/repositories/inspection-response.repository.ts): saveWithNonConformity, 129–164, compara revisão antes de update/upsert; 164–191, upsert sem condição de revisão. [sync-manager](../src/offline/sync-manager.ts), 19–40: mutex local/reset. Transação e registro idempotente existem, mas não CAS da resposta. Teste de conflito do E2E é sequencial; corrida mesma revisão/UUID não executada.                                                                                                                               | Possível perda de atualização e classificação inadequada de duplicata concorrente; alta prioridade de integridade.                                   | Condicionar escrita à revisão/definir isolamento e coordenação, testar duas abas/dispositivos e conclusão concorrente em ambiente isolado. | RECOMMENDED alta; BLOCKING apenas para garantia global concorrente            |
| IC-P6-04 | Confirmação substitui projeção local mais nova; Fase 6 §16 / Fase 9 linha 266                 | CONFIRMED_DEFECT          | [sync-manager](../src/offline/sync-manager.ts): acknowledgeResponseOperation, 157–210, libera dependentes, mantém payload, apaga operação antiga e substitui resposta pelo retorno remoto sem testar edição mais nova. [inspection-store.test](../src/offline/inspection-store.test.ts), 88–153, testa encadeamento, não confirmação pausada. Constatação estática, sem novo browser.                                                                                                                                                                                      | Pacote/UI pode regredir até a próxima confirmação; não há prova de perda definitiva da fila. Edição baseada nessa projeção pode ser incorreta.       | Preservar projeção da edição dependente; testar interrupção/reabertura entre confirmações.                                                 | RECOMMENDED antes da demonstração ampliada                                    |
| IC-P9-01 | JSON null ao limpar prazo produz epoch; Fase 4 §Out of Scope / Fase 9 linha 267               | CONFIRMED_DEFECT          | [NC schema](../src/server/schemas/non-conformity.schema.ts), 6–8, e [ação schema](../src/server/schemas/corrective-action.schema.ts), 20–22: coerce antes de null. Diagnóstico atual reproduziu nos dois. [NonConformityEditForm](../src/components/non-conformities/NonConformityEditForm.tsx), 61–69, e [CorrectiveActionsPanel](../src/components/non-conformities/CorrectiveActionsPanel.tsx), 114, enviam null para campo vazio. [sprint.schemas.test](../src/server/schemas/sprint.schemas.test.ts), 26–67, cobre data/vazio, não JSON null.                         | Prazo indevido persistível, atraso artificial e inconsistência em ações/NC; tela exibe data antiga em vez de ausência de prazo.                      | Corrigir normalização/ordem da união e cobrir omissão, vazio, null e update; verificar dados afetados em tarefa autorizada separada.       | RECOMMENDED alta; não declarar limpeza de prazo correta                       |
| IC-P9-02 | HTML autenticado retido sem usuário/TTL; Fase 5 §9 / Fase 9 linha 268                         | POTENTIAL_RISK            | [sw.js](../public/sw.js): networkFirstNavigation, 61–73, guarda resposta OK exceto /login. [sessão local](../src/offline/session.ts), 49–56, expira sessão sem limpar navegação; 76–80 trata 401 remoto. [database](../src/offline/database.ts), 39–77, limpa no logout/troca. E2E existente confere limpeza; não prova ausência de SSR sensível após expiração. Sem inspeção autenticada de headers/HTML hoje.                                                                                                                                                            | Retenção privada no perfil do navegador compartilhado; nenhuma exposição entre usuários via CDN demonstrada.                                         | Rever retenção/chaves/expiração de navegação e testar HTML SSR após sessão vencida e falhas de limpeza.                                    | RECOMMENDED; qualificar segurança local                                       |
| IC-P9-03 | Exceções fora de Result e retry genérico; Fases 3–6 / Fase 9 linha 269                        | CONFIRMED_DEFECT          | [auth.functions](../src/lib/api/auth.functions.ts), 85–87, valida antes do handler; [InspectionService](../src/server/services/inspection.service.ts), 151–164, relança inesperados. [sync-manager](../src/offline/sync-manager.ts), 99–143: catch também abrange confirmação Dexie e rotula NETWORK_ERROR. 249–285 distingue 409/401/422 retornados. Sem fault injection hoje.                                                                                                                                                                                            | Retry/mensagem podem atribuir rede a falha de validação/interna/local. Limite de cinco tentativas reduz repetição; não indica bypass de autorização. | Separar transporte, domínio e persistência local; mapear falhas permanentes sem padronização indiscriminada do projeto inteiro.            | RECOMMENDED baixa                                                             |
| IC-P9-04 | Snapshot novo VERIFIED sem recálculo em formato diferente de 1; Fases 3–6 / Fase 9 linha 270  | CONFIRMED_DEFECT          | [InspectionService](../src/server/services/inspection.service.ts): ensurePublishedContentIsValid, 224–231, aceita hash presente sem recálculo para outro formato; createInspection, 78–86, atribui VERIFIED. Cópia em [ChecklistService](../src/server/services/checklist.service.ts), 73–86, exige formato 1/hash íntegro. Testes de inspeção verificam formato atual; compatibilidade está documentada, sem prova criptográfica do legado.                                                                                                                               | Rótulo sugere verificação inexistente; compromete alegação acadêmica de verificação uniforme. Backfill original permanece UNVERIFIED_LEGACY.         | Definir elegibilidade e semântica do rótulo por formato; manter descrição explícita do limite enquanto não corrigido.                      | RECOMMENDED; BLOCKING para alegar todo snapshot criptograficamente verificado |
| IC-P9-05 | Busca/ordenação usa metadados atuais; DTO alheio usa publicação; Fases 3–4 / Fase 9 linha 271 | POTENTIAL_RISK            | [ChecklistRepository](../src/server/repositories/checklist.repository.ts): buildWhere, 319–326, e buildOrderBy, 340–346, consultam identidade; [ChecklistService](../src/server/services/checklist.service.ts): listChecklists, 181–195, troca título/descrição por publicação para terceiros. Mecanismo confirmado; inferência de sinalização privada não reproduzida.                                                                                                                                                                                                    | Busca/ordenação pode não corresponder ao conteúdo exibido; possível inferência de metadados de draft, sem vazamento integral demonstrado.            | Buscar/ordenar pela fonte visível e testar publicação/draft divergentes com usuário B.                                                     | RECOMMENDED baixa                                                             |
| IC-P9-06 | Título da cópia sem UNIQUE/reserva concorrente; Fases 3–4 / Fase 9 linha 272                  | ACCEPTED_SCOPE_LIMITATION | [ChecklistRepository](../src/server/repositories/checklist.repository.ts): copyFromSource, 140–196, escolhe nome lendo títulos em RepeatableRead. [schema](../prisma/schema.prisma), 137–158, sem UNIQUE de título. [ChecklistCopy](../AI/ChecklistCopy.md), 117, delimita ausência de garantia. Testes cobrem nomes em sequência; sem concorrência.                                                                                                                                                                                                                       | Cópias podem ter mesmo título, mas IDs/itens continuam distintos; exclusividade global de título não é requisito comprovado.                         | Manter convenção de nomes; só criar reserva/constraint se exclusividade passar a ser requisito.                                            | DEFERRED                                                                      |
| IC-P9-07 | UNIQUE SQL do e-mail é sensível à caixa; Fases 3–4 / Fase 9 linha 273                         | ACCEPTED_SCOPE_LIMITATION | [migration inicial](../prisma/migrations/20260705165125_init/migration.sql), 193, cria índice comum. [UserService](../src/server/services/user.service.ts), 27–41 e 92–93, normaliza; [UserRepository](../src/server/repositories/user.repository.ts), 37–38, consulta duplicidade case-insensitive; [registration schema](../src/lib/validation/registration.schema.ts), 6, normaliza. Testes de usuário existentes cobrem cadastro/duplicidade.                                                                                                                          | A API grava minúsculas e não demonstra duplicação por caixa; importação/escrita externa não possui garantia física case-insensitive.                 | Preservar distinção entre proteção da API e índice SQL; avaliar constraint se houver importadores/escrita externa.                         | DEFERRED; informativo                                                         |
| IC-P9-08 | FK Checklist.createdById diverge entre schema/migrations; Fase 2 / Fase 9 linha 274           | CONFIRMED_DEFECT          | [schema](../prisma/schema.prisma), 144/149, relação opcional sem onDelete; [migration inicial](../prisma/migrations/20260705165125_init/migration.sql), 331, RESTRICT. Migrations posteriores não recriam a FK. [Dicionário](./DicionarioDeDados.md), seção 8, registra SetNull inferido do Prisma versus RESTRICT migrado. Comparação estática hoje; sem drift remoto/novo DDL gerado.                                                                                                                                                                                    | Fontes de provisionamento divergem em exclusão física do usuário; soft delete normal não dispara FK. Não há corrupção observada do banco remoto.     | Alinhar decisão/schema/migration em tarefa própria; não usar db push para substituir histórico.                                            | RECOMMENDED média; não alegar equivalência integral do DDL                    |
| IC-P9-09 | Compensação Cloudinary/banco pode falhar; Fases 3–6 / Fase 9 linha 275                        | ACCEPTED_SCOPE_LIMITATION | [EvidenceService](../src/server/services/evidence.service.ts), 148–175, 208–217 e removeStoredFileAfterPersistenceFailure, 309–315: compensação best effort; falha secundária no cleanup é ignorada e restore pode lançar. [Architecture](../AI/Architecture.md), seção de integração externa, documenta ausência de atomicidade distribuída. [evidence.service.test](../src/server/services/evidence.service.test.ts), 295–317, testa compensação simples, não falhas duplas.                                                                                             | Falha dupla pode deixar órfão ou metadado arquivado indevidamente; não há órfão real identificado nesta tarefa.                                      | Documentar integração não atômica; futuramente monitorar/reconciliar e testar falhas duplas.                                               | DEFERRED, salvo ocorrência real que justifique correção                       |
| IC-P9-10 | URL externa de imagem sem sessão por download; Fases 3–6 / Fase 9 linha 276                   | POTENTIAL_RISK            | [CloudinaryStorageService](../src/server/storage/cloudinary-storage.service.server.ts): upload, 93–107 e 136–141, guarda secure_url; [EvidenceService](../src/server/services/evidence.service.ts), 106–120, retorna storageUrl. [InspectionReport](../src/components/reports/InspectionReport.tsx) usa URL externa; sem proxy/tokens de entrega. Testes de ownership protegem operações de metadados, não downloads Cloudinary. Sem requisição a imagem privada hoje.                                                                                                     | Quem conhecer URL pode ter acesso sem cookie da aplicação, dependendo da política do provedor; logout não revoga URL automaticamente.                | Definir política de confidencialidade/entrega autenticada e testar URL conhecida após logout/remoção.                                      | RECOMMENDED antes de alegar evidência integralmente privada                   |

A contagem de cinco defeitos não inclui o risco de corrida como falha de perda de dados reproduzida. A aceitação de quatro limitações é para a escrita sobre o protótipo: não transforma ausência de proteção em garantia nem substitui política de uso com dados sensíveis.

### 3.2. Prazos: cadeia completa e alcance da reprodução

Nos dois schemas, a primeira alternativa da união é z.coerce.date(). Para null, a conversão Date(null) produz epoch, logo a alternativa z.null() não é alcançada. O diagnóstico leu e avaliou em memória as expressões desses arquivos, com a biblioteca instalada:

| Entrada                 | Resultado em ambos os schemas |
| ----------------------- | ----------------------------- |
| Campo omitido/undefined | undefined                     |
| JSON null               | 1970-01-01T00:00:00.000Z      |
| String vazia            | null                          |
| 2026-10-20              | 2026-10-20T00:00:00.000Z      |
| Texto invalid           | Falha de validação            |

Na criação, [CorrectiveActionService](../src/server/services/corrective-action.service.ts), 170–176, e [NonConformityService](../src/server/services/non-conformity.service.ts), 180, transformam ausência em NULL. Na atualização, linhas 189–195 e 194 respectivamente preservam omissão, mas encaminham a Date epoch já produzida pelo schema. O Repository persiste o valor recebido. Os formulários citados na tabela transformam o campo visual vazio em null antes da Function, tornando o problema relevante também à UI. Nova ação sem prazo pode enviar esse null.

[format.ts](../src/lib/format.ts), 10–31, trata null/undefined como travessão; Date epoch é válida e será formatada, possivelmente no dia anterior conforme o fuso. As consultas de atraso usam dueDate < instante atual, portanto epoch pode criar atraso artificial. A NC automática da resposta usa prazo padrão de sete dias em [InspectionResponseService](../src/server/services/inspection-response.service.ts), 116–124; esse caminho interno não demonstra o defeito de entrada null.

Não foram gravados prazos no banco, nem procurados registros afetados. Recomenda-se correção/teste posterior antes de afirmar no TCC que criar/limpar prazos opcionais funciona corretamente em todos os caminhos.

#### Atualização posterior — remediação direcionada de IC-P9-01

Em 11 de outubro de 2026, na branch `fix/ic-p9-01-null-deadline`, a partir de `581e87dc060867f455bc4baeeee167b9b9dfaa7a`, o defeito foi reproduzido nos schemas reais de criação e atualização de NC/ação. A correção usa `.nullable()` fora da união, interceptando JSON `null` antes da coerção de data; `.optional()` conserva `undefined`, e string vazia continua resultando em NULL. Services e Repositories não precisaram de alterações: criação conserva ausência como NULL e atualização distingue omissão de limpeza explícita.

**Estado posterior: RESOLVED no código e nos testes locais para IC-P9-01.** Foram adicionados 23 testes aos arquivos existentes `sprint.schemas.test.ts` e `corrective-action.service.test.ts`: omissão/undefined, JSON null, vazio, datas válidas (string/ISO/Date), entradas inválidas, atualização somente de prazo, preservação de prazo omitido e limpeza de prazo existente. O fluxo schema → Service → Repository simulado → `fmtData` confirma ausência como “—”. Os testes direcionados falharam sete vezes com o código original (23/30 aprovados) e passaram 30/30 após a correção.

Validações executadas com Node 22.23.2 e npm, sem instalação de dependências: `npm exec -- tsx --test src/server/schemas/sprint.schemas.test.ts src/server/services/corrective-action.service.test.ts` (30/30), `npm test` (108/108), `npm exec -- tsc --noEmit` (aprovado), `npm run lint` (zero erros, seis avisos em componentes de UI fora do escopo), `npm run build` (aprovado, com avisos de depreciação/bundling) e `git diff --check` (aprovado). O tsx exigiu execução autorizada fora da sandbox para seu socket IPC. Arquivos gerados pelo build não integram a correção.

Não houve verificação em navegador, consulta/reparo de registros existentes, migration, seed ou implantação. A resolução refere-se ao contrato de entrada e ao fluxo local testado, sem certificar dados já persistidos. O inventário e as contagens anteriores deste relatório, assim como a retrospectiva, continuam sendo registros da baseline auditada; os outros 13 achados não foram remediados por esta atualização.

### 3.3. Sessão, caches e diferença entre retenção local e autorização remota

Logout remoto limpa o cookie; handleLogout tenta também limpar Dexie e Cache Storage e navega na SPA. Login grava o usuário seguro local e também navega na SPA. Não há funcionalidade especial de troca de conta: sair e entrar como B é o caminho relevante. QueryClient permanece associado ao router; chaves de dashboard/listas não carregam identidade e não foi localizada chamada explícita a clear/removeQueries/resetQueries na transição. Invalidações de mutações não resolvem essa mudança de identidade.

Há um caminho plausível de exposição visual: A consulta dashboard, sai sem recarregar, B entra e useDashboard usa a mesma chave; o componente lê query.data. Dados podem permanecer até atualização, sobretudo em atraso/erro. **Isso não foi reproduzido em navegador nesta auditoria**, por isso IC-P6-02 permanece POTENTIAL_RISK. Novas requisições e mutações têm usuário derivado do cookie e filtros próprios; não foi demonstrado que B possa operar recurso privado de A no servidor.

O worker é outro mecanismo: cache local de navegação network-first, sem particionamento/TTL próprio por usuário. Um response pode ter Vary, mas a aplicação não define explicitamente variação por identidade. Limpeza de logout/troca/401 reduz retenção; expiração local sozinha não limpa HTML. Em [vite.config.ts](../vite.config.ts), 27–46, headers explícitos atendem manifest/worker/fallback, sem regra de cache autenticado. Não foi encontrada regra explícita de CDN public para HTML autenticado. Não se conclui exposição cross-user pela Vercel nem ausência absoluta desse risco sem observar respostas autenticadas reais.

A conta é reconsultada no servidor, e conta excluída pode retornar NOT_FOUND após limpeza de cookie, conforme [session.ts](../src/server/auth/session.ts), 63–75. O cliente trata especificamente 401 para parte da limpeza. O guard e a sessão local de oito horas não equivalem a revogação confirmada quando o logout remoto falha.

#### Atualização posterior — remediação direcionada de IC-P6-02

Em 13 de outubro de 2026, após `git fetch origin`, `origin/main` e a branch
inicial `development` apontavam para `9059a8ede7c06ddefacb35bfab209997de6f55ef`.
A árvore estava limpa. A branch `fix/ic-p6-02-user-cache-isolation` foi criada
diretamente de `origin/main`, mantendo um único ramo para investigação/correção.

**Conclusão: CONFIRMED; corrigido e validado localmente no cache cliente.**
No Chromium, com duas identidades sintéticas e empresas exclusivas distintas,
A abriu o dashboard, saiu, e B entrou pela SPA sem refresh. Com a consulta de B
retida por uma barreira determinística, a empresa privada de A permaneceu
visível por toda a janela de asserção de 15 segundos. O mesmo vazamento ocorreu
após 401 remoto e novo login. Uma consulta iniciada por A ainda pendente também
impediu o dashboard de B de consultar/exibir seus próprios dados, reutilizando
o retryer anterior. Os três testes de regressão falharam na baseline pelos
resultados descritos (1/1 no cenário A→B; 0/2 nos cenários pendência/expiração).
Falhas iniciais na preparação do harness (hidratação do formulário e seletor
de texto) foram corrigidas antes dessas reproduções e não são evidência do
defeito. Nenhuma falha de ownership/autorização do servidor foi demonstrada.

**Causa:** QueryClient único do router/root durava por toda a SPA; os hooks
autenticados, inclusive `auth/session`, dashboard e listas, reutilizavam chaves
sem identidade. Logout/login limpavam dados offline e cookie, mas não mudavam
esse cache em memória. Não existe persistência do cache React Query; Dexie
persiste pacotes de domínio separadamente. Invalidação/refetch não remove o
resultado anterior enquanto a nova consulta demora ou falha. As mutações atuais
invalidam queries e podem continuar seus callbacks depois de sair da tela.

**Correção:** o guard `/_app.beforeLoad` retorna o ID da sessão validada;
`AuthenticatedQueryProvider`, com chave React nesse ID, possui um QueryClient
por montagem do layout protegido. Logout/redirect para login desmonta o layout;
nova sessão, mesmo do mesmo usuário, recebe outro cliente. Identidade diferente
detectada pelo guard remonta o provider. O cleanup usa `QueryClient.clear()`,
removendo caches de queries/mutações e cancelando retryers, inclusive se a função
de transporte não usa AbortSignal. Mutações em execução não são abortadas: seus
callbacks mantêm referência ao cliente descartado, sem poder preencher o novo.
O cache público do root permanece independente; navegação da mesma identidade
conserva o cliente autenticado. O listener de sincronização foi deslocado do
root para esse provider para continuar invalidando as quatro famílias previstas.
Não houve alteração em layout visual, URLs, Services, Repositories, banco ou SW.

**Validação executada**, Node 22.23.2, sem dependências novas no projeto:

- `npm run test:e2e:session-cache`: **5/5**, Chromium: A→logout→B com consulta
  atrasada, dados próprios de B, B→logout→A com erro e recuperação manual;
  consulta pendente de A com B recebendo dados próprios antes da liberação;
  identidade mudada pelo guard sem logout; 401 remoto e expiração local offline
  seguidos de novo login; harness com inspeção direta dos caches. Um marcador
  no documento confirmou ausência de refresh no cenário principal.
- O harness confirmou cliente antigo limpo, novo cache vazio, cancelamento de
  query que ignora AbortSignal, callback tardio de mutation incapaz de preencher
  o cache de B, cliente estável em navegação, novo cliente em troca direta e em
  novo login do mesmo usuário, cache público preservado e as quatro invalidações
  do evento `safe-watch-offline-synchronized` preservadas.
- `e2e/offline-sync-errors.spec.ts`: **13/13** na execução conjunta com as três
  primeiras regressões. O quarto teste de cache falhou inicialmente por falta
  do preâmbulo React no HTML estático do harness; passou após usar a entrada
  hidratada da aplicação. A execução final das cinco regressões passou **5/5**.
- `npm test`: **173/173**, zero falhas/skips. A primeira tentativa na sandbox
  foi impedida pelo socket IPC do tsx (EPERM); a execução autorizada passou.
- `tsc --noEmit`: aprovado. Verificação adicional com configuração temporária
  incluindo os dois arquivos novos de E2E: aprovada.
- `npm run lint`: zero erros; os mesmos **seis avisos preexistentes** de Fast
  Refresh em componentes UI. Um aviso do primeiro formato do harness foi
  eliminado ao usar arquivo `.ts`/`createElement`.
- `npm run build`: aprovado, artefato Vercel gerado; avisos de depreciação de
  `inputValidator`, diretivas `use client` ignoradas e tamanho de chunk.
- `git diff --check`: aprovado; alterações geradas em `routeTree.gen.ts` e
  artefatos de build não integram a correção.

**Limites:** as Server Functions foram interceptadas com resultados sintéticos
no navegador; o servidor local usou URL de banco loopback inacessível. Nenhum
dado real/produção foi lido ou gravado. Portanto, isso valida a SPA, os guards,
hooks, IndexedDB e React Query, sem homologar login/cookie reais, servidor Neon,
produção ou outros navegadores. Expiração/troca são aplicadas quando detectadas
pelos guards/consulta de sessão existentes; não se adicionou timer de revogação
ou coordenação entre abas. Não se cancelam efeitos remotos de mutações já
iniciadas nem se certificam side effects externos ao React Query. O SW foi
bloqueado nos novos testes para isolar o IC-P6-02: **IC-P9-02 permanece pendente**.
O veredito offline `APPROVED WITH KNOWN LIMITATIONS` e as funcionalidades
offline adiadas continuam como documentados em `AI/Offline.md`. A resolução
local não significa merge, deploy ou remediação dos demais achados; o inventário
original preserva a classificação histórica da auditoria.

#### Atualização posterior — reprodução e correção de IC-P9-02

Em 13 de outubro de 2026, o PR #7 foi confirmado como merged pelo GitHub, com
merge `33e8c832ab8972cdb91faf7709a52f104bb6106b`, contendo
`35ad10d9ffbf9722b33cde3331958e7b31f3bcfe`. Após fetch, `main` e `development`
avançaram por fast-forward; `development` foi enviado normalmente. As quatro
referências (`main`, `origin/main`, `development`, `origin/development`) ficaram
no merge acima, com árvore limpa em `development`. Sem reescrita de histórico,
descarte de trabalho ou testes de aplicação somente para sincronizar branches.
A branch `fix/ic-p9-02-authenticated-sw-cache` foi criada diretamente de
`origin/main`, após verificar que não existia local/remotamente.

**Conclusão:** mecanismo de retenção/exposição pelo worker **confirmado em
Chromium com HTTP e identidades sintéticas**, corrigido nesta branch. O inventário
original preserva sua classificação histórica `POTENTIAL_RISK`. Não se infere
incidente com dados reais nem bypass da autorização no servidor/CDN.

**Reprodução antes da alteração:** o worker original `safe-watch-v1` foi servido
sem modificações por um servidor HTTP loopback. Com cookie sintético de A,
`/dashboard` retornou HTML contendo `PRIVATE_HTML_USER_A`; Cache Storage reteve
esses bytes em `safe-watch-v1-navigation`. O cookie foi removido para representar
expiração, sem executar cleanup de logout. Com rede bloqueada pelo Chromium,
reload voltou a apresentar A. A regressão falhou tanto na inspeção dos bytes
persistidos quanto na ausência de A após reload. Não dependia de React Query.

Um GET normal `/_serverFn/private` não foi cacheado. Porém, requisitar
`/_serverFn/private-image` com `new Image()` fez o worker gravar a resposta JSON
privada em `safe-watch-v1-static`: a regra aceitava qualquer caminho de mesma
origem pelo destino `image`. O teste falhou ao encontrar essa resposta no cache.
Essas URLs são fixtures HTTP, não novos endpoints de negócio. A retenção de HTML
e o desvio por destino foram reproduzidos com o worker real; login/cookie SSR
com PostgreSQL e conteúdo privado de produção não foram executados.

**Causa:** navegação network-first armazenava qualquer resposta OK, salvo
pathname `/login`, sem identidade/validade. Expiração local excluía somente a
sessão, permitindo retorno do HTML antigo antes de qualquer guard cliente.
Cleanup de logout/troca/401 existia, mas não era condição de uso do fallback.
A regra de assets usava somente destino/origem e não distinguia uma API privada.

**Correção:**

- Worker `safe-watch-v2` nunca grava respostas de navegação; falhas de rede usam
  apenas `/offline-shell` público ou `/offline.html` do cache da versão atual.
- A nova rota pública usa `ssr: false`, sem guards/loaders/conteúdo privados.
  O root é independente da identidade. Ao reabrir outra URL, o router cliente
  executa os guards existentes, validando sessão antes do AppShell e lendo
  somente pacotes IndexedDB do próprio usuário. Nenhuma rota aprovada mudou.
- A instalação obtém shell/manifest/ícone/fallback sem credenciais. Ativação v2
  remove todos os caches `safe-watch-` anteriores, inclusive static/navigation v1.
- Runtime cache aceita somente assets públicos em `/assets/`, `/icons/`,
  `/manifest.json` e módulos Vite `/src/`, `/node_modules/`, `/@`. Ignora respostas
  redirecionadas, `private` e `no-store`; APIs não são cacheadas mesmo como imagem.
- Middleware Start aplica `Cache-Control: private, no-store` a documentos/API,
  inclusive rejeições CSRF. O shell público usa `public, max-age=0, must-revalidate`.
  Isso complementa o worker, preservando autenticação/autorização no servidor.

**Validação executada com Node 22.23.2:**

| Comando / verificação                                                                                 | Resultado e alcance                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playwright, regressões antes da correção                                                              | HTML privado persistido e reapresentado após remoção de cookie/reload offline; API com destino imagem persistida. Falhas esperadas documentadas acima                                                                                                                            |
| `npm run test:e2e:sw-cache`                                                                           | **8/8 passaram**, Chromium: expiração sem cleanup, GET/API como imagem, migração de caches, assets públicos/headers/redirects, reabertura de inspeção, resposta e conclusão duráveis, fechamento de aba/reabertura, expiração local, logout, A/B e headers HTTP reais sem sessão |
| `playwright test e2e/session-query-cache.spec.ts e2e/offline-sync-errors.spec.ts --project=chromium`  | **18/18 passaram**: guards/cache autenticado, callbacks tardios e protocolo offline existente                                                                                                                                                                                    |
| Playwright adicional: teste HTTP/no-store/CSRF                                                        | **1/1 passou** após acrescentar a conferência explícita de rejeição CSRF 403 com no-store                                                                                                                                                                                        |
| `npm test`                                                                                            | **173/173 passaram**, zero falhas/skips                                                                                                                                                                                                                                          |
| `tsc --noEmit`                                                                                        | Exit 0, configuração oficial                                                                                                                                                                                                                                                     |
| TypeScript estrito dos dois novos E2Es, configuração temporária em `/tmp` estendendo tsconfig oficial | Exit 0                                                                                                                                                                                                                                                                           |
| `npm run lint`                                                                                        | Exit 0: zero erros, seis avisos preexistentes `react-refresh/only-export-components` nos componentes UI                                                                                                                                                                          |
| Prettier dos arquivos alterados (exceto routeTree gerado) e `git diff --check`                        | Aprovados; árvore de rotas produzida pelo gerador TanStack                                                                                                                                                                                                                       |
| `prisma validate`                                                                                     | Schema válido; nenhuma migration/alteração estrutural                                                                                                                                                                                                                            |
| `npm run build`                                                                                       | Exit 0: artefato Vercel gerado; worker v2, manifest/fallback/ícone, assets e rota shell incluídos. Headers Nitro de assets/manifest/SW/fallback preservados                                                                                                                      |

A suíte unitária tentou inicialmente abrir IPC do tsx dentro do sandbox e recebeu
`EPERM`; foi repetida com permissão de execução e passou. Houve falhas transitórias
na preparação dos novos E2Es (assets anteriores ao controle do worker, RPCs
sintéticos que ignoravam desconexão/logout e requisição API sem Origin para CSRF).
Os fixtures foram ajustados para aquecer assets sob controle, respeitar rede/
revogação e exercitar HTTP same-origin. O middleware foi colocado antes do CSRF
para acrescentar no-store também às rejeições. A execução final de oito testes
passou integralmente. Build manteve avisos existentes de `inputValidator`
obsoleto, diretivas `use client` ignoradas e chunk circular `pg-pool`/`pg`;
Playwright informou conflito de `NO_COLOR`/`FORCE_COLOR` e logs Vite de HMR/CSS
sem rede, sem impedir os cenários funcionais comprovados.

**Preservado:** manifest/instalação, cache público, escopo/registro/update do SW,
sessão offline com oito horas, segregação e limpeza de pacotes/fila,
snapshot histórico, respostas/conclusão locais, UUID/retry/idempotência e
limites das funcionalidades offline. O E2E histórico `offline-pwa.spec.ts` teve
as expectativas de cache atualizadas, mas **não foi executado contra Neon**.
O veredito **APPROVED WITH KNOWN LIMITATIONS** permanece vigente.

**Limites:** a SPA/guards/hooks/IndexedDB/worker são reais, mas dados e RPCs dos
novos fluxos autenticados são sintéticos. Headers sem sessão foram obtidos do
servidor real. Não se testou SSR com login/cookie reais, PostgreSQL/Neon,
Cloudinary, Vercel publicado, outros navegadores/dispositivos, reinício do processo
inteiro do browser ou revogação coordenada entre abas. Assets de uma tela precisam
estar disponíveis no cache para reabrir offline; não há pré-carga universal de
rotas. Guard/sessão local não revogam instantaneamente uma identidade remota
quando sem rede. Pacotes continuam acessíveis a quem controlar o perfil/sistema
operacional, e expiração não descarta a fila privada pendente. Criação integral
offline, evidências binárias, Background Sync, reconciliação assistida e políticas
administrativas continuam futuras. Nenhum merge, auto-merge ou deploy integra
esta correção; o PR é destinado à revisão humana.

### 3.4. Offline, idempotência, concorrência e projeção

O incremento persiste snapshots/pacotes de inspeções existentes, respostas/observações, projeção de NC e conclusão local. Não cria integralmente inspeção offline, não sincroniza ações/NCs como CRUD separado e não inclui binários de evidências. Operações têm UUID, sequência FIFO, dependências e revisão esperada; recuperar SYNCING mantém a identidade. O servidor calcula hash e grava mutação/OfflineSyncOperation na mesma transação; retry sequencial igual é deduplicado e identidade/hash divergentes geram conflito.

Essa proteção impede duplicação no cenário sequencial coberto, mas não garante resposta idempotente correta para duas transações simultâneas. Ambas podem ler revisão R antes de uma aguardar a outra no update da inspeção. O upsert posterior não testa R novamente. Uma PK impede duas confirmações iguais persistidas, mas uma tentativa concorrente pode falhar em UNIQUE em vez de retornar sucesso/conflict conforme o contrato. O isolamento não é explicitamente Serializable nessa transação; não foi consultada a configuração real do banco.

A conclusão usa update condicional de status em [InspectionRepository](../src/server/repositories/inspection.repository.ts), 363–405, e idempotência; a completude é conferida previamente no Service. Isso não prova atomicidade global entre conferência, salvamento e conclusão concorrentes.

Na confirmação cliente, uma operação antiga pode substituir a resposta projetada por uma edição mais nova. O payload dependente continua na fila e recebe a nova revisão remota. O defeito confirmado é a regressão da projeção, não eliminação comprovada do payload. Os testes existentes cobrem dependências/reload e conflito após alteração remota, sem pausa específica entre confirmações ou concorrência simultânea entre abas. Escrever “sincronização idempotente no cenário validado” é sustentado; escrever “consistência garantida entre dispositivos” não é.

#### Atualização posterior — remediação direcionada de IC-P6-04

Em 12 de outubro de 2026, `main`, `origin/main` e `FETCH_HEAD` foram conferidos em
`0da149ccf675da942cadc022da84f2003482bf8f`, após fetch remoto. A árvore inicial
estava limpa; a branch local/remota dedicada não existia. A implementação usa
`fix/ic-p6-04-sync-local-projection`, criada dessa base, sem usar `development`.

**Defeito reproduzido:** em `src/offline/sync-manager.ts`,
`synchronizeOperation` envia a operação A e `acknowledgeResponseOperation`
substituía a resposta inteira do pacote pelo retorno remoto, mesmo com B/C já
persistidas por `queueInspectionResponse` em `src/offline/inspection-store.ts`.
No teste, a confirmação de A reinstalou `NON_COMPLIANT`, observação antiga e NC
ativa sobre a edição local `COMPLIANT`, observação nova e NC ausente. Fechar e
reabrir a conexão IndexedDB confirmou a regressão persistida. A fila dependente
continuava existindo; não se demonstrou perda definitiva do payload.

O caminho remoto permanece `inspection-response.functions.ts` →
`InspectionResponseService.saveInspectionResponse` →
`InspectionResponseRepository.saveWithNonConformity` → transação Prisma.
UUID/usuário/inspeção/tipo/hash deduplicam o efeito remoto; `updatedAt` é a
revisão remota e `clientUpdatedAt` conserva o horário do dispositivo. Um retry
confirmado retorna a resposta **atual** do servidor, não um snapshot imutável
da primeira confirmação. Idempotência remota não protegia a projeção local.
Após confirmação, o evento em `database.ts` invalida queries em
`src/routes/__root.tsx`; `inspection-client.ts` lê o pacote enquanto há pendências.

**Invariante e correção:** pacote com alterações pendentes é a projeção local
autoritativa, como já estabelecido pela fachada de leitura, gravação transacional
local e encadeamento descritos em `AI/Offline.md` e `AI/Entities.md`. A confirmação
remove somente seu UUID e atualiza a revisão da próxima dependente. Se há edição
posterior do mesmo usuário/inspeção/item, a resposta/NC local inteira é preservada,
inclusive IDs e timestamps provisórios. A última confirmação desse item adota
resposta/NC, IDs e timestamps remotos. Estado local de conclusão e snapshot ficam
preservados; a presença de outras operações conserva `PENDING`. Confirmação cujo
UUID já foi removido é ignorada dentro da transação, antes de qualquer escrita.
A decisão usa a sequência da fila, sem comparar relógios local e remoto.

`synchronizeOperation` passou a admitir funções de transporte tipadas para os
testes; os chamadores existentes continuam usando as Server Functions originais.
Isso permite exercitar envio, confirmação, falha/retry e persistência reais sem
acessar banco remoto ou acrescentar dependências. O restante do protocolo, schema,
servidor, autenticação e classificação de erros não foi alterado.

**Estado posterior: RESOLVED no caminho local testado de IC-P6-04.** Foram
adicionados 13 testes ao arquivo existente `src/offline/inspection-store.test.ts`:
confirmação normal e revisão para a próxima edição; edição durante envio e
reabertura IndexedDB; três edições com preservação de NC e confirmação final;
resposta seguida de conclusão; outro item pendente; confirmação antiga duplicada
após confirmação da dependente; rejeições 409/401/422/500; retry de resultado
incerto com UUID/payload estáveis; falha de decodificação de resposta incompleta;
rollback de fila/dependências quando falha a gravação do pacote. Promises
controladas determinam a ordem, sem sleeps. Antes da correção, quatro cenários
falharam (17/21 aprovados); depois, os 22 testes de persistência offline passaram.

Validação com Node 22.23.2 e npm, sem instalar dependências:

- `npm exec -- tsx --test src/offline/inspection-store.test.ts`: 22/22 aprovados.
- `npm test`: 121/121 aprovados.
- `npm exec -- tsc --noEmit`: aprovado após ajustar a assinatura do mock de
  falha Dexie; a primeira execução apontou somente esse erro novo no teste.
- `npm run lint`: zero erros, seis avisos nos mesmos componentes de UI fora do escopo.
- `npm run build`: aprovado, com avisos de depreciação, bundling e tamanho de chunks.
- `git diff --check`: aprovado; o arquivo de rotas regenerado pelo build foi
  restaurado à base e não integra a correção.

O tsx exigiu execução autorizada fora da sandbox para seu IPC. Dexie foi exercitado
sobre `fake-indexeddb`, sem browser/E2E, Neon ou Cloudinary nesta tarefa. O teste
de resposta incompleta simula falha de decodificação lançada pelo transporte;
não valida todas as formas possíveis de um envelope de sucesso malformado.
Não houve migration, seed, reparo de dados, instalação ou deploy.

O manager envia novas operações dependentes em FIFO na mesma instância JS;
confirmação de B antes de A nesse caminho não é suportada. A chegada atrasada
testada é de uma segunda tentativa de A, iniciada antes de sua remoção, após B
já confirmada. Isso não homologa duas abas reais, múltiplos dispositivos ou
concorrência de transações PostgreSQL. A concorrência global, a conclusão
concorrente e IC-P6-03 permanecem fora desta remediação. O catch ainda classifica
falha local de confirmação como `NETWORK_ERROR` (IC-P9-03), conservando rollback
e retry; esse achado não foi remediado.

Recomenda-se considerar IC-P6-04 resolvido para a projeção/acknowledgement
demonstrados e manter homologação real entre abas/dispositivos como trabalho
separado. O inventário e as contagens anteriores, assim como a retrospectiva,
preservam a baseline histórica; nenhum outro achado tem seu status alterado por
esta atualização. Não se afirma ausência de todas as corridas offline.

### 3.5. Relatório e classificação de erros

O detalhe por ID admite PLANNED, IN_PROGRESS, COMPLETED ou CANCELLED se a inspeção própria tiver snapshot. A lista selecionável restringe COMPLETED. O DTO e o HTML mantêm status, pendentes e preenchimento; não renomeiam toda inspeção para concluída. [BusinessRules](../AI/BusinessRules.md), 621–630, explicita esse comportamento. É leitura parcial deliberadamente documentada, com política visual ainda aperfeiçoável, não autorização por ID sem ownership. Os testes atuais não exercitam todos os estados. O TCC deve distinguir relatório de leitura de documento final e não alegar gate de conclusão no detalhe.

Validators e exceções inesperadas podem escapar de Result; isso é reconhecido em [API](../AI/API.md), 122–130. O defeito operacional concreto é o catch de sincronização classificar igualmente rede, erro lançado pelo servidor e falha local na confirmação como NETWORK_ERROR. Envelope 409 bloqueia CONFLICT, 401/422 bloqueiam ERROR, demais falhas entram em retry limitado. Não há evidência de repetição automática de upload/criação não idempotente por esse manager: suas operações são respostas/conclusão com UUID. Generalizar retries inseguros para toda a aplicação seria extrapolação.

### Atualização posterior — remediação direcionada de IC-P9-03

Investigação em 12 de outubro de 2026, a partir de `main`/`origin/main`
`a53defbcf8014893ec3c64987609c67b68942d53`. Após `git fetch origin`, também
`development`/`origin/development` apontavam para esse SHA; árvore limpa, sem
divergência. A branch dedicada é `fix/ic-p9-03-sync-error-classification`.
O inventário original e os relatos anteriores preservam a baseline histórica.

**Defeito reproduzido:** `synchronizeOperation` envolvia chamada remota e
confirmação Dexie no mesmo catch, convertendo qualquer exceção em
`NETWORK_ERROR`/retry. O caso incluía `Error` inesperado, `TypeError` lançado pela
função remota, erro de serialização, rejeição não-Error, `SyntaxError` de
decodificação e rollback da confirmação local. Rejeições Result `403` e `404`
também entravam no retry genérico. Antes de alterar código de produção, a suíte
focada passou em 20/28 testes: **oito falharam**, pois receberam `PENDING` quando
o contrato exigia bloqueio `ERROR`. A baseline completa passou em 121/121 testes,
com zero erros/seis avisos de lint e build aprovado.

A investigação leu `createServerFn.ts`, `client-rpc/serverFnFetcher.ts` e
`server-functions-handler.ts` do TanStack instalado. A serialização ocorre antes
do fetch; depois dele, o runtime decodifica e pode relançar erros do servidor.
O `fetch` por chamada é suportado pelos tipos e pelo runtime instalado. Não é
seguro distinguir a origem somente pelo tipo/nome/mensagem de uma exceção
capturada ao redor de toda a chamada. A documentação de
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions)
também registra `TypeError` para causas além de indisponibilidade de rede.

**Estado posterior: RESOLVED para a classificação e política demonstradas.**
O manager fornece um fetch específico às duas operações e separa a confirmação
local da chamada/validação do resultado. Não houve alteração de servidor,
schema, idempotência ou dependências instaladas.

| Evidência da falha                                                                        | Classificação / política                                  |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Rejeição do fetch com TypeError e mensagem de transporte reconhecida                      | NETWORK_ERROR; PENDING/backoff, ERROR na quinta tentativa |
| HTTP não exitoso                                                                          | HTTP_ERROR com status real; corpo não persistido          |
| HTTP/Result 409                                                                           | CONFLICT, sem retry automático ou liberação manual        |
| HTTP/Result 408, 429 e 5xx                                                                | Retry limitado, separado de NETWORK_ERROR                 |
| Outras rejeições Result/HTTP, incluindo 401/403/404/422                                   | ERROR, exige intervenção                                  |
| Exceção remota/wrapper, serialização, validação ou decodificação sem envelope reconhecido | SYNC_EXCEPTION / ERROR                                    |
| Envelope ou campos essenciais da confirmação inválidos                                    | INVALID_SYNC_RESPONSE / ERROR                             |
| Falha na confirmação Dexie                                                                | LOCAL_PERSISTENCE_ERROR / ERROR, com rollback             |

Uma tentativa incrementa o contador uma vez; payload, UUID, sequência e
dependências são preservados na falha. Erros bloqueados não avançam FIFO.
Retry manual continua repondo ERROR em PENDING e zerando tentativas; sucesso
idempotente remove a operação apenas após confirmação local. Falha ao persistir
o próprio diagnóstico propaga e conserva o trabalho interrompido para recuperação
após restaurar o armazenamento. Mensagens de exceções/corpos HTTP não são
persistidos; Result conserva a mensagem do contrato existente.

Validação final com Node 22.23.2, sem instalar dependências:

- `npm exec -- tsx --test src/offline/inspection-store.test.ts`: **55/55**.
- `npm test`: **154/154**, incluindo os 33 novos testes de classificação,
  backoff/exaustão, confirmação inválida, conclusão, rollback, fila e recuperação.
- `npm exec -- playwright test e2e/offline-sync-errors.spec.ts --project=chromium`:
  **11/11**, usando fetch/IndexedDB reais, módulos cliente compilados e decoder
  TanStack instalado; todos os RPCs de teste são interceptados.
- `npm exec -- tsc --noEmit`: aprovado.
- Typecheck adicional incluindo o novo E2E em configuração temporária que
  estende o tsconfig oficial: aprovado; nenhuma mudança no tsconfig do projeto.
- `npm run lint`: zero erros e os mesmos seis avisos da baseline, sem novos avisos.
- `npm run build`: aprovado; comparação com a baseline não encontrou novas
  categorias de avisos (inputValidator depreciado, chunks e bundling).
- `git diff --check`: aprovado; rotas geradas pelo build restauradas à base,
  sem integrar a correção.

No Chromium, a primeira chamada abortada permanece PENDING/NETWORK_ERROR,
sobrevive ao reload e é confirmada com o mesmo UUID. HTTP 401/403/404/409/422/
500/503 segue a política acima. Um TypeError `Failed to fetch` serializado pelo
runtime fica em ERROR/SYNC_EXCEPTION; JSON truncado e sucesso sem data não removem
o registro. O harness usa página estática e fornece a base RPC normalmente
substituída pelo bundler; a primeira execução falhou no carregamento desse
harness antes dos cenários, e passou após corrigir seu bootstrap. O primeiro
lint paralelo ao Playwright encontrou ENOENT na pasta transitória test-results;
a execução sequencial final passou. A sandbox exigiu autorização para IPC tsx,
servidor local e Chromium. Não houve operação de banco remoto, migration, seed,
reparo de dados ou deployment manual. O E2E histórico que cria dados no Neon não
foi executado nesta tarefa.

**Limites:** os testes de browser validam o caminho cliente/decoder e uma fila
sintética no IndexedDB, sem autenticação ou mutações reais no servidor. As
falhas Dexie foram injetadas em fake-indexeddb; homologação de quota real,
produção, Firefox/Safari, múltiplas abas/dispositivos e concorrência PostgreSQL
permanece pendente. Mensagens de transporte variam e podem indicar bloqueio por
política; não comprovam indisponibilidade da internet. Falhas não reconhecidas,
incluindo interrupção durante decodificação, exigem retry manual. A checagem de
campos essenciais não é validação integral de todos os DTOs históricos. Esta
remediação **não elimina todas as possíveis falhas/corridas offline**. IC-P6-03,
IC-P9-01 e IC-P6-04 não recebem nova remediação nem alteração de status.

Arquivos diretamente envolvidos: `src/offline/sync-manager.ts`,
`src/offline/sync-transport.ts`, `src/offline/sync-result.ts`,
`src/offline/inspection-store.test.ts`, `e2e/offline-sync-errors.spec.ts`,
`AI/Offline.md`, `AI/Architecture.md`,
`Documentation/diagrams/flows/offline-inspection.puml` e este relatório.
Contrato detalhado em
[Offline.md](../AI/Offline.md#classificação-de-falhas-e-retry--ic-p9-03).
A correção deve ser integrada somente por PR para main após revisão humana.

### Atualização posterior — investigação e remediação direcionada de IC-P6-03

**Data:** 12 de outubro de 2026 (America/Fortaleza).

**Baseline verificada:** `2321b06a9dce39ec9705f4b618abf3a00b18ab7a`.
Diretório inicial: `/home/pedrovitor237/Documents/GitHub/safe-watch-insight`;
branch inicial `development`, árvore/índice limpos e nenhum arquivo não rastreado.
Após `git fetch origin`, `main`, `origin/main`, `development` e
`origin/development` tinham esse SHA; diferenças de ancestralidade `0/0`.
A branch `fix/ic-p6-03-inspection-conclusion-atomicity` não existia localmente
nem em origin e foi criada de `origin/main`. Nenhuma alteração em main ou
development foi necessária. Integração somente por PR para main, sem merge
ou auto-merge nesta tarefa.

O registro original é **“Concorrência de revisão/sync entre abas/dispositivos;
Fase 6 §16 / Fase 9 linha 265”**, classificado como `POTENTIAL_RISK`. Sua evidência
textual exata na tabela histórica é:

> saveWithNonConformity, 129–164, compara revisão antes de update/upsert; 164–191,
> upsert sem condição de revisão. [sync-manager](../src/offline/sync-manager.ts),
> 19–40: mutex local/reset. Transação e registro idempotente existem, mas não CAS
> da resposta. Teste de conflito do E2E é sequencial; corrida mesma revisão/UUID
> não executada.

**Resultado da investigação:** defeitos confirmados nos Services/Repositories
reais com persistência simulada determinística. A conclusão com obrigatórios
ausentes **não foi estabelecida** no fluxo público original: snapshot é imutável,
não há exclusão pública de resposta nem status remoto de resposta pendente,
e `NOT_APPLICABLE` é válido. O UPDATE condicional da inspeção já precedia o
upsert, bloqueando gravação nova após conclusão. Uma leitura anterior à gravação
do último obrigatório podia rejeitar conservadoramente a conclusão.

A falha concreta era a ordem das leituras: A e B consultavam UUID/revisão antes
de bloquear a inspeção. Ambas liam revisão R (ou ausência), A obtinha o bloqueio,
gravava resposta/NC/confirmação e fazia commit; B obtinha o bloqueio depois,
mas não reconsultava R, sobrescrevendo a resposta. UUID igual podia causar
`P2002` após a segunda tentativa de inserção, com rollback da segunda transação.
Na conclusão offline, dois pedidos com mesmo UUID podiam ler ausência de
confirmação; o primeiro concluía e o segundo retornava `CONFLICT` pelo estado,
em vez de recuperar a confirmação idempotente.

**Invariante e estratégia:** inspeção própria ativa só conclui em estado
elegível, com snapshot e todos os obrigatórios respondidos. Uma nova resposta
nunca altera inspeção concluída/cancelada; retry confirmado não é nova mutação.
Gravação e conclusão adquirem `SELECT ... FOR UPDATE` na mesma linha de Inspection
com ID/usuário/deletedAt, **antes** de ler confirmação ou revisão. Transações
fixam `ReadCommitted`; quem espera consulta o estado confirmado pelo commit
anterior. O bloqueio é mantido até commit/rollback. Completude e estado são
validados pelo callback do Service dentro da transação de conclusão, preservando
as camadas e o contrato público. `updatedAt` da resposta é explicitamente
`max(Date.now(), revisão anterior + 1 ms)`, evitando revisão repetida quando
escritas compartilham um milissegundo ou o relógio retrocede. `clientUpdatedAt`
continua horário do dispositivo. Sem alterações de schema/migrations.

Essa conclusão depende do bloqueio compartilhado e de leituras posteriores à
espera, não apenas de agrupar operações em uma transação. Referências primárias:
[PostgreSQL — Read Committed](https://www.postgresql.org/docs/current/transaction-iso.html#XACT-READ-COMMITTED),
[PostgreSQL — bloqueios de linha](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-ROWS)
e [Prisma — transações e isolamento](https://www.prisma.io/docs/orm/fundamentals/transactions).
O isolamento remoto preexistente não foi consultado; os caminhos corrigidos
definem explicitamente o nível necessário.

| Cenário                                    | Antes, no código original                                                               | Depois                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Dois UUIDs, mesma revisão                  | Ambos persistiam; segunda escrita substituía a primeira                                 | Uma escrita; segunda retorna CONFLICT sem mutação/confirmação |
| Dois UUIDs, ausência esperada              | Ambos persistiam pelo upsert                                                            | Uma criação; segunda retorna CONFLICT                         |
| Mesmo UUID/hash de resposta simultâneo     | Segunda tentativa lançava P2002                                                         | Ambos retornam sucesso; uma mutação/confirmação               |
| Mesmo UUID/hash de conclusão simultâneo    | Segunda tentativa retornava CONFLICT                                                    | Ambos retornam sucesso; uma confirmação                       |
| Relógio na mesma revisão                   | Token podia permanecer igual                                                            | Revisão aumenta pelo menos 1 ms                               |
| Gravação detém bloqueio antes da conclusão | Completude era lida antes da transação; podia rejeitar o último obrigatório em gravação | Conclusão aguarda e valida resposta confirmada                |
| Conclusão detém bloqueio antes da gravação | UPDATE condicional já rejeitava gravação                                                | Continua rejeitando com CONFLICT; nenhuma resposta é alterada |

Os quatro primeiros testes falharam antes de qualquer alteração de implementação.
Os cinco testes finais de regressão (incluindo revisão/relógio) foram também
executados contra cópia temporária do commit original: **0/5 aprovados, 5/5
falhas esperadas**, sem testes cancelados. Na correção, os **19 testes** do novo
arquivo passam. Barreiras de Promise controlam leitura, disputa do bloqueio e
commit; não há sleeps. O modelo reproduz visibilidade Read Committed, bloqueio
do UPDATE/FOR UPDATE e descarte de escrita em rollback. Não é uma instância
PostgreSQL real nem uma homologação entre dispositivos.

Cobertura adicional: gravação do último obrigatório e edição de resposta antes
da conclusão; rejeição de gravação online/offline depois que conclusão obtém
bloqueio; conclusões distintas online/offline; UUID usado para outro tipo;
retry de resposta após conclusão e hash divergente; outro usuário nos dois
caminhos; snapshot/obrigatórios ausentes; N/A com opcional pendente;
COMPLETED/CANCELLED; rollback de resposta, NC, estado e conclusão quando falha
a confirmação, seguido de retry. Contratos de validação/sessão/ownership das
Server Functions permanecem os existentes.

**Validação obtida com Node 22.23.2:**

| Verificação                                                                                | Resultado                                                                                      |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Baseline `npm test`                                                                        | 154/154 aprovados                                                                              |
| Cinco regressões finais contra 2321b06                                                     | 5 falhas esperadas, comprovando o comportamento anterior                                       |
| Focados: concorrência, inspeção/respostas, autorização, store offline, hash e schemas      | 116/116 aprovados                                                                              |
| `npm test`                                                                                 | 173/173 aprovados, incluindo 19 testes novos                                                   |
| `npm exec -- tsc --noEmit`                                                                 | Aprovado                                                                                       |
| Typecheck ampliado somente para incluir offline-sync-errors.spec.ts                        | Aprovado; configuração temporária, sem mudança no tsconfig do projeto                          |
| `npm run lint`                                                                             | Aprovado, zero erros; os mesmos seis warnings react-refresh em arquivos UI não alterados       |
| `npm run build`                                                                            | Aprovado; artefato Vercel local, sem comando de deploy                                         |
| Chromium: `npm exec -- playwright test e2e/offline-sync-errors.spec.ts --project=chromium` | 13/13 aprovados: 11 anteriores e 2 de conclusão                                                |
| `git diff --check`                                                                         | Aprovado                                                                                       |
| Prettier dos arquivos alterados                                                            | Aprovado                                                                                       |
| Prettier global antes/depois                                                               | Apenas .lovable/plan.md e CHECKLIST_VERSIONING_ARCHITECTURE.md, sem alterações nesses arquivos |

O build conserva avisos de inputValidator depreciado, diretivas use client
ignoradas, chunks acima de 500 kB, imports externos não usados, opção platform
desconhecida e chunk circular pg/pg-pool. As 133 linhas de padrões de warning
normalizadas coincidem com o log da baseline sincronizada `/tmp/swi-pr4-build.log`;
nenhum padrão novo foi observado. O gerador do router reordenou routeTree.gen.ts
durante build/dev; essa alteração gerada foi restaurada ao conteúdo original
e não integra o diff. Logs de execução nesta sessão: `/tmp/ic-p6-03-*.log`.

Arquivos diretamente relacionados, e somente eles:

- `src/server/repositories/inspection-mutation-lock.ts`: bloqueio compartilhado.
- `src/server/repositories/inspection-response.repository.ts`: ordem de bloqueio/leitura e revisão estritamente crescente.
- `src/server/repositories/inspection.repository.ts`: conclusão transacional com validação do Service.
- `src/server/services/inspection-response.service.ts`: regras de conclusão no callback transacional.
- `src/server/repositories/inspection-concurrency.test.ts`: reprodução/regressões determinísticas e rollback.
- `src/server/services/inspection-response.service.test.ts`: adapter de teste para a conclusão transacional.
- `src/server/services/authorization.service.test.ts`: adapter de teste com ownership da nova operação.
- `e2e/offline-sync-errors.spec.ts`: confirmação de conclusão e retenção de conflito na fila.
- `package.json`: inclui regressões no comando npm test, sem dependências novas.
- `AI/Architecture.md`, `AI/BusinessRules.md`, `AI/API.md`, `AI/Offline.md`: contrato e estratégia atualizados.
- `Documentation/RelatorioAuditoriaTecnicaPreEscritaTCC.md`: esta evidência posterior, conservando a auditoria histórica.

**Limites para revisão:** não foram executados migrations, seeds, operações
remotas de banco, deploys ou os E2E que escrevem fixtures no Neon. O Chromium
usa RPCs interceptados e URL de banco local inutilizável; verifica protocolo
cliente, sem exercitar o SQL. Permanecem sem homologação concorrência real
PostgreSQL/Neon, duas abas/dispositivos, carga/latência/timeout/deadlocks e
colisão deliberada de UUID entre inspeções distintas. Escritas diretas sem
metadados continuam sem comparação otimista de revisão. Escritas externas
ao protocolo dos Repositories, inclusive exclusão manual de resposta, não são
protegidas por este bloqueio na aplicação. Qualquer caminho futuro que altere
respostas/snapshot/estado deve participar do mesmo protocolo. NCs/ações/evidências
continuam tratáveis após conclusão, como antes. Não se declara suporte offline
completo nem ausência de todas as corridas de produção.

Somente IC-P6-03 recebe correção nesta branch; IC-P9-04 e demais achados
permanecem fora do escopo. O estado da tabela original é histórico; os casos
confirmados acima têm correção testada aguardando integração/revisão humana.
SHA final, branch remota, PR e CI são registrados na submissão e no relatório
de entrega; abertura de PR não autoriza merge.

### 3.6. Registros históricos adicionais, fora dos 14

| Registro         | Estado e evidência                                                                                                                                                                                                                                        | Limite da conclusão                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| HIST-COPY-P2003  | RESOLVED no caminho válido: [ChecklistRepository](../src/server/repositories/checklist.repository.ts), 149–196, usa UUIDs e inserts em lote; [OfficialTemplates](../AI/OfficialTemplates.md), 424–460, registra validação final de cópias normais no Neon | Não foi reproduzido hoje. P2003 deliberado por norma inexistente é teste negativo de rollback, não retorno do defeito |
| HIST-MURBACH     | RESOLVED no catálogo/exibição/novas cópias: [ChecklistCopy](../AI/ChecklistCopy.md), 199–213, explica errata de páginas 72–74 e preservação do histórico                                                                                                  | Publicação/snapshot antigo continuam com descrição original; não alegar reescrita retroativa                          |
| HIST-TS-AMPLIADO | INSUFFICIENT_EVIDENCE para afirmar resolução: [OfficialTemplates](../AI/OfficialTemplates.md), 466–473, registra 30 diagnósticos históricos fora do tsconfig oficial                                                                                      | Typecheck oficial passou hoje, mas exclui scripts/E2E; configuração ampliada não foi reexecutada                      |

Esses estados não alteram as contagens da seção 1. A resolução do advisory TanStack também é adicional ao conjunto dos 14.

## 4. Auditoria de segurança de dependências

### 4.1. Versões efetivamente resolvidas

[package.json](../package.json) fixa Start/Router/Plugin; [package-lock.json](../package-lock.json) versão 3 é consistente com o manifesto atual. npm ls confirmou árvore válida e deduplicada para esses pacotes. Conferência das 607 entradas instaladas do lock não encontrou versão divergente; os 141 pacotes sem instalação são opcionais, incluindo variantes de plataforma. Essa comparação não verifica integridade criptográfica de cada arquivo instalado.

| Pacote                             | Versão npm instalada/lockfile |
| ---------------------------------- | ----------------------------- |
| @tanstack/react-start              | 1.168.60                      |
| @tanstack/start-server-core        | 1.169.39                      |
| @tanstack/react-router             | 1.170.41                      |
| @tanstack/router-plugin            | 1.168.42                      |
| @tanstack/router-core              | 1.171.34                      |
| @tanstack/start-plugin-core        | 1.171.49                      |
| @tanstack/start-client-core        | 1.170.34                      |
| @tanstack/react-start-client       | 1.168.39                      |
| @tanstack/react-start-server       | 1.167.46                      |
| @tanstack/react-start-rsc          | 0.1.59                        |
| @tanstack/router-generator         | 1.167.40                      |
| @tanstack/start-storage-context    | 1.167.36                      |
| @tanstack/react-query / query-core | 5.101.2                       |

Não há segunda cópia vulnerável de Start/Core na árvore npm conferida. Versões diferentes entre componentes TanStack não significam, por si, incompatibilidade: os próprios pacotes fixam versões distintas da cadeia; npm ls e typecheck oficial passaram. Zod 4.6.5 aparece aninhado em ferramentas TanStack; os schemas do aplicativo usam a instalação Zod da raiz. A coexistência não foi classificada como vulnerabilidade.

O [bun.lock](../bun.lock), linhas 37–39 e 493–519, conserva Router 1.168.25, Start 1.167.50, Plugin 1.167.28 e Core 1.167.22. Isso já foi reconhecido no corpo do PR #2. **POST-01 — CONFIRMED_DEFECT de consistência/reprodução de lockfiles**, adicional aos 14 concerns: não é prova de que o deploy atual tenha usado Bun ou pacote vulnerável. Uma instalação congelada pode rejeitar a divergência; uma ferramenta que reutilize essas resoluções poderia reintroduzir versões afetadas. Nenhuma instalação Bun foi feita, portanto o resultado concreto desse caminho permanece não verificado.

### 4.2. Advisory anteriormente bloqueante

**SEC-START-01 — RESOLVED na instalação npm auditada.** O [advisory oficial TanStack](https://github.com/TanStack/router/security/advisories/GHSA-qx66-fv34-fjm8) identifica XSS refletido sem autenticação no transporte de Server Functions, GHSA-qx66-fv34-fjm8 / CVE-2026-102989, severidade crítica. As faixas relevantes são Start >=1.143.12 e <1.168.60, Core >=1.143.12 e <1.169.39; as primeiras versões corrigidas são justamente 1.168.60 e 1.169.39.

A versão anterior 1.168.26 consta no histórico do PR #2; as versões atuais estão fora das faixas afetadas. A defesa é a atualização do transporte, não a suposição de que ownership/bcrypt eliminariam XSS. O npm atual não reporta Start/Core nesse advisory. O status de implantação do HEAD é sucesso, conforme seção 5. Não foi explorado o endpoint; não foi usado o bypass de segurança mencionado na solicitação.

O risco permanece **para reproduções baseadas no lockfile Bun antigo**, cuja Start/Core está dentro das faixas do mesmo advisory. A resolução npm não autoriza afirmar que todo artefato/lockfile histórico foi corrigido.

### 4.3. Contagens e distinção entre ferramentas

| Fonte                                 | Resultado atual verificável                                                                                                                                           | Limite                                                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| npm audit do package-lock atual       | 19 entradas: 14 altas, 5 moderadas, 0 críticas/baixas/informativas                                                                                                    | Inclui transitivas e metavulnerabilidades; não é contagem de rotas exploráveis                                        |
| Advisories próprios do inventário npm | 19 GHSA distintos recuperados via API; pacotes agregadores também herdam esses GHSA                                                                                   | A coincidência numérica não torna as duas contagens equivalentes                                                      |
| Baseline de 20 → 19                   | Registrado no PR #2 como comparação executada em Node 22.23.2                                                                                                         | Não se reexecutou audit do lockfile anterior; não se certifica hoje igualdade de cada alerta com a baseline histórica |
| Dependabot                            | Consulta aberta com per_page=100 retornou HTTP 403: “Dependabot alerts are disabled for this repository”; ferramenta também informou escopo admin:repo_hook requerido | Não se obteve lista ou contagem atual de alertas GitHub; não houve mudança de configuração/autorização                |
| Vercel                                | Status success / Deployment has completed no HEAD                                                                                                                     | A aprovação do deployment não substitui npm audit ou testes de segurança                                              |

A lista npm abaixo é completa para a consulta feita nesta data, mas não é exportação Dependabot. A base de advisories pode mudar. As versões atuais das entradas npm estão nas faixas reportadas; para entradas herdadas, o pacote tem faixa de metavulnerabilidade atribuída pelo npm, não CVE próprio.

### 4.4. Análise individual das 19 entradas de pacote

D = dependência direta no manifesto; T = transitiva. “Dev/build” descreve o caminho efetivamente identificado, não apenas o campo dev do lockfile. Mesmo uma transitiva classificada como produção pode vir do peer da CLI Prisma ou do plugin de build. Todas as entradas abaixo permanecem **presentes no inventário npm**; aplicabilidade explorável à aplicação é analisada separadamente.

| Pacote/versão afetada                   | Nível npm / relação                | Advisory próprio ou cadeia                                    | Aplicabilidade observada/inferida                                                                                                                                                                                                | Correção disponível e compatibilidade                                                                                                     |
| --------------------------------------- | ---------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| @lovable.dev/vite-tanstack-config 2.6.2 | Moderada; D dev                    | lovable-tagger → Tailwind 3 → parsers/globs                   | Configuração Vite; componentes de tagging são de desenvolvimento. Não há exploração remota da aplicação demonstrada.                                                                                                             | npm indica fixAvailable=true sem versão-alvo. Revisar release da configuração com TanStack/Nitro/Vite atuais; compatibilidade não testada |
| @prisma/config 7.9.1                    | Alta; T                            | deepmerge-ts / GHSA-ggr8-5vv4-36mx                            | Configuração da CLI/geração; não foi identificado merge recursivo de payload de inspeção nesse pacote. Risco de execução de ferramentas, condicionado à entrada                                                                  | Patch upstream do deepmerge 8.0.0; npm sugere Prisma 6.19.3. Downgrade major não é remediação comprovadamente compatível                  |
| baseline-browser-mapping 2.10.40        | Moderada; T                        | GHSA-w5vr-8v7q-w6rv                                           | Entrada inválida pode terminar processo; cadeia browserslist/Babel, usada em ferramentas. Nenhum campo da aplicação encaminhado diretamente a esse parser foi identificado                                                       | 2.11.0; atualização transitiva em faixa, condicionada à cadeia e regressão do build                                                       |
| brace-expansion 1.1.18 e 5.0.9          | Alta; T dev                        | GHSA-q2hr-2g5m-vwhr; GHSA-qhr7-859c-m2p7; GHSA-6j4f-fj2g-mc7p | CPU/stack com padrões maliciosos; minimatch/TypeScript-ESLint. Ambas as cópias instaladas são afetadas; não houve endpoint com glob arbitrário identificado                                                                      | Para cobrir os três: 1.1.21 e 5.0.12 nas linhas atuais. Plausível atualização patch; ainda exige validação dos consumidores               |
| braces 3.0.3                            | Alta; T dev                        | GHSA-vfj7-8cjw-p6xm                                           | Stack exhaustion em padrões aninhados; micromatch/chokidar da cadeia de tooling. Sem exploração demonstrada em requisição de SST                                                                                                 | Advisory informa **nenhum patch**. fixAvailable=true do npm pode mudar/remover a cadeia; não prova existência de braces corrigido         |
| browserslist 4.28.4                     | Alta; T                            | GHSA-c83g-rgw3-j3cx; GHSA-73wf-gq98-2v4g                      | Crescimento de memória; crash/escrita de protótipo por estatísticas customizadas. Cadeia Babel/build; arquivos/consultas maliciosos seriam pré-condição                                                                          | 4.28.7 cobre ambos; provável atualização patch, sem validação nesta tarefa                                                                |
| chokidar 3.6.0 em lovable-tagger        | Alta; T dev                        | Herda braces                                                  | Watcher de desenvolvimento. A outra cópia 5.0.0 não é a entrada apontada; não declarar todo chokidar vulnerável                                                                                                                  | Atualizar/remover dependência de tagging e sua cadeia; npm não fornece versão-alvo. Migração major de watcher pode alterar APIs           |
| deepmerge-ts 7.1.5                      | Alta; T                            | GHSA-ggr8-5vv4-36mx                                           | Stack exhaustion em grafos recursivos; consumido por @prisma/config. Não foi identificado uso direto por Services                                                                                                                | 8.0.0 é major do pacote; validar upstream Prisma 7, não aplicar downgrade da CLI sugerido automaticamente                                 |
| fast-glob 3.3.3                         | Alta; T dev                        | micromatch → braces                                           | Descoberta de arquivos na cadeia Tailwind 3/tagging; não há glob de entrada de inspeção identificado                                                                                                                             | Resolver consumidor/cadeia; npm indica fix sem versão. Não se atribui CVE próprio ao agregador                                            |
| fast-uri 3.1.5                          | Alta; T                            | Seis GHSA de canonicalização/authority/SSRF, listados abaixo  | Cadeia ajv → @prisma/streams-local → @prisma/dev → Prisma CLI. Não é o fetch de evidências nem validação de URLs do backend SST; caminho remoto de SSRF não demonstrado                                                          | 3.1.8 cobre os seis advisories da linha 3. Atualização patch potencialmente compatível; validar CLI/cadeia                                |
| js-yaml 4.3.1                           | Alta; T                            | GHSA-2883-xcg3-v3hh                                           | CPU no tratamento de merges YAML; ESLint e xmlbuilder2/start-plugin-core. Upload aceita imagem, não YAML; entrada de usuário nesse parser não identificada                                                                       | 4.3.2 na linha instalada; atualizar dependência e testar ferramentas/build                                                                |
| lovable-tagger 1.2.0                    | Moderada; T dev                    | Tailwind 3 e sua cadeia                                       | Instrumentação de desenvolvimento, documentada na configuração Vite. Não demonstrada inclusão do tagging no servidor de produção                                                                                                 | npm indica fix sem versão; revisar upstream @lovable/config/tagger e compatibilidade do desenvolvimento                                   |
| micromatch 4.0.8                        | Alta; T dev                        | braces                                                        | Globs de fast-glob/Tailwind 3; sem execução web com glob arbitrário identificada                                                                                                                                                 | Atualizar/substituir cadeia com eliminação da dependência afetada; sem patch braces informado                                             |
| mysql2 3.15.3                           | Alta; T                            | GHSA-3f6p-5ww8-9rcr; GHSA-rgwj-5xj2-c3m3                      | Downgrade de plugin pode revelar senha MySQL; descompressão pode causar DoS. Aplicação usa PostgreSQL/PrismaPg, não conecta MySQL. Não aplicável ao caminho PostgreSQL inspecionado; pacote ainda está instalado pela CLI Prisma | 3.23.1 cobre ambos. npm sugere Prisma 6.19.3, incompatibilidade potencial com stack Prisma 7; requer solução upstream/validada            |
| postcss-nested 6.2.0                    | Moderada; T dev                    | postcss-selector-parser                                       | CSS processado pela cadeia Tailwind 3/tagging; nenhum CSS arbitrário submetido por usuários foi identificado                                                                                                                     | Corrigir parser/consumidor; major do parser pode exigir nova versão do plugin                                                             |
| postcss-selector-parser 6.1.4           | Moderada; T dev                    | GHSA-rj75-hqrm-r3gf                                           | Complexidade quadrática em seletores; caminho CSS/build, sem formulário de CSS customizado                                                                                                                                       | 7.1.6; major a partir de 6.1.4. Preferir consumidor compatível e validar build, não assumir override seguro                               |
| prisma 7.9.1                            | Alta; D dev, também peer de client | @prisma/config/deepmerge-ts e mysql2                          | CLI/build; o advisory agregado não significa falha automaticamente em toda consulta @prisma/client/adapter-pg                                                                                                                    | npm propõe 6.19.3 e isSemVerMajor=true. Não aplicar automaticamente: gerador, client, adapter e configuração atuais são Prisma 7          |
| source-map-js 1.2.1                     | Alta; T                            | GHSA-68fv-2mgg-jv7q                                           | DoS de event loop por seções de source map; cadeia PostCSS/@tailwindcss/node. Build pode ser afetado por mapas hostis; endpoint de mapa fornecido pelo usuário não identificado                                                  | 1.2.2; atualização patch plausível, sem regressão executada                                                                               |
| tailwindcss 3.4.19 em lovable-tagger    | Alta; T dev                        | chokidar, fast-glob, micromatch, postcss-nested e parser      | Esta entrada é a cópia aninhada antiga. O Tailwind raiz **4.3.1** não é a cópia vulnerável apontada pelo audit                                                                                                                   | Atualizar/remover consumidor de Tailwind 3; não confundir com atualizar Tailwind 4 da aplicação. npm não forneceu plano validado          |

A inspeção da aplicabilidade é estática. “Caminho não identificado” significa que não foi encontrada ligação do input SST ao componente vulnerável nas fontes examinadas, não prova universal de inexplorabilidade. Dependências de ferramentas continuam relevantes se executarem entradas/repositórios/configurações não confiáveis ou forem incorporadas por outro caminho.

### 4.5. Identificadores, faixas e patches dos advisories próprios

Os dados abaixo vieram das respostas gh api advisories/{GHSA}. As faixas indicadas cobrem as linhas instaladas; no caso de brace-expansion foram preservadas as linhas 1 e 5 relevantes, e em fast-uri a linha 3. Todas as versões afetadas correspondentes da seção anterior estão dentro dessas faixas.

| Advisory                                                                 | CVE             | Gravidade na API GitHub | Faixa afetada e primeira versão corrigida                  |
| ------------------------------------------------------------------------ | --------------- | ----------------------- | ---------------------------------------------------------- |
| [GHSA-w5vr-8v7q-w6rv](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv) | CVE-2026-45819  | Moderada                | `>= 2.0.0, < 2.11.0` → 2.11.0                              |
| [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) | CVE-2026-102277 | Moderada                | `>= 4.0.0, < 5.0.12` → 5.0.12; `< 1.1.21` → 1.1.21         |
| [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) | CVE-2026-102278 | Alta                    | `>= 4.0.0, < 5.0.11` → 5.0.11; `< 1.1.20` → 1.1.20         |
| [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | CVE-2026-102276 | Alta                    | `>= 4.0.0, < 5.0.10` → 5.0.10; `< 1.1.19` → 1.1.19         |
| [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | CVE-2026-93687  | Alta                    | `<= 3.0.3` → sem patch informado                           |
| [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) | CVE-2026-73089  | Alta                    | `<= 4.28.6` → 4.28.7                                       |
| [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g) | CVE-2026-73088  | Alta                    | `<= 4.28.6` → 4.28.7                                       |
| [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) | CVE-2026-40345  | Alta                    | `< 8.0.0` → 8.0.0                                          |
| [GHSA-5jgf-p345-68v8](https://github.com/advisories/GHSA-5jgf-p345-68v8) | CVE-2026-75931  | Alta                    | `>= 3.1.3, < 3.1.6` → 3.1.6                                |
| [GHSA-f65p-4m7j-42xc](https://github.com/advisories/GHSA-f65p-4m7j-42xc) | CVE-2026-75975  | Alta                    | `>= 3.0.0, < 3.1.6` → 3.1.6                                |
| [GHSA-fph4-wmhf-6fwf](https://github.com/advisories/GHSA-fph4-wmhf-6fwf) | CVE-2026-75899  | Alta                    | `>= 3.1.2, < 3.1.6` → 3.1.6                                |
| [GHSA-jqff-g426-hqxp](https://github.com/advisories/GHSA-jqff-g426-hqxp) | CVE-2026-76172  | Alta                    | `>= 3.0.0, < 3.1.6` → 3.1.6                                |
| [GHSA-qw65-cvwx-89v3](https://github.com/advisories/GHSA-qw65-cvwx-89v3) | CVE-2026-84292  | Alta                    | `>= 3.0.0, < 3.1.7` → 3.1.7                                |
| [GHSA-hrr3-gc8f-f4qj](https://github.com/advisories/GHSA-hrr3-gc8f-f4qj) | CVE-2026-86472  | Moderada                | `>= 3.0.0, < 3.1.8` → 3.1.8                                |
| [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh) | CVE-2026-84375  | Alta                    | `>= 4.0.0, < 4.3.2` → 4.3.2; `>= 3.0.0, < 3.15.2` → 3.15.2 |
| [GHSA-3f6p-5ww8-9rcr](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr) | Não informado   | Alta                    | `< 3.22.0` → 3.22.0                                        |
| [GHSA-rgwj-5xj2-c3m3](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3) | Não informado   | Moderada                | `<= 3.23.0` → 3.23.1                                       |
| [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | CVE-2026-104844 | Moderada                | `< 7.1.6` → 7.1.6                                          |
| [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | CVE-2026-93749  | Alta                    | `>= 1.0.0, < 1.2.2` → 1.2.2                                |

Esses patches são alternativas de investigação, não um plano de atualização executado. A compatibilidade efetiva depende do manifesto consumidor, APIs e regressões de build/testes. Nem fixAvailable=true nem sugestão de downgrade major autoriza npm audit fix --force.

### 4.6. Prioridade de segurança

A prioridade imediata de reprodução é usar a árvore npm corrigida e não atribuir a bun.lock a mesma correção. Para o restante, recomenda-se investigar primeiro componentes que poderiam chegar à execução servidor/build (Prisma/config/fast-uri/js-yaml/source maps) e depois a cadeia de desenvolvimento/globs/CSS. O arquivo [client.ts](../src/server/prisma/client.ts) usa PrismaPg; [vite.config.ts](../vite.config.ts) e a árvore npm distinguem ferramentas e código de servidor.

Não houve novo risco crítico confirmado no caminho npm/servidor atual nem exploração demonstrada dos 19 pacotes. Isso não aprova uso irrestrito com dados reais sensíveis. Os riscos de cache e URL de evidências são de implementação/política, não resolvidos pelo upgrade TanStack. Antes de declarar confidencialidade completa, precisam ser investigados e delimitados.

## 5. Funcionalidade central e evidências de validação

### 5.1. Autenticação e autorização

[session.ts](../src/server/auth/session.ts), linhas 18–75, exige SESSION_SECRET em produção, usa cookie HttpOnly/SameSite=lax/Secure em produção por oito horas e reconsulta conta não excluída. Cadastro normaliza e-mail, bcrypt custo 12, atribui TECHNICIAN no servidor e não cria sessão automática. [start.ts](../src/start.ts) configura middleware CSRF para Server Functions.

Server Functions obtêm a sessão e transmitem a identidade para Services/Repositories. Listas/detalhes/mutações de empresa e checklist pessoal têm dono; inspeções usam Inspection.userId; NCs/ações/evidências seguem a inspeção. [ReportRepository](../src/server/repositories/report.repository.ts) e [DashboardRepository](../src/server/repositories/dashboard.repository.ts), linhas 53–62, aplicam esse escopo. Não existe RBAC operacional apenas por haver roles no banco.

[authorization.service.test.ts](../src/server/services/authorization.service.test.ts) contém testes de ownership para empresa, checklist/itens, inspeção/resposta/conclusão e NC/ações; [evidence.service.test.ts](../src/server/services/evidence.service.test.ts), linhas 338–425, cobre isolamento de evidências. São testes existentes, não executados hoje. A validação direcionada com dois usuários está registrada em [OfficialTemplates](../AI/OfficialTemplates.md), linha 457. Não foi demonstrado bypass remoto nesta inspeção, mas isso não corresponde a pentest completo.

### 5.2. Inspeções, não conformidades e ações

Inspeção nova exige empresa própria, checklist elegível e publicação; cria snapshot relacional atomicamente. Resposta usa item do snapshot e ownership, NON_COMPLIANT assegura NC e outras respostas arquivam a NC. Conclusão exige obrigatórios respondidos, incluindo N/A; opcionais podem permanecer pendentes. Respostas novas são bloqueadas após conclusão/cancelamento; tratativas e evidências podem continuar.

[inspection-response.service.test.ts](../src/server/services/inspection-response.service.test.ts), linhas 108–265, cobre texto histórico, compatibilidade de item legado, item inválido, obrigatórios, conclusão e conflito de estado por double. Isso não é teste SQL concorrente. [CorrectiveActionService](../src/server/services/corrective-action.service.ts), linhas 69–85, coordena transição de NC; concluir todas as ações não resolve NC automaticamente. 5W2H tem descrição obrigatória e demais campos opcionais. O defeito de prazo limita a correção dos caminhos de criação/limpeza.

Não há operação pública geral de editar, cancelar ou reabrir inspeção; exclusão lógica API/hook não equivale a CRUD completo nas telas. Essa delimitação está no [TASKS](../TASKS.md), linhas 423–424.

### 5.3. Relatórios e dashboard

Relatórios usam snapshot/itens/normas, respostas, NCs/ações e evidências ativas, além de dados atuais de empresa/inspetor. Não congelam o cadastro inteiro nem toda tratativa. A leitura não insere Report a cada visualização; impressão/PDF é window.print/CSS, não gerador backend. Detalhe próprio pode ser parcial, como IC-P6-01.

Dashboard calcula agregações reais por usuário; conformidade considera respostas aplicáveis em inspeções COMPLETED e exclui N/A/legadas sem item histórico. A lista recente tem cinco inspeções. Atrasos do dashboard/relatório são derivados sem escrita; listas de NC/ações podem persistir OVERDUE. Por isso nem todo GET/consulta de domínio é garantidamente sem efeito no banco. Esses endpoints não foram chamados nesta auditoria.

Testes de relatório/dashboard existentes verificam DTOs, escopo e cálculos com doubles; integração histórica está em [OfficialTemplates](../AI/OfficialTemplates.md), linha 459. Os gráficos são evidência operacional do MVP, não BI longitudinal completo ou avaliação estatística de conformidade legal.

### 5.4. Checklists, templates e cópias

Checklist é identidade; DRAFT/PUBLISHED/RETIRED são estados de versão. Publicação calcula hash canônico e usa revisão; inspeção congela conteúdo no snapshot. Cópia cria nova identidade pessoal/draft v1/itens/normas, sem transferir inspeções, respostas ou autoria oficial. Proprietário usa draft quando disponível; terceiro/oficial usa publicação acessível. Inserts em lote reduzem viagens ao Neon e mantêm rollback.

[OfficialTemplates](../AI/OfficialTemplates.md), linhas 424–460, registra correção/validação de P2003 e errata Murbach, 85 testes, 8/8 templates, 10/10 cópia e E2E 1/1. Esses resultados são históricos. O código atual corresponde ao mecanismo de escrita descrito, mas o comportamento não foi reexecutado hoje. “Oficial” significa curadoria institucional da plataforma; não chancela estatal ou garantia de atualização normativa integral. Formato legado, nomes concorrentes e busca têm os limites do inventário.

### 5.5. Evidências

Fluxo online com seleção/prévia/upload/listagem/remoção; JPEG/PNG/WebP até 4.194.304 bytes, validação de assinatura binária, contexto próprio com snapshot. Bytes ficam no Cloudinary; PostgreSQL armazena metadados. Autorização antecede storage e é reconferida no Repository. Upload/destroy são assinados e têm timeout, mas a entrega via storageUrl não reautentica na aplicação.

[EvidencePanel](../src/components/evidence/EvidencePanel.tsx), linhas 165–185 e 233–241, apresenta aviso e desabilita upload offline. Ausência de fila binária é explicitamente adiada, não regressão. Testes de compensação/ownership existentes e resultados históricos não provam recuperação de falha dupla, entrega privada ou validação completa de decodificação de imagens.

### 5.6. Offline/PWA e correspondência com a homologação

A homologação de **5 de setembro de 2026**, registrada em [Offline](../AI/Offline.md), linhas 617–651, tem veredito **APPROVED WITH KNOWN LIMITATIONS**: Chromium 151.0.7922.34 local + Neon, três cenários, incluindo edições/conclusão/reabertura, retry idempotente e conflito sequencial. HTTPS publicado teve assets/registro/fallback, sem fluxo autenticado completo ou múltiplos navegadores/reinício completo do processo.

O commit histórico é ed92f74 (PWA HOMOLOGATION). git diff ed92f74..HEAD confirmou que **arquivos de execução em src/offline, public/sw.js e public/manifest.json permanecem iguais**, exceto uma adaptação de tipagem no teste local inspection-store.test.ts. Sessão de servidor e configuração Vite examinadas também não mudaram nesse intervalo. No servidor, Functions/Services/Repositories de resposta/conclusão foram alterados para exigir ownership; o E2E passou a transmitir usuário confiável e usar fixtures da conta demonstrativa atual.

Isso significa continuidade do protocolo cliente, mas a homologação de setembro sozinha não valida toda alteração posterior de backend/dependências. A [validação final de 3 de outubro em OfficialTemplates](../AI/OfficialTemplates.md), linha 461, registra **3/3 no E2E offline** já após o hardening/fixtures. O PR #2 posterior alterou dependências e root error props, sem mudar o protocolo offline. Não houve nova homologação pós-merge aqui, e os cenários concorrentes/cache SSR continuam pendentes.

Fechar uma página e abrir outra no mesmo contexto browser, como [e2e/offline-pwa.spec.ts](../e2e/offline-pwa.spec.ts), linhas 316–317 e 696–697, não equivale a reiniciar o processo completo do navegador. O TCC deve usar o alcance efetivamente registrado.

### 5.7. Quadro de validação: histórico versus auditoria atual

| Verificação                              | Evidência histórica mais pertinente                                                                                                     | Resultado executado nesta auditoria                                          |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| TypeScript oficial                       | PR #2: Node 22.23.2, aprovado após adaptação de ErrorComponentProps                                                                     | **Aprovado**, tsc --noEmit em Node 22.23.2                                   |
| Testes automatizados                     | PR #2 e OfficialTemplates final: **85/85**, zero falhas/skips no PR                                                                     | Não reexecutados                                                             |
| TypeScript ampliado                      | OfficialTemplates final aprovou arquivos da entrega; varredura de todos scripts/E2E teve 30 diagnósticos em dois arquivos preexistentes | Não reexecutado; não declarar cobertura de scripts/E2E pelo tsconfig oficial |
| Build de produção                        | PR #2: npm run build aprovado, artefato nodejs22.x, com avisos de depreciação/bundling                                                  | Não reexecutado para preservar arquivos gerados                              |
| Lint                                     | OfficialTemplates final: zero erros e seis avisos preexistentes de Fast Refresh                                                         | Não reexecutado                                                              |
| Autorização/integridade dirigida no Neon | OfficialTemplates final, linhas 457–459: ownership, versionamento e dashboard aprovados                                                 | Inspeção estática/testes existentes; sem banco                               |
| E2E offline                              | Setembro: três cenários; outubro: **3/3** registrado em OfficialTemplates                                                               | Não reexecutado; sem nova homologação                                        |
| Dependências                             | PR #2 registrou 20 → 19                                                                                                                 | **19 entradas npm verificadas hoje**, seção 4                                |
| Implantação Vercel do HEAD               | Usuário informou check passando                                                                                                         | **Confirmada via status API GitHub**, success / Deployment has completed     |

Status consultado em repos/PedroVitor237/safe-watch-insight/commits/ff94c6c22ee8f8f986d0e376a5cf7e3b01fbec13/status: contexto Vercel, state success, descrição Deployment has completed; [deployment associado](https://vercel.com/pedrovitor237s-projects/safe-watch-insight/7ekRZCSmEAUFTivC7A6hK49fJ9v8). check-runs retornou total_count=0. Um status externo concluído não prova execução dos 85 testes na Vercel, runtime Node exato efetivamente usado nem homologação funcional em produção.

## 6. Limitações de escopo e trabalho adiado

As omissões abaixo têm registro explícito nas fontes atuais. Não se presume que qualquer função ausente seja roadmap. Os cinco defeitos e os riscos do inventário permanecem classificados separadamente, mesmo quando sua correção foi adiada.

| Recurso/garantia adiada                                                                            | Fonte explícita                                                                                                      | Comunicação atual e consequência para o TCC                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Criação integral de inspeção offline                                                               | [Offline](../AI/Offline.md), 125–133 e 647–651; [README](../README.md), 38–41                                        | Documentação delimita inspeções previamente disponibilizadas. A tela [nova inspeção](../src/routes/_app.inspecoes.nova.tsx) não possui bloqueio explícito por isOnline no botão final, mas chama criação remota; não demonstrar criação offline como entregue. Aviso mais claro é melhoria de UX |
| Reconciliação assistida de conflito                                                                | Offline, mesmas seções; [TASKS](../TASKS.md), 330–333                                                                | [Configurações](../src/routes/_app.configuracoes.tsx), 127–136, informa que resolução assistida não está disponível. Detecção/bloqueio entregues não equivalem a resolução ou prevenção de todas as corridas                                                                                     |
| Evidências binárias offline, compressão e quota                                                    | Offline, seção Evidências/Evoluções; [TECH_DECISIONS](../TECH_DECISIONS.md), seção Upload de Evidências              | EvidencePanel tem aviso explícito e upload desabilitado sem rede. Descrever fotografias online e execução de respostas offline como capacidades diferentes                                                                                                                                       |
| Background Sync e CRUD offline amplo                                                               | Offline, 647–651; [TASKS](../TASKS.md), seção Melhorias futuras                                                      | O manager depende da aplicação ativa, evento online/sondagem. Não alegar sincronização em segundo plano com navegador encerrado                                                                                                                                                                  |
| Homologação autenticada publicada, outros navegadores/dispositivos e reinício completo do processo | Offline, 642–650 e 753–756; README, 260–264                                                                          | Estão explicitamente pendentes. HTTPS de assets/registro/fallback e fechamento/reabertura de página não bastam para generalização                                                                                                                                                                |
| Retenção/quota/criptografia local e administração de dispositivos compartilhados                   | Offline, 654–665; [IMPLEMENTATION_PLAN](../IMPLEMENTATION_PLAN.md), seção de encerramento Offline/PWA                | Não há criptografia em repouso/MDM. Guard/cookie não impedem acesso por quem controla o perfil do navegador ou sistema operacional. Qualificar confidencialidade local                                                                                                                           |
| RBAC, gestão de equipe/usuários, perfil persistente, recuperação/ativação por e-mail               | [BusinessRules](../AI/BusinessRules.md), 17–44; TASKS, fases 2/16 e melhorias                                        | Equipe usa mocks; [Configurações](../src/routes/_app.configuracoes.tsx) tem perfil demonstrativo. Não apresentar papéis/controles visuais como permissões persistidas. Login/cadastro reais são entregas separadas                                                                               |
| Solicitante e gestão correspondente                                                                | [DocumentoDeRequisitos](./DocumentoDeRequisitos.md), matriz de entregas; [Fase 11](./RelatorioFase11.md), seções 5/9 | RF12/RN07 não entregues; não inventar entidade/fluxo como implementado na retrospectiva                                                                                                                                                                                                          |
| UI completa de histórico/retirada de versões, audit log completo e assinatura                      | [TECH_DECISIONS](../TECH_DECISIONS.md), seção Versionamento; README, 293–294                                         | Versionamento e snapshot existem; UI completa e trilha de eventos/assinatura não. Imutabilidade do fluxo é proteção da aplicação, não inviolabilidade física do banco                                                                                                                            |
| PDF customizado backend, armazenamento/download direto                                             | TECH_DECISIONS, seção Relatórios; README, 75–76 e 287                                                                | Impressão/Salvar como PDF nativo é comunicado. Não atribuir geração de arquivo no servidor                                                                                                                                                                                                       |
| BI, séries históricas, comparativos e filtros avançados                                            | TECH_DECISIONS, seção Dashboard/Futuras evoluções                                                                    | Dashboard MVP integrado não implementa todas as análises futuras                                                                                                                                                                                                                                 |
| CI/CD, observabilidade e cobertura ampliada                                                        | TECH_DECISIONS, seção Futuras evoluções; README, 295                                                                 | Status Vercel demonstra implantação associada; não comprova pipeline com testes completos, monitoramento ou cobertura integral                                                                                                                                                                   |

A falta dessas evoluções não invalida o estudo de implementação incremental do protótipo. Invalida apenas apresentá-las como resultados já alcançados. Avisos do upload e conflito são explícitos; para equipe/perfil e criação offline, a documentação é mais clara que alguns controles visuais, devendo o roteiro acadêmico explicar seu alcance.

## 7. Alegações acadêmicas que exigem atenção

A documentação consolidada já contém ressalvas importantes. Não foram encontradas, nas fontes atuais prioritárias examinadas, afirmações explícitas de segurança completa, prontidão comercial ou conformidade legal plena como resultado validado. Ausência nessa busca não certifica toda frase do acervo. Os pontos abaixo indicam como transportar corretamente as declarações para o TCC, sem editar documentos existentes.

| Declaração curta e localização                                                                                                                                               | Avaliação baseada nas evidências                                                                                                             | Representação recomendada no TCC                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “detecção segura de conflito” — [IMPLEMENTATION_PLAN](../IMPLEMENTATION_PLAN.md), linha 378                                                                                  | Precisa qualificação: há comparação e bloqueio no cenário sequencial; IC-P6-03 não garante CAS concorrente                                   | “Detecção de revisão divergente e bloqueio da fila nos cenários testados”; citar limites entre abas/dispositivos                                          |
| “garantindo continuidade [...] integridade dos dados e sincronização automática” — [Offline](../AI/Offline.md), linha 672, seção Objetivo Final                              | Objetivo de arquitetura, não conclusão empírica universal. Corrida/projeção e escopo parcial impedem garantia absoluta                       | Separar objetivo pretendido de resultado validado: continuidade de inspeções disponíveis, operação local-first e sync idempotente em cenários delimitados |
| “manter histórico completo das inspeções” — [PROJECT_CONTEXT](../PROJECT_CONTEXT.md), linha 54, seção Objetivo                                                               | Objetivo a qualificar: snapshot preserva checklist/itens/normas, não cadastro inteiro, todos eventos ou audit log                            | Descrever conteúdo histórico congelado e dados atuais consultados; indicar backfill não verificável                                                       |
| “revisão remota [...] conferida para detectar conflito” e “não aplica Last Write Wins” — PROJECT_CONTEXT, linhas 205–209                                                     | Descreve a intenção/mecanismo, mas uma corrida pode ultrapassar a comparação anterior à escrita                                              | Explicar revisão esperada e idempotência; não inferir ausência garantida de perda de atualização simultânea                                               |
| “excluir [...] nenhuma sobrescrita automática foi aplicada” no aviso de conflitos — [Configurações](../src/routes/_app.configuracoes.tsx), linha 135                         | Adequado para operação que efetivamente recebeu CONFLICT; não generalizável para corrida que não foi detectada                               | Restrição do resultado à operação bloqueada, sem transformar aviso em prova de consistência global                                                        |
| “[x] [...] reinício → sync → Neon” — [TASKS](../TASKS.md), linha 386                                                                                                         | Termo reinício precisa delimitação: E2E fecha/reabre página; documento final exclui reinício completo do processo                            | Identificar reabertura da página/contexto usado e declarar ausência de homologação do reinício integral                                                   |
| VERIFIED no novo snapshot — [InspectionService](../src/server/services/inspection.service.ts), linha 86; política descrita em [Database](../AI/Database.md), seção histórico | Rótulo é mais amplo que recálculo realizado: formato diferente de 1 pode ser aceito sem recalcular                                           | Não chamar todo VERIFIED de prova criptográfica; distinguir formatos, backfill e política do campo                                                        |
| “Bun é opcional; o repositório também possui bun.lock” — [README](../README.md), linha 170                                                                                   | Fato correto, mas insuficiente para reprodução atual: lock Bun não acompanha PR #2 e contém versões vulneráveis                              | Documentar npm/package-lock/Node 22 usados; não indicar Bun como reprodução igualmente validada da baseline                                               |
| “85/85” e “TypeScript [...] aprovado” — [OfficialTemplates](../AI/OfficialTemplates.md), 445–447; PR #2                                                                      | Precisos como resultados históricos e para escopo do tsconfig; 30 diagnósticos ampliados permanecem registrados                              | Informar data, commit/escopo e tipo de teste; não converter número em percentual de cobertura ou aprovação de todos scripts/E2E                           |
| “APPROVED WITH KNOWN LIMITATIONS” — [Offline](../AI/Offline.md), linha 642                                                                                                   | Resultado histórico adequado e delimitado; não cobre tudo pós-merge nem todos ambientes                                                      | Preservar data/Chromium/local+Neon/cenários e limitações; citar typecheck/audit/status de hoje separadamente                                              |
| RNF03 disponibilidade offline / RNF04 preservação da integridade — [requisitos](./DocumentoDeRequisitos.md), 338–346                                                         | Requisitos desejados, com atendimento parcial explicitado posteriormente; não são prova de garantia alcançada                                | Usar matriz de atendimento parcial, testes e pendências; não classificar RNF04 como irrestritamente demonstrado                                           |
| “Templates [...] não [...] garantia de conformidade legal atual” — README, 339–342; [guia](./GUIA_USUARIO.md), linha 118                                                     | Ressalva correta. Fonte normativa/bibliográfica e etiqueta oficial são apoio, não certificação de cumprimento legal                          | Manter a distinção e contextualizar recorte institucional e datas das referências                                                                         |
| “Durante entrevistas realizadas [...]” — Offline, linha 17                                                                                                                   | Alegação metodológica que código/testes não verificam; esta auditoria não examinou consentimentos, instrumentos ou registros das entrevistas | Só afirmar pesquisa empírica realizada com documentação metodológica correspondente; personas/necessidades do sistema não substituem evidências de coleta |

Não há demonstração de que todo erro de API seja Result, todo armazenamento seja privado, toda cópia tenha título exclusivo, todo e-mail seja protegido por índice case-insensitive ou toda fonte física seja equivalente. A documentação central já explicita várias dessas diferenças; o TCC deve conservar as ressalvas ao sintetizar, em vez de citar apenas frases de objetivo ou tabelas de conclusão.

## 8. Plano de ações priorizado

### 8.1. BLOCKING — antes de escrever as alegações afetadas

São bloqueios de **alegações**, não bloqueio global de redação. O impacto material está nos mecanismos observados, não em expectativa de prontidão comercial.

| Ação                                                                                              | Evidência e condição para desbloquear a alegação                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retirar/qualificar garantias globais de consistência e concorrência                               | IC-P6-03 compara antes da escrita e IC-P6-04 regride projeção. Escrever capacidade no cenário validado e limitações desbloqueia a redação; afirmar garantia ampliada requer correção e teste concorrente real     |
| Não afirmar verificação criptográfica uniforme ou reconstrução legada comprovada                  | IC-P9-04 atribui VERIFIED sem recálculo em outro formato. Identificar política/formato/backfill; alegação uniforme exige alterar/validar o mecanismo                                                              |
| Não apresentar a aplicação como totalmente segura, evidências sempre privadas ou offline completo | Riscos locais/URLs e 19 entradas npm/escopo parcial são evidência concreta. Delimitar ownership remoto, cache local, entrega externa e recursos adiados; alegações amplas exigem trabalho e validação posteriores |
| Não alegar reprodução corrigida indistintamente com npm e Bun                                     | POST-01 conserva Start/Core afetados no lock Bun. Registrar caminho npm da baseline; validar/alinhá-los somente em tarefa separada se quiser demonstrar Bun                                                       |

**Nenhum desses itens exige modificar a aplicação para iniciar a retrospectiva/metodologia com formulação precisa.** Se a monografia insistir em tais garantias como resultado, as correções/validações correspondentes se tornam necessárias antes de escrever e sustentar essas conclusões.

### 8.2. RECOMMENDED — antes da submissão/demonstração final

1. Corrigir IC-P9-01 em tarefa própria: null/vazio/omissão no create/update, testes do contrato e UI. Depois verificar registros afetados apenas com autorização específica. Não alterar prazo no banco durante auditoria.
2. Priorizar IC-P6-03 e IC-P6-04 para experimento isolado: mesma revisão, mesmo UUID, resposta/conclusão simultâneas, dependentes e falha entre confirmações. Decidir controle atômico e preservação de projeção antes de nova homologação.
3. Reproduzir A→B no mesmo router com atraso/erro e revisar cache QueryClient; homologar HTML SSR após expiração/logout e política de Cache Storage. Separar resultados locais e eventual CDN.
4. Definir confidencialidade das evidências e testar entrega por URL conhecida. Ownership de metadados não é garantia de autorização de download.
5. Triar as 19 entradas npm com os consumidores atuais. Cobrir patches em faixa quando possível e evitar downgrade Prisma 7 → 6/overrides major sem testes. Tratar braces sem patch como mudança de cadeia, não atualização inexistente.
6. Escolher gerenciador/lockfile canônico e tratar POST-01; até lá, manter reprodução acadêmica pelo caminho npm corrigido.
7. Alinhar Checklist.createdById com política/migration vigente e validar drift em tarefa autorizada; melhorar classificação de retry; investigar busca por metadados de draft.
8. Revisar os diagnósticos históricos fora do tsconfig e renderizar figuras com ferramentas oficiais se forem exportadas para a monografia. A aprovação estática anterior não comprova legibilidade visual.
9. Melhorar comunicação da tela de criação quando offline e a distinção de perfil/equipe demonstrativos, sem ampliar artificialmente o escopo entregue.

A ausência de correção imediata pode ser relatada, com impacto e prioridade. Não usar limitação documentada como alegação de comportamento correto para prazo, rótulo de integridade ou cache entre identidades.

### 8.3. DEFERRED — limitações e melhorias futuras aceitáveis

Criação integral offline, fila de evidências/compressão/quota, reconciliação assistida, Background Sync, CRUD offline amplo, homologação multiambiente, RBAC/equipe/perfil, recuperação/ativação de e-mail, solicitante, PDF backend, BI, assinatura/audit log e políticas avançadas de dispositivos podem permanecer no capítulo de limitações/trabalhos futuros, conforme seção 6.

Também podem permanecer delimitados: política de relatório parcial, unicidade concorrente de título de cópia, garantia física de e-mail case-insensitive para importações e reconciliação de falhas duplas Cloudinary/PostgreSQL. Aceitação acadêmica depende de explicitar que essas garantias não foram implementadas/validadas; não significa autorização para qualquer cenário comercial.

## 9. Parecer final

**APPROVED WITH REQUIRED QUALIFICATIONS**

A baseline pós-merge é identificável, limpa inicialmente e igual ao main remoto consultado. O upgrade TanStack corrigido está instalado no caminho npm; o typecheck oficial passou nesta auditoria, e a implantação do HEAD consta como concluída com sucesso. Há evidência histórica pertinente de testes, build, ownership, integridade histórica, cópia/templates e Offline/PWA. O incremento implementado oferece material suficiente para a retrospectiva e as seções de desenvolvimento/metodologia.

A aprovação exige distinção explícita entre testes históricos e verificações atuais; backend autorizado e retenção/entrega local/externa; garantia sequencial e concorrência não homologada; snapshot de checklist e histórico integral; requisito desejado e funcionalidade entregue. Os cinco defeitos e cinco riscos dos 14 achados não foram eliminados pelo merge documental ou pelo upgrade de dependências. Os 19 alertas npm remanescentes e o lockfile Bun desatualizado impedem declaração de “sem vulnerabilidades”, mesmo com Vercel aprovado.

Não há evidência concreta nesta tarefa de vazamento cross-user via CDN, exploração dos 19 pacotes, perda de dados por corrida real ou nova falha crítica no servidor npm atual. Essas ausências de demonstração não são provas de inexistência. Não se concede aprovação de prontidão comercial nem se repete a homologação offline.

Pode-se começar a escrever agora com esse enquadramento. Remediação antes da escrita é necessária somente se as conclusões pretendidas ultrapassarem as evidências e insistirem nas garantias bloqueadas da seção 8.1. A correção de prazo e a investigação de concorrência/cache são recomendadas antes da demonstração e submissão final.

## 10. Próximos passos recomendados

1. Produzir, em tarefa posterior, a retrospectiva técnica usando a baseline, os commits, decisões e evidências deste relatório. Mapear problema → decisão → implementação → método de validação → resultado → limitação, preservando diferenças entre marcos.
2. Preparar uma matriz de requisitos entregues/parciais/futuros e de evidências por alegação. Para execução de testes histórica, registrar ambiente/data/escopo; para resultados atuais, usar somente os comandos da seção 2. Não converter 85 testes em cobertura total.
3. Consolidar o relato metodológico de desenvolvimento incremental e assistência por IA, com contribuição/revisão humana e rastreabilidade. Confirmar materiais de entrevistas antes de descrevê-las como coleta empírica.
4. Separar eventuais correções/revalidações autorizadas em tarefas próprias; registrar novas baselines/evidências se forem executadas. Só então mudar status de defeitos/riscos, sem retroagir resultados históricos.
5. Redigir posteriormente desenvolvimento/metodologia e limitações/trabalhos futuros, usando essas fronteiras. Esta auditoria não iniciou a retrospectiva nem a monografia.

### Controle de entrega e preservação

Este relatório é o único arquivo novo permitido. A ausência do destino foi reconferida antes da criação. git status mostrou somente Documentation/RelatorioAuditoriaTecnicaPreEscritaTCC.md como untracked; nenhum arquivo rastreado modificado e índice vazio. Foram conferidos 130 links locais (zero ausentes), dez seções numeradas, 13 tabelas, formatação Prettier e whitespace deste artefato. git diff --check e a conferência adicional --no-index --check contra /dev/null incluem, respectivamente, o estado rastreado e o relatório novo.

Não houve alteração de código, dependências, lockfiles, banco, variáveis/configuração do projeto ou documentação preexistente; não houve instalação, migration, seed, commit, push, criação/modificação de PR ou alteração de branch remota. As consultas de metadados não editaram o estado remoto do projeto. A exceção à leitura é exclusivamente a criação deste relatório.

## Atualização posterior — homologação PostgreSQL real de IC-P6-03

**Data:** 12 de outubro de 2026 (America/Fortaleza). Esta atualização descreve
uma tarefa posterior à auditoria histórica e à PR #5, sem retroagir seus resultados
ou modificar a classificação dos demais achados.

Baseline após fetch/consulta remota: `9514971991986de5417549c6d25f7f068d875da8`.
Branch dedicada: `test/ic-p6-03-postgres-concurrency`, criada de `origin/main`
após conferir ausência local/remota. Ambiente efetivo: **PostgreSQL 18.4 local
descartável**, Node 22.23.2, Prisma/adapter-pg 7.9.1, pg 8.22.0 e Chromium
151.0.7922.34. Seis migrations existentes aplicadas somente ao banco vazio;
nenhum seed, banco Neon/demo/produção ou deploy foi usado.

Na baseline real, **16/18 testes de PostgreSQL** e **7/9 cenários HTTP** passaram.
O bloqueio compartilhado da PR #5 preservou revisão, idempotência da mesma
inspeção e atomicidade da conclusão. As duas falhas de cada suíte reproduziram
colisão deliberada do UUID global entre inspeções bloqueadas separadamente:
o perdedor esperava no índice único, sofria rollback, mas propagava P2002 em vez
de retornar o envelope `CONFLICT`. Não foi observada perda de resposta nem
segunda mutação confirmada. HTTP retornava 200 com exceção serializada.

A correção mínima usa `persistOfflineOperation` no helper existente para
converter P2002 do INSERT de `OfflineSyncOperation` na exceção interna de conflito
já tratada pelo Service. A PK do UUID é a única constraint UNIQUE dessa tabela.
Os dois Repositories continuam encerrando a transação por rollback antes do
retorno de domínio. Não há mudança de schema/migrations, layout, rotas,
hashes, revisões ou regras de negócio de conclusão.

Validação final: **18/18 PostgreSQL**, **10/10 HTTP/IndexedDB**, **173/173** na
suíte principal; TypeScript principal e configuração estrita dos testes,
lint (zero erros/seis warnings existentes), build local Vercel, Prettier dos
arquivos alterados e `git diff --check` aprovados. PIDs e transações independentes,
esperas reais, estado/filhos persistidos e contagem de mutações foram conferidos.
40001/40P01 foram produzidos por controles SQL separados, não pela aplicação.
Também foram testados ownership, duas abas com UUID idêntico de resposta e
conclusão da fila, caches isolados em conflito e perda de confirmação HTTP
após commit com retry sem nova mutação. Nas Functions atuais, o 409 é lógico
no envelope transportado por HTTP 200, não um status HTTP 409.

**Status sustentado pela evidência:** IC-P6-03 homologado nos cenários locais
descritos, com remediação adicional da classificação da colisão global de UUID;
integração da branch depende de revisão humana. Não há aprovação de garantia
global, Neon, dispositivos físicos, múltiplos servidores ou carga ampliada.
Não se declara suporte offline completo nem nova homologação PWA ampla.

Ambiente exato, cada cenário/estado persistido, comandos reproduzíveis,
correção, arquivos e limites estão no
[relatório de homologação](./HomologacaoConcorrenciaPostgreSQLIC-P6-03.md).
O SHA final e a lista Git de arquivos são registrados na descrição da PR e na
entrega após o commit. Push somente da branch dedicada e PR para main, sem
merge nem auto-merge nesta tarefa.
