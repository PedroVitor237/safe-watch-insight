# API da Plataforma

Este documento descreve a API implementada no **Safe Watch Insight**.
Arquitetura e contratos reconferidos na Fase 5 em 4 de outubro de 2026, sobre
`edc6170`, preservando regras/cópia da Fase 4 e modelo de banco da Fase 2.
Não é uma especificação de funcionalidades futuras. Regras de domínio e matriz
de acesso: [BusinessRules.md](./BusinessRules.md).

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
-> Hook / React Query ou chamada direta
-> Server Function
-> Validação Zod / sessão
-> Service
-> Repository
-> Prisma
-> PostgreSQL
```

Regras:

- Server Functions ficam em `src/lib/api`.
- Validações ficam em `src/server/schemas`.
- Services coordenam domínio/autorização/DTOs; schemas e helpers também validam/preparam contratos.
- Repositories encapsulam persistência, filtros de ownership, transações, deduplicação e revisão.
- Prisma nunca deve ser acessado diretamente por telas, hooks ou Server Functions.

Login chama a função diretamente; proteção de rota usa beforeLoad/getAppSession.
Respostas/conclusão no frontend usam fila Dexie mesmo online e depois retornam
a estas Functions. Essa camada local não torna o cliente autoridade do backend.
Diagrama e limites: [Architecture.md](./Architecture.md).

## Inventário da fronteira

São **48 Server Functions em 14 arquivos**, com **45 POST e 3 GET**. As 43
Functions de negócio exigem sessão; login/register são públicos, logout não
exige sessão válida, getCurrentSession resolve sessão se existir e getGreeting
é exemplo público. As 47 Functions de aplicação usam Result/ServerResult;
somente getGreeting retorna objeto diretamente. Não há CRUD universal por model.

| Arquivo em src/lib/api           | Quantidade | Grupo / delegação                                  | Método         |
| -------------------------------- | ---------: | -------------------------------------------------- | -------------- |
| auth.functions.ts                |          4 | UserService e helpers de sessão                    | 3 POST / 1 GET |
| company.functions.ts             |          5 | CompanyService                                     | POST           |
| checklist.functions.ts           |          7 | ChecklistService, incluindo cópia/template         | POST           |
| checklist-version.functions.ts   |          3 | ChecklistVersionService                            | POST           |
| checklist-item.functions.ts      |          4 | ChecklistItemService sobre itens de versão         | POST           |
| inspection.functions.ts          |          4 | InspectionService                                  | POST           |
| inspection-response.functions.ts |          3 | InspectionResponseService; inclui sync             | POST           |
| standard.functions.ts            |          2 | StandardService / catálogo compartilhado           | POST           |
| non-conformity.functions.ts      |          5 | NonConformityService                               | POST           |
| corrective-action.functions.ts   |          4 | CorrectiveActionService                            | POST           |
| evidence.functions.ts            |          3 | EvidenceService / StorageService                   | POST           |
| report.functions.ts              |          2 | ReportService, sem gravação em Report              | 1 POST / 1 GET |
| dashboard.functions.ts           |          1 | DashboardService                                   | GET            |
| example.functions.ts             |          1 | getGreeting; configuração server-only, sem Service | POST           |

Todas as Functions com payload usam Zod em inputValidator/validator; upload
usa parseEvidenceUploadFormData. getCurrentSession/logout/getDashboard/
listAvailableInspectionReports não recebem entrada nem têm schema de payload.
Wrappers companyIdSchema/updateCompanyInputSchema, checklistIdSchema/
updateChecklistInputSchema e inspectionIdSchema são locais aos arquivos de
Functions; demais contratos ficam em src/server/schemas, com cadastro
reexportado de src/lib/validation/registration.schema.ts.

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

Envelope de erro de validação quando tratado pela camada de respostas:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 422,
  "errors": []
}
```

Exemplos de sucesso abaixo são recortes ilustrativos de data, não uma lista
exaustiva de campos. Tipos concretos vêm dos Services/Repositories e do
transporte tipado do Start; datas não são universalmente strings JSON.
`toServerResult` adapta errors para JsonValue, preservando sucesso.

Observação: em Server Functions, o transporte HTTP pode não refletir diretamente o `statusCode` lógico do corpo de resposta. Para tratamento no frontend, usar `success`, `message`, `code` e `statusCode`.

Schemas executados em inputValidator/validator podem lançar erro Zod antes do
handler, sem passar pelo envelope do Service. O cliente precisa tratar também
exceções de transporte/validação; não se garante o JSON acima para todo input inválido.

Services geralmente convertem ApiError e relançam inesperados; alguns mapeiam
Prisma P2002/P2025/conflitos internos. EvidenceService e DashboardService usam
resultFromError também para genéricos. Não existe conversão global garantida
de toda exceção em Result. Uma mutation com success=false retornado pode entrar
em onSuccess; o cliente confere success além de tratar erro lançado.

| Origem                                        | code real                   | statusCode lógico |
| --------------------------------------------- | --------------------------- | ----------------: |
| UnauthorizedError                             | UNAUTHORIZED                |               401 |
| NotFoundError                                 | NOT_FOUND                   |               404 |
| ConflictError / conflitos internos traduzidos | CONFLICT                    |               409 |
| ValidationError                               | VALIDATION_ERROR            |               422 |
| StorageError                                  | STORAGE_ERROR               |               502 |
| ApiError de configuração Cloudinary           | STORAGE_CONFIGURATION_ERROR |               500 |
| resultFromError genérico                      | INTERNAL_SERVER_ERROR       |               500 |

Os erros possíveis listados por operação incluem classes de falha. A menção a
422/500 não promete envelope nem status HTTP para rejeição pré-handler ou
exceção inesperada; 422 em envelope só existe quando ValidationError é convertido.

