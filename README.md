# Safe Watch Insight

Plataforma web para apoio a inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST).

O projeto é desenvolvido como Trabalho de Conclusão de Curso (TCC) em Análise e Desenvolvimento de Sistemas. A entrega atual corresponde à preparação para a Atividade 2, com foco no fluxo principal online: autenticação, cadastro de empresas, cadastro de checklists, itens de checklist, criação de inspeções, execução do checklist, persistência das respostas e conclusão da inspeção.

## Objetivo Atual

Substituir formulários impressos e planilhas por uma base digital rastreável para inspeções de SST. Nesta etapa, o projeto integra o fluxo principal, normas, não conformidades, ações corretivas e evidências fotográficas ao backend e implementa a primeira fundação Offline/PWA real para execução de inspeções já disponibilizadas no dispositivo.

## Tecnologias

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack React Query
- Tailwind CSS 4
- Radix UI
- Lucide React
- Recharts
- TanStack Start Server Functions
- Prisma ORM 7
- PostgreSQL
- Neon
- Dexie/IndexedDB
- Zod
- bcrypt
- TanStack Start sessions
- Vite
- Nitro com preset Vercel

## Arquitetura

O projeto usa arquitetura em camadas:

```text
Tela
-> React Query
-> TanStack Start Server Functions
-> Services
-> Repositories
-> Prisma
-> PostgreSQL
```

As telas nunca acessam Prisma diretamente. Regras de negócio ficam em `src/server/services`, persistência fica em `src/server/repositories`, validações ficam em `src/server/schemas`, e as Server Functions ficam em `src/lib/api`.

## Organização

```text
src/
  components/        Componentes reutilizáveis, layout e UI
  hooks/             Hooks React Query dos módulos integrados
  offline/           Banco local, fila durável e orquestração de sincronização
  lib/
    api/             Server Functions e query keys
    mockStore.ts     Store local ainda usada por módulos mockados
  mocks/             Dados mockados remanescentes
  routes/            Rotas TanStack Router
  server/
    auth/            Sessão autenticada
    errors/          Erros padronizados
    prisma/          Prisma Client singleton
    repositories/    Acesso ao banco
    responses/       Result e paginação
    schemas/         Validações Zod
    services/        Regras de negócio
    types/           Tipos compartilhados do backend
    utils/           Utilitários
  generated/prisma/  Prisma Client gerado
prisma/              Schema, migrations e seed
AI/                  Documentação técnica para arquitetura e IA
Documentation/       Documentação acadêmica
DocumentaçãoAtividade/ Documentos da atividade/protótipo
scripts/             Scripts utilitários
```

## Pré-requisitos

- Node.js 22.12 ou superior. O build ainda executa em Node 20.19.2, mas essa
  versão está abaixo do `engines` declarado pelos pacotes TanStack instalados.
- npm disponível.
- Bun é opcional; o repositório também possui `bun.lock`.
- Um banco PostgreSQL. Para a entrega, a documentação considera Neon.

## Instalação

```bash
npm install
```

Alternativa:

```bash
bun install
```

## Variáveis de Ambiente

Crie um arquivo `.env` a partir de `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full"
SESSION_SECRET="replace-with-a-secure-random-string"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_FOLDER="safe-watch-insight/evidence"
```

- `DATABASE_URL`: conexão PostgreSQL usada pelo Prisma; para Neon, use validação
  TLS explícita com `sslmode=verify-full`.
- `SESSION_SECRET`: segredo da sessão. Em desenvolvimento há fallback interno, mas em produção essa variável deve ser configurada.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET`: credenciais usadas somente no servidor para requisições assinadas de evidências.
- `CLOUDINARY_FOLDER`: pasta opcional do provedor; o padrão é `safe-watch-insight/evidence`.

## Banco de Dados e Prisma

Validar schema:

```bash
npm run prisma:validate
```

Gerar Prisma Client:

```bash
npm run prisma:generate
```

Executar migration em desenvolvimento:

```bash
npm run prisma:migrate
```

Aplicar migrations em ambiente de produção ou banco já preparado:

```bash
npx prisma migrate deploy
```

Abrir Prisma Studio:

```bash
npm run prisma:studio
```

## Seed

Executar seed:

```bash
npm run db:seed
```

O seed é idempotente e cria:

- usuário administrador de demonstração;
- uma empresa;
- um checklist demonstrativo;
- uma versão publicada demonstrativa com quatro itens;
- 38 Normas Regulamentadoras, mantendo as revogadas como inativas;
- associações normativas copiadas na versão;
- uma inspeção planejada com snapshot histórico próprio.

Credenciais de demonstração:

```text
Email: admin@demo.com
Senha: Admin@123
```

## Desenvolvimento

Iniciar servidor local:

```bash
npm run dev
```

URL padrão:

```text
http://localhost:5173
```

## Build

Gerar build de produção:

```bash
npm run build
```

O script executa `prisma generate` antes do `vite build`.

Build em modo development:

```bash
npm run build:dev
```

Visualizar build local:

```bash
npm run preview
```

## Scripts

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm test
npm run validate:nc-flow
npm run validate:checklist-versioning
npm run validate:offline-sync
npm run format
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate
npm run prisma:studio
npm run db:seed
```

## Funcionalidades Implementadas

