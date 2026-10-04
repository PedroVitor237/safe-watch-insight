# Banco de Dados — referência para agentes

## Estado e fontes de verdade

Atualização documental da Fase 2 em 3 de outubro de 2026, HEAD de referência
`0e7c6e4fcebb3edaf8c5eba3efd23dc357dfb8f9`. PostgreSQL/Neon, Prisma ORM e
Prisma Migrate. O modelo atual tem **19 models**, **12 enums**, **16 PKs UUID
simples** e **3 PKs compostas**. O estado físico documentado resulta das seis
migrations; não foi feita consulta de drift ao banco remoto nesta fase.

Fontes primárias: [schema](../prisma/schema.prisma) e
[migrations](../prisma/migrations/), incluindo SQL fora do Prisma.
Em divergência documental, prevalecem implementação e DDL vigente.
Services/Repositories delimitam somente as regras que não são garantidas físicas.

O [Dicionário de Dados](../Documentation/DicionarioDeDados.md) é a referência
canônica de todos os campos, tipos, nullability, defaults, FKs, índices e CHECKs.
Não inferir constraints SQL a partir de frases de regra de negócio.

## Inventário

| Grupo                              | Models                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Identidade e cadastro              | `User`, `Company`, `Standard`                                                                                                 |
| Checklist e compatibilidade        | `Checklist`, `ChecklistItem`, `ChecklistItemStandard`                                                                         |
| Versionamento                      | `ChecklistVersion`, `ChecklistVersionItem`, `ChecklistVersionItemStandard`                                                    |
| Inspeção e histórico               | `Inspection`, `InspectionChecklistSnapshot`, `InspectionSnapshotItem`, `InspectionSnapshotItemStandard`, `InspectionResponse` |
| Tratativa                          | `NonConformity`, `CorrectiveAction`                                                                                           |
| Evidências e relatório persistível | `Evidence`, `Report`                                                                                                          |
| Sincronização                      | `OfflineSyncOperation`                                                                                                        |

## Convenções implementadas

- Tabelas PascalCase e campos camelCase sem @map/@@map; SQL entre aspas.
- String comum vira TEXT; Int INTEGER; Boolean BOOLEAN; BigInt BIGINT.
- DateTime é TIMESTAMP(3) sem fuso horário, não DATE/TIMESTAMPTZ.
- IDs nativos usam `String @id @default(uuid()) @db.Uuid`: uuid() é geração
  Prisma, sem DEFAULT SQL. UUID explícito também é possível nos fluxos internos.
- OfflineSyncOperation.id usa `String @id @db.Uuid`, sem default; vem do cliente.
- ChecklistItemStandard, ChecklistVersionItemStandard e
  InspectionSnapshotItemStandard têm PK formada pelas duas FKs, sem id.
- @updatedAt é gestão Prisma, não trigger SQL; now() corresponde a
  CURRENT_TIMESTAMP. Não há timestamps universais: itens legados, Standard e
  associações não têm createdAt/updatedAt; snapshot usa capturedAt; Report
  usa generatedAt; operação offline usa clientCreatedAt/completedAt.
- Soft delete existe apenas em User, Company, Checklist, Inspection,
  NonConformity, CorrectiveAction e Evidence. Não libera UNIQUE ou FKs.

## Enums

