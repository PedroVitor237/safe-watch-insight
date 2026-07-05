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

Nunca armazenar informações duplicadas.

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

1:N ChecklistItem

1:N Inspection

---

## ChecklistItem

N:N Standard

1:N InspectionResponse

---

## Inspection

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

- fileName

- mimeType

- fileSize

- caption

O arquivo físico ficará em armazenamento externo.

Inicialmente:

Cloudinary.

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

Standard

- code

---

# Unicidade

Devem possuir restrição UNIQUE:

User.email

Company.cnpj

Standard.code

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
