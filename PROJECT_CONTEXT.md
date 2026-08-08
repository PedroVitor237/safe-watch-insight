# PROJECT_CONTEXT.md

# Safe Watch Insight

## Contexto do Projeto

Este documento apresenta uma visão geral do projeto Safe Watch Insight e deve ser utilizado por agentes de IA e desenvolvedores para compreender rapidamente o domínio do problema, a arquitetura da solução e o estado atual do desenvolvimento.

Para instruções de desenvolvimento, consulte o arquivo `AGENTS.md`.

---

# Visão Geral

O Safe Watch Insight é uma plataforma web desenvolvida para apoiar profissionais de Segurança e Saúde no Trabalho (SST) durante inspeções, auditorias e fiscalizações em ambientes de trabalho.

O projeto surgiu como Trabalho de Conclusão de Curso (TCC) do curso de Análise e Desenvolvimento de Sistemas, mas está sendo desenvolvido seguindo práticas de mercado para que possa evoluir futuramente para um produto real.

A plataforma busca substituir formulários em papel, planilhas e documentos dispersos por uma solução digital, organizada e rastreável.

---

# Problema

Atualmente muitos profissionais de SST realizam inspeções utilizando:

- formulários impressos;
- planilhas eletrônicas;
- documentos em PDF;
- fotografias armazenadas separadamente.

Essas informações normalmente ficam descentralizadas, dificultando:

- rastreabilidade;
- histórico de inspeções;
- acompanhamento de não conformidades;
- controle de ações corretivas;
- emissão de relatórios.

Outro problema importante é que diversas inspeções são realizadas em locais sem acesso à internet.

---

# Objetivo

Construir uma plataforma capaz de:

- realizar inspeções digitais;
- executar checklists personalizados;
- registrar evidências;
- controlar não conformidades;
- acompanhar ações corretivas;
- emitir relatórios;
- manter histórico completo das inspeções;
- funcionar online e offline.

---

# Público-Alvo

O sistema foi projetado principalmente para:

- Técnicos de Segurança do Trabalho;
- Engenheiros de Segurança do Trabalho;
- Auditores internos;
- Supervisores de SST;
- Consultores;
- Empresas prestadoras de serviços de SST.

---

# Funcionalidades Principais

## Empresas

Cadastro e gerenciamento de empresas fiscalizadas.

Informações importantes:

- CNPJ
- CNAE
- Grau de risco
- Quantidade de funcionários
- Endereço
- Observações

---

## Checklists

O sistema permite:

- criação de templates;
- checklists personalizados;
- reutilização de modelos;
- manutenção em draft e publicação de versões imutáveis;
- associação de itens às Normas Regulamentadoras.

---

## Inspeções

Cada inspeção deve registrar:

- empresa;
- responsável;
- checklist utilizado;
- versão publicada e snapshot histórico do checklist;
- respostas;
- observações;
- não conformidades;
- evidências;
- data;
- status.

---

## Não Conformidades

Cada não conformidade pode possuir:

- descrição;
- gravidade;
- prazo;
- situação;
- ações corretivas.

---

## Evidências

O sistema deve permitir o armazenamento de:

- fotografias;
- anexos;
- observações.

Nesta etapa do projeto, a estrutura será preparada para upload de imagens.

---

## Relatórios

O sistema deverá gerar relatórios contendo:

- dados da inspeção;
- empresa;
- itens avaliados;
- não conformidades;
- fundamentação normativa;
- recomendações.

---

# Normas Técnicas

A plataforma possui foco principal nas Normas Regulamentadoras (NRs).

Entretanto, a arquitetura também considera suporte futuro para:

- NBRs;
- Normas Técnicas estaduais;
- Normas do Corpo de Bombeiros;
- outras legislações relacionadas.

Os checklists poderão ser associados às normas aplicáveis.

---

# Funcionamento Offline

O funcionamento offline é um requisito essencial.

Arquitetura prevista:

Usuário

↓

Preenche inspeção

↓

IndexedDB

↓

Reconexão

↓

Sincronização automática

↓

PostgreSQL

O primeiro incremento real usa Dexie/IndexedDB para persistir inspeções já
disponibilizadas no dispositivo, sempre com seu snapshot completo. Respostas e
conclusão são gravadas localmente antes da sincronização e entram em uma fila
durável com IDs estáveis.

O servidor registra a identidade e o hash de cada operação na mesma transação da
mutação. A revisão remota de cada resposta é conferida para detectar conflito;
o sistema não aplica `Last Write Wins` em dados de inspeção. Em 7 de agosto de
2026, o ciclo online → offline → reabertura → retry → sincronização foi validado
em Chromium real, com conferência da resposta, não conformidade, snapshot e
operação idempotente no Neon. Criação integral de inspeção offline, resolução
assistida de conflito e evidências binárias offline continuam pendentes.

