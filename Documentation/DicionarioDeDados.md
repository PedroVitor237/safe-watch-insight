# Dicionário de Dados — Safe Watch Insight

Documentação da Fase 2, conferida em 3 de outubro de 2026 no HEAD
`0e7c6e4fcebb3edaf8c5eba3efd23dc357dfb8f9`. Fontes primárias:
[schema Prisma](../prisma/schema.prisma) e as seis
[migrations](../prisma/migrations/). O estado físico descrito é o resultado
dessas migrations, sem consulta de catálogo a um banco remoto nesta tarefa.
Services/Repositories são citados somente para distinguir garantias da aplicação.

## 1. Escopo e convenções

Este é o artefato canônico para campos, enums, chaves, FKs, índices e CHECKs.
São **19 models/tabelas**, **12 enums PostgreSQL**, três PKs compostas e
16 PKs simples UUID. As tabelas e colunas têm os nomes exatos do schema,
sem @map/@@map; no SQL usam aspas para preservar PascalCase/camelCase.
Campos de navegação Prisma (relações e listas) não são colunas adicionais.

Null = Sim permite NULL no banco; ausência de default não equivale a um
default NULL declarado. @default(uuid()) é geração do Prisma quando o ID é
omitido, não DEFAULT gen_random_uuid() no PostgreSQL. IDs também podem ser
fornecidos explicitamente, por exemplo pelo bootstrap/cópia/evidências.
Somente OfflineSyncOperation exige ID fornecido, sem default Prisma.

DateTime está implementado como TIMESTAMP(3) **sem fuso horário**, não DATE
nem TIMESTAMPTZ. now() corresponde a CURRENT_TIMESTAMP no DDL. @updatedAt
é comportamento do Prisma; não existe trigger SQL nem default universal de
atualização. TEXT não implica limite físico de 255 caracteres. Tipos enum
usam o nome exato do tipo PostgreSQL. UK marca unicidade de campo isolado;
unicidades compostas são descritas nos índices, sem atribuir UK global a
versionNumber ou orderIndex. Exclusão lógica não remove a linha de índices/FKs.

## 2. Inventário por grupo

