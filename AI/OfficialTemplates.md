# Templates oficiais da plataforma

## Estado atual — conferência documental da Fase 3

Em 3 de outubro de 2026, após o checkpoint `0a19b44`, foram conferidos catálogo,
Services/Repositories, API e telas. Os dois achados do parecer histórico
**NEEDS FIX BEFORE COMMIT** abaixo foram resolvidos pelo incremento de cópia
independente. Parecer antigo descreve o momento da auditoria, não a condição
atual. Evidência funcional posterior permanece na validação final; testes,
seeds e migrations **não foram reexecutados nesta fase documental**.

Estado vigente: templates publicados consultáveis por usuários autenticados,
cópia transacional pessoal independente e mutações institucionais bloqueadas
na API pessoal. Sem RBAC/editoria administrativa na interface. Regras:
[BusinessRules.md](./BusinessRules.md), [ChecklistCopy.md](./ChecklistCopy.md) e
[Entities.md](./Entities.md).

## Decisão e propriedade

`Checklist.isOfficial` distingue conteúdo da Safe Watch Insight de checklists
pessoais. O indicador `isTemplate` existente continua sendo uma classificação
reutilizável, não uma permissão nem uma chancela oficial. O usuário pode criar
um template pessoal, mas não pode atribuir `isOfficial`.

A migration `20261003000000_add_official_checklist_templates` adiciona
`isOfficial=false` e torna `Checklist.createdById` e
`ChecklistVersion.createdById` opcionais. Um CHECK exige:

- oficial: `isOfficial=true`, `isTemplate=true`, `createdById=NULL`;
- pessoal: `isOfficial=false`, `createdById` preenchido.

Nas versões da plataforma, criador e publicador são NULL; a autoria institucional
é identificada pelo checklist pai. Versões pessoais mantêm autores da sessão.
A restrição de publicação continua exigindo hash e data e permite publicador
NULL quando o criador é institucional. Não há usuário técnico fictício, conta
demo proprietária, painel administrativo ou nova camada RBAC.

As consultas/mutações pessoais usam `createdById` e `isOfficial=false` nos
Repositories. Os Services exigem propriedade inclusive para obter/criar drafts.
Tentativas de editar, excluir, publicar, retirar ou alterar itens oficiais
retornam `NOT_FOUND`, como outros recursos não gerenciáveis. Nenhuma Server
Function chama o bootstrap institucional.

## Catálogo inicial

| Template                                                   | Escopo                                                                          | Normas            | Itens | Publicação inicial |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------- | ----: | ------------------ |
| Construção — treinamento, escavações e transporte vertical | Capacitação, escavações/tubulões e transporte de pessoas/materiais em canteiros | NR-18             |    12 | v1 `PUBLISHED`     |
| Trabalho em altura — preparação e proteção da equipe       | Preparação de uma tarefa em altura, riscos, EPIs e emergência                   | NR-1, NR-6, NR-35 |     8 | v1 `PUBLISHED`     |

Identidades fixas, não alteradas nesta revisão:

| Conteúdo   | Checklist.id                           | Autoria/fonte                                                      |
| ---------- | -------------------------------------- | ------------------------------------------------------------------ |
| Construção | `a0180000-0000-4000-8000-000000000001` | Safe Watch Insight, baseada/adaptada de Murbach (2019), Apêndice A |
| Altura     | `a0350000-0000-4000-8000-000000000002` | Curadoria Safe Watch Insight (2026), temas de NR-1/NR-6/NR-35      |

Ambos são isOfficial=true/isTemplate=true/createdById=NULL. Bootstrap publica
formato 1 com criador/publicador NULL, data e SHA-256. Hashes registrados na
auditoria histórica do TCC:

- Construção: `08553a27db11f0792f53c979a9ec7c10d284d658a720c4eb89572ff41c578458`.
- Altura: `8c4366ebc0e76b746c0c29c6b3d288668c45377ef7eb2d88bfe88ff084c7072a`.

