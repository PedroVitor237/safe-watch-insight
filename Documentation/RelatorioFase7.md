# Relatório da Fase 7 — Classes, Casos de Uso e Fluxos de Negócio

Revisão documental em **4 de outubro de 2026**. Implementação e persistência
vigentes são fonte de verdade. Nenhuma mudança de comportamento ou nova
homologação; Final QA não foi aprovado nesta fase.

## 1. Objetivo

Reconciliar modelo de classes/domínio, atores/casos de uso e navegação com a
implementação e as Fases 2–6. Reutilizar fluxos corretos de inspeção, evidência,
relatório/dashboard e offline; identificar artefatos históricos e um único
diagrama oficial de casos de uso.

## 2. Baseline e HEADs

- Branch inicial/final: `docs/documentation-update`, sem troca/criação de branch.
- **HEAD inicial:** `da43f71ec34fd188bb364818325b28fded61929a`.
- Checkpoint confirmado: `docs: consolidate inspections evidence reports and dashboard documentation`.
- Working tree inicial limpa, confirmada antes de qualquer alteração.
- **HEAD final:** o único commit da Fase 7 que adiciona este relatório, filho
  direto do HEAD inicial. Identificação simbólica evita hash autorreferente no
  próprio arquivo; hash literal fornecido na entrega e verificável por:

```bash
git log -1 --format='%H %s' -- Documentation/RelatorioFase7.md
```

Mensagem exata: `docs: consolidate domain classes use cases and business flows`.
Sem amend/rebase/reset/push; Fase 8 não iniciada.

## 3. Documentos revisados

- Obrigatórios: AGENTS.md, PROJECT_CONTEXT.md, IMPLEMENTATION_PLAN.md, TASKS.md,
  TECH_DECISIONS.md.
- Documentation/DiagramaDeClasses_VersaoTecnica.md, DiagramaDeCasosDeUso.md,
  DiagramTest.puml, MAPA_DE_NAVEGACAO.md, DocumentoDeRequisitos.md, Personas.md
  e RelatorioFase6.md (incluindo concerns/referências às Fases 4/5).
- AI/Architecture.md, BusinessRules.md, API.md, Entities.md, ChecklistCopy.md,
  Offline.md e Database.md como referência de constraints/divergência de FK.
- Diagramas de arquitetura application/authentication e fluxos inspection,
  evidence, reports-dashboard, offline-inspection, checklist-copy e use-cases.
- Mermaid correspondentes em Architecture, BusinessRules, Offline, ChecklistCopy,
  classes, casos de uso e mapa de navegação.

Fontes de implementação: `prisma/schema.prisma`; migrations de versionamento/
snapshot, evidência e oficialidade; UserService/UserRepository/auth/registration/
bcrypt; Services de checklist/versão/item, inspeção/resposta/ação; fronteira de
inspeção/resposta/evidência; ReportRepository; tipos offline e constantes de imagem;
rotas reais e controles/navegação de cadastro/checklists/inspeções/relatórios/dashboard.
Leitura estática local, sem consultar banco ou serviços externos.

## 4. Documentos modificados

1. Documentation/DiagramaDeClasses_VersaoTecnica.md
2. Documentation/DiagramaDeCasosDeUso.md
3. Documentation/MAPA_DE_NAVEGACAO.md
4. Documentation/DocumentoDeRequisitos.md
5. Documentation/Personas.md
6. Documentation/DiagramTest.puml
7. Documentation/diagrams/flows/use-cases.puml

Requisitos receberam somente nota de rastreabilidade, preservando lacunas.
Personas receberam delimitação pesquisa/permissão; narrativas mantidas, com
normalização de marcadores de lista pelo Prettier.

## 5. Documentos criados

1. Documentation/RelatorioFase7.md
2. Documentation/diagrams/domain/classes.puml
3. Documentation/diagrams/domain/use-cases.puml
4. Documentation/diagrams/flows/navigation.puml

Nenhum documento de módulo/app/arquitetura foi duplicado. Scripts de edição e
validação são temporários em `/tmp`, sem entrada no commit.

## 6. Diagramas criados/atualizados

