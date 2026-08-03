# API da Plataforma

Este documento descreve a API atualmente implementada no **Safe Watch Insight** para a entrega da Atividade 2.

A implementação atual usa **TanStack Start Server Functions**, não endpoints REST manuais. Por isso, os exemplos abaixo usam chamada de função no frontend:

```ts
await nomeDaFuncao({ data: payload });
```

Os métodos HTTP informados são os métodos configurados no `createServerFn`. A rota física é gerada internamente pelo TanStack Start e não deve ser tratada como contrato REST público.

---

# Arquitetura

Fluxo oficial:

```text
Tela
-> React Query
-> Server Function
-> Service
-> Repository
-> Prisma
-> PostgreSQL
```

Regras:

- Server Functions ficam em `src/lib/api`.
- Validações ficam em `src/server/schemas`.
- Regras de negócio ficam em `src/server/services`.
- Persistência fica em `src/server/repositories`.
- Prisma nunca deve ser acessado diretamente por telas, hooks ou Server Functions.

---

# Formato de Resposta

Sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "message": "Descrição do erro.",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

Erro de validação:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 422,
  "errors": []
}
```

Observação: em Server Functions, o transporte HTTP pode não refletir diretamente o `statusCode` lógico do corpo de resposta. Para tratamento no frontend, usar `success`, `message`, `code` e `statusCode`.

---

# Status Codes Lógicos

- `200`: operação executada com sucesso.
- `401`: usuário não autenticado ou credenciais inválidas.
- `404`: recurso não encontrado.
- `409`: conflito de regra de negócio.
- `422`: erro de validação.
- `500`: erro interno não tratado.

---

# Autenticação

A autenticação atual usa sessão do TanStack Start com cookie HTTP-only:

- Nome do cookie: `safe_watch_session`.
- Duração: 8 horas.
- Conteúdo da sessão: `userId`.
- Senhas são armazenadas com hash bcrypt.
- `SESSION_SECRET` é obrigatório em produção.

Todas as Server Functions de negócio exigem sessão autenticada. Exceções:

- `login`
- `logout`
- `getCurrentSession`
- `getGreeting` exemplo técnico

---

# Paginação, Filtros e Ordenação

Listagens usam `listQuerySchema`:

```json
{
  "page": 1,
  "pageSize": 20,
  "search": "texto",
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

Regras:

- `page`: inteiro positivo, padrão `1`.
- `pageSize`: inteiro positivo, máximo `100`, padrão `20`.
- `sortOrder`: `asc` ou `desc`, padrão `desc`.

Resposta paginada:

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

---

# Server Functions Implementadas

## Auth

### `login`

- **Finalidade:** autenticar usuário por e-mail e senha e criar sessão.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/auth.functions.ts`
- **Autenticação:** não exige sessão prévia.
- **Body:**

```json
{
  "email": "admin@demo.com",
  "password": "Admin@123"
}
```

- **Validação:** `loginSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** normaliza e-mail; compara senha com bcrypt; não retorna password.
- **Exemplo de chamada:**

```ts
await login({ data: { email: "admin@demo.com", password: "Admin@123" } });
```

- **Exemplo de resposta:**

```json
{
  "success": true,
  "data": {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Administrador",
    "email": "admin@demo.com",
    "role": "ADMIN"
  }
}
```

- **Erros possíveis:** `401` credenciais inválidas; `422` payload inválido; `500` erro interno.

### `getCurrentSession`

- **Finalidade:** obter usuário autenticado da sessão atual.
- **Método:** `GET`
- **Arquivo:** `src/lib/api/auth.functions.ts`
- **Autenticação:** usa sessão se existir.
- **Body:** não possui.
- **Validação:** não possui input.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** limpa a sessão se o usuário da sessão não existir mais.
- **Exemplo de chamada:**

```ts
await getCurrentSession();
```

- **Exemplo de resposta:**

```json
{
  "success": true,
  "data": {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Administrador",
    "email": "admin@demo.com",
    "role": "ADMIN"
  }
}
```

- **Erros possíveis:** `401` sem sessão válida; `404` usuário não encontrado; `500` erro interno.

### `logout`

- **Finalidade:** encerrar a sessão atual.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/auth.functions.ts`
- **Autenticação:** não exige sessão válida, apenas tenta limpar o cookie.
- **Body:** não possui.
- **Validação:** não possui input.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** remove sessão HTTP-only.
- **Exemplo de chamada:**

```ts
await logout();
```

- **Exemplo de resposta:**

```json
{
  "success": true,
  "data": null,
  "message": "Logged out."
}
```

- **Erros possíveis:** `500` erro ao limpar sessão.

---

## Companies

### `createCompany`

- **Finalidade:** cadastrar empresa.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/company.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "corporateName": "Empresa Exemplo Ltda.",
  "tradeName": "Empresa Exemplo",
  "cnpj": "12.345.678/0001-90",
  "cnae": "4120-4/00",
  "riskLevel": 3,
  "employeeCount": 85,
  "address": "Rua Exemplo, 100",
  "notes": "Observação opcional"
}
```

- **Validação:** `createCompanyClientSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** `createdById` vem da sessão; CNPJ é normalizado para dígitos; o CNPJ deve ser único inclusive entre registros excluídos logicamente, preservando a identidade e o histórico da empresa.
- **Exemplo de chamada:**

```ts
await createCompany({ data: payload });
```

- **Exemplo de resposta:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "corporateName": "Empresa Exemplo Ltda.",
    "cnpj": "12345678000190",
    "riskLevel": 3,
    "employeeCount": 85
  }
}
```

- **Erros possíveis:** `401` não autenticado; `409` CNPJ já cadastrado; `422` validação; `500` erro interno.

### `updateCompany`

- **Finalidade:** atualizar empresa.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/company.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid",
  "data": {
    "tradeName": "Novo Nome",
    "employeeCount": 100
  }
}
```

- **Validação:** `updateCompanyInputSchema` com `id` UUID e `updateCompanySchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` é enviado no body da Server Function.
- **Regras relacionadas:** exige ao menos um campo; valida existência; preserva CNPJ único.
- **Exemplo de chamada:**

```ts
await updateCompany({ data: { id, data: { tradeName: "Novo Nome" } } });
```

- **Exemplo de resposta:** empresa atualizada.
- **Erros possíveis:** `401`, `404` empresa não encontrada, `409` CNPJ duplicado, `422`, `500`.

### `deleteCompany`

- **Finalidade:** excluir logicamente uma empresa.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/company.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid"
}
```

