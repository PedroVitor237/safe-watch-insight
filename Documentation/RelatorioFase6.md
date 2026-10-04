# Relatório da Fase 6 — Inspeções, Evidências, Relatórios e Dashboard

Revisão documental em **4 de outubro de 2026**. Código implementado é a fonte
primária; sem alteração funcional, banco ou nova homologação. Fases 1–5
preservadas nos trechos ainda corretos. **Final QA não foi aprovado nesta fase.**

## 1. Objetivo

Consolidar ciclo de inspeção, snapshot, respostas, NCs, ações, evidências online,
execução offline suportada, relatório sob demanda/impressão e dashboard real.
Distinguir estados modelados de operações expostas, histórico congelado de dados
atuais, constraints SQL de domínio e isolamento remoto de retenção local.

## 2. Baseline

- Branch: `docs/documentation-update`, sem criar/trocar branch.
- HEAD inicial: `5080142112989826937f476b02f44d0091157ca6`.
- Checkpoint esperado confirmado: `docs: consolidate architecture and backend API documentation`.
- Working tree inicial limpa; branch estava um commit à frente do remoto.
- Cinco commits mais recentes conferidos; Fase 5 `5080142`, Fase 4 `edc6170`,
  Fase 3 `42aeb64`, Fase 2 `0a19b44`, diagrama físico `0e7c6e4`.
- Leituras obrigatórias: AGENTS.md, PROJECT_CONTEXT.md, IMPLEMENTATION_PLAN.md,
  TASKS.md e TECH_DECISIONS.md. Nenhum reset/rebase/amend/push.

## 3. Documentos auditados

AI/Entities.md, AI/BusinessRules.md, AI/API.md, AI/Offline.md, AI/Architecture.md,
AI/Database.md, Documentation/DocumentoDeRequisitos.md,
Documentation/EspecificacaoAPIREST.md, Documentation/ESPECIFICACAO_DE_TELAS.md,
Documentation/MAPA_DE_NAVEGACAO.md, Documentation/GUIA_USUARIO.md, README.md,
PROJECT_CONTEXT.md e GUIA_DO_PROFESSOR.md. Consultados também relatórios das
Fases 4/5, referências de banco/migrations e indicações de histórico em
AI_PROJECT_CONTEXT.md/Documentation/WIREFRAMES.md.

**Caminho real do guia do professor:** GUIA_DO_PROFESSOR.md na raiz; não existe
Documentation/GUIA_DO_PROFESSOR.md. Atualizado o arquivo existente, sem duplicar.

## 4. Source of truth utilizado

Auditoria estática local, sem conexão a banco/Cloudinary:

| Camada       | Arquivos utilizados                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Services     | inspection.service.ts, inspection-response.service.ts, non-conformity.service.ts, corrective-action.service.ts, evidence.service.ts, report.service.ts, dashboard.service.ts                               |
| Repositories | Os sete correspondentes em src/server/repositories/; offline-sync-operation.ts e persistência da revisão/deduplicação                                                                                      |
| Schemas      | Contratos correspondentes em src/server/schemas/; enums/nullability/defaults em prisma/schema.prisma                                                                                                       |
| Fronteira    | inspection.functions.ts, inspection-response.functions.ts, non-conformity.functions.ts, corrective-action.functions.ts, evidence.functions.ts, report.functions.ts, dashboard.functions.ts em src/lib/api/ |
| Hooks        | useInspections, useInspectionResponses, useNonConformities, useCorrectiveActions, useEvidence, useReports e useDashboard; query keys de relatório/dashboard                                                |
| UI           | Rotas de criação/lista/detalhe de inspeção, relatórios/dashboard; InspectionReport, EvidencePanel, CorrectiveActionsPanel; AppShell, login, router e CSS de impressão                                      |
| Offline      | database.ts, types.ts, inspection-client.ts, inspection-store.ts, sync-manager.ts, session.ts e use-offline-state.ts                                                                                       |
| Storage      | src/lib/evidence.ts, StorageService/CloudinaryStorageService, validação de configuração/respostas externas                                                                                                 |
| SQL          | Migrations de 5W2H, versionamento/snapshot, evidência e idempotência; restrições/índices/FKs comparados ao schema e documentação de banco                                                                  |