| Grupo                              | Models                                                                                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identidade e cadastro              | [User](#user), [Company](#company), [Standard](#standard)                                                                                                                                                                                               |
| Checklist e compatibilidade        | [Checklist](#checklist), [ChecklistItem](#checklistitem), [ChecklistItemStandard](#checklistitemstandard)                                                                                                                                               |
| Versionamento                      | [ChecklistVersion](#checklistversion), [ChecklistVersionItem](#checklistversionitem), [ChecklistVersionItemStandard](#checklistversionitemstandard)                                                                                                     |
| Inspeção e histórico               | [Inspection](#inspection), [InspectionChecklistSnapshot](#inspectionchecklistsnapshot), [InspectionSnapshotItem](#inspectionsnapshotitem), [InspectionSnapshotItemStandard](#inspectionsnapshotitemstandard), [InspectionResponse](#inspectionresponse) |
| Tratativa                          | [NonConformity](#nonconformity), [CorrectiveAction](#correctiveaction)                                                                                                                                                                                  |
| Evidências e relatório persistível | [Evidence](#evidence), [Report](#report)                                                                                                                                                                                                                |
| Sincronização                      | [OfflineSyncOperation](#offlinesyncoperation)                                                                                                                                                                                                           |

## 3. Enums

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

Os valores expressam estados/classificações declarados. O enum isolado não
garante transições, permissões, cálculo de atraso ou vínculo entre entidades.
SyncStatus pertence à inspeção; a operação remota offline não usa esse enum.

## 4. Entidades e campos

<a id="user"></a>

### User

Representa o usuário autenticado, sua identificação, credencial armazenada como hash e perfil declarado.

Tabela física: `"User"`. PK: `(id)`.

| Campo       | Tipo Prisma | Tipo PostgreSQL | Null | Default / gestão Prisma               | Chave | Descrição                                                                                                  |
| ----------- | ----------- | --------------- | ---- | ------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| `id`        | `String`    | `UUID`          | Não  | Prisma: uuid(); SQL: sem default      | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).               |
| `name`      | `String`    | `TEXT`          | Não  | Sem default                           | —     | Nome do usuário.                                                                                           |
| `email`     | `String`    | `TEXT`          | Não  | Sem default                           | UK    | E-mail de identificação/login; unicidade física.                                                           |
| `password`  | `String`    | `TEXT`          | Não  | Sem default                           | —     | Hash bcrypt da senha no fluxo atual; a coluna TEXT não verifica o algoritmo.                               |
| `role`      | `UserRole`  | `"UserRole"`    | Não  | Sem default                           | —     | Perfil declarado do usuário; o enum não implementa permissões por si só.                                   |
| `createdAt` | `DateTime`  | `TIMESTAMP(3)`  | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                 |
| `updatedAt` | `DateTime`  | `TIMESTAMP(3)`  | Não  | Sem default SQL; @updatedAt no Prisma | —     | Horário de atualização gerenciado pelo Prisma (@updatedAt); não há default SQL nem trigger de atualização. |
| `deletedAt` | `DateTime?` | `TIMESTAMP(3)`  | Sim  | Sem default                           | —     | Marcador opcional de exclusão lógica; não dispara cascade e não libera chaves únicas.                      |

Relações de saída: nenhuma.

Referenciado por: `Company.createdById`; `Checklist.createdById`; `Inspection.userId`; `Report.generatedById`; `ChecklistVersion.createdById`; `ChecklistVersion.publishedById`; `OfflineSyncOperation.userId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `User_email_key`, `User_role_idx`, `User_deletedAt_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

O banco impõe unicidade de email, mas não verifica hash de senha nem implementa autorização por perfil. O hash bcrypt é produzido por [password.ts](../src/server/auth/password.ts).

<a id="company"></a>

### Company

Representa a empresa fiscalizada, seus dados cadastrais e o usuário responsável pelo cadastro.

Tabela física: `"Company"`. PK: `(id)`.

| Campo           | Tipo Prisma | Tipo PostgreSQL | Null | Default / gestão Prisma               | Chave | Descrição                                                                                                  |
| --------------- | ----------- | --------------- | ---- | ------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| `id`            | `String`    | `UUID`          | Não  | Prisma: uuid(); SQL: sem default      | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).               |
| `corporateName` | `String`    | `TEXT`          | Não  | Sem default                           | —     | Razão social da empresa.                                                                                   |
| `tradeName`     | `String?`   | `TEXT`          | Sim  | Sem default                           | —     | Nome fantasia, quando informado.                                                                           |
| `cnpj`          | `String?`   | `TEXT`          | Sim  | Sem default                           | UK    | CNPJ opcional; único entre valores não NULL.                                                               |
| `cnae`          | `String`    | `TEXT`          | Não  | Sem default                           | —     | Código CNAE informado para a empresa.                                                                      |
| `riskLevel`     | `Int`       | `INTEGER`       | Não  | Sem default                           | —     | Grau de risco informado; INTEGER sem CHECK de faixa nas migrations.                                        |
| `employeeCount` | `Int`       | `INTEGER`       | Não  | Sem default                           | —     | Quantidade informada de empregados; sem CHECK de faixa nas migrations.                                     |
| `address`       | `String?`   | `TEXT`          | Sim  | Sem default                           | —     | Endereço informado da empresa.                                                                             |
| `notes`         | `String?`   | `TEXT`          | Sim  | Sem default                           | —     | Observações da empresa ou inspeção.                                                                        |
| `createdById`   | `String`    | `UUID`          | Não  | Sem default                           | FK    | FK obrigatória para o usuário responsável pelo cadastro/propriedade da empresa.                            |
| `createdAt`     | `DateTime`  | `TIMESTAMP(3)`  | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                 |
| `updatedAt`     | `DateTime`  | `TIMESTAMP(3)`  | Não  | Sem default SQL; @updatedAt no Prisma | —     | Horário de atualização gerenciado pelo Prisma (@updatedAt); não há default SQL nem trigger de atualização. |
| `deletedAt`     | `DateTime?` | `TIMESTAMP(3)`  | Sim  | Sem default                           | —     | Marcador opcional de exclusão lógica; não dispara cascade e não libera chaves únicas.                      |

Relações de saída: `createdById` → `User.id`.

Referenciado por: `Inspection.companyId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `Company_cnpj_key`, `Company_createdById_idx`, `Company_cnpj_idx`, `Company_deletedAt_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

CNPJ é nullable. UNIQUE comum permite vários NULL; não há CHECK SQL para CNAE, grau de risco, quantidade ou formato de CNPJ.

<a id="standard"></a>

### Standard

Mantém o catálogo reutilizável de normas; versões e snapshots copiam seus metadados para preservar a fundamentação histórica.

Tabela física: `"Standard"`. PK: `(id)`.

| Campo         | Tipo Prisma    | Tipo PostgreSQL  | Null | Default / gestão Prisma          | Chave | Descrição                                                                                    |
| ------------- | -------------- | ---------------- | ---- | -------------------------------- | ----- | -------------------------------------------------------------------------------------------- |
| `id`          | `String`       | `UUID`           | Não  | Prisma: uuid(); SQL: sem default | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline). |
| `type`        | `StandardType` | `"StandardType"` | Não  | Sem default                      | —     | Tipo da norma; nas associações históricas é metadado copiado.                                |
| `code`        | `String`       | `TEXT`           | Não  | Sem default                      | UK    | Código da norma; único somente no catálogo Standard.                                         |
| `title`       | `String`       | `TEXT`           | Não  | Sem default                      | —     | Título da norma no catálogo reutilizável.                                                    |
| `summary`     | `String?`      | `TEXT`           | Sim  | Sem default                      | —     | Resumo normativo opcional.                                                                   |
| `officialUrl` | `String?`      | `TEXT`           | Sim  | Sem default                      | —     | URL de referência normativa opcional.                                                        |
| `isActive`    | `Boolean`      | `BOOLEAN`        | Não  | SQL/Prisma: true                 | —     | Indica disponibilidade ativa no catálogo; não equivale à exclusão lógica.                    |

Relações de saída: nenhuma.

Referenciado por: `ChecklistItemStandard.standardId`; `ChecklistVersionItemStandard.standardId`; `InspectionSnapshotItemStandard.standardId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `Standard_code_key`, `Standard_type_idx`, `Standard_code_idx`, `Standard_isActive_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

Não possui createdAt, updatedAt ou deletedAt. isActive controla disponibilidade do catálogo; associações históricas preservam cópias dos metadados.

<a id="checklist"></a>

### Checklist

Mantém a identidade reutilizável do checklist e sua propriedade pessoal ou institucional; o conteúdo executável pertence às versões.

Tabela física: `"Checklist"`. PK: `(id)`.

| Campo         | Tipo Prisma | Tipo PostgreSQL | Null | Default / gestão Prisma               | Chave | Descrição                                                                                                  |
| ------------- | ----------- | --------------- | ---- | ------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| `id`          | `String`    | `UUID`          | Não  | Prisma: uuid(); SQL: sem default      | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).               |
| `title`       | `String`    | `TEXT`          | Não  | Sem default                           | —     | Título atual da identidade reutilizável do checklist; não reconstrói títulos históricos.                   |
| `description` | `String?`   | `TEXT`          | Sim  | Sem default                           | —     | Descrição atual da identidade do checklist.                                                                |
| `isTemplate`  | `Boolean`   | `BOOLEAN`       | Não  | SQL/Prisma: false                     | —     | Indica classificação como template; não implica propriedade institucional.                                 |
| `isOfficial`  | `Boolean`   | `BOOLEAN`       | Não  | SQL/Prisma: false                     | —     | Indica conteúdo institucional da Safe Watch Insight, sem proprietário usuário.                             |
| `isActive`    | `Boolean`   | `BOOLEAN`       | Não  | SQL/Prisma: true                      | —     | Indica disponibilidade ativa no catálogo; não equivale à exclusão lógica.                                  |
| `createdById` | `String?`   | `UUID`          | Sim  | Sem default                           | FK    | FK nullable para o proprietário pessoal; CHECK exige NULL em oficial e valor em pessoal.                   |
| `createdAt`   | `DateTime`  | `TIMESTAMP(3)`  | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                 |
| `updatedAt`   | `DateTime`  | `TIMESTAMP(3)`  | Não  | Sem default SQL; @updatedAt no Prisma | —     | Horário de atualização gerenciado pelo Prisma (@updatedAt); não há default SQL nem trigger de atualização. |
| `deletedAt`   | `DateTime?` | `TIMESTAMP(3)`  | Sim  | Sem default                           | —     | Marcador opcional de exclusão lógica; não dispara cascade e não libera chaves únicas.                      |

Relações de saída: `createdById` → `User.id`.

Referenciado por: `ChecklistItem.checklistId`; `Inspection.checklistId`; `ChecklistVersion.checklistId`; `InspectionChecklistSnapshot.sourceChecklistId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `Checklist_createdById_idx`, `Checklist_isTemplate_idx`, `Checklist_isActive_idx`, `Checklist_deletedAt_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: `Checklist_ownership_check`.

O proprietário pessoal (createdById) não é o autor/publicador de cada versão. Checklist_ownership_check obriga: oficial = isOfficial=true, isTemplate=true, createdById=NULL; pessoal = isOfficial=false, createdById preenchido. Templates pessoais são permitidos. Não existe conta institucional fictícia. A FK criada nas migrations permanece RESTRICT; o schema nullable sem onDelete explicita uma divergência (ver seção 8).

<a id="checklistitem"></a>

### ChecklistItem

Mantém perguntas do checklist anterior ao versionamento, necessárias às referências de compatibilidade e ao backfill.

Tabela física: `"ChecklistItem"`. PK: `(id)`.

| Campo         | Tipo Prisma | Tipo PostgreSQL | Null | Default / gestão Prisma          | Chave | Descrição                                                                                    |
| ------------- | ----------- | --------------- | ---- | -------------------------------- | ----- | -------------------------------------------------------------------------------------------- |
| `id`          | `String`    | `UUID`          | Não  | Prisma: uuid(); SQL: sem default | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline). |
| `checklistId` | `String`    | `UUID`          | Não  | Sem default                      | FK    | FK para a identidade do checklist.                                                           |
| `description` | `String`    | `TEXT`          | Não  | Sem default                      | —     | Texto da pergunta legada, anterior ao modelo de versões.                                     |
| `orderIndex`  | `Int`       | `INTEGER`       | Não  | Sem default                      | —     | Posição do item, única em conjunto com a FK de seu contêiner.                                |
| `isRequired`  | `Boolean`   | `BOOLEAN`       | Não  | SQL/Prisma: true                 | —     | Indica item obrigatório para a conclusão no fluxo de aplicação.                              |

Relações de saída: `checklistId` → `Checklist.id`.

Referenciado por: `ChecklistItemStandard.checklistItemId`; `InspectionResponse.checklistItemId`; `ChecklistVersionItem.sourceChecklistItemId`; `InspectionSnapshotItem.sourceChecklistItemId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `ChecklistItem_checklistId_idx`, `ChecklistItem_checklistId_orderIndex_key`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

Estrutura legada ainda vigente. Não possui timestamps e não há CHECK SQL de ordem positiva nesta tabela; apenas unicidade de (checklistId, orderIndex). Novas inspeções usam itens de versão/snapshot.

<a id="checklistitemstandard"></a>

### ChecklistItemStandard

Relaciona item legado e norma do catálogo, sem copiar metadados normativos.

Tabela física: `"ChecklistItemStandard"`. PK: `(checklistItemId, standardId)`.

| Campo             | Tipo Prisma | Tipo PostgreSQL | Null | Default / gestão Prisma | Chave           | Descrição                                         |
| ----------------- | ----------- | --------------- | ---- | ----------------------- | --------------- | ------------------------------------------------- |
| `checklistItemId` | `String`    | `UUID`          | Não  | Sem default             | PK composta, FK | FK para ChecklistItem; componente da PK composta. |
| `standardId`      | `String`    | `UUID`          | Não  | Sem default             | PK composta, FK | FK para Standard; componente da PK composta.      |

Relações de saída: `checklistItemId` → `ChecklistItem.id`; `standardId` → `Standard.id`.

Referenciado por: nenhuma. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `ChecklistItemStandard_standardId_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

A PK é (checklistItemId, standardId), formada pelas duas FKs. Não possui id independente, metadados copiados ou timestamps.

<a id="checklistversion"></a>

### ChecklistVersion

Representa uma revisão numerada do checklist, com estado editorial, autor, publicador, data, formato e hash de integridade do conteúdo.

Tabela física: `"ChecklistVersion"`. PK: `(id)`.

| Campo                  | Tipo Prisma              | Tipo PostgreSQL            | Null | Default / gestão Prisma               | Chave | Descrição                                                                                                       |
| ---------------------- | ------------------------ | -------------------------- | ---- | ------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------- |
| `id`                   | `String`                 | `UUID`                     | Não  | Prisma: uuid(); SQL: sem default      | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).                    |
| `checklistId`          | `String`                 | `UUID`                     | Não  | Sem default                           | FK    | FK para a identidade do checklist.                                                                              |
| `versionNumber`        | `Int`                    | `INTEGER`                  | Não  | Sem default                           | —     | Número positivo, único por checklist; não possui unicidade global.                                              |
| `status`               | `ChecklistVersionStatus` | `"ChecklistVersionStatus"` | Não  | SQL/Prisma: 'DRAFT'                   | —     | Estado editorial: DRAFT, PUBLISHED ou RETIRED; sujeito ao CHECK de publicação.                                  |
| `title`                | `String`                 | `TEXT`                     | Não  | Sem default                           | —     | Título do conteúdo nesta versão, preservado ao publicar.                                                        |
| `description`          | `String?`                | `TEXT`                     | Sim  | Sem default                           | —     | Descrição do conteúdo nesta versão; pode incluir fonte e limites institucionais.                                |
| `contentSchemaVersion` | `Int`                    | `INTEGER`                  | Não  | SQL/Prisma: 1                         | —     | Versão do formato canônico do conteúdo; zero identifica formato do backfill.                                    |
| `contentHash`          | `String?`                | `CHAR(64)`                 | Sim  | Sem default                           | —     | SHA-256 hexadecimal do conteúdo canônico; formato validado por CHECK, não recalculado pelo banco.               |
| `createdById`          | `String?`                | `UUID`                     | Sim  | Sem default                           | FK    | Autor da criação da versão, distinto do proprietário do checklist e do publicador; NULL no fluxo institucional. |
| `publishedById`        | `String?`                | `UUID`                     | Sim  | Sem default                           | FK    | FK para o usuário publicador; NULL no draft e permitido na publicação institucional.                            |
| `publishedAt`          | `DateTime?`              | `TIMESTAMP(3)`             | Sim  | Sem default                           | —     | Momento da publicação; separado da criação da versão.                                                           |
| `createdAt`            | `DateTime`               | `TIMESTAMP(3)`             | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                      |
| `updatedAt`            | `DateTime`               | `TIMESTAMP(3)`             | Não  | Sem default SQL; @updatedAt no Prisma | —     | Horário de atualização gerenciado pelo Prisma (@updatedAt); não há default SQL nem trigger de atualização.      |

Relações de saída: `checklistId` → `Checklist.id`; `createdById` → `User.id`; `publishedById` → `User.id`.

Referenciado por: `ChecklistVersionItem.checklistVersionId`; `Inspection.checklistVersionId`; `InspectionChecklistSnapshot.sourceChecklistVersionId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `ChecklistVersion_checklistId_versionNumber_key`, `ChecklistVersion_one_draft_per_checklist_key`, `ChecklistVersion_checklistId_status_idx`, `ChecklistVersion_status_idx`, `ChecklistVersion_publishedAt_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: `ChecklistVersion_versionNumber_check`, `ChecklistVersion_contentSchemaVersion_check`, `ChecklistVersion_contentHash_check`, `ChecklistVersion_publicationState_check`.

Não há FK de versão anterior neste model. A origem é registrada por item em ChecklistVersionItem.sourceVersionItemId. versionNumber é único com checklistId; numeração monotônica é calculada na aplicação. O índice parcial limita um DRAFT por checklist. O CHECK vigente permite publicador NULL em PUBLISHED/RETIRED se createdById for NULL, mas não verifica se o checklist pai é oficial nem se o autor é seu proprietário. O bootstrap institucional grava ambos os autores NULL; versões pessoais são atribuídas à sessão. Publicação/integridade e imutabilidade dependem também da aplicação, sem trigger SQL de imutabilidade.

<a id="checklistversionitem"></a>

### ChecklistVersionItem

Mantém a pergunta de uma versão, sua ordem, obrigatoriedade e referências de linhagem.

Tabela física: `"ChecklistVersionItem"`. PK: `(id)`.

| Campo                   | Tipo Prisma | Tipo PostgreSQL | Null | Default / gestão Prisma               | Chave | Descrição                                                                                                  |
| ----------------------- | ----------- | --------------- | ---- | ------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| `id`                    | `String`    | `UUID`          | Não  | Prisma: uuid(); SQL: sem default      | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).               |
| `checklistVersionId`    | `String`    | `UUID`          | Não  | Sem default                           | FK    | FK para a versão de checklist.                                                                             |
| `sourceVersionItemId`   | `String?`   | `UUID`          | Sim  | Sem default                           | FK    | FK para o item de versão de origem; registra linhagem.                                                     |
| `sourceChecklistItemId` | `String?`   | `UUID`          | Sim  | Sem default                           | FK    | FK opcional para o item legado de origem.                                                                  |
| `description`           | `String`    | `TEXT`          | Não  | Sem default                           | —     | Texto da pergunta pertencente à versão.                                                                    |
| `orderIndex`            | `Int`       | `INTEGER`       | Não  | Sem default                           | —     | Posição do item, única em conjunto com a FK de seu contêiner.                                              |
| `isRequired`            | `Boolean`   | `BOOLEAN`       | Não  | SQL/Prisma: true                      | —     | Indica item obrigatório para a conclusão no fluxo de aplicação.                                            |
| `createdAt`             | `DateTime`  | `TIMESTAMP(3)`  | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                 |
| `updatedAt`             | `DateTime`  | `TIMESTAMP(3)`  | Não  | Sem default SQL; @updatedAt no Prisma | —     | Horário de atualização gerenciado pelo Prisma (@updatedAt); não há default SQL nem trigger de atualização. |