---

# Status Codes Lógicos

- Sucesso é success=true; não há campo statusCode=200 obrigatório nesse envelope.
- `401`: usuário não autenticado ou credenciais inválidas.
- `404`: recurso não encontrado.
- `409`: conflito de regra de negócio.
- `422`: erro de validação.
- `500`: erro interno não tratado.
- `502`: falha temporária do provedor externo de armazenamento.

---

# Autenticação

A autenticação atual usa sessão do TanStack Start com cookie HTTP-only:

- Nome do cookie: `safe_watch_session`.
- Duração: 8 horas.
- Conteúdo da sessão: `userId`.
- Senhas são armazenadas com hash bcrypt.
- `SESSION_SECRET` é obrigatório em produção.
- HttpOnly=true, SameSite=lax, Path=/ e Secure em produção. Fora de produção,
  há segredo de desenvolvimento quando SESSION_SECRET não foi configurado.
- Não usa JWT nem tabela própria de sessões. Usuário é reconsultado por
  deletedAt=null; não existe User.isActive. Conta ausente/excluída limpa sessão.
- Papéis ADMIN/TECHNICIAN/SUPERVISOR/AUDITOR são armazenados, sem RBAC funcional.
  Cadastro atribui TECHNICIAN; outro papel não concede administração.

Todas as Server Functions de negócio exigem sessão autenticada. Exceções:

- `login`
- `register`
- `logout`
- `getCurrentSession`
- `getGreeting` exemplo técnico

## Autorização por propriedade no fluxo principal

As Server Functions obtêm o ID do usuário da sessão; IDs enviados no body não
substituem essa identidade. Os Services repassam o ID aos Repositories, que
restringem buscas e mutações no PostgreSQL. Um recurso privado inexistente ou
pertencente a outro usuário retorna o mesmo `NOT_FOUND` lógico (`404`).

- Empresas: `createdById` restringe lista, detalhe, atualização e exclusão.
  Apenas empresas próprias podem ser usadas ao criar inspeções.
- Checklists pessoais: o proprietário pode editar, excluir, publicar, retirar versões e alterar
  itens. Um checklist ativo com versão `PUBLISHED` pode ser lido e reutilizado
  por outro usuário; essa leitura mostra apenas versões publicadas e seus
  metadados publicados. Drafts e versões retiradas permanecem privados.
- Oficial: isOfficial=true/isTemplate=true/dono NULL, consultável somente com
  sessão e publicação ativa acessível. Mutação pessoal retorna NOT_FOUND,
  inclusive para role ADMIN. isTemplate isolado não representa oficialidade.
- Inspeções: `Inspection.userId` restringe lista, detalhe, exclusão, respostas
  e conclusão. A mesma regra vale para a sincronização offline, preservando
  UUID, revisão esperada e deduplicação das operações.
- Não conformidades e ações corretivas: a autorização segue a inspeção da
  resposta associada, inclusive nas mutações. Evidências, relatórios e
  dashboard preservam seus filtros de propriedade existentes.

Evidência pode apontar diretamente à inspeção ou à NC/resposta/inspeção, nunca à
ação corretiva. responsible textual não é dono/permissão. Dono do checklist
compartilhado não recebe acesso à inspeção de quem o usa.

O `statusCode` é um campo lógico do resultado da Server Function, conforme
descrito acima.

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
- `pageSize`: inteiro positivo, máximo `100`, padrão `20` (normas usam `100`).
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

### `register`

- **Finalidade:** criar uma conta comum para uso posterior pelo login existente.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/auth.functions.ts`
- **Autenticação:** pública; não cria sessão.
- **Body:** `name`, `email`, `password` e `confirmPassword` (strings); campos extras são rejeitados.
- **Validação:** `registrationSchema`; nome não vazio após trim, e-mail válido normalizado para minúsculas, senha com no mínimo 8 caracteres e confirmação idêntica.
- **Regras relacionadas:** o Service define `TECHNICIAN`, aplica bcrypt com custo 12 e verifica duplicidade de e-mail, inclusive contas excluídas logicamente. A restrição única do banco protege contra cadastro concorrente.
- **Exemplo de chamada:**

```ts
await register({
  data: {
    name: "Ana Silva",
    email: "ana@example.com",
    password: "senha-segura-123",
    confirmPassword: "senha-segura-123",
  },
});
```

- **Resposta:** `success: true` com `id`, `name` e `email`; não retorna senha, hash ou papel. Após o sucesso, a interface encaminha ao login.
- **Erros possíveis:** `409` e-mail já cadastrado; validação Zod para payload inválido; `500` erro interno.

### `login`

- **Finalidade:** autenticar usuário por e-mail e senha e criar sessão.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/auth.functions.ts`
- **Autenticação:** não exige sessão prévia.
- **Body:**

```json
{
  "email": "demo.user@example.test",
  "password": "Demo@12345"
}
```

- **Validação:** `loginSchema`.
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** não se aplica.
- **Regras relacionadas:** normaliza e-mail; busca usuário não excluído; compara bcrypt custo 12; não retorna password. Cadastro não inicia sessão; login cria cookie após autenticação bem-sucedida.
- **Exemplo de chamada:**

```ts
await login({ data: { email: "demo.user@example.test", password: "Demo@12345" } });
```

- **Exemplo de resposta:**