| Enum PostgreSQL/Prisma              | Finalidade                                          | Valores                                            | Utilizado em                                                                                |
| ----------------------------------- | --------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `UserRole`                          | Perfil declarado do usuário.                        | `ADMIN`, `TECHNICIAN`, `SUPERVISOR`, `AUDITOR`     | `User.role`                                                                                 |
| `StandardType`                      | Classificação da norma e de suas cópias históricas. | `NR`, `NBR`, `NT`, `OTHER`                         | `Standard.type`, `ChecklistVersionItemStandard.type`, `InspectionSnapshotItemStandard.type` |
| `InspectionStatus`                  | Situação de execução da inspeção.                   | `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` | `Inspection.status`                                                                         |
| `SyncStatus`                        | Situação declarada de sincronização da inspeção.    | `PENDING`, `SYNCING`, `SYNCED`, `ERROR`            | `Inspection.syncStatus`                                                                     |
| `OfflineOperationType`              | Tipo de mutação offline confirmada.                 | `SAVE_INSPECTION_RESPONSE`, `FINISH_INSPECTION`    | `OfflineSyncOperation.type`                                                                 |
| `ChecklistVersionStatus`            | Estado editorial da versão.                         | `DRAFT`, `PUBLISHED`, `RETIRED`                    | `ChecklistVersion.status`                                                                   |
| `InspectionSnapshotOrigin`          | Origem da captura histórica.                        | `INSPECTION_CREATION`, `LEGACY_BACKFILL`           | `InspectionChecklistSnapshot.origin`                                                        |
| `InspectionSnapshotIntegrityStatus` | Condição de verificabilidade do conteúdo capturado. | `VERIFIED`, `UNVERIFIED_LEGACY`                    | `InspectionChecklistSnapshot.integrityStatus`                                               |
| `ResponseStatus`                    | Resultado de avaliação do item.                     | `COMPLIANT`, `NON_COMPLIANT`, `NOT_APPLICABLE`     | `InspectionResponse.status`                                                                 |
| `Severity`                          | Gravidade da não conformidade.                      | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`                | `NonConformity.severity`                                                                    |
| `NonConformityStatus`               | Situação de tratamento da não conformidade.         | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `OVERDUE`       | `NonConformity.status`                                                                      |
| `CorrectiveActionStatus`            | Situação de execução da ação corretiva.             | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`   | `CorrectiveAction.status`                                                                   |

## Propriedade, versões e conteúdo histórico

Checklist.createdById é nullable, com CHECK Checklist_ownership_check:
oficial exige isOfficial=true, isTemplate=true, proprietário NULL;
pessoal exige isOfficial=false e proprietário preenchido. isTemplate sozinho
não implica autoria institucional. Não criar conta institucional fictícia.
Autor da versão (createdById), publicador (publishedById) e proprietário do
checklist são papéis distintos. O bootstrap usa autor/publicador NULL;
o fluxo pessoal os atribui à sessão. A coerência com o pai não é uma FK composta.

ChecklistVersion tem numeração positiva e UNIQUE(checklistId, versionNumber).
O índice SQL parcial ChecklistVersion_one_draft_per_checklist_key limita um
DRAFT. Não há FK para versão anterior; a linhagem vive nos itens.
Itens legados/de versão/de snapshot têm ordem única por contêiner, nunca global;
CHECK de ordem positiva existe somente nos itens de versão e snapshot.

O CHECK de publicação vigente exige DRAFT com publicador/data/hash NULL ou
PUBLISHED/RETIRED com data/hash e (publicador preenchido OU criador NULL).
Não consulta o checklist pai. Imutabilidade de versão publicada/snapshot,
monotonicidade da versão e validação do hash são garantias da aplicação,
sem trigger SQL de bloqueio de conteúdo.

Na criação atual, inspeção/snapshot/itens/normas são gravados na mesma transação
de versão publicada íntegra. Fisicamente Inspection.checklistVersionId é
nullable e Inspection admite zero ou um snapshot; não converter essa regra
de fluxo em NOT NULL ou cardinalidade obrigatória no diagrama físico.

As associações históricas copiam type/code/title/summary/officialUrl e conservam
FK ao catálogo Standard. Relatórios/execução usam as cópias, preservando o
histórico mesmo após alteração do catálogo. InspectionResponse aceita
snapshotItemId e checklistItemId nullable, com CHECK OR inclusivo que exige
pelo menos um; ambos podem coexistir. Há dois UNIQUE por inspectionId/item.
O Service resolve item no snapshot da própria inspeção; a FK simples não o garante.

Backfill: LEGACY_BACKFILL, UNVERIFIED_LEGACY e formato 0 indicam melhor estado
recuperável, sem prova do conteúdo original. ChecklistItem,
ChecklistItemStandard e referências legadas continuam vigentes. Não apagar
nem tratá-los como caminho principal de novas inspeções.

## Tratativa, evidências e relatório

Uma resposta admite zero ou uma NonConformity (FK única); cada NC pode ter
várias ações. CorrectiveAction preserva o 5W2H: description obrigatório;
why/location/responsible/method/estimatedCost nullable como TEXT; dueDate e
completedAt nullable como TIMESTAMP(3). responsible não é FK e estimatedCost
não é Decimal/Float/moeda. Conclusão, atraso e validações pertencem à aplicação.

