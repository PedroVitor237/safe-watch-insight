# TASKS.md

# Backlog de Implementação

## Safe Watch Insight

Este documento contém todas as tarefas de implementação da plataforma.

Cada tarefa deve ser executada seguindo:

- AGENTS.md
- PROJECT_CONTEXT.md
- Architecture.md
- BusinessRules.md
- Database.md
- API.md
- Offline.md

Sempre concluir uma tarefa antes de iniciar outra, salvo quando houver dependência explícita.

---

# STATUS

Legenda

- [ ] Não iniciado
- [/] Em andamento
- [x] Concluído

---

# FASE 0 — Preparação do Projeto

## Ambiente

- [x] Configurar arquivo `.env.example`
- [x] Configurar conexão com PostgreSQL/Neon via `DATABASE_URL`
- [x] Configurar Prisma ORM
- [x] Gerar Prisma Client
- [x] Executar primeira migration
- [x] Criar seed inicial
- [x] Testar conexão com o banco por meio do fluxo Prisma/seed

---

# FASE 1 — Arquitetura Base

## Estrutura

- [x] Criar pasta `repositories`
- [x] Criar pasta `services`
- [x] Criar pasta `schemas`
- [x] Criar pasta `types`

## Infraestrutura

- [x] Criar instância única do Prisma Client
- [x] Criar tratamento de erros padronizado
- [x] Criar padrão de respostas da API
- [x] Criar utilitários compartilhados

---

# FASE 2 — Usuários

## Modelagem

- [x] Implementar UserRepository
- [x] Implementar UserService para autenticação e consulta por sessão
- [x] Criar schemas Zod para autenticação

## Funcionalidades

- [ ] Criar usuário
- [ ] Atualizar usuário
- [x] Consultar usuário autenticado
- [ ] Listar usuários

---

# FASE 3 — Autenticação

- [x] Implementar login
- [x] Implementar logout
- [x] Implementar hash de senha
- [x] Validar credenciais
- [ ] Avaliar JWT futuramente, se necessário

---

# FASE 4 — Empresas

## Backend

- [x] Criar CompanyRepository
- [x] Criar CompanyService
- [x] Criar validações

## CRUD

- [x] Criar empresa
- [x] Atualizar empresa
- [x] Consultar empresa
- [x] Listar empresas
- [x] Excluir empresa

## Frontend

- [x] Remover mocks do fluxo de empresas
- [x] Integrar React Query
- [x] Validar formulários pelo backend com Zod

---

# FASE 5 — Checklists

## Backend

- [x] ChecklistRepository
- [x] ChecklistService

## CRUD

- [x] Criar checklist
- [x] Atualizar checklist
- [ ] Duplicar checklist
- [x] Ativar checklist
- [x] Desativar checklist
- [x] Excluir checklist

---

# FASE 6 — Itens do Checklist

- [x] Criar item
- [x] Atualizar item
- [x] Excluir item
- [/] Reordenar item
- [ ] Associar normas

---

# FASE 7 — Normas

- [ ] Popular banco com NRs
- [ ] Criar consulta
- [ ] Implementar busca
- [ ] Implementar filtros
- [ ] Exibir normas relacionadas aos itens

---

# FASE 8 — Inspeções

## Backend

- [x] InspectionRepository
- [x] InspectionService

## Funcionalidades

- [x] Criar inspeção
- [ ] Editar inspeção
- [ ] Salvar rascunho
- [x] Finalizar inspeção
- [x] Consultar inspeção
- [x] Listar inspeções

---

# FASE 9 — Respostas da Inspeção

- [x] Registrar resposta
- [x] Editar resposta
- [x] Salvar observações

---

# FASE 10 — Não Conformidades

- [ ] Criar
- [ ] Editar
- [ ] Alterar status
- [ ] Listar
- [ ] Consultar

---

# FASE 11 — Ações Corretivas

- [ ] Criar
- [ ] Atualizar
- [ ] Concluir
- [ ] Listar

---

# FASE 12 — Evidências

## MVP

- [ ] Selecionar imagem
- [ ] Upload para Cloudinary
- [ ] Salvar URL
- [ ] Vincular à inspeção

## Futuro

- [ ] Compressão automática
- [ ] Upload offline
- [ ] Sincronização posterior

---

# FASE 13 — Relatórios

- [ ] Gerar relatório
- [ ] Consultar relatório
- [ ] Download PDF

---

# FASE 14 — Dashboard

- [ ] Integrar indicadores reais
- [ ] Remover mocks
- [ ] Atualizar gráficos

---

# FASE 15 — Offline

## Preparação

- [ ] Configurar IndexedDB
- [ ] Configurar Dexie.js
- [ ] Criar camada de persistência local

## Futuro

- [ ] Implementar fila de sincronização
- [ ] Detectar conexão
- [ ] Sincronização automática
- [ ] Resolver conflitos

---

# FASE 16 — Segurança

- [x] Validar entradas com Zod nos módulos implementados
- [ ] Revisar permissões
- [ ] Sanitizar entradas
- [x] Revisar tratamento de erros base

---

# FASE 17 — Refatoração

- [ ] Revisar Services
- [ ] Revisar Repositories
- [ ] Revisar Hooks
- [ ] Revisar Componentes
- [ ] Eliminar duplicações

---

# FASE 18 — Testes

## Backend

- [ ] Testar CRUD de empresas
- [ ] Testar CRUD de checklists
- [ ] Testar inspeções
- [ ] Testar upload
- [ ] Testar relatórios

## Frontend

- [ ] Validar formulários
- [ ] Validar navegação
- [ ] Validar estados de loading
- [ ] Validar mensagens de erro

---

# FASE 19 — Documentação

- [ ] Atualizar Documento de Requisitos
- [ ] Atualizar Diagrama de Classes
- [ ] Atualizar Modelo Físico
- [ ] Atualizar Schema Prisma
- [ ] Atualizar README

---

# ENTREGA DO TCC

## Obrigatório

- [x] Backend funcional para o fluxo principal da Atividade 2
- [x] Banco PostgreSQL integrado
- [x] Prisma funcionando
- [x] CRUD de empresas
- [x] CRUD de checklists
- [x] CRUD de inspeções
- [ ] Registro de não conformidades
- [ ] Upload de evidências
- [ ] Relatórios
- [ ] Dashboard funcional

---

# MELHORIAS FUTURAS

- [ ] JWT
- [ ] Controle de permissões
- [ ] Multiempresa
- [ ] IndexedDB completo
- [ ] Sincronização offline
- [ ] Background Sync
- [ ] Notificações
- [ ] BI
- [ ] Dashboards avançados
- [ ] Geolocalização
- [ ] Assinatura digital
- [ ] Integração com eSocial
- [ ] Consulta automática de CNAE
- [ ] Sugestão automática de normas
- [ ] IA para auxílio na elaboração de relatórios

---

# Critério de Conclusão

Uma tarefa só poderá ser marcada como concluída quando:

- estiver implementada;
- estiver compilando sem erros;
- seguir a arquitetura definida;
- possuir validações;
- utilizar Prisma quando aplicável;
- não depender de dados mockados;
- não quebrar funcionalidades existentes.

---

# Objetivo Final

Ao concluir todas as tarefas deste backlog, a plataforma deverá possuir um backend completo, integrado ao PostgreSQL via Prisma ORM, com frontend conectado aos dados reais, arquitetura preparada para evolução e documentação consistente com o projeto de TCC.