- **Validação:** `companyIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** usa soft delete (`deletedAt`).
- **Exemplo de chamada:**

```ts
await deleteCompany({ data: { id } });
```

- **Exemplo de resposta:** empresa com `deletedAt` preenchido.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `getCompanyById`

- **Finalidade:** consultar empresa ativa por ID.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/company.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid"
}
```

- **Validação:** `companyIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** não retorna empresas excluídas logicamente.
- **Exemplo de chamada:**

```ts
await getCompanyById({ data: { id } });
```

- **Exemplo de resposta:** empresa encontrada.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `listCompanies`

- **Finalidade:** listar empresas ativas.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/company.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "page": 1,
  "pageSize": 20,
  "search": "demo",
  "sortBy": "corporateName",
  "sortOrder": "asc"
}
```

- **Validação:** `companyClientFiltersSchema`.
- **Query parameters:** enviados no body da Server Function.
- **Path parameters:** não se aplica.
- **Filtros:** `search`, `page`, `pageSize`, `sortBy`, `sortOrder`.
- **Ordenação:** `corporateName`, `tradeName`, `cnae`, `riskLevel`, `employeeCount`, `createdAt`, `updatedAt`.
- **Regras relacionadas:** lista apenas registros ativos.
- **Exemplo de chamada:**

```ts
await listCompanies({ data: { page: 1, pageSize: 20 } });
```

- **Exemplo de resposta:** resultado paginado.
- **Erros possíveis:** `401`, `422`, `500`.

---

## Checklists

### `createChecklist`

- **Finalidade:** criar checklist.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "title": "Checklist NR-06",
  "description": "Verificações de EPI",
  "isTemplate": true,
  "isActive": true
}
```

- **Validação:** `createChecklistClientSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** `createdById` vem da sessão; checklist pode ser template ou personalizado; a criação é atômica e também cria a versão `DRAFT` número 1 com o mesmo título e descrição.
- **Exemplo de chamada:**

```ts
await createChecklist({ data: payload });
```

- **Exemplo de resposta:** checklist criado com sua versão draft inicial.
- **Erros possíveis:** `401`, `422`, `500`.

### `updateChecklist`