Não foram consultados novamente no banco. Hash depende da descrição/metadados
publicados: instalação com referência corrigida pode ter hash distinto da v1
histórica de construção. IDs de versões/itens são gerados pelo bootstrap,
não são as identidades fixas de checklist acima.

Template pessoal: isOfficial=false, dono usuário, isTemplate=true. Publicação
de usuário pode ser template pessoal ou personalizado; publicar não torna
autoria institucional. Cliente pode escolher isTemplate, sem atribuir oficialidade/
proprietário. Oficial não possui dono usuário fictício nem leitura anônima.

As definições ficam em [official-checklists.ts](../src/server/catalog/official-checklists.ts); o limite desta
entrega é de dois templates. Os itens usam `ChecklistVersionItemStandard`,
preservando IDs e metadados do catálogo `Standard`. Não se cria um catálogo legal
paralelo. No primeiro bootstrap, somente as quatro normas necessárias ausentes
são inseridas pelos códigos já documentados no catálogo da aplicação; registros
existentes nunca são sobrescritos. Norma inativa ou com tipo incompatível faz a
carga falhar explicitamente.

## Fonte acadêmica e limites

MURBACH, Tiago. **Desenvolvimento de uma ferramenta de verificação para gestão e
fiscalização da segurança do trabalho na indústria da construção**. 2019.
Monografia (Especialização em Engenharia de Segurança do Trabalho) — Universidade
Tecnológica Federal do Paraná, Curitiba.

Registro institucional: <https://riut.utfpr.edu.br/jspui/handle/1/17523> (catalogado
pela UTFPR como Trabalho de Conclusão de Curso de Especialização).

O PDF fornecido é um recorte a partir da página impressa 61 e contém o Apêndice A.
A adaptação efetivamente implementada usa:

| Itens | Seções do apêndice                            | Páginas impressas |
| ----- | --------------------------------------------- | ----------------- |
| 1–3   | Treinamento                                   | 113–114           |
| 4–7   | Escavações e tubulão a céu aberto             | 72–74             |
| 8–12  | Movimentação/transporte vertical e elevadores | 83–84             |

São perguntas reescritas e agrupadas por contexto. Não foram reproduzidos os
parâmetros numéricos, cargas horárias ou subitens normativos de 2019. Não houve
revisão normativa ampla; o template é um recorte de apoio, não uma garantia de
conformidade atual. A fonte, ano, escopo e limitações integram a descrição
versionada e seu hash, também preservados nas cópias pessoais e nos snapshots.

O segundo template é curadoria da Safe Watch Insight (2026), baseada nos temas
das normas existentes no catálogo. Nenhum dos templates é documento oficial do
governo. Não se afirma endosso de Murbach à plataforma. A monografia e o capítulo
teórico do TCC não foram alterados.

## Uso e integridade histórica

`Template oficial → Usar template → checklist pessoal + DRAFT v1`.

A sessão define o proprietário da cópia. A operação única
`ChecklistService.copyChecklist` também permite copiar checklists próprios e
publicações acessíveis de outros usuários. O Repository lê e grava com o mesmo
cliente transacional, usando inserts em lote ordenados. A cópia é
`isOfficial=false` e `isTemplate=false`, possui UUIDs próprios e mantém referências
de linhagem aos itens da origem. O título recebe “— Cópia”, seguido de numeração
quando necessário. O proprietário copia seu draft atual ou a última publicação;
terceiros copiam exclusivamente uma publicação acessível e íntegra.

A referência atual inclui a página 72. Publicações institucionais antigas não
são reescritas: uma errata bibliográfica explícita é exibida na interface e
incorporada aos drafts das novas cópias. A fonte permanece atribuída à plataforma,
baseada/adaptada de Murbach (2019). Detalhes da correção do P2003, transação,
permissões e testes: [ChecklistCopy.md](./ChecklistCopy.md).

O usuário revisa, edita e publica a cópia pelo fluxo existente. Antes de publicar,
ela permanece privada. A regra preexistente de `8c0be44` continua: checklists
ativos de outros usuários com versão publicada são legíveis e podem originar
inspeções; drafts e versões retiradas não são expostos a terceiros.

