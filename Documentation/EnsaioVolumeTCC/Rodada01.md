# Ensaio funcional de volume do Safe Watch Insight — rodada 01

O ensaio de 21 de novembro de 2026 verificou o cadastro, a execução de inspeções e a abertura dos relatórios históricos para 30 conjuntos de dados sintéticos. O critério de aprovação foi funcional. [Resultados por ciclo](./volume-rodada-01.json) · [Roteiro Playwright](../../tests/volume/workflow.ts).

## Resultado

**30 ciclos completos de uso sequencial validados no ambiente de teste.** As 30 inspeções foram concluídas e conferidas em uma nova consulta. Os 30 relatórios exibiram a inspeção correspondente e os dados esperados. Nos 10 casos previstos, o relatório exibiu a não conformidade e sua observação na seção dedicada.

| Etapa                                                    | Previstas | Iniciadas | Aprovadas | Falhas | Não executadas |
| -------------------------------------------------------- | --------: | --------: | --------: | -----: | -------------: |
| Cadastro e consulta da empresa                           |        30 |        30 |        30 |      0 |              0 |
| Checklist com dois itens e versão publicada              |        30 |        30 |        30 |      0 |              0 |
| Criação e abertura da inspeção                           |        30 |        30 |        30 |      0 |              0 |
| Respostas e conclusão pela interface                     |        30 |        30 |        30 |      0 |              0 |
| Nova consulta da conclusão e das respostas sincronizadas |        30 |        30 |        30 |      0 |              0 |
| Relatório histórico pronto e conferido                   |        30 |        30 |        30 |      0 |              0 |
| Não conformidade com observação na seção do relatório    |        10 |        10 |        10 |      0 |              0 |

Os casos com não conformidade foram os ciclos 03, 06, 09, 12, 15, 18, 21, 24, 27 e 30. A seção de não conformidades ficou sem ocorrências nas outras 20 inspeções. Cada opção conferida no seletor de relatórios correspondeu a um dos 30 identificadores distintos de inspeção confirmados no HTML.

A consulta complementar no Neon confirmou 30 empresas, 30 checklists, 30 versões publicadas, 30 inspeções concluídas e sincronizadas, 30 snapshots, 60 respostas e 10 não conformidades ativas. Os identificadores e vínculos conferem por ciclo no JSON. Os totais de registros das contas anteriores permaneceram iguais entre as duas consultas, com dois usuários, duas empresas, dois checklists e 21 inspeções. [Evidência sanitizada](./volume-rodada-01.json).

## Ambiente e validação do destino

| Componente                   | Identificação                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Branch do roteiro            | `test/tcc-tempos-mobile`                                                                                                                                           |
| Commit do roteiro executado  | `286f511abaa33ee3d939d0aa730fc8c112b60d6a`                                                                                                                         |
| Commit em execução no deploy | `b247c8694c06221a64000e6844479bf7a015e429`                                                                                                                         |
| Vercel                       | Projeto dedicado `safe-watch-insight-timing`, deploy `dpl_9nBhHuVpEmuxFHWbxNK8Ha6Ka3Hx`, ambiente `production` desse projeto de teste, região `gru1`               |
| Neon                         | Projeto dedicado `SafeWatchInsightTiming` (`icy-cake-52272050`), branch `main` (`br-sparkling-meadow-b689n13x`), banco `safe_watch_timing`, região `aws-sa-east-1` |
| Executor                     | Linux, Node.js 22.23.2, Playwright 1.62.1 e Chromium 151.0.7922.34 headless                                                                                        |
| Identificador da execução    | `23d245a2-5ea6-462d-95d4-5342fd851816`                                                                                                                             |

