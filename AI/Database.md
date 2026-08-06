# Database.md

# Banco de Dados

Este documento define os padrões de modelagem, implementação e manutenção do banco de dados da plataforma **Safe Watch Insight**.

Toda implementação deve permanecer compatível com:

- Documento de Requisitos
- Diagrama de Classes
- Modelo Conceitual
- Modelo Lógico
- Modelo Físico
- Dicionário de Dados
- Schema Prisma

O banco de dados oficial do projeto é **PostgreSQL**, utilizando **Prisma ORM** como camada de acesso aos dados.

---

# Objetivos

O banco de dados deve atender aos seguintes requisitos:

- consistência dos dados;
- rastreabilidade das inspeções;
- escalabilidade;
- facilidade de manutenção;
- compatibilidade com funcionamento offline;
- compatibilidade com Prisma ORM.

---

# Tecnologias

Banco de Dados

- PostgreSQL

Hospedagem

- Neon

ORM

- Prisma ORM

Migrações

- Prisma Migrate

Cliente

- Prisma Client

---

# Convenções Gerais

## Idioma

Toda a estrutura do banco deve utilizar inglês.

Exemplos:

User

Company

Inspection

Checklist

Evidence

Report

Nunca utilizar nomes em português.

---

## Nome das tabelas

Utilizar PascalCase no Prisma.

Exemplo

```prisma
model User
model Company
model Inspection
```

O Prisma fará automaticamente o mapeamento para PostgreSQL.

---

## Nome dos campos

Utilizar camelCase.

Exemplo

```text
createdAt

updatedAt

inspectionDate

employeeCount
```

---

## Chaves Primárias

Todas as entidades utilizarão UUID.

Exemplo

```prisma
id String @id @default(cuid())
```

Caso futuramente seja desejado utilizar UUID nativo do PostgreSQL, a alteração deverá ser transparente para a aplicação.

---

# Datas

Todos os registros importantes devem possuir:

```text
createdAt

updatedAt
```

Sempre utilizar:

```prisma
createdAt DateTime @default(now())

updatedAt DateTime @updatedAt
```

---

# Exclusão

Evitar exclusão física.

Sempre que possível utilizar Soft Delete.

Caso seja implementado:

```text
deletedAt DateTime?
```

---

# Relacionamentos

Sempre utilizar relacionamentos explícitos do Prisma.

Exemplo

```prisma
user User @relation(fields: [userId], references: [id])

userId String
```

Evitar informações duplicadas, exceto cópias históricas deliberadas e
documentadas em versões publicadas e snapshots de inspeção.

---

# Cardinalidade

As seguintes cardinalidades devem ser preservadas.

## User

1:N Company

1:N Checklist

1:N Inspection

1:N Report

---

## Company

1:N Inspection

---

## Checklist

1:N ChecklistVersion

1:N Inspection

1:N InspectionChecklistSnapshot como identidade de origem

`ChecklistItem` permanece somente como estrutura legada de compatibilidade.

---

## ChecklistVersion

1:N ChecklistVersionItem

1:N Inspection

1:N InspectionChecklistSnapshot como versão de origem

---

## ChecklistVersionItem

N:N Standard por `ChecklistVersionItemStandard`

1:N InspectionSnapshotItem como linhagem

---

## InspectionChecklistSnapshot

1:1 Inspection

1:N InspectionSnapshotItem

---

## InspectionSnapshotItem

N:N Standard por `InspectionSnapshotItemStandard`

1:N InspectionResponse

---

## Inspection

1:1 InspectionChecklistSnapshot

1:N InspectionResponse

1:N Evidence

1:1 Report

---

## InspectionResponse

0..1 NonConformity

---

## NonConformity

1:N CorrectiveAction

1:N Evidence

---

# Tipos de Dados

## Texto pequeno

String

---

## Texto longo

String

(PostgreSQL armazenará como TEXT quando necessário.)

---

## Datas

DateTime

---

## Apenas data

DateTime

A camada de aplicação decidirá se utilizará apenas a data.

---

## Booleanos

Boolean

---

## Quantidades

Int

---

## Arquivos

Tamanho

BigInt

Nunca utilizar Float para tamanho de arquivos.

---

# Evidências

As imagens NÃO serão armazenadas no banco.

O banco armazenará apenas:

- storageUrl

- publicId

- fileName

- mimeType

- fileSize

- width

- height

- caption

- createdAt

- updatedAt

O arquivo físico ficará em armazenamento externo.

Inicialmente:

Cloudinary.

Cada registro pertence a exatamente um contexto histórico: uma `Inspection`
que possui seu snapshot imutável ou uma `NonConformity` ligada à resposta e ao
item do snapshot. A migration aplica um `CHECK` para impedir registros órfãos
ou simultaneamente associados aos dois contextos. `publicId` é único e permite
remover o arquivo no provedor sem derivar identificadores da URL.

---

# Plano de Ação 5W2H

`CorrectiveAction` representa o plano 5W2H sem serialização ou duplicação de
entidades:

- `description`: o quê;
- `why`: por quê;
- `location`: onde;
- `responsible`: quem;
- `dueDate`: quando;
- `method`: como;
- `estimatedCost`: quanto.

Os campos adicionais são opcionais para manter compatibilidade com ações
corretivas simples e registros anteriores.

---

# Índices

Criar índices para campos frequentemente utilizados.

Exemplos

Company

- cnpj

Inspection

- companyId

- userId

- inspectionDate

Checklist

- createdById

ChecklistVersion

- checklistId + versionNumber (unique)

- checklistId + status

- status

- publishedAt

ChecklistVersionItem

- checklistVersionId + orderIndex (unique)

- sourceVersionItemId

