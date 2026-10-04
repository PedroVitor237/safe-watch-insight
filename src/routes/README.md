# Rotas e fronteira frontend/backend

TanStack Router usa roteamento por arquivos. `__root.tsx` é o root layout com
Outlet, QueryClientProvider, metadados PWA e registro do worker. `/_app` é layout
sem segmento de URL: protege telas e renderiza AppShell. routeTree.gen.ts é
gerado; não editar manualmente nem criar src/pages ou layouts de outro framework.

## Rotas atuais

| Arquivo                                                                           | URL / comportamento                                                          |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `index.tsx`                                                                       | / → redireciona para /login                                                  |
| `login.tsx`                                                                       | /login; sessão válida redireciona para /dashboard                            |
| `register.tsx`                                                                    | /register; cadastro público, sucesso navega para /login                      |
| `_app.dashboard.tsx`                                                              | /dashboard; agregados reais via useDashboard                                 |
| `_app.empresas.tsx`                                                               | /empresas; CRUD real                                                         |
| `_app.checklists.index.tsx` / `_app.checklists.$id.tsx`                           | /checklists e /checklists/$id; biblioteca/detalhe/edição/publicação/cópia    |
| `_app.inspecoes.index.tsx` / `_app.inspecoes.nova.tsx` / `_app.inspecoes.$id.tsx` | /inspecoes, /inspecoes/nova e /inspecoes/$id; lista/criação/execução         |
| `_app.nao-conformidades.index.tsx` / `_app.nao-conformidades.$id.tsx`             | /nao-conformidades e /nao-conformidades/$id; NCs/ações/evidências            |
| `_app.normas.tsx`                                                                 | /normas; catálogo real                                                       |
| `_app.relatorios.tsx`                                                             | /relatorios; seleção por inspectionId na busca e HTML imprimível real        |
| `_app.equipe.tsx`                                                                 | /equipe; dados demonstrativos                                                |
| `_app.configuracoes.tsx`                                                          | /configuracoes; ajustes de interface, sem API de edição persistida de perfil |

IDs dinâmicos usam `$id`, não `{id}`. Layouts renderizam filhos com Outlet.
O README descreve arquivos reais, sem propor novas rotas.

## Sessão e proteção de navegação

`_app.tsx.beforeLoad` chama getAppSession e redireciona falha para /login.
A fachada [offline/session.ts](../offline/session.ts) usa Server Function no SSR;
no browser tenta sessão remota/cacheia usuário seguro ou usa validade local
offline/em exceção. Isso não autoriza operação no backend: cada Server Function
protegida lê sessão remota/reconsulta usuário e aplica ownership.

login.tsx chama login diretamente pelo formulário e cacheia sessão offline após
sucesso; não passa por mutation React Query. register.tsx usa React Hook Form,
Zod compartilhado e mutation que chama register, sem autenticar automaticamente.
AppShell consulta sessão e tenta logout remoto, limpa dados
IndexedDB/cache de navegação e encaminha para login. Falha remota é informada;
limpeza local não confirma revogação do cookie no servidor.

## Consultas, mutações e estados de erro

Fluxo típico: rota/componente → hook em src/hooks → src/lib/api/*.functions.ts →
validação/sessão → Service → Repository → Prisma/PostgreSQL. Não acessar Prisma
na rota nem tratar filtros de usuário como identidade confiável.

React Query gerencia loading/cache/invalidação; telas verificam Result.success
para exibir mensagem/toast. Falha retornada pode acionar onSuccess da mutation;
falha de validação/transporte pode lançar e entrar em onError/estado de erro.
Root possui ErrorComponent/NotFoundComponent e ação de recarregamento. Contrato
real: [AI/API.md](../../AI/API.md).

## Inspeção e funcionamento local

useInspections usa inspection-client: pacote local quando offline ou com
alterações pendentes; consulta remota/cache quando possível. useSaveInspectionResponse
/useFinishInspection gravam pacote e fila Dexie primeiro, inclusive online,
com networkMode=always, e pedem sincronização. Confirmação do servidor remove
operação e invalida consultas via eventos observados no root.

Servidor revalida sessão/contexto/revisão/hash. Conflito bloqueia fila; offline
não cria inspeção nova, não sincroniza binários e não é CRUD de todos os módulos.
useInspectionResponses ainda consulta Server Function diretamente; a execução
usa também respostas incorporadas ao pacote de inspeção. Não inferir que todo
hook tenha fallback IndexedDB.

## Evidências, relatório e PWA

useUploadEvidence monta FormData para upload online; autorização/storage/metadados
são backend. Imagens usam URL Cloudinary diretamente. useInspectionReport consulta DTO
sob demanda; useAvailableInspectionReports lista inspeções elegíveis, sem criar Report; HTML/window.print oferecem impressão/Salvar como
PDF nativo. Dashboard consulta read model real, sem mocks.

Registro /sw.js no root, escopo /; worker cacheia assets e navegações GET da
mesma origem (exceto /login). **HTML autenticado pode ser cacheado** e o cache de
navegação não tem chave por usuário/expiração de sessão. Não afirmar ausência de
conteúdo privado no cache ou cache de Server Functions. Detalhes e limites:
[Arquitetura](../../AI/Architecture.md) e [Offline](../../AI/Offline.md).
