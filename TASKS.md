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

- [ ] Configurar arquivo `.env`
- [ ] Configurar conexão com Neon PostgreSQL
- [ ] Configurar Prisma ORM
- [ ] Gerar Prisma Client
- [ ] Executar primeira migration
- [ ] Criar seed inicial
- [ ] Testar conexão com o banco

---

# FASE 1 — Arquitetura Base

## Estrutura

- [ ] Criar pasta `repositories`
- [ ] Criar pasta `services`
- [ ] Criar pasta `validators`
- [ ] Criar pasta `schemas`
- [ ] Criar pasta `types`

## Infraestrutura

- [ ] Criar instância única do Prisma Client
- [ ] Criar tratamento global de erros
- [ ] Criar padrão de respostas da API
- [ ] Criar utilitários compartilhados

---

# FASE 2 — Usuários

## Modelagem

- [ ] Implementar UserRepository
- [ ] Implementar UserService
- [ ] Criar schemas Zod

## Funcionalidades

- [ ] Criar usuário
- [ ] Atualizar usuário
- [ ] Consultar usuário
- [ ] Listar usuários

---

# FASE 3 — Autenticação

- [ ] Implementar login
- [ ] Implementar logout
- [ ] Implementar hash de senha
- [ ] Validar credenciais
- [ ] Preparar arquitetura para JWT

---

# FASE 4 — Empresas

## Backend

- [ ] Criar CompanyRepository
- [ ] Criar CompanyService
- [ ] Criar validações

## CRUD

- [ ] Criar empresa
- [ ] Atualizar empresa
- [ ] Consultar empresa
- [ ] Listar empresas
- [ ] Excluir empresa

## Frontend

- [ ] Remover mocks
- [ ] Integrar React Query
- [ ] Validar formulários

---

# FASE 5 — Checklists

## Backend

- [ ] ChecklistRepository
- [ ] ChecklistService

## CRUD

- [ ] Criar checklist
- [ ] Atualizar checklist
- [ ] Duplicar checklist
- [ ] Ativar checklist
- [ ] Desativar checklist
- [ ] Excluir checklist

---

# FASE 6 — Itens do Checklist

- [ ] Criar item
- [ ] Atualizar item
- [ ] Excluir item
- [ ] Reordenar item
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

- [ ] InspectionRepository
- [ ] InspectionService

## Funcionalidades

- [ ] Criar inspeção
- [ ] Editar inspeção
- [ ] Salvar rascunho
- [ ] Finalizar inspeção
- [ ] Consultar inspeção
- [ ] Listar inspeções

---

# FASE 9 — Respostas da Inspeção

- [ ] Registrar resposta
- [ ] Editar resposta
- [ ] Salvar observações

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

- [ ] Validar entradas com Zod
- [ ] Revisar permissões
- [ ] Sanitizar entradas
- [ ] Revisar tratamento de erros

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

- [ ] Backend funcional
- [ ] Banco PostgreSQL integrado
- [ ] Prisma funcionando
- [ ] CRUD de empresas
- [ ] CRUD de checklists
- [ ] CRUD de inspeções
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