Nenhum script de integração/teste, migration, seed, build ou consulta remota foi
executado. Resultados anteriores permanecem evidências históricas, sem nova
atribuição de aprovação.

## 5. Inspeções

Criação online: sessão → empresa própria não excluída → checklist visível ativo
→ versão PUBLISHED do mesmo checklist → escrita atômica de inspeção/snapshot.
Sem versão explícita usa publicação de maior número. Hash obrigatório; formato 1
recalculado, demais formatos aceitos sem recálculo (limite já conhecido).
Nasce PLANNED/SYNCED; resposta válida move a IN_PROGRESS. Conclusão aceita
PLANNED/IN_PROGRESS se todos os obrigatórios têm resposta; N/A atende e opcionais
podem ficar pendentes. Sem exigência de fotos, observação, NC resolvida ou ação
concluída.

COMPLETED/CANCELLED bloqueiam novas respostas/observações/conclusão; retry de
operação já confirmada não é nova mutação. Não há edição geral, cancelamento
ou reabertura públicos. deleteInspection é soft delete próprio em qualquer
estado, sem botão atual; preserva filhos e não destrói arquivos externos.
NCs/ações/evidências seguem tratáveis nos contextos ativos após concluir.
Lista/detalhe/histórico são próprios; título/itens/normas vêm do snapshot.

## 6. Snapshots

Checklist é identidade; ChecklistVersion é revisão editorial;
InspectionChecklistSnapshot captura título/descrição, IDs/número de origem,
isTemplate, formato/hash/captura/origem/integridade. InspectionSnapshotItem
captura descrição/ordem/obrigatoriedade, ID da versão e referência legada;
InspectionSnapshotItemStandard copia tipo/código/título/resumo/URL e conserva
Standard.id. InspectionResponse referencia item capturado, sem resposta direta
no item da publicação.

Não congela empresa, usuário, NCs/ações/evidências ou relatório inteiro, nem
copia isOfficial. Schema admite versão nullable e zero ou um snapshot; fluxo
novo cria ambos. Imutabilidade é da aplicação, sem trigger SQL universal.
Backfill UNVERIFIED_LEGACY/formato 0 não comprova reconstrução histórica.

## 7. Respostas

Upsert por inspeção/item do snapshot. Contrato exige exatamente um identificador
histórico ou legado, resolvido no snapshot da própria inspeção; SQL permite ambos
com CHECK de ao menos um. Status COMPLIANT/NON_COMPLIANT/NOT_APPLICABLE;
pendência é ausência de resposta. Observação opcional aparada/vazia/omitida → NULL.

Revisão remota updatedAt é diferente de updatedAt local provisório e
clientCreatedAt/clientUpdatedAt. Metadados offline formam conjunto completo;
expectedResponseUpdatedAt=NULL espera ausência; dependentes recebem revisão da
confirmação anterior. Hash inclui horário original e revisão esperada. UUID/
usuário/inspeção/tipo/hash deduplicam transacionalmente. Sem Last Write Wins;
chamada direta sem metadados não confere revisão esperada.

## 8. Não conformidades

Uma por resposta inclusive arquivada. NON_COMPLIANT nova gera MEDIUM/OPEN,
observação ou descrição histórica e prazo servidor + sete dias UTC. Ativa mantém
dados/status; arquivada restaura OPEN conservando prazo/descrição/severidade e
filhos. Conforme/N/A preenche deletedAt, sem marcar RESOLVED nem apagar filhos.
Criação explícita exige descrição/severidade, resposta NON_COMPLIANT própria e
nenhuma NC anterior; prazo omitido é NULL, sem sete dias automáticos.

Status OPEN/IN_PROGRESS/RESOLVED/OVERDUE editável sem máquina adicional de
transições ou exigência de ações concluídas. Lista/detalhe chamam markOverdue
para NCs ativas vencidas OPEN/IN_PROGRESS do usuário e **persistem** OVERDUE.
Sem job/retorno automático de status ao adiar prazo. Ownership por resposta →
Inspection.userId, não por checklist/role/responsável textual.