- **Finalidade:** atualizar catálogo e/ou conteúdo versionado do checklist.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid",
  "data": {
    "title": "Checklist atualizado",
    "isActive": true
  }
}
```

- **Validação:** `updateChecklistInputSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** exige ao menos um campo e valida existência. `title` e `description` são gravados no draft; se ele não existir, o Service clona a versão publicada ou retirada mais recente para o próximo número. `isTemplate` e `isActive` atualizam a identidade do checklist. Uma versão publicada nunca é alterada.
- **Exemplo de chamada:**

```ts
await updateChecklist({ data: { id, data: { title: "Novo título" } } });
```

- **Exemplo de resposta:** checklist atualizado.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `deleteChecklist`

- **Finalidade:** excluir logicamente um checklist.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid"
}
```

- **Validação:** `checklistIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** usa soft delete (`deletedAt`).
- **Exemplo de chamada:**

```ts
await deleteChecklist({ data: { id } });
```

- **Exemplo de resposta:** checklist com `deletedAt` preenchido.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `getChecklistById`

- **Finalidade:** consultar checklist ativo por ID.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid"
}
```

- **Validação:** `checklistIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** retorna a identidade do checklist, suas versões e os itens/metadados normativos de cada versão. O frontend usa o draft para manutenção e versões publicadas para seleção.
- **Exemplo de chamada:**

```ts
await getChecklistById({ data: { id } });
```

- **Exemplo de resposta:** checklist encontrado.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `listChecklists`

- **Finalidade:** listar checklists ativos.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "page": 1,
  "pageSize": 20,
  "search": "NR",
  "isTemplate": true,
  "isActive": true,
  "sortBy": "title",
  "sortOrder": "asc"
}
```

- **Validação:** `checklistClientFiltersSchema`.
- **Query parameters:** enviados no body.
- **Path parameters:** não se aplica.
- **Filtros:** `search`, `isTemplate`, `isActive`, paginação e ordenação.
- **Ordenação:** `title`, `isTemplate`, `isActive`, `createdAt`, `updatedAt`.
- **Regras relacionadas:** lista apenas registros não excluídos; inclui resumo das versões, status e contagem de itens sem carregar todo o conteúdo de cada item.
- **Exemplo de chamada:**

```ts
await listChecklists({ data: { isActive: true } });
```

- **Exemplo de resposta:** resultado paginado.
- **Erros possíveis:** `401`, `422`, `500`.

---

## Checklist Versions

### `listChecklistVersions`

- **Finalidade:** listar, em ordem decrescente, todas as versões de um checklist.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-version.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "checklistId": "uuid" }`.
- **Validação:** `checklistVersionsByChecklistSchema`.
- **Resposta:** versões com itens, linhagem e metadados normativos copiados.
- **Regras relacionadas:** o checklist deve existir e não estar excluído.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `publishChecklistVersion`

- **Finalidade:** publicar o draft atual de um checklist.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-version.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "checklistId": "uuid" }`.
- **Validação:** `publishChecklistVersionSchema`.
- **Regras relacionadas:** exige draft; calcula SHA-256 do conteúdo canônico; registra autor e data; usa controle otimista para impedir corrida entre edição e publicação; a versão publicada torna-se imutável.
- **Resposta:** versão publicada com seus itens.
- **Erros possíveis:** `401`, `404`, `409` draft ausente ou conflito concorrente, `422`, `500`.

### `retireChecklistVersion`

- **Finalidade:** retirar uma versão publicada de uso futuro.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-version.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "checklistId": "uuid", "versionId": "uuid" }`.
- **Validação:** `checklistVersionIdSchema`.
- **Regras relacionadas:** somente versões `PUBLISHED` podem ser retiradas; a retirada não altera snapshots nem inspeções existentes.
- **Resposta:** versão com status `RETIRED`.
- **Erros possíveis:** `401`, `404`, `409`, `422`, `500`.

---

## Checklist Items

### `createChecklistItem`

- **Finalidade:** criar item na versão draft de um checklist.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-item.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "checklistId": "uuid",
  "description": "Verificar uso adequado de EPIs.",
  "orderIndex": 1,
  "isRequired": true,
  "standardIds": ["uuid-da-nr-6"]
}
```

- **Validação:** `createChecklistItemSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** checklist deve existir; o Service usa ou cria o próximo draft; se `orderIndex` não for informado, usa o próximo índice disponível; todas as normas devem existir e estar ativas; tipo, código, título, resumo e URL são copiados para a associação da versão.
- **Exemplo de chamada:**

