# 🛡️ SST Inspeções

Plataforma web para apoio a inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST). O sistema permite planejar inspeções, executar checklists, registrar não conformidades, acompanhar planos de ação e visualizar relatórios consolidados.

# 📌 Sobre o Projeto

O SST Inspeções é um protótipo funcional de frontend voltado ao contexto de Segurança e Saúde no Trabalho. A aplicação organiza o fluxo de fiscalização desde o acesso do usuário até a emissão de relatório, passando por cadastro de empresas, biblioteca de checklists, execução de inspeções e tratamento de não conformidades.

Atualmente, o projeto utiliza dados mockados em `src/mocks/data.ts` e persistência local no navegador por meio de `localStorage`, implementada em `src/lib/mockStore.ts`. Não há backend externo, banco de dados ou autenticação real configurados no código atual.

Principais funcionalidades disponíveis:

- Login simulado com seleção de perfil: Inspetor, Gestor ou Auditor.
- Dashboard com indicadores, gráficos e listas operacionais.
- Consulta e filtro de inspeções.
- Assistente em três etapas para criação de nova inspeção.
- Execução de checklist com respostas por item.
- Geração automática de não conformidades ao marcar itens como NC.
- Gestão de não conformidades em visão Kanban e Lista.
- Plano de ação 5W2H para tratamento de NCs.
- Timeline de eventos em inspeções e não conformidades.
- Simulação de modo offline e sincronização pendente.
- Relatórios de inspeções concluídas com impressão e exportação PDF simulada.
- Telas de consulta para empresas, normas regulamentadoras e equipe.

# 🧰 Tecnologias Utilizadas

Tecnologias identificadas a partir de `package.json`, `vite.config.ts`, `components.json` e arquivos de configuração:

- **Framework frontend:** React `^19.2.0`
- **Linguagem:** TypeScript `^5.8.3`
- **Roteamento e aplicação:** TanStack Router `^1.168.25` e TanStack Start `^1.167.50`
- **Data fetching/cache:** TanStack React Query `^5.83.0`
- **Build/dev server:** Vite `^7.3.1`
- **Configuração Vite/TanStack:** `@lovable.dev/vite-tanstack-config`
- **Estilização:** Tailwind CSS `^4.2.1`
- **Componentes de UI:** Radix UI, componentes locais em `src/components/ui` e configuração shadcn-style em `components.json`
- **Ícones:** Lucide React `^0.575.0`
- **Gráficos:** Recharts `^2.15.4`
- **Formulários e validação:** React Hook Form, `@hookform/resolvers` e Zod
- **Notificações:** Sonner
- **Utilitários de estilo:** `class-variance-authority`, `clsx` e `tailwind-merge`
- **Lint:** ESLint `^9.32.0` com TypeScript ESLint, React Hooks e React Refresh
- **Formatação:** Prettier `^3.7.3`
- **Gerenciador de pacotes indicado pelo lockfile:** Bun (`bun.lock` e `bunfig.toml`)

# 📁 Estrutura do Projeto

Árvore simplificada:

```text
.
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   └── api/
│   ├── mocks/
│   ├── routes/
│   ├── types/
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
├── components.json
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vite.config.ts
├── bun.lock
└── bunfig.toml
```

Finalidade das principais pastas e arquivos:

- `src/components/common`: componentes compartilhados da aplicação, como cabeçalho de página e badges de status.
- `src/components/layout`: layout principal autenticado, incluindo menu lateral e barra superior.
- `src/components/ui`: componentes de interface reutilizáveis baseados em Radix UI/shadcn-style.
- `src/hooks`: hooks utilitários, como detecção de dispositivo móvel.
- `src/lib`: funções utilitárias, formatação, configuração server-only, tratamento de erros e store mockada.
- `src/lib/api`: espaço para funções de API; atualmente contém um exemplo.
- `src/mocks`: dados mockados usados pelas telas.
- `src/routes`: rotas file-based da aplicação com as páginas principais.
- `src/types`: tipos TypeScript do domínio SST.
- `src/router.tsx`: configuração do router.
- `src/routeTree.gen.ts`: árvore de rotas gerada pelo TanStack Router.
- `src/server.ts`: entrada server-side usada pelo TanStack Start.
- `src/start.ts`: configuração do TanStack Start e middleware de erro.
- `src/styles.css`: estilos globais e configuração de tema.
- `vite.config.ts`: configuração Vite usando `@lovable.dev/vite-tanstack-config`.
- `components.json`: configuração dos componentes shadcn-style.

