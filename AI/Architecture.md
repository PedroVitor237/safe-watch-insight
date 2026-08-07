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

# Integridade Histórica de Checklists

O fluxo de inspeções usa uma arquitetura híbrida de versão publicada e snapshot:

```text
Checklist (identidade reutilizável)
  -> ChecklistVersion (DRAFT/PUBLISHED/RETIRED)
    -> ChecklistVersionItem
      -> ChecklistVersionItemStandard (metadados normativos copiados)

Inspection
  -> ChecklistVersion publicada usada como origem
  -> InspectionChecklistSnapshot (1:1)
    -> InspectionSnapshotItem
      -> InspectionSnapshotItemStandard (metadados normativos copiados)
      -> InspectionResponse
```

As fontes de verdade são separadas por contexto:

- manutenção do modelo: versão `DRAFT`;
- início de nova inspeção: versão `PUBLISHED`;
- execução, conclusão, não conformidades e consultas históricas: snapshot da inspeção;
- catálogo normativo atual: `Standard`;
- norma exibida no histórico: cópia contida no snapshot.

Uma versão publicada é imutável. Alterar título, descrição, itens, ordem,
obrigatoriedade ou associações normativas após a publicação cria, quando
necessário, o próximo draft derivado. A publicação calcula um hash SHA-256 do
conteúdo canônico e usa controle otimista para impedir publicação concorrente
com uma edição.

A criação da inspeção e do snapshot ocorre em uma única transação Prisma. A
inspeção somente pode usar uma versão `PUBLISHED`; título, descrição, itens e
metadados das normas são copiados para o snapshot. Respostas referenciam
`InspectionSnapshotItem`, de forma que nenhuma leitura histórica depende do
checklist, item ou norma mutável. A relação legada opcional com
`ChecklistItem` existe apenas para transição de dados e contratos antigos.

As consultas React Query de versões e do catálogo podem ser invalidadas após
edições ou publicação. Um snapshot de inspeção já criado não deve ser
invalidado nem reconstruído quando o checklist evolui.

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

Fluxo implementado para o MVP:

```
Usuário

↓

Frontend

↓

React Query

↓

Server Function

↓

EvidenceService

↓

StorageService

↓

Cloudinary (requisição assinada no servidor)

↓

EvidenceRepository

↓

Prisma

↓

PostgreSQL
```

O segredo da API nunca chega ao cliente. O banco armazena somente os metadados
da imagem e o identificador necessário para gerenciar seu ciclo de vida. A
regra de negócio depende de `StorageService`, não diretamente do Cloudinary.

---

# Funcionamento Offline

Arquitetura do primeiro incremento:

```
Frontend

↓

Camada local de domínio (Dexie/IndexedDB)

↓

Fila FIFO durável com UUID/dependências/retry

↓

Reconexão

↓

Backend

↓

PostgreSQL
```

O React Query consulta uma fachada cliente que seleciona o pacote local quando
não há conexão ou quando ele contém alterações ainda não confirmadas. Isso evita
que um refetch remoto sobrescreva estado local pendente. A camada local não
recebe regras de domínio remotas arbitrárias: ela aplica somente as transições
necessárias para resposta/NC/conclusão e o servidor revalida tudo no Service.

No backend, `saveInspectionResponse` e `finishInspection` aceitam metadados
opcionais de sincronização. A Server Function associa o usuário da sessão; o
Service calcula o hash e decide conflito; o Repository persiste a mutação e
`OfflineSyncOperation` na mesma transação Prisma.

O snapshot armazenado permanece a fonte histórica. Nenhum refetch, publicação
ou sincronização pode reconstruí-lo a partir do checklist atual.

O PWA usa manifest e service worker nativos. Apenas navegação e ativos estáticos
da mesma origem entram em cache; respostas de Server Functions e credenciais não
são armazenadas pelo service worker.

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