Antes e depois dos ciclos, a API da Vercel confirmou que o domínio `safe-watch-insight-timing.vercel.app` apontava para o deploy em estado `READY` com o SHA acima. É o mesmo deploy cujo vínculo com o banco dedicado foi verificado na rodada de tempos. A configuração `DATABASE_URL` do projeto de testes estava registrada desde antes desse deploy. O Neon confirmou projeto, branch e endpoint. Antes do primeiro cadastro, o roteiro validou o host e o nome do banco e consultou a presença da conta da rodada de tempos. Em seguida, cadastrou e autenticou uma conta sintética exclusiva pela interface e confirmou que ela aparecia no Neon antes de iniciar os ciclos. [Deploy dedicado na Vercel](https://vercel.com/pedrovitor237s-projects/safe-watch-insight-timing/9nBhHuVpEmuxFHWbxNK8Ha6Ka3Hx).

## Procedimento

1. Pelo Chromium, cadastrar a empresa com razão social única e consultá-la após nova navegação para a lista de empresas.
2. Pela interface de checklists, cadastrar dois itens obrigatórios e publicar a versão 1. Reabrir o checklist para conferir a versão e os itens. No assistente de inspeção, verificar se a empresa e a versão publicada estão disponíveis para seleção.
3. Criar e abrir a inspeção na interface. Responder aos dois itens e acionar **Concluir inspeção**. Nos ciclos múltiplos de três, responder **NC** ao segundo item e preencher a observação exclusiva do ciclo. Nos demais, marcar os dois itens como conformes.
4. Consultar a inspeção em um contexto novo do Chromium, com a mesma sessão autenticada e IndexedDB inicialmente vazio. Conferir o status **Concluída**, o vínculo **Ver relatório**, o total de itens respondidos, os estados das respostas e o texto da observação quando aplicável.
5. Abrir `/relatorios?inspectionId=<id>` no Chromium. Conferir o identificador da inspeção, a empresa, o checklist e a versão, o status concluído, as duas respostas e a ação **Imprimir** habilitada. Nos dez casos previstos, verificar também o item e a observação na seção **Não conformidades e ações corretivas**. Nos outros casos, a seção deve estar vazia de ocorrências.

O roteiro executa os ciclos um a um e preenche os campos diretamente pelo Playwright. As mutações passam pela interface e pelas operações reais do deploy. As consultas diretas ao PostgreSQL são complementares e verificam o destino, os totais e os vínculos. O roteiro registra o resultado após cada etapa, continua os demais ciclos em caso de falha e consulta novamente a inspeção enquanto aguarda a sincronização. A etapa de não conformidade se aplica somente aos dez ciclos definidos.

As listagens de empresas e checklists consultadas durante o cadastro usam a primeira página, ordenada por criação decrescente, o que permite verificar o registro recém-criado. A abertura da inspeção usa filtro pela empresa do ciclo. A conferência global consulta todos os registros da conta sintética no banco, sem limite de página, e compara cada relatório com o seletor de inspeções concluídas e com seu identificador completo no HTML.

Cada relatório histórico é uma visualização gerada sob demanda a partir da inspeção e de seu snapshot. O resultado do ensaio conta as visualizações verificadas. Os limites do roteiro são os itens textuais e a visualização HTML com **Imprimir** disponível.

## Ocorrência na validação inicial

A primeira preparação, identificada por `a7c71fd5-dda4-415a-8202-aefe6bca19dc`, encontrou um tempo limite ao iniciar uma transação de leitura no Neon. Ela parou antes de abrir o navegador, com zero ciclos iniciados. A revisão `286f511abaa33ee3d939d0aa730fc8c112b60d6a` substituiu essa transação por leituras independentes e passou pela validação do destino. A execução funcional começou após essa checagem com outro identificador.

## Reexecução

Com a versão de Node da `.nvmrc`, instale as dependências com `npm ci` e o Chromium com `npx playwright install chromium`. Consulte o deploy atual pela API da Vercel e forneça ao processo `SW_VOLUME_VERIFIED_DEPLOYMENT` com um JSON contendo `id`, `origin`, `projectId` e `commit` verificados. Forneça `SW_VOLUME_DATABASE_URL` pelo ambiente do processo com a conexão do Neon dedicado e defina `SW_VOLUME_CONFIRMATION=dedicated-synthetic-environment`. O endereço, o deploy, o commit e o destino PostgreSQL são conferidos pelo roteiro antes de gravar. Cada invocação gera outra conta sintética e outro conjunto de registros.

```bash
node --import tsx tests/volume/workflow.ts
```

O caminho padrão do JSON é `test-results/volume/volume-<id>.json`. Um argumento posicional permite selecionar outro caminho. A conferência da rodada de tempos está registrada em seu próprio documento. [Conferência da rodada 01 de tempos mobile](../EnsaioTemposMobileTCC/ConferenciaRodada01.md).
