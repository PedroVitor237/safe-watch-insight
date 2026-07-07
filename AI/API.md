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
- **Regras relacionadas:** `createdById` vem da sessão; CNPJ é normalizado para dígitos; CNPJ ativo deve ser único.
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
- **Regras relacionadas:** `createdById` vem da sessão; checklist pode ser template ou personalizado.
- **Exemplo de chamada:**

```ts
await createChecklist({ data: payload });
```

- **Exemplo de resposta:** checklist criado com `items`.
- **Erros possíveis:** `401`, `422`, `500`.

### `updateChecklist`

- **Finalidade:** atualizar dados do checklist.
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
- **Regras relacionadas:** exige ao menos um campo; valida existência.
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
- **Regras relacionadas:** retorna checklist com itens.
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
- **Regras relacionadas:** lista apenas registros não excluídos.
- **Exemplo de chamada:**

```ts
await listChecklists({ data: { isActive: true } });
```

- **Exemplo de resposta:** resultado paginado.
- **Erros possíveis:** `401`, `422`, `500`.

---

## Checklist Items

### `createChecklistItem`

- **Finalidade:** criar item em um checklist.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-item.functions.ts`
- **Autenticação:** exige sessão.
- **Body:**

```json
{
  "checklistId": "uuid",
  "description": "Verificar uso adequado de EPIs.",
  "orderIndex": 1,
  "isRequired": true
}
```

- **Validação:** `createChecklistItemSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** checklist deve existir; se `orderIndex` não for informado, usa o próximo índice disponível.
- **Exemplo de chamada:**

```ts
await createChecklistItem({ data: { checklistId, description, isRequired: true } });
```

- **Exemplo de resposta:** item criado.
- **Erros possíveis:** `401`, `404` checklist não encontrado, `422`, `500`.

### `updateChecklistItem`

- **Finalidade:** atualizar item de checklist.
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
    "orderIndex": 2
  }
}
```

- **Validação:** `updateChecklistItemInputSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** `id` no body.
- **Regras relacionadas:** item deve existir; exige ao menos um campo.
- **Exemplo de chamada:**

```ts
await updateChecklistItem({ data: { id, data: { description: "Nova descrição" } } });
```

- **Exemplo de resposta:** item atualizado.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `deleteChecklistItem`

- **Finalidade:** excluir fisicamente item de checklist.
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
- **Regras relacionadas:** impede exclusão se o item já possui respostas de inspeção.
- **Exemplo de chamada:**

```ts
await deleteChecklistItem({ data: { id } });
```

- **Exemplo de resposta:** item excluído.
- **Erros possíveis:** `401`, `404`, `409` item possui respostas, `422`, `500`.

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
- **Regras relacionadas:** checklist deve existir; itens são retornados ordenados por `orderIndex`.
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
  "inspectionDate": "2026-07-07T10:00:00.000Z",
  "status": "PLANNED",
  "syncStatus": "SYNCED",
  "notes": "Observações iniciais"
}
```

- **Validação:** `createInspectionSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Regras relacionadas:** usuário vem da sessão; empresa e checklist devem existir.
- **Exemplo de chamada:**

```ts
await createInspection({ data: payload });
```

- **Exemplo de resposta:** inspeção criada com relações de usuário, empresa, checklist e respostas.
- **Erros possíveis:** `401`, `404` empresa/checklist não encontrado, `422`, `500`.

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
- **Regras relacionadas:** retorna inspeção com usuário, empresa, checklist, itens e respostas.
- **Exemplo de chamada:**

```ts
await getInspectionById({ data: { id } });
```

- **Exemplo de resposta:** inspeção encontrada.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

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
- **Regras relacionadas:** lista apenas inspeções não excluídas.
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

- **Exemplo de resposta:** lista de respostas com item de checklist.
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
  "checklistItemId": "uuid",
  "status": "COMPLIANT",
  "observation": "Observação opcional"
}
```

- **Validação:** `saveInspectionResponseSchema`.
- **Query parameters:** não se aplica.
- **Path parameters:** não se aplica.
- **Status aceitos:** `COMPLIANT`, `NON_COMPLIANT`, `NOT_APPLICABLE`.
- **Regras relacionadas:** item precisa pertencer ao checklist da inspeção; resposta é única por inspeção + item; inspeção `PLANNED` passa para `IN_PROGRESS` ao salvar resposta.
- **Exemplo de chamada:**

```ts
await saveInspectionResponse({
  data: {
    inspectionId,
    checklistItemId,
    status: "NON_COMPLIANT",
    observation: "Extintor vencido"
  }
});
```

- **Exemplo de resposta:** resposta criada ou atualizada.
- **Erros possíveis:** `401`, `404` inspeção ou item não encontrado para a inspeção, `422`, `500`.

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
- **Regras relacionadas:** inspeção deve existir; status passa para `COMPLETED`.
- **Limitação atual:** não valida se todos os itens obrigatórios foram respondidos e não persiste assinatura.
- **Exemplo de chamada:**

```ts
await finishInspection({ data: { inspectionId } });
```

- **Exemplo de resposta:** inspeção atualizada para `COMPLETED`.
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
- Standards.
- Associação de normas a itens.
- NonConformities.
- CorrectiveActions.
- Evidence/upload.
- Reports.
- Dashboard real.
- Sincronização offline.

Esses módulos devem seguir o mesmo fluxo arquitetural quando forem implementados.
