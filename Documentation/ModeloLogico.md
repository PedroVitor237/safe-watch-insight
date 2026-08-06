# 7. Modelo Lógico do Banco de Dados

## 7.1 Objetivo

Este modelo descreve as entidades lógicas, chaves e relacionamentos vigentes no
Safe Watch Insight. O schema Prisma é a fonte oficial do modelo implementado.

## 7.2 Modelo Lógico

> **Figura 9 – Modelo Lógico do Banco de Dados da Plataforma SST**

```mermaid
erDiagram
  USER {
    uuid id PK
    string name
    string email UK
    string password
    enum role
  }
  COMPANY {
    uuid id PK
    uuid createdById FK
    string corporateName
    string cnpj UK
  }
  CHECKLIST {
    uuid id PK
    uuid createdById FK
    string title
    string description
    boolean isTemplate
    boolean isActive
  }
  CHECKLIST_VERSION {
    uuid id PK
    uuid checklistId FK
    int versionNumber UK
    enum status
    string title
    string description
    int contentSchemaVersion
    char contentHash
    uuid createdById FK
    uuid publishedById FK
    datetime publishedAt
  }
  CHECKLIST_VERSION_ITEM {
    uuid id PK
    uuid checklistVersionId FK
    uuid sourceVersionItemId FK
    uuid sourceChecklistItemId FK
    string description
    int orderIndex UK
    boolean isRequired
  }
  CHECKLIST_VERSION_ITEM_STANDARD {
    uuid checklistVersionItemId PK_FK
    uuid standardId PK_FK
    enum type
    string code
    string title
    string summary
    string officialUrl
  }
  STANDARD {
    uuid id PK
    enum type
    string code UK
    string title
    boolean isActive
  }
  INSPECTION {
    uuid id PK
    uuid userId FK
    uuid companyId FK
    uuid checklistId FK
    uuid checklistVersionId FK
    datetime inspectionDate
    enum status
    enum syncStatus
  }
  INSPECTION_CHECKLIST_SNAPSHOT {
    uuid id PK
    uuid inspectionId UK_FK
    uuid sourceChecklistId FK
    uuid sourceChecklistVersionId FK
    int sourceVersionNumber
    string title
    string description
    boolean isTemplate
    int snapshotSchemaVersion
    char contentHash
    enum origin
    enum integrityStatus
    datetime capturedAt
  }
  INSPECTION_SNAPSHOT_ITEM {
    uuid id PK
    uuid snapshotId FK
    uuid sourceVersionItemId FK
    uuid sourceChecklistItemId FK
    string description
    int orderIndex UK
    boolean isRequired
  }
  INSPECTION_SNAPSHOT_ITEM_STANDARD {
    uuid snapshotItemId PK_FK
    uuid standardId PK_FK
    enum type
    string code
    string title
    string summary
    string officialUrl
  }
  INSPECTION_RESPONSE {
    uuid id PK
    uuid inspectionId FK
    uuid snapshotItemId FK
    uuid checklistItemId FK
    enum status
    string observation
  }
  NON_CONFORMITY {
    uuid id PK
    uuid inspectionResponseId UK_FK
    string description
    enum severity
    enum status
  }
  CORRECTIVE_ACTION {
    uuid id PK
    uuid nonConformityId FK
    string description
    enum status
  }
  EVIDENCE {
    uuid id PK
    uuid inspectionId FK
    uuid nonConformityId FK
    string publicId UK
    string storageUrl
    string fileName
    string mimeType
    bigint fileSize
    int width
    int height
    string caption
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
  }
  REPORT {
    uuid id PK
    uuid inspectionId UK_FK
    uuid generatedById FK
    int version
  }

  USER ||--o{ COMPANY : registers
  USER ||--o{ CHECKLIST : creates
  USER ||--o{ CHECKLIST_VERSION : creates_and_publishes
  USER ||--o{ INSPECTION : performs
  COMPANY ||--o{ INSPECTION : has
  CHECKLIST ||--|{ CHECKLIST_VERSION : has
  CHECKLIST_VERSION ||--o{ CHECKLIST_VERSION_ITEM : contains
  CHECKLIST_VERSION_ITEM ||--o{ CHECKLIST_VERSION_ITEM_STANDARD : preserves
  STANDARD ||--o{ CHECKLIST_VERSION_ITEM_STANDARD : identifies
  CHECKLIST ||--o{ INSPECTION : contextualizes
  CHECKLIST_VERSION ||--o{ INSPECTION : selected_for
  INSPECTION ||--|| INSPECTION_CHECKLIST_SNAPSHOT : captures
  INSPECTION_CHECKLIST_SNAPSHOT ||--o{ INSPECTION_SNAPSHOT_ITEM : contains
  INSPECTION_SNAPSHOT_ITEM ||--o{ INSPECTION_SNAPSHOT_ITEM_STANDARD : preserves
  STANDARD ||--o{ INSPECTION_SNAPSHOT_ITEM_STANDARD : identifies
  INSPECTION ||--o{ INSPECTION_RESPONSE : contains
  INSPECTION_SNAPSHOT_ITEM ||--o{ INSPECTION_RESPONSE : answered_by
  INSPECTION_RESPONSE ||--o| NON_CONFORMITY : generates
  NON_CONFORMITY ||--o{ CORRECTIVE_ACTION : requires
  INSPECTION ||--o{ EVIDENCE : has
  NON_CONFORMITY ||--o{ EVIDENCE : documents
  INSPECTION ||--o| REPORT : generates
```