O fluxo preexistente de inspeção direta a partir de versão publicada também
aceita os templates oficiais, sempre com snapshot próprio. Isso não altera o
modelo oficial. Relatórios, dashboard e execução offline continuam usando as
inspeções e seus snapshots. Descoberta e criação de cópias exigem conexão;
não se adicionou criação offline de checklists/inspeções.

Inspeção direta da v1 histórica de construção usa descrição original, sem helper
da errata; relatório lê essa descrição no snapshot. Errata na UI/catalogação/
cópias novas não modifica snapshots existentes, publicação histórica ou relatório
derivado diretamente dela. Retirada tem API/hook para checklists pessoais,
sem ação nas telas; não existe gestão de versões institucionais pela sessão.

## Bootstrap, Demo Seed e produção

Depois de configurar `DATABASE_URL`, com Node 22 conforme `.nvmrc`:

```bash
npx prisma migrate deploy
npm run db:seed:platform
```

Execute essas etapas de implantação antes de disponibilizar a versão da
aplicação. O comando de plataforma não cria usuários, empresas ou inspeções e
não depende do Demo Seed. Nada é executado automaticamente ao iniciar o servidor.

O Demo Seed (`npm run db:seed`) chama o mesmo bootstrap antes de seu dataset
sintético. Os templates são globais, não se repetem por usuário e não substituem
os checklists demo. As contas demo e legada e seus históricos não são alterados
pelo bootstrap da plataforma.

IDs fixos identificam os dois templates. Cada criação e publicação é atômica,
usando o mesmo cálculo SHA-256, formato de conteúdo e persistência de publicação
com controle otimista das versões pessoais. Cargas repetidas não alteram IDs,
itens, hashes, datas ou versões. Cargas concorrentes resolvem a identidade única
sem criar duplicatas. Colisões com conteúdo pessoal, conteúdo indisponível ou
publicação corrompida causam erro; não há reparação silenciosa do histórico.

Alterar a definição em código não sobrescreve versões já publicadas. Uma futura
revisão institucional exige uma nova versão pelo processo de versionamento e
uma etapa de implantação específica; esta entrega não inclui gestão editorial.

## Validação reproduzível

- `npm test`: regressão e testes unitários do catálogo/seed/validação.
- `npx tsc --noEmit`, `npm run prisma:validate`, `npm run build`.
- `OFFICIAL_TEMPLATE_TEST_DATABASE=local-only npm run validate:official-templates`:
  requer `DATABASE_URL` apontando para PostgreSQL local descartável já migrado.
  Para fixtures no TCC configurado, usar confirmação explícita
  `OFFICIAL_TEMPLATE_TEST_DATABASE=configured-tcc`.
  Exercita bootstrap concorrente/repetido, dois usuários, leitura, bloqueios,
  cópia, CRUD, publicação, inspeções, relatórios e integridade. Remove somente
  os fixtures temporários; conserva o catálogo institucional.
- `npm run test:e2e:templates`: Chromium, login, distinção oficial, detalhe,
  cópia pessoal, edição e conferência da origem no banco. Usa o servidor local
  e `DATABASE_URL` de teste; cria e remove seu usuário e cópia temporários.

Não apontar validações de fixtures para produção.

## Histórico — resultado da validação inicial (3 de outubro de 2026)

Validação com Node 22.23.2 e PostgreSQL 18.4 local descartável:

