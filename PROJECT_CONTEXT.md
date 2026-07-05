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
- associação de itens às Normas Regulamentadoras.

---

## Inspeções

Cada inspeção deve registrar:

- empresa;
- responsável;
- checklist utilizado;
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

Nesta primeira entrega o objetivo é preparar a arquitetura para essa funcionalidade.

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

Atualmente utiliza dados mockados.

---

## Backend

Ainda será implementado.

O objetivo é substituir gradualmente todos os mocks por persistência real utilizando Prisma e PostgreSQL.

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