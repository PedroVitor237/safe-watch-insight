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

O fluxo online permite selecionar, pré-visualizar, enviar, listar e remover
evidências fotográficas. Os arquivos ficam no Cloudinary e os metadados no
PostgreSQL. Upload offline permanece futuro.

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

O primeiro incremento real usa Dexie/IndexedDB para persistir inspeções do
usuário autenticado já disponibilizadas no dispositivo, sempre com seu snapshot
completo. Respostas e conclusão são gravadas localmente antes da sincronização e
entram em uma fila durável com IDs estáveis.

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

O fluxo principal já utiliza dados reais integrados ao backend: login, empresas,
checklists, itens de checklist, criação de inspeção, execução, respostas e
conclusão.

O cadastro público em `/register` recebe nome/e-mail/senha/confirmação, normaliza
e-mail, valida senha de no mínimo oito caracteres, gera bcrypt com custo 12 e
atribui `TECHNICIAN` no servidor. Não inicia sessão: encaminha para `/login`.
Autenticação usa cookie `safe_watch_session` por oito horas, HttpOnly,
SameSite=lax, Secure em produção e `SESSION_SECRET` obrigatório em produção.
O servidor reconsulta o usuário não excluído; papéis armazenados não implementam
RBAC, gestão de equipe ou administração de usuários.

Empresas e checklists pessoais têm proprietário; inspeções são isoladas por
`Inspection.userId`. NCs, ações e evidências seguem o contexto da inspeção.
Consultar/reutilizar checklist publicado não dá acesso à inspeção de outro
usuário. Regras atuais: [AI/BusinessRules.md](./AI/BusinessRules.md).

Alguns módulos secundários ainda utilizam dados mockados, como equipe. O antigo
controle de simulação offline foi substituído por
estado real de conectividade, IndexedDB e fila de sincronização.

Normas, associação normativa aos itens, criação automática de não
conformidades e ações corretivas já utilizam persistência real.

Checklists agora possuem versões `DRAFT`, `PUBLISHED` e `RETIRED`. Toda nova
inspeção captura atomicamente um snapshot relacional da versão publicada; itens,
normas, respostas e não conformidades históricas não dependem do checklist
mutável. Inspeções anteriores à migration foram estabilizadas como backfill
legado não verificável.

Conclusão exige respostas nos itens obrigatórios do snapshot; `NOT_APPLICABLE`
conta como resposta e itens opcionais podem ficar pendentes. Novas respostas
ficam bloqueadas em `COMPLETED`/`CANCELLED`; NCs, ações e evidências continuam
podendo ser mantidas após conclusão. Responsável, prazo, motivo, local, método
e custo de ação corretiva são opcionais. Concluir ações não resolve NC
automaticamente. Detalhes e concern da coerção de prazos estão em BusinessRules.

As telas de inspeção e não conformidade permitem selecionar, pré-visualizar,
enviar, listar e remover evidências fotográficas reais.

O módulo de relatórios utiliza dados reais e monta uma visão de leitura a partir
do snapshot imutável da inspeção, respostas, não conformidades, ações corretivas
e evidências ativas. A impressão e o salvamento em PDF usam o diálogo nativo do
navegador; geração customizada de PDF permanece futura.

O Dashboard MVP utiliza agregações reais e isoladas pelo usuário autenticado
para exibir inspeções por status, não conformidades, pendências, conformidade de
respostas aplicáveis em inspeções concluídas e as cinco inspeções mais recentes.
As consultas de atraso são somente leitura e não alteram estados persistidos.

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

- AI/Architecture.md
- AI/API.md
- AI/BusinessRules.md
- AI/Database.md
- AI/Entities.md
- AI/Offline.md

Pasta Documentation/

- Documento de Requisitos
- Diagramas UML
- Modelagem do Banco
- Personas
- Especificação da API
- Especificação de telas
- Mapa de navegação
- Guia do usuário
- Wireframes históricos
- Demais documentos do TCC

---

# Objetivo da Implementação

Durante a fase atual do projeto o foco é:

- estabilizar e demonstrar os relatórios reais já implementados;
- substituir os mocks remanescentes de forma gradual;
- ampliar o suporte offline sem comprometer a integridade histórica;
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

## Catálogo institucional de checklists

A Biblioteca distingue templates oficiais Safe Watch Insight de checklists
pessoais e publicados por usuários. Dois templates institucionais usam versões
publicadas e permitem criar cópias pessoais com draft v1. A carga de produção
é `npm run db:seed:platform`, após as migrations, sem executar o Demo Seed.
Fonte NR-18, regras e limites: [AI/OfficialTemplates.md](./AI/OfficialTemplates.md).

`isTemplate` e `isOfficial` são independentes: modelo pessoal mantém dono usuário;
oficial exige `isOfficial=true`, `isTemplate=true` e dono NULL. Os dois oficiais
codificados são construção (12 itens, NR-18) e altura (8 itens, NR-1/NR-6/NR-35).
Esse número não é limite imposto pelo banco. Retirada existe no backend/hook,
sem ação nas telas; a interface de histórico de versões permanece incompleta.

A ação **Copiar checklist** reutiliza a operação de derivação institucional para
checklists próprios e publicações já acessíveis. Toda cópia pertence à sessão,
começa em draft v1, tem itens independentes e pode ser publicada normalmente.
A persistência usa inserts em lote na mesma transação, corrigindo o P2003
reproduzido no Neon sem aumentar timeouts. Consultar
[AI/ChecklistCopy.md](./AI/ChecklistCopy.md).

Origem própria prefere draft, mesmo inativa; terceiro/oficial usa a publicação
acessível de maior número. Publicação para cópia exige formato 1 e hash íntegro;
criar inspeção pode aceitar formato legado 0 com hash presente sem recálculo.
Cópia não transfere oficialidade/template, inspeções, respostas, snapshots ou
tratativas. A linhagem dos itens conserva ancestral publicado anterior ao copiar
draft, sem referenciar seu item mutável. Errata bibliográfica afeta exibição e
novas cópias, sem reescrever publicações/snapshots históricos. Conferência estática
da Fase 4: [RelatorioFase4.md](./Documentation/RelatorioFase4.md).