## 9. Ações corretivas

Vínculo NC → resposta → inspeção própria. 5W2H real: what=description obrigatório;
why, where=location, when=dueDate, who=responsible, how=method,
how much=estimatedCost opcionais/nullable. Não há campos separados com todos
os termos 5W2H. Custo/responsável são texto, sem cálculo monetário/FK de usuário.
completedAt é do servidor, definido ao enviar COMPLETED, limpo ao enviar outro
status e preservado se status omitido.

Criar ação em NC OPEN move NC para IN_PROGRESS junto da escrita; em outros
estados não muda NC. Concluir ações não resolve NC automaticamente.
Listagem persiste OVERDUE em ações ativas PENDING/IN_PROGRESS vencidas do usuário;
adiar prazo sozinho não desfaz esse estado. Arquivar NC oculta acesso a filhos.
Coerção de prazo NULL é concern anterior referenciado abaixo.

## 10. Evidências

Online implementado. Um File por chamada; UI pode selecionar múltiplos e envia
sequencialmente, com sucesso parcial possível. JPEG/PNG/WebP (MIME exato),
0 < bytes ≤ 4.194.304, nome até 255, legenda opcional até 500, assinatura binária
conferida no Service e tamanho real igual ao declarado. Dimensões nullable do
provedor, sem limite de pixels/garantia de decodificação integral.

XOR Inspection ou NC em schema/Service/CHECK SQL; ownership da sessão e contexto
ativo de snapshot. Cloudinary guarda imagem via upload/destroy assinados no
servidor, timeout 15 segundos. PostgreSQL guarda identificação/URL/nome/MIME/
tamanho/dimensões/legenda/timestamps; DTO omite publicId/deletedAt e converte BigInt.
URL externa não exige sessão da aplicação por download.

Upload falho na persistência tenta destroy e preserva erro original se cleanup
falha; pode haver órfão. Remoção soft delete antes de destroy, com restore tentado
em falha externa; restauração pode falhar/não achar contexto. Não é transação
conjunta. Arquivar pai não remove todos os arquivos. Binários/fila/compressão/
quota offline permanecem futuros, sem serem tratados como defeito desta fase.

## 11. Offline

Somente execução de inspeções existentes cacheadas no dispositivo. Dexie v1:
sessions/inspectionPackages/operations; pacote por usuário com snapshot completo.
Resposta/conclusão salvam pacote/fila atomicamente inclusive online. NC local é
projeção; IDs/defaults remotos são do servidor. Conclusão local COMPLETED/PENDING
não equivale a COMPLETED remoto.

FIFO por usuário/sequence/UUID; edições do item dependem da anterior. Primeira
operação em ERROR/CONFLICT/dependência/backoff impede avanço de toda a fila do
usuário. Sync ao montar/evento online/intervalo de 30 segundos; retry exponencial
com teto de cinco minutos e até cinco tentativas automáticas; recupera SYNCING.
Manual repõe ERROR, não CONFLICT. Remoção só após confirmação. 401/422 em envelope
exigem intervenção; 409 bloqueia; exceções viram NETWORK_ERROR/retry.

Sessão local segura de oito horas não autoriza persistência: cada Function
revalida remoto. Logout/troca limpam IndexedDB e cache de navegação conforme
caminhos implementados. Sem criação integral offline, reconciliação assistida,
Background Sync, binários/quota/compressão offline ou CRUD amplo. Sem pacote
próprio offline de relatório/dashboard. Homologações históricas preservadas;
esta revisão não declara garantia global entre abas/dispositivos.

## 12. Relatórios e impressão

ReportRepository consulta Inspection própria não excluída. Lista exige COMPLETED/
snapshot e ordena inspectionDate DESC/id DESC; detalhe por ID não exige COMPLETED.
ReportService monta DTO de snapshot/itens/normas, respostas por snapshotItemId,
NCs/ações/evidências ativas atuais e cadastro atual de empresa/inspetor. Itens
ordenados por orderIndex/id; ações/evidências por createdAt/id ASC.