| Verificação                           | Resultado                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm test`                            | 79 testes aprovados, 0 falhas                                                                                                                                |
| `npm run validate:official-templates` | 7 cenários aprovados; runner reporta 8 testes incluindo o teste pai; 0 falhas                                                                                |
| `npm run test:e2e:templates`          | 1 cenário Chromium aprovado, 0 falhas                                                                                                                        |
| `npx tsc --noEmit`                    | Aprovado; também verificados os novos scripts, seed e E2E com configuração TypeScript ampliada                                                               |
| `npm run prisma:validate`             | Schema válido                                                                                                                                                |
| `npm run lint`                        | 0 erros; 6 avisos preexistentes de Fast Refresh nos componentes de UI                                                                                        |
| `npm run build`                       | Artefato Vercel gerado com sucesso                                                                                                                           |
| Migration                             | Aplicação em banco vazio e preservação de usuários/checklist/versão/itens preexistentes verificadas; 3 alterações inválidas de autoria/publicação rejeitadas |
| Primeira carga concorrente            | Dois bootstraps simultâneos criaram somente os dois templates                                                                                                |
| Demo Seed                             | Duas execuções com o mesmo fingerprint, 4 empresas, 4 checklists pessoais, 8 inspeções, 23 respostas, 7 NCs e 5 ações                                        |
| Autorização do fluxo existente        | Regressão aprovada com dois usuários, leitura/mutação privada bloqueada e reutilização publicada preservada                                                  |
| Versionamento existente               | Regressão aprovada em banco com backfill legado real, versões v1/v2, isolamento de itens/normas, contexto da NC e rollback transacional                      |
| `git diff --check`                    | Sem erros                                                                                                                                                    |

As migrations e seeds da validação inicial acima foram executados somente em
bancos locais descartáveis. A auditoria posterior do banco TCC configurado está
registrada abaixo; nela a migration e o bootstrap foram aplicados nesse banco.
Não houve commit nem push.

## Histórico — auditoria pós-implementação no TCC (3 de outubro de 2026)

Diagnóstico anterior à correção. Seus achados/parecer foram superados pela
validação final abaixo; métodos, contagens e evidências permanecem históricos.

### Método e preservação

Foi utilizado o `DATABASE_URL` corrente, sem reset, recriação ou exclusão de
registros anteriores. Antes da migration, uma transação somente de leitura
registrou contagens e SHA-256 canônicos por linha das 19 tabelas da aplicação.
A comparação desconsidera somente a nova coluna `Checklist.isOfficial` e trata
`_prisma_migrations` separadamente. Senhas, credenciais e URLs de conexão não
integram este relatório.

O banco possuía 451 registros anteriores. Contas identificadas: legado
`admin@demo.com` e TCC `demo.user@example.test`. A verificação do Demo Seed foi
executada em modo somente de leitura, reutilizando `verifyDataset`; o Demo Seed
completo não foi executado no banco TCC.

Fingerprint inicial das tabelas/linhas:
`bb33ac6d5d34502229fb496c2a634dc296a41a499e86b6a6c3e73cce744cee4a`.

`npx prisma migrate deploy` aplicou apenas
`20261003000000_add_official_checklist_templates`. A primeira tentativa retornou
P1001 (conexão); a repetição concluiu normalmente.

### Carga institucional e autorização

`npm run db:seed:platform` foi executado duas vezes sequencialmente. A fotografia
da segunda execução foi idêntica à primeira em todas as tabelas da aplicação:
`55e53835d4f156f42607e3a490a8f3a1dd7c0c5870c00de4b930d9c5dc7584aa`.
Também foram executados dois bootstraps simultâneos no banco corrente, sobre o
catálogo já existente, sem duplicação ou atualização. Isso verifica repetição
concorrente neste banco; a corrida de primeira criação foi testada no banco
local descartável na implementação.

Foram confirmados exatamente dois templates, uma versão publicada v1 por
checklist e 12/8 itens, todos com associações válidas ao catálogo existente.
As 38 normas anteriores foram preservadas; NR-1, NR-6, NR-18 e NR-35 já estavam
presentes e ativas.

Hashes das publicações no banco TCC:

- NR-18: `08553a27db11f0792f53c979a9ec7c10d284d658a720c4eb89572ff41c578458`.
- Altura: `8c4366ebc0e76b746c0c29c6b3d288668c45377ef7eb2d88bfe88ff084c7072a`.

A revisão cobriu Server Functions, schemas, Services e Repositories de criação,
edição/exclusão, itens, drafts, publicação e retirada. `createdById=NULL` não é
um curinga de autorização: mutações pessoais exigem usuário da sessão e
`isOfficial=false`. Não existe endpoint de troca de proprietário; os schemas
removem os campos de autoria/oficialidade recebidos do cliente. Testes com dois
usuários comuns confirmaram leitura e listagem oficiais permitidas e todas as
mutações oficiais rejeitadas, inclusive uma tentativa direta de trocar autoria
pelo Repository protegido. Draft institucional e proteções adicionais de
persistência foram testados somente no banco local descartável.

### Achados que impediam o commit naquele diagnóstico

1. **Derivação instável no banco configurado.** Duas execuções do teste de
   integração adaptado para fixtures isoladas no TCC falharam em
   `ChecklistRepository.createFromOfficialVersion → createWithDraft`, durante
   `database.checklist.create()`. Ambas retornaram Prisma `P2003`: primeiro em
   `ChecklistVersionItemStandard_checklistVersionItemId_fkey`, depois em
   `ChecklistVersionItem_checklistVersionId_fkey`. A inspeção somente de leitura
   confirmou as FKs esperadas e ausência de triggers. As transações foram
   revertidas e os fixtures removidos. O E2E Chromium passou, portanto o sucesso
   de uma execução não elimina a falha reproduzida.

   Um diagnóstico com `transactionOptions.timeout=15000` apenas em um cliente
   Prisma temporário passou nos oito testes: duas derivações independentes,
   edição pelos respectivos proprietários, isolamento, CRUD, publicação,
   inspeções/snapshots, conclusão, Reports e Dashboard. O cliente normal usa o
   padrão de 5 segundos do Prisma. O resultado sugere sensibilidade à duração da
   transação com as muitas consultas aninhadas, mas não prova sozinho a causa.
   Esse override não foi aplicado ao código da aplicação e seu resultado não
   substitui uma aprovação da derivação na configuração padrão. É necessário
   corrigir/investigar a persistência e repetir a regressão no Neon antes do
   commit; não enfraquecer FKs nem imutabilidade para contornar a falha.

2. **Referência de páginas incompleta.** O PDF fornecido inicia a seção de
   escavações na página impressa 72; nela estão as perguntas sobre interferências
   subterrâneas, responsável técnico, taludes e escoramentos usadas nos itens
   4–5. A descrição do catálogo/v1 cita somente 73–74 para esse bloco. É preciso
   incluir a página 72 na referência. Os 12 itens permanecem adaptações coerentes
   do Apêndice A, e treinamento/transporte têm suporte nas páginas indicadas.
   Autoria, título, ano 2019, atribuição à Safe Watch Insight e ausência de
   garantia legal/chancela governamental/endosso estão adequados. Não foi
   reescrita a descrição já publicada nem recalculado seu hash nesta auditoria.
   A correção deve respeitar a política de versões imutáveis.

O catálogo de altura contém oito itens coerentes com preparação, riscos, EPIs,
capacitação e emergência e usa somente NR-1, NR-6 e NR-35 do catálogo real.
A auditoria não constituiu revisão jurídica das normas atuais.

### Escopo do diff

Foram revisados os 33 arquivos modificados e nove arquivos novos:

| Grupo                                                                 | Arquivos | Classificação |
| --------------------------------------------------------------------- | -------: | ------------- |
| Prisma schema e migration                                             |        2 | Esperado      |
| Catálogo, Service e Repository institucionais                         |        3 | Esperado      |
| Hooks, API, query keys, schemas, Services e Repositories de checklist |        9 | Esperado      |
| Telas de biblioteca, detalhe e nova inspeção                          |        3 | Esperado      |
| Scripts npm e seeds de plataforma/demo                                |        3 | Esperado      |
| Testes e ajustes de fixtures                                          |        7 | Esperado      |
| Documentação e diagramas, incluindo este relatório                    |       15 | Esperado      |

Não foi identificado arquivo funcional fora do escopo. O ajuste em
`src/offline/inspection-store.test.ts` apenas preenche `isOfficial=false` no
fixture, sem alterar a arquitetura offline. Em `AI/API.md` existe também uma
reformatação incidental do exemplo de cadastro, sem mudança semântica; foi
preservada. Não houve reversão de trabalho anterior.

O bootstrap de produção continua explícito após `prisma migrate deploy` e
separado do Demo Seed. `postinstall`/build apenas geram o Prisma Client;
nenhum deles executa o dataset demonstrativo. Não foi criada infraestrutura
nova de implantação.

### Comparação final e resultados executados

Após a limpeza de todos os fixtures, os 451 registros anteriores tiveram
comparação por chave e hash sem nenhuma linha alterada ou ausente. O estado
final das tabelas da aplicação foi exatamente igual ao estado após a primeira
carga institucional, inclusive itens, versões, timestamps e hashes oficiais.

| Entidade                     | Antes | Depois |
| ---------------------------- | ----: | -----: |
| User                         |     2 |      2 |
| Company                      |     9 |      9 |
| Checklist                    |     9 |     11 |
| ChecklistVersion             |    10 |     12 |
| ChecklistVersionItem         |    45 |     65 |
| ChecklistVersionItemStandard |    26 |     50 |
| Inspection                   |    17 |     17 |
| InspectionResponse           |    55 |     55 |
| NonConformity                |    11 |     11 |
| CorrectiveAction             |     6 |      6 |
| Standard                     |    38 |     38 |
| Evidence                     |     3 |      3 |
| OfflineSyncOperation         |    45 |     45 |

As demais tabelas também permaneceram intactas: 20 ChecklistItem, cinco
ChecklistItemStandard, 17 InspectionChecklistSnapshot, 74 InspectionSnapshotItem,
59 InspectionSnapshotItemStandard e zero Report persistidos. Reports foi
validado pelo serviço de relatórios das inspeções concluídas.

Fingerprint do Demo Seed TCC, idêntico antes e depois:
`ce0c77240a24f7db87dc890938117783f980ee0807b90e46b4cc79a8f1275f56`.
O dataset TCC manteve quatro empresas, quatro checklists pessoais/quatro versões
publicadas, oito inspeções (quatro concluídas), 23 respostas, sete NCs e cinco
ações. A conta legada e seus registros foram cobertos pela comparação integral.

| Verificação nesta auditoria                                   | Resultado                                                                                                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npm test`, Node 22.23.2                                      | 79/79; zero falhas                                                                                                      |
| TypeScript padrão e configuração ampliada com seed/script/E2E | Ambos aprovados                                                                                                         |
| Prisma validate                                               | Schema válido                                                                                                           |
| Prisma generate e `npm run build`                             | Aprovados; build inclui geração do cliente e artefato Vercel                                                            |
| Lint                                                          | Zero erros, seis avisos preexistentes de Fast Refresh                                                                   |
| `git diff --check`                                            | Sem erros                                                                                                               |
| `validate:workflow-authorization` no TCC                      | Aprovado: dois usuários, leitura/mutação privada bloqueada, reutilização publicada e fluxo do proprietário              |
| `validate:official-templates` no PostgreSQL local descartável | 8/8, incluindo teste pai; zero falhas                                                                                   |
| Fixtures de templates no TCC, configuração normal             | Duas execuções falharam com P2003 na derivação; cada uma aprovou três subtestes antes da falha do teste pai             |
| Diagnóstico temporário no TCC com timeout 15 s                | 8/8; não é aprovação do código/configuração normal                                                                      |
| `test:e2e:templates`, Chromium usando TCC                     | 1/1 aprovado; não elimina as falhas diretas acima                                                                       |
| Regressão independente no TCC, cliente normal                 | 1/1: CRUD pessoal, isolamento, publicação/retirada/exclusão, inspeção oficial, snapshot, conclusão, Reports e Dashboard |
| Demo Seed completo, somente PostgreSQL local                  | Duas execuções; fingerprint idêntico                                                                                    |
| Plataforma no TCC                                             | Duas execuções CLI e repetições concorrentes; estado idêntico                                                           |
| Comparação final do TCC                                       | Nenhum registro anterior alterado/removido; somente as 48 novas linhas institucionais                                   |

