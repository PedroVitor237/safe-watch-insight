# 10. Especificação da API - Atividade 2

## 10.1 Objetivo

Este documento registra a especificação da camada de comunicação implementada na entrega atual da plataforma **Safe Watch Insight**.

Na versão da Atividade 2, a aplicação utiliza **TanStack Start Server Functions** em vez de endpoints REST tradicionais. A documentação detalhada de cada Server Function implementada está em:

```text
AI/API.md
```

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

Credenciais de demonstração criadas pelo seed:

```text
Email: admin@demo.com
Senha: Admin@123
```

---

## 10.4 Padrão de Respostas

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

### Exemplo técnico

- `getGreeting`

---

## 10.6 Funcionalidades Ainda Não Implementadas na API

Os seguintes módulos estão previstos no projeto ou modelados parcialmente no banco, mas ainda não possuem API completa nesta entrega:

- usuários administrativos;
- evidências e upload;
- relatórios reais;
- dashboard real;
- sincronização offline.

---

## 10.7 Observação sobre REST

Uma API REST tradicional ou Route Handlers de outro framework podem ser avaliados em evolução futura. Para a Atividade 2, o contrato real da aplicação é a camada de Server Functions documentada em `AI/API.md`.