Relações de saída: `checklistVersionId` → `ChecklistVersion.id`; `sourceVersionItemId` → `ChecklistVersionItem.id`; `sourceChecklistItemId` → `ChecklistItem.id`.

Referenciado por: `ChecklistVersionItem.sourceVersionItemId`; `ChecklistVersionItemStandard.checklistVersionItemId`; `InspectionSnapshotItem.sourceVersionItemId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `ChecklistVersionItem_checklistVersionId_orderIndex_key`, `ChecklistVersionItem_checklistVersionId_idx`, `ChecklistVersionItem_sourceVersionItemId_idx`, `ChecklistVersionItem_sourceChecklistItemId_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: `ChecklistVersionItem_orderIndex_check`.

sourceVersionItemId é nullable e autorreferente; registra origem por item sem impor ausência de ciclos por CHECK. sourceChecklistItemId preserva linhagem legada. A ordem é positiva e única por versão, sem exigência SQL de sequência contígua.

<a id="checklistversionitemstandard"></a>

### ChecklistVersionItemStandard

Associa uma norma ao item de versão e preserva os metadados normativos copiados na publicação.

Tabela física: `"ChecklistVersionItemStandard"`. PK: `(checklistVersionItemId, standardId)`.

| Campo                    | Tipo Prisma    | Tipo PostgreSQL  | Null | Default / gestão Prisma | Chave           | Descrição                                                                      |
| ------------------------ | -------------- | ---------------- | ---- | ----------------------- | --------------- | ------------------------------------------------------------------------------ |
| `checklistVersionItemId` | `String`       | `UUID`           | Não  | Sem default             | PK composta, FK | FK para o item de versão; componente da PK composta.                           |
| `standardId`             | `String`       | `UUID`           | Não  | Sem default             | PK composta, FK | FK para Standard; componente da PK composta.                                   |
| `type`                   | `StandardType` | `"StandardType"` | Não  | Sem default             | —               | Tipo da norma; nas associações históricas é metadado copiado.                  |
| `code`                   | `String`       | `TEXT`           | Não  | Sem default             | —               | Código da norma; único somente no catálogo Standard.                           |
| `title`                  | `String`       | `TEXT`           | Não  | Sem default             | —               | Título da norma copiado para a versão; independente de alterações no catálogo. |
| `summary`                | `String?`      | `TEXT`           | Sim  | Sem default             | —               | Resumo normativo opcional.                                                     |
| `officialUrl`            | `String?`      | `TEXT`           | Sim  | Sem default             | —               | URL de referência normativa opcional.                                          |

Relações de saída: `checklistVersionItemId` → `ChecklistVersionItem.id`; `standardId` → `Standard.id`.

Referenciado por: nenhuma. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `ChecklistVersionItemStandard_standardId_idx`, `ChecklistVersionItemStandard_code_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

A PK composta reúne as FKs (checklistVersionItemId, standardId). type/code/title são obrigatórios; summary/officialUrl opcionais. As cópias não são atualizadas automaticamente ao mudar Standard; a FK não obriga igualdade de metadados.

<a id="inspection"></a>

### Inspection

Registra a inspeção de uma empresa pelo usuário responsável, com checklist, versão opcional fisicamente e estados de execução/sincronização.

Tabela física: `"Inspection"`. PK: `(id)`.

| Campo                | Tipo Prisma        | Tipo PostgreSQL      | Null | Default / gestão Prisma               | Chave | Descrição                                                                                                  |
| -------------------- | ------------------ | -------------------- | ---- | ------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| `id`                 | `String`           | `UUID`               | Não  | Prisma: uuid(); SQL: sem default      | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).               |
| `userId`             | `String`           | `UUID`               | Não  | Sem default                           | FK    | FK para o usuário responsável pelo contexto.                                                               |
| `companyId`          | `String`           | `UUID`               | Não  | Sem default                           | FK    | FK para a empresa inspecionada.                                                                            |
| `checklistId`        | `String`           | `UUID`               | Não  | Sem default                           | FK    | FK para a identidade do checklist.                                                                         |
| `checklistVersionId` | `String?`          | `UUID`               | Sim  | Sem default                           | FK    | FK para a versão de checklist.                                                                             |
| `inspectionDate`     | `DateTime`         | `TIMESTAMP(3)`       | Não  | Sem default                           | —     | Data/hora informada da inspeção.                                                                           |
| `status`             | `InspectionStatus` | `"InspectionStatus"` | Não  | SQL/Prisma: 'PLANNED'                 | —     | Estado de execução da inspeção.                                                                            |
| `syncStatus`         | `SyncStatus`       | `"SyncStatus"`       | Não  | SQL/Prisma: 'SYNCED'                  | —     | Estado de sincronização declarado da inspeção; não representa a fila local de operações.                   |
| `notes`              | `String?`          | `TEXT`               | Sim  | Sem default                           | —     | Observações da empresa ou inspeção.                                                                        |
| `createdAt`          | `DateTime`         | `TIMESTAMP(3)`       | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                 |
| `updatedAt`          | `DateTime`         | `TIMESTAMP(3)`       | Não  | Sem default SQL; @updatedAt no Prisma | —     | Horário de atualização gerenciado pelo Prisma (@updatedAt); não há default SQL nem trigger de atualização. |
| `deletedAt`          | `DateTime?`        | `TIMESTAMP(3)`       | Sim  | Sem default                           | —     | Marcador opcional de exclusão lógica; não dispara cascade e não libera chaves únicas.                      |

Relações de saída: `userId` → `User.id`; `companyId` → `Company.id`; `checklistId` → `Checklist.id`; `checklistVersionId` → `ChecklistVersion.id`.

Referenciado por: `InspectionResponse.inspectionId`; `Report.inspectionId`; `InspectionChecklistSnapshot.inspectionId`; `Evidence.inspectionId`; `OfflineSyncOperation.inspectionId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `Inspection_userId_idx`, `Inspection_companyId_idx`, `Inspection_checklistId_idx`, `Inspection_inspectionDate_idx`, `Inspection_status_idx`, `Inspection_syncStatus_idx`, `Inspection_deletedAt_idx`, `Inspection_checklistVersionId_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

Fisicamente checklistVersionId é nullable e uma Inspection pode ter zero ou um snapshot: a FK única fica em InspectionChecklistSnapshot, não há exigência inversa no banco. O fluxo atual usa versão PUBLISHED e cria inspeção/snapshot/itens/normas na mesma transação. O banco não verifica que checklistVersionId pertence a checklistId, nem a igualdade com as FKs de origem do snapshot.

<a id="inspectionchecklistsnapshot"></a>

### InspectionChecklistSnapshot

Captura o conteúdo histórico de uma inspeção, sua origem, versão, formato e condição de integridade.

Tabela física: `"InspectionChecklistSnapshot"`. PK: `(id)`.

| Campo                      | Tipo Prisma                         | Tipo PostgreSQL                       | Null | Default / gestão Prisma               | Chave  | Descrição                                                                                         |
| -------------------------- | ----------------------------------- | ------------------------------------- | ---- | ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `id`                       | `String`                            | `UUID`                                | Não  | Prisma: uuid(); SQL: sem default      | PK     | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).      |
| `inspectionId`             | `String`                            | `UUID`                                | Não  | Sem default                           | FK, UK | FK para a inspeção.                                                                               |
| `sourceChecklistId`        | `String`                            | `UUID`                                | Não  | Sem default                           | FK     | FK para o checklist de origem do conteúdo capturado.                                              |
| `sourceChecklistVersionId` | `String`                            | `UUID`                                | Não  | Sem default                           | FK     | FK para a versão de origem do snapshot.                                                           |
| `sourceVersionNumber`      | `Int`                               | `INTEGER`                             | Não  | Sem default                           | —      | Número da versão capturada, positivo por CHECK.                                                   |
| `title`                    | `String`                            | `TEXT`                                | Não  | Sem default                           | —      | Título capturado da versão usada na inspeção.                                                     |
| `description`              | `String?`                           | `TEXT`                                | Sim  | Sem default                           | —      | Descrição capturada da versão usada na inspeção.                                                  |
| `isTemplate`               | `Boolean`                           | `BOOLEAN`                             | Não  | Sem default                           | —      | Indica classificação como template; não implica propriedade institucional.                        |
| `snapshotSchemaVersion`    | `Int`                               | `INTEGER`                             | Não  | SQL/Prisma: 1                         | —      | Formato do conteúdo capturado; zero no backfill, um no formato atual.                             |
| `contentHash`              | `String`                            | `CHAR(64)`                            | Não  | Sem default                           | —      | SHA-256 hexadecimal do conteúdo canônico; formato validado por CHECK, não recalculado pelo banco. |
| `origin`                   | `InspectionSnapshotOrigin`          | `"InspectionSnapshotOrigin"`          | Não  | Sem default                           | —      | Distingue captura na criação da inspeção de importação legada.                                    |
| `integrityStatus`          | `InspectionSnapshotIntegrityStatus` | `"InspectionSnapshotIntegrityStatus"` | Não  | Sem default                           | —      | Marca conteúdo verificado no fluxo atual ou legado não verificável.                               |
| `capturedAt`               | `DateTime`                          | `TIMESTAMP(3)`                        | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —      | Momento de captura/importação do snapshot, não a data original da inspeção.                       |

Relações de saída: `inspectionId` → `Inspection.id`; `sourceChecklistId` → `Checklist.id`; `sourceChecklistVersionId` → `ChecklistVersion.id`.

Referenciado por: `InspectionSnapshotItem.snapshotId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `InspectionChecklistSnapshot_inspectionId_key`, `InspectionChecklistSnapshot_sourceChecklistId_idx`, `InspectionChecklistSnapshot_sourceChecklistVersionId_idx`, `InspectionChecklistSnapshot_origin_idx`, `InspectionChecklistSnapshot_integrityStatus_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: `InspectionChecklistSnapshot_sourceVersionNumber_check`, `InspectionChecklistSnapshot_schemaVersion_check`, `InspectionChecklistSnapshot_contentHash_check`.

inspectionId é obrigatório e único: cada snapshot pertence a uma inspeção, que fisicamente pode não ter snapshot. Não possui createdAt/updatedAt/deletedAt; capturedAt registra captura/backfill. O banco aceita os valores dos enums, mas não impõe a combinação entre origin, integrityStatus e snapshotSchemaVersion. O fluxo novo usa INSPECTION_CREATION/VERIFIED/formato 1; o backfill usa LEGACY_BACKFILL/UNVERIFIED_LEGACY/formato 0.

<a id="inspectionsnapshotitem"></a>

### InspectionSnapshotItem

Preserva a pergunta capturada na inspeção, sua ordem, obrigatoriedade e origem.

Tabela física: `"InspectionSnapshotItem"`. PK: `(id)`.

| Campo                   | Tipo Prisma | Tipo PostgreSQL | Null | Default / gestão Prisma          | Chave | Descrição                                                                                    |
| ----------------------- | ----------- | --------------- | ---- | -------------------------------- | ----- | -------------------------------------------------------------------------------------------- |
| `id`                    | `String`    | `UUID`          | Não  | Prisma: uuid(); SQL: sem default | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline). |
| `snapshotId`            | `String`    | `UUID`          | Não  | Sem default                      | FK    | FK para o snapshot que contém o item.                                                        |
| `sourceVersionItemId`   | `String`    | `UUID`          | Não  | Sem default                      | FK    | FK para o item de versão de origem; registra linhagem.                                       |
| `sourceChecklistItemId` | `String?`   | `UUID`          | Sim  | Sem default                      | FK    | FK opcional para o item legado de origem.                                                    |
| `description`           | `String`    | `TEXT`          | Não  | Sem default                      | —     | Texto da pergunta preservado na captura histórica.                                           |
| `orderIndex`            | `Int`       | `INTEGER`       | Não  | Sem default                      | —     | Posição do item, única em conjunto com a FK de seu contêiner.                                |
| `isRequired`            | `Boolean`   | `BOOLEAN`       | Não  | SQL/Prisma: true                 | —     | Indica item obrigatório para a conclusão no fluxo de aplicação.                              |

Relações de saída: `snapshotId` → `InspectionChecklistSnapshot.id`; `sourceVersionItemId` → `ChecklistVersionItem.id`; `sourceChecklistItemId` → `ChecklistItem.id`.

Referenciado por: `InspectionSnapshotItemStandard.snapshotItemId`; `InspectionResponse.snapshotItemId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `InspectionSnapshotItem_snapshotId_orderIndex_key`, `InspectionSnapshotItem_snapshotId_idx`, `InspectionSnapshotItem_sourceVersionItemId_idx`, `InspectionSnapshotItem_sourceChecklistItemId_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: `InspectionSnapshotItem_orderIndex_check`.

sourceVersionItemId é obrigatório nesta tabela, diferente da linhagem opcional do item de versão. Não possui timestamps. As FKs não verificam que o item de origem pertence à versão indicada pelo snapshot.

<a id="inspectionsnapshotitemstandard"></a>

### InspectionSnapshotItemStandard

Preserva a fundamentação normativa capturada por item do snapshot, mantendo também a FK ao catálogo.

Tabela física: `"InspectionSnapshotItemStandard"`. PK: `(snapshotItemId, standardId)`.

| Campo            | Tipo Prisma    | Tipo PostgreSQL  | Null | Default / gestão Prisma | Chave           | Descrição                                                             |
| ---------------- | -------------- | ---------------- | ---- | ----------------------- | --------------- | --------------------------------------------------------------------- |
| `snapshotItemId` | `String`       | `UUID`           | Não  | Sem default             | PK composta, FK | FK para InspectionSnapshotItem; componente da PK composta.            |
| `standardId`     | `String`       | `UUID`           | Não  | Sem default             | PK composta, FK | FK para Standard; componente da PK composta.                          |
| `type`           | `StandardType` | `"StandardType"` | Não  | Sem default             | —               | Tipo da norma; nas associações históricas é metadado copiado.         |
| `code`           | `String`       | `TEXT`           | Não  | Sem default             | —               | Código da norma; único somente no catálogo Standard.                  |
| `title`          | `String`       | `TEXT`           | Não  | Sem default             | —               | Título normativo capturado no snapshot; usado para leitura histórica. |
| `summary`        | `String?`      | `TEXT`           | Sim  | Sem default             | —               | Resumo normativo opcional.                                            |
| `officialUrl`    | `String?`      | `TEXT`           | Sim  | Sem default             | —               | URL de referência normativa opcional.                                 |

Relações de saída: `snapshotItemId` → `InspectionSnapshotItem.id`; `standardId` → `Standard.id`.

Referenciado por: nenhuma. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `InspectionSnapshotItemStandard_standardId_idx`, `InspectionSnapshotItemStandard_code_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