No teste independente com cliente normal, duas inspeções concluídas (oficial e
pessoal) produziram 13 respostas conformes, 100% de conformidade, zero NCs e dois
relatórios disponíveis; o segundo usuário viu zero inspeções/relatórios.
Snapshots e relatórios continuaram válidos após retirada/exclusão lógica do
checklist pessoal. A fonte oficial permaneceu idêntica.

Fingerprint das duas execuções do Demo Seed **local desta auditoria**:
`4c5675806a9fff94c061a4a5b9f85c14051c11b51b8a5432e0dab1a7d4a17eaf`.
Ele não deve ser comparado ao fingerprint do TCC: são bancos/datasets distintos.

A auditoria alterou somente este documento no repositório; scripts de inspeção,
fixtures do banco corrente, diagnósticos e logs foram mantidos em `/tmp/swi-*`.
Naquela auditoria, o script permanente de integração continuava restrito a
PostgreSQL local; sua proteção não havia sido removida. Nenhuma versão oficial foi sobrescrita e nenhum
terceiro template foi criado. O código funcional permanece sujeito aos achados.

**Parecer histórico: NEEDS FIX BEFORE COMMIT (superado pela validação final).** Naquele momento era necessário resolver os dois achados acima e repetir a
validação da derivação com a configuração final antes de autorizar o commit.
Repositório: 33 arquivos modificados, nove novos, nada staged, sem commit/push.

