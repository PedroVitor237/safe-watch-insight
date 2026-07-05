# Server Architecture

Esta pasta contém toda a infraestrutura do backend do **Safe Watch Insight**.

O objetivo é manter uma arquitetura em camadas, desacoplada e reutilizável, facilitando manutenção, testes e evolução do sistema.

---

# Arquitetura Geral

```text
Frontend (TanStack Start)

        ↓

React Query

        ↓

Server Functions

        ↓

Services

        ↓

Repositories

        ↓

Prisma Client

        ↓

PostgreSQL (Neon)
```

Cada camada possui responsabilidades bem definidas e **não deve assumir responsabilidades de outras camadas**.

---

# Estrutura

```text
server/

├── prisma/
├── repositories/
├── services/
├── schemas/
├── errors/
├── responses/
├── types/
└── utils/
```

---

# Responsabilidades

## prisma/

Contém exclusivamente a configuração do Prisma.

Responsável por:

* Prisma Client Singleton
* Configuração da conexão
* Acesso ao banco

Nunca implementar regras de negócio aqui.

---

## repositories/

Responsável pelo acesso ao banco de dados.

Funções desta camada:

* consultas
* filtros
* persistência
* paginação
* operações CRUD

Repositories **não** devem conter regras de negócio.

---

## services/

Contêm toda a lógica de negócio da aplicação.

Exemplos:

* validar regras
* impedir operações inválidas
* executar fluxos
* coordenar múltiplos repositories

Services nunca devem acessar o banco diretamente.

Sempre utilizar repositories.

---

## schemas/

Validação utilizando Zod.

Todo dado recebido do frontend deve ser validado antes de chegar aos Services.

Nenhuma validação deve ser feita diretamente nas rotas.

---

## errors/

Erros padronizados da aplicação.

Exemplos:

* ValidationError
* NotFoundError
* ConflictError
* UnauthorizedError

Todos devem herdar de ApiError.

---

## responses/

Padronização das respostas retornadas para o frontend.

Exemplo:

```ts
{
    success: true,
    data: ...
}
```

ou

```ts
{
    success: false,
    error: ...
}
```

---

## types/

Tipos compartilhados entre múltiplas camadas.

Evitar duplicação de interfaces.

---

## utils/

Funções utilitárias reutilizáveis.

Exemplos:

* paginação
* tratamento de erros
* helpers

Nunca colocar regras de negócio nesta pasta.

---

# Fluxo de uma requisição

Exemplo:

```text
Tela Empresas

↓

React Query

↓

Server Function

↓

CompanyService

↓

CompanyRepository

↓

Prisma Client

↓

PostgreSQL
```

O retorno percorre o caminho inverso até o frontend.

---

# Boas práticas

* Cada Service deve possuir um Repository correspondente.
* Nunca acessar Prisma diretamente fora dos Repositories.
* Nunca acessar o banco a partir do frontend.
* Toda entrada deve ser validada com Zod.
* Toda regra de negócio deve ficar em Services.
* Toda resposta deve utilizar o padrão Result.
* Toda exceção deve utilizar os erros padronizados.

---

# Evolução do projeto

Os módulos serão implementados incrementalmente seguindo esta ordem:

1. Company
2. Authentication
3. Checklist
4. Inspection
5. NonConformity
6. Report
7. Offline Synchronization

Cada módulo deverá seguir rigorosamente esta arquitetura para manter consistência em todo o backend.