PK (snapshotItemId, standardId), formada pelas FKs. Guarda cópias históricas normativas; não possui timestamps. O relatório usa estes metadados, sem reconstruí-los pelo catálogo atual.

<a id="inspectionresponse"></a>

### InspectionResponse

Registra a resposta e observação de uma inspeção, com referência histórica ou legada e horários distintos do servidor e dispositivo.

Tabela física: `"InspectionResponse"`. PK: `(id)`.

| Campo             | Tipo Prisma      | Tipo PostgreSQL    | Null | Default / gestão Prisma               | Chave | Descrição                                                                                                      |
| ----------------- | ---------------- | ------------------ | ---- | ------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| `id`              | `String`         | `UUID`             | Não  | Prisma: uuid(); SQL: sem default      | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).                   |
| `inspectionId`    | `String`         | `UUID`             | Não  | Sem default                           | FK    | FK para a inspeção.                                                                                            |
| `checklistItemId` | `String?`        | `UUID`             | Sim  | Sem default                           | FK    | FK para item legado do checklist.                                                                              |
| `snapshotItemId`  | `String?`        | `UUID`             | Sim  | Sem default                           | FK    | FK para o item histórico do snapshot.                                                                          |
| `status`          | `ResponseStatus` | `"ResponseStatus"` | Não  | Sem default                           | —     | Classificação da resposta: conforme, não conforme ou não aplicável.                                            |
| `observation`     | `String?`        | `TEXT`             | Sim  | Sem default                           | —     | Observação textual da resposta.                                                                                |
| `clientUpdatedAt` | `DateTime?`      | `TIMESTAMP(3)`     | Sim  | Sem default                           | —     | Horário informado pelo dispositivo para a resposta offline; não substitui a revisão remota.                    |
| `createdAt`       | `DateTime`       | `TIMESTAMP(3)`     | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                     |
| `updatedAt`       | `DateTime`       | `TIMESTAMP(3)`     | Não  | Sem default SQL; @updatedAt no Prisma | —     | Revisão remota gerenciada por @updatedAt e comparada para detectar conflito otimista; não é contador numérico. |

Relações de saída: `inspectionId` → `Inspection.id`; `checklistItemId` → `ChecklistItem.id`; `snapshotItemId` → `InspectionSnapshotItem.id`.

Referenciado por: `NonConformity.inspectionResponseId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `InspectionResponse_inspectionId_idx`, `InspectionResponse_checklistItemId_idx`, `InspectionResponse_status_idx`, `InspectionResponse_inspectionId_checklistItemId_key`, `InspectionResponse_snapshotItemId_idx`, `InspectionResponse_inspectionId_snapshotItemId_key`. A PK também possui índice único B-tree próprio.

CHECKs físicos: `InspectionResponse_itemReference_check`.

snapshotItemId e checklistItemId são nullable individualmente; InspectionResponse_itemReference_check exige pelo menos um, permitindo ambos. Há dois UNIQUE compostos por inspectionId/item; valores NULL seguem a semântica normal de UNIQUE do PostgreSQL. A aplicação resolve o item dentro do snapshot da própria inspeção; a FK simples não garante isso. updatedAt é revisão remota, clientUpdatedAt é o relógio do dispositivo e não há contador de revisão numérico. No fluxo offline, clientUpdatedAt recebe clientCreatedAt da operação.

<a id="nonconformity"></a>

### NonConformity

Registra a irregularidade associada a uma resposta, sua gravidade, prazo e situação de tratamento.

Tabela física: `"NonConformity"`. PK: `(id)`.

| Campo                  | Tipo Prisma           | Tipo PostgreSQL         | Null | Default / gestão Prisma               | Chave  | Descrição                                                                                                  |
| ---------------------- | --------------------- | ----------------------- | ---- | ------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| `id`                   | `String`              | `UUID`                  | Não  | Prisma: uuid(); SQL: sem default      | PK     | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).               |
| `inspectionResponseId` | `String`              | `UUID`                  | Não  | Sem default                           | FK, UK | FK única para a resposta que originou a não conformidade.                                                  |
| `description`          | `String`              | `TEXT`                  | Não  | Sem default                           | —      | Descrição da irregularidade associada à resposta.                                                          |
| `severity`             | `Severity`            | `"Severity"`            | Não  | Sem default                           | —      | Classificação de gravidade da não conformidade.                                                            |
| `dueDate`              | `DateTime?`           | `TIMESTAMP(3)`          | Sim  | Sem default                           | —      | Prazo de tratamento informado; TIMESTAMP(3), nullable.                                                     |
| `status`               | `NonConformityStatus` | `"NonConformityStatus"` | Não  | SQL/Prisma: 'OPEN'                    | —      | Situação persistida de tratamento da não conformidade.                                                     |
| `createdAt`            | `DateTime`            | `TIMESTAMP(3)`          | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —      | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                 |
| `updatedAt`            | `DateTime`            | `TIMESTAMP(3)`          | Não  | Sem default SQL; @updatedAt no Prisma | —      | Horário de atualização gerenciado pelo Prisma (@updatedAt); não há default SQL nem trigger de atualização. |
| `deletedAt`            | `DateTime?`           | `TIMESTAMP(3)`          | Sim  | Sem default                           | —      | Marcador opcional de exclusão lógica; não dispara cascade e não libera chaves únicas.                      |

Relações de saída: `inspectionResponseId` → `InspectionResponse.id`.

Referenciado por: `CorrectiveAction.nonConformityId`; `Evidence.nonConformityId`. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `NonConformity_inspectionResponseId_key`, `NonConformity_severity_idx`, `NonConformity_status_idx`, `NonConformity_dueDate_idx`, `NonConformity_deletedAt_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