```ts
await createChecklistItem({ data: { checklistId, description, isRequired: true } });
```

- **Exemplo de resposta:** item criado.
- **Erros possíveis:** `401`, `404` checklist não encontrado, `422`, `500`.

### `updateChecklistItem`

- **Finalidade:** atualizar um item da versão de trabalho.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-item.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid",
  "data": {
    "description": "Nova descrição",
    "isRequired": false,
    "orderIndex": 2,
    "standardIds": ["uuid-da-nr-6", "uuid-da-nr-1"]
  }
}
```

- **Validação:** `updateChecklistItemInputSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** `id` identifica um `ChecklistVersionItem`. Se o item recebido pertence a versão publicada/retirada, o Service cria o próximo draft e localiza o item derivado pela linhagem antes de editar. Exige ao menos um campo; `standardIds` substitui atomicamente as cópias normativas; a versão é tocada para proteger publicação concorrente.
- **Exemplo de chamada:**

```ts
await updateChecklistItem({ data: { id, data: { description: "Nova descrição" } } });
```

- **Exemplo de resposta:** item atualizado.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `deleteChecklistItem`

- **Finalidade:** remover item do draft sem afetar versões ou inspeções anteriores.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-item.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid"
}
```

- **Validação:** `checklistItemIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** `id` identifica um `ChecklistVersionItem`; se necessário, o Service deriva o próximo draft e remove o item correspondente somente nele. Versões publicadas, snapshots e respostas permanecem intactos.
- **Exemplo de chamada:**

```ts
await deleteChecklistItem({ data: { id } });
```

- **Exemplo de resposta:** item excluído.
- **Erros possíveis:** `401`, `404`, `409` conflito de versão/ordem, `422`, `500`.

### `listChecklistItems`

- **Finalidade:** listar itens de um checklist.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-item.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "checklistId": "uuid"
}
```

- **Validação:** `checklistItemsByChecklistIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `checklistId` no body.
- **Regras relacionadas:** checklist deve existir; retorna os itens do draft atual ou, se não houver draft, da versão publicada/retirada mais recente, ordenados por `orderIndex` e com metadados normativos copiados.
- **Exemplo de chamada:**

```ts
await listChecklistItems({ data: { checklistId } });
```

- **Exemplo de resposta:** lista de itens.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

---

## Inspections

### `createInspection`

- **Finalidade:** criar inspeção.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/inspection.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "companyId": "uuid",
  "checklistId": "uuid",
  "checklistVersionId": "uuid-publicada-opcional",
  "inspectionDate": "2026-07-07T10:00:00.000Z",
  "notes": "Observações iniciais"
}
```

- **Validação:** `createInspectionSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** usuário vem da sessão; empresa e checklist devem existir; o checklist precisa estar ativo; a versão informada deve pertencer ao checklist e estar `PUBLISHED`. Sem `checklistVersionId`, usa a versão publicada mais recente. O hash do formato atual é conferido antes da gravação. Inspeção, snapshot, itens e normas são criados atomicamente. O servidor define `PLANNED`, `SYNCED`, origem `INSPECTION_CREATION` e integridade `VERIFIED`.
- **Exemplo de chamada:**

```ts
await createInspection({ data: payload });
```

- **Exemplo de resposta:** inspeção com usuário, empresa, identidade do checklist, versão publicada, snapshot completo e respostas.
- **Erros possíveis:** `401`, `404` empresa/checklist/versão não encontrado, `409` checklist inativo, versão não publicada ou hash inválido, `422`, `500`.

### `getInspectionById`

- **Finalidade:** consultar inspeção ativa por ID.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/inspection.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid"
}
```

- **Validação:** `inspectionIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** retorna inspeção com usuário, empresa, identidade do checklist, versão de origem, snapshot, itens do snapshot, metadados normativos copiados e respostas. Snapshot e versão ausentes geram conflito, pois o backend não reconstrói histórico a partir do catálogo mutável.
- **Exemplo de chamada:**

```ts
await getInspectionById({ data: { id } });
```

- **Exemplo de resposta:** inspeção encontrada com contexto histórico.
- **Erros possíveis:** `401`, `404`, `409` snapshot histórico indisponível, `422`, `500`.

### `listInspections`

