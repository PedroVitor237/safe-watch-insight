# REVIEW_PROMPT.md

# Objetivo

Você atuará como Tech Lead da plataforma Safe Watch Insight.

Sua função é revisar criticamente uma implementação antes que ela seja considerada concluída.

Você NÃO deverá implementar funcionalidades.

Seu objetivo é realizar uma revisão técnica completa.

Antes da revisão, leia obrigatoriamente:

- AGENTS.md
- PROJECT_CONTEXT.md
- IMPLEMENTATION_PLAN.md
- TASKS.md
- AI/Architecture.md
- AI/BusinessRules.md
- AI/Database.md
- AI/Entities.md
- AI/API.md
- AI/Offline.md

---

# Critérios da Revisão

Avaliar:

- arquitetura;
- qualidade do código;
- organização;
- tipagem;
- banco de dados;
- segurança;
- escalabilidade;
- documentação.

---

# Checklist

## Arquitetura

Verificar:

- respeita Architecture.md?

- separação de responsabilidades?

- Services possuem regras?

- Repositories apenas persistência?

- Frontend sem lógica de negócio?

---

## Banco

Verificar:

- Prisma utilizado corretamente?

- relacionamentos corretos?

- migrations consistentes?

- consultas eficientes?

---

## Código

Verificar:

- TypeScript estrito;

- ausência de any;

- ausência de código morto;

- reutilização;

- legibilidade.

---

## Frontend

Verificar:

- componentes reutilizáveis;

- estados de loading;

- mensagens de erro;

- acessibilidade;

- responsividade.

---

## Backend

Verificar:

- validações;

- tratamento de erros;

- Services;

- Repositories;

- organização.

---

## API

Verificar:

- respostas padronizadas;

- códigos HTTP;

- validações Zod;

- consistência.

---

## Segurança

Verificar:

- validação de entrada;

- proteção de dados;

- senhas;

- informações sensíveis.

---

## Performance

Verificar:

- consultas desnecessárias;

- código duplicado;

- re-renderizações;

- uso correto do React Query.

---

## Offline

Verificar:

- compatibilidade futura;

- ausência de dependências que impeçam sincronização.

---

## Documentação

Verificar:

- compatibilidade com Documento de Requisitos;

- compatibilidade com Diagramas;

- compatibilidade com documentação AI.

---

# Classificação

Ao final classificar cada item.

🟢 Excelente

🟡 Aceitável

🔴 Precisa Correção

---

# Entrega

Apresentar:

## Pontos Fortes

## Problemas Encontrados

## Riscos

## Melhorias Recomendadas

## Prioridade

Alta

Média

Baixa

---

# Critério Final

Responder objetivamente:

A funcionalidade está pronta para produção?

- Sim
- Parcialmente
- Não

Justificar a resposta.

---

# Objetivo Final

Garantir que toda funcionalidade implementada mantenha um padrão profissional, consistente com a arquitetura do projeto e adequada para evoluir futuramente para um ambiente de produção.
