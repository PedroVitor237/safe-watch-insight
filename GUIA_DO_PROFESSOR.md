# Guia do Professor — demonstração atual e histórico acadêmico

# 1. Apresentação

O **Safe Watch Insight** é uma plataforma web para apoiar inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST).

O projeto faz parte do Trabalho de Conclusão de Curso (TCC) de Análise e
Desenvolvimento de Sistemas. Este guia preserva o contexto de avaliação da
**Atividade 2**, cujo foco foi consolidar o fluxo principal e organizar a
documentação técnica e acadêmica. O desenvolvimento continuou após esse marco;
o estado atual está resumido no `README.md` e em `PROJECT_CONTEXT.md`.

O marco original da Atividade 2 é referência histórica. O roteiro de
avaliação atual, reconciliado na Fase 8 em 4 de outubro de 2026, é:

```text
Login
-> Cadastro de empresa
-> Cadastro de checklist
-> Cadastro de itens e associação de normas
-> Publicação de versão (ou uso de publicação acessível)
-> Criação de inspeção
-> Execução da inspeção
-> Registro das respostas
-> Conclusão local e confirmação de sincronização
-> Relatório e impressão pelo navegador
-> Dashboard com indicadores próprios
```

# 2. Como executar o projeto

As instruções abaixo assumem que o projeto foi recebido como um arquivo ZIP contendo a raiz do repositório.

## Pré-requisitos

- Node.js `^22.12.0`, conforme `package.json`; `.nvmrc` fixa 22.23.2. Não significa qualquer versão superior.
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

