# Backend do Safe Watch Insight

Referência local da implementação, reconferida na Fase 5. Visão completa:
[Arquitetura](../../AI/Architecture.md). Contratos expostos:
[API](../../AI/API.md). Esta pasta contém domínio/infraestrutura; a fronteira
TanStack Start fica em [src/lib/api](../lib/api/).

## Fluxo e fronteira

```text
Tela → Hook/React Query ou chamada direta → Server Function
     → Zod → sessão → Service → Repository → Prisma → PostgreSQL
```

Handlers carregam Services e sessão por imports dinâmicos, obtêm identidade no
servidor e repassam-na às operações. Não há backend REST separado. Login é
chamada direta; sessão/logout são helpers; getGreeting é exemplo sem persistência
ou Result. Offline grava respostas/conclusão em Dexie antes da sincronização.
Guard beforeLoad da rota protege navegação, sem substituir autorização backend.

## Organização e responsabilidades

| Pasta         | Papel real                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| auth/         | session.ts cria/lê/limpa sessão; password.ts aplica bcrypt custo 12                                            |
| catalog/      | Definições dos templates institucionais, consumidas pelo bootstrap                                             |
| prisma/       | Prisma Client gerado/adapter-pg, DATABASE_URL e reutilização global em desenvolvimento                         |
| repositories/ | Consultas/joins/filtros de propriedade, nested writes, transações, deduplicação/revisão e updates condicionais |
| services/     | Elegibilidade/autorização, versionamento, snapshot/cópia, diretivas de estado, hashes, storage e DTOs          |
| schemas/      | Zod para contrato de entrada; cadastro reexporta schema compartilhado                                          |
| storage/      | StorageService e CloudinaryStorageService: upload/destroy assinados no servidor                                |
| errors/       | ApiError e subclasses de domínio/infraestrutura                                                                |
| responses/    | Result, resultFromError, success/failure e paginação                                                           |
| types/        | Tipos compartilhados, sem CRUD implícito                                                                       |
| utils/        | Hashes canônicos de checklist/operação offline e helpers                                                       |

Services não acessam Prisma para consultar/persistir; podem importar tipos/enums
ou reconhecer erros Prisma. Repositories aplicam garantias de persistência,
sem substituir decisões de domínio. Nem todo Service herda BaseService, nem
cada fluxo tem um único Repository. ChecklistItemRepository é legado; edição
atual usa ChecklistVersionItemRepository.

## Identidade e autorização

session.ts configura safe_watch_session, userId, oito horas, HttpOnly,
SameSite=lax, Path=/ e Secure em produção. SESSION_SECRET obrigatório em produção;
fallback apenas em desenvolvimento/outros ambientes. getAuthenticatedUser
reconsulta conta não excluída via UserService/UserRepository. Sem identidade:
UNAUTHORIZED; conta ausente: NOT_FOUND e cookie limpo. Registro não inicia
sessão; retorna id/name/email e define TECHNICIAN no servidor, sem RBAC.

Identidade de operação vem da sessão. Filtros userId não são autoridade:
InspectionService sobrescreve-os. Repositories restringem Company/Checklist por
dono, Inspection por userId e NC/ação/evidência por contexto da inspeção.
Publicação acessível permite reutilizar conteúdo, sem compartilhar inspeções.
Oficiais não têm dono usuário nem mutações pessoais, inclusive para ADMIN.
Matriz: [BusinessRules](../../AI/BusinessRules.md).

## Contrato de retorno e erros

[responses/result.ts](./responses/result.ts) define:

```ts
interface SuccessResult<TData> {
  success: true;
  data: TData;
  message?: string;
}
interface ErrorResult {
  success: false;
  message: string;
  code: string;
  statusCode: number;
  errors?: unknown;
}
type Result<TData> = SuccessResult<TData> | ErrorResult;
```

Não existe campo `error` nesse envelope. toServerResult em lib/api/server-result.ts
(e versões locais nas Functions) adapta errors para JsonValue, incluindo Date
nos detalhes, e preserva resultado de sucesso. O transporte do Start preserva
os valores tipados; não se presume que todo dado retornado seja JSON puro.
statusCode é lógico, não uma definição de status HTTP da chamada.

| Classe / origem                                | code                        | statusCode lógico |
| ---------------------------------------------- | --------------------------- | ----------------- |
| UnauthorizedError                              | UNAUTHORIZED                | 401               |
| NotFoundError                                  | NOT_FOUND                   | 404               |
| ConflictError                                  | CONFLICT                    | 409               |
| ValidationError                                | VALIDATION_ERROR            | 422               |
| StorageError                                   | STORAGE_ERROR               | 502               |
| ApiError de configuração Cloudinary            | STORAGE_CONFIGURATION_ERROR | 500               |
| internalErrorResult / resultFromError genérico | INTERNAL_SERVER_ERROR       | 500               |

ValidationError.details gera errors com pares field/message. resultFromError
converte ApiError ou usa falha interna genérica; não cobre automaticamente todas
as Server Functions. Services geralmente capturam ApiError, alguns mapeiam
P2002/P2025; outros erros são relançados. EvidenceService/DashboardService
normalizam também genéricos. Conflitos internos
ChecklistVersionPersistenceConflictError, InspectionStatePersistenceConflictError,
InspectionResponseRevisionConflictError, OfflineOperationPayloadConflictError e
NonConformityStatePersistenceConflictError são traduzidos para CONFLICT nos fluxos
correspondentes.

Zod em inputValidator/validator pode lançar antes do handler; sessão/imports e
exceções inesperadas também podem rejeitar sem envelope. Cliente trata success
false e erro lançado; falha Result pode chegar ao onSuccess do React Query.
Não há conversor global demonstrado que garanta Result em toda falha.

## Histórico, atomicidade e efeitos de leitura

Publicação: hash canônico e revisão do draft. Inspeção: escrita atômica de
snapshot/itens/normas após preparação no Service. Cópia: transação RepeatableRead
com leitura/preparação e inserts em lote. Resposta: estado/resposta/NC e, quando
offline, registro idempotente na transação. Conclusão: atualização condicional
com confirmação offline quando presente; validação de completude precede a
transação. Criação de ação coordena estado da NC na mesma transação.

Não há atomicidade global de Server Function, fila inteira, dashboard ou
Cloudinary/PostgreSQL. NC lista/detalhe e listagem de ações podem persistir
OVERDUE na leitura; dashboard calcula atrasos sem mutar. Migrations têm CHECKs
/índices além do schema: [Database](../../AI/Database.md).

## Integrações e utilitários

EvidenceService autoriza contexto/snapshot, valida bytes e usa StorageService.
Cloudinary guarda binário; EvidenceRepository guarda metadados. Falha de
persistência tenta remover upload; falha de destroy tenta restaurar soft delete.
URL externa não exige sessão da aplicação em cada download. Offline binário futuro.

ReportService/ReportRepository montam DTO de Inspection, sem inserir Report.
DashboardService/DashboardRepository agregam dados reais próprios. Hooks/telas
consomem esses read models; impressão/PDF usa diálogo nativo no cliente.

Demo Seed e Platform Seed são utilitários explícitos fora da aplicação web.
Podem usar Prisma direto e Services; bootstrap não é Server Function. Scripts
operacionais seguem seu próprio ciclo e alguns escrevem fixtures. Contratos
web não ganham CRUD de Report, Snapshot ou OfflineSyncOperation por isso.
Detalhes: [OfficialTemplates](../../AI/OfficialTemplates.md),
[ChecklistCopy](../../AI/ChecklistCopy.md), [Offline](../../AI/Offline.md).
