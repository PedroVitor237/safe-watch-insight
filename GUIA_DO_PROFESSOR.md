# Guia do Professor - Atividade 2

# 1. Apresentação

O **Safe Watch Insight** é uma plataforma web para apoiar inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST).

O projeto faz parte do Trabalho de Conclusão de Curso (TCC) de Análise e Desenvolvimento de Sistemas. Esta entrega corresponde à **Atividade 2**, com foco na consolidação do fluxo principal da aplicação e na organização da documentação técnica e acadêmica.

O sistema continua em desenvolvimento após esta entrega. A versão atual prioriza o fluxo online principal:

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
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
SESSION_SECRET="replace-with-a-secure-random-string"
```

5. Configure o banco PostgreSQL.

Use uma conexão PostgreSQL válida em `DATABASE_URL`. Para Neon, copie a connection string do painel do projeto e mantenha `sslmode=require`.

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
- `Documentation`: documentação acadêmica do TCC.
- `DocumentaçãoAtividade`: documentação visual e funcional da atividade.
- `scripts`: scripts utilitários.

# 4. Documentação da atividade

Principais documentos disponíveis:

- `README.md`: visão geral, instalação, comandos e estado atual.
- `GUIA_DO_PROFESSOR.md`: este guia de execução e avaliação.
- `AI/API.md`: documentação das Server Functions implementadas.
- `AI/Architecture.md`: arquitetura adotada.
- `AI/BusinessRules.md`: regras de negócio.
- `AI/Database.md`: padrões de banco de dados.
- `AI/Entities.md`: entidades do domínio.
- `AI/Offline.md`: planejamento da arquitetura offline.
- `AI_PROJECT_CONTEXT.md`: contexto consolidado do estado atual.
- `IMPLEMENTATION_PLAN.md`: plano de implementação.
- `TASKS.md`: backlog e status das tarefas.
- `TECH_DECISIONS.md`: decisões técnicas.
- `Documentation/DocumentoDeRequisitos.md`: documento de requisitos.
- `Documentation/DiagramaDeCasosDeUso.md`: casos de uso.
- `Documentation/DiagramaDeClasses_VersaoTecnica.md`: diagrama de classes.
- `Documentation/ModeloConceitualDoBancoDeDados.md`: modelo conceitual.
- `Documentation/ModeloLogico.md`: modelo lógico.
- `Documentation/ModeloFisicoDB.md`: modelo físico.
- `Documentation/EspecificacaoAPIREST`: documento acadêmico de API atualizado para o contexto da entrega.
- `DocumentaçãoAtividade/ESPECIFICACAO_DE_TELAS.md`: especificação das telas.
- `DocumentaçãoAtividade/MAPA_DE_NAVEGACAO.md`: mapa de navegação.
- `DocumentaçãoAtividade/WIREFRAMES.md`: wireframes.
- `DocumentaçãoAtividade/GUIA_USUARIO.md`: guia de uso.

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

Implementado e funcional na entrega atual:

- Login real com sessão.
- Proteção de rotas autenticadas.
- Logout.
- CRUD de empresas.
- CRUD de checklists.
- CRUD de itens de checklist.
- Criação de inspeções.
- Listagem e detalhamento de inspeções.
- Execução de checklist.
- Salvamento das respostas.
- Conclusão da inspeção.
- Seed demonstrativo com usuário, empresa, checklist, itens e inspeção planejada.

Ainda em desenvolvimento:

- Persistência de não conformidades.
- Ações corretivas.
- Upload de evidências.
- Relatórios reais.
- Dashboard com dados reais.
- Consulta real de normas.
- Tela de equipe integrada ao backend.
- Sincronização offline com IndexedDB/Dexie.
- Persistência da assinatura da inspeção.
- Testes automatizados.

# 8. Observações importantes

Este é um projeto de TCC em desenvolvimento ativo. A documentação está sendo revisada continuamente para acompanhar a implementação.

Alguns documentos podem ainda conter pequenas inconsistências herdadas de iterações anteriores, especialmente quando descrevem funcionalidades planejadas para fases futuras. Essas inconsistências estão sendo corrigidas conforme o desenvolvimento avança.

Caso o professor identifique qualquer divergência entre documentação, código ou fluxo demonstrado, a equipe agradece se puder ser informada para que a documentação seja melhorada nas próximas revisões.