```json
{
  "success": true,
  "data": {
    "id": "f5b24d96-7d25-4c93-917c-1bb4fd019001",
    "name": "Usuário Demonstração",
    "email": "demo.user@example.test",
    "role": "TECHNICIAN"
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** não se aplica.
- **Regras relacionadas:** reconsulta usuário não excluído; limpa sessão se ausente/excluído. Retorna erro do Service (404 nesse caso), ou 401 se não houver identidade de sessão.
- **Exemplo de chamada:**

```ts
await getCurrentSession();
```

- **Exemplo de resposta:**

```json
{
  "success": true,
  "data": {
    "id": "f5b24d96-7d25-4c93-917c-1bb4fd019001",
    "name": "Usuário Demonstração",
    "email": "demo.user@example.test",
    "role": "TECHNICIAN"
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** não se aplica.
- **Regras relacionadas:** remove sessão HTTP-only. UI também limpa IndexedDB/cache privado; falha remota é informada e não significa revogação remota confirmada. Sessão local offline não autoriza Server Functions.
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

- **Erros possíveis:** `401` configuração de sessão ausente em produção; `500` erro ao limpar sessão.

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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** não se aplica.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` é enviado no body da Server Function.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` no body.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` no body.
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
- **Filtros na chamada:** enviados no body da Server Function.
- **Identificador no payload:** não se aplica.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** não se aplica.
- **Regras relacionadas:** createdById vem da sessão; cria somente pessoal, isOfficial=false. isTemplate pode marcar template pessoal. Criação atômica com DRAFT v1 e autor da sessão, inicialmente privado. Campos desconhecidos de autoria/oficialidade são removidos pelo schema comum; não devem ser descritos como aceitos pelo contrato.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` no body.
- **Regras relacionadas:** exige ao menos um campo e ownership pessoal não excluído. title/description vão ao draft, derivado da publicação/retirada mais recente se necessário. isTemplate/isActive atualizam identidade; alteração apenas desses indicadores não cria draft. Publicação/oficial não é editada diretamente.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` no body.
- **Regras relacionadas:** exige proprietário pessoal e usa soft delete (deletedAt), preservando versões/snapshots. Oficial ou checklist alheio retorna NOT_FOUND.
- **Exemplo de chamada:**

```ts
await deleteChecklist({ data: { id } });
```

- **Exemplo de resposta:** checklist com `deletedAt` preenchido.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `getChecklistById`

- **Finalidade:** consultar checklist visível não excluído por ID, inclusive próprio inativo.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` no body.
- **Regras relacionadas:** dono recebe versões/draft/histórico, com canManage=true. Terceiro/oficial exige checklist ativo com PUBLISHED; retorna somente publicações, título/descrição da última e canManage=false. Nunca expõe draft privado alheio. Frontend mantém draft e seleciona publicação para inspeção.
- **Exemplo de chamada:**

```ts
await getChecklistById({ data: { id } });
```

- **Exemplo de resposta:** checklist encontrado.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `listChecklists`

- **Finalidade:** listar checklists visíveis não excluídos, com filtro opcional de atividade.
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
- **Filtros na chamada:** enviados no body.
- **Identificador no payload:** não se aplica.
- **Filtros:** search, isTemplate, isActive, scope (official/mine/shared), paginação e ordenação.
- **Ordenação:** `title`, `isTemplate`, `isActive`, `createdAt`, `updatedAt`.
- **Regras relacionadas:** lista visível à sessão com resumo/contagem de versões. Dono recebe drafts/histórico; terceiro/oficial apenas publicações de checklist ativo. Dados devolvidos de título/descrição são publicados para terceiros, mas busca/ordenação consultam campos atuais da identidade. Ver limite no relatório da Fase 3.
- **Exemplo de chamada:**

```ts
await listChecklists({ data: { isActive: true } });
```

- **Exemplo de resposta:** resultado paginado.
- **Erros possíveis:** `401`, `422`, `500`.

---

## Checklist Versions

### `listChecklistVersions`

- **Finalidade:** listar versões visíveis em ordem decrescente de número.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-version.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "checklistId": "uuid" }`.
- **Validação:** `checklistVersionsByChecklistSchema`.
- **Resposta:** versões com itens, linhagem e metadados normativos copiados.
- **Regras relacionadas:** checklist precisa ser visível não excluído. Proprietário recebe todas as versões; terceiros/oficiais somente PUBLISHED de checklist ativo, sem drafts/retiradas.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `publishChecklistVersion`

- **Finalidade:** publicar o draft atual de um checklist.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-version.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "checklistId": "uuid" }`.
- **Validação:** `publishChecklistVersionSchema`.
- **Regras relacionadas:** ownership pessoal/draft existente; sem mínimo de itens nem exigência de atividade. Calcula SHA-256 formato 1, registra publicador da sessão/data/status. Confere expectedUpdatedAt lido pelo Service, não revisão enviada pelo cliente. Mantém ID/número; nova publicação não retira anteriores automaticamente.
- **Resposta:** versão publicada com seus itens.
- **Erros possíveis:** `401`, `404`, `409` draft ausente ou conflito concorrente, `422`, `500`.

### `retireChecklistVersion`

- **Finalidade:** retirar uma versão publicada de uso futuro.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/checklist-version.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "checklistId": "uuid", "versionId": "uuid" }`.
- **Validação:** `checklistVersionIdSchema`.
- **Regras relacionadas:** ownership pessoal e versão PUBLISHED do checklist informado. Muda status para RETIRED, preserva conteúdo/hash/data/publicador/snapshots/inspeções. Existe hook, sem ação nas telas atuais; não é editoria de oficial nem republicação direta de retirada.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** não se aplica.
- **Regras relacionadas:** checklist deve existir; o Service usa ou cria o próximo draft; se `orderIndex` não for informado, usa o próximo índice disponível; todas as normas devem existir e estar ativas; tipo, código, título, resumo e URL são copiados para a associação da versão.
- **Exemplo de chamada:**

```ts
await createChecklistItem({ data: { checklistId, description, isRequired: true } });
```

- **Exemplo de resposta:** item criado.
- **Erros possíveis:** `401`, `404` checklist não encontrado, `409` conflito de draft/ordem/linhagem, `422`, `500`.

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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` no body.
- **Regras relacionadas:** `id` identifica um `ChecklistVersionItem`. Se o item recebido pertence a versão publicada/retirada, o Service cria o próximo draft e localiza o item derivado pela linhagem antes de editar. Exige ao menos um campo; `standardIds` substitui atomicamente as cópias normativas; a versão é tocada para proteger publicação concorrente.
- **Exemplo de chamada:**

