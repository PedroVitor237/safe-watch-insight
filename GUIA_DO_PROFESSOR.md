# Guia do Professor — contexto acadêmico da Atividade 2

# 1. Apresentação

O **Safe Watch Insight** é uma plataforma web para apoiar inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST).

O projeto faz parte do Trabalho de Conclusão de Curso (TCC) de Análise e
Desenvolvimento de Sistemas. Este guia preserva o contexto de avaliação da
**Atividade 2**, cujo foco foi consolidar o fluxo principal e organizar a
documentação técnica e acadêmica. O desenvolvimento continuou após esse marco;
o estado atual está resumido no `README.md` e em `PROJECT_CONTEXT.md`.

O fluxo que estruturou o marco acadêmico foi:

```text
Login
-> Cadastro de empresa
-> Cadastro de checklist
-> Cadastro de itens do checklist
-> Criação de inspeção
-> Execução da inspeção
-> Registro das respostas
-> Conclusão da inspeção
```

# 2. Como executar o projeto

As instruções abaixo assumem que o projeto foi recebido como um arquivo ZIP contendo a raiz do repositório.

## Pré-requisitos

- Node.js 22 ou superior recomendado.
- npm instalado.
- Banco PostgreSQL disponível. A documentação do projeto considera o uso do Neon.
- Editor de código, preferencialmente VS Code.

O projeto também possui `bun.lock`, mas os comandos com npm são suficientes para execução da entrega.

## Passo a passo

1. Extraia o ZIP.

2. Acesse a pasta raiz do projeto pelo terminal.

```bash
cd safe-watch-insight
```

3. Instale as dependências.

```bash
npm install
```