Resumo: totais/respondidos/conformes/NC/N/A/pendentes; preenchimento arredondado
respondidos/total, ou 0 sem itens. N/A conta, opcionais pendentes aparecem.
Atrasos de NC/ação derivam no DTO, sem escrita. Fundamentação visual exibe
código/título, embora DTO também tenha resumo/URL. HTML é InspectionReport.
**Report persistível é distinto da projeção**: abrir/imprimir não cria linha,
não incrementa version, não armazena PDF. window.print() → diálogo nativo →
imprimir ou salvar PDF; CSS A4, sem biblioteca PDF/download direto/backend PDF.
Data de impressão do rodapé vem da renderização, não evento persistido.

## 13. Dashboard

Agregações próprias por Inspection.userId/deletedAt=NULL, sem escrita de
métricas ou OVERDUE. Totais por quatro estados; NCs abertas=totais−resolvidas;
atrasos incluem OVERDUE persistido ou estado ativo com prazo passado. Ações
vencidas exigem NC OPEN/IN_PROGRESS/OVERDUE; atenção soma planejadas+NCs vencidas+
ações vencidas (não inspeções únicas).

Conformidade: round(100 × COMPLIANT/(COMPLIANT+NON_COMPLIANT)), respostas com
snapshotItemId em COMPLETED; N/A/pendentes/legadas sem ID fora. Sem aplicáveis:
NULL e UI “—”, sem divisão por zero/100% artificial. Até cinco recentes por
inspectionDate DESC/createdAt DESC/id DESC, título/versão do snapshot e cadastros
atuais. Cinco cards, gráfico de barras por status, atenção e recentes.
Sem BI/filtros analíticos/temporal/exportação; consultas independentes não
representam snapshot transacional único nem incluem fila ainda não sincronizada.

## 14. Diagramas

| Par                 | Markdown Mermaid    | Standalone PlantUML                    | Escopo                                                              |
| ------------------- | ------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| Inspeção            | AI/BusinessRules.md | diagrams/flows/inspection.puml         | Criação/snapshot/estado/resposta/conclusão e tratativas posteriores |
| Evidência           | AI/BusinessRules.md | diagrams/flows/evidence.puml           | Upload/metadados/remoção e compensações possíveis                   |
| Relatório/dashboard | AI/BusinessRules.md | diagrams/flows/reports-dashboard.puml  | Projeções próprias, HTML e impressão                                |
| Offline da inspeção | AI/Offline.md       | diagrams/flows/offline-inspection.puml | Pacote/fila/revisão/deduplicação/retry/conflito                     |

Mesmos nós/rótulos/arestas e escopo nos dois formatos; são fluxos, sem notação de
cardinalidades. Cardinalidades de entidades permanecem nos modelos de banco;
nenhum formato introduz relações físicas extras. O fluxo offline adicional é
necessário para separar commit local de confirmação remota e conflito.

## 15. Divergências corrigidas

- Dashboard/relatórios marcados como demonstrativos em telas/guia/professor →
  módulos integrados reais e controles atuais.
- Garantia categórica de compensação externa na API → tentativa com falha parcial possível.
- Plano futuro de sync/criação/conflitos/binários offline → rótulos explícitos
  de atual/futuro e limite do incremento ligado à inspeção.
- Imutabilidade de inspeção inteira → bloqueio das respostas/conteúdo e
  manutenção das tratativas/cadastros atuais.
- Report persistível versus relatório visual → DTO/HTML sob demanda sem insert.
- PDF/exportação genéricos → window.print()/diálogo/Salvar como PDF do navegador.
- Indicadores sem fórmula/ordenação → denominador exato, NULL sem aplicáveis,
  exclusões, atrasos por caminho e recentes por data real.
- Obrigatoriedade 5W2H/nomes conceituais → campos reais/nullable/efeitos de estado.
- Navegação incompleta → Ver relatório com inspectionId e links de pendências.
- Guia dizia CNPJ ativo único → unicidade também entre soft deletes, conforme Fase 4.

## 16. Implementation Concerns

Não são correções desta fase. Todos os **novos IDs** abaixo têm mecanismo
confirmado **estaticamente**, sem reprodução funcional de impacto. Severidade é
avaliação para priorização, não veredito de exploração/teste.