inspectionResponseId único limita uma NC por resposta, inclusive registros excluídos logicamente. A existência somente para resposta NON_COMPLIANT é regra de aplicação, não CHECK. Prazo e situação podem gerar apresentação de atraso sem mutação na leitura.

<a id="correctiveaction"></a>

### CorrectiveAction

Registra a ação de tratamento de uma não conformidade e os campos textuais/data do plano 5W2H.

Tabela física: `"CorrectiveAction"`. PK: `(id)`.

| Campo             | Tipo Prisma              | Tipo PostgreSQL            | Null | Default / gestão Prisma               | Chave | Descrição                                                                                                  |
| ----------------- | ------------------------ | -------------------------- | ---- | ------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| `id`              | `String`                 | `UUID`                     | Não  | Prisma: uuid(); SQL: sem default      | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).               |
| `nonConformityId` | `String`                 | `UUID`                     | Não  | Sem default                           | FK    | FK para a não conformidade.                                                                                |
| `description`     | `String`                 | `TEXT`                     | Não  | Sem default                           | —     | 5W2H: o que executar; descrição obrigatória da ação.                                                       |
| `why`             | `String?`                | `TEXT`                     | Sim  | Sem default                           | —     | 5W2H: por que executar a ação.                                                                             |
| `location`        | `String?`                | `TEXT`                     | Sim  | Sem default                           | —     | 5W2H: onde executar a ação.                                                                                |
| `responsible`     | `String?`                | `TEXT`                     | Sim  | Sem default                           | —     | 5W2H: quem executará a ação, como texto livre; não é FK para User.                                         |
| `dueDate`         | `DateTime?`              | `TIMESTAMP(3)`             | Sim  | Sem default                           | —     | Prazo de tratamento informado; TIMESTAMP(3), nullable.                                                     |
| `method`          | `String?`                | `TEXT`                     | Sim  | Sem default                           | —     | 5W2H: como executar a ação.                                                                                |
| `estimatedCost`   | `String?`                | `TEXT`                     | Sim  | Sem default                           | —     | 5W2H: quanto; texto livre opcional (String?/TEXT), sem tipo monetário ou cálculo SQL.                      |
| `status`          | `CorrectiveActionStatus` | `"CorrectiveActionStatus"` | Não  | SQL/Prisma: 'PENDING'                 | —     | Situação persistida de execução da ação corretiva.                                                         |
| `completedAt`     | `DateTime?`              | `TIMESTAMP(3)`             | Sim  | Sem default                           | —     | Horário de conclusão da ação corretiva.                                                                    |
| `createdAt`       | `DateTime`               | `TIMESTAMP(3)`             | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                 |
| `updatedAt`       | `DateTime`               | `TIMESTAMP(3)`             | Não  | Sem default SQL; @updatedAt no Prisma | —     | Horário de atualização gerenciado pelo Prisma (@updatedAt); não há default SQL nem trigger de atualização. |
| `deletedAt`       | `DateTime?`              | `TIMESTAMP(3)`             | Sim  | Sem default                           | —     | Marcador opcional de exclusão lógica; não dispara cascade e não libera chaves únicas.                      |

Relações de saída: `nonConformityId` → `NonConformity.id`.

Referenciado por: nenhuma. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `CorrectiveAction_nonConformityId_idx`, `CorrectiveAction_status_idx`, `CorrectiveAction_dueDate_idx`, `CorrectiveAction_deletedAt_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

5W2H: description (o quê), why (por quê), location (onde), responsible (quem), dueDate (quando), method (como), estimatedCost (quanto). Apenas description é obrigatória entre esses campos. responsible é texto livre, não vínculo com User. estimatedCost é String?/TEXT; não há precisão monetária, moeda ou conversão numérica no banco. completedAt é nullable; sua relação com status é controlada na aplicação.

<a id="evidence"></a>

### Evidence

Persiste metadados do arquivo externo associado exclusivamente a uma inspeção ou a uma não conformidade.

Tabela física: `"Evidence"`. PK: `(id)`.

| Campo             | Tipo Prisma | Tipo PostgreSQL | Null | Default / gestão Prisma               | Chave | Descrição                                                                                                  |
| ----------------- | ----------- | --------------- | ---- | ------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| `id`              | `String`    | `UUID`          | Não  | Prisma: uuid(); SQL: sem default      | PK    | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline).               |
| `inspectionId`    | `String?`   | `UUID`          | Sim  | Sem default                           | FK    | FK para a inspeção.                                                                                        |
| `nonConformityId` | `String?`   | `UUID`          | Sim  | Sem default                           | FK    | FK para a não conformidade.                                                                                |
| `publicId`        | `String`    | `TEXT`          | Não  | Sem default                           | UK    | Identificador único do arquivo no provedor; backfill anterior recebe `legacy/<id>`.                        |
| `storageUrl`      | `String`    | `TEXT`          | Não  | Sem default                           | —     | URL de acesso ao arquivo no armazenamento externo.                                                         |
| `fileName`        | `String`    | `TEXT`          | Não  | Sem default                           | —     | Nome do arquivo registrado.                                                                                |
| `mimeType`        | `String`    | `TEXT`          | Não  | Sem default                           | —     | Tipo MIME declarado do arquivo.                                                                            |
| `fileSize`        | `BigInt`    | `BIGINT`        | Não  | Sem default                           | —     | Tamanho do arquivo em bytes; BIGINT.                                                                       |
| `width`           | `Int?`      | `INTEGER`       | Sim  | Sem default                           | —     | Largura da imagem em pixels, opcional.                                                                     |
| `height`          | `Int?`      | `INTEGER`       | Sim  | Sem default                           | —     | Altura da imagem em pixels, opcional.                                                                      |
| `caption`         | `String?`   | `TEXT`          | Sim  | Sem default                           | —     | Legenda opcional da evidência.                                                                             |
| `createdAt`       | `DateTime`  | `TIMESTAMP(3)`  | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Horário de criação do registro no servidor; default SQL CURRENT_TIMESTAMP.                                 |
| `updatedAt`       | `DateTime`  | `TIMESTAMP(3)`  | Não  | Sem default SQL; @updatedAt no Prisma | —     | Horário de atualização gerenciado pelo Prisma (@updatedAt); não há default SQL nem trigger de atualização. |
| `deletedAt`       | `DateTime?` | `TIMESTAMP(3)`  | Sim  | Sem default                           | —     | Marcador opcional de exclusão lógica; não dispara cascade e não libera chaves únicas.                      |

Relações de saída: `inspectionId` → `Inspection.id`; `nonConformityId` → `NonConformity.id`.

Referenciado por: nenhuma. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `Evidence_inspectionId_idx`, `Evidence_nonConformityId_idx`, `Evidence_mimeType_idx`, `Evidence_deletedAt_idx`, `Evidence_publicId_key`. A PK também possui índice único B-tree próprio.

CHECKs físicos: `Evidence_exactly_one_historical_context_check`.

As duas FKs são opcionais isoladamente, porém Evidence_exactly_one_historical_context_check exige exatamente uma preenchida. O CHECK/FKs não exigem snapshot nem autenticação; EvidenceService valida contexto histórico e proprietário. Binários ficam no Cloudinary; apenas metadados ficam no PostgreSQL. fileSize positivo, limite de upload e formatos MIME são validações de aplicação, não CHECK SQL. publicId de registros anteriores foi preenchido como `legacy/<id>`, sem comprovar existência/gestão no Cloudinary.

<a id="report"></a>

### Report

Representa um registro persistível de relatório de inspeção, com gerador, versão, data e observações; não é o DTO/HTML sob demanda.

Tabela física: `"Report"`. PK: `(id)`.

| Campo           | Tipo Prisma | Tipo PostgreSQL | Null | Default / gestão Prisma               | Chave  | Descrição                                                                                    |
| --------------- | ----------- | --------------- | ---- | ------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `id`            | `String`    | `UUID`          | Não  | Prisma: uuid(); SQL: sem default      | PK     | Identificador UUID do registro; geração pelo Prisma quando omitido (salvo operação offline). |
| `inspectionId`  | `String`    | `UUID`          | Não  | Sem default                           | FK, UK | FK para a inspeção.                                                                          |
| `generatedById` | `String`    | `UUID`          | Não  | Sem default                           | FK     | FK para o usuário identificado como gerador do registro persistido.                          |
| `version`       | `Int`       | `INTEGER`       | Não  | SQL/Prisma: 1                         | —      | Número de versão do registro Report; não cria histórico de múltiplas linhas por inspeção.    |
| `generatedAt`   | `DateTime`  | `TIMESTAMP(3)`  | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —      | Horário de geração registrado em Report.                                                     |
| `observations`  | `String?`   | `TEXT`          | Sim  | Sem default                           | —      | Observações opcionais do registro Report.                                                    |

Relações de saída: `inspectionId` → `Inspection.id`; `generatedById` → `User.id`.

Referenciado por: nenhuma. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `Report_inspectionId_key`, `Report_generatedById_idx`, `Report_generatedAt_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: nenhum adicional à tipagem, NOT NULL, PK, FKs e índices únicos.

inspectionId único limita a zero ou um Report persistido por inspeção; version não permite várias linhas da mesma inspeção. Não possui createdAt/updatedAt/deletedAt, somente generatedAt. O ReportRepository atual consulta Inspection e monta dados de leitura; abrir o DTO/HTML ou imprimir pelo navegador não insere automaticamente uma linha nesta tabela. Não há campo de PDF/binário/URL neste model.

<a id="offlinesyncoperation"></a>

### OfflineSyncOperation

Registra a confirmação remota de uma operação offline para deduplicação; não contém a fila local nem o payload completo.

Tabela física: `"OfflineSyncOperation"`. PK: `(id)`.