# ✅ Pré-requisitos

Para executar o projeto localmente, é necessário ter:

- **Node.js:** recomendado Node.js 20 ou superior para compatibilidade com Vite 7 e o ecossistema atual do projeto.
- **Bun:** recomendado, pois o repositório possui `bun.lock` e `bunfig.toml`.

Também é possível usar npm, já que os comandos estão definidos em `package.json`. O repositório não possui `package-lock.json`, `pnpm-lock.yaml` ou `yarn.lock`.

Verifique as versões instaladas:

```bash
node --version
bun --version
```

Opcionalmente, com npm:

```bash
npm --version
```

# ⚙️ Instalação

Instale as dependências com Bun:

```bash
bun install
```

Alternativa com npm:

```bash
npm install
```

# 🚀 Execução em Ambiente de Desenvolvimento

Para iniciar o servidor de desenvolvimento com Bun:

```bash
bun run dev
```

Alternativa com npm:

```bash
npm run dev
```

O script executa:

```bash
vite dev
```

Após iniciar, acesse a URL exibida no terminal, normalmente:

```text
http://localhost:5173
```

# 🏗️ Build para Produção

Para gerar a build de produção:

```bash
bun run build
```

Alternativa com npm:

```bash
npm run build
```

O script executa:

```bash
vite build
```

Também existe um script de build em modo development:

```bash
bun run build:dev
```

Alternativa com npm:

```bash
npm run build:dev
```

# 🔎 Preview da Aplicação

O projeto possui script de preview para visualizar a build localmente:

```bash
bun run preview
```

Alternativa com npm:

```bash
npm run preview
```

O script executa:

```bash
vite preview
```

# 🔐 Variáveis de Ambiente

Não foram encontrados arquivos `.env` ou `.env.example` no repositório.

No código atual, a única variável lida diretamente é:

- `NODE_ENV`: acessada em `src/lib/config.server.ts` por meio de `process.env.NODE_ENV`.

O arquivo `src/lib/config.server.ts` também documenta padrões para uso futuro:

- variáveis públicas devem usar o prefixo `VITE_` e podem ser lidas com `import.meta.env.VITE_NOME`;
- segredos devem permanecer no servidor e ser lidos via `process.env` em arquivos server-only ou handlers;
- exemplos comentados no código incluem `DATABASE_URL` e `STRIPE_SECRET_KEY`, mas essas variáveis não são usadas atualmente.

Exemplo opcional para futuras variáveis públicas:

```env
VITE_PUBLIC_APP_NAME="SST Inspeções"
```

No estado atual do projeto, nenhuma variável de ambiente customizada é obrigatória para executar a aplicação localmente.

# 🧭 Rotas e Páginas Principais

Rotas identificadas em `src/routes`:

- `/`: redireciona para `/login`.
- `/login`: tela de acesso com autenticação simulada e seleção de perfil.
- `/dashboard`: visão geral com KPIs, gráficos, NCs críticas e próximas inspeções.
- `/inspecoes`: lista de inspeções com busca e filtro por status.
- `/inspecoes/nova`: assistente para criação de inspeção em três etapas.
- `/inspecoes/$id`: execução e detalhamento da inspeção.
- `/checklists`: biblioteca de modelos de checklist.
- `/checklists/$id`: visualizador/editor estrutural de checklist.
- `/nao-conformidades`: gestão de NCs em Kanban e Lista.
- `/nao-conformidades/$id`: detalhe da NC, plano 5W2H, status, evidências e timeline.
- `/relatorios`: seleção e pré-visualização de relatórios de inspeções concluídas.
- `/empresas`: empresas e unidades fiscalizadas.
- `/normas`: normas regulamentadoras cadastradas.
- `/equipe`: profissionais cadastrados e métricas operacionais.
- `/configuracoes`: aparência, perfil ativo, modo offline, sincronização e restauração de dados mockados.

