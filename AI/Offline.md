# Offline.md

# Arquitetura Offline

Este documento define a estratégia oficial de funcionamento offline da plataforma **Safe Watch Insight**.

O suporte ao funcionamento offline é um requisito não funcional prioritário do projeto e constitui um dos principais diferenciais da solução.

Toda implementação futura deverá seguir as definições descritas neste documento.

---

# Objetivo

A plataforma deve permitir que inspeções sejam realizadas normalmente mesmo em locais sem acesso à internet.

Durante entrevistas realizadas com profissionais de Segurança e Saúde no Trabalho (SST), foi identificado que diversas inspeções ocorrem em:

- áreas industriais;
- obras;
- áreas rurais;
- minas;
- usinas;
- ambientes com sinal instável.

Por esse motivo, o sistema não pode depender continuamente de conexão com a internet.

---

# Princípio

A aplicação seguirá a estratégia **Offline First**.

Sempre que possível, as operações serão realizadas localmente.

A sincronização com o servidor ocorrerá automaticamente quando houver conexão disponível.

Fluxo esperado:

```
Usuário

↓

Executa inspeção

↓

Dados gravados localmente

↓

Internet indisponível

↓

Usuário continua trabalhando

↓

Internet retorna

↓

Sincronização automática

↓

Banco PostgreSQL
```

---

# Tecnologias

Frontend

- Progressive Web App (PWA)

Persistência local

- IndexedDB

Biblioteca recomendada

- Dexie.js

Backend

- TanStack Start Server Functions

Banco remoto

- PostgreSQL

---

# Progressive Web App

A aplicação deverá ser instalada como PWA.

Objetivos:

- funcionamento semelhante a aplicativo nativo;
- acesso rápido;
- cache local;
- instalação em smartphones;
- funcionamento offline.

---

# Dados Armazenados Localmente

Inicialmente deverão ser armazenados:

- empresas consultadas;
- checklists;
- itens dos checklists;
- normas;
- inspeções em andamento;
- respostas;
- evidências pendentes;
- fila de sincronização.

---

# IndexedDB

O IndexedDB será o banco de dados local da aplicação.

Ele armazenará temporariamente os dados até que possam ser enviados ao servidor.

Nenhum dado deverá ser perdido durante interrupções de conexão.

---

# Dexie.js

A biblioteca recomendada para acesso ao IndexedDB é o Dexie.js.

Motivos:

- API simples;
- suporte a transações;
- tipagem com TypeScript;
- excelente integração com React;
- manutenção ativa.

---

# Estratégia de Sincronização

Quando houver conexão disponível:

```
Verificar conexão

↓

Existe sincronização pendente?

↓

Sim

↓

Enviar registros

↓

Servidor valida

↓

Persistir PostgreSQL

↓

Atualizar IndexedDB

↓

Remover fila
```

---

# Ordem da Sincronização

A sincronização deverá respeitar dependências entre entidades.

Ordem sugerida:

1. Empresas

2. Checklists

3. Itens do Checklist

4. Inspeções

5. Respostas

6. Não Conformidades

7. Ações Corretivas

8. Evidências

9. Relatórios

---

# Identificadores

Todas as entidades utilizarão identificadores únicos (UUID/CUID) gerados no cliente.

Isso permitirá criar registros offline sem necessidade de consultar o servidor.

---

# Estado de Sincronização

Entidades que forem criadas localmente poderão possuir um estado de sincronização.

Exemplo:

```
PENDING

SYNCING

SYNCED

ERROR
```

Este controle facilitará futuras implementações.

---

# Resolução de Conflitos

Em versões futuras poderão ocorrer conflitos.

Exemplo:

Mesmo registro alterado em dispositivos diferentes.

Estratégia inicialmente prevista:

Last Write Wins (última alteração prevalece).

No futuro poderão ser implementadas estratégias mais avançadas.

---

# Cache

O PWA deverá manter em cache:

- HTML
- CSS
- JavaScript
- Ícones
- Fontes
- Manifest
- Recursos estáticos

Objetivo:

permitir abertura da aplicação mesmo sem internet.

---

# Dados que Não Devem Permanecer Offline

Evitar armazenar permanentemente:

- senhas;
- tokens expirados;
- informações sensíveis desnecessárias.

---

# Evidências Fotográficas

As fotografias poderão ser armazenadas temporariamente no dispositivo.

Quando houver conexão:

```
Imagem

↓

Cloudinary

↓

URL

↓

Backend

↓

PostgreSQL
```

Após sincronização bem sucedida, a cópia temporária poderá ser removida.

---

# Segurança

Mesmo em funcionamento offline:

- validar dados;
- preservar integridade;
- impedir corrupção de registros;
- evitar duplicações.

---

# Indicadores Visuais

A interface deverá informar ao usuário:

- online;
- offline;
- sincronizando;
- sincronizado;
- erro de sincronização.

Exemplos:

🟢 Online

🟡 Offline

🔄 Sincronizando

🔴 Erro

---

# Benefícios

Esta arquitetura permite:

- continuidade da inspeção;
- maior confiabilidade;
- redução de retrabalho;
- melhor experiência do usuário;
- maior aderência ao ambiente real de SST.

---

# Limitações da Primeira Entrega

Para a primeira versão do projeto (TCC), a sincronização completa poderá não estar totalmente implementada.

Entretanto, a arquitetura deverá permanecer preparada para receber:

- IndexedDB;
- Dexie.js;
- Service Workers;
- fila de sincronização;
- resolução de conflitos.

---

# Evoluções Futuras

A arquitetura foi planejada para suportar:

- sincronização automática em segundo plano;
- Background Sync;
- envio incremental;
- sincronização seletiva;
- compressão de imagens;
- sincronização por lote;
- notificações de falha;
- reenvio automático;
- controle de conflitos avançado.

---

# Compatibilidade com a Arquitetura

O funcionamento offline deve respeitar a arquitetura oficial:

```
Frontend

↓

IndexedDB

↓

Fila Local

↓

Server Functions

↓

Services

↓

Repositories

↓

Prisma

↓

PostgreSQL
```

Nenhuma implementação futura deverá violar essa separação de responsabilidades.

---

# Objetivo Final

O funcionamento offline é considerado um requisito estratégico da plataforma.

Toda decisão arquitetural deve preservar a possibilidade de execução de inspeções sem conexão com a internet, garantindo continuidade das atividades em campo, integridade dos dados e sincronização automática quando a conectividade for restabelecida.