```ts
await updateChecklistItem({ data: { id, data: { description: "Nova descrição" } } });
```

- **Exemplo de resposta:** item atualizado.
- **Erros possíveis:** `401`, `404`, `409` conflito de draft/ordem/linhagem, `422`, `500`.

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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` no body.
- **Regras relacionadas:** `id` identifica um `ChecklistVersionItem`; se necessário, o Service deriva o próximo draft e remove o item correspondente somente nele. Versões publicadas, snapshots e respostas permanecem intactos.
- **Exemplo de chamada:**

```ts
await deleteChecklistItem({ data: { id } });
```

- **Exemplo de resposta:** `success: true, data: null`.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `checklistId` no body.
- **Regras relacionadas:** checklist visível. Prefere draft somente para dono; depois última publicação; sem ambos, dono pode receber versão mais recente (retirada). Terceiro/oficial recebe só publicação. Ordem/metadados são de versão, sem expor draft alheio.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** não se aplica.
- **Regras relacionadas:** usuário da sessão, empresa própria não excluída, checklist visível ativo; versão do mesmo checklist PUBLISHED. Sem versão explícita, última publicação. Hash presente obrigatório; formato 1 recalculado, outros formatos (inclusive legado 0) aceitos sem recálculo, diferente da cópia. Gravação de inspeção/snapshot/itens/normas é atômica; leitura/preparação precede transação. Define PLANNED/SYNCED/INSPECTION_CREATION/VERIFIED inclusive no caminho legado aceito.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` no body.
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
- **Filtros na chamada:** enviados no body.
- **Identificador no payload:** não se aplica.
- **Filtros:** companyId, checklistId, status, syncStatus, search, paginação e ordenação. Schema também aceita userId, mas Service o sobrescreve pela sessão, sem acesso a dados de outro dono.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `id` no body.
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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `inspectionId` no body.
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
  "observation": "Observação opcional",
  "operationId": "uuid opcional para sincronização",
  "clientCreatedAt": "2026-08-06T13:00:00.000Z",
  "expectedResponseUpdatedAt": "2026-08-06T12:00:00.000Z ou null"
}
```

- **Validação:** `saveInspectionResponseSchema`.
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** não se aplica.
- **Status aceitos:** `COMPLIANT`, `NON_COMPLIANT`, `NOT_APPLICABLE`.
- **Regras relacionadas:** deve ser enviado exatamente um entre `snapshotItemId` e o `checklistItemId` legado. O item precisa pertencer ao snapshot da inspeção; o identificador legado é resolvido para esse snapshot antes da persistência. A resposta é única por inspeção + item do snapshot; inspeção `PLANNED` passa para `IN_PROGRESS`; validação de estado, resposta e criação/restauração/arquivamento da não conformidade são atômicos. A descrição e as normas históricas vêm do snapshot. Inspeções concluídas ou canceladas não aceitam alterações.
- **Sincronização offline:** `operationId`, `clientCreatedAt` e `expectedResponseUpdatedAt` são opcionais para chamadas online normais, mas formam um conjunto obrigatório quando qualquer um é enviado. O usuário sempre vem da sessão. O servidor calcula hash canônico, confere a revisão esperada e grava `OfflineSyncOperation` atomicamente. Mesmo ID/hash é retry idempotente; mesmo ID com conteúdo diferente ou revisão divergente retorna `409`.
- **NC automática:** nova NC usa `MEDIUM`/`OPEN`, descrição da observação aparada
  ou do item histórico e prazo atual + sete dias UTC. NC ativa conserva dados e
  status; arquivada volta a `OPEN` sem renovar prazo/descrição/severidade. Resposta
  `COMPLIANT`/`NOT_APPLICABLE` arquiva NC, sem apagar ações/evidências. Retry de
  operação já confirmada não cria nova mutação, mesmo após conclusão.
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
  "inspectionId": "uuid",
  "operationId": "uuid opcional para sincronização",
  "clientCreatedAt": "2026-08-06T13:30:00.000Z"
}
```

- **Validação:** `finishInspectionSchema` (estende inspectionResponseIdSchema e valida conjunto de metadados offline).
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** `inspectionId` no body.
- **Regras relacionadas:** inspeção e snapshot devem existir; todos os itens obrigatórios do snapshot devem possuir resposta por `snapshotItemId`; status passa para `COMPLETED`; inspeções concluídas ou canceladas não podem ser concluídas novamente. Com metadados offline, a conclusão e o registro idempotente são atômicos; retry do mesmo ID/hash retorna a inspeção já concluída.
- **Completude:** `NOT_APPLICABLE` conta como resposta; opcionais podem ficar sem
  resposta. Não exige observações, fotos, NCs resolvidas ou ações concluídas.
  Conclusão bloqueia novas respostas, preservando manutenção de NCs/ações/evidências.
- **Limitação atual:** assinatura digital ainda não está disponível na interface nem é persistida.
- **Exemplo de chamada:**

```ts
await finishInspection({ data: { inspectionId } });
```

- **Exemplo de resposta:** inspeção atualizada para `COMPLETED`.
- **Erros possíveis:** `401`, `404`, `409` obrigatórios pendentes, snapshot indisponível, estado não editável ou conflito offline, `422`, `500`.

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
- **Body:** `inspectionResponseId`, `description` e `severity` obrigatórios;
  `dueDate` opcional; `status` opcional, padrão `OPEN`.
