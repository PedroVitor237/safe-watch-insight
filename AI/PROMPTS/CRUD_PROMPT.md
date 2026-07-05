# CRUD_PROMPT.md

# Objetivo

Você irá implementar um CRUD completo para uma entidade da plataforma Safe Watch Insight.

Antes de escrever qualquer código, leia obrigatoriamente:

- AGENTS.md
- AI/PROJECT_CONTEXT.md
- AI/Architecture.md
- AI/BusinessRules.md
- AI/Database.md
- AI/Entities.md
- AI/API.md
- AI/Offline.md
- AI/IMPLEMENTATION_PLAN.md
- AI/TASKS.md

Respeite toda a documentação.

---

# Entidade

A entidade será informada pelo usuário.

Exemplo:

- Company
- Checklist
- Inspection
- Report

---

# O que implementar

Implemente um CRUD completo.

Sempre criar:

- Repository
- Service
- Schemas Zod
- Tipos TypeScript
- Server Functions
- Hooks React Query
- Integração com o Frontend

Nunca implementar apenas parte do CRUD.

---

# Arquitetura

Obrigatoriamente seguir:

Frontend

↓

React Query

↓

Server Function

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

Nunca acessar o Prisma diretamente pelas rotas.

Nunca colocar regra de negócio no frontend.

---

# Banco

Caso seja necessário alterar o schema Prisma:

- justificar a alteração;
- verificar compatibilidade com a documentação;
- gerar migration.

Nunca alterar o banco sem necessidade.

---

# Código

Utilizar:

- TypeScript estrito
- Prisma ORM
- Repository Pattern
- Service Layer
- Zod
- React Query

Nunca utilizar:

- any
- SQL bruto
- código duplicado

---

# Antes de implementar

Explique:

- o que será implementado;
- quais arquivos serão criados;
- quais arquivos serão modificados.

---

# Após implementar

Informar:

## Arquivos criados

## Arquivos alterados

## Próximas tarefas recomendadas

---

# Objetivo

Entregar um CRUD completo, limpo, testável e consistente com toda a arquitetura do projeto.