| ID       | Localização                                                                                                                                                     | Comportamento observado / impacto possível                                                                                                                                                                                                    | Severidade | Método                                               | Recomendação para Final QA                                                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IC-P6-01 | src/server/repositories/report.repository.ts: findOwnedInspectionReport; src/routes/_app.relatorios.tsx                                                         | Lista só COMPLETED, detalhe/inspectionId direto aceita inspeção própria aberta/cancelada com snapshot; política de “relatório final” pode divergir da UI                                                                                      | Baixa      | Estático, filtro/seleção conferidos                  | Exercitar acesso direto em cada estado; decidir se relatório parcial é permitido e como identificá-lo                                                                                                           |
| IC-P6-02 | src/router.tsx; src/lib/api/dashboard.query-keys.ts/report.query-keys.ts; AppShell.handleLogout; login/cacheOfflineSession                                      | Query keys não incluem usuário; logout/troca limpa IndexedDB/navegação, sem limpar explicitamente QueryClient; dados da conta anterior podem permanecer/reaparecer em memória até refetch na navegação SPA                                    | Média      | Estático; nenhuma exposição entre contas reproduzida | Trocar A→B sem reload, com rede lenta/offline/erro; inspecionar cards/listas/relatórios e invalidar/segregar cache em tarefa própria se confirmado                                                              |
| IC-P6-03 | src/server/repositories/inspection-response.repository.ts: saveWithNonConformity; src/offline/sync-manager.ts: activeSynchronization/resetInterruptedOperations | Comparação updatedAt ocorre antes do update da inspeção, sem nova condição de revisão no upsert; mutex é só da instância JS, sem coordenação entre abas. Transação/deduplicação não provam proteção global de disputa pela mesma revisão/UUID | Alta       | Estático; corrida não executada                      | Duas abas/dispositivos salvando mesmo item/revisão, retry de UUID concorrente e conclusão simultânea; conferir perda de atualização/conflito, considerar controle atômico/isolamento em tarefa de implementação |
| IC-P6-04 | src/offline/sync-manager.ts: acknowledgeResponseOperation                                                                                                       | Confirmação sobrescreve resposta do pacote com retorno remoto mesmo com dependente local mais recente; fila conserva payload, mas UI/pacote podem temporariamente regredir e nova edição pode usar estado desatualizado                       | Média      | Estático; sequência de impacto não executada         | Editar item várias vezes, pausar/falhar entre acknowledgements, reabrir/editar; preservar projeção local mais nova em tarefa de código se confirmado                                                            |

**Concerns anteriores referenciados, sem duplicação:**

- Coerção de prazo JSON NULL → epoch: [RelatorioFase4.md](./RelatorioFase4.md)
  e [BusinessRules.md](../AI/BusinessRules.md). Reprodução local pertence à Fase 4,
  não a esta execução. Validar contrato/UI ao limpar prazo no Final QA.
- Cache de navegação com HTML autenticado, sem chave por usuário/TTL; exceções
  fora de Result classificadas como NETWORK_ERROR no sync:
  [RelatorioFase5.md](./RelatorioFase5.md). São diferentes de IC-P6-02 (memória React Query).
- Hash legado/formato diferente aceito e VERIFIED na criação; FK Checklist
  schema/migrations; compensações externas sem atomicidade: referências
  existentes em [Database.md](../AI/Database.md), BusinessRules e relatórios 4/5.
  Esta fase detalha falhas de storage sem alegar descoberta inédita.

Ausência de binários offline, BI ou PDF customizado é limite de escopo, sem
classificação automática de bug. Nenhum concern foi resolvido por alterar código.

## 17. Validações

Baseline executado antes das edições:

```bash
git status --short --branch
git rev-parse HEAD
git log -5 --oneline
```

Busca/leitura com find/grep/sed/cat, pois rg não está instalado. Validação local
sem acesso externo:

```bash
node_modules/.bin/prettier --write <Markdown alterados>
node_modules/.bin/prettier --check <Markdown alterados>
python3 /tmp/swi-phase6-doc-validation.py
git diff --check
git diff --stat
git status --short
git diff
git diff --cached --check
git diff --cached --stat
git diff --cached
git status --short --branch
git log -1 --oneline
```

