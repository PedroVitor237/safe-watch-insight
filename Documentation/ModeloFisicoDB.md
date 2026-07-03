# 8. Modelo Físico do Banco de Dados

## 8.1 Objetivo

O Modelo Físico do Banco de Dados representa a implementação da estrutura lógica da plataforma em um Sistema Gerenciador de Banco de Dados (SGBD). Nesta etapa, são definidos os tipos de dados, restrições, chaves primárias, chaves estrangeiras e demais características necessárias para a persistência das informações.

A modelagem foi desenvolvida considerando a utilização do **PostgreSQL** como banco de dados relacional, hospedado na plataforma **Neon**, e do **Prisma ORM** como camada de mapeamento objeto-relacional da aplicação.

O objetivo é garantir uma estrutura consistente, normalizada, escalável e compatível com os requisitos funcionais e não funcionais definidos para a plataforma.

---

## 8.2 Modelo Físico

A Figura 10 apresenta o Modelo Físico do Banco de Dados da Plataforma SST.

> **Figura 10 – Modelo Físico do Banco de Dados da Plataforma SST**

@startuml
title Modelo Físico do Banco de Dados - Plataforma SST

hide circle
skinparam linetype ortho
skinparam shadowing false
skinparam classAttributeIconSize 0

entity "USER" as User {
    * id : UUID <<PK>>
    --
    name : VARCHAR
    email : VARCHAR <<UNIQUE>>
    password : VARCHAR
    role : ENUM
    createdAt : TIMESTAMP
    updatedAt : TIMESTAMP
}

entity "COMPANY" as Company {
    * id : UUID <<PK>>
    --
    corporateName : VARCHAR
    tradeName : VARCHAR
    cnpj : VARCHAR <<UNIQUE>>
    cnae : VARCHAR
    riskLevel : INTEGER
    employeeCount : INTEGER
    address : TEXT
    notes : TEXT
    createdById : UUID <<FK>>
    createdAt : TIMESTAMP
    updatedAt : TIMESTAMP
}

entity "CHECKLIST" as Checklist {
    * id : UUID <<PK>>
    --
    title : VARCHAR
    description : TEXT
    isTemplate : BOOLEAN
    isActive : BOOLEAN
    createdById : UUID <<FK>>
    createdAt : TIMESTAMP
    updatedAt : TIMESTAMP
}

entity "CHECKLIST_ITEM" as ChecklistItem {
    * id : UUID <<PK>>
    --
    checklistId : UUID <<FK>>
    description : TEXT
    orderIndex : INTEGER
    isRequired : BOOLEAN
}

entity "STANDARD" as Standard {
    * id : UUID <<PK>>
    --
    type : ENUM
    code : VARCHAR
    title : VARCHAR
    summary : TEXT
    officialUrl : VARCHAR
    isActive : BOOLEAN
}

entity "CHECKLIST_ITEM_STANDARD" as ChecklistItemStandard {
    * checklistItemId : UUID <<PK, FK>>
    * standardId : UUID <<PK, FK>>
}

entity "INSPECTION" as Inspection {
    * id : UUID <<PK>>
    --
    userId : UUID <<FK>>
    companyId : UUID <<FK>>
    checklistId : UUID <<FK>>
    inspectionDate : TIMESTAMP
    status : ENUM
    syncStatus : ENUM
    notes : TEXT
    createdAt : TIMESTAMP
    updatedAt : TIMESTAMP
}

entity "INSPECTION_RESPONSE" as InspectionResponse {
    * id : UUID <<PK>>
    --
    inspectionId : UUID <<FK>>
    checklistItemId : UUID <<FK>>
    status : ENUM
    observation : TEXT
}

entity "NON_CONFORMITY" as NonConformity {
    * id : UUID <<PK>>
    --
    inspectionResponseId : UUID <<FK>>
    description : TEXT
    severity : ENUM
    dueDate : DATE
    status : ENUM
    createdAt : TIMESTAMP
}

entity "CORRECTIVE_ACTION" as CorrectiveAction {
    * id : UUID <<PK>>
    --
    nonConformityId : UUID <<FK>>
    description : TEXT
    responsible : VARCHAR
    dueDate : DATE
    status : ENUM
    completedAt : TIMESTAMP
}

entity "EVIDENCE" as Evidence {
    * id : UUID <<PK>>
    --
    inspectionId : UUID <<FK>>
    nonConformityId : UUID <<FK>>
    storageUrl : TEXT
    fileName : VARCHAR
    mimeType : VARCHAR
    fileSize : BIGINT
    caption : TEXT
    createdAt : TIMESTAMP
}

