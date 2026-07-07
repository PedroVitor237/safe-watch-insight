# AI Project Context

Primary context document for future AI assistants working on this repository.

Last analyzed: 2026-07-07.

This document is based on the repository documentation and the current code implementation. When documentation and implementation diverge, the divergence is called out explicitly.

---

# Project Overview

Safe Watch Insight, also described in user-facing text as SST Inspecoes, is a web platform for supporting Occupational Safety and Health inspections, audits, and compliance checks. Its goal is to replace paper forms and spreadsheets with a digital workflow for companies, checklists, inspections, non-conformities, corrective actions, evidence, reports, history, and future offline synchronization.

The project is a TCC/academic project for Analise e Desenvolvimento de Sistemas, but the architecture is intended to be maintainable and evolvable as a real product.

Current stage:

- Frontend exists with many implemented screens.
- Backend architecture is partially implemented with TanStack Start Server Functions, services, repositories, Prisma, PostgreSQL, Zod, and sessions.
- Some frontend modules already use real Server Functions and React Query.
- Several modules still use `src/lib/mockStore.ts` and `src/mocks/data.ts`.
- Offline, upload, reports, non-conformity persistence, corrective actions, standards API, and dashboard integration are not complete.

Technologies currently present:

- React 19, TypeScript strict, TanStack Start, TanStack Router, TanStack React Query.
- Tailwind CSS 4, Radix UI/shadcn-style components, Lucide React, Recharts.
- TanStack Start Server Functions.
- Prisma ORM 7, generated client in `src/generated/prisma`.
- PostgreSQL via `pg` and `@prisma/adapter-pg`; documentation targets Neon.
- Zod validation, bcrypt password hashing, TanStack Start sessions.
- Vite 7, `@lovable.dev/vite-tanstack-config`, explicit Nitro Vercel preset.
- Both `bun.lock` and `package-lock.json` exist; README recommends Bun but npm scripts are present and usable.

Architecture summary:

```text
Tela
-> React Query
-> Server Function
-> Service
-> Repository
-> Prisma
-> PostgreSQL
```

This flow is mandatory. Frontend code must not access Prisma directly.

---

# Repository Structure

- `src/routes/`: TanStack Router file-based routes. Do not create `src/pages`, Next.js app routes, or edit `routeTree.gen.ts` manually.
- `src/components/ui/`: reusable Radix/shadcn-style UI primitives.
- `src/components/common/`: shared app components such as `PageHeader` and `StatusBadge`.
- `src/components/layout/`: authenticated application shell with sidebar, top bar, session display, logout, and mock offline indicators.
- `src/hooks/`: React Query hooks for backend-backed modules and utility hooks.
- `src/lib/api/`: TanStack Start Server Functions and query-key helpers.
- `src/lib/`: shared utilities, formatting, mock store, error handling, server-only config helpers.
- `src/server/`: backend layers: Prisma client, repositories, services, schemas, errors, responses, types, utilities.
- `src/generated/prisma/`: Prisma-generated client and types. Treat as generated output.
- `src/mocks/`: mock data still used by dashboard, NCs, reports, norms, team, and offline simulation.
- `src/types/`: legacy/frontend mock domain types in Portuguese.
- `prisma/`: Prisma schema, migration, config, and seed.
- `scripts/`: utility scripts, currently cycle-detection scripts.
- `AI/`: architecture, database, API, business rules, entities, offline, and prompt guidance for AI agents.
- `Documentation/`: academic/TCC documentation for requirements, personas, UML/database models.
- `DocumentacaoAtividade` / `DocumentaçãoAtividade`: screen specifications, wireframes, navigation map, user guide.
- `.lovable/`: Lovable planning artifact.
- `.output/`, `.vercel/`, `.wrangler/`, `.tanstack/`, `node_modules/`: generated/build/dependency artifacts; do not treat as source documentation.

---

# Documentation Index