| Campo             | Tipo Prisma            | Tipo PostgreSQL          | Null | Default / gestão Prisma               | Chave | Descrição                                                                               |
| ----------------- | ---------------------- | ------------------------ | ---- | ------------------------------------- | ----- | --------------------------------------------------------------------------------------- |
| `id`              | `String`               | `UUID`                   | Não  | Sem default                           | PK    | UUID fornecido pelo cliente, estável entre retries; PK sem default Prisma ou SQL.       |
| `userId`          | `String`               | `UUID`                   | Não  | Sem default                           | FK    | Usuário autenticado ao qual a operação confirmada pertence.                             |
| `inspectionId`    | `String`               | `UUID`                   | Não  | Sem default                           | FK    | FK para a inspeção.                                                                     |
| `type`            | `OfflineOperationType` | `"OfflineOperationType"` | Não  | Sem default                           | —     | Discriminador da mutação confirmada: salvar resposta ou concluir inspeção.              |
| `payloadHash`     | `String`               | `CHAR(64)`               | Não  | Sem default                           | —     | SHA-256 canônico da operação offline; permite comparar retries sem armazenar o payload. |
| `clientCreatedAt` | `DateTime`             | `TIMESTAMP(3)`           | Não  | Sem default                           | —     | Horário original da operação, informado pelo dispositivo; sem default.                  |
| `completedAt`     | `DateTime`             | `TIMESTAMP(3)`           | Não  | Prisma: now(); SQL: CURRENT_TIMESTAMP | —     | Momento de confirmação no servidor, com default now()/CURRENT_TIMESTAMP.                |

Relações de saída: `userId` → `User.id`; `inspectionId` → `Inspection.id`.

Referenciado por: nenhuma. Cardinalidades, nullability e ações referenciais estão no inventário de FKs.

Índices: `OfflineSyncOperation_userId_completedAt_idx`, `OfflineSyncOperation_inspectionId_completedAt_idx`, `OfflineSyncOperation_type_idx`. A PK também possui índice único B-tree próprio.

CHECKs físicos: `OfflineSyncOperation_payloadHash_check`.

Não possui coluna status: a própria linha representa uma confirmação bem-sucedida. Não possui payload, createdAt, updatedAt ou deletedAt. id é obrigatório sem default e vem do cliente, enquanto completedAt tem default SQL. A PK deduplica somente o UUID; payloadHash não é UNIQUE. A igualdade de usuário/inspeção/tipo/hash em retries e a criação atômica com a mutação são controladas pela aplicação. clientCreatedAt não possui default e não é revisão remota.

## 5. Inventário de FKs

Todas as 36 FKs vigentes usam **ON DELETE RESTRICT / ON UPDATE CASCADE**,
conforme as migrations. RESTRICT impede deleção física de pais referenciados;
soft delete é atualização de coluna. A migration de evidências substituiu
SET NULL por RESTRICT; tornar Checklist.createdById nullable não recriou sua FK.
Nas cardinalidades abaixo, a origem é a linha que contém a FK.

| Constraint FK                                               | Origem                                                 | Destino                          | Cardinalidade                                     | Null | ON DELETE | ON UPDATE | Observações                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------ | -------------------------------- | ------------------------------------------------- | ---- | --------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `Company_createdById_fkey`                                  | `Company.createdById`                                  | `User.id`                        | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `Checklist_createdById_fkey`                                | `Checklist.createdById`                                | `User.id`                        | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | Ownership condicional por CHECK; SQL RESTRICT diverge do SET NULL implícito do schema.                |
| `ChecklistItem_checklistId_fkey`                            | `ChecklistItem.checklistId`                            | `Checklist.id`                   | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | Compatibilidade/linhagem legada preservada.                                                           |
| `ChecklistItemStandard_checklistItemId_fkey`                | `ChecklistItemStandard.checklistItemId`                | `ChecklistItem.id`               | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | Compatibilidade/linhagem legada preservada.                                                           |
| `ChecklistItemStandard_standardId_fkey`                     | `ChecklistItemStandard.standardId`                     | `Standard.id`                    | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `Inspection_userId_fkey`                                    | `Inspection.userId`                                    | `User.id`                        | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `Inspection_companyId_fkey`                                 | `Inspection.companyId`                                 | `Company.id`                     | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `Inspection_checklistId_fkey`                               | `Inspection.checklistId`                               | `Checklist.id`                   | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `InspectionResponse_inspectionId_fkey`                      | `InspectionResponse.inspectionId`                      | `Inspection.id`                  | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `InspectionResponse_checklistItemId_fkey`                   | `InspectionResponse.checklistItemId`                   | `ChecklistItem.id`               | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | CHECK exige pelo menos uma referência; ambas podem coexistir. Mesma inspeção é validada na aplicação. |
| `NonConformity_inspectionResponseId_fkey`                   | `NonConformity.inspectionResponseId`                   | `InspectionResponse.id`          | 1 destino por origem; 0..1 origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `CorrectiveAction_nonConformityId_fkey`                     | `CorrectiveAction.nonConformityId`                     | `NonConformity.id`               | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `Report_inspectionId_fkey`                                  | `Report.inspectionId`                                  | `Inspection.id`                  | 1 destino por origem; 0..1 origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `Report_generatedById_fkey`                                 | `Report.generatedById`                                 | `User.id`                        | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `ChecklistVersion_checklistId_fkey`                         | `ChecklistVersion.checklistId`                         | `Checklist.id`                   | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `ChecklistVersion_createdById_fkey`                         | `ChecklistVersion.createdById`                         | `User.id`                        | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | Autoria/publicação opcional fisicamente; coerência com checklist pai é da aplicação.                  |
| `ChecklistVersion_publishedById_fkey`                       | `ChecklistVersion.publishedById`                       | `User.id`                        | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | Autoria/publicação opcional fisicamente; coerência com checklist pai é da aplicação.                  |
| `ChecklistVersionItem_checklistVersionId_fkey`              | `ChecklistVersionItem.checklistVersionId`              | `ChecklistVersion.id`            | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `ChecklistVersionItem_sourceVersionItemId_fkey`             | `ChecklistVersionItem.sourceVersionItemId`             | `ChecklistVersionItem.id`        | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `ChecklistVersionItem_sourceChecklistItemId_fkey`           | `ChecklistVersionItem.sourceChecklistItemId`           | `ChecklistItem.id`               | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | Compatibilidade/linhagem legada preservada.                                                           |
| `ChecklistVersionItemStandard_checklistVersionItemId_fkey`  | `ChecklistVersionItemStandard.checklistVersionItemId`  | `ChecklistVersionItem.id`        | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `ChecklistVersionItemStandard_standardId_fkey`              | `ChecklistVersionItemStandard.standardId`              | `Standard.id`                    | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `Inspection_checklistVersionId_fkey`                        | `Inspection.checklistVersionId`                        | `ChecklistVersion.id`            | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | Opcional no banco; preenchida na criação atual com snapshot transacional.                             |
| `InspectionChecklistSnapshot_inspectionId_fkey`             | `InspectionChecklistSnapshot.inspectionId`             | `Inspection.id`                  | 1 destino por origem; 0..1 origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `InspectionChecklistSnapshot_sourceChecklistId_fkey`        | `InspectionChecklistSnapshot.sourceChecklistId`        | `Checklist.id`                   | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `InspectionChecklistSnapshot_sourceChecklistVersionId_fkey` | `InspectionChecklistSnapshot.sourceChecklistVersionId` | `ChecklistVersion.id`            | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `InspectionSnapshotItem_snapshotId_fkey`                    | `InspectionSnapshotItem.snapshotId`                    | `InspectionChecklistSnapshot.id` | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `InspectionSnapshotItem_sourceVersionItemId_fkey`           | `InspectionSnapshotItem.sourceVersionItemId`           | `ChecklistVersionItem.id`        | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `InspectionSnapshotItem_sourceChecklistItemId_fkey`         | `InspectionSnapshotItem.sourceChecklistItemId`         | `ChecklistItem.id`               | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | Compatibilidade/linhagem legada preservada.                                                           |
| `InspectionSnapshotItemStandard_snapshotItemId_fkey`        | `InspectionSnapshotItemStandard.snapshotItemId`        | `InspectionSnapshotItem.id`      | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `InspectionSnapshotItemStandard_standardId_fkey`            | `InspectionSnapshotItemStandard.standardId`            | `Standard.id`                    | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `InspectionResponse_snapshotItemId_fkey`                    | `InspectionResponse.snapshotItemId`                    | `InspectionSnapshotItem.id`      | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | CHECK exige pelo menos uma referência; ambas podem coexistir. Mesma inspeção é validada na aplicação. |
| `Evidence_inspectionId_fkey`                                | `Evidence.inspectionId`                                | `Inspection.id`                  | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | Nullable individualmente; CHECK XOR exige exatamente uma das duas FKs.                                |
| `Evidence_nonConformityId_fkey`                             | `Evidence.nonConformityId`                             | `NonConformity.id`               | 0..1 destino por origem; 0..N origens por destino | Sim  | RESTRICT  | CASCADE   | Nullable individualmente; CHECK XOR exige exatamente uma das duas FKs.                                |
| `OfflineSyncOperation_userId_fkey`                          | `OfflineSyncOperation.userId`                          | `User.id`                        | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |
| `OfflineSyncOperation_inspectionId_fkey`                    | `OfflineSyncOperation.inspectionId`                    | `Inspection.id`                  | 1 destino por origem; 0..N origens por destino    | Não  | RESTRICT  | CASCADE   | FK simples; não valida correspondência com outras FKs do registro.                                    |

## 6. Índices

Além dos **19 índices de PK** (nome `<Tabela>_pkey`), existem
**74 índices explícitos**: 14 únicos e
60 não únicos. Todos são B-tree, sem USING alternativo nas migrations.
A unicidade parcial de draft vem de SQL e não aparece em @@index/@@unique.
Índices não únicos de Company.cnpj e Standard.code coexistem com os únicos;
essa redundância existente foi documentada sem propor mudança de banco.

