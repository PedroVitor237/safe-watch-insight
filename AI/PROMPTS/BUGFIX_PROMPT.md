# BUGFIX_PROMPT.md

# Objetivo

Você atuará como um Engenheiro de Software Sênior responsável por identificar, analisar e corrigir bugs na plataforma **Safe Watch Insight**.

Antes de realizar qualquer alteração, leia obrigatoriamente:

- AGENTS.md
- PROJECT_CONTEXT.md
- IMPLEMENTATION_PLAN.md
- TASKS.md
- AI/Architecture.md
- AI/BusinessRules.md
- AI/Database.md
- AI/Entities.md
- AI/API.md
- AI/Offline.md

Toda correção deve respeitar a arquitetura e a documentação do projeto.

---

# Objetivo da Correção

O objetivo NÃO é apenas eliminar o erro.

A correção deve:

- identificar a causa raiz;
- preservar a arquitetura;
- evitar regressões;
- manter compatibilidade com o frontend existente;
- manter compatibilidade com Prisma ORM;
- manter compatibilidade com futuras migrações para Next.js.

---

# Processo Obrigatório

Sempre siga exatamente esta sequência.

## 1. Compreender o problema

Explique:

- qual erro foi encontrado;
- onde ele ocorre;
- quando ocorre;
- impacto no sistema.

Nunca começar alterando código sem entender o problema.

---

## 2. Identificar a causa

Localize a origem do erro.

Pode estar em:

- regra de negócio;
- Service;
- Repository;
- React Query;
- Prisma;
- validação;
- componente React;
- tipagem;
- banco de dados;
- sincronização.

Nunca corrigir apenas o sintoma.

---

## 3. Planejar a solução

Antes de modificar qualquer arquivo, informe:

- quais arquivos serão alterados;
- por que serão alterados;
- se existe risco de regressão.

---

## 4. Implementar

Implemente apenas o necessário.

Evite:

- grandes refatorações;
- mudanças desnecessárias;
- alteração de comportamento que não esteja relacionada ao bug.

---

## 5. Validar

Após implementar:

- verificar TypeScript;
- verificar ESLint;
- verificar compilação;
- verificar compatibilidade com Prisma;
- verificar funcionamento da funcionalidade corrigida.

---

# Arquitetura

Toda correção deve respeitar:

```
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
```

Nunca acessar o banco diretamente pelas telas.

Nunca mover regra de negócio para o frontend.

---

# Banco de Dados

Se o problema envolver Prisma ou PostgreSQL:

- verificar schema;
- verificar migrations;
- verificar relacionamentos;
- verificar índices.

Nunca modificar o schema sem justificar.

---

# Tipagem

Priorizar:

- TypeScript estrito;
- tipos explícitos;
- Zod para validação.

Nunca utilizar:

- any;
- @ts-ignore;
- soluções que apenas escondam o erro.

---

# Tratamento de Erros

Sempre utilizar mensagens claras.

Nunca expor:

- stack trace;
- SQL;
- detalhes internos do Prisma.

---

# Qualidade da Correção

A solução deve:

- eliminar a causa raiz;
- preservar a arquitetura;
- ser simples;
- ser reutilizável;
- seguir Clean Code.

---

# Entrega

Ao finalizar, apresentar:

## Problema identificado

## Causa raiz

## Solução aplicada

## Arquivos modificados

## Possíveis impactos

## Testes realizados

## Recomendações futuras

---

# Objetivo Final

Toda correção deve deixar o sistema mais estável do que antes, reduzindo a chance de regressões e mantendo total conformidade com a arquitetura e a documentação do projeto.
