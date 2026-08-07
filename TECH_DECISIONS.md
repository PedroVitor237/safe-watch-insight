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

Planejamento futuro:

Uma migração para Next.js Full Stack poderá ser avaliada posteriormente, preservando a lógica de domínio implementada caso a mudança seja tecnicamente justificável. Essa migração não faz parte da entrega atual.

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

Decisão revisada em 6 de agosto de 2026:

- Offline/PWA passa a ter prioridade sobre Relatórios e Dashboard;
- IndexedDB é acessado por Dexie, conforme a recomendação arquitetural existente;
- somente pacotes de domínio necessários à execução são persistidos, não o cache
  arbitrário do React Query;
- cada pacote pertence a um usuário e contém a inspeção, seu snapshot, itens,
  normas e respostas;
- respostas e conclusão usam fila FIFO durável com sequência local, UUID de
  operação, retry exponencial e recuperação de `SYNCING` após reinício;
- `OfflineSyncOperation` registra ID, usuário, inspeção, tipo e hash na mesma
  transação da mutação remota;
- retry do mesmo ID/payload é idempotente; reutilização divergente é conflito;
- respostas com revisão remota diferente são bloqueadas para reconciliação, sem
  `Last Write Wins`;
- `InspectionResponse.updatedAt` permanece revisão do servidor e
  `clientUpdatedAt` preserva o horário original do dispositivo;
- sessão offline guarda somente o usuário seguro e validade local de oito horas;
  senha, cookie HTTP-only e segredos não são copiados;
- logout remove sessão, pacotes e fila do IndexedDB, além do cache privado de navegação.
- a troca de usuário autenticado limpa os pacotes e operações do usuário anterior no mesmo navegador.
- o preset Vercel publica MIME explícito para o manifest e `no-cache` para o service worker.

O incremento é parcial até a execução do cenário browser/E2E completo. Criação
integral de inspeção offline, resolução assistida de conflitos, Background Sync
e evidências binárias offline permanecem futuras.

---

# Upload de Evidências

Decisão revisada em 6 de agosto de 2026:

- upload de imagens implementado pelo servidor com requisições assinadas ao Cloudinary;
- `CLOUDINARY_API_SECRET` permanece exclusivamente no ambiente do servidor;
- uma interface `StorageService` separa regras de negócio do provedor;
- PostgreSQL armazena somente URL, `publicId`, MIME type, tamanho, dimensões e timestamps;
- imagens aceitas no MVP: JPEG, PNG e WebP, com limite de 4 MB;
- evidências pertencem à inspeção com snapshot imutável ou à não conformidade vinculada ao item do snapshot;
- remoção utiliza soft delete e compensação quando o provedor externo falha;
- Base64 e binários não são persistidos no banco.

Compressão, retenção de `Blob` e fila offline de evidências continuam adiadas. A
interface informa essa limitação e não apresenta metadados em cache como upload
offline concluído.

---

# Autenticação

Não utilizar Neon Auth.

Motivo:

A autenticação faz parte da lógica da aplicação e deverá permanecer independente do provedor de banco de dados.

Implementação atual:

- Prisma
- bcrypt
- sessões HTTP-only do TanStack Start

JWT não é utilizado nesta entrega. Caso haja necessidade futura, poderá ser avaliado sem acoplar a lógica de autenticação ao provedor de banco de dados.

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

# Versionamento de Checklist e Integridade Histórica

Decisão aprovada e implementada em 3 de agosto de 2026:

**Checklist Version publicada + snapshot relacional por inspeção.**

Motivos:

- um checklist reutilizável precisa evoluir sem reescrever inspeções antigas;
- versões publicadas fornecem ciclo editorial, reutilização e comparação;
- o snapshot torna cada inspeção independente de consultas a entidades mutáveis;
- a separação prepara PDF, evidências, assinatura e sincronização sem exigir
  event sourcing no escopo do TCC.

Regras da decisão:

- `Checklist` é identidade e catálogo;
- conteúdo vive em `ChecklistVersion` e `ChecklistVersionItem`;
- o ciclo é `DRAFT`, `PUBLISHED` e `RETIRED`;
- versões publicadas/retiradas são imutáveis;
- somente versões publicadas iniciam inspeções;
- edição posterior cria ou reutiliza o próximo draft;
- a publicação registra autor, data, versão do formato e SHA-256 canônico;
- inspeção e snapshot são criados na mesma transação;
- execução, respostas, não conformidades e histórico leem o snapshot;
- dados normativos de versão e snapshot são cópias controladas do catálogo;
- backfill antigo é marcado como `UNVERIFIED_LEGACY` e nunca apresentado como
  reconstrução historicamente comprovada.

Foram intencionalmente adiados audit log completo, event sourcing, interface
completa de histórico/retirada, offline, assinatura, evidências e relatórios.

O estudo que fundamentou a decisão está em
`CHECKLIST_VERSIONING_ARCHITECTURE.md`.

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

1. Validar e completar o marco Offline/PWA do fluxo principal.
2. Implementar reconciliação assistida e upload offline de evidências.
3. Autorização por perfil e gestão completa de usuários.
4. Geração de PDF.
5. Dashboard com dados reais.
6. Testes automatizados ampliados.
7. CI/CD.
8. Observabilidade e monitoramento.
9. Avaliação técnica de eventual migração de framework, sem compromisso nesta entrega.