| Índice                                                     | Tabela                           | Colunas (na ordem)                 | Tipo   | Único | Parcial/predicado    | Finalidade                                                   |
| ---------------------------------------------------------- | -------------------------------- | ---------------------------------- | ------ | ----- | -------------------- | ------------------------------------------------------------ |
| `User_email_key`                                           | `User`                           | `email`                            | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `User_role_idx`                                            | `User`                           | `role`                             | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `User_deletedAt_idx`                                       | `User`                           | `deletedAt`                        | B-tree | Não   | Não                  | Apoia filtragem por exclusão lógica.                         |
| `Company_cnpj_key`                                         | `Company`                        | `cnpj`                             | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `Company_createdById_idx`                                  | `Company`                        | `createdById`                      | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `Company_cnpj_idx`                                         | `Company`                        | `cnpj`                             | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `Company_deletedAt_idx`                                    | `Company`                        | `deletedAt`                        | B-tree | Não   | Não                  | Apoia filtragem por exclusão lógica.                         |
| `Checklist_createdById_idx`                                | `Checklist`                      | `createdById`                      | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `Checklist_isTemplate_idx`                                 | `Checklist`                      | `isTemplate`                       | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `Checklist_isActive_idx`                                   | `Checklist`                      | `isActive`                         | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `Checklist_deletedAt_idx`                                  | `Checklist`                      | `deletedAt`                        | B-tree | Não   | Não                  | Apoia filtragem por exclusão lógica.                         |
| `ChecklistItem_checklistId_idx`                            | `ChecklistItem`                  | `checklistId`                      | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `ChecklistItem_checklistId_orderIndex_key`                 | `ChecklistItem`                  | `checklistId`, `orderIndex`        | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `Standard_code_key`                                        | `Standard`                       | `code`                             | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `Standard_type_idx`                                        | `Standard`                       | `type`                             | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `Standard_code_idx`                                        | `Standard`                       | `code`                             | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `Standard_isActive_idx`                                    | `Standard`                       | `isActive`                         | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `ChecklistItemStandard_standardId_idx`                     | `ChecklistItemStandard`          | `standardId`                       | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `Inspection_userId_idx`                                    | `Inspection`                     | `userId`                           | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `Inspection_companyId_idx`                                 | `Inspection`                     | `companyId`                        | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `Inspection_checklistId_idx`                               | `Inspection`                     | `checklistId`                      | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `Inspection_inspectionDate_idx`                            | `Inspection`                     | `inspectionDate`                   | B-tree | Não   | Não                  | Apoia busca/ordenação por data.                              |
| `Inspection_status_idx`                                    | `Inspection`                     | `status`                           | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `Inspection_syncStatus_idx`                                | `Inspection`                     | `syncStatus`                       | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `Inspection_deletedAt_idx`                                 | `Inspection`                     | `deletedAt`                        | B-tree | Não   | Não                  | Apoia filtragem por exclusão lógica.                         |
| `InspectionResponse_inspectionId_idx`                      | `InspectionResponse`             | `inspectionId`                     | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionResponse_checklistItemId_idx`                   | `InspectionResponse`             | `checklistItemId`                  | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionResponse_status_idx`                            | `InspectionResponse`             | `status`                           | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `InspectionResponse_inspectionId_checklistItemId_key`      | `InspectionResponse`             | `inspectionId`, `checklistItemId`  | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `NonConformity_inspectionResponseId_key`                   | `NonConformity`                  | `inspectionResponseId`             | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `NonConformity_severity_idx`                               | `NonConformity`                  | `severity`                         | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `NonConformity_status_idx`                                 | `NonConformity`                  | `status`                           | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `NonConformity_dueDate_idx`                                | `NonConformity`                  | `dueDate`                          | B-tree | Não   | Não                  | Apoia busca/ordenação por data.                              |
| `NonConformity_deletedAt_idx`                              | `NonConformity`                  | `deletedAt`                        | B-tree | Não   | Não                  | Apoia filtragem por exclusão lógica.                         |
| `CorrectiveAction_nonConformityId_idx`                     | `CorrectiveAction`               | `nonConformityId`                  | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `CorrectiveAction_status_idx`                              | `CorrectiveAction`               | `status`                           | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `CorrectiveAction_dueDate_idx`                             | `CorrectiveAction`               | `dueDate`                          | B-tree | Não   | Não                  | Apoia busca/ordenação por data.                              |
| `CorrectiveAction_deletedAt_idx`                           | `CorrectiveAction`               | `deletedAt`                        | B-tree | Não   | Não                  | Apoia filtragem por exclusão lógica.                         |
| `Evidence_inspectionId_idx`                                | `Evidence`                       | `inspectionId`                     | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `Evidence_nonConformityId_idx`                             | `Evidence`                       | `nonConformityId`                  | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `Evidence_mimeType_idx`                                    | `Evidence`                       | `mimeType`                         | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `Evidence_deletedAt_idx`                                   | `Evidence`                       | `deletedAt`                        | B-tree | Não   | Não                  | Apoia filtragem por exclusão lógica.                         |
| `Report_inspectionId_key`                                  | `Report`                         | `inspectionId`                     | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `Report_generatedById_idx`                                 | `Report`                         | `generatedById`                    | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `Report_generatedAt_idx`                                   | `Report`                         | `generatedAt`                      | B-tree | Não   | Não                  | Apoia busca/ordenação por data.                              |
| `ChecklistVersion_checklistId_versionNumber_key`           | `ChecklistVersion`               | `checklistId`, `versionNumber`     | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `ChecklistVersion_one_draft_per_checklist_key`             | `ChecklistVersion`               | `checklistId`                      | B-tree | Sim   | `"status" = 'DRAFT'` | Limita a uma versão DRAFT por checklist.                     |
| `ChecklistVersion_checklistId_status_idx`                  | `ChecklistVersion`               | `checklistId`, `status`            | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `ChecklistVersion_status_idx`                              | `ChecklistVersion`               | `status`                           | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `ChecklistVersion_publishedAt_idx`                         | `ChecklistVersion`               | `publishedAt`                      | B-tree | Não   | Não                  | Apoia busca/ordenação por data.                              |
| `ChecklistVersionItem_checklistVersionId_orderIndex_key`   | `ChecklistVersionItem`           | `checklistVersionId`, `orderIndex` | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `ChecklistVersionItem_checklistVersionId_idx`              | `ChecklistVersionItem`           | `checklistVersionId`               | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `ChecklistVersionItem_sourceVersionItemId_idx`             | `ChecklistVersionItem`           | `sourceVersionItemId`              | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `ChecklistVersionItem_sourceChecklistItemId_idx`           | `ChecklistVersionItem`           | `sourceChecklistItemId`            | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `ChecklistVersionItemStandard_standardId_idx`              | `ChecklistVersionItemStandard`   | `standardId`                       | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `ChecklistVersionItemStandard_code_idx`                    | `ChecklistVersionItemStandard`   | `code`                             | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `Inspection_checklistVersionId_idx`                        | `Inspection`                     | `checklistVersionId`               | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionChecklistSnapshot_inspectionId_key`             | `InspectionChecklistSnapshot`    | `inspectionId`                     | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `InspectionChecklistSnapshot_sourceChecklistId_idx`        | `InspectionChecklistSnapshot`    | `sourceChecklistId`                | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionChecklistSnapshot_sourceChecklistVersionId_idx` | `InspectionChecklistSnapshot`    | `sourceChecklistVersionId`         | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionChecklistSnapshot_origin_idx`                   | `InspectionChecklistSnapshot`    | `origin`                           | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `InspectionChecklistSnapshot_integrityStatus_idx`          | `InspectionChecklistSnapshot`    | `integrityStatus`                  | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `InspectionSnapshotItem_snapshotId_orderIndex_key`         | `InspectionSnapshotItem`         | `snapshotId`, `orderIndex`         | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `InspectionSnapshotItem_snapshotId_idx`                    | `InspectionSnapshotItem`         | `snapshotId`                       | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionSnapshotItem_sourceVersionItemId_idx`           | `InspectionSnapshotItem`         | `sourceVersionItemId`              | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionSnapshotItem_sourceChecklistItemId_idx`         | `InspectionSnapshotItem`         | `sourceChecklistItemId`            | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionSnapshotItemStandard_standardId_idx`            | `InspectionSnapshotItemStandard` | `standardId`                       | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionSnapshotItemStandard_code_idx`                  | `InspectionSnapshotItemStandard` | `code`                             | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |
| `InspectionResponse_snapshotItemId_idx`                    | `InspectionResponse`             | `snapshotItemId`                   | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo.                             |
| `InspectionResponse_inspectionId_snapshotItemId_key`       | `InspectionResponse`             | `inspectionId`, `snapshotItemId`   | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `Evidence_publicId_key`                                    | `Evidence`                       | `publicId`                         | B-tree | Sim   | Não                  | Impede repetição do valor/conjunto não NULL indicado.        |
| `OfflineSyncOperation_userId_completedAt_idx`              | `OfflineSyncOperation`           | `userId`, `completedAt`            | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo e ordenação por confirmação. |
| `OfflineSyncOperation_inspectionId_completedAt_idx`        | `OfflineSyncOperation`           | `inspectionId`, `completedAt`      | B-tree | Não   | Não                  | Apoia busca/junção pelo vínculo e ordenação por confirmação. |
| `OfflineSyncOperation_type_idx`                            | `OfflineSyncOperation`           | `type`                             | B-tree | Não   | Não                  | Apoia filtragem pelo atributo indexado.                      |

## 7. CHECKs e camadas de integridade

| CHECK físico                                            | Tabela                        | Expressão vigente                                                                                                                                                                                                                                                         | Garantia e limite                                                                                                                        | Migration de definição vigente                                                                                                                                      |
| ------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChecklistVersion_versionNumber_check`                  | `ChecklistVersion`            | `"versionNumber" > 0`                                                                                                                                                                                                                                                     | Número de versão estritamente positivo.                                                                                                  | [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) |
| `ChecklistVersion_contentSchemaVersion_check`           | `ChecklistVersion`            | `"contentSchemaVersion" >= 0`                                                                                                                                                                                                                                             | Formato não negativo; admite o formato legado 0.                                                                                         | [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) |
| `ChecklistVersion_contentHash_check`                    | `ChecklistVersion`            | `"contentHash" IS NULL OR "contentHash" ~ '^[0-9a-f]{64}$'`                                                                                                                                                                                                               | NULL ou 64 caracteres hexadecimais minúsculos; não verifica o conteúdo.                                                                  | [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) |
| `ChecklistVersionItem_orderIndex_check`                 | `ChecklistVersionItem`        | `"orderIndex" > 0`                                                                                                                                                                                                                                                        | Ordem positiva no item de versão.                                                                                                        | [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) |
| `InspectionChecklistSnapshot_sourceVersionNumber_check` | `InspectionChecklistSnapshot` | `"sourceVersionNumber" > 0`                                                                                                                                                                                                                                               | Número de origem positivo.                                                                                                               | [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) |
| `InspectionChecklistSnapshot_schemaVersion_check`       | `InspectionChecklistSnapshot` | `"snapshotSchemaVersion" >= 0`                                                                                                                                                                                                                                            | Formato de snapshot não negativo.                                                                                                        | [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) |
| `InspectionChecklistSnapshot_contentHash_check`         | `InspectionChecklistSnapshot` | `"contentHash" ~ '^[0-9a-f]{64}$'`                                                                                                                                                                                                                                        | 64 caracteres hexadecimais minúsculos; não recalcula SHA-256.                                                                            | [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) |
| `InspectionSnapshotItem_orderIndex_check`               | `InspectionSnapshotItem`      | `"orderIndex" > 0`                                                                                                                                                                                                                                                        | Ordem positiva no item capturado.                                                                                                        | [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) |
| `InspectionResponse_itemReference_check`                | `InspectionResponse`          | `"snapshotItemId" IS NOT NULL OR "checklistItemId" IS NOT NULL`                                                                                                                                                                                                           | Ao menos uma referência a item; é OR inclusivo, não XOR.                                                                                 | [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) |
| `Evidence_exactly_one_historical_context_check`         | `Evidence`                    | `num_nonnulls("inspectionId", "nonConformityId") = 1`                                                                                                                                                                                                                     | Exatamente um contexto de evidência: inspectionId XOR nonConformityId.                                                                   | [20260806120000_complete_evidence_mvp](../prisma/migrations/20260806120000_complete_evidence_mvp/migration.sql)                                                     |
| `OfflineSyncOperation_payloadHash_check`                | `OfflineSyncOperation`        | `"payloadHash" ~ '^[0-9a-f]{64}$'`                                                                                                                                                                                                                                        | 64 caracteres hexadecimais minúsculos; não confere igualdade de payload.                                                                 | [20260806220000_add_offline_sync_idempotency](../prisma/migrations/20260806220000_add_offline_sync_idempotency/migration.sql)                                       |
| `Checklist_ownership_check`                             | `Checklist`                   | `("isOfficial" AND "createdById" IS NULL AND "isTemplate") OR (NOT "isOfficial" AND "createdById" IS NOT NULL)`                                                                                                                                                           | Oficial exige template e proprietário NULL; pessoal exige proprietário preenchido.                                                       | [20261003000000_add_official_checklist_templates](../prisma/migrations/20261003000000_add_official_checklist_templates/migration.sql)                               |
| `ChecklistVersion_publicationState_check`               | `ChecklistVersion`            | `("status" = 'DRAFT' AND "publishedById" IS NULL AND "publishedAt" IS NULL AND "contentHash" IS NULL) OR ( "status" IN ('PUBLISHED', 'RETIRED') AND ("publishedById" IS NOT NULL OR "createdById" IS NULL) AND "publishedAt" IS NOT NULL AND "contentHash" IS NOT NULL )` | DRAFT sem publicador/data/hash. PUBLISHED/RETIRED com data/hash e (publicador preenchido OU criador NULL); não consulta o checklist pai. | [20261003000000_add_official_checklist_templates](../prisma/migrations/20261003000000_add_official_checklist_templates/migration.sql)                               |