- Login real com e-mail e senha.
- Sessão HTTP-only com TanStack Start sessions.
- Proteção das rotas autenticadas.
- Logout.
- CRUD de empresas integrado ao backend.
- CRUD de checklists integrado ao backend.
- Versões numeradas com ciclo `DRAFT`, `PUBLISHED` e `RETIRED`.
- Publicação imutável com autoria, data, hash SHA-256 e proteção contra edição concorrente.
- CRUD de itens e associações normativas no draft, criando nova versão sem alterar publicações anteriores.
- Catálogo de NRs com busca, filtro de vigência e fonte oficial.
- Associação de uma ou mais normas aos itens de checklist.
- Criação de inspeções vinculadas a empresa, checklist, versão publicada e usuário autenticado.
- Snapshot relacional e imutável de título, descrição, itens e normas criado atomicamente com a inspeção.
- Listagem e detalhamento de inspeções reais.
- Execução e persistência de respostas por item do snapshot histórico.
- Criação e arquivamento automático de não conformidades conforme a resposta.
- CRUD, filtros, Kanban, detalhe e alteração de status de não conformidades.
- CRUD e conclusão de ações corretivas.
- Bloqueio da conclusão enquanto itens obrigatórios estiverem sem resposta.
- Alteração automática da inspeção para `IN_PROGRESS` ao salvar resposta.
- Finalização de inspeção com status `COMPLETED`.
- Pacote histórico de inspeção persistido por usuário em IndexedDB/Dexie.
- Respostas, observações, estado local de NC e conclusão gravados localmente antes do envio.
- Fila FIFO durável com UUID de operação, retry, recuperação após reinício e deduplicação no servidor.
- Detecção de conflito por revisão, sem sobrescrita automática `Last Write Wins`.
- Indicadores reais de conectividade, pendência, sincronização, erro e conflito.
- Manifest PWA, service worker e cache versionado de navegação/ativos no build Vercel.
- Seed demonstrativo para apresentação do fluxo.
- Dashboard, relatórios e equipe permanecem como prévias claramente identificadas com dados
  demonstrativos.
- Assinatura permanece indisponível até possuir persistência e trilha de auditoria seguras.

## Fluxo Principal

```text
Login
-> Cadastro/edição de empresa
-> Cadastro/edição de checklist
-> Cadastro/edição de itens do checklist
-> Associação de normas aos itens
-> Publicação da versão
-> Criação de inspeção e snapshot
-> Execução do checklist
-> Persistência das respostas
-> Criação automática e tratamento de não conformidades
-> Upload e gestão de evidências fotográficas no contexto histórico
-> Conclusão da inspeção
-> Evolução do checklist em um novo draft/versão sem alterar a inspeção anterior
```

## Limitações Atuais

- Upload de evidências exige credenciais Cloudinary configuradas no ambiente; compressão e fila offline permanecem futuras.
- Relatórios ainda usam uma prévia demonstrativa; impressão e exportação PDF estão desabilitadas.
- Dashboard ainda usa indicadores mockados, identificados explicitamente na tela.
- Equipe ainda não está integrada ao backend.
- O cenário Offline/PWA principal foi validado no Chromium local com fechamento,
  reabertura, reconexão e conferência final no Neon; o domínio Vercel publicado e
  outros navegadores/dispositivos ainda exigem homologação.
- Somente inspeções previamente abertas/listadas online ficam disponíveis localmente; criação
  integral de inspeção offline ainda não foi implementada.
- Evidências binárias não entram na fila offline; o upload continua exigindo conexão.
- Conflitos são detectados e bloqueados, mas a interface de reconciliação assistida ainda é futura.
- A assinatura digital ainda não está disponível nem é persistida.
- A tela expõe publicação e seleção de versões; uma interface completa de histórico e retirada de versões permanece futura.
- Inspeções migradas do modelo anterior são identificadas como backfill legado não verificável.
- A cobertura automatizada ainda está concentrada nas regras deste sprint e precisa ser expandida para os demais módulos.

## Roadmap

- Homologar o marco Offline/PWA no domínio Vercel e em outros navegadores/dispositivos.
- Implementar fila offline de evidências com `Blob`, quota, compressão e retry.
- Gerar relatórios reais a partir das inspeções.
- Integrar dashboard a consultas reais somente após o marco offline.
- Expandir os testes automatizados para os demais fluxos.
- Avaliar futuramente alternativas de arquitetura, sem migração prometida para esta entrega.

## Documentação

- `AI/API.md`: documentação das Server Functions implementadas.
- `GUIA_DO_PROFESSOR.md`: guia em português para avaliação da Atividade 2.
- `AI/Architecture.md`: arquitetura em camadas.
- `AI/BusinessRules.md`: regras de negócio.
- `AI/Database.md`: padrões de banco de dados.
- `CHECKLIST_VERSIONING_ARCHITECTURE.md`: estudo e registro da decisão híbrida de versão + snapshot.
- `Documentation/`: documentos acadêmicos.
- `DocumentaçãoAtividade/`: especificações, mapa de navegação, guia do usuário e wireframes.

## Créditos

Projeto acadêmico desenvolvido por Pedro Vitor e Felipe Ferreira para o TCC de Análise e Desenvolvimento de Sistemas.