- `AGENTS.md`: permanent development rules for AI agents. Read before any code change.
- `PROJECT_CONTEXT.md`: product/domain overview and planned architecture. Read during onboarding and before feature work.
- `IMPLEMENTATION_PLAN.md`: official phase order for backend and integration work. Read before selecting the next module.
- `TASKS.md`: backlog and academic delivery checklist. Read when deciding current priorities.
- `TECH_DECISIONS.md`: technical decisions and rationale. Read before changing framework, auth, Prisma, deploy, offline, or upload strategy.
- `CODING_STANDARDS.md`: currently empty. Keep listed, but it has no content as of this analysis.
- `README.md`: setup, routes, scripts, and feature overview. It is partially outdated because it still states there is no backend, while backend code now exists.
- `AI/Architecture.md`: official layered architecture. Read before backend/frontend integration changes.
- `AI/API.md`: expected API modules, response format, validation, pagination, filters. Read before adding Server Functions or APIs.
- `AI/BusinessRules.md`: domain rules for users, companies, checklists, inspections, NCs, evidence, reports, security, offline. Read before business logic changes.
- `AI/Database.md`: database conventions, relationships, indexes, seeds, Prisma rules. Read before schema or repository changes.
- `AI/Entities.md`: domain entity reference. Read before adding or altering models.
- `AI/Offline.md`: planned offline-first architecture. Read before persistence, sync, evidence, or PWA work.
- `AI/PROMPTS/MASTER_PROMPT.md`: master AI instructions and required document order. Read for broad AI-assisted implementation.
- `AI/PROMPTS/BUGFIX_PROMPT.md`: bugfix workflow, root-cause analysis, validation, and delivery format. Read before bug fixes.
- `AI/PROMPTS/CRUD_PROMPT.md`: CRUD implementation workflow. Read before adding CRUD for a domain entity.
- `AI/PROMPTS/QA_PROMPT.md`: QA/review checklist for requirements, architecture, frontend, backend, security, offline. Read before validation tasks.
- `AI/PROMPTS/REFACTOR_PROMPT.md`: refactoring workflow and constraints. Read before refactors.
- `AI/PROMPTS/REVIEW_PROMPT.md`: code review criteria and output structure. Read before review tasks.
- `src/server/README.md`: current backend folder responsibilities and request flow. Read before editing `src/server`.
- `src/routes/README.md`: TanStack route conventions. Read before adding or renaming routes.
- `Documentation/DocumentoDeRequisitos.md`: functional/non-functional requirements and business rules. Read for academic requirement alignment.
- `Documentation/Personas.md`: user personas. Read for UX and workflow decisions.
- `Documentation/DiagramaDeCasosDeUso.md`: actors and use cases. Read for feature scope validation.
- `Documentation/DiagramaDeClasses_VersaoTecnica.md`: technical class diagram. Read before model changes.
- `Documentation/ModeloConceitualDoBancoDeDados.md`: conceptual database model. Read before schema changes.
- `Documentation/ModeloLogico.md`: logical database model and table attributes. Read before schema changes.
- `Documentation/ModeloFisicoDB.md`: physical PostgreSQL/Prisma-oriented model. Read before migrations.
- `DocumentaçãoAtividade/ESPECIFICACAO_DE_TELAS.md`: approved screen behavior and components. Read before UI changes.
- `DocumentaçãoAtividade/MAPA_DE_NAVEGACAO.md`: navigation map and flows, based on the earlier mock prototype. Read before route/navigation changes.
- `DocumentaçãoAtividade/WIREFRAMES.md`: ASCII wireframes of current UI. Read before layout changes.
- `DocumentaçãoAtividade/GUIA_USUARIO.md`: user guide, currently describes prototype behavior. Read for UX wording and demo flows.
- `.lovable/plan.md`: old plan for generating a navigation-map document. Historical reference only.
- `AI_PROJECT_CONTEXT.md`: this current repository context. Read after `AGENTS.md` for a fast, implementation-aware overview.

---

# Current Architecture

## Frontend

The frontend uses TanStack Router file-based routing under `src/routes`. The authenticated route group is `_app`, guarded by `beforeLoad` in `src/routes/_app.tsx`, which calls `getCurrentSession()`. The root route redirects `/` to `/login`.

`AppShell` provides sidebar navigation, top bar, session avatar, logout, notifications button, and simulated offline/pending-sync indicators from `mockStore`.

React Query is configured through `QueryClientProvider` in `src/routes/__root.tsx`. Query keys are centralized per integrated module in `src/lib/api/*.query-keys.ts`.

## Backend

The backend lives in `src/server` and is consumed through TanStack Start Server Functions in `src/lib/api`.

Implemented layers:

- Prisma singleton: `src/server/prisma/client.ts`.
- Repositories: base, user, company, checklist, inspection, inspection-response.
- Services: user, company, checklist, inspection, inspection-response.
- Schemas: auth, pagination, company, checklist, inspection, inspection-response.
- Errors/responses: `ApiError`, `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ValidationError`, `Result`, pagination.

## Database

The implemented database uses Prisma 7 and PostgreSQL. `DATABASE_URL` is provided through `prisma.config.ts` and the runtime Prisma client uses `@prisma/adapter-pg`.

The Prisma client is generated to `src/generated/prisma`, not the default `node_modules/@prisma/client` path.

## Authentication

Authentication is real, not simulated:

- Login Server Function validates with Zod, uses `UserService.authenticate`, compares bcrypt hashes, and creates a session.
- Seed creates `admin@demo.com` with password `Admin@123`.
- Session helpers use TanStack Start server sessions with an HTTP-only cookie named `safe_watch_session`.
- Session max age is 8 hours.
- `SESSION_SECRET` is required in production. A development fallback secret exists for non-production.
- JWT is not implemented.

Important current issue: login code logs the submitted payload, including password, with `console.info`. This should be removed before real use.

## Sessions

Session data stores `userId`. `getAuthenticatedUser()` reads the session, fetches the active user, clears the session if the user lookup fails, and returns a standardized `Result<SafeUser>`.

## Storage

Evidence storage is only modeled in Prisma. There is no Cloudinary upload implementation. Mock evidence in the NC UI is local/mock only.

## API

The current API surface is Server Functions, not REST routes. Most functions use `method: "POST"` even for reads, except `getCurrentSession` uses GET.

Implemented Server Functions:

- Auth: `login`, `getCurrentSession`, `logout`.
- Companies: create, update, soft delete, get by id, list.
- Checklists: create, update, soft delete, get by id, list.
- Inspections: create, get by id, list, soft delete.
- Inspection responses: list, save/upsert response, finish inspection.
- Example: `getGreeting`.

## Deployment

Deployment target is Vercel per documentation and current `vite.config.ts`, which explicitly adds `nitro({ preset: "vercel" })`. `TECH_DECISIONS.md` says this Nitro configuration must not be removed without validating deploy.

There is no committed `vercel.json` in the source tree. Vercel output directories exist as generated artifacts.

---

# Database

Implemented Prisma models:

- `User`
- `Company`
- `Checklist`
- `ChecklistItem`
- `Standard`
- `ChecklistItemStandard`
- `Inspection`
- `InspectionResponse`
- `NonConformity`
- `CorrectiveAction`
- `Evidence`
- `Report`

Implemented enums:

- `UserRole`: `ADMIN`, `TECHNICIAN`, `SUPERVISOR`, `AUDITOR`
- `StandardType`: `NR`, `NBR`, `NT`, `OTHER`
- `InspectionStatus`: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `SyncStatus`: `PENDING`, `SYNCING`, `SYNCED`, `ERROR`
- `ResponseStatus`: `COMPLIANT`, `NON_COMPLIANT`, `NOT_APPLICABLE`
- `Severity`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `NonConformityStatus`: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `OVERDUE`
- `CorrectiveActionStatus`: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`

Relationships:

- User has many companies, checklists, inspections, reports.
- Company has many inspections.
- Checklist has many checklist items and inspections.
- ChecklistItem has many standards through `ChecklistItemStandard` and many inspection responses.
- Inspection has many responses and evidence, and one optional report.
- InspectionResponse has one optional NonConformity and is unique by inspection + checklist item.
- NonConformity has many corrective actions and evidence.
- Evidence belongs optionally to inspection and/or non-conformity.
- Report belongs to one inspection and one generating user; inspection is unique.

Migrations:

- One migration exists: `prisma/migrations/20260705165125_init/migration.sql`.
- It creates the enums, tables, indexes, unique constraints, and foreign keys.
- Migration lock provider is PostgreSQL.

Seed:

- `prisma/seed.ts` is idempotent for the demo admin, company, checklist, checklist items, and one planned inspection.
- It does not seed standards, non-conformities, corrective actions, evidence, or reports.

Current status:

- Schema is broadly aligned with the academic database documents.
- `deletedAt` soft-delete fields are implemented on several models.
- `ChecklistItem`, `Standard`, `ChecklistItemStandard`, `InspectionResponse`, and `Report` do not all have `updatedAt`; this mostly matches the current schema but should be checked before adding audit requirements.
- The code has repositories/services only for users, companies, checklists, inspections, and inspection responses. Models for standards, non-conformities, corrective actions, evidence, and reports exist but lack complete backend modules.

---

# Backend

Implemented APIs and behavior:

- Auth:
  - Validates email/password.
  - Normalizes email.
  - Finds active user by email.
  - Compares bcrypt hash.
  - Returns user without password.
  - Creates/clears session.
- Companies:
  - Create, update, soft delete, get by id, list.
  - Validates CNPJ format and normalizes digits.
  - Enforces active CNPJ uniqueness in service before write.
  - Supports search, pagination, sort, createdById filter.
- Checklists:
  - Create, update, soft delete, get by id, list.
  - Supports search, pagination, sort, createdById, `isTemplate`, `isActive`.
  - Does not manage checklist items yet.
- Inspections:
  - Create inspection using the authenticated session user.
  - Ensures company and checklist exist.
  - Get by id and list with company/checklist/user/responses included.
  - Soft delete.
  - Filtering by user, company, checklist, status, sync status, search.
- Inspection responses:
  - List responses by inspection.
  - Upsert response by inspection + checklist item.
  - Verifies the checklist item belongs to the inspection checklist.
  - Moves inspection from `PLANNED` to `IN_PROGRESS` on first saved response.
  - Finishes inspection by setting status to `COMPLETED`.

Validations:

- Zod schemas exist for login, pagination/list filters, companies, checklists, inspections, and inspection responses.
- Pagination defaults to page 1 and pageSize 20, capped at 100.

Business rules implemented:

- No direct Prisma outside repositories in the implemented backend layers.
- Company CNPJ uniqueness.
- Soft delete for company/checklist/inspection service delete operations.
- Inspection creation requires valid company/checklist.
- Inspection response must refer to an item in the inspection's checklist.
- Passwords are hashed in seed and checked with bcrypt.

Business rules not yet implemented:

- User CRUD.
- Checklist item CRUD/reordering/standard association.
- Standards API.
- Automatic NonConformity creation when a response is `NON_COMPLIANT`.
- Corrective actions.
- Evidence upload/storage workflow.
- Report generation/persistence/download.
- Dashboard real aggregate queries.
- Authorization/role-based access control.
- Offline sync.
- Required-item enforcement before finishing inspection.

---

# Frontend

Implemented pages/routes:

- `/`: redirects to `/login`.
- `/login`: real login against backend/session, demo credentials shown.
- `/_app`: authenticated layout guard.
- `/dashboard`: dashboard UI using mock KPIs, mock inspections, mock NCs.
- `/inspecoes`: real inspection list via React Query/Server Functions.
- `/inspecoes/nova`: real create-inspection flow using real companies/checklists.
- `/inspecoes/$id`: real inspection detail and response saving against backend; signature is local UI only and not persisted.
- `/checklists`: real checklist list, but without real item counts.
- `/checklists/$id`: real checklist detail, but item display is placeholder.
- `/empresas`: real company list.
- `/nao-conformidades`: mock Kanban/list from `mockStore`.
- `/nao-conformidades/$id`: mock NC detail, 5W2H editing, status change, evidence mock.
- `/relatorios`: mock report preview/print/PDF toast from `mockStore`.
- `/normas`: mock standards from `src/mocks/data.ts`.
- `/equipe`: mock users plus mock workload metrics.
- `/configuracoes`: mock dark-mode toggle, profile selection, offline simulation, mock reset.

Completed/integrated modules:

- Real authentication/session-aware login and route guard.
- Real list views for companies, checklists, inspections.
- Real inspection creation.
- Real inspection response saving and completion status update.

Unfinished modules:

- Company creation/update/delete UI forms are not exposed, although hooks and Server Functions exist.
- Checklist creation/update/delete UI forms are not exposed, although hooks and Server Functions exist.
- Checklist items are not integrated in checklist list/detail. Inspection detail can render items only if seeded/created directly in the DB.
- Non-conformities are not backed by Prisma despite the model existing.
- Reports are mock-only.
- Dashboard is mock-only.
- Norms and team are mock-only.
- Offline is simulated only with `localStorage`.
- Evidence upload is simulated only.

---

# Current Progress

Estimated from current code, not from unchecked task boxes in `TASKS.md`:

- Frontend: 65%
  - Many screens exist and are responsive.
  - Several screens still mock data or have placeholder actions.
- Backend: 35%
  - Core architecture exists.
  - Auth, companies, checklists, inspections, and responses are partially implemented.
  - Major modules remain absent.
- Database: 75%
  - Prisma schema and initial migration cover the planned core domain.
  - Seed is partial and repositories/services are incomplete for several models.
- Authentication: 60%
  - Login/logout/session/bcrypt exist.
  - Role permissions, user management, and hardening remain pending.
- Integration: 35%
  - Companies/checklists/inspections/responses partially integrated.
  - Dashboard, NCs, reports, norms, team, offline, evidence remain mock-only.
- Documentation: 70%
  - Extensive academic and AI documentation exists.
  - Some docs are outdated compared to implementation, especially README/prototype navigation/user-guide language.

---

# Completed Features

- TanStack Start/TanStack Router app structure.
- Authenticated app shell with sidebar and top bar.
- Real login/logout/session flow.
- Prisma schema for core domain.
- Initial PostgreSQL migration.
- Idempotent demo seed for admin, company, checklist, checklist items, inspection.
- Prisma singleton with `@prisma/adapter-pg`.
- Backend base repository/service patterns.
- Standard `Result` response shape and API errors.
- Zod validation for implemented modules.
- React Query hooks and query keys for companies, checklists, inspections, inspection responses.
- Company CRUD backend and list UI.
- Checklist CRUD backend and list/detail UI placeholders.
- Inspection create/list/detail backend and UI.
- Inspection response upsert and completion flow.
- Mock dashboard with charts.
- Mock NC Kanban/list/detail with 5W2H.
- Mock report preview/print/PDF toast.
- Mock norms, team, settings/offline simulation.
- Shared formatters for dates and CNPJ.
- Shared status badge mapping for legacy UI statuses.
- Custom SSR error wrapper in `src/server.ts` and request middleware in `src/start.ts`.

---

# Pending Features

- Remove sensitive console logs from login/auth.
- Add authorization checks to all Server Functions, not only create inspection.
- Replace client-supplied `createdById` for company/checklist creation with authenticated session user.
- User CRUD and role management.
- Company create/edit/delete UI.
- Checklist create/edit/delete UI.
- Checklist item CRUD, ordering, and standard association.
- Standards seed and API/UI integration.
- Automatic non-conformity creation from non-compliant responses.
- Non-conformity backend, services, repositories, hooks, UI integration.
- Corrective action backend/UI.
- Evidence upload architecture and Cloudinary integration.
- Report generation, persistence, and PDF/download implementation.
- Dashboard aggregate backend and integration.
- Real team/users screen.
- Offline IndexedDB/Dexie layer, queue, conflict handling, PWA/service worker.
- Required item validation before finishing an inspection.
- Persist signature if signature is part of final scope.
- Tests. No automated test suite was found.
- Documentation updates to reflect backend progress and remaining mock modules.

---

# Known Bugs

Confirmed or strongly indicated by code:

- Login logs credentials:
  - `src/routes/login.tsx` logs the payload sent to the Server Function.
  - `src/lib/api/auth.functions.ts` logs the payload received by the Server Function.
  - This includes the password and is a security bug.
- Several Server Functions do not require authenticated user/session:
  - Company/checklist create/update/delete/list/get, inspection get/list/delete, response save/list/finish are callable without role checks at the function layer.
  - The `_app` route guard protects normal UI navigation, but server-side authorization should not rely on frontend routing.
- Company and checklist creation schemas accept `createdById` from the client. This can allow record attribution spoofing if called directly.
- Non-compliant inspection responses do not create a `NonConformity` database record, despite documentation and older prototype behavior saying they should.
- Finishing an inspection does not validate that required checklist items are answered.
- Inspection completion does not persist the drawn signature.
- Dashboard "Proximas inspeções" links use mock IDs against the real `/inspecoes/$id` route, which can lead to "Inspeção não encontrada" when mock IDs do not exist in the database.
- Reports still read mock inspections, so real completed inspections do not appear in `/relatorios`.
- `README.md`, `GUIA_USUARIO.md`, and `MAPA_DE_NAVEGACAO.md` still describe the older all-mock prototype in several places.
- `CODING_STANDARDS.md` is empty, despite being referenced as a standards document.

Temporary workarounds:

- Use seeded admin credentials for login: `admin@demo.com` / `Admin@123`.
- Use seeded data for real integrated flows.
- Mock-only modules continue to work through `localStorage` key `sst-store-v1`.

Technical debt:

- Repeated `JsonValue`, `ServerResult`, `toJsonValue`, and `toServerResult` code across Server Function files.
- Mixed domain models: backend/Prisma uses English models; mock UI uses Portuguese legacy types in `src/types/sst.ts`.
- Some code uses `any` in frontend (`Dashboard` KPI icon prop), despite project guidance forbidding `any`.
- No automated tests found.
- Generated Prisma client is committed under `src/generated/prisma`; future agents should understand it is generated and avoid manual edits.

---

# Technical Decisions

- Keep TanStack Start for this delivery because the frontend was generated/built on this base; future migration to Next.js is planned but not current scope.
- Use layered architecture: React Query -> Server Functions -> Services -> Repositories -> Prisma -> PostgreSQL.
- Use Prisma ORM 7 as source of truth for the physical database model.
- Use PostgreSQL, planned hosting on Neon.
- Use server-managed sessions instead of Neon Auth. Auth must remain application-owned and provider-independent.
- Use bcrypt for passwords.
- Use Zod for all input validation.
- Use React Query for server state, cache, invalidation, loading/error states.
- Use English names for domain code/database (`Company`, `Inspection`) and Portuguese labels in UI (`Empresa`, `Inspeção`).
- Keep Nitro in `vite.config.ts` with Vercel preset unless deploy is revalidated.
- Offline First remains a future architectural goal, but full IndexedDB/Dexie sync is intentionally not implemented yet.
- Evidence upload is modeled but Cloudinary upload is future work.
- Prefer soft delete where implemented (`deletedAt`) to preserve audit/history.
- Avoid direct SQL unless justified; use Prisma.
- Preserve existing frontend layout and integrate gradually rather than rewriting screens.
- Do not edit `src/routeTree.gen.ts` manually.
- Do not access Prisma outside repositories.

---

# Coding Standards

Observed and documented standards:

- TypeScript strict is enabled.
- Use path alias `@/*` for `src/*`.
- Domain/backend code uses English naming.
- UI text is Portuguese.
- Server input validation uses Zod schemas under `src/server/schemas`.
- Business rules belong in `src/server/services`.
- Persistence belongs in `src/server/repositories`.
- Server Functions live in `src/lib/api`.
- React Query hooks live in `src/hooks`.
- Query keys are centralized in `src/lib/api/*.query-keys.ts`.
- Shared formatting belongs in `src/lib/format.ts`.
- Shared class merging uses `cn()` in `src/lib/utils.ts`.
- UI primitives are in `src/components/ui`, configured by `components.json`.
- Main UI screens use `PageHeader`, `Card`, `Button`, `Badge`, Radix/shadcn components, and Lucide icons.
- Avoid `any`; use explicit interfaces/types.
- Keep functions small and responsibilities separated.
- Prefer small incremental implementation steps.
- Do not remove approved layouts or rewrite the frontend unnecessarily.

Important caveat:

- `CODING_STANDARDS.md` is empty, so the effective standards are spread across `AGENTS.md`, `AI/*.md`, `TECH_DECISIONS.md`, and the current code patterns.

---

# Current Priorities

According to `IMPLEMENTATION_PLAN.md`, `TASKS.md`, and the actual code state, the next practical priorities are:

1. Harden authentication/security:
   - Remove credential logs.
   - Require authenticated user in server mutations and sensitive reads.
   - Stop accepting `createdById` from the client.
2. Finish real integration for existing partially integrated modules:
   - Company create/edit/delete UI.
   - Checklist create/edit/delete UI.
   - Checklist items CRUD and rendering.
3. Implement standards:
   - Seed official NRs.
   - Add repository/service/schema/functions/hooks.
   - Associate standards to checklist items.
4. Complete inspection flow:
   - Required item validation.
   - Create NC records from `NON_COMPLIANT` responses.
   - Decide whether/how to persist signatures.
5. Implement non-conformities and corrective actions with Prisma.
6. Replace dashboard and reports mocks with real backend data.
7. Prepare evidence upload structure and then Cloudinary if time allows.
8. Add tests or at least repeatable validation scripts for critical flows.
9. Update outdated documentation.

---

# Next Recommended Steps

1. Security cleanup:
   - Remove `console.info` credential logs.
   - Add `requireAuthenticatedUser()` to mutating Server Functions.
   - Derive `createdById` from session in company/checklist creation.
2. Company UI:
   - Add create/edit dialogs/forms using React Hook Form + Zod.
   - Wire `useCreateCompany`, `useUpdateCompany`, `useDeleteCompany`.
3. Checklist items:
   - Add Prisma-backed repository/service/schema/functions/hooks for `ChecklistItem`.
   - Render checklist items in `/checklists/$id`.
   - Support create/update/delete/reorder.
4. Standards:
   - Seed standards.
   - Add list/search API.
   - Add item-standard association.
5. Inspection completion:
   - Validate required responses.
   - Persist non-conformities from non-compliant responses.
6. Non-conformities:
   - Implement backend CRUD/status changes.
   - Replace `/nao-conformidades` mock store.
7. Corrective actions:
   - Implement 5W2H/corrective action persistence.
8. Reports:
   - Generate report from real inspection/response/NC data.
   - Persist `Report` and add PDF/export strategy.
9. Dashboard:
   - Add aggregate service and React Query hook.
10. Offline preparation:
   - Introduce IndexedDB/Dexie abstraction only after core online flow is stable.
11. Documentation:
   - Update README and user docs to distinguish real integrated flows from remaining prototype flows.

---

# AI Instructions

Future AI assistants must always read these first before code changes:

1. `AGENTS.md`
2. `AI_PROJECT_CONTEXT.md`
3. `PROJECT_CONTEXT.md`
4. `IMPLEMENTATION_PLAN.md`
5. `TASKS.md`
6. `TECH_DECISIONS.md`
7. The relevant `AI/*.md` file for the task, especially `Architecture.md`, `Database.md`, `BusinessRules.md`, `API.md`, `Offline.md`
8. Relevant route/server README files when editing those areas.

Rules that must never be broken:

- Do not access Prisma from React components, routes, hooks, or Server Functions directly. Use Service -> Repository -> Prisma.
- Do not put business rules in repositories or UI components.
- Do not trust client input; validate with Zod.
- Do not store plaintext passwords.
- Do not expose passwords or internal Prisma/SQL details in responses.
- Do not edit generated files manually (`src/routeTree.gen.ts`, `src/generated/prisma/*`) unless the user explicitly asks and understands it is generated.
- Do not rewrite the frontend or approved layouts just to integrate data.
- Do not move files or change routes without necessity.
- Do not implement multiple unrelated modules in one step.
- Do not remove Nitro/Vercel configuration without validating deploy.
- Do not introduce schema changes without checking Prisma schema, migration, and database documentation.

Patterns to preserve:

- Server Functions in `src/lib/api`.
- Zod schemas in `src/server/schemas`.
- Services in `src/server/services`.
- Repositories in `src/server/repositories`.
- React Query hooks in `src/hooks`.
- Query keys in `src/lib/api/*.query-keys.ts`.
- `Result<T>` response style for implemented backend functions.
- Soft delete where historical/audit data matters.
- Portuguese interface text with English domain code.

Things to avoid:

- Adding `any`.
- Creating duplicate folders or parallel architectures.
- Creating Next.js-style `pages` or `app` directories.
- Mixing mock domain types with Prisma types in newly integrated code.
- Adding offline synchronization before online persistence is correct.
- Treating old mock documentation as fully current without checking code.
- Modifying `.env`; use `.env.example` for documented variable changes.

Files not to modify lightly:

- `prisma/schema.prisma`
- `prisma/migrations/*`
- `vite.config.ts`
- `src/server/prisma/client.ts`
- `src/routes/__root.tsx`
- `src/routes/_app.tsx`
- `src/components/layout/AppShell.tsx`
- `src/routeTree.gen.ts`
- `src/generated/prisma/*`
- Existing academic documentation in `Documentation/` unless the task is documentation maintenance.

When uncertain:

- Inspect the current code first.
- Prefer the existing architecture over new abstractions.
- State documentation/code divergences explicitly.
- Implement the smallest coherent next step and verify it.
