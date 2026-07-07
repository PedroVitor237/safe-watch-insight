# Safe Watch Insight

Plataforma web para apoio a inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST).

O projeto é desenvolvido como Trabalho de Conclusão de Curso (TCC) em Análise e Desenvolvimento de Sistemas. A entrega atual corresponde à preparação para a Atividade 2, com foco no fluxo principal online: autenticação, cadastro de empresas, cadastro de checklists, itens de checklist, criação de inspeções, execução do checklist, persistência das respostas e conclusão da inspeção.

## Objetivo Atual

Substituir formulários impressos e planilhas por uma base digital rastreável para inspeções de SST. Nesta etapa, o projeto prioriza o fluxo principal já integrado ao backend, mantendo a arquitetura preparada para futuras evoluções como não conformidades persistidas, evidências, relatórios reais, dashboard com dados reais e funcionamento offline.

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

- Node.js 22 ou superior recomendado.
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
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
SESSION_SECRET="replace-with-a-secure-random-string"
```

- `DATABASE_URL`: conexão PostgreSQL usada pelo Prisma.
- `SESSION_SECRET`: segredo da sessão. Em desenvolvimento há fallback interno, mas em produção essa variável deve ser configurada.

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
- quatro itens de checklist;
- uma inspeção planejada.

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
- CRUD de itens de checklist integrado ao backend.
- Criação de inspeções vinculadas a empresa, checklist e usuário autenticado.
- Listagem e detalhamento de inspeções reais.
- Execução de checklist por item.
- Persistência de respostas da inspeção.
- Alteração automática da inspeção para `IN_PROGRESS` ao salvar resposta.
- Finalização de inspeção com status `COMPLETED`.
- Seed demonstrativo para apresentação do fluxo.
- Dashboard, não conformidades, relatórios, normas, equipe e simulação offline ainda possuem partes mockadas.

## Fluxo Principal

```text
Login
-> Cadastro/edição de empresa
-> Cadastro/edição de checklist
-> Cadastro/edição de itens do checklist
-> Criação de inspeção
-> Execução do checklist
-> Persistência das respostas
-> Conclusão da inspeção
```

## Limitações Atuais

- Não conformidades ainda não são persistidas no banco quando uma resposta é marcada como não conforme.
- Ações corretivas ainda não possuem backend integrado.
- Evidências e upload Cloudinary ainda não foram implementados.
- Relatórios ainda usam fluxo mockado/simulado.
- Dashboard ainda usa indicadores mockados.
- Normas e equipe ainda não estão integradas ao backend.
- Funcionamento offline real com IndexedDB/Dexie ainda não foi implementado.
- Assinatura no encerramento da inspeção é usada na tela, mas não é persistida.
- Não há suíte automatizada de testes.

## Roadmap

- Persistir não conformidades e ações corretivas.
- Integrar normas aos itens de checklist.
- Implementar evidências e upload de imagens.
- Gerar relatórios reais a partir das inspeções.
- Integrar dashboard a consultas reais.
- Preparar camada offline com IndexedDB/Dexie.
- Adicionar testes automatizados para o fluxo principal.
- Avaliar futuramente alternativas de arquitetura, sem migração prometida para esta entrega.

## Documentação

- `AI/API.md`: documentação das Server Functions implementadas.
- `GUIA_DO_PROFESSOR.md`: guia em português para avaliação da Atividade 2.
- `AI/Architecture.md`: arquitetura em camadas.
- `AI/BusinessRules.md`: regras de negócio.
- `AI/Database.md`: padrões de banco de dados.
- `Documentation/`: documentos acadêmicos.
- `DocumentaçãoAtividade/`: especificações, mapa de navegação, guia do usuário e wireframes.

## Créditos

Projeto acadêmico desenvolvido por Pedro Vitor e Felipe Ferreira para o TCC de Análise e Desenvolvimento de Sistemas.