- **Validação:** `createNonConformitySchema`.
- **Regras relacionadas:** resposta da inspeção própria não excluída, `NON_COMPLIANT`,
  sem NC inclusive arquivada. Prazo omitido vira NULL; não aplica o prazo automático
  de sete dias. JSON null para prazo sofre coerção para data epoch no schema atual;
  string vazia resulta em NULL. Ver Implementation Concern em BusinessRules.
- **Erros possíveis:** `401`, `404`, `409`, `422`, `500`.

### `getNonConformityById`

- **Finalidade:** consultar uma não conformidade ativa com inspeção, empresa, usuário, item, normas, ações corretivas e evidências.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/non-conformity.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid" }`.
- **Validação:** `nonConformityIdSchema`.
- **Regras relacionadas:** limita a consulta à inspeção pertencente ao usuário
  autenticado, impedindo exposição indireta de evidências de outro usuário.
  Antes da leitura, persiste `OVERDUE` nas NCs ativas do usuário em `OPEN` ou
  `IN_PROGRESS` com prazo vencido; não depende de job agendado.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `listNonConformities`

- **Finalidade:** listar não conformidades ativas.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/non-conformity.functions.ts`
- **Autenticação:** exige sessão.
- **Filtros:** `search`, `status`, `severity`, `companyId`, `inspectionId`, `standardId`, paginação e ordenação.
- **Validação:** `nonConformityFiltersSchema`.
- **Regras relacionadas:** registros vencidos ainda abertos são marcados como
  `OVERDUE`; a lista é limitada às inspeções do usuário autenticado para não
  expor evidências relacionadas de outro usuário.
- **Erros possíveis:** `401`, `422`, `500`.

### `updateNonConformity`

- **Finalidade:** editar descrição, severidade, prazo ou status.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/non-conformity.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid", "data": { ... } }`.
- **Validação:** `updateNonConformityInputSchema`.
- **Regras relacionadas:** NC própria e contexto não excluído; ao menos um campo.
  Status aceita qualquer valor do enum, sem validar uma sequência adicional de
  transições ou exigir ações concluídas para `RESOLVED`. Alterar prazo sozinho
  não reverte `OVERDUE`; NC pode ser mantida após conclusão da inspeção.
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
- **Body:** `nonConformityId` e `description` obrigatórios; `why`, `location`,
  `responsible`, `dueDate`, `method`, `estimatedCost` opcionais; `status` opcional,
  padrão `PENDING`. `completedAt` não é campo editável; schema remove esse campo
  desconhecido e Service calcula o valor.
- **Validação:** `createCorrectiveActionSchema`.
- **Regras relacionadas:** NC própria e contexto não excluído. Criar qualquer ação
  enquanto a NC está `OPEN` muda a NC para `IN_PROGRESS` atomicamente; em outro
  estado não a altera. Permite ação já `COMPLETED`, definindo `completedAt`.
  Responsável/custo são textos opcionais, sem permissão/FK ou validação monetária.
  Prazo omitido ou string vazia resulta em NULL; JSON null vira data epoch pela
  coerção atual (Implementation Concern). Limites de texto em BusinessRules.
- **Erros possíveis:** `401`, `404`, `409` alteração concorrente da NC, `422`, `500`.

### `listCorrectiveActions`

- **Finalidade:** listar ações ativas de uma não conformidade.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/corrective-action.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "nonConformityId": "uuid" }`.
- **Validação:** `correctiveActionsByNonConformitySchema`.
- **Regras relacionadas:** exige NC própria ativa; persiste `OVERDUE` em ações
  ativas do usuário com prazo vencido e status `PENDING` ou `IN_PROGRESS`.
- **Erros possíveis:** `401`, `404`, `422`, `500`.

### `updateCorrectiveAction`

- **Finalidade:** editar ou concluir uma ação corretiva.
- **Método:** `POST`
- **Arquivo:** `src/lib/api/corrective-action.functions.ts`
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid", "data": { ... } }`.
- **Validação:** `updateCorrectiveActionInputSchema`.
- **Regras relacionadas:** ação/NC/inspeção próprias não excluídas; ao menos um
  campo. Campos omitidos conservam valor; opcionais textuais vazios/NULL limpam
  valor. Enviar `COMPLETED` define `completedAt` atual; outro status limpa-o;
  omitir status conserva-o. Não resolve NC automaticamente nem exige inspeção
  aberta. Alterar prazo sozinho não reverte `OVERDUE`.
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

## Evidence

### `uploadEvidence`

- **Finalidade:** enviar uma imagem e registrar seus metadados no contexto histórico.
- **Método:** `POST` com `FormData`.
- **Arquivo:** `src/lib/api/evidence.functions.ts`.
- **Autenticação:** exige sessão.
- **Campos:** `file`; exatamente um entre `inspectionId` e `nonConformityId`; `caption` opcional.
- **Validação:** JPEG, PNG ou WebP; arquivo não vazio; máximo de 4 MB; nome com até 255 caracteres; legenda com até 500 caracteres. O Service também confere a assinatura binária do arquivo.
- **Regras relacionadas:** a inspeção deve possuir snapshot e pertencer ao usuário
  autenticado; a não conformidade deve pertencer a uma resposta vinculada a item
  do snapshot de uma inspeção do mesmo usuário. O `userId` vem exclusivamente da
  sessão. O arquivo é enviado ao Cloudinary por requisição assinada no servidor e
  o segredo da API não é exposto. Se a persistência falhar, o arquivo recém-enviado
  tem remoção tentada por compensação; essa tentativa pode falhar e deixar órfão.