## Correção e cópia reutilizável — validação final (3 de outubro de 2026)

Esta validação resolve os dois achados da auditoria acima. A reprodução no Neon
identificou o rollback por expiração da transação interativa durante a sequência
N+1 de inserts aninhados, seguido de um insert ainda em execução que falhou em
`ChecklistVersionItem_checklistVersionId_fkey`. O cliente transacional já era
propagado corretamente. A correção usa inserts em lote ordenados para
checklist/draft/itens/associações, sem alterar o timeout padrão. O mesmo mecanismo
agora atende templates oficiais, drafts próprios e publicações acessíveis.
Detalhes: [ChecklistCopy.md](./ChecklistCopy.md).

A referência acadêmica atual foi corrigida para páginas 72–74. A v1 institucional
já publicada permanece idêntica; a interface e os novos drafts derivados incluem
uma errata explícita. Não foi criado terceiro template nem sobrescrita publicação.

### Resultados executados

Node 22.23.2, Chromium 151.0.7922.34 e `DATABASE_URL` do TCC/Neon configurado:

| Verificação                                                                | Resultado                                                                                                                                                             |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test` final                                                           | **85/85**, zero falhas                                                                                                                                                |
| `npx tsc --noEmit`                                                         | Aprovado                                                                                                                                                              |
| TypeScript ampliado para src + scripts alterados + seed + E2E de templates | Aprovado                                                                                                                                                              |
| `npm run prisma:validate`                                                  | Schema válido                                                                                                                                                         |
| Prisma generate                                                            | Executado com sucesso no build final, cliente 7.9.1                                                                                                                   |
| `npm run build` final                                                      | Artefato Vercel gerado                                                                                                                                                |
| `npm run lint` final                                                       | Zero erros; seis avisos preexistentes de Fast Refresh                                                                                                                 |
| `git diff --check`                                                         | Sem erros                                                                                                                                                             |
| `validate:official-templates`, confirmação `configured-tcc`                | **8/8**, incluindo teste pai; derivação normal, autorização, CRUD, publicação, snapshots, conclusão e Reports                                                         |
| `validate:checklist-copy`, confirmação `configured-tcc`, final             | **10/10**, incluindo teste pai; propriedade, isolamento A/B, cópia publicada acessível, draft privado não exposto, nomes, exclusão de item na origem draft e rollback |
| Quatro cópias institucionais repetidas, cliente normal                     | **941, 933, 946 e 937 ms**; sem P2003 em conteúdo válido                                                                                                              |
| Falha deliberada na última gravação de associação                          | FK `ChecklistVersionItemStandard_standardId_fkey` rejeitou norma inexistente; todos os registros da tentativa foram revertidos                                        |
| `validate:workflow-authorization`                                          | Aprovado; dois usuários, leitura/mutação privada bloqueada, reutilização publicada e fluxo do proprietário                                                            |
| `validate:checklist-versioning`                                            | Aprovado; backfill legado, v1/v2, isolamento de itens/normas, NC histórica, inspeção concluída estável e rollback                                                     |
| `validate:dashboard`                                                       | Aprovado; Reports, escopo por usuário, cinco recentes e leitura sem mutar status                                                                                      |
| `test:e2e:templates` final                                                 | **1/1**; login, uso de template, edição, cópia pessoal, independência e chamada direta ao servidor por terceiro/sem sessão                                            |
| `test:e2e:offline`                                                         | **3/3**; instalação/cache, reabertura/retry/sincronização, edições/conclusão e conflito otimista                                                                      |
| Demo Seed completo no TCC                                                  | Duas execuções aprovadas; fingerprint idêntico à conferência anterior somente de leitura                                                                              |
| Platform Seed CLI no TCC                                                   | Duas execuções aprovadas; fontes institucionais preservadas                                                                                                           |
| Fluxo com a conta demo atual                                               | Cópia oficial e de checklist próprio, edição de ambas, fontes intactas e limpeza das duas cópias                                                                      |

Uma checagem exploratória que incluiu **todos** os scripts/E2E além do `tsconfig`
oficial encontrou 30 diagnósticos de nulabilidade em dois arquivos preexistentes
não alterados: `e2e/offline-pwa.spec.ts` (24) e
`scripts/validate-offline-sync-flow.ts` (6). Ela não passou e não é apresentada
como aprovação. O TypeScript oficial e a configuração ampliada dos arquivos desta
entrega passaram. A suíte Offline/PWA executada passou. Esses diagnósticos fora
da configuração oficial não foram corrigidos nesta entrega para evitar alterações
não relacionadas no fluxo offline.

### Preservação final do banco

A comparação por hashes de todas as linhas das **19 tabelas** da aplicação
confirmou igualdade exata com a fotografia anterior ao trabalho: **499 registros,
nenhuma linha alterada, removida ou acrescida** após a limpeza. Mantêm-se duas
contas (legada e demo), nove empresas, 11 checklists (dois oficiais), 12 versões,
65 itens de versão, 17 inspeções, 55 respostas e todo o histórico de snapshots,
não conformidades, ações, evidências e operações offline. Não permanecem usuários,
checklists, itens, versões, inspeções ou snapshots temporários. Não houve reset,
migration ou alteração de FKs; todas as FKs consultadas estão validadas.

Fingerprint integral desta comparação (formato próprio do runner desta etapa):
`14d6d1a222e217d467a597dc4fa7109f9c566bcdfda49b7bd55fdf93a518dd64`.
Não comparar diretamente com fingerprints de outros formatos usados na auditoria
anterior. O Demo Seed manteve o fingerprint
`ce0c77240a24f7db87dc890938117783f980ee0807b90e46b4cc79a8f1275f56` nas três
conferências (leitura inicial e duas execuções completas).

Os hashes oficiais permanecem:

- NR-18: `08553a27db11f0792f53c979a9ec7c10d284d658a720c4eb89572ff41c578458`.
- Altura: `8c4366ebc0e76b746c0c29c6b3d288668c45377ef7eb2d88bfe88ff084c7072a`.

Logs e runners diagnósticos desta etapa estão em `/tmp/swi-copy-*`. Nenhum segredo
ou URL de conexão integra a documentação. O HEAD continua
`efa1d03ae652154a3b5eddbfe5a84b499fd958f0`, com 15 arquivos modificados e quatro
novos, nada staged. Nenhum commit ou push foi executado nesta tarefa.

**Parecer histórico da entrega funcional: READY FOR COMMIT.**

Na Fase 3, o código já corresponde ao incremento validado acima. A revisão
documental não repete essas operações de banco; suas verificações/limites estão
em [RelatorioFase3.md](../Documentation/RelatorioFase3.md).
