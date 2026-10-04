# 10. Especificação da API

## 10.1 Objetivo

Este documento registra a especificação da camada de comunicação atualmente
implementada na plataforma **Safe Watch Insight**.

Na implementação atual, a aplicação utiliza **TanStack Start Server Functions**
em vez de endpoints REST tradicionais. A documentação detalhada de cada Server
Function implementada está em [AI/API.md](../AI/API.md).

Este arquivo permanece na pasta `Documentation/` por fazer parte do conjunto acadêmico do TCC, mas foi atualizado para refletir a implementação atual.

---

## 10.2 Arquitetura Atual

```text
React
-> React Query
-> TanStack Start Server Functions
-> Services
-> Repositories
-> Prisma ORM
-> PostgreSQL
```

Responsabilidades:

- React renderiza a interface.
- React Query gerencia cache, loading e invalidação.
- Server Functions recebem chamadas do frontend e validam entradas.
- Services concentram regras de negócio.
- Repositories executam persistência.
- Prisma acessa o PostgreSQL.

---

## 10.3 Autenticação

A autenticação atual usa:

- e-mail e senha;
- bcrypt para validação de senha;
- sessão HTTP-only do TanStack Start;
- cookie `safe_watch_session`;
- duração de sessão de 8 horas.

Cadastro público usa `register`, atribui TECHNICIAN no servidor e não cria sessão
automaticamente. Identidade de negócio vem da sessão; papéis armazenados não
implementam RBAC. Regras completas em [AI/BusinessRules.md](../AI/BusinessRules.md).

Credenciais de demonstração criadas pelo seed:

```text
Email: demo.user@example.test
Senha: Demo@12345
```

---

## 10.4 Padrão de Respostas

Os exemplos abaixo são envelopes dos handlers. Validação Zod anterior ao handler
pode produzir erro do framework, sem garantir esse mesmo envelope.

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

---

## 10.5 Server Functions Implementadas

### Autenticação

- `login`
- `register`
- `getCurrentSession`
- `logout`

### Empresas

- `createCompany`
- `updateCompany`
- `deleteCompany`
- `getCompanyById`
- `listCompanies`

### Checklists

- `createChecklist`
- `updateChecklist`
- `deleteChecklist`
- `getChecklistById`
- `listChecklists`
- `copyChecklist`
- `useOfficialTemplate`

Cópia cria identidade pessoal independente e DRAFT v1. Draft próprio pode ser
origem; terceiro/oficial exige publicação acessível, formato 1 e hash íntegro.
Publicação e retirada exigem ownership; retirada tem API/hook, sem ação na UI.
Contratos e limites em [AI/API.md](../AI/API.md).

### Itens de Checklist

- `createChecklistItem`
- `updateChecklistItem`
- `deleteChecklistItem`
- `listChecklistItems`

### Versões de Checklist

- `listChecklistVersions`
- `publishChecklistVersion`
- `retireChecklistVersion`

### Inspeções

- `createInspection`
- `getInspectionById`
- `listInspections`
- `deleteInspection`

### Respostas da Inspeção

- `listInspectionResponses`
- `saveInspectionResponse`
- `finishInspection`

Os contratos de inspeção preservam compatibilidade progressiva:

- `createInspection` aceita `checklistVersionId` publicado e, quando omitido,
  resolve a publicação mais recente no servidor;
- a criação persiste inspeção e snapshot histórico na mesma transação;
- `saveInspectionResponse` usa `snapshotItemId` e aceita temporariamente o
  `checklistItemId` legado, nunca os dois ao mesmo tempo;
- consultas de inspeção e não conformidade retornam o conteúdo do snapshot, não
  o estado atual do checklist.
- `saveInspectionResponse` e `finishInspection` aceitam metadados opcionais de
  operação offline; a Server Function usa o usuário da sessão e o backend grava
  a deduplicação na mesma transação da mutação.

### Normas

- `getStandardById`
- `listStandards`

### Não Conformidades

- `createNonConformity`
- `getNonConformityById`
- `listNonConformities`
- `updateNonConformity`
- `deleteNonConformity`

### Ações Corretivas

- `createCorrectiveAction`
- `listCorrectiveActions`
- `updateCorrectiveAction`
- `deleteCorrectiveAction`

### Evidências

- `uploadEvidence` (`FormData`, imagem e exatamente um contexto histórico);
- `listEvidence`;
- `removeEvidence` (remoção externa e soft delete compensado).

O upload é assinado exclusivamente no servidor por uma implementação de
`StorageService`. O cliente nunca recebe o segredo do Cloudinary. O contrato
detalhado, validações e erros estão documentados em
[AI/API.md](../AI/API.md).

### Exemplo técnico

- `getGreeting`

### Relatórios e dashboard

- `listAvailableInspectionReports`
- `getInspectionReport`
- `getDashboard`

Consultas limitadas às inspeções do usuário da sessão. Relatório é montado sob
demanda, sem inserir Report ou armazenar PDF; a UI imprime pelo navegador.

---

## 10.6 Funcionalidades Ainda Não Implementadas na API

Os seguintes módulos estão previstos no projeto ou modelados parcialmente no
banco, mas ainda não possuem API completa:

- usuários administrativos;
- criação integral de inspeção offline;
- reconciliação assistida de conflitos;
- sincronização de evidências binárias offline.

---

## 10.7 Observação sobre REST

Uma API REST tradicional ou Route Handlers de outro framework podem ser
avaliados em evolução futura. O contrato real da aplicação é a camada de Server
Functions documentada em [AI/API.md](../AI/API.md).

Esta especificação teve origem na documentação acadêmica da Atividade 2 e foi
mantida como referência permanente após a evolução da implementação.