Prettier/checks de whitespace aprovados; **139 referências relativas válidas
(incluindo uma âncora)** e **105 fences completas** nos 12 Markdown alterados. Validador temporário confere existência de caminhos/âncoras, fences,
allowlist documental e equivalência de nós/arestas/rótulos Mermaid/PlantUML.
Comparação estrutural: inspeção 12 nós/13 arestas, evidência 14/13,
relatório/dashboard 13/14 e offline 12/15. Inspeção manual dos fluxos comparada
ao código; diff e staged diff revisados antes de um único commit.

command -v plantuml/command -v mmdc sem localização; ferramentas especializadas
não disponíveis. **Validação oficial/renderização de Mermaid/PlantUML não
executada**; não foram instaladas dependências para isso. Comparação estática
não equivale a aprovação de parser/renderizador. Sem testes/build/homologação,
execução de migrations/seeds ou alteração de dados remotos nesta fase.

## 18. Arquivos alterados e criados

Alterados:

- AI/Entities.md
- AI/BusinessRules.md
- AI/API.md
- AI/Offline.md
- AI/Architecture.md
- Documentation/DocumentoDeRequisitos.md
- Documentation/EspecificacaoAPIREST.md
- Documentation/ESPECIFICACAO_DE_TELAS.md
- Documentation/MAPA_DE_NAVEGACAO.md
- Documentation/GUIA_USUARIO.md
- GUIA_DO_PROFESSOR.md

Criados:

- Documentation/RelatorioFase6.md
- Documentation/diagrams/flows/inspection.puml
- Documentation/diagrams/flows/evidence.puml
- Documentation/diagrams/flows/reports-dashboard.puml
- Documentation/diagrams/flows/offline-inspection.puml

Scripts de edição/validação e manifest estrutural são temporários em /tmp, sem
entrada no commit. Nenhum arquivo adicional de produto foi criado.

## 19. Arquivos não alterados deliberadamente

- README.md e PROJECT_CONTEXT.md: já descrevem módulos reais, snapshot limitado,
  impressão nativa, DTO sem Report, agregações próprias e offline parcial.
- AI/Database.md e modelos/dicionário/diagramas físicos: constraints/cardinalidades
  reconciliadas na Fase 2; sem mudança estrutural.
- RelatorioFase3/4/5, AI_PROJECT_CONTEXT.md e WIREFRAMES.md: histórico identificado,
  sem reescrever resultado anterior/proposta visual como estado atual.
- Documentos de templates/cópia e publicações históricas: escopo prévio preservado.
- Planos/backlogs/decisões técnicas: contexto lido, sem avançar implementação.
- Código, schema, migrations, seeds, testes, configurações, dependências e lockfiles:
  não alterados. Não houve publicação/retirada de checklist ou mudança de hash.

## 20. Conclusão e checkpoint Git

**DOCUMENTATION PHASE 6 — READY FOR REVIEW.** Domínios auditados e documentação
corrigida; concerns separados para Final QA. Sem avanço à Fase 7 ou aprovação
funcional. Um único commit:

```text
docs: consolidate inspections evidence reports and dashboard documentation
```

O identificador é o próprio commit que adiciona este relatório, evitando hash
autorreferente; verificável por:

```bash
git log -1 --format='%H %s' -- Documentation/RelatorioFase6.md
```

Hash literal informado na entrega. Working tree final **CLEAN**, conferida após
commit; push **NOT PERFORMED**.

Revisão de escopo antes do commit:

- [x] Somente Markdown/PlantUML desta fase; nenhum código/schema/migration/seed/teste alterado.
- [x] Publicações históricas e documentação anterior ainda correta preservadas.
- [x] Relatório sob demanda separado de Report persistível; impressão nativa descrita.
- [x] Evidência online não apresentada como offline.
- [x] Enum de estado separado de operação pública e autorização pela sessão.
- [x] Métricas/fórmulas/ausência de aplicáveis conferidas no código.
- [x] Quatro pares Mermaid/PlantUML equivalentes em estrutura/escopo.
- [x] Implementation Concerns separados das correções documentais.
