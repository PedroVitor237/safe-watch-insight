# Safe Watch Insight

Plataforma web desenvolvida no contexto de um Trabalho de Conclusão de Curso
(TCC) em Análise e Desenvolvimento de Sistemas para apoiar inspeções, auditorias
e fiscalizações de Segurança e Saúde no Trabalho (SST).

O projeto trata a inspeção como um fluxo rastreável: empresas e checklists são
mantidos no sistema, versões de checklist são publicadas, cada inspeção preserva
um snapshot histórico e as respostas podem gerar não conformidades, ações
corretivas e evidências. A base combina requisitos acadêmicos, decisões de
arquitetura, implementação incremental e documentação de evolução.

## Problema e público-alvo

Formulários impressos, planilhas e fotografias mantidas separadamente dificultam
a consulta do histórico, o acompanhamento de pendências e a rastreabilidade de
uma inspeção. O Safe Watch Insight organiza esse processo para profissionais
como técnicos e engenheiros de Segurança do Trabalho, auditores, supervisores e
consultores de SST.

## Estado atual

O fluxo principal já usa autenticação real, Server Functions, Services,
Repositories, Prisma e PostgreSQL. Estão integrados ao backend:

- empresas;
- checklists, itens, normas e publicação de versões;
- criação, listagem e execução de inspeções;
- respostas e conclusão de inspeções;
- não conformidades e ações corretivas;
- evidências fotográficas armazenadas no Cloudinary;
- primeiro incremento Offline/PWA para inspeções já disponibilizadas no
  dispositivo.

Dashboard, relatórios e equipe ainda são prévias identificadas na interface com
dados demonstrativos. O suporte offline também é parcial: respostas e conclusão
do fluxo principal usam IndexedDB e uma fila durável, mas criação integral de
inspeções offline, reconciliação assistida de conflitos e fila de evidências
binárias ainda não foram implementadas.

## Fluxo principal implementado

```text
Autenticação
-> Cadastro de empresa
-> Criação e edição de checklist
-> Associação de normas aos itens
-> Publicação de uma versão imutável
-> Criação da inspeção e de seu snapshot histórico
-> Execução do checklist
-> Registro das respostas e não conformidades
-> Tratamento por ações corretivas
-> Upload de evidências fotográficas
-> Conclusão da inspeção
```

Uma edição posterior do checklist cria ou utiliza um novo rascunho e não altera
o conteúdo histórico capturado por inspeções existentes.

## Arquitetura

O projeto usa uma arquitetura em camadas:

```text
-> Tela React
-> TanStack React Query
-> TanStack Start Server Function
-> Service
-> Repository
-> Prisma ORM
-> PostgreSQL
```

As telas não acessam o Prisma diretamente. Regras de negócio ficam em
`src/server/services`, persistência em `src/server/repositories`, validações Zod
em `src/server/schemas` e as Server Functions consumidas pelo frontend em
`src/lib/api`.

### Decisões técnicas relevantes

- Checklists possuem versões `DRAFT`, `PUBLISHED` e `RETIRED`; versões
  publicadas são imutáveis.
- Cada inspeção recebe, na mesma transação de criação, um snapshot relacional da
  versão publicada selecionada.
- Respostas e não conformidades usam os itens históricos do snapshot, não o
  checklist mutável.
- O fluxo offline persiste pacotes por usuário em Dexie/IndexedDB e enfileira
  respostas e conclusão com UUID estável, retry e deduplicação no servidor.
- Conflitos de revisão são bloqueados sem sobrescrita automática por
  `Last Write Wins`.
- Evidências usam uma abstração de armazenamento no servidor; o PostgreSQL
  mantém metadados e o arquivo é armazenado no Cloudinary.

O estudo detalhado da estratégia de versão e snapshot está em
[CHECKLIST_VERSIONING_ARCHITECTURE.md](./CHECKLIST_VERSIONING_ARCHITECTURE.md).

## Tecnologias

| Área           | Tecnologias                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, TanStack Start, TanStack Router, TanStack React Query |
| Interface      | Tailwind CSS 4, Radix UI, Lucide React, Recharts                            |
| Backend        | TanStack Start Server Functions, TypeScript, Zod, bcrypt                    |
| Persistência   | Prisma ORM 7, PostgreSQL, Neon                                              |
| Offline/PWA    | Dexie, IndexedDB, web app manifest e service worker                         |
| Evidências     | Cloudinary                                                                  |
| Build e deploy | Vite, Nitro com preset Vercel                                               |

## Organização do repositório

```text
src/
  components/        Componentes reutilizáveis, layout e UI
  hooks/             Hooks React Query
  lib/api/           Server Functions e query keys
  mocks/             Dados demonstrativos dos módulos ainda não integrados
  offline/           Banco local, fila e orquestração de sincronização
  routes/            Rotas TanStack Router
  server/
    auth/             Sessão autenticada
    errors/           Erros padronizados
    prisma/           Prisma Client singleton
    repositories/     Acesso ao banco
    responses/        Result e paginação
    schemas/          Validações Zod
    services/         Regras de negócio
    storage/          Abstração e provedor de evidências
    types/            Tipos do backend
    utils/            Utilitários
  generated/prisma/  Prisma Client gerado
prisma/               Schema, migrations e seed
AI/                   Arquitetura e referências técnicas de implementação
Documentation/        Requisitos, modelos, guias e artefatos acadêmicos do TCC
e2e/                   Cenário browser/E2E do incremento Offline/PWA
scripts/               Validações direcionadas e scripts utilitários
```

