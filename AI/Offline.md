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

## Estado do primeiro incremento — 6 de agosto de 2026

Implementado e validado por testes/build:

- banco Dexie `safe-watch-insight` sobre IndexedDB;
- tabelas locais `sessions`, `inspectionPackages` e `operations`;
- pacote autocontido por usuário para inspeções consultadas/listadas online;
- leitura do snapshot, itens e normas sem conexão;
- gravação local de respostas/observações e estado correspondente de NC;
- conclusão local após validar itens obrigatórios;
- fila FIFO com sequência, UUID estável, dependências por item, tentativas e
  próximo horário de retry;
- recuperação de operações deixadas como `SYNCING` após reinício;
- sincronização automática ao reconectar e sondagem enquanto online;
- deduplicação remota por `OfflineSyncOperation` na mesma transação da mutação;
- detecção de conflito pela revisão `InspectionResponse.updatedAt`;
- indicadores reais de conexão, fila, erro e conflito;
- manifest, service worker e ativos PWA presentes no artefato Vercel.

Ainda não validado/concluído:

- cenário browser/E2E completo com fechamento/reabertura e verificação no Neon;
- criação de uma nova inspeção sem conexão;
- reconciliação assistida de conflito (o bloqueio seguro já existe);
- armazenamento e sincronização de binários de evidência;
- Background Sync e política avançada de quota/retention.

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
- identidades de checklists;
- versões publicadas e seus itens/metadados normativos;
- normas;
- inspeções em andamento com seu snapshot completo;
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

2. Checklists e versões draft, quando a manutenção offline for implementada

3. Itens e normas das versões

4. Inspeções com snapshot

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

`Last Write Wins` poderá ser usado apenas em campos mutáveis de baixo risco.
Nunca deverá sobrescrever uma versão publicada nem reconstruir ou substituir um
snapshot já aceito pelo servidor.

Para conteúdo versionado, conflitos devem resultar em novo draft, rejeição com
reconciliação explícita ou outra estratégia que preserve ambas as revisões. Para
respostas, o servidor deve validar a identidade da inspeção e do item do
snapshot antes de aceitar o evento sincronizado.

---

# Versionamento e Snapshot no Dispositivo

O pacote local necessário para iniciar uma inspeção deve conter uma versão
`PUBLISHED` completa e identificada por `checklistVersionId`,
`contentSchemaVersion` e `contentHash`. A criação offline deve congelar desse
pacote o mesmo conteúdo relacional usado pelo servidor:

- título e descrição;
- número da versão;
- descrição, ordem e obrigatoriedade dos itens;
- IDs de linhagem;
- metadados normativos copiados.

Respostas locais devem referenciar `snapshotItemId`, nunca apenas um item do
catálogo. IDs da inspeção, snapshot e itens devem ser estáveis e gerados antes da
sincronização para permitir repetição idempotente.

Na sincronização, o servidor deverá conferir versão, hash e formato do snapshot.
Se uma inspeção já existir, o cliente não poderá trocar seu snapshot por uma
versão mais recente. Edições futuras do checklist e invalidações do cache não
alteram o pacote histórico de uma inspeção em andamento.

A implementação persiste no IndexedDB o snapshot que veio do servidor; ela não
reconstrói nem troca esse conteúdo durante a sincronização. Respostas locais
referenciam `snapshotItemId`. O primeiro incremento ainda não cria uma inspeção
inteiramente offline a partir de uma versão publicada pré-carregada.

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

O MVP online envia a imagem por Server Function para uma implementação de
`StorageService`; a fila offline futura deverá reutilizar o mesmo contrato de
domínio e nunca persistir Base64 no PostgreSQL.

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

# Limitações do Primeiro Incremento

IndexedDB, Dexie, service worker e a fila do fluxo principal já existem. Não se
deve declarar suporte offline completo antes da validação browser/E2E e da
implementação das lacunas listadas no estado acima.

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

# Protocolo Implementado de Sincronização

Para `SAVE_INSPECTION_RESPONSE`:

1. a tela grava o novo estado no pacote local;
2. cria uma operação com UUID, sequência, horário do dispositivo e revisão
   remota esperada;
3. operações repetidas no mesmo item são encadeadas e enviadas em ordem;
4. a Server Function valida Zod e associa o usuário da sessão;
5. o Service calcula SHA-256 canônico do payload;
6. o Repository confere deduplicação e revisão dentro da transação;
7. resposta, NC, estado da inspeção e registro idempotente são persistidos
   atomicamente;
8. somente após confirmação o cliente remove a operação local.

Retry do mesmo UUID com mesmo hash retorna sucesso idempotente. O mesmo UUID com
outro hash retorna conflito. Uma revisão inesperada também retorna conflito e a
fila é bloqueada para impedir que operações dependentes avancem.

Erros transitórios recebem backoff exponencial limitado a cinco minutos e até
cinco tentativas automáticas. Erro de autenticação/validação exige intervenção;
conflito nunca é reenviado automaticamente.

# Estratégia PWA Implementada

O manifest usa modo `standalone`, `start_url=/inspecoes`, tema e ícone próprios.
O service worker possui cache versionado:

- navegação: network-first e fallback apenas para rota já armazenada ou página
  offline estática;
- scripts, estilos, fontes, imagens e manifest da mesma origem: cache-first;
- Server Functions (`POST` e requisições sem destino estático) não são cacheadas;
- `/login` não é gravado no cache de navegação;
- caches de versões antigas são removidos no `activate`.

O preset Nitro/Vercel envia `application/manifest+json` para o manifest, além de
`no-cache` e escopo `/` para o service worker. Assim, o navegador não depende de
um MIME genérico e verifica atualizações do worker a cada navegação.

Como TanStack Start usa SSR, a rota precisa ter sido interceptada pelo service
worker antes de poder ser reaberta offline. Esse comportamento precisa ser
testado em Chrome/Edge/Android e no domínio HTTPS da Vercel.

# Limites de Segurança Implementados

- nenhum password, segredo Cloudinary ou conteúdo do cookie HTTP-only é copiado;
- a sessão local guarda usuário seguro e expira após oito horas;
- pacotes são indexados por usuário;
- logout limpa sessão, pacotes e fila do IndexedDB e o cache privado de navegação;
- a troca de identidade autenticada elimina dados pertencentes ao usuário anterior antes de gravar a nova sessão local;
- respostas do backend e conflitos continuam sendo validados no servidor;
- dados locais continuam acessíveis a quem controlar o perfil do navegador ou o
  sistema operacional; criptografia em repouso e MDM não pertencem ao escopo
  atual.

---

# Objetivo Final

O funcionamento offline é considerado um requisito estratégico da plataforma.

Toda decisão arquitetural deve preservar a possibilidade de execução de inspeções sem conexão com a internet, garantindo continuidade das atividades em campo, integridade dos dados e sincronização automática quando a conectividade for restabelecida.