- **Metadados persistidos:** `publicId`, `storageUrl`, `fileName`, `mimeType`, `fileSize`, `width`, `height`, `caption` e timestamps.
- **Exemplo de chamada:**

```ts
const formData = new FormData();
formData.set("inspectionId", inspectionId);
formData.set("file", file);
formData.set("caption", "Extintor da entrada");

await uploadEvidence({ data: formData });
```

- **Erros possíveis:** `401`, `404` contexto não encontrado, `409` contexto histórico inválido, `422` arquivo inválido, `500` configuração ausente, `502` falha do Cloudinary.

### `listEvidence`

- **Finalidade:** listar evidências ativas de uma inspeção ou não conformidade.
- **Método:** `POST`.
- **Arquivo:** `src/lib/api/evidence.functions.ts`.
- **Autenticação:** exige sessão.
- **Body:** exatamente um entre `{ "inspectionId": "uuid" }` e `{ "nonConformityId": "uuid" }`.
- **Validação:** `evidenceTargetSchema`.
- **Resposta:** lista em ordem decrescente de criação, com tamanho convertido para número seguro no DTO.
- **Regras relacionadas:** tanto o contexto consultado quanto a consulta de
  evidências são limitados ao usuário autenticado pelos relacionamentos Prisma.
- **Erros possíveis:** `401`, `404`, `409`, `422`, `500`.

### `removeEvidence`

- **Finalidade:** remover o arquivo externo e arquivar seus metadados.
- **Método:** `POST`.
- **Arquivo:** `src/lib/api/evidence.functions.ts`.
- **Autenticação:** exige sessão.
- **Body:** `{ "id": "uuid" }`.
- **Validação:** `evidenceIdSchema`.
- **Regras relacionadas:** localiza e arquiva somente evidência pertencente ao
  usuário autenticado. A autorização ocorre antes de qualquer chamada ao
  Cloudinary. Aplica soft delete antes da remoção externa; se o Cloudinary falhar,
  tenta restaurar `deletedAt` com o mesmo escopo de propriedade; restauração
  também pode falhar ou não encontrar contexto ativo, sem atomicidade distribuída. Resultado `not found` do provedor é idempotente e aceito.
- **Erros possíveis:** `401`, `404`, `422`, `500`, `502`.

---

## Reports

### `listAvailableInspectionReports`

- **Finalidade:** listar inspeções concluídas disponíveis para relatório.
- **Método:** `GET`.
- **Arquivo:** `src/lib/api/report.functions.ts`.
- **Autenticação:** exige sessão.
- **Regras relacionadas:** retorna somente inspeções ativas e concluídas cujo
  `userId` corresponde ao usuário autenticado e que possuem snapshot. Título e
  versão vêm do snapshot histórico.
- **Erros possíveis:** `401`, `500`.

### `getInspectionReport`

- **Finalidade:** montar o read model imprimível de uma inspeção.
- **Método:** `POST`.
- **Arquivo:** `src/lib/api/report.functions.ts`.
- **Autenticação:** exige sessão.
- **Body:** `{ "inspectionId": "uuid" }`.
- **Validação:** `inspectionReportIdSchema`.
- **Regras relacionadas:** a consulta filtra simultaneamente por ID da inspeção
  e ID do usuário autenticado. Itens, redação, ordem e normas vêm exclusivamente
  do snapshot; respostas, não conformidades, ações corretivas e evidências
  ativas são incorporadas ao read model. O endpoint não gera arquivo PDF e não
  cria registro em `Report` durante a leitura.
  Empresa e usuário são dados atuais, sem congelamento no snapshot. Diferente
  da listagem de disponíveis, o detalhe backend não exige COMPLETED.
- **Erros possíveis:** `401`, `404`, `409` histórico indisponível, `422`, `500`.

---

## Dashboard

### `getDashboard`

- **Finalidade:** obter o resumo operacional do usuário autenticado.
- **Método:** `GET`.
- **Arquivo:** `src/lib/api/dashboard.functions.ts`.
- **Autenticação:** exige sessão.
- **Resposta:** read model com resumo de inspeções e não conformidades,
  conformidade de respostas aplicáveis, distribuição por status e até cinco
  inspeções recentes.
- **Regras relacionadas:** todas as consultas usam `Inspection.userId` da
  sessão e ignoram inspeções excluídas. A conformidade usa somente respostas
  `COMPLIANT` e `NON_COMPLIANT` com `snapshotItemId` em inspeções concluídas.
  `NOT_APPLICABLE` não integra o denominador. NCs e ações vencidas são
  identificadas sem atualização de status durante a leitura. Títulos recentes
  vêm do snapshot histórico.
- **Erros possíveis:** `401`, `500`.

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
- **Filtros na chamada:** não se aplica.
- **Identificador no payload:** não se aplica.
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

- **Erros possíveis:** exceção de validação Zod ou erro inesperado; sem Result/statusCode lógico garantido.

---

# Funcionalidades Não Implementadas na API Atual

Os modelos existem no Prisma ou estão previstos na documentação, mas ainda não possuem Server Functions completas nesta entrega:

- Users CRUD.
- Criação integral de inspeção offline.
- Reconciliação assistida de conflitos offline.
- Sincronização offline de evidências binárias.

Esses módulos devem seguir o mesmo fluxo arquitetural quando forem implementados.

## Templates oficiais da plataforma

- `listChecklists` aceita `scope?: "official" | "mine" | "shared"`. O filtro
  restringe a consulta à plataforma, ao usuário da sessão ou a publicações de
  outros usuários. Sem scope, preserva a listagem visível anterior.
- Lista e detalhe retornam `isOfficial`, `createdById` presente e nullable (NULL
  no oficial) e `canManage`,
  calculado pelo Service para orientar a UI; autorização continua no servidor.