| Modelo       | Mermaid no Markdown                                                        | PlantUML oficial                                    | Escopo                                                                          |
| ------------ | -------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| Classes      | [DiagramaDeClasses_VersaoTecnica.md](./DiagramaDeClasses_VersaoTecnica.md) | [classes.puml](./diagrams/domain/classes.puml)      | 19 models + seis enums; 36 relações FK + seis dependências de tipos             |
| Casos de uso | [DiagramaDeCasosDeUso.md](./DiagramaDeCasosDeUso.md)                       | [use-cases.puml](./diagrams/domain/use-cases.puml)  | Dois atores humanos, 22 casos/associações, sem includes de atividades opcionais |
| Navegação    | [MAPA_DE_NAVEGACAO.md](./MAPA_DE_NAVEGACAO.md)                             | [navigation.puml](./diagrams/flows/navigation.puml) | 19 nós e 28 transições; cadastro/cópia no mapa real                             |

Navigation standalone foi criado porque o Mermaid do mapa recebeu novas
transições; ambos representam a mesma navegação, sem introduzir nova rota.
Arquitetura/authentication e os quatro fluxos da Fase 6 foram revisados e
**reutilizados sem alterações**, com links explícitos nos modelos de domínio/
casos/mapa. Diagramas de fluxo não substituem cardinalidades físicas.

## 7. Principais correções

- Cardinalidades físicas separadas das exigências de criação/execução:
  checklist admite zero versões, inspeção versão nullable/snapshot zero ou um;
  fluxo atual cria/exige versão e snapshot.
- Criador de ChecklistVersion separado de publicador/dono de Checklist;
  oficialidade/autoria institucional NULL e CHECKs distinguidos das regras da aplicação.
- Inclusão de ChecklistItemStandard legado, Report → gerador e todas as FKs de
  linhagem/normas; optionalidade/ordem/obrigatoriedade dos itens explícitas.
- Ownership de NC/ação pela resposta/inspeção, sem FK direta de NC para usuário;
  concluir ações não resolve NC automaticamente.
- Evidence com duas FKs nullable e CHECK XOR, sem associação direta a resposta/
  ação; online/Cloudinary/metadados e limite inclusivo de 4 MB explícitos.
- Report persistível separado de DTO/HTML sob demanda; visualizar/imprimir não
  grava linha/arquivo PDF. Dashboard é real, próprio e sem BI avançado.
- OfflineSyncOperation é confirmação remota sem status/payload completo; fila
  local e CONFLICT separados de SyncStatus SQL, sem binários offline.
- Atores baseados em interação real; role/persona não implica RBAC/administração.
- Cadastro público, edição de respostas/conclusão, cópia independente e retry
  delimitados; CANCELLED não virou ação pública nem CRUD completo de inspeções.
- `/register`, links login/cadastro e destino da cópia com novo `$id` incluídos;
  não inventadas rotas de edição/cópia/administrativas; logout representado no
  menu do layout, não como ação exclusiva de configurações.

## 8. Escopo dos casos de uso

Visitante cadastra/entra; usuário autenticado gerencia empresas e checklists
pessoais, itens/normas/publicação, consulta/reutiliza publicação elegível, copia
conteúdo, cria/responde/conclui inspeção própria, mantém NC/ações/evidências
online, consulta histórico/relatório/impressão/dashboard e executa pacote
previamente disponível offline com sincronização/retry.

Cadastro normaliza e-mail, valida senha/confirmação, gera bcrypt custo 12,
atribui TECHNICIAN no servidor, trata duplicidade e não inicia sessão. Template
oficial não é editável pelo usuário; cópia cria identidade/DRAFT v1 com conteúdo
independente. Ações/NCs/evidências seguem tratáveis após conclusão em contexto ativo.

Não incluídos como entrega: administração/RBAC, edição geral/cancelamento/
reabertura de inspeção, retirada de versão pela UI, edição persistida de perfil,
recuperação de senha/verificação de e-mail, solicitante RF12/RN07, múltiplos
modelos editáveis de relatório, PDF backend/BI e offline amplo. Delete de inspeção,
retirada de versão e criação explícita de NC existem no backend, separados da
superfície de UI. RF14/RF20/RNF03 continuam parciais conforme requisitos atuais.

## 9. Escopo do domínio/classes

Os 19 models persistidos são mantidos, incluindo os dois legados e Report;
atributos selecionados usam nomes/tipos/nullability do schema. Seis enums
relevantes estão desenhados, demais tipos enum referenciados no dicionário.
`persisted`, `legacy` e `operational` distinguem papéis no domínio. Projeções
InspectionReportDto/DashboardDto e estados IndexedDB são explicados no texto,
sem transformá-los em tabelas/classes persistidas adicionais.

36 associações de FK refletem cardinalidades do schema; CHECKs/índices de
migrations e validação do Service são garantias diferentes. Não existe FK de
versão anterior; linhagem é por item. Snapshot congela checklist, sem empresa/
usuário/operação inteira. Backfill não comprova histórico; compatibilidade de
hash legado preservada sem alegar validação canônica inexistente.