4. Crie o arquivo `.env` com base em `.env.example`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full"
SESSION_SECRET="replace-with-a-secure-random-string"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_FOLDER="safe-watch-insight/evidence"
```

5. Configure o banco PostgreSQL.

Use uma conexão PostgreSQL válida em `DATABASE_URL`. Para Neon, copie a
connection string do painel do projeto e mantenha `sslmode=verify-full` para
validar explicitamente o certificado TLS.

6. Valide o schema Prisma.

```bash
npm run prisma:validate
```

7. Gere o Prisma Client.

```bash
npm run prisma:generate
```

8. Execute as migrations.

Para ambiente local de desenvolvimento:

```bash
npm run prisma:migrate
```

Para aplicar migrations em um banco já preparado:

```bash
npx prisma migrate deploy
```

9. Execute o seed.

```bash
npm run db:seed
```

O seed cria dados de demonstração para apresentação do fluxo principal.

10. Inicie o servidor de desenvolvimento.

```bash
npm run dev
```

11. Acesse a aplicação.

```text
http://localhost:5173
```

## Credenciais de demonstração

```text
Email: admin@demo.com
Senha: Admin@123
```

## Build de produção local

```bash
npm run build
npm run preview
```

# 3. Estrutura do projeto

Organização principal do repositório:

- `src/routes`: telas e rotas da aplicação usando TanStack Router.
- `src/components`: componentes visuais reutilizáveis.
- `src/components/ui`: componentes de interface baseados em Radix UI/shadcn-style.
- `src/components/layout`: estrutura autenticada da aplicação.
- `src/hooks`: hooks React Query usados para comunicação com o backend.
- `src/lib/api`: Server Functions do TanStack Start e query keys.
- `src/server/auth`: controle de sessão autenticada.
- `src/server/services`: regras de negócio.
- `src/server/repositories`: acesso ao banco via Prisma.
- `src/server/schemas`: validações Zod.
- `src/server/errors`: erros padronizados.
- `src/server/responses`: formato de resposta e paginação.
- `src/server/prisma`: configuração do Prisma Client.
- `src/generated/prisma`: Prisma Client gerado.
- `prisma`: schema, migrations e seed.
- `src/mocks`: dados mockados ainda usados por módulos não finalizados.
- `AI`: documentação técnica e instruções de arquitetura para desenvolvimento assistido por IA.
- `Documentation`: requisitos, modelos, especificações, guias, wireframes e
  demais artefatos acadêmicos do TCC.
- `scripts`: scripts utilitários.

# 4. Documentação do projeto e histórico acadêmico

Principais documentos disponíveis:

- `README.md`: visão geral, instalação, comandos e estado atual.
- `GUIA_DO_PROFESSOR.md`: este guia de execução e avaliação.
- `AI/API.md`: documentação das Server Functions implementadas.
- `AI/Architecture.md`: arquitetura adotada.
- `AI/BusinessRules.md`: regras de negócio.
- `AI/Database.md`: padrões de banco de dados.
- `AI/Entities.md`: entidades do domínio.
- `AI/Offline.md`: arquitetura e estado atual do primeiro incremento offline.
- `AI_PROJECT_CONTEXT.md`: snapshot histórico de 25 de julho de 2026.
- `IMPLEMENTATION_PLAN.md`: plano de implementação.
- `TASKS.md`: backlog e status das tarefas.
- `TECH_DECISIONS.md`: decisões técnicas.
- `Documentation/DocumentoDeRequisitos.md`: documento de requisitos.
- `Documentation/DiagramaDeCasosDeUso.md`: casos de uso.
- `Documentation/DiagramaDeClasses_VersaoTecnica.md`: diagrama de classes.
- `Documentation/ModeloConceitualDoBancoDeDados.md`: modelo conceitual.
- `Documentation/ModeloLogico.md`: modelo lógico.
- `Documentation/ModeloFisicoDB.md`: modelo físico.
- `Documentation/EspecificacaoAPIREST.md`: documento acadêmico de API atualizado para o contexto da entrega.
- `Documentation/ESPECIFICACAO_DE_TELAS.md`: especificação atual das telas.
- `Documentation/MAPA_DE_NAVEGACAO.md`: mapa de navegação atual.
- `Documentation/WIREFRAMES.md`: wireframes históricos do protótipo.
- `Documentation/GUIA_USUARIO.md`: guia de uso atual.

Alguns diagramas estão em Mermaid ou PlantUML. Eles podem ser visualizados com:

- extensões do VS Code para Mermaid ou PlantUML;
- Mermaid Live Editor;
- visualizadores compatíveis com PlantUML.

Alguns diagramas ficam em arquivos dedicados, enquanto outros estão embutidos em documentos Markdown.

# 5. Arquitetura

A arquitetura atual é organizada em camadas:

```text
React
-> React Query
-> TanStack Start Server Functions
-> Services
-> Repositories
-> Prisma
-> PostgreSQL
```

Responsabilidades:

- **React:** renderiza telas e captura ações do usuário.
- **React Query:** gerencia cache, loading, refetch e invalidação de dados.
- **Server Functions:** recebem chamadas do frontend, validam entrada e chamam Services.
- **Services:** concentram regras de negócio.
- **Repositories:** executam operações de persistência.
- **Prisma:** faz o mapeamento objeto-relacional.
- **PostgreSQL:** armazena os dados da aplicação.

Essa separação evita acesso direto ao banco pelas telas e facilita manutenção futura.

# 6. Decisões técnicas

As decisões mais importantes para esta entrega são:

- TanStack Start foi mantido porque o frontend já estava construído sobre essa base.
- Uma possível migração futura para Next.js pode ser avaliada depois, mas não faz parte desta entrega.
- PostgreSQL foi adotado como banco relacional.
- Prisma ORM 7 é usado para schema, migrations e acesso ao banco.
- A arquitetura em camadas foi mantida para reduzir acoplamento.
- React Query é usado para dados vindos do backend.
- Zod é usado para validação das entradas.
- A autenticação usa sessões HTTP-only em vez de JWT nesta etapa.
- Senhas são armazenadas com bcrypt.
- O deploy planejado segue Vercel para a aplicação e Neon para o banco.
- O plugin Nitro com preset Vercel permanece configurado no projeto.

# 7. Estado atual do projeto

Além do fluxo consolidado no marco da Atividade 2, o projeto atualmente possui:

- autenticação real, sessão e proteção de rotas;
- CRUD de empresas, checklists e itens;
- versões publicadas e snapshots históricos por inspeção;
- catálogo e associação reais de Normas Regulamentadoras;
- inspeções, respostas e conclusão persistidas;
- não conformidades e ações corretivas integradas;
- evidências fotográficas com Cloudinary;
- primeiro incremento Offline/PWA do fluxo principal validado em Chromium;
- testes automatizados concentrados em versionamento, regras do fluxo,
  evidências e sincronização offline.

Permanecem em desenvolvimento:

- relatórios reais e exportação PDF;
- dashboard com dados reais;
- tela de equipe integrada ao backend;
- criação integral de inspeções offline;
- reconciliação assistida e evidências binárias offline;
- assinatura com persistência e trilha de auditoria;
- ampliação da cobertura automatizada.

# 8. Observações importantes

Este é um projeto de TCC em evolução. Documentos permanentes descrevem o estado
atual; planos, backlogs, wireframes e este guia preservam também a história das
entregas acadêmicas. Em caso de dúvida sobre implementação vigente, consulte
`README.md`, `PROJECT_CONTEXT.md`, `TASKS.md` e `TECH_DECISIONS.md`.