- `getChecklistById`, `listChecklistItems` e `listChecklistVersions` permitem
  leitura autenticada das versões publicadas dos templates oficiais.
- `useOfficialTemplate` (`POST`, `src/lib/api/checklist.functions.ts`) recebe
  somente `{ id: UUID }` e usa o proprietário da sessão. Cria atomicamente um
  checklist pessoal (`isOfficial=false`) com draft v1 e cópias dos itens/normas
  da última publicação institucional. Retorna o checklist com suas versões.
  Erros: `401` sessão ausente; `404` origem não oficial/inativa/indisponível;
  `409` falha de integridade; validação Zod para UUID/payload inválido.
- Schemas de criação/edição não aceitam atribuição de oficialidade/propriedade.
  Os endpoints existentes de mutação de checklist, itens, publicação e retirada
  retornam `NOT_FOUND` para templates da plataforma.
- Bootstrap institucional não é exposto por Server Function.

Fluxo e referência acadêmica: [OfficialTemplates.md](./OfficialTemplates.md).

## `copyChecklist`

- **Método/arquivo:** `POST`, `src/lib/api/checklist.functions.ts`.
- **Entrada:** somente `{ id: UUID }`; campos extras são rejeitados por Zod.
- **Autenticação:** obrigatória; a sessão define o proprietário da nova cópia.
- **Regra:** origem própria não excluída ou checklist ativo com publicação
  acessível. Proprietário usa draft atual ou última publicação; terceiros usam
  somente a última publicação. Versões retiradas não são origem da cópia.
- **Resultado:** checklist pessoal ativo com draft v1, novos UUIDs, itens e
  associações normativas independentes; título com sufixo “— Cópia”.
- **Erros:** 401 sem sessão; 404 origem/conteúdo indisponível; 409 formato
  publicado diferente de 1 ou hash inválido; exceção Zod para UUID/extras.
- **Compatibilidade:** `useOfficialTemplate` delega à mesma operação, exigindo
  origem oficial. Nenhuma autoria/oficialidade é transferida da origem.

```ts
await copyChecklist({ data: { id: sourceChecklistId } });
```

Regras, transação e validação: [ChecklistCopy.md](./ChecklistCopy.md).

Checklist/ChecklistVersion não têm sourceVersionId. Linhagem da cópia é por item:
sourceVersionItemId aponta a publicado ou conserva ancestral anterior ao copiar
draft, sem dependência do item mutável. Associação normativa nova reutiliza
Standard/copia metadados. Não copia inspeções/respostas/NCs/ações/evidências/
Report/snapshots. Transação RepeatableRead inclui leitura/preparação/inserts;
nomes com “ — Cópia” não são garantia SQL de unicidade concorrente.

Snapshot congela conteúdo de checklist, sem empresa/usuário/operação inteira.
Errata Murbach de UI/cópias não atualiza publicação/snapshot/relatório histórico
automaticamente. Validação documental/limites:
[RelatorioFase4.md](../Documentation/RelatorioFase4.md).

## Saídas e efeitos por grupo

Complementa os contratos de entrada/operação acima. Os retornos estão em data
no sucesso, salvo o exemplo getGreeting. Nenhuma Function aceita o proprietário
como autoridade; autenticação/autorização gerais continuam valendo para cada grupo.

| Grupo              | Saída real / cardinalidade                                                         | Efeitos colaterais                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Auth               | register: RegisteredUser; login/sessão: SafeUser; logout: null                     | Cadastro persiste usuário sem sessão; login cria cookie; sessão reconsulta conta/limpa cookie de conta ausente; logout limpa cookie |
| Company            | Entidade em criação/edição/detalhe/exclusão; PaginatedResult na lista              | Exclusão lógica não libera CNPJ nem apaga inspeções                                                                                 |
| Checklist          | Identidade com versões; views com canManage; lista paginada                        | Criação/cópia geram DRAFT v1; edição pode derivar draft; exclusão lógica preserva história                                          |
| ChecklistVersion   | Versão com itens/normas; lista de versões                                          | Publicação muda draft com hash/autoria/data; retirada muda estado sem apagar conteúdo                                               |
| ChecklistItem      | Item de versão com normas; lista; delete retorna null                              | Edição/exclusão somente no draft, podendo derivá-lo; toca updatedAt da versão                                                       |
| Inspection         | InspectionWithRelations ou lista paginada                                          | Criação PLANNED/SYNCED e snapshot atômicos; delete lógico; sem update/start/cancel expostos                                         |
| InspectionResponse | Lista ou resposta com contexto; finish retorna inspeção                            | Primeira resposta inicia IN_PROGRESS, cria/restaura/arquiva NC; conclusão muda estado; sync registra confirmação remota             |
| Standard           | Norma ou lista paginada                                                            | Leitura somente; sem criação/edição/exclusão pública                                                                                |
| NonConformity      | NC com relações; lista paginada; NC arquivada no delete                            | Criação manual/edição/arquivo; lista/detalhe persistem OVERDUE do usuário antes de ler                                              |
| CorrectiveAction   | Ação criada/atualizada/arquivada; lista por NC                                     | Criação pode transitar NC OPEN para IN_PROGRESS; update COMPLETED define completedAt; listagem persiste OVERDUE do usuário          |
| Evidence           | EvidenceDto ou array                                                               | Upload/destroy Cloudinary e metadados compensados; DTO omite publicId e converte tamanho para number                                |
| Report             | AvailableInspectionReportDto[] ou InspectionReportDto                              | Consulta não insere Report; impressão/PDF nativo só no cliente                                                                      |
| Dashboard          | DashboardDto: summary, compliance, inspectionStatusDistribution, recentInspections | Leitura agregada sem mutação de atrasos; percentage=null sem respostas aplicáveis                                                   |