Evidence tem duas FKs nullable com CHECK XOR: exatamente inspectionId OU
nonConformityId. FK garante pai existente; Service exige contexto histórico,
proprietário e arquivo válido. Binários ficam no Cloudinary; banco mantém
publicId único, URL, nome, MIME, tamanho BIGINT, dimensões e timestamps.
Backfill de publicId usa `legacy/<id>`, sem declarar arquivos antigos como geridos
pelo provedor. As duas FKs atuais são RESTRICT, substituindo o SET NULL inicial.

Report é uma tabela persistível, com inspectionId único, generatedById,
version, generatedAt e observations. Zero ou uma linha por inspeção; não há
histórico de várias linhas apenas por existir version. O ReportRepository
atual lê Inspection e monta DTO/HTML sob demanda. Visualização/impressão pelo
navegador não cria automaticamente Report nem armazena PDF na tabela.

## Sincronização e hashes

OfflineSyncOperation contém id, userId, inspectionId, type, payloadHash,
clientCreatedAt e completedAt; **não tem status ou payload completo**.
Linha = confirmação remota, não fila IndexedDB. ID do cliente é obrigatório
sem default; completedAt tem CURRENT_TIMESTAMP. A PK deduplica UUID;
hash não é UNIQUE. Igualdade de usuário/inspeção/tipo/hash e atomicidade com a
mutação são controladas pela aplicação, não por CHECK de comparação de payload.

InspectionResponse.updatedAt é revisão remota; clientUpdatedAt preserva relógio
do dispositivo. Comparação otimista é da aplicação, sem Last Write Wins ou
contador numérico físico. O schema não representa suporte offline completo.

Hashes: ChecklistVersion.contentHash (nullable),
InspectionChecklistSnapshot.contentHash (obrigatório) e
OfflineSyncOperation.payloadHash (obrigatório), todos CHAR(64), com CHECK de
hexadecimal minúsculo. SHA-256 de conteúdo e de operação têm finalidades
distintas; CHECK valida formato, não recalcula o digest.

## Ações referenciais e divergência conhecida

As FKs criadas pelas migrations vigentes usam ON DELETE RESTRICT e ON UPDATE
CASCADE. Soft delete não dispara ação referencial. Há uma diferença de schema:
Checklist.createdById nullable sem onDelete explícito gera SET NULL no DDL
offline do Prisma; a migration inicial criou RESTRICT e a institucional não
recriou a FK. O estado migrado permanece RESTRICT. Não usar db push como
equivalente ao histórico de migrations. Detalhes e método no
[dicionário, seção 8](../Documentation/DicionarioDeDados.md#8-divergência-constatada-entre-schema-e-migrations).
Alinhar essa ação exige decisão de implementação em tarefa própria; nenhuma
alteração estrutural foi necessária nesta fase documental.

## Manutenção e referências

Respeitar Repository → Prisma → PostgreSQL; regras de negócio em Services,
entradas validadas no servidor. Não acessar Prisma nas telas/rotas. Não
reescrever migrations históricas. Mudanças futuras exigem migration própria
e atualização dos modelos/dicionário; não modificar produção manualmente.
Seeds institucionais contextualizam conteúdo, não são DDL e não substituem
enum/constraint. Catálogo e implantação: [OfficialTemplates.md](./OfficialTemplates.md).
Detalhes de aplicação: [ChecklistCopy.md](./ChecklistCopy.md) e
[Offline.md](./Offline.md).

Modelos atuais:

- [Conceitual com Mermaid](../Documentation/ModeloConceitualDoBancoDeDados.md) e
  [PlantUML](../Documentation/diagrams/database/conceptual.puml).
- [Lógico com Mermaid](../Documentation/ModeloLogico.md) e
  [PlantUML](../Documentation/diagrams/database/logical.puml).
- [Físico com Mermaid](../Documentation/ModeloFisicoDB.md) e
  [PlantUML](../Documentation/diagrams/database/physical.puml).

Os inventários de todas as migrations, índices/constraints e FKs estão no
dicionário. Orientações antigas de timestamps universais, IDs não nativos ou
remoção futura do legado não definem o estado atual; o histórico permanece no Git.
Esta revisão não altera BusinessRules, Architecture, API, telas ou código.