## 10. Artefatos históricos

`git log --follow -- Documentation/DiagramTest.puml` identifica origem no commit
`a037ac5` (documentação de requisitos/casos/personas). O conteúdo de proposta
foi preservado com título/legend/comentários **HISTÓRICO / NÃO VIGENTE** e indicação
do [diagrama oficial atual](./diagrams/domain/use-cases.puml). Não houve exclusão
sem conferir histórico.

`diagrams/flows/use-cases.puml`, caminho anterior da Fase 3, contém agora somente
nota de referência ao oficial em `domain/`, sem modelo paralelo. Documentos novos
apontam ao oficial; artefatos/fases anteriores continuam rastreáveis pelo caminho
preservado e histórico Git. Personas continuam pesquisa/design, sem nova regra
de autorização.

## 11. Validação realizada

Validação documental local:

```text
git branch --show-current / git status --porcelain=v1 / git rev-parse HEAD
Leitura de fontes e revisão de git diff / histórico de DiagramTest
node_modules/.bin/prettier --write <seis Markdown da fase>
node_modules/.bin/prettier --check <seis Markdown da fase>
python3 /tmp/swi-phase7-doc-validation.py
git diff --check
git diff --stat / git status --short / git diff
git diff --cached --check / git diff --cached --stat / git diff --cached
git status --porcelain=v1 / git log -1 / git rev-list <inicial>..HEAD
```

Revisão estrutural cobre classes/atributos/tipos/optionalidade/cardinalidades
contra schema, paridade Mermaid/PlantUML de classes/casos/navegação, atores e
rótulos/arestas dos fluxos da Fase 6 reutilizados. Referências relativas/âncoras,
fences e allowlist de arquivos documentais são conferidas por script temporário.
Resultado: **88 referências relativas/âncoras válidas e 22 fences completas**
nos seis Markdown. Prettier e whitespace aprovados; escopo restrito aos 11
arquivos listados. Diff e staged diff revisados; um único commit sobre baseline e árvore limpa
conferidos após o commit.

## 12. Limitações de validação

`plantuml` e `mmdc` não disponíveis no PATH/binários locais.
**Renderização/validação oficial de Mermaid e PlantUML não executada**;
não instaladas dependências para esta fase. Validação estática/estrutural não
substitui parser/renderizador oficial.

Não executados testes de aplicação, E2E, build, scripts de integração, Prisma,
migrations, seeds, consulta/modificação de banco ou Cloudinary. Resultados
anteriores são históricos, sem nova declaração de aprovação funcional.

## 13. Implementation Concerns

Nenhum concern inédito identificado que exija novo registro; permanecem os
achados relevantes já documentados na [Fase 6](./RelatorioFase6.md):

| Referência | Concern preservado                                                                       | Efeito documental                                                           |
| ---------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| IC-P6-01   | Relatório direto por ID aceita inspeção própria não concluída com snapshot               | Diferenciar listagem COMPLETED de detalhe; não afirmar bloqueio inexistente |
| IC-P6-02   | Query keys sem usuário e QueryClient sem limpeza explícita na troca/logout               | Não equiparar ownership remoto a eliminação de todo cache local             |
| IC-P6-03   | Revisão/upsert concorrentes e mutex apenas por instância JS                              | Não prometer proteção global entre abas/dispositivos                        |
| IC-P6-04   | Confirmação remota pode regredir temporariamente projeção local com dependente mais nova | Conclusão/estado local não equivalem a confirmação remota                   |

Prazo NULL/coerção, cache HTML autenticado, exceções fora de Result, hash legado,
divergência de FK Checklist e compensações externas permanecem referências das
Fases 4–6 e [Database.md](../AI/Database.md), sem nova reprodução/correção.
Limites de escopo (binários offline, PDF customizado, BI) não são classificados
como bugs. Final QA continua necessário em tarefa própria.

## 14. Confirmação de escopo e encerramento

**Nenhum código de aplicação, schema Prisma, migration, seed, teste, configuração,
dependência, lockfile ou comportamento runtime foi modificado.** Somente os
11 arquivos Markdown/PlantUML listados nesta fase entram no commit.

**DOCUMENTATION PHASE 7 — READY FOR REVIEW.** Branch
`docs/documentation-update`, working tree final **CLEAN**, exatamente um commit
com a mensagem solicitada. **Push: NOT PERFORMED.** Fase 8 não iniciada.
