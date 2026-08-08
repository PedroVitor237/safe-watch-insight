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

## Prioridade vigente a partir de 6 de agosto de 2026

A numeração histórica das fases não representa mais a ordem imediata de
execução. Como operação offline é requisito central do TCC e depende do snapshot
histórico já estabilizado, a ordem vigente é:

1. concluir o marco Offline/PWA do fluxo principal;
2. validar o cenário real em navegador, reinício e reconexão;
3. implementar relatórios sem comprometer a integridade offline;
4. implementar dashboard real somente depois do marco Offline/PWA.

Esta prioridade substitui, para execução, a ordem genérica que colocava
Relatórios e Dashboard antes de Offline.

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

# Fase 10.1 — Integridade Histórica de Checklists

Etapa arquitetural prioritária concluída antes das funcionalidades que dependem
de registros históricos confiáveis.

Implementar:

- identidade reutilizável de checklist e versões numeradas;
- ciclo `DRAFT`, `PUBLISHED` e `RETIRED`;
- itens e associações normativas por versão;
- publicação imutável com autoria, data e hash SHA-256;
- próximo draft derivado para manutenção de conteúdo já publicado;
- snapshot relacional e imutável criado atomicamente com a inspeção;
- respostas e não conformidades baseadas em itens do snapshot;
- migration expansiva e backfill legado explicitamente não verificável;
- integração mínima do fluxo de edição, publicação, seleção e execução;
- testes automatizados e integração direcionados às invariantes históricas.

Resultado alcançado:

checklists podem evoluir sem alterar título, itens, ordem, obrigatoriedade ou
normas de inspeções existentes. A fase geral de testes permanece aberta para
ampliar cobertura dos demais módulos.

---

# Fase 11 — Evidências

Primeira implementação concluída.

Implementar:

- upload;
- armazenamento da URL;
- associação à inspeção.

Integração implementada com Cloudinary por uma abstração de armazenamento no
servidor. Evidências podem pertencer à inspeção que possui snapshot imutável ou
à não conformidade vinculada a um item do snapshot. PostgreSQL mantém somente
URL, identificador do provedor e metadados; arquivos binários não são gravados
no banco. A migration do MVP foi aplicada no Neon e o fluxo real autenticado de
upload, listagem e remoção foi validado com Cloudinary e PostgreSQL, incluindo
soft delete, idempotência do provedor e compensações de falha.

---

# Fase 12 — Relatórios

Planejada para depois da validação browser/E2E do marco Offline/PWA.

Implementar:

- geração;
- consulta;
- download.

Primeira versão pode utilizar HTML convertido para PDF.

---

# Fase 13 — Dashboard

Adiada até que o marco Offline/PWA esteja suficientemente completo.

Substituir dados mockados.

Indicadores:

- inspeções;
- empresas;
- não conformidades;
- ações corretivas.

---

# Fase 14 — Offline

Primeiro incremento implementado e validado no fluxo principal em Chromium.

Implementar:

- IndexedDB com Dexie e segregação por usuário;
- pacote local autocontido da inspeção e de seu snapshot histórico;
- respostas e estado local correspondente de não conformidade;
- fila FIFO durável para respostas e conclusão;
- UUID estável por operação, retry exponencial e recuperação após reinício;
- deduplicação persistida no servidor com hash de payload;
- conflito otimista por revisão da resposta, sem `Last Write Wins`;
- detecção de conectividade, sincronização automática e indicadores reais;
- manifest, service worker e cache seguro de shell/ativos.

Validado neste incremento:

- persistência e fila por testes automatizados;
- idempotência/hash e validação do contrato;
- cenário browser/E2E online → offline → reabertura → retry → reconexão → Neon;
- recuperação de falha transitória e de autenticação sem trocar o UUID da operação;
- manifest instalável, service worker, navegação offline e invalidação de cache no Chromium;
- TypeScript, lint, testes, build Vercel e Prisma;
- migration aditiva aplicada no Neon.

Continuam pendentes:

- homologação do PWA no domínio HTTPS publicado e em outros navegadores/dispositivos;
- resolução assistida de conflitos (a detecção e o bloqueio já existem);
- criação integral de inspeções offline;
- fila de binários/evidências, compressão e gestão de quota;
- Background Sync e políticas administrativas para dispositivo compartilhado.

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
3. Versões publicadas
4. Itens de versão
5. Normas
6. Inspeções e snapshots
7. Respostas
8. Não conformidades
9. Ações corretivas
10. Evidências
11. Relatórios
12. Dashboard

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
