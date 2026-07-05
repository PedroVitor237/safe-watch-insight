# Entities.md

# Entidades do Sistema

Este documento descreve todas as entidades do domínio da aplicação Safe Watch Insight.

As entidades aqui descritas representam a base do modelo de dados e devem permanecer compatíveis com:

- Documento de Requisitos
- Diagrama de Classes UML
- Modelo Conceitual
- Modelo Lógico
- Modelo Físico
- Schema Prisma

Caso seja necessário alterar alguma entidade, a alteração deve manter compatibilidade com toda a documentação do projeto.

---

# USER

Representa um usuário autenticado da plataforma.

## Responsabilidades

- acessar o sistema
- criar checklists
- cadastrar empresas
- realizar inspeções
- gerar relatórios

## Principais atributos

- id
- name
- email
- password
- role
- createdAt
- updatedAt

## Relacionamentos

Um usuário pode:

- cadastrar várias empresas
- criar vários checklists
- realizar várias inspeções
- gerar vários relatórios

---

# COMPANY

Representa uma empresa que poderá ser inspecionada.

## Objetivo

Centralizar todas as informações da empresa fiscalizada.

## Principais atributos

- id
- corporateName
- tradeName
- cnpj
- cnae
- riskLevel
- employeeCount
- address
- notes
- createdById

## Relacionamentos

Uma empresa possui:

- várias inspeções

---

# CHECKLIST

Representa um modelo de checklist.

Pode ser reutilizado em diversas inspeções.

## Principais atributos

- id
- title
- description
- isTemplate
- isActive
- createdById

## Relacionamentos

Possui:

- vários itens

É utilizado em:

- várias inspeções

---

# CHECKLIST_ITEM

Representa um item individual do checklist.

Exemplos:

- Extintores sinalizados
- Utilização de EPI
- Brigada treinada

## Principais atributos

- id
- checklistId
- description
- orderIndex
- isRequired

## Relacionamentos

Pertence a:

- um checklist

Pode estar relacionado a:

- várias normas

Recebe respostas durante uma inspeção.

---

# STANDARD

Representa uma norma técnica.

O sistema possui foco principal nas NRs.

A arquitetura também suporta:

- NBR
- NT
- legislação complementar

## Principais atributos

- id
- type
- code
- title
- summary
- officialUrl
- isActive

## Exemplos

NR-06

NR-10

NR-12

NR-17

NR-18

NR-20

NR-23

NR-33

NR-35

---

# CHECKLIST_ITEM_STANDARD

Tabela de associação.

Resolve relacionamento N:N entre:

ChecklistItem

e

Standard

---

# INSPECTION

Representa uma inspeção realizada.

É a principal entidade do sistema.

## Principais atributos

- id
- inspectionDate
- status
- syncStatus
- notes

## Relacionamentos

Pertence a:

- usuário
- empresa
- checklist

Possui:

- respostas
- evidências
- relatório

---

# INSPECTION_RESPONSE

Representa a resposta dada para um item do checklist.

## Principais atributos

- id
- inspectionId
- checklistItemId
- status
- observation

Pode gerar:

- não conformidade

---

# NON_CONFORMITY

Representa um problema encontrado durante uma inspeção.

## Exemplos

Extintor vencido

Ausência de EPI

Sinalização inadequada

Treinamento vencido

## Principais atributos

- id
- description
- severity
- dueDate
- status

## Relacionamentos

Possui:

- ações corretivas

Pode possuir:

- evidências

---

# CORRECTIVE_ACTION

Representa uma ação para resolver uma não conformidade.

## Principais atributos

- id
- description
- responsible
- dueDate
- status
- completedAt

---

# EVIDENCE

Representa arquivos anexados.

Inicialmente:

- fotografias

Futuramente:

- vídeos
- documentos

## Principais atributos

- id
- storageUrl
- fileName
- mimeType
- fileSize
- caption

---

# REPORT

Representa um relatório gerado pelo sistema.

Cada relatório corresponde a uma inspeção.

## Principais atributos

- id
- inspectionId
- generatedById
- version
- generatedAt
- observations

---

# Fluxo principal das entidades

USER

↓

COMPANY

↓

CHECKLIST

↓

CHECKLIST_ITEM

↓

INSPECTION

↓

INSPECTION_RESPONSE

↓

NON_CONFORMITY

↓

CORRECTIVE_ACTION

↓

REPORT

↓

EVIDENCE

---

# Convenções

Todas as entidades devem:

- utilizar UUID como chave primária;
- possuir timestamps quando aplicável;
- utilizar Prisma ORM;
- ser compatíveis com PostgreSQL;
- utilizar nomenclatura em inglês.

---

# Objetivo

Estas entidades representam o domínio oficial do projeto.

Novas entidades somente devem ser criadas quando realmente necessárias e após verificar compatibilidade com toda a documentação existente.
