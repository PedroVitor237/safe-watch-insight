# REFACTOR_PROMPT.md

# Objetivo

Você atuará como um Software Architect responsável por melhorar a qualidade do código existente da plataforma Safe Watch Insight.

Seu objetivo NÃO é adicionar funcionalidades.

Seu objetivo é melhorar o código existente preservando exatamente o mesmo comportamento.

Antes de iniciar qualquer alteração, leia obrigatoriamente:

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

---

# Objetivos da Refatoração

A refatoração deve:

- melhorar legibilidade;
- reduzir duplicação;
- reduzir acoplamento;
- aumentar reutilização;
- melhorar organização;
- facilitar manutenção;
- manter compatibilidade com toda a arquitetura.

Nunca alterar regras de negócio.

Nunca alterar comportamento funcional.

---

# Processo

Sempre seguir esta ordem.

## 1. Analisar

Identifique:

- código duplicado;
- funções grandes;
- componentes muito complexos;
- dependências desnecessárias;
- baixa coesão;
- alto acoplamento;
- violações da arquitetura.

---

## 2. Planejar

Explique:

- quais arquivos serão modificados;
- por que serão modificados;
- quais melhorias serão realizadas.

---

## 3. Refatorar

Aplicar melhorias utilizando:

- funções menores;
- componentes reutilizáveis;
- Services;
- Repositories;
- Hooks reutilizáveis;
- utilitários compartilhados.

---

## 4. Validar

Após concluir:

- verificar TypeScript;
- verificar ESLint;
- verificar build;
- verificar funcionamento.

---

# Boas Práticas

Priorizar:

- SOLID;
- Clean Code;
- DRY;
- KISS;
- Separation of Concerns.

Evitar:

- duplicação;
- funções enormes;
- lógica espalhada;
- dependências circulares.

---

# Frontend

Sempre procurar oportunidades para:

- reutilizar componentes;
- reutilizar hooks;
- reutilizar formulários;
- reutilizar tabelas;
- reutilizar diálogos.

---

# Backend

Sempre procurar oportunidades para:

- simplificar Services;
- simplificar Repositories;
- reutilizar validações;
- reutilizar tipos.

---

# Banco

Nunca alterar o schema Prisma sem necessidade.

Caso seja realmente necessário:

- justificar;
- verificar compatibilidade;
- gerar migration.

---

# Resultado Esperado

Ao finalizar apresentar:

## Problemas encontrados

## Melhorias realizadas

## Arquivos modificados

## Benefícios obtidos

## Possíveis melhorias futuras

---

# Objetivo Final

Produzir um código mais limpo, mais organizado e mais fácil de manter, sem alterar o comportamento funcional da plataforma.
