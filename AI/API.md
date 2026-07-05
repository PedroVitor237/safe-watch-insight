# API.md

# API da Plataforma

Este documento define o padrão oficial para comunicação entre Frontend e Backend da plataforma **Safe Watch Insight**.

Todas as Server Functions, APIs REST ou futuros Route Handlers do Next.js deverão seguir estas especificações.

Este documento complementa:

- AGENTS.md
- Architecture.md
- BusinessRules.md
- Entities.md
- Database.md

---

# Objetivos

A API deve:

- possuir padrão único;
- ser previsível;
- ser facilmente documentada;
- permitir migração futura para Next.js;
- facilitar testes;
- facilitar manutenção.

---

# Arquitetura

Fluxo oficial

```
Frontend

↓

React Query

↓

Server Function / API

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

A API nunca deve acessar diretamente o Prisma.

Toda regra de negócio pertence aos Services.

---

# Organização

Cada módulo deverá possuir seu próprio conjunto de operações.

Exemplo:

```
Companies

GET

POST

PUT

DELETE
```

```
Checklists

GET

POST

PUT

DELETE
```

```
Inspections

GET

POST

PUT

DELETE
```

---

# Módulos

A API será organizada pelos seguintes módulos.

## Authentication

Responsável por:

- login
- logout
- usuário autenticado

---

## Users

Operações relacionadas aos usuários.

---

## Companies

Cadastro e consulta de empresas.

---

## Checklists

Gerenciamento de checklists.

---

## Checklist Items

Itens pertencentes aos checklists.

---

## Standards

Consulta das normas.

NR

NBR

NT

---

## Inspections

Execução das inspeções.

---

## Inspection Responses

Respostas dos itens.

---

## Non Conformities

Gerenciamento das irregularidades.

---

## Corrective Actions

Controle das ações corretivas.

---

## Evidence

Upload e consulta das evidências.

---

## Reports

Geração e consulta dos relatórios.

---

# Convenção de Rotas

Padrão:

```
/api/resource
```

Exemplos

```
/api/companies

/api/checklists

/api/inspections

/api/reports
```

Recursos específicos

```
/api/companies/:id

/api/checklists/:id

/api/inspections/:id
```

---

# Métodos HTTP

GET

Consultar recursos.

POST

Criar recursos.

PUT

Atualizar completamente.

PATCH

Atualizar parcialmente.

DELETE

Excluir recurso.

---

# Formato das Respostas

Sempre utilizar JSON.

Sucesso

```json
{
  "success": true,
  "data": {}
}
```

Erro

```json
{
  "success": false,
  "message": "Descrição do erro"
}
```

Erro com validação

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

---

# Status HTTP

200

Consulta realizada.

201

Recurso criado.

204

Sem conteúdo.

400

Requisição inválida.

401

Não autenticado.

403

Sem permissão.

404

Não encontrado.

409

Conflito.

422

Erro de validação.

500

Erro interno.

---

# Paginação

Coleções devem suportar paginação.

Formato:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "totalItems": 130,
  "totalPages": 7
}
```

---

# Filtros

Sempre utilizar parâmetros de consulta.

Exemplos

```
?status=open

?companyId=...

?checklistId=...

?page=1

?pageSize=20

?search=...
```

---

# Ordenação

Padrão

```
sortBy

sortOrder
```

Exemplo

```
?sortBy=createdAt

?sortOrder=desc
```

---

# Validação

Toda entrada deverá utilizar Zod.

Fluxo

```
Requisição

↓

Zod

↓

Service

↓

Repository
```

Nunca confiar nos dados recebidos.

---

# Tratamento de Erros

Toda exceção deverá retornar resposta padronizada.

Nunca expor:

- stack trace;
- SQL;
- Prisma Error;
- detalhes internos.

---

# Upload de Imagens

Fluxo

```
Frontend

↓

Cloudinary

↓

URL

↓

API

↓

Banco
```

A API armazenará apenas:

- URL
- nome
- tipo
- tamanho
- legenda

---

# Autenticação

Nesta etapa do projeto poderá ser utilizada autenticação simplificada.

Arquitetura preparada para futura implementação de:

- JWT
- Cookies HTTP Only
- Refresh Token

Nenhuma rota deve depender de implementação específica.

---

# Versionamento

A API deverá ser preparada para versionamento.

Exemplo

```
/api/v1/companies
```

Mesmo que inicialmente seja utilizada apenas a versão v1.

---

# Boas Práticas

Sempre retornar:

- códigos HTTP corretos;
- mensagens claras;
- estrutura consistente.

Evitar:

- respostas diferentes para o mesmo tipo de operação;
- duplicação de código;
- regras de negócio na camada de API.

---

# Convenções de Implementação

Cada recurso deverá possuir:

Service

Repository

Schema Zod

Tipos TypeScript

React Query Hooks

Exemplo

```
companies/

company.service.ts

company.repository.ts

company.schema.ts

company.types.ts

company.query.ts
```

---

# Operações Esperadas

## Companies

- Criar empresa
- Atualizar empresa
- Consultar empresa
- Listar empresas
- Excluir empresa

---

## Checklists

- Criar checklist
- Atualizar checklist
- Duplicar checklist
- Ativar
- Desativar
- Listar

---

## Checklist Items

- Criar item
- Atualizar item
- Reordenar item
- Excluir item

---

## Standards

- Listar normas
- Consultar norma
- Buscar por código

---

## Inspections

- Criar inspeção
- Atualizar inspeção
- Finalizar inspeção
- Listar inspeções
- Consultar inspeção

---

## Inspection Responses

- Registrar resposta
- Atualizar resposta

---

## Non Conformities

- Criar
- Atualizar
- Listar
- Alterar status

---

## Corrective Actions

- Criar
- Atualizar
- Concluir
- Listar

---

## Evidence

- Adicionar evidência
- Remover evidência
- Listar evidências

---

## Reports

- Gerar relatório
- Consultar relatório
- Baixar PDF

---

# Compatibilidade com Next.js

Toda API deverá ser implementada de forma que possa ser migrada posteriormente para Route Handlers do Next.js sem alterações na regra de negócio.

Os Services e Repositories devem permanecer independentes da tecnologia utilizada para expor a API.

---

# Objetivo Final

A API deve representar uma camada de comunicação consistente entre Frontend e Backend, garantindo padronização, facilidade de manutenção e compatibilidade com a evolução futura da plataforma.

Toda nova funcionalidade deverá seguir este padrão antes de ser implementada.