InspectionChecklistSnapshot

- inspectionId (unique)

- sourceChecklistId

- sourceChecklistVersionId

- integrityStatus

InspectionSnapshotItem

- snapshotId + orderIndex (unique)

- sourceVersionItemId

Standard

- code

---

# Versionamento e Snapshot de Inspeção

`Checklist` representa a identidade reutilizável. O conteúdo editável pertence
a `ChecklistVersion`; cada versão possui número monotônico dentro do checklist e
estado `DRAFT`, `PUBLISHED` ou `RETIRED`. Há no máximo um draft por checklist,
garantido por índice único parcial da migration. Versões publicadas possuem
`publishedAt`, `publishedById`, `contentSchemaVersion` e `contentHash` SHA-256.

Itens de versão e suas associações normativas são registros próprios. A tabela
de associação copia `type`, `code`, `title`, `summary` e `officialUrl`, além de
manter a referência ao catálogo `Standard`. Isso preserva o conteúdo regulatório
da versão mesmo se o catálogo for atualizado.

Cada `Inspection` nova possui uma `InspectionChecklistSnapshot` exclusiva,
criada na mesma transação da inspeção. O snapshot registra:

- checklist e versão de origem;
- número da versão, título, descrição e indicador de template;
- versão do formato, hash, origem e situação de integridade;
- descrição, ordem e obrigatoriedade dos itens;
- metadados das normas relevantes para exibição histórica.

`InspectionResponse.snapshotItemId` é a referência histórica autoritativa. Os
campos opcionais `Inspection.checklistVersionId`,
`InspectionResponse.checklistItemId` e as tabelas antigas de item foram mantidos
na expansão do schema para compatibilidade. Novas gravações sempre preenchem a
versão e o snapshot; o backend não executa inspeções sem snapshot.

As FKs do modelo histórico usam `ON DELETE RESTRICT`. Ordens são únicas dentro
da versão e do snapshot, versões são únicas por checklist/número, snapshots são
únicos por inspeção e respostas são únicas por inspeção/item do snapshot.

## Backfill legado

A migration `20260803150000_add_checklist_versions_and_inspection_snapshots`
cria uma versão inicial a partir do melhor estado disponível de cada checklist,
gera um snapshot para cada inspeção existente e remapeia respostas para os itens
do snapshot. O processo é determinístico e aborta se alguma resposta não puder
ser mapeada.

Como o banco antigo não permite provar qual conteúdo existia na data da
inspeção, esses snapshots são identificados por:

- `origin = LEGACY_BACKFILL`;
- `integrityStatus = UNVERIFIED_LEGACY`;
- `snapshotSchemaVersion = 0`.

Snapshots criados normalmente usam `INSPECTION_CREATION`, `VERIFIED` e o formato
canônico atual. O marcador legado não deve ser promovido para `VERIFIED` sem uma
fonte histórica externa confiável.

---

# Unicidade

Devem possuir restrição UNIQUE:

User.email

Company.cnpj

Standard.code

ChecklistVersion(checklistId, versionNumber)

Um único ChecklistVersion `DRAFT` por checklist (índice único parcial)

ChecklistVersionItem(checklistVersionId, orderIndex)

InspectionChecklistSnapshot.inspectionId

InspectionSnapshotItem(snapshotId, orderIndex)

InspectionResponse(inspectionId, snapshotItemId)

---

# Integridade Referencial

Todos os relacionamentos devem utilizar Foreign Keys.

Nunca armazenar IDs órfãos.

---

# Migrações

Toda alteração estrutural deverá ser realizada utilizando:

```bash
npx prisma migrate dev
```

Nunca modificar diretamente o banco de produção.

---

# Seeds

Criar seeds para:

Normas Regulamentadoras

Usuário administrador

Templates básicos de Checklist

As seeds devem ser idempotentes.

O seed atual cadastra as NRs de `NR-1` a `NR-38`, mantém `NR-2` e `NR-27`
inativas por estarem revogadas e associa normas aplicáveis aos itens do
checklist demonstrativo. A fonte de consulta registrada é o catálogo oficial do
Ministério do Trabalho e Emprego.

---

# Prisma Client

Todo acesso ao banco deve ocorrer através do Prisma Client.

Nunca utilizar SQL bruto sem necessidade.

Fluxo obrigatório:

Repository

↓

Prisma Client

↓

PostgreSQL

---

# Repository Pattern

Repositories possuem apenas responsabilidades de persistência.

Exemplos:

create()

update()

delete()

findById()

findMany()

exists()

count()

Nenhuma regra de negócio deve existir nos repositories.

---

# Services

Toda regra de negócio pertence aos Services.

Exemplos:

validações

fluxos

regras

permissões

consistência

Nunca implementar regras de negócio dentro do Prisma.

---

# Performance

Sempre evitar:

consultas N+1

duplicação de dados

consultas desnecessárias

Sempre preferir:

include

select

paginação

índices

---

# Escalabilidade

O modelo deve suportar futuramente:

- múltiplas empresas;

- múltiplos usuários;

- permissões por perfil;

- sincronização offline;

- notificações;

- dashboards;

- BI;

- armazenamento de documentos;

- assinatura digital;

- geolocalização.

Nenhuma decisão atual deve impedir essas futuras implementações.

---

# Compatibilidade com Offline

A estrutura do banco deve permanecer compatível com sincronização utilizando IndexedDB.

Cada entidade deverá possuir um identificador estável que permita sincronização futura.

---

# Objetivo

O banco de dados deve representar fielmente o domínio do problema e permanecer consistente com toda a documentação do projeto.

Qualquer alteração estrutural deve ser refletida também na documentação do TCC.