- **Finalidade:** listar inspeções ativas.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/inspection.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "page": 1,
  "pageSize": 20,
  "search": "demo",
  "status": "PLANNED",
  "syncStatus": "SYNCED",
  "sortBy": "inspectionDate",
  "sortOrder": "desc"
}
```

- **Validação:** `inspectionFiltersSchema`.
- **Query parameters:** enviados no body.
- **Path parameters:** não se aplica.
- **Filtros:** `userId`, `companyId`, `checklistId`, `status`, `syncStatus`, `search`, paginação e ordenação.
- **Ordenação:** `inspectionDate`, `status`, `syncStatus`, `createdAt`, `updatedAt`.
- **Regras relacionadas:** lista apenas inspeções não excluídas; pesquisa por empresa, título capturado no snapshot e notas. A representação do checklist vem do snapshot, não do título atual do catálogo.
- **Exemplo de chamada:**

```ts
await listInspections({ data: { status: "PLANNED" } });
```

- **Exemplo de resposta:** resultado paginado.
- **Erros possíveis:** `401`, `422`, `500`.

### `deleteInspection`

- **Finalidade:** excluir logicamente inspeção.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/inspection.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "id": "uuid"
}
```

- **Validação:** `inspectionIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** usa soft delete (`deletedAt`).
- **Exemplo de chamada:**

```ts
await deleteInspection({ data: { id } });
```

- **Exemplo de resposta:** inspeção com `deletedAt` preenchido.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

---

## Inspection Responses

### `listInspectionResponses`

- **Finalidade:** listar respostas de uma inspeção.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/inspection-response.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "inspectionId": "uuid"
}
```

- **Validação:** `inspectionResponseIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `inspectionId` no body.
- **Regras relacionadas:** inspeção deve existir.
- **Exemplo de chamada:**

```ts
await listInspectionResponses({ data: { inspectionId } });
```

- **Exemplo de resposta:** lista de respostas com item e normas do snapshot.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `saveInspectionResponse`

- **Finalidade:** criar ou atualizar resposta de item da inspeção.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/inspection-response.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "inspectionId": "uuid",
  "snapshotItemId": "uuid",
  "status": "COMPLIANT",
  "observation": "Observação opcional"
}
```

- **Validação:** `saveInspectionResponseSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Status aceitos:** `COMPLIANT`, `NON_COMPLIANT`, `NOT_APPLICABLE`.
- **Regras relacionadas:** deve ser enviado exatamente um entre `snapshotItemId` e o `checklistItemId` legado. O item precisa pertencer ao snapshot da inspeção; o identificador legado é resolvido para esse snapshot antes da persistência. A resposta é única por inspeção + item do snapshot; inspeção `PLANNED` passa para `IN_PROGRESS`; validação de estado, resposta e criação/restauração/arquivamento da não conformidade são atômicos. A descrição e as normas históricas vêm do snapshot. Inspeções concluídas ou canceladas não aceitam alterações.
- **Exemplo de chamada:**

```ts
await saveInspectionResponse({
  data: {
    inspectionId,
    snapshotItemId,
    status: "NON_COMPLIANT",
    observation: "Extintor vencido",
  },
});
```

- **Exemplo de resposta:** resposta criada ou atualizada.
- **Erros possíveis:** `401`, `404` inspeção ou item não encontrado para a inspeção, `409` inspeção não editável ou conflito concorrente, `422`, `500`.

### `finishInspection`

- **Finalidade:** concluir inspeção.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/inspection-response.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "inspectionId": "uuid"
}
```

- **Validação:** `inspectionResponseIdSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `inspectionId` no body.
- **Regras relacionadas:** inspeção e snapshot devem existir; todos os itens obrigatórios do snapshot devem possuir resposta por `snapshotItemId`; status passa para `COMPLETED`; inspeções concluídas ou canceladas não podem ser concluídas novamente.
- **Limitação atual:** assinatura digital ainda não está disponível na interface nem é persistida.
- **Exemplo de chamada:**

```ts
await finishInspection({ data: { inspectionId } });
```

- **Exemplo de resposta:** inspeção atualizada para `COMPLETED`.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

---

## Standards

### `getStandardById`

- **Finalidade:** consultar uma norma por ID.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/standard.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid" }`.
- **Validação:** `standardIdSchema`.
- **Resposta:** norma com tipo, código, título, resumo, fonte oficial e vigência.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `listStandards`

