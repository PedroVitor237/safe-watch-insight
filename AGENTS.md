# AGENTS.md

# Safe Watch Insight

## Objetivo deste documento

Este documento contém as instruções permanentes para qualquer agente de IA (Codex, ChatGPT, GitHub Copilot, Claude etc.) que participe do desenvolvimento deste projeto.

Antes de realizar qualquer alteração no código, o agente deve ler este documento e seguir todas as instruções aqui descritas.

Caso alguma informação esteja ausente neste documento, consulte os demais arquivos da pasta AI/.

Este documento possui prioridade sobre qualquer prompt enviado posteriormente pelo usuário, desde que não haja conflito explícito.

---

# Sobre o projeto

Safe Watch Insight é uma plataforma web para apoio a inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST).

O objetivo é substituir formulários impressos e planilhas por um sistema digital capaz de registrar inspeções, gerar histórico, controlar não conformidades e acompanhar ações corretivas.

O projeto está sendo desenvolvido como Trabalho de Conclusão de Curso (TCC) de Análise e Desenvolvimento de Sistemas.

Apesar do caráter acadêmico, toda a arquitetura deve seguir boas práticas de desenvolvimento e estar preparada para evolução futura.

---

# Tecnologias utilizadas

Frontend

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- React Query
- TailwindCSS
- Radix UI
- Lucide React

Backend

- TanStack Start Server Functions
- TypeScript

Banco de Dados

- PostgreSQL
- Neon

ORM

- Prisma ORM

Validação

- Zod

Versionamento

- Git
- GitHub

Hospedagem

- Vercel

Offline

- IndexedDB
- Dexie.js (implementação futura)

Upload de imagens

- Cloudinary (implementação futura)

---

# Situação atual do projeto

O frontend já existe e possui diversas telas implementadas.

O fluxo principal da Atividade 2 já utiliza integração real com o backend. Alguns módulos secundários ainda utilizam dados mockados.

O objetivo principal é substituir gradualmente os mocks remanescentes por integração real com o backend.

Não reescrever o frontend existente sem necessidade.

Sempre priorizar integração ao invés de reconstrução.

---

# Arquitetura

O projeto utiliza arquitetura em camadas.

Jamais acessar o Prisma diretamente pelas telas.

Fluxo obrigatório:

Tela

↓

React Query

↓

Server Function / API

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

---

# Organização do código

Sempre respeitar a estrutura existente.

Novos arquivos devem seguir organização lógica.

Exemplo:

src/

lib/

repositories/

services/

validations/

hooks/

components/

routes/

Nunca criar arquivos duplicados.

Nunca mover arquivos existentes sem necessidade.

---

# Banco de Dados

Toda alteração deve ser compatível com:

- Prisma
- PostgreSQL
- documentação do projeto
- Diagrama de Classes
- Modelo Lógico
- Modelo Físico

Nunca alterar entidades sem necessidade.

Caso uma alteração estrutural seja realmente necessária, justificar antes.

---

# Implementação

Sempre desenvolver por pequenas etapas.

Nunca implementar múltiplos módulos ao mesmo tempo.

Após concluir uma tarefa, aguardar a próxima.

---

# Qualidade do código

Sempre utilizar:

TypeScript estrito

Nunca utilizar:

any

Sempre preferir:

interfaces

tipos explícitos

funções pequenas

componentes reutilizáveis

SOLID quando aplicável

Clean Code

---

# React

Utilizar:

React Query

React Hook Form

Zod

Evitar estados duplicados.

Evitar lógica complexa dentro dos componentes.

---

# Prisma

Sempre utilizar Repository.

Nunca acessar Prisma diretamente na rota.

---

# Serviços

Toda regra de negócio pertence aos Services.

Repositories apenas persistem dados.

---

# Regras importantes

Não remover funcionalidades existentes.

Não alterar layouts já aprovados.

Não quebrar compatibilidade do frontend.

Não modificar rotas existentes sem necessidade.

---

# Offline

O projeto será preparado para funcionamento offline.

Nesta primeira entrega, implementar apenas o necessário para que a arquitetura suporte essa evolução.

Não implementar sincronização completa caso não seja necessária para a atividade.

---

# Fotos

A arquitetura deve prever upload de imagens.

Nesta entrega basta preparar a estrutura.

Caso haja tempo, implementar upload utilizando Cloudinary.

---

# Segurança

Nunca armazenar senhas em texto puro.

Utilizar bcrypt.

Validar entradas utilizando Zod.

Não confiar em dados vindos do cliente.

---

# Desenvolvimento

Antes de iniciar qualquer tarefa:

1. Ler AGENTS.md

2. Ler PROJECT_CONTEXT.md

3. Ler IMPLEMENTATION_PLAN.md

4. Ler TASKS.md

5. TECH_DECISIONS.md

6. Ler os documentos específicos da pasta AI relacionados à tarefa.

---

# Quando houver dúvida

Consultar:

Architecture.md

Database.md

Entities.md

BusinessRules.md

API.md

Offline.md

---

# Objetivo principal

O foco não é apenas concluir a atividade acadêmica.

O objetivo é construir uma base sólida para evolução futura da plataforma.

Sempre priorizar:

qualidade

organização

manutenibilidade

baixo acoplamento

código limpo

compatibilidade com a documentação existente