# ✨ Funcionalidades Implementadas

- Layout interno com menu lateral segmentado em Operação e Cadastros.
- Barra superior com avatar, notificações, indicador offline e pendências de sincronização.
- Persistência local de estado no `localStorage` com chave `sst-store-v1`.
- Login simulado com credenciais livres.
- Dashboard com cards de indicadores e gráficos em Recharts.
- Listagem de inspeções com busca textual e filtro de status.
- Criação de inspeção com seleção de empresa, unidade, checklist, título, data/hora e inspetor.
- Execução de checklist por seções e itens.
- Registro de respostas: Conforme, NC e N/A.
- Campo de observação por item quando necessário.
- Criação automática de NC quando um item é marcado como não conforme.
- Simulação de anexo de foto/evidência com notificações toast.
- Encerramento de inspeção com assinatura via canvas.
- Timeline para rastreabilidade de inspeções.
- Kanban de não conformidades por status.
- Lista tabular de não conformidades.
- Plano de ação 5W2H para NCs.
- Alteração de status de NC.
- Timeline de eventos em NCs.
- Relatório consolidado de inspeção com dados cadastrais, resumo, detalhamento, NCs e assinatura.
- Impressão do relatório pelo navegador.
- Exportação PDF simulada.
- Modo escuro nas configurações.
- Modo offline simulado com contador de pendências.
- Restauração dos dados mockados.
- Páginas de estado para erro e rota não encontrada.

# 📱 Responsividade

A aplicação utiliza classes responsivas do Tailwind CSS em suas telas e componentes. A estrutura se adapta a diferentes larguras por meio de grids, colunas condicionais e elementos que mudam de disposição conforme o breakpoint.

Exemplos observados no código:

- O Login usa layout em duas colunas em telas grandes e card centralizado em telas menores.
- O AppShell possui menu lateral recolhível.
- Cards do Dashboard, Empresas, Normas, Equipe e Checklists usam grids responsivos.
- A lista de inspeções apresenta cabeçalho tabular em desktop e linhas empilhadas em telas menores.
- Formulários e painéis usam classes como `sm:`, `md:`, `lg:` e `xl:` para reorganização visual.

# 🧪 Scripts Disponíveis

Scripts definidos em `package.json`:

```bash
bun run dev
```

```bash
bun run build
```

```bash
bun run build:dev
```

```bash
bun run preview
```

```bash
bun run lint
```

```bash
bun run format
```

Equivalentes com npm:

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run format
```

# 🧭 Próximas Evoluções

Melhorias compatíveis com a arquitetura atual:

- Implementar backend real para autenticação, empresas, inspeções, checklists, NCs e relatórios.
- Substituir dados mockados por chamadas de API com TanStack Query.
- Criar formulários reais para cadastro de empresas e modelos de checklist.
- Implementar upload real de evidências e fotos.
- Gerar PDF real no fluxo de relatórios.
- Adicionar controle de permissões por perfil.
- Criar testes automatizados para fluxos principais.
- Adicionar arquivo `.env.example` caso novas variáveis sejam introduzidas.
- Implementar sincronização offline real com fila persistente e resolução de conflitos.
- Melhorar validações dos formulários com React Hook Form e Zod.
- Adicionar internacionalização ou padronização completa de textos em português.

# 👤 Autor

Desenvolvedor: Pedro Vitor

Projeto acadêmico/protótipo de plataforma para inspeções de Segurança e Saúde no Trabalho.