- **Finalidade:** listar e pesquisar normas.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/standard.functions.ts`
- **Autenticação:** exige sessão.
- **Filtros:** `search`, `type`, `isActive`, paginação e ordenação por `code`, `title` ou `type`.
- **Validação:** `standardFiltersSchema`.
- **Resposta:** resultado paginado.
- **Erros possíveis:** `401`, `422`, `500`.

---

## Non-Conformities

### `createNonConformity`

- **Finalidade:** criar manualmente uma não conformidade para uma resposta não conforme que ainda não possua registro.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/non-conformity.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `inspectionResponseId`, `description`, `severity`, `dueDate` opcional e `status`.
- **Validação:** `createNonConformitySchema`.
- **Regras relacionadas:** a resposta deve existir, estar `NON_COMPLIANT` e não pode possuir outra não conformidade.
- **Erros possíveis:** `401`, `404`, `409`, `422`, `500`.

### `getNonConformityById`

- **Finalidade:** consultar uma não conformidade ativa com inspeção, empresa, usuário, item, normas, ações corretivas e evidências.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/non-conformity.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid" }`.
- **Validação:** `nonConformityIdSchema`.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `listNonConformities`

- **Finalidade:** listar não conformidades ativas.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/non-conformity.functions.ts`
- **Autenticação:** exige sessão.
- **Filtros:** `search`, `status`, `severity`, `companyId`, `inspectionId`, `standardId`, paginação e ordenação.
- **Validação:** `nonConformityFiltersSchema`.
- **Regras relacionadas:** registros vencidos ainda abertos são marcados como `OVERDUE`.
- **Erros possíveis:** `401`, `422`, `500`.

### `updateNonConformity`

- **Finalidade:** editar descrição, severidade, prazo ou status.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/non-conformity.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid", "data": { ... } }`.
- **Validação:** `updateNonConformityInputSchema`.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `deleteNonConformity`

- **Finalidade:** arquivar uma não conformidade por soft delete.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/non-conformity.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid" }`.
- **Validação:** `nonConformityIdSchema`.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

---

## Corrective Actions

### `createCorrectiveAction`

- **Finalidade:** cadastrar ação corretiva para uma não conformidade.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/corrective-action.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `nonConformityId`, `description` (o quê), `why` (por quê), `location` (onde), `responsible` (quem), `dueDate` (quando), `method` (como), `estimatedCost` (quanto) e `status`.
- **Validação:** `createCorrectiveActionSchema`.
- **Regras relacionadas:** a não conformidade deve existir; a criação da primeira ação e a transição de uma NC aberta para `IN_PROGRESS` ocorrem na mesma transação.
- **Erros possíveis:** `401`, `404`, `409` alteração concorrente da NC, `422`, `500`.

### `listCorrectiveActions`

- **Finalidade:** listar ações ativas de uma não conformidade.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/corrective-action.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "nonConformityId": "uuid" }`.
- **Validação:** `correctiveActionsByNonConformitySchema`.
- **Regras relacionadas:** ações vencidas ainda pendentes são marcadas como `OVERDUE`.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `updateCorrectiveAction`

- **Finalidade:** editar ou concluir uma ação corretiva.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/corrective-action.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid", "data": { ... } }`.
- **Validação:** `updateCorrectiveActionInputSchema`.
- **Regras relacionadas:** `COMPLETED` preenche `completedAt`; reabertura remove `completedAt`.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `deleteCorrectiveAction`

- **Finalidade:** arquivar uma ação por soft delete.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/corrective-action.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid" }`.
- **Validação:** `correctiveActionIdSchema`.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

---

## Example

### `getGreeting`

- **Finalidade:** exemplo técnico de Server Function.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/example.functions.ts`
- **Autenticação:** não exige sessão.
- **Body:**

```json
{
  "name": "Ada"
}
```

- **Validação:** objeto com `name` string obrigatória.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** nenhuma regra de negócio de SST; não faz parte do fluxo principal.
- **Exemplo de chamada:**

```ts
await getGreeting({ data: { name: "Ada" } });
```

- **Exemplo de resposta:**

```json
{
  "greeting": "Hello, Ada!",
  "mode": "development"
}
```

- **Erros possíveis:** `422`, `500`.

---

# Funcionalidades Não Implementadas na API Atual

Os modelos existem no Prisma ou estão previstos na documentação, mas ainda não possuem Server Functions completas nesta entrega:

- Users CRUD.
- Evidence/upload.
- Reports.
- Dashboard real.
- Sincronização offline.

Esses módulos devem seguir o mesmo fluxo arquitetural quando forem implementados.
