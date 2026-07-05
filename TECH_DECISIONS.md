# TECH_DECISIONS.md

# Safe Watch Insight

## Objetivo

Este documento registra todas as decisões técnicas relevantes do projeto.

Seu objetivo é evitar retrabalho, manter consistência entre a documentação e a implementação e servir como referência para qualquer desenvolvedor (humano ou IA) que trabalhe neste repositório.

Em caso de conflito entre sugestões de implementação e este documento, as decisões aqui registradas devem prevalecer até que sejam oficialmente revisadas.

---

# Tecnologias

## Framework

Situação atual:

- TanStack Start

Motivo:

O frontend foi inicialmente desenvolvido utilizando Lovable + TanStack Start.

A prioridade é concluir a entrega da disciplina utilizando essa base, evitando uma migração durante o desenvolvimento do backend.

Plano futuro:

Migrar para Next.js Full Stack quando houver tempo disponível, preservando toda a lógica de domínio implementada.

---

## Backend

Implementado utilizando:

- TanStack Start Server Functions
- TypeScript
- Prisma ORM

Arquitetura:

Frontend

↓

React Query

↓

Server Functions

↓

Service Layer

↓

Repository Layer

↓

Prisma ORM

↓

PostgreSQL

---

## Banco de Dados

Banco:

PostgreSQL

Hospedagem:

Neon

ORM:

Prisma ORM 7

---

# Idioma

## Código

Todo o código de domínio deverá utilizar nomenclatura em inglês.

Exemplos:

- User
- Company
- Checklist
- Inspection
- Report

Motivo:

- alinhamento com Prisma;
- alinhamento com PostgreSQL;
- compatibilidade com documentação técnica;
- facilidade de manutenção.

---

## Interface

Toda a interface permanecerá em português.

Os usuários finais da plataforma são prioritariamente brasileiros.

Exemplos:

Backend:

Company

Interface:

Empresa

Backend:

Inspection

Interface:

Inspeção

Nunca utilizar tradução automática do navegador como estratégia de internacionalização.

Caso o projeto evolua para múltiplos idiomas, utilizar uma solução própria de i18n.

---

# Offline

A plataforma continuará sendo projetada como Offline First.

Entretanto, nesta entrega acadêmica:

- IndexedDB não será implementado;
- sincronização não será implementada.

A arquitetura deverá permanecer preparada para futura implementação.

---

# Upload de Evidências

Nesta entrega:

Não implementar upload definitivo.

A estrutura do banco deverá suportar upload.

Implementação futura:

Cloudinary.

---

# Autenticação

Não utilizar Neon Auth.

Motivo:

A autenticação faz parte da lógica da aplicação e deverá permanecer independente do provedor de banco de dados.

Implementação prevista:

- Prisma
- bcrypt
- sessão/JWT

---

# Deploy

Situação atual:

Frontend e Backend:

Mesmo projeto TanStack Start.

Hospedagem:

Vercel.

Banco:

Neon.

---

# Nitro

O plugin `nitro()` permanece explicitamente configurado no `vite.config.ts`.

Motivo:

Foi necessário para garantir compatibilidade com o deploy atual na Vercel.

Essa configuração não deve ser removida sem nova validação de deploy.

---

# Prisma

Utilizar Prisma ORM 7.

O schema Prisma representa a fonte oficial do modelo físico do banco.

Sempre que possível, alterações no banco devem ser realizadas através de migrations.

---

# Qualidade de Código

Prioridades desta entrega:

1. Funcionalidade.
2. Arquitetura.
3. Segurança.
4. Organização.
5. Performance.

Problemas exclusivamente relacionados à formatação (ESLint/Prettier) podem ser corrigidos posteriormente, desde que não afetem a qualidade do código.

---

# Estrutura do Projeto

Toda lógica de backend deverá ficar concentrada em:

src/server/

Estrutura prevista:

src/server/

- prisma/
- repositories/
- services/
- schemas/
- errors/
- utils/
- types/

O frontend não deverá acessar diretamente o Prisma.

Toda comunicação deverá ocorrer através das camadas definidas pela arquitetura.

---

# Estratégia de Desenvolvimento

O desenvolvimento seguirá por sprints.

Cada sprint deverá:

- possuir objetivo único;
- implementar apenas um conjunto de funcionalidades relacionadas;
- manter o projeto compilando ao final.

Evitar grandes alterações simultâneas.

---

# Uso de Inteligência Artificial

Este projeto foi estruturado para desenvolvimento assistido por IA.

Antes de implementar qualquer funcionalidade, recomenda-se a leitura dos seguintes documentos:

1. AGENTS.md
2. PROJECT_CONTEXT.md
3. IMPLEMENTATION_PLAN.md
4. TASKS.md
5. TECH_DECISIONS.md
6. Todos os documentos da pasta AI/

Toda implementação deverá respeitar a documentação existente.

Caso exista divergência entre código e documentação, a divergência deverá ser comunicada antes de qualquer alteração significativa.

---

# Futuras Evoluções

Quando houver disponibilidade, priorizar:

1. Migração para Next.js Full Stack.
2. Autenticação completa.
3. Funcionamento Offline First.
4. Upload de evidências via Cloudinary.
5. Geração de PDF.
6. Dashboard com dados reais.
7. PWA completo.
8. Testes automatizados.
9. CI/CD.
10. Observabilidade e monitoramento.
