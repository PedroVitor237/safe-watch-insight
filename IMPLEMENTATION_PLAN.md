# IMPLEMENTATION_PLAN.md

# Plano de Implementação

## Safe Watch Insight

Este documento define a ordem oficial de implementação da plataforma.

Toda implementação deve seguir este plano, respeitando a arquitetura definida em:

- AGENTS.md
- PROJECT_CONTEXT.md
- Architecture.md
- BusinessRules.md
- Database.md
- API.md
- Offline.md

Não implementar funcionalidades fora da ordem sem necessidade.

---

# Objetivos da Implementação

A implementação deve:

- substituir gradualmente os dados mockados;
- preservar o frontend existente;
- implementar um backend consistente;
- integrar Prisma ORM;
- integrar PostgreSQL (Neon);
- preparar a aplicação para funcionamento offline;
- manter a arquitetura desacoplada para permitir avaliação futura de migração de framework, se necessário.

---

# Estratégia Geral

O projeto será desenvolvido em pequenas etapas.

Cada etapa deve:

- ser funcional;
- ser testável;
- não quebrar funcionalidades existentes;
- preservar a arquitetura.

Ao finalizar uma etapa, executar testes antes de iniciar a próxima.

---

# Fase 0 — Preparação do Ambiente

## Objetivo

Preparar toda a infraestrutura do projeto.

### Tarefas

- Configurar variáveis de ambiente.
- Configurar Prisma.
- Configurar Neon PostgreSQL.
- Configurar Prisma Client.
- Executar primeira migration.
- Executar seeds iniciais.
- Validar conexão com o banco.

### Resultado esperado

Projeto conectado ao PostgreSQL utilizando Prisma.

---

# Fase 1 — Estrutura Base do Backend

## Objetivo

Criar toda a arquitetura do backend.

### Criar

- repositories/
- services/
- validators/
- schemas/
- types/

### Implementar

- Prisma Client
- Tratamento global de erros
- Estrutura padrão de respostas
- Utilitários

### Resultado esperado

Backend preparado para desenvolvimento.

---

# Fase 2 — Autenticação

## Objetivo

Implementar autenticação básica.

### Funcionalidades

- Login
- Logout
- Hash de senha
- Usuário autenticado

### Tecnologias

- bcrypt
- Zod

### Futuro

Avaliar JWT somente se houver necessidade em uma etapa posterior. A entrega atual utiliza sessões.

---

# Fase 3 — Empresas

## Objetivo

Substituir mocks de empresas.

### Implementar

CRUD completo.

### Operações

- Criar empresa
- Atualizar empresa
- Listar empresas
- Consultar empresa
- Excluir empresa

### Regras

- CNPJ único
- Campos obrigatórios
- Validação

---

# Fase 4 — Checklists

Implementar CRUD completo.

### Funcionalidades

- Templates
- Duplicação
- Ativar
- Desativar

---

# Fase 5 — Itens do Checklist

Implementar:

- criação;
- edição;
- remoção;
- ordenação.

Também implementar associação entre itens e normas.

---

# Fase 6 — Normas

Implementar:

- consulta;
- pesquisa;
- filtros.

Inicialmente utilizar dados previamente cadastrados.

---

# Fase 7 — Inspeções

Esta é a principal etapa do projeto.

Implementar:

- iniciar inspeção;
- salvar inspeção;
- editar;
- concluir;
- listar.

Substituir completamente os mocks existentes.

---

# Fase 8 — Respostas da Inspeção

Implementar:

- salvar respostas;
- atualizar respostas;
- observações.

---

# Fase 9 — Não Conformidades

Implementar:

- criação;
- edição;
- consulta;
- alteração de status.

---

# Fase 10 — Ações Corretivas

Implementar:

- criação;
- atualização;
- conclusão;
- acompanhamento.

---

# Fase 11 — Evidências

Primeira implementação.

Implementar:

- upload;
- armazenamento da URL;
- associação à inspeção.

Preparar integração com Cloudinary.

---

# Fase 12 — Relatórios

Implementar:

- geração;
- consulta;
- download.

Primeira versão pode utilizar HTML convertido para PDF.

---

# Fase 13 — Dashboard

Substituir dados mockados.

Indicadores:

- inspeções;
- empresas;
- não conformidades;
- ações corretivas.

---

# Fase 14 — Offline

Primeira preparação.

Implementar:

- estrutura do IndexedDB;
- camada de persistência local;
- abstração para sincronização.

A sincronização completa poderá ficar para uma versão futura.

---

# Fase 15 — Refatoração

Revisar:

- Services
- Repositories
- Hooks
- Componentes

Eliminar duplicações.

---

# Fase 16 — Testes

Executar:

- testes manuais;
- validação de formulários;
- fluxo completo da inspeção.

---

# Ordem de Integração

A substituição dos mocks deve ocorrer na seguinte ordem:

1. Empresas
2. Checklists
3. Itens
4. Normas
5. Inspeções
6. Respostas
7. Não conformidades
8. Ações corretivas
9. Evidências
10. Relatórios
11. Dashboard

---

# Critérios de Conclusão

Cada etapa será considerada concluída quando:

- utilizar Prisma;
- não utilizar mocks;
- possuir validação;
- seguir Architecture.md;
- seguir BusinessRules.md;
- seguir Database.md;
- seguir API.md;
- funcionar corretamente no frontend.

---

# Padrões Obrigatórios

Sempre utilizar:

- TypeScript estrito
- Zod
- Prisma
- Repository Pattern
- Service Layer
- React Query

Nunca:

- acessar Prisma diretamente pelas rotas;
- implementar regras de negócio no frontend;
- utilizar `any`;
- duplicar código.

---

# Objetivo Final

Ao término deste plano, a plataforma deverá possuir um backend funcional, integrado ao banco de dados PostgreSQL, substituindo completamente os dados mockados do frontend e mantendo compatibilidade com futuras evoluções, incluindo sincronização offline, upload de imagens, autenticação avançada e eventual avaliação de migração de framework.