As PKs, NOT NULL, tipos enum, FKs, índices únicos e CHECKs acima são garantias
físicas. @id/@@id, @unique/@@unique e @@index expressam parte delas no Prisma;
CHECKs e índice parcial exigem a leitura das migrations. @updatedAt e uuid()
são comportamentos do Prisma sem default/trigger equivalentes no SQL.

| Regra                        | Banco permite/garante                                                       | Aplicação no fluxo atual                                                                       |
| ---------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Inspeção com versão/snapshot | Versão nullable; no máximo um snapshot                                      | InspectionService + createWithSnapshot exigem publicação íntegra e criam snapshot na transação |
| Resposta histórica           | Ao menos um item; FKs simples; dois UNIQUE compostos                        | InspectionResponseService resolve item no snapshot da mesma inspeção                           |
| Autoria institucional        | Ownership do checklist por CHECK; autoria de versão nullable                | Bootstrap grava criador/publicador NULL para checklist oficial; fluxo pessoal atribui sessão   |
| Imutabilidade histórica      | RESTRICT e CHECKs protegem vínculos/forma, não bloqueiam UPDATE de conteúdo | Services/Repositories limitam edição a draft e verificam hashes                                |
| Hash                         | Formato hexadecimal minúsculo de 64 caracteres                              | Utilitários calculam SHA-256 do conteúdo ou operação canônica                                  |
| Evidência                    | Exatamente uma FK e pai existente                                           | EvidenceService exige contexto histórico, proprietário e arquivo válido                        |
| Operação offline             | PK única e formato de hash; nenhuma coluna status/payload                   | Transação confirma mutação; retry compara usuário/inspeção/tipo/hash                           |
| Conflito de resposta         | updatedAt é coluna de horário; sem contador/CHECK de revisão                | Repository compara revisão esperada à remota antes da escrita                                  |
| Relatório                    | Zero ou um registro Report por inspeção                                     | ReportRepository consulta Inspection; DTO/HTML não cria registro automaticamente               |
| Ação concluída/custo         | completedAt nullable; estimatedCost TEXT                                    | Service trata conclusão; não há tipo monetário físico                                          |

### Fontes de aplicação usadas para delimitar as garantias

- [InspectionService](../src/server/services/inspection.service.ts) e
  [InspectionRepository](../src/server/repositories/inspection.repository.ts).
- [InspectionResponseService](../src/server/services/inspection-response.service.ts) e
  [InspectionResponseRepository](../src/server/repositories/inspection-response.repository.ts).
- [ChecklistVersionService](../src/server/services/checklist-version.service.ts),
  [OfficialChecklistRepository](../src/server/repositories/official-checklist.repository.ts) e
  [ChecklistRepository](../src/server/repositories/checklist.repository.ts).
- [EvidenceService](../src/server/services/evidence.service.ts) e
  [ReportRepository](../src/server/repositories/report.repository.ts).
- [Hash de conteúdo](../src/server/utils/checklist-content-hash.ts),
  [hash de operação](../src/server/utils/offline-operation-hash.ts) e
  [comparação de operação](../src/server/repositories/offline-sync-operation.ts).

## 8. Divergência constatada entre schema e migrations

Checklist.createdById é nullable no schema atual e sua relação não declara
onDelete. A geração offline de DDL pelo Prisma instalado
(`prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`)
produziu ON DELETE SET NULL para Checklist_createdById_fkey. Entretanto, a
migration inicial criou ON DELETE RESTRICT e a migration institucional apenas
removeu NOT NULL, sem substituir a FK. Portanto, o banco **produzido pelas
migrations mantém RESTRICT**, e é esse comportamento que os modelos físicos
documentam. ON UPDATE CASCADE coincide nos dois caminhos.

Recriar o banco somente pelo schema (por exemplo via db push) não reproduz
integralmente as migrations: além dessa ação referencial, faltariam os CHECKs
e o índice parcial. Esta tarefa não modificou schema, migrations ou banco.
Uma decisão futura de alinhar onDelete exige tarefa de implementação própria;
não foi necessário alterar o banco para concluir a documentação.

## 9. Histórico das migrations e compatibilidade

| Migration (ordem de aplicação)                                                                                                                                      | Efeito preservado                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [20260705165125_init](../prisma/migrations/20260705165125_init/migration.sql)                                                                                       | Cria 12 tabelas iniciais, 8 enums, UUIDs nativos, índices e FKs. Evidências inicialmente usam SET NULL.                                                     |
| [20260725180000_add_corrective_action_5w2h](../prisma/migrations/20260725180000_add_corrective_action_5w2h/migration.sql)                                           | Adiciona why, location, method e estimatedCost como TEXT nullable; responsible/dueDate já existiam.                                                         |
| [20260803150000_add_checklist_versions_and_inspection_snapshots](../prisma/migrations/20260803150000_add_checklist_versions_and_inspection_snapshots/migration.sql) | Cria seis tabelas históricas e três enums; adiciona versão da inspeção, item de snapshot/timestamps da resposta, checks/índices e pgcrypto para o backfill. |
| [20260806120000_complete_evidence_mvp](../prisma/migrations/20260806120000_complete_evidence_mvp/migration.sql)                                                     | Adiciona publicId/dimensões/updatedAt; preenche `legacy/<id>`, torna publicId obrigatório e único, troca FKs para RESTRICT e aplica XOR.                    |
| [20260806220000_add_offline_sync_idempotency](../prisma/migrations/20260806220000_add_offline_sync_idempotency/migration.sql)                                       | Cria OfflineSyncOperation e OfflineOperationType; adiciona clientUpdatedAt na resposta, índices e CHECK de payloadHash.                                     |
| [20261003000000_add_official_checklist_templates](../prisma/migrations/20261003000000_add_official_checklist_templates/migration.sql)                               | Adiciona isOfficial=false; permite autores NULL, aplica ownership e substitui o CHECK de publicação por sua versão vigente.                                 |

A expansão de agosto importa uma versão PUBLISHED v1 por checklist, copiando
itens e normas recuperáveis. Reutiliza UUIDs de checklist/item em tabelas
diferentes; snapshots usam o UUID da inspeção, e itens capturados recebem UUIDs
determinísticos derivados de MD5. Isso é uma estratégia de backfill, não o
default atual de geração de IDs. pgcrypto é usado para SHA-256 do conteúdo
importado. A verificação DO ao final aborta se inspeções/respostas antigas
ficarem sem mapeamento; ela não é uma constraint permanente.

O backfill não comprova o conteúdo na data original da inspeção:
LEGACY_BACKFILL, UNVERIFIED_LEGACY e formato 0 preservam essa limitação.
ChecklistItem, ChecklistItemStandard e checklistItemId nas respostas continuam
fisicamente vigentes. Não há remoção de legado nem imposição futura de NOT NULL
nesta documentação. O CHECK institucional preserva os registros anteriores
como pessoais (isOfficial=false), sem mudar seus proprietários.

Os modelos anteriores permanecem recuperáveis no histórico Git. Propostas de
IDs não nativos, cascades generalizados, timestamps universais ou remoção do
legado não descrevem o estado atual. A Figura 10 passa a ter um único PlantUML
oficial em [physical.puml](./diagrams/database/physical.puml), substituindo
o antigo caminho Documentation/DiagramaModeloFisicoDB.puml.

## 10. Modelos e referências

- [Modelo conceitual](./ModeloConceitualDoBancoDeDados.md).
- [Modelo lógico](./ModeloLogico.md).
- [Modelo físico](./ModeloFisicoDB.md).
- [Referência para agentes](../AI/Database.md).
- [Templates institucionais](../AI/OfficialTemplates.md),
  [cópia](../AI/ChecklistCopy.md) e [offline](../AI/Offline.md), como contexto
  das respectivas regras de aplicação, sem substituírem o inventário físico.
