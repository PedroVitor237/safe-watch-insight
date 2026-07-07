# Architecture.md

# Arquitetura da Plataforma

Este documento define a arquitetura oficial da plataforma **Safe Watch Insight**.

Toda implementação deve seguir esta arquitetura para garantir organização, escalabilidade e compatibilidade com a documentação do projeto.

---

# Objetivos

A arquitetura deve:

- separar responsabilidades;
- facilitar manutenção;
- facilitar testes;
- reduzir acoplamento;
- permitir evolução futura;
- manter compatibilidade com Prisma ORM;
- manter compatibilidade com PostgreSQL;
- facilitar eventual avaliação futura de migração de framework.

---

# Visão Geral

A aplicação segue uma arquitetura em camadas.

```
┌──────────────────────────────┐
│          Frontend            │
│ React + TanStack Start       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ React Query                  │
│ Comunicação Cliente          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Server Functions / API       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Services                     │
│ Regras de Negócio            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Repositories                 │
│ Persistência                 │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Prisma ORM                   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PostgreSQL (Neon)            │
└──────────────────────────────┘
```

---

# Camadas

## Frontend

Responsável apenas pela interface do usuário.

Tecnologias:

- React
- TanStack Start
- TypeScript
- TailwindCSS
- Radix UI
- React Hook Form
- React Query

Responsabilidades:

- renderizar telas;
- capturar entradas do usuário;
- exibir mensagens;
- consumir APIs.

O frontend nunca deve acessar o banco diretamente.

---

## React Query

Responsável pela comunicação entre frontend e backend.

Responsabilidades:

- cache;
- sincronização;
- invalidação;
- atualização automática;
- controle de loading.

Nenhuma regra de negócio deve existir aqui.

---

## Server Functions / API

Representam a camada de entrada do backend.

Responsabilidades:

- receber requisições;
- validar entrada;
- chamar Services;
- devolver resposta.

Nunca implementar regras de negócio nesta camada.

---

## Services

Esta é a principal camada do sistema.

Toda regra de negócio pertence aos Services.

Exemplos:

- validar CNPJ;
- impedir duplicidade;
- criar inspeção;
- concluir inspeção;
- gerar relatório;
- registrar não conformidade.

Os Services nunca devem conhecer detalhes do frontend.

---

## Repositories

Responsáveis exclusivamente pelo acesso ao banco.

Funções típicas:

- create
- update
- delete
- findById
- findMany
- exists
- count

Repositories não devem conter regras de negócio.

---

## Prisma ORM

Responsável pelo mapeamento objeto-relacional.

Toda comunicação com o PostgreSQL deve passar pelo Prisma.

Nunca acessar o banco diretamente a partir das telas ou dos Services.

---

## Banco de Dados

Banco oficial:

PostgreSQL hospedado no Neon.

Toda estrutura deve permanecer compatível com:

- Modelo Conceitual
- Modelo Lógico
- Modelo Físico
- Schema Prisma

---

# Estrutura de Pastas

Estrutura recomendada:

```
src/

components/
hooks/
routes/

lib/

api/
repositories/
services/
validators/
schemas/
utils/

prisma/

Documentation/

AI/
```

Caso novas pastas sejam criadas, devem respeitar esta organização.

---

# Fluxo de uma Requisição

Exemplo:

```
Usuário

↓

Tela

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

Resposta:

```
PostgreSQL

↓

Prisma

↓

Repository

↓

Service

↓

Server Function

↓

React Query

↓

Tela
```

---

# Validação

Toda entrada deve ser validada.

Ferramenta oficial:

Zod

Fluxo:

```
Cliente

↓

Server Function

↓

Validação Zod

↓

Service
```

Nunca confiar em dados enviados pelo cliente.

---

# Tratamento de Erros

Cada camada possui responsabilidade própria.

Frontend

- mensagens ao usuário.

Server Function

- códigos HTTP;
- resposta padronizada.

Services

- regras violadas;
- exceções de domínio.

Repositories

- erros de persistência.

---

# Upload de Imagens

Fluxo planejado:

```
Usuário

↓

Frontend

↓

Cloudinary

↓

URL da imagem

↓

Backend

↓

PostgreSQL
```

O banco armazenará apenas os metadados da imagem.

---

# Funcionamento Offline

Arquitetura planejada:

```
Frontend

↓

IndexedDB

↓

Fila de sincronização

↓

Reconexão

↓

Backend

↓

PostgreSQL
```

Nesta primeira etapa, a arquitetura deve apenas ser preparada para esse fluxo.

---

# Geração de Relatórios

Fluxo:

```
Inspeção

↓

Service

↓

Montagem dos dados

↓

PDF

↓

Registro do relatório

↓

Download
```

---

# Segurança

Senhas:

bcrypt

Validação:

Zod

Comunicação:

HTTPS

Nunca armazenar informações sensíveis em texto puro.

---

# Escalabilidade

A arquitetura deve permitir futura implementação de:

- autenticação completa;
- controle de permissões;
- notificações;
- sincronização offline;
- BI;
- dashboards avançados;
- geolocalização;
- assinatura digital;
- múltiplas empresas;
- múltiplos usuários.

---

# Boas Práticas

Sempre utilizar:

- TypeScript estrito;
- componentes reutilizáveis;
- funções pequenas;
- baixo acoplamento;
- alta coesão;
- separação de responsabilidades.

Evitar:

- lógica nas telas;
- acesso direto ao banco;
- duplicação de código;
- funções muito grandes;
- dependências circulares.

---

# Compatibilidade com Evolução de Framework

Embora o frontend atual utilize TanStack Start, toda a arquitetura foi projetada para manter a camada de domínio desacoplada do framework de interface.

A camada de domínio (Services, Repositories e Prisma) deve permanecer independente do framework utilizado no frontend.

Essa decisão permite avaliar uma eventual migração futura com menor impacto e preserva a maior parte da lógica de negócio.

---

# Objetivo Final

A arquitetura deve servir como referência única para toda implementação da plataforma.

Toda nova funcionalidade deve respeitar as responsabilidades de cada camada e permanecer consistente com os demais documentos do projeto.
