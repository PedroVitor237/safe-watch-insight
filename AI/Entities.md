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

Representa a identidade reutilizável de um modelo de checklist. O conteúdo que
pode ser executado pertence às suas versões, e não deve ser lido diretamente
desta entidade para reconstruir uma inspeção histórica.

## Principais atributos

- id
- title
- description
- isTemplate
- isActive
- createdById

## Relacionamentos

Possui:

- várias versões;
- no máximo uma versão `DRAFT` por vez;
- várias inspeções e snapshots que preservam sua identidade de origem.

É utilizado em:

- várias inspeções

---

# CHECKLIST_VERSION

Representa uma revisão numerada do conteúdo de um checklist.

## Principais atributos

- id
- checklistId
- versionNumber
- status (`DRAFT`, `PUBLISHED` ou `RETIRED`)
- title
- description
- contentSchemaVersion
- contentHash
- createdById
- publishedById
- publishedAt
- createdAt
- updatedAt

## Regras e relacionamentos

- pertence a um checklist;
- possui vários itens de versão;
- uma versão `DRAFT` pode ser editada;
- uma versão `PUBLISHED` ou `RETIRED` é imutável;
- somente uma versão `PUBLISHED` pode iniciar uma inspeção;
- versões publicadas preservam autoria, momento e hash do conteúdo;
- novas alterações derivam o próximo draft, mantendo a linhagem entre itens.

---

# CHECKLIST_VERSION_ITEM

Representa um item pertencente a uma revisão específica do checklist.

Exemplos:

- Extintores sinalizados
- Utilização de EPI
- Brigada treinada

## Principais atributos

- id
- checklistVersionId
- sourceVersionItemId
- sourceChecklistItemId, apenas para rastreabilidade legada
- description
- orderIndex
- isRequired
- createdAt
- updatedAt

## Relacionamentos

Pertence a:

- uma versão do checklist

Pode estar relacionado a:

- várias normas por `ChecklistVersionItemStandard`

Pode originar itens de versões posteriores e itens de snapshot. Não recebe
diretamente as respostas da inspeção.

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

# CHECKLIST_VERSION_ITEM_STANDARD

Associação entre um item de versão e uma norma. Além de `standardId`, copia os
metadados `type`, `code`, `title`, `summary` e `officialUrl` necessários para
preservar o conteúdo publicado caso o catálogo normativo seja alterado.

`ChecklistItem` e `ChecklistItemStandard` permanecem no schema somente para
compatibilidade com os dados anteriores à arquitetura de versões.

---

# INSPECTION_CHECKLIST_SNAPSHOT

Representa o conteúdo histórico, autocontido e imutável que pertence a uma
única inspeção.

## Principais atributos

- id
- inspectionId
- sourceChecklistId
- sourceChecklistVersionId
- sourceVersionNumber
- title
- description
- isTemplate
- snapshotSchemaVersion
- contentHash
- origin (`INSPECTION_CREATION` ou `LEGACY_BACKFILL`)
- integrityStatus (`VERIFIED` ou `UNVERIFIED_LEGACY`)
- capturedAt

## Relacionamentos

- pertence a exatamente uma inspeção;
- referencia o checklist e a versão publicada de origem;
- possui vários itens de snapshot.

---

# INSPECTION_SNAPSHOT_ITEM

Representa a pergunta exatamente como foi capturada para uma inspeção.

## Principais atributos

- id
- snapshotId
- sourceVersionItemId
- sourceChecklistItemId, quando houver origem legada
- description
- orderIndex
- isRequired

## Relacionamentos

- pertence a um snapshot;
- possui metadados normativos copiados por `InspectionSnapshotItemStandard`;
- recebe a resposta da inspeção.

---

# INSPECTION_SNAPSHOT_ITEM_STANDARD

Associação histórica entre item de snapshot e norma. A referência ao catálogo
permite rastreabilidade, enquanto a cópia de tipo, código, título, resumo e URL
é a fonte usada para exibição histórica.


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
- versão publicada do checklist

Possui:

- um snapshot histórico obrigatório para execução
- respostas
- evidências
- relatório

---

# INSPECTION_RESPONSE

Representa a resposta dada para um item do snapshot da inspeção.

## Principais atributos

- id
- inspectionId
- snapshotItemId
- checklistItemId opcional, somente para compatibilidade legada
- status
- observation
- createdAt
- updatedAt

Cada resposta pertence a um item do snapshot da mesma inspeção. Esse vínculo é
a fonte de verdade para identificar o que foi respondido e para criar ou exibir
uma não conformidade sem consultar itens mutáveis.

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
- why
- location
- responsible
- dueDate
- method
- estimatedCost
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
- inspectionId ou nonConformityId, exatamente um
- publicId
- storageUrl
- fileName
- mimeType
- fileSize
- width
- height
- caption
- createdAt
- updatedAt
- deletedAt

## Regras e relacionamentos

- pertence diretamente a uma inspeção que possui snapshot imutável ou a uma
  não conformidade vinculada a um item do snapshot;
- nunca referencia checklist, versão ou item mutável;
- armazena apenas metadados; o binário permanece no provedor externo;
- a remoção é lógica e preserva o registro para rastreabilidade.

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