O Demo Seed cria uma única conta fictícia e dados relacionais sintéticos para
apresentar o fluxo principal, relatórios e dashboard. A execução é manual e
pode ser repetida sem restaurar inspeções ou sobrescrever respostas existentes.

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
Nome: Usuário Demonstração
Email: demo.user@example.test
Senha: Demo@12345
Perfil: TECHNICIAN
```

Após o TCC, se houver uso com dados operacionais reais, o Demo Seed deverá ser
executado somente em banco/ambiente de demonstração dedicado, separado do banco
operacional. As evidências fotográficas são demonstradas com upload real ao vivo.

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

- cadastro público sem login automático, autenticação real, sessão e proteção de rotas;
- templates oficiais consultáveis e cópia pessoal independente com rascunho v1;
- CRUD de empresas, checklists e itens;
- versões publicadas e snapshots históricos por inspeção;
- catálogo e associação reais de Normas Regulamentadoras;
- inspeções, respostas e conclusão persistidas;
- não conformidades e ações corretivas integradas;
- evidências fotográficas online em Cloudinary, com metadados/XOR/autorização no backend;
- relatórios reais sob demanda (snapshot + cadastros/tratativas atuais), sem inserir Report ao visualizar;
- impressão HTML/Salvar como PDF por window.print() e diálogo nativo, sem arquivo PDF backend;
- dashboard agregado por usuário, conformidade de respostas aplicáveis em COMPLETED e cinco recentes;
- primeiro incremento Offline/PWA do fluxo principal validado em Chromium;
- testes automatizados concentrados em versionamento, regras do fluxo,
  evidências e sincronização offline.

Permanecem em desenvolvimento:

- geração customizada, armazenamento e download direto de PDF;
- BI, filtros analíticos e comparativos avançados de dashboard;
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

# 9. Roteiro de demonstração atual

Este roteiro é uma orientação de avaliação. Preparação de ambiente acima e
passos de demonstração abaixo **não foram executados nesta fase documental**.
Use ambiente preparado e aguarde as notificações/indicadores de cada operação.

## Fluxo principal

1. **Login:** entre com conta própria ou com as credenciais expostas no bloco
   de demonstração, quando o ambiente estiver preparado. O usuário é técnico,
   sem acesso administrativo global; login abre o Dashboard.
2. **Empresa:** em Empresas, cadastre uma empresa própria com razão social,
   CNAE, grau de risco e funcionários. CNPJ é opcional e, quando informado,
   único inclusive entre empresas arquivadas.
3. **Checklist:** crie um modelo pessoal, adicione verificações obrigatórias e
   opcionais, associe NRs se necessário e confirme **Publicar vN**. Mostre a
   distinção entre rascunho editável e publicação preservada.
4. **Inspeção:** em **Nova inspeção**, selecione empresa e versão publicada,
   observações opcionais e data/hora (vazia usa Agora). Crie e abra na lista.
   Explique que a inspeção preserva o conteúdo de checklist capturado.
5. **Respostas:** marque Conforme, NC e N/A em itens distintos quando o modelo
   permitir. Inclua observação e saia do campo para salvá-la. O andamento inicia
   com a resposta. Aguarde sincronização para demonstrar a NC no módulo próprio.
6. **Tratativa:** no detalhe da NC, ajuste descrição/severidade/prazo e crie
   ação em **Nova ação**. Só **O quê?** é obrigatório; os demais campos 5W2H
   são opcionais. Conclua a ação por Editar/Status/Concluída; mostre que resolver
   a NC exige alteração explícita de seu status.
7. **Conclusão:** responda obrigatórios (N/A é válido); opcionais podem ficar
   pendentes. Em **Encerrar**, conclua. Fotos, ações concluídas e NCs resolvidas
   não são condições de encerramento. Aguarde confirmação da fila.
8. **Relatório:** abra **Ver relatório** na inspeção concluída ou selecione-a
   em Relatórios. Mostre resumo, itens/normas, empresa/inspetor, NCs, ações e
   evidências. **Imprimir → Salvar como PDF** usa o diálogo do navegador;
   a aplicação não gera nem baixa um arquivo PDF diretamente.
9. **Dashboard:** mostre contagens, gráfico por status, atenção e até cinco
   recentes. Conformidade usa Conforme/(Conforme + NC) em concluídas, excluindo
   N/A e pendentes; sem aplicáveis aparece **—**. Os dados são próprios,
   não indicadores gerenciais globais ou BI.

Respostas/conclusão são salvas no dispositivo antes do envio, inclusive online.
A inspeção concluída bloqueia novas respostas, mas NCs/ações/evidências seguem
tratáveis. Cadastro atual de empresa/inspetor e tratativas não são congelados
com o checklist; podem alterar o relatório consultado posteriormente.

## Demonstrações complementares

- **Cadastro:** abra Criar conta no login, preencha nome/e-mail/senha/confirmação,
  demonstre validação e navegação ao login sem autenticação automática. Não há
  escolha de papel, confirmação de e-mail ou recuperação de senha.
- **Template e cópia:** na Biblioteca, abra Templates oficiais e consulte fonte
  e escopo. **Usar template** abre uma cópia pessoal v1, editável/publicável;
  o original permanece preservado. **Copiar checklist** no detalhe próprio ou
  publicado acessível também cria nova identidade e itens independentes, sem
  copiar inspeções. Construção adapta Murbach; altura é curadoria da plataforma.
- **Evidência:** com upload configurado e conexão, envie JPEG/PNG/WebP até 4 MB
  na inspeção ou NC, confira prévia/legenda/lista, abra a imagem e demonstre
  remoção confirmada. Não há evidência diretamente associada à ação corretiva.
- **Offline:** ainda online, abra/liste a inspeção que será demonstrada e confira
  o armazenamento em Configurações. Sem conexão, responda e, se cabível, conclua.
  Reconecte com sessão válida, acompanhe pendências e use Sincronizar agora
  para retry de erros quando necessário. Conflitos bloqueiam e não possuem
  resolução assistida. Sincronize antes de sair/trocar conta, pois dados locais
  e alterações pendentes são limpos nesses caminhos.

## Limites para avaliação

Equipe e seleção de perfil em Configurações são demonstrativos. Não demonstrar
como entregues: RBAC/administração, solicitante (RF12/RN07), assinatura,
criação integral de inspeção offline, binários de evidências offline, BI ou
múltiplos modelos editáveis de relatório (RF14 parcial). RF20/RNF03 são parciais.

Relatório/dashboard consultam remoto e podem não refletir pendências locais.
Consulta por identificador direto permite relatório de inspeção própria aberta,
embora o seletor liste só concluídas; há concerns de cache entre identidades,
concorrência offline, projeção durante sync e coerção de prazo vazio. São
pendências para Final QA, sem correção nesta fase. A homologação histórica do
fluxo offline é concentrada no Chromium local; o fluxo autenticado completo em
produção/outros navegadores ainda requer avaliação.

[Telas](./Documentation/ESPECIFICACAO_DE_TELAS.md),
[Guia do usuário](./Documentation/GUIA_USUARIO.md),
[Templates oficiais](./AI/OfficialTemplates.md), [Offline](./AI/Offline.md) e
[Relatório da Fase 6](./Documentation/RelatorioFase6.md) detalham esses limites.
