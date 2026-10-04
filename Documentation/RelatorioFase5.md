# Relatório da Fase 5 — Arquitetura e API do backend

Revisão documental em 4 de outubro de 2026. Fonte primária: código no HEAD
inicial abaixo; modelo e regras das Fases 2–4 preservados. Sem mudanças de código,
banco, configuração, dependências ou execução funcional.

## 1. Repository Baseline

- Branch: `docs/documentation-update`, sem criar/switch para outra branch.
- HEAD inicial: `edc61709823c5c67d444208529d073d6207b60e9`.
- Estado inicial: working tree limpa (git status --short sem saída).
- Histórico conferido: Fase 4 edc6170, Fase 3 42aeb64, Fase 2 0a19b44.
- AGENTS.md, PROJECT_CONTEXT.md, IMPLEMENTATION_PLAN.md, TASKS.md e
  TECH_DECISIONS.md consultados antes das alterações; documentos de domínio,
  banco/modelos, cópia/templates e Offline consultados como referências.

## 2. Architecture

Arquitetura consolidada em [AI/Architecture.md](../AI/Architecture.md): aplicação
React/TanStack Start integrada, frontend/SSR/Server Functions no mesmo build,
Nitro/Vercel, fluxo de negócio por Services/Repositories/Prisma/PostgreSQL.
Zod, sessão e authorization boundary foram posicionados sem idealizar camadas.

Exceções explícitas: login direto, cadastro com React Query, beforeLoad separado
do fluxo de dados, helpers de sessão/logout, exemplo getGreeting sem persistência,
resposta/conclusão via Dexie primeiro inclusive online, catálogo compartilhado
e scripts/seeds fora da fronteira web. Repositories não são persistência passiva;
helpers/schemas também validam e preparam contratos.

## 3. Server Functions