## Como executar

### Pré-requisitos

- Node.js `^22.12.0` (o ambiente local está fixado em 22.23.2 no `.nvmrc`);
- npm;
- banco PostgreSQL acessível;
- conta e credenciais do Cloudinary para testar upload de evidências.

Bun é opcional; o repositório também possui `bun.lock`.

### Instalação

```bash
npm install
```

Crie `.env` a partir de `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full"
SESSION_SECRET="replace-with-a-secure-random-string"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_FOLDER="safe-watch-insight/evidence"
```

- `DATABASE_URL`: conexão PostgreSQL usada pelo Prisma; para Neon, a
  configuração documentada usa `sslmode=verify-full`.
- `SESSION_SECRET`: segredo da sessão; deve ser configurado em produção.
- As credenciais do Cloudinary são usadas somente no servidor.
- `CLOUDINARY_FOLDER` é opcional e possui o valor mostrado como padrão.

Prepare o banco e os dados demonstrativos:

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

Para aplicar migrations em um banco já preparado ou ambiente de produção:

```bash
npx prisma migrate deploy
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

A URL local padrão é `http://localhost:5173`.

### Acesso demonstrativo

```text
E-mail: admin@demo.com
Senha: Admin@123
```

O seed é idempotente e cria o usuário demonstrativo, uma empresa, um checklist
com versão publicada e itens, as 38 Normas Regulamentadoras e uma inspeção
planejada com snapshot próprio.

## Validação e build

```bash
npm test
npm run lint
npm run build
```

Validações direcionadas disponíveis:

```bash
npm run validate:nc-flow
npm run validate:checklist-versioning
npm run validate:offline-sync
npm run test:e2e:offline
```

O cenário Offline/PWA foi validado localmente em Chromium, incluindo
fechamento, reabertura, retry, reconexão e conferência final no Neon. O domínio
HTTPS publicado e outros navegadores/dispositivos ainda precisam de homologação.

## Funcionalidades e limitações

### Implementado

- login, logout, sessão HTTP-only e proteção das rotas autenticadas;
- CRUD de empresas, checklists e itens;
- catálogo de NRs com busca, filtro de vigência e fonte oficial;
- associação normativa aos itens e publicação imutável de versões;
- criação e execução de inspeções baseadas em snapshot histórico;
- respostas, observações, geração automática de não conformidades e conclusão;
- gestão de não conformidades, ações corretivas e status;
- seleção, pré-visualização, upload, listagem e remoção lógica de evidências;
- persistência local do fluxo principal, fila durável e indicadores de
  sincronização;
- manifest e service worker incluídos no build Vercel.

### Em desenvolvimento

- relatórios reais, impressão e exportação PDF;
- dashboard com consultas agregadas reais;
- gestão de equipe integrada ao backend;
- criação integral de inspeções offline;
- reconciliação assistida de conflitos;
- armazenamento e sincronização offline de evidências;
- assinatura com persistência segura e trilha de auditoria;
- interface completa de histórico e retirada de versões de checklist;
- cobertura automatizada ampliada para os módulos restantes.

## Documentação

`Documentation/` é o diretório unificado para a documentação do produto e os
artefatos acadêmicos do TCC:

- [Documento de requisitos](./Documentation/DocumentoDeRequisitos.md)
- [Personas](./Documentation/Personas.md)
- [Diagrama de casos de uso](./Documentation/DiagramaDeCasosDeUso.md)
- [Diagrama de classes](./Documentation/DiagramaDeClasses_VersaoTecnica.md)
- [Modelo conceitual](./Documentation/ModeloConceitualDoBancoDeDados.md)
- [Modelo lógico](./Documentation/ModeloLogico.md)
- [Modelo físico](./Documentation/ModeloFisicoDB.md)
- [Especificação da API](./Documentation/EspecificacaoAPIREST.md)
- [Especificação de telas](./Documentation/ESPECIFICACAO_DE_TELAS.md)
- [Mapa de navegação](./Documentation/MAPA_DE_NAVEGACAO.md)
- [Guia do usuário](./Documentation/GUIA_USUARIO.md)
- [Wireframes históricos](./Documentation/WIREFRAMES.md)

Referências de arquitetura e desenvolvimento:

- [Contexto do projeto](./PROJECT_CONTEXT.md)
- [Decisões técnicas](./TECH_DECISIONS.md)
- [Plano de implementação](./IMPLEMENTATION_PLAN.md)
- [Backlog e estado das tarefas](./TASKS.md)
- [Arquitetura](./AI/Architecture.md)
- [API implementada](./AI/API.md)
- [Regras de negócio](./AI/BusinessRules.md)
- [Banco de dados](./AI/Database.md)
- [Arquitetura Offline/PWA](./AI/Offline.md)

O [Guia do Professor](./GUIA_DO_PROFESSOR.md) preserva o contexto de avaliação
e a rastreabilidade acadêmica da Atividade 2 sem substituir a documentação
permanente acima.

## Créditos

Projeto desenvolvido por [Pedro Vitor](https://github.com/PedroVitor237) como TCC de Análise e
Desenvolvimento de Sistemas.