**Fonte:** Elaborado pelo autor.

## 7.3 Estruturas introduzidas para integridade histórica

### CHECKLIST_VERSION

| Campo | Tipo | Restrição |
| --- | --- | --- |
| id | UUID | PK |
| checklistId | UUID | FK → CHECKLIST |
| versionNumber | INTEGER | NOT NULL; UNIQUE com checklistId |
| status | ENUM | DRAFT, PUBLISHED ou RETIRED |
| title | TEXT | NOT NULL |
| description | TEXT | NULL |
| contentSchemaVersion | INTEGER | NOT NULL |
| contentHash | CHAR(64) | NULL no draft; obrigatório após publicação |
| createdById | UUID | FK → USER |
| publishedById | UUID | FK → USER; NULL no draft |
| publishedAt | DATETIME | NULL no draft |
| createdAt / updatedAt | DATETIME | NOT NULL |

### CHECKLIST_VERSION_ITEM

| Campo | Tipo | Restrição |
| --- | --- | --- |
| id | UUID | PK |
| checklistVersionId | UUID | FK → CHECKLIST_VERSION |
| sourceVersionItemId | UUID | FK autorreferente, NULL |
| sourceChecklistItemId | UUID | FK legada, NULL |
| description | TEXT | NOT NULL |
| orderIndex | INTEGER | NOT NULL; UNIQUE com checklistVersionId |
| isRequired | BOOLEAN | NOT NULL |

### CHECKLIST_VERSION_ITEM_STANDARD

| Campo | Tipo | Restrição |
| --- | --- | --- |
| checklistVersionItemId | UUID | PK, FK |
| standardId | UUID | PK, FK |
| type / code / title | ENUM/TEXT | cópia histórica obrigatória |
| summary / officialUrl | TEXT | cópia histórica opcional |

### INSPECTION_CHECKLIST_SNAPSHOT

| Campo | Tipo | Restrição |
| --- | --- | --- |
| id | UUID | PK |
| inspectionId | UUID | UNIQUE, FK → INSPECTION |
| sourceChecklistId | UUID | FK → CHECKLIST |
| sourceChecklistVersionId | UUID | FK → CHECKLIST_VERSION |
| sourceVersionNumber | INTEGER | NOT NULL |
| title / description | TEXT | conteúdo capturado |
| isTemplate | BOOLEAN | NOT NULL |
| snapshotSchemaVersion | INTEGER | NOT NULL |
| contentHash | CHAR(64) | NOT NULL |
| origin | ENUM | INSPECTION_CREATION ou LEGACY_BACKFILL |
| integrityStatus | ENUM | VERIFIED ou UNVERIFIED_LEGACY |
| capturedAt | DATETIME | NOT NULL |

### INSPECTION_SNAPSHOT_ITEM

| Campo | Tipo | Restrição |
| --- | --- | --- |
| id | UUID | PK |
| snapshotId | UUID | FK → INSPECTION_CHECKLIST_SNAPSHOT |
| sourceVersionItemId | UUID | FK → CHECKLIST_VERSION_ITEM |
| sourceChecklistItemId | UUID | FK legada, NULL |
| description | TEXT | NOT NULL |
| orderIndex | INTEGER | NOT NULL; UNIQUE com snapshotId |
| isRequired | BOOLEAN | NOT NULL |

### INSPECTION_SNAPSHOT_ITEM_STANDARD

| Campo | Tipo | Restrição |
| --- | --- | --- |
| snapshotItemId | UUID | PK, FK |
| standardId | UUID | PK, FK |
| type / code / title | ENUM/TEXT | cópia histórica obrigatória |
| summary / officialUrl | TEXT | cópia histórica opcional |

### ALTERAÇÕES EM INSPECTION E INSPECTION_RESPONSE

`INSPECTION` recebe `checklistVersionId`. `INSPECTION_RESPONSE` recebe
`snapshotItemId`, `createdAt` e `updatedAt`; `checklistItemId` torna-se opcional
durante a compatibilidade. Novas respostas são únicas por
`(inspectionId, snapshotItemId)`.

## 7.4 Regras de integridade

- há no máximo um draft por checklist;
- o número da versão é único e positivo dentro do checklist;
- estados publicados/retirados exigem autor, data e hash;
- versão publicada e snapshot não possuem caminhos públicos de alteração;
- inspeção e snapshot são criados na mesma transação;
- ordens são únicas dentro da versão e do snapshot;
- chaves estrangeiras históricas usam exclusão restritiva;
- respostas identificam o item do snapshot da própria inspeção;
- backfill legado é marcado como não verificável.

`ChecklistItem` e `ChecklistItemStandard` permanecem como tabelas de
compatibilidade, sem serem a fonte de verdade para novas inspeções.

## 7.5 Considerações

O modelo lógico mantém o catálogo normalizado e introduz cópias históricas
controladas apenas nos limites de versão e inspeção. Essa duplicação é
intencional e impede que atualizações futuras reescrevam registros de SST.