Inventário estático de src/lib/api/*.functions.ts: **48 Functions, 14 arquivos,
45 POST/3 GET**. **43 operações de negócio exigem sessão**. Login/register são
públicos; logout não exige sessão válida; getCurrentSession resolve cookie;
getGreeting é exemplo público. **47** usam envelope Result/ServerResult e o
exemplo retorna objeto direto. Todas com payload têm Zod; quatro sem entrada
(sessão/logout/dashboard/listagem de relatórios) não têm schema de payload.

Grupos: auth, company, checklist, checklist-version, checklist-item, inspection,
inspection-response, standard, non-conformity, corrective-action, evidence,
report, dashboard, example. API anterior já incluía operações recentes;
inventário, delegação/exceções, schema de finishInspection e parâmetros/saídas
foram reconciliados. getGreeting não representa negócio persistido.

## 4. Authentication / Authorization

session.ts configura cookie safe_watch_session, userId, oito horas, HttpOnly,
SameSite=lax, Secure em produção e segredo obrigatório em produção. Login cria
sessão só após bcrypt; cadastro não cria sessão. Revalidação consulta conta não
excluída, sem identidade cliente autoritativa ou RBAC por papel armazenado.

Funções propagam ID da sessão; Services/Repositories restringem propriedade e
contexto, incluindo sync/evidência/relatório/dashboard. filters.userId da lista
de inspeções é sobrescrito, sem permitir escolher dono. Oficial/publicado
acessível não compartilha inspeções, drafts ou direito de editar.

## 5. Services / Repositories / Schemas

Services documentados pelo papel real: domínio/elegibilidade, preparação de
hash/snapshot/cópia/diretivas, coordenação de storage e DTOs. Repositories:
consultas/joins/ownership, revisão/deduplicação, nested writes, updates
condicionais e transações. Schemas: entrada/normalização/limites/enums/conjuntos
obrigatórios, distintos de regras de domínio e constraints físicas.

Transações descritas por operação: criação de inspeção/snapshot, cópia
RepeatableRead, edição de draft/itens, publicação/retirada, resposta/NC/operação
idempotente, conclusão, ação com transição da NC, metadados de evidência e
bootstrap por template. Não afirmada atomicidade da Function/fila/provedor
inteiros. Completude de conclusão e preparação de snapshot ocorrem antes da
transação; criação normal de checklist usa nested write atômico.

## 6. External Integrations

- PostgreSQL/Neon: persistência principal; revisão não acessou banco remoto.
- Prisma/adapter-pg: ORM/client; migrations contêm CHECKs/índices além do schema.
- IndexedDB/Dexie: pacotes/fila por usuário, sem CRUD offline geral; servidor
  valida sync, revisão e hash, conflito bloqueia fila, binários são futuros.
- Cloudinary: StorageService, upload/destroy assinados; PostgreSQL só metadados;
  compensação pode falhar, URL não pede sessão da aplicação em cada download.
- PWA: assets e navegação same-origin, fallback, versão/limpeza de caches,
  registro/escopo / e headers Nitro; não cacheia Server Functions.
- Scripts: Demo Seed/Platform Seed operacionais separados, acesso direto a
  Prisma permitido fora da arquitetura web; não executados nesta fase.

## 7. API Documentation

[AI/API.md](../AI/API.md) preserva contratos recentes e acrescenta inventário,
responsabilidades, schema/entrada, saídas, erros e efeitos por grupo. Corrigidos
finishInspectionSchema, default de paginação de normas, data:null da exclusão
de item, identidade na listagem de inspeções e erros de sessão/exemplo técnico.
Contrato não usa campo error; Result não garante conversão de toda exceção.

Desambiguadas operações sem Function própria: start/update/cancelInspection,
reabrir NC/concluir ação, CRUD universal de versão/snapshot/Report/operação
idempotente. Início vem de resposta, conclusão de ação de update; Report é
model persistível diferente do DTO/HTML montado sob demanda. Relatórios/dashboard
são reais; leitura de NC/ações pode persistir atraso, dashboard não muta estados.

[EspecificacaoAPIREST.md](./EspecificacaoAPIREST.md) conserva título/caminho
acadêmico com mecanismo Server Functions explícito, sem REST manual.
README e PROJECT_CONTEXT corrigem estado desses módulos, fronteiras e limitações.
READMEs de server/routes são referências locais da implementação.
[AI/Offline.md](../AI/Offline.md) recebeu somente delimitação necessária de cache
privado e alcance histórico da validação pública, sem reescrever homologações.

## 8. Diagrams

Dois Mermaid em AI/Architecture.md: flowchart de arquitetura e sequência de
cadastro/login/revalidação. Dois PlantUML novos com o mesmo modelo:

- [application.puml](./diagrams/architecture/application.puml).
- [authentication.puml](./diagrams/architecture/authentication.puml).

Nós, relações, participantes, mensagens e blocos condicionais conferidos entre
formatos. Ferramentas plantuml/mmdc não disponíveis em PATH; nenhuma dependência
instalada. Validação estrutural/manual e comparação local dos formatos;
**renderização e validação por parser especializado não executadas**.

## 9. Implementation Concerns

Sem correções de implementação nesta fase. Severidade é avaliação documental,
não resultado de exploração/novo teste funcional.

| Concern                                                                    | Evidência e impacto                                                                                                                                                          | Severidade                                                                                              | Final QA                                                          |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Prazo JSON null vira epoch (já conhecido da Fase 4)                        | non-conformity.schema.ts/corrective-action.schema.ts testam z.coerce.date antes de z.null; nulabilidade SQL não garante limpar prazo; reprodução anterior em RelatorioFase4  | Média: prazo incorreto/atraso                                                                           | Sim: reproduzir contrato/UI e corrigir em tarefa de código        |
| HTML autenticado no cache de navegação (delimitação nesta fase)            | public/sw.js networkFirstNavigation cacheia resposta OK exceto /login; chave não é por usuário, sem TTL; offline/session.ts remove sessão local vencida sem limpar navegação | Média: retenção de HTML privado no perfil do navegador; alcance de exposição após expiração exige teste | Sim: expiração/troca/logout/HTML SSR em dispositivo compartilhado |
| Erros lançados fora de Result e classificação de sync (limite reconferido) | validators antes do handler; Services como UserService/ReportService relançam inesperados; sync-manager catch classifica qualquer exceção como NETWORK_ERROR                 | Baixa: mensagens/retry não distinguem validação/transporte/interno; não é acesso autorizado indevido    | Sim: entradas inválidas, exceções e apresentação/retry no cliente |

Garantias/pendências prévias (compatibilidade de hash legado, nomes concorrentes,
FK de Checklist e compensações externas) permanecem documentadas em
[Database.md](../AI/Database.md), [BusinessRules.md](../AI/BusinessRules.md) e
[RelatorioFase4.md](./RelatorioFase4.md); não foram tratadas como novos bugs nem
alteradas nesta fase.

## 10. Validation

Comandos de baseline: git branch --show-current, git status --short,
git log --oneline -6, git rev-parse HEAD. Busca usou find/grep após verificar
que rg não está disponível. Consultas somente a arquivos locais/Git.

Comandos de fechamento e resultados:

```bash
git diff --check
python3 /tmp/swi-phase5-doc-validation.py
npx --no-install prettier --check AI/Architecture.md AI/API.md AI/Offline.md src/server/README.md src/routes/README.md PROJECT_CONTEXT.md README.md Documentation/EspecificacaoAPIREST.md Documentation/RelatorioFase5.md
git status --short
git diff --stat
git diff
git diff --cached --check
git diff --cached --stat
git diff --cached
git status --short
git log --oneline -4
```

- git diff --check e staged --check: aprovados.
- Prettier inicial apontou cinco arquivos; formatação restrita a esses Markdown.
  Check final dos nove Markdown: aprovado.
- Validador local: 102 referências relativas válidas, nenhuma âncora local usada
  nesses nove documentos; fences/nomes conferidos. Contagem automática corrigiu
  a soma preliminar de métodos para 45 POST/3 GET antes do fechamento.
- Diagramas equivalentes: 16 nós/17 arestas na arquitetura; seis participantes/
  19 mensagens e alt/else/end na autenticação.
- Inventário/nomes de Functions, Services, Repositories e schemas: comparados ao
  código; Mermaid/PlantUML: igualdade estrutural e inspeção manual.
- Diff revisado antes do staging e staged diff antes do commit; somente nove
  Markdown e dois PlantUML deste escopo, sem código/config/schema/migration/seed/teste.
- Parsers/renderizadores: command -v plantuml e command -v mmdc sem localização;
  não instalados. Sem renderização aprovada.
- Não executados testes/build/homologação funcional, migrations, seeds, scripts
  de integração ou consultas ao PostgreSQL/Cloudinary. Resultados funcionais de
  fases anteriores continuam históricos.

## 11. Git

Commit próprio contendo estes onze documentos, sem push/amend/rebase/reset.
Mensagem: `docs: consolidate architecture and backend API documentation`.
Identificador: **o próprio commit que adiciona este relatório**, verificável sem
hash autorreferente no arquivo (mesma convenção do relatório da Fase 4):

```bash
git log -1 --format='%H %s' -- Documentation/RelatorioFase5.md
```

Hash literal informado na entrega. Working tree final: **CLEAN**, conferida após
commit. Push: **NOT PERFORMED**. Nenhuma alteração de commits anteriores.
