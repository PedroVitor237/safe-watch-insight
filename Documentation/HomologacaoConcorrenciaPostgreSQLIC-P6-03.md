# IC-P6-03 — homologação de concorrência em PostgreSQL real

**Data:** 12 de outubro de 2026, America/Fortaleza.

**Resultado:** aprovado nos cenários locais descritos abaixo, com uma correção
de classificação de colisão global de UUID. Integração em `main` depende de
revisão humana. Este resultado não homologa Neon, dispositivos físicos,
carga ampla nem suporte offline completo.

## Baseline e ambiente

Após `git fetch origin`, `origin/main` e a consulta remota de `main` confirmaram
`9514971991986de5417549c6d25f7f068d875da8` (merge da PR #5). A árvore inicial estava
limpa, na branch `fix/ic-p6-03-inspection-conclusion-atomicity`, com HEAD
`0cce3ad89af7983bb0eff88c59963223ea068bde`. A branch
`test/ic-p6-03-postgres-concurrency` não existia localmente nem no remoto e foi
criada de `origin/main`. Após a pausa/reinício do notebook, a baseline remota foi
conferida novamente e permanecia a mesma; as alterações locais foram preservadas.

| Componente                       | Ambiente efetivamente testado                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Banco                            | **PostgreSQL 18.4**, Linux x86_64, 64 bits; `version()` informa compilação por GCC 7.5.0 (Ubuntu 7.5.0-3ubuntu1~18.04)                       |
| Distribuição dos binários locais | `@embedded-postgres/linux-x64@18.4.0-beta.17`; o sufixo pertence ao pacote distribuidor, enquanto o servidor reporta PostgreSQL 18.4         |
| Runtime                          | Node 22.23.2, conforme `.nvmrc`                                                                                                              |
| ORM / driver                     | Prisma Client e adapter-pg 7.9.1; pg 8.22.0                                                                                                  |
| Navegador                        | Chromium/Chrome for Testing **151.0.7922.34**, Playwright 1.62.1                                                                             |
| HTTP                             | Servidor TanStack Start/Vite local, porta dinâmica, sessão HTTP-only real; nenhum RPC de concorrência foi substituído por resultado simulado |
| Persistência cliente             | IndexedDB real no Chromium, Dexie e funções reais de fila/sincronização                                                                      |

Não havia Docker Compose ou infraestrutura de concorrência PostgreSQL no
repositório. O daemon Docker estava inacessível por permissão, inclusive na
tentativa fora do sandbox. Foram usados binários locais em `/tmp`, com
SHA-512 conferido contra o metadado do pacote npm e SHA-256 do Node conferido
contra o arquivo oficial de checksums. Não houve instalação no sistema.

Cada execução criou um cluster novo por `initdb`, limitado a loopback e socket
temporário, e um banco vazio. Aplicou as **seis migrations existentes**, sem
alterá-las, e não executou Demo Seed nem Platform Seed. Os fixtures usam contas
temporárias `@test.invalid`, senhas com bcrypt e conteúdo próprio criado pelos
Services. O cluster inteiro, com fixtures, triggers e tabelas de observação,
foi removido ao final, inclusive nas execuções com falhas.

A major vigente do Neon não está fixada na documentação e não foi consultada.
A major 18 foi escolhida por corresponder à homologação local anterior registrada
em [OfficialTemplates.md](../AI/OfficialTemplates.md). Não se afirma equivalência
da configuração, versão, latência ou pooler do Neon. Nenhuma conexão com
produção, banco de demonstração ou Neon foi realizada nesta tarefa.

## Método e evidências de atomicidade

Os testes chamam Services/Repositories reais, Prisma e PostgreSQL. Duas
transações concorrentes usam conexões independentes do pool da aplicação.
Outro pool controla barreiras e observa `pg_stat_activity`, `pg_blocking_pids`,
PIDs, transações e estado persistido.

Triggers exclusivos do cluster de teste pausam a primeira transação depois
de ela adquirir o bloqueio da inspeção, ou depois do INSERT de confirmação.
O controlador mantém um advisory lock; a primeira transação espera nele.
A segunda requisição só é disparada após observar essa espera. A barreira só
é liberada após observar a segunda conexão bloqueada pela primeira. Não há
sleep usado para escolher um vencedor; intervalos de 10 ms apenas sondam uma
condição observável, com timeout de 8 segundos.

Uma reexecução identificou amostragem transitória: `pg_blocking_pids` já mostrava
o bloqueador enquanto `wait_event` ainda aparecia NULL. O observador foi corrigido
para exigir ambos antes de avançar; nenhuma alteração da aplicação foi necessária
por essa falha do instrumento. A execução final passou com o observador corrigido.

Os triggers de rastreamento gravam tipo de mutação, inspeção, PID, identificador
de transação e isolamento. Seus registros participam do mesmo commit/rollback
da aplicação. Assim, retries idênticos precisam produzir **zero mutações novas**,
e rollback precisa descartar também o rastreamento das escritas abortadas.
Foram observados `read committed` e PIDs/transações diferentes em gravação
seguida de conclusão. Por exemplo, na execução final HTTP de fila concorrente,
o log registrou bloqueador `20486`, concorrente `20489` e espera `transactionid`.
Os números variam a cada execução; os testes exigem que sejam distintos.

O contrato público de conclusão **não recebe revisão da inspeção**. A revisão
esperada é `InspectionResponse.updatedAt`, usada na sincronização de respostas.
“Mesma revisão na conclusão” foi exercitada como duas requisições partindo da
mesma inspeção/estado, sem inventar um campo ou mudar o contrato.

## Cenários e estado persistido

As expectativas abaixo foram verificadas por assertions sobre resultados de API,
linhas persistidas e, quando indicado, rastreamento de mutações. Os fixtures têm
um item obrigatório e um opcional; concluir com uma resposta também comprova
que o opcional pendente não invalida a conclusão.

| Cenário                                                                 | Resultado esperado e obtido após a correção                                                   | Evidência persistida                                                                                                                  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Duas conclusões distintas da mesma inspeção                             | Uma tem sucesso; a outra recebe `CONFLICT`, status lógico 409, após espera                    | `COMPLETED`; uma resposta preservada; uma confirmação `FINISH_INSPECTION`; um UPDATE de conclusão                                     |
| Duas edições da mesma revisão                                           | Primeira aceita; segunda 409 sem sobrescrita                                                  | Observação vencedora; mesmo ID de resposta; revisão avançada; somente uma nova confirmação e um UPDATE de resposta                    |
| Revisões antiga e nova competindo                                       | Edição baseada na revisão nova aceita; revisão antiga continua rejeitada depois da espera     | Observação mais recente preservada; nenhuma confirmação da operação obsoleta                                                          |
| Duas criações esperando ausência de resposta                            | Uma criação; outra 409                                                                        | Uma resposta, uma NC e uma confirmação                                                                                                |
| Mesmo UUID e payload canônico de resposta, simultaneamente              | Ambas retornam sucesso e o mesmo recurso                                                      | Uma resposta/NC/confirmação; uma única transação de mutação; nenhuma revisão adicional pelo retry                                     |
| Mesmo UUID/payload de conclusão, simultaneamente                        | Ambas retornam sucesso                                                                        | Uma transição `COMPLETED` e uma confirmação de conclusão                                                                              |
| Mesmo UUID de resposta, observações divergentes                         | Payload diferente recebe 409                                                                  | Observação original e uma confirmação; nenhuma segunda escrita                                                                        |
| Mesmo UUID de conclusão, horário cliente divergente                     | Hash diferente recebe 409                                                                     | Uma confirmação de conclusão, sem reexecutar a transição                                                                              |
| Último obrigatório sendo salvo antes da conclusão                       | Conclusão espera e valida a resposta já confirmada                                            | `COMPLETED`, resposta com o ID retornado pela gravação; duas transações/PIDs de mutação distintos                                     |
| Edição antes da conclusão                                               | Edição e conclusão têm sucesso, nessa ordem                                                   | Observação atual preservada; mesma resposta; NC arquivada quando a edição muda para `COMPLIANT`                                       |
| Conclusão antes de nova edição                                          | Conclusão aceita; edição offline nova 409                                                     | Estado concluído e resposta original preservados; retry do UUID de resposta já confirmado continua bem-sucedido e não muda o banco    |
| Falha de confirmação após resposta/NC/estado                            | Exceção de banco provoca rollback; concorrente desbloqueado consegue salvar                   | Só resposta/NC/confirmação do concorrente persistem; UUID da operação abortada permanece disponível para tentativa posterior          |
| Falha de confirmação da conclusão                                       | Sem conclusão parcial; mesmo UUID pode ser reenviado após remover a falha injetada            | Estado e filhos iguais ao anterior após rollback; retry muda para `COMPLETED` com uma confirmação                                     |
| Ownership durante lock do proprietário                                  | Outro usuário recebe 404; sessão ausente recebe 401; `userId` forjado no payload não autoriza | Nenhuma confirmação atribuída ao usuário alheio; só a operação do proprietário persiste                                               |
| Mesmo UUID em inspeções e proprietários distintos, resposta e conclusão | Primeira aceita; segunda aguarda o índice único e retorna 409                                 | Uma linha global de confirmação; inspeção perdedora e todos os filhos iguais ao estado anterior                                       |
| Duas abas enviando o mesmo UUID da fila de resposta                     | Ambas confirmam pelo HTTP real                                                                | IndexedDB sem operação pendente; uma resposta, uma NC, uma confirmação com o UUID local                                               |
| Duas abas enviando a mesma conclusão da fila                            | Ambas confirmam                                                                               | `COMPLETED`; respostas/snapshot preservados; uma nova confirmação e um UPDATE; fila vazia                                             |
| Caches IndexedDB independentes, mesma revisão esperada                  | Vencedor confirma; perdedor bloqueia a fila em `CONFLICT`                                     | Banco contém observação vencedora; cache perdedor retém seu UUID, payload e observação; nenhuma confirmação perdedora                 |
| Resposta HTTP perdida depois do commit                                  | Manager reconhece `NETWORK_ERROR` e mantém o UUID para retry                                  | Operação local `PENDING`; uma confirmação remota já existe; retry exato esvazia a fila sem alterar estado ou rastreamento de mutações |

As Server Functions testadas retornaram **HTTP 200** para resultados de domínio,
inclusive `CONFLICT`/409, `NOT_FOUND`/404 e `UNAUTHORIZED`/401 **no envelope**.
O teste de transporte encaminha a requisição real, espera a resposta após commit
e então aborta sua entrega ao cliente; não simula sucesso de banco.

## Defeito reproduzido e correção

Na baseline, **16/18 testes PostgreSQL** e **7/9 testes HTTP** passaram. As duas
falhas em cada suíte eram colisões deliberadas do mesmo UUID entre inspeções
distintas, uma em resposta e outra em conclusão. A inspeção perdedora e seus
filhos permaneceram íntegros por rollback, mas Prisma lançou `P2002` ao inserir
`OfflineSyncOperation.id`. Pelo HTTP, o Start retornou 200 com exceção serializada,
que o cliente relançou; não foi recebido o envelope `CONFLICT` esperado.

O bloqueio por inspeção serializa operações da **mesma inspeção**. Ele não
serializa duas inspeções diferentes, enquanto a PK do UUID é global.
Ambas podiam ler ausência de confirmação e executar mutações locais em suas
transações. A segunda inserção então esperava pelo índice único, falhava após
o commit da primeira e abortava sua transação. Nenhum caso reproduziu perda
de resposta ou segunda mutação confirmada.

`persistOfflineOperation`, no helper de persistência já existente, agora converte
**somente `P2002` do INSERT dessa tabela** em
`OfflineOperationPayloadConflictError`. A única constraint UNIQUE nessa tabela
é sua PK de operação. A exceção continua abortando a transação; os Services
já a traduzem para o conflito de UUID divergente. Não é feita nova consulta
dentro da transação abortada, não é retornado recurso de outro proprietário,
e erros diferentes continuam propagando. Os dois Repositories usam esse helper.

As quatro regressões PostgreSQL/HTTP passam após a correção. Os bloqueios,
isolamento, hashes, revisões e regras de conclusão da PR #5 foram preservados.
Não houve alteração de schema, migration, frontend, rotas ou contrato cliente.

## Distinção entre conflitos, espera, erro de banco e transporte

| Situação                        | Evidência e classificação                                                                                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conflito da aplicação           | `Result.success=false`, `code=CONFLICT`, `statusCode=409`; HTTP 200 nas Functions atuais; nenhuma mutação perdedora                                                                            |
| Espera PostgreSQL               | PIDs distintos e `pg_blocking_pids`; primeira espera `advisory` na barreira, segunda `transactionid` no lock/índice da aplicação; espera termina em commit ou rollback, sem ser por si um erro |
| Serialização                    | Controle separado no schema de teste com `RepeatableRead`: alteração concorrente provoca SQLSTATE **40001**; apenas o incremento confirmado persiste                                           |
| Deadlock                        | Controle separado com duas linhas e ordem inversa de aquisição provoca SQLSTATE **40P01**; ambas as transações são encerradas por rollback                                                     |
| Falha de banco injetada         | Trigger de confirmação provoca SQLSTATE **23514**; o ORM propaga uma exceção, e a unidade inteira sofre rollback; não é convertida em conflito de UUID                                         |
| Falha transitória de transporte | Entrega HTTP abortada após commit; manager identifica `NETWORK_ERROR`, retém UUID e permite retry idempotente                                                                                  |

40001/40P01 foram provocados somente nos controles SQL, não nas operações de
aplicação. Não foi observado deadlock/erro de serialização nos cenários de
resposta/conclusão. Isso não prova ausência desses erros sob outras operações
ou carga. A aplicação não recebeu retry automático geral para erros PostgreSQL.

## Reprodução e verificações finais

Com dependências instaladas, Node 22 e Chromium do Playwright disponíveis:

```bash
# Padrão: container novo postgres:18.4, tmpfs, porta somente em loopback.
npm run test:integration:concurrency

# Alternativa executada nesta homologação: binários PostgreSQL 18 locais.
CONCURRENCY_POSTGRES_BIN=/caminho/postgresql/bin npm run test:integration:concurrency

# Tipagem estrita do runner e dos testes, além da configuração principal.
npm exec -- tsc --noEmit -p tests/integration/tsconfig.json
```

Binários portáveis podem exigir `LD_LIBRARY_PATH` para suas bibliotecas.
O runner não aceita URL de banco existente: gera sua própria configuração,
sobrescreve `DATABASE_URL` nos subprocessos e exige um token temporário no
schema do banco antes de importar o singleton Prisma nos testes. `.env` não é
carregado pelo runner/harness; Vite/Prisma recebem a configuração local gerada.
Saídas do CLI de migration são capturadas e URLs de banco são redigidas.
O caminho Docker foi implementado, mas **não executado**, pelo bloqueio do daemon.

| Verificação                                          | Resultado final                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| Integração PostgreSQL                                | **18/18**, zero falhas/cancelamentos/skips                          |
| Chromium HTTP/IndexedDB                              | **10/10**                                                           |
| Suíte `npm test`                                     | **173/173**                                                         |
| TypeScript principal e integração                    | Aprovados                                                           |
| ESLint                                               | Zero erros, os mesmos seis warnings react-refresh em componentes UI |
| Build                                                | Aprovado, artefato Vercel local, sem deploy                         |
| Prettier dos arquivos alterados / `git diff --check` | Aprovados                                                           |

Build mantém os avisos conhecidos de `inputValidator` depreciado, diretivas
`use client`, chunks grandes, imports externos não usados, opção `platform`
e chunk circular pg/pg-pool. A reordenação gerada de `routeTree.gen.ts` foi
descartada e não integra a entrega. Logs temporários desta execução:
`/tmp/ic-p6-03-postgres-baseline-restored.log`,
`/tmp/ic-p6-03-postgres-corrected.log`, `/tmp/ic-p6-03-postgres-final.log`,
`/tmp/ic-p6-03-full-tests.log`, `/tmp/ic-p6-03-build.log` e demais logs de checks.
Eles podem ser removidos pelo sistema; as assertions e os resultados factuais
acima ficam versionados.

O pg 8.22.0 também emitiu `DeprecationWarning` para `client.query` chamado
enquanto outra consulta executa no mesmo cliente. Não houve falha associada
nos cenários homologados; não se alterou o driver nem se validou pg 9.

## Arquivos e limites de entrega

- `src/server/repositories/offline-sync-operation.ts`: classifica a colisão de PK.
- `src/server/repositories/inspection-response.repository.ts` e `inspection.repository.ts`: usam o helper para a confirmação transacional.
- `scripts/test-postgres-concurrency.ts` e `package.json`: execução descartável e comando de homologação.
- `tests/integration/postgres-harness.ts`: guard, fixtures, barreiras SQL, observação e rastreamento.
- `tests/integration/inspection-concurrency.test.ts`: 18 cenários de PostgreSQL real.
- `tests/integration/inspection-concurrency.spec.ts`, `playwright.config.ts` e `tsconfig.json`: HTTP, abas, caches/fila reais e configuração estrita.
- `AI/Architecture.md`, `AI/API.md`, `AI/BusinessRules.md`, `AI/Offline.md`: precisão de contrato/evidência, vinculada a este relatório.
- Este relatório e `RelatorioAuditoriaTecnicaPreEscritaTCC.md`: resultado e atualização posterior, preservando a auditoria histórica.

O **SHA final da entrega** e a lista Git dos arquivos são publicados na descrição
da PR e na resposta de entrega após o commit; um documento versionado não pode
registrar o próprio hash final. Baseline exata consta no início deste relatório.
A branch é enviada normalmente para origin, com PR para `main`, sem merge ou
auto-merge. Nenhum push direto para `main` é autorizado por esta homologação.

Permanecem sem verificação: Neon dedicado, diferenças de pooler/rede/latência,
dispositivos físicos independentes, múltiplos servidores, outros navegadores,
carga ampliada/timeouts e fluxos autenticados no domínio publicado. Não havia
ambiente Neon isolado explicitamente autorizado para esta tarefa; o banco
configurado não foi usado. Não se repetiu a homologação PWA ampla, criação
offline, reconciliação assistida nem evidências binárias. Chamadas diretas sem
metadados de revisão continuam sem controle otimista, conforme o contrato.

Referências primárias de interpretação: [PostgreSQL 18 — isolamento](https://www.postgresql.org/docs/18/transaction-iso.html),
[PostgreSQL 18 — locks de linha e deadlocks](https://www.postgresql.org/docs/18/explicit-locking.html)
e [Prisma — transações](https://www.prisma.io/docs/orm/fundamentals/transactions).