Assinaturas dos DTOs de relatório/dashboard/evidência ficam respectivamente em
[report.service.ts](../src/server/services/report.service.ts),
[dashboard.service.ts](../src/server/services/dashboard.service.ts) e
[evidence.service.ts](../src/server/services/evidence.service.ts). Entidades com
relações derivam dos includes dos Repositories, sem CRUD automático por model.

### Operações que não têm Function própria

Não há startInspection: salvar primeira resposta faz a transição PLANNED →
IN_PROGRESS. Também não há updateInspection/cancelInspection expostos, mesmo
existindo enums e métodos de persistência. Reabrir NC arquivada é efeito de
saveInspectionResponse NON_COMPLIANT; atualizar status da NC usa updateNonConformity,
sem Function específica reopen. Concluir ação usa updateCorrectiveAction com
status COMPLETED, sem completeCorrectiveAction. Tratativas combinam NC/ações/
evidências, sem entidade/endpoint separado.

ChecklistVersion tem listagem/publicação/retirada, sem CRUD universal; snapshot
é criado com inspeção e consultado dentro de sua representação, sem editor.
Report persistível não tem CRUD web; OfflineSyncOperation não tem endpoint de
fila: confirmação é interna às transações de saveInspectionResponse/finishInspection.
Bootstrap oficial não é operação pública de API.

### Sincronização e armazenamento externo

Save exige operationId/clientCreatedAt/expectedResponseUpdatedAt completos se
qualquer metadado offline for enviado; revisão esperada pode ser null para nova
resposta. Finish exige operationId/clientCreatedAt juntos. Functions continuam
as mesmas online/offline: não existe endpoint sync genérico. Serviço calcula
hash; Repository confere identidade/revisão/deduplicação na transação. Retry
confirmado não reaplica mutação; conflito impede avanço da fila local.

Upload valida entrada FormData no schema e bytes no Service. PostgreSQL guarda
metadados/publicId; EvidenceDto expõe URL, sem binário e sem publicId. Autorização
da aplicação não é verificada a cada download da URL pública Cloudinary.
Compensações são tentativas: falha ao remover upload órfão conserva erro original;
não existe transação conjunta banco/provedor. Binários offline são futuros.

Referências técnicas: [Architecture.md](./Architecture.md),
[README backend](../src/server/README.md),
[Especificação acadêmica](../Documentation/EspecificacaoAPIREST.md) e
[Relatório da Fase 5](../Documentation/RelatorioFase5.md).

## Precisões de contratos operacionais — Fase 6

Conferência estática em 4 de outubro de 2026. Complementa contratos da Fase 5,
sem criar endpoints. Domínio/matriz de autorização/fórmulas/diagramas:
[BusinessRules.md](./BusinessRules.md); sincronização: [Offline.md](./Offline.md).

| Function                       | Precisão do contrato/saída                                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| deleteInspection               | Soft delete próprio em qualquer estado; sem botão na UI; não apaga filhos nem arquivos Cloudinary                                                                    |
| saveInspectionResponse         | observation opcional sem max no schema; trim/vazio/omissão vira NULL; revisão só conferida quando metadados offline presentes                                        |
| finishInspection               | Não fornece edição/reabertura/cancelamento; retry retorna recurso atual; clientCreatedAt vai para confirmação, não substitui updatedAt remoto                        |
| uploadEvidence                 | 1 File por chamada; limite inclusive 4.194.304 bytes; MIME exato e assinatura/bytes conferidos no servidor; dimensões do provedor, nullable; XOR também em CHECK SQL |
| listEvidence                   | DTO omite publicId/deletedAt; ordena createdAt DESC/id DESC; upload/lista exigem snapshot no contexto                                                                |
| removeEvidence                 | Autoriza alvo/contexto ativos; não exige inspeção aberta; soft delete/destroy com restore tentado; ok/not found externo aceitos                                      |
| listAvailableInspectionReports | Array sem paginação; COMPLETED/snapshot/dono; inspectionDate DESC/id DESC; não consulta Report                                                                       |
| getInspectionReport            | DTO sob demanda; snapshot + cadastros/tratativas atuais; sem filtro COMPLETED; sem persistência Report/PDF                                                           |
| getDashboard                   | DTO summary/compliance/inspectionStatusDistribution/recentInspections; sem filtros de entrada/persistência de métricas                                               |

No relatório, summary tem totalItems, answeredItems, compliantItems,
nonCompliantItems, notApplicableItems, pendingItems e completionPercentage.
Preenchimento = round(100 × respondidos/total), ou 0 sem itens. NOT_APPLICABLE
conta como respondido. NC/ação vencida é derivada no DTO, sem markOverdue.
Dashboard: round(100 × COMPLIANT/(COMPLIANT+NON_COMPLIANT)), somente respostas
com snapshotItemId em COMPLETED; percentage=NULL sem aplicáveis e UI “—”.
NOT_APPLICABLE/pendentes não entram. Recentes: até cinco, inspectionDate DESC,
createdAt DESC, id DESC. Ações vencidas contam só sob NC OPEN/IN_PROGRESS/OVERDUE;
Requer atenção soma planejadas + NCs vencidas + ações vencidas na UI.

No frontend, respostas/conclusão usam Dexie mesmo online; não são chamadas
online diretas sem revisão pelo caminho de UI. Sessão local não substitui
getAuthenticatedUser de cada Function. userId dos filtros de inspeção é
sobrescrito pelo ID da sessão, inclusive em leituras que alimentam histórico.
Relatório/dashboard têm queries online sem pacote offline próprio. Impressão
usa window.print() no cliente, sem Function de gerar/baixar PDF.
