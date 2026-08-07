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

## Versionamento publicado

- [x] Criar versão `DRAFT` junto com o checklist
- [x] Publicar versão imutável com autoria, data e hash SHA-256
- [x] Derivar o próximo draft ao editar conteúdo já publicado
- [x] Manter ciclo `DRAFT`, `PUBLISHED` e `RETIRED` no backend
- [x] Garantir no máximo um draft e número único por checklist no banco
- [x] Listar versões e selecionar versão publicada para nova inspeção
- [x] Exibir status da versão e ação de publicação no frontend
- [ ] Implementar interface completa de histórico e retirada de versões

---

# FASE 6 — Itens do Checklist

- [x] Criar item
- [x] Atualizar item
- [x] Excluir item
- [/] Reordenar item
- [x] Associar normas
- [x] Persistir itens e metadados normativos por versão
- [x] Preservar linhagem de itens ao derivar uma nova versão

---

# FASE 7 — Normas

- [x] Popular banco com NRs
- [x] Criar consulta
- [x] Implementar busca
- [x] Implementar filtros
- [x] Exibir normas relacionadas aos itens

---

# FASE 8 — Inspeções

## Backend

- [x] InspectionRepository
- [x] InspectionService

## Funcionalidades

- [x] Criar inspeção
- [x] Criar snapshot relacional atomicamente com a inspeção
- [x] Usar apenas versão publicada para iniciar inspeção
- [x] Preservar título, descrição, itens, ordem, obrigatoriedade e normas no snapshot
- [x] Migrar inspeções existentes com backfill `UNVERIFIED_LEGACY`
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
- [x] Vincular respostas ao item histórico do snapshot
- [x] Manter compatibilidade temporária com identificadores legados

---

# FASE 10 — Não Conformidades

- [x] Criar
- [x] Editar
- [x] Alterar status
- [x] Listar
- [x] Consultar
- [x] Usar descrição e normas históricas do snapshot

---

# FASE 11 — Ações Corretivas

- [x] Criar
- [x] Atualizar
- [x] Concluir
- [x] Listar

---

# FASE 12 — Evidências

## MVP

- [x] Selecionar imagem
- [x] Upload para Cloudinary
- [x] Salvar URL
- [x] Vincular à inspeção

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
- [x] Testar upload
- [ ] Testar relatórios

## Integridade histórica direcionada

- [x] Testar isolamento de item editado, adicionado e removido
- [x] Testar isolamento de associações normativas entre versões
- [x] Testar inspeções em versões publicadas diferentes
- [x] Testar contexto histórico da não conformidade
- [x] Testar rollback transacional sem registros parciais
- [x] Validar migration e backfill dos dados existentes

## Frontend

- [ ] Validar formulários
- [ ] Validar navegação
- [ ] Validar estados de loading
- [ ] Validar mensagens de erro

---

# FASE 19 — Documentação

- [ ] Atualizar Documento de Requisitos
- [x] Atualizar Diagrama de Classes
- [x] Atualizar Modelo Físico
- [x] Atualizar Schema Prisma
- [x] Atualizar README
- [x] Documentar versões publicadas, snapshots e compatibilidade legada

---

# ENTREGA DO TCC

## Obrigatório

- [x] Backend funcional para o fluxo principal da Atividade 2
- [x] Banco PostgreSQL integrado
- [x] Prisma funcionando
- [x] CRUD de empresas
- [x] CRUD de checklists
- [x] CRUD de inspeções
- [x] Registro de não conformidades
- [x] Upload de evidências
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