entity "REPORT" as Report {
    * id : UUID <<PK>>
    --
    inspectionId : UUID <<FK>>
    generatedById : UUID <<FK>>
    version : INTEGER
    generatedAt : TIMESTAMP
    observations : TEXT
}

User ||--o{ Company : registers

User ||--o{ Checklist : creates

User ||--o{ Inspection : performs

User ||--o{ Report : generates

Company ||--o{ Inspection : has

Checklist ||--o{ ChecklistItem : contains

Checklist ||--o{ Inspection : used_in

ChecklistItem ||--o{ ChecklistItemStandard

Standard ||--o{ ChecklistItemStandard

Inspection ||--o{ InspectionResponse : contains

ChecklistItem ||--o{ InspectionResponse : answered

InspectionResponse ||--|| NonConformity : generates

NonConformity ||--o{ CorrectiveAction : requires

Inspection ||--o{ Evidence : has

NonConformity ||--o{ Evidence : documents

Inspection ||--|| Report : generates

@enduml

**Fonte:** Elaborado pelo autor.

---

## 8.3 Estrutura Física das Tabelas

A seguir são apresentadas as estruturas físicas previstas para as principais tabelas da plataforma.

### USER

| Campo      | Tipo PostgreSQL | Restrições       |
| ---------- | --------------- | ---------------- |
| id         | UUID            | PK               |
| name       | VARCHAR(150)    | NOT NULL         |
| email      | VARCHAR(255)    | UNIQUE, NOT NULL |
| password   | VARCHAR(255)    | NOT NULL         |
| role       | VARCHAR(30)     | NOT NULL         |
| created_at | TIMESTAMP       | NOT NULL         |
| updated_at | TIMESTAMP       | NOT NULL         |

---

### COMPANY

| Campo          | Tipo PostgreSQL | Restrições |
| -------------- | --------------- | ---------- |
| id             | UUID            | PK         |
| corporate_name | VARCHAR(255)    | NOT NULL   |
| trade_name     | VARCHAR(255)    | NULL       |
| cnpj           | VARCHAR(18)     | UNIQUE     |
| cnae           | VARCHAR(10)     | NOT NULL   |
| risk_level     | SMALLINT        | NOT NULL   |
| employee_count | INTEGER         | NOT NULL   |
| address        | TEXT            | NULL       |
| notes          | TEXT            | NULL       |
| created_by_id  | UUID            | FK → USER  |
| created_at     | TIMESTAMP       | NOT NULL   |
| updated_at     | TIMESTAMP       | NOT NULL   |

---

### CHECKLIST

| Campo         | Tipo PostgreSQL | Restrições |
| ------------- | --------------- | ---------- |
| id            | UUID            | PK         |
| title         | VARCHAR(200)    | NOT NULL   |
| description   | TEXT            | NULL       |
| is_template   | BOOLEAN         | NOT NULL   |
| is_active     | BOOLEAN         | NOT NULL   |
| created_by_id | UUID            | FK → USER  |
| created_at    | TIMESTAMP       | NOT NULL   |
| updated_at    | TIMESTAMP       | NOT NULL   |

---

### CHECKLIST_ITEM

| Campo        | Tipo PostgreSQL | Restrições |
| ------------ | --------------- | ---------- |
| id           | UUID            | PK         |
| checklist_id | UUID            | FK         |
| description  | TEXT            | NOT NULL   |
| order_index  | INTEGER         | NOT NULL   |
| is_required  | BOOLEAN         | NOT NULL   |

---

### STANDARD

| Campo        | Tipo PostgreSQL | Restrições |
| ------------ | --------------- | ---------- |
| id           | UUID            | PK         |
| type         | VARCHAR(20)     | NOT NULL   |
| code         | VARCHAR(30)     | NOT NULL   |
| title        | VARCHAR(255)    | NOT NULL   |
| summary      | TEXT            | NULL       |
| official_url | TEXT            | NULL       |
| is_active    | BOOLEAN         | NOT NULL   |

---

### CHECKLIST_ITEM_STANDARD

| Campo             | Tipo PostgreSQL | Restrições |
| ----------------- | --------------- | ---------- |
| checklist_item_id | UUID            | PK, FK     |
| standard_id       | UUID            | PK, FK     |

---

### INSPECTION

| Campo           | Tipo PostgreSQL | Restrições |
| --------------- | --------------- | ---------- |
| id              | UUID            | PK         |
| user_id         | UUID            | FK         |
| company_id      | UUID            | FK         |
| checklist_id    | UUID            | FK         |
| inspection_date | TIMESTAMP       | NOT NULL   |
| status          | VARCHAR(30)     | NOT NULL   |
| sync_status     | VARCHAR(30)     | NOT NULL   |
| notes           | TEXT            | NULL       |
| created_at      | TIMESTAMP       | NOT NULL   |
| updated_at      | TIMESTAMP       | NOT NULL   |

---

### INSPECTION_RESPONSE

| Campo             | Tipo PostgreSQL | Restrições |
| ----------------- | --------------- | ---------- |
| id                | UUID            | PK         |
| inspection_id     | UUID            | FK         |
| checklist_item_id | UUID            | FK         |
| status            | VARCHAR(30)     | NOT NULL   |
| observation       | TEXT            | NULL       |

---

### NON_CONFORMITY

| Campo                  | Tipo PostgreSQL | Restrições |
| ---------------------- | --------------- | ---------- |
| id                     | UUID            | PK         |
| inspection_response_id | UUID            | FK         |
| description            | TEXT            | NOT NULL   |
| severity               | VARCHAR(20)     | NOT NULL   |
| due_date               | DATE            | NULL       |
| status                 | VARCHAR(30)     | NOT NULL   |
| created_at             | TIMESTAMP       | NOT NULL   |

---

### CORRECTIVE_ACTION

| Campo             | Tipo PostgreSQL | Restrições |
| ----------------- | --------------- | ---------- |
| id                | UUID            | PK         |
| non_conformity_id | UUID            | FK         |
| description       | TEXT            | NOT NULL   |
| responsible       | VARCHAR(255)    | NULL       |
| due_date          | DATE            | NULL       |
| status            | VARCHAR(30)     | NOT NULL   |
| completed_at      | TIMESTAMP       | NULL       |

---

### EVIDENCE

| Campo             | Tipo PostgreSQL | Restrições |
| ----------------- | --------------- | ---------- |
| id                | UUID            | PK         |
| inspection_id     | UUID            | FK (NULL)  |
| non_conformity_id | UUID            | FK (NULL)  |
| storage_url       | TEXT            | NOT NULL   |
| file_name         | VARCHAR(255)    | NOT NULL   |
| mime_type         | VARCHAR(100)    | NOT NULL   |
| file_size         | BIGINT          | NOT NULL   |
| caption           | TEXT            | NULL       |
| created_at        | TIMESTAMP       | NOT NULL   |

---

### REPORT

| Campo           | Tipo PostgreSQL | Restrições |
| --------------- | --------------- | ---------- |
| id              | UUID            | PK         |
| inspection_id   | UUID            | UNIQUE, FK |
| generated_by_id | UUID            | FK → USER  |
| version         | INTEGER         | NOT NULL   |
| generated_at    | TIMESTAMP       | NOT NULL   |
| observations    | TEXT            | NULL       |

---

## 8.4 Restrições de Integridade

A implementação física deverá respeitar as seguintes restrições:

* Todas as chaves primárias utilizarão identificadores do tipo UUID.
* As chaves estrangeiras garantirão a integridade referencial entre as tabelas.
* Campos obrigatórios serão definidos com a restrição `NOT NULL`.
* Campos que exigem unicidade, como o e-mail do usuário e o CNPJ da empresa, utilizarão a restrição `UNIQUE`.
* A tabela associativa `CHECKLIST_ITEM_STANDARD` utilizará chave primária composta.
* O relacionamento entre `INSPECTION` e `REPORT` será de um para um, garantindo um único relatório por inspeção.

---

## 8.5 Compatibilidade com Prisma ORM

O modelo físico foi concebido para ser implementado utilizando o Prisma ORM, permitindo que cada tabela do banco de dados seja representada por um modelo (`model`) no arquivo `schema.prisma`.

Além do mapeamento das entidades, o Prisma será responsável por gerenciar os relacionamentos, migrações de banco de dados, validação de integridade e acesso aos dados por meio de uma API tipada em TypeScript.

A utilização do Prisma proporciona maior produtividade no desenvolvimento, redução de erros relacionados a consultas SQL e facilidade na evolução do esquema do banco de dados ao longo do ciclo de vida da aplicação.

---

## 8.6 Considerações

O Modelo Físico consolida as decisões de modelagem adotadas ao longo do projeto, garantindo consistência entre os requisitos do sistema, os diagramas UML e a implementação prevista para a plataforma.

Sua estrutura foi definida visando atender às necessidades de rastreabilidade das inspeções, armazenamento seguro de evidências, suporte ao funcionamento offline por meio da sincronização com o banco de dados e facilidade de manutenção e expansão futura da aplicação.