---

# Tecnologias

## Frontend

- React 19
- TanStack Start
- TanStack Router
- React Query
- TypeScript
- TailwindCSS

## Backend

- TanStack Start Server Functions
- TypeScript

## Banco

- PostgreSQL
- Neon

## ORM

- Prisma ORM

## Validação

- Zod

## Hospedagem

- Vercel

---

# Arquitetura

A aplicação utiliza arquitetura em camadas.

Fluxo esperado:

Frontend

↓

Server Functions / API

↓

Services

↓

Repositories

↓

Prisma

↓

PostgreSQL

Nenhuma tela deve acessar diretamente o banco.

---

# Estado Atual do Projeto

## Documentação

Concluído:

- Documento de Requisitos
- Personas
- Casos de Uso
- Diagrama de Classes
- Modelo Conceitual
- Modelo Lógico
- Modelo Físico
- Dicionário de Dados
- Especificação da API
- Schema Prisma inicial

---

## Frontend

O frontend já está implementado.

Grande parte das telas já existe.

O fluxo principal da Atividade 2 já utiliza dados reais integrados ao backend: login, empresas, checklists, itens de checklist, criação de inspeção, execução, respostas e conclusão.

Alguns módulos secundários ainda utilizam dados mockados, como dashboard,
relatórios e equipe. O antigo controle de simulação offline foi substituído por
estado real de conectividade, IndexedDB e fila de sincronização.

Normas, associação normativa aos itens, criação automática de não
conformidades e ações corretivas já utilizam persistência real.

Checklists agora possuem versões `DRAFT`, `PUBLISHED` e `RETIRED`. Toda nova
inspeção captura atomicamente um snapshot relacional da versão publicada; itens,
normas, respostas e não conformidades históricas não dependem do checklist
mutável. Inspeções anteriores à migration foram estabilizadas como backfill
legado não verificável.

As telas de inspeção e não conformidade permitem selecionar, pré-visualizar,
enviar, listar e remover evidências fotográficas reais.

O fluxo de execução de uma inspeção já aberta/listada online possui uma fundação
offline real: pacote histórico local, respostas, observações, estado local de
não conformidade, conclusão pendente, retry e indicadores de sincronização. O
manifest e o service worker são incluídos no build Vercel. O cenário completo
com fechamento/reabertura e conferência final no Neon foi validado no Chromium
contra o servidor local; o artefato Vercel também foi validado por build. O
domínio HTTPS publicado e outros navegadores ainda exigem homologação, e as
funcionalidades offline futuras impedem declarar suporte offline completo.

---

## Backend

O backend base já está implementado com TanStack Start Server Functions, Services, Repositories, Prisma ORM, PostgreSQL e validações Zod.

Módulos integrados nesta etapa:

- autenticação por sessão;
- empresas;
- checklists;
- versões e itens de checklist;
- inspeções com snapshot histórico;
- respostas vinculadas a itens do snapshot;
- conclusão de inspeção;
- normas e associação aos itens;
- não conformidades;
- ações corretivas;
- evidências fotográficas em Cloudinary, vinculadas ao contexto histórico da inspeção.

O objetivo continua sendo substituir gradualmente os mocks remanescentes por persistência real utilizando Prisma e PostgreSQL. Evidências agora possuem upload seguro no servidor, listagem, prévia e remoção lógica; arquivos ficam no Cloudinary e somente metadados são persistidos.

---

# Documentação Técnica

Os seguintes documentos devem ser utilizados como referência.

Raiz do projeto:

- AGENTS.md
- IMPLEMENTATION_PLAN.md
- TASKS.md
- CODING_STANDARDS.md

Pasta AI/

- Architecture.md
- API.md
- BusinessRules.md
- Database.md
- Entities.md
- Offline.md

Pasta Documentation/

- Documento de Requisitos
- Diagramas UML
- Modelagem do Banco
- Personas
- API REST
- Demais documentos do TCC

---

# Objetivo da Implementação

Durante esta fase do projeto o foco é:

- implementar o backend;
- integrar Prisma;
- integrar PostgreSQL;
- remover os mocks;
- manter compatibilidade com o frontend existente;
- preservar a arquitetura documentada.

---

# Objetivo Final

Ao final do desenvolvimento, o sistema deverá ser capaz de executar todo o fluxo de uma inspeção de SST:

Cadastro da empresa

↓

Seleção ou criação de checklist

↓

Publicação da versão

↓

Execução da inspeção

↓

Registro de evidências

↓

Registro das não conformidades

↓

Definição de ações corretivas

↓

Geração de relatório

↓

Consulta do histórico

↓

Sincronização quando necessário

Todo o desenvolvimento deve respeitar a documentação existente e preservar a consistência entre código, banco de dados e arquitetura.
