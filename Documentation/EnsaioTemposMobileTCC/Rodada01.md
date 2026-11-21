# Ensaio de tempos mobile — rodada 01

A coleta de 21 de novembro de 2026 terminou com **36 tentativas aprovadas, zero falhas e zero pendências** nas verificações do roteiro. A digitação foi configurada em **331 ms entre caracteres**, um desvio de 1 ms em relação ao protocolo. Os resultados descrevem o cenário automatizado tal como executado. [JSON sanitizado da rodada](./tempos-mobile-rodada-01.json).

A rodada em modo `study` ocorreu entre **12h28min06s e 13h18min37s**, no horário de Fortaleza (UTC−03). As seis esperas efetivamente registradas ficaram entre 360,065 e 360,101 s. O piloto anterior, no mesmo ambiente, aprovou uma inspeção e uma abertura de relatório. As duas tentativas do piloto ficaram fora das estatísticas da rodada.

## Ambiente

| Componente                     | Configuração observada                                                                                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Revisão do roteiro e do deploy | `b247c8694c06221a64000e6844479bf7a015e429`, branch `test/tcc-tempos-mobile`. A Vercel registrou o SHA do checkout limpo e confirmou que `https://safe-watch-insight-timing.vercel.app` apontava para esse deploy.                                 |
| Vercel                         | Projeto independente `safe-watch-insight-timing`, plano Hobby. Deploy `dpl_9nBhHuVpEmuxFHWbxNK8Ha6Ka3Hx` no ambiente `production` desse projeto de teste. A função Nitro `__server` usou Node.js 22.x, Fluid Compute e região `gru1` (São Paulo). |
| Neon                           | Projeto independente `SafeWatchInsightTiming`, plano Free. PostgreSQL 18 no banco `safe_watch_timing`, região `aws-sa-east-1` (São Paulo), compute de leitura e escrita com 0,25 CU.                                                              |
| Executor                       | Notebook em Itapecuru Mirim (MA), Brasil, conforme informado pelo operador. Linux x64, Node.js 22.23.2 da `.nvmrc` e Playwright 1.62.1.                                                                                                           |
| Navegador                      | Chromium 151.0.7922.34 em modo headless, com emulação Pixel 7 e viewport de 412 × 839.                                                                                                                                                            |

As seis migrations do SHA foram aplicadas por conexão direta. Antes do piloto, o banco tinha zero usuários, checklists e inspeções. O deploy e o executor usaram conexões com pool para o mesmo banco. O login da conta criada pelo piloto e a conferência de persistência no PostgreSQL confirmaram esse vínculo. [Deploy na Vercel](https://vercel.com/pedrovitor237s-projects/safe-watch-insight-timing/9nBhHuVpEmuxFHWbxNK8Ha6Ka3Hx).

A sessão CLI da Vercel gerou um arquivo `.env.local` com um token OIDC transitório durante o vínculo local. O arquivo foi removido antes do deploy medido. As conexões do banco e o segredo de sessão da aplicação foram fornecidos aos processos em tempo de execução e cadastrados como segredos no projeto dedicado.

## Roteiro e desvio de cadência

O protocolo de ensaio prevê três blocos por fluxo. Cada bloco começa com seis minutos sem solicitações do executor ao ambiente, seguidos de uma tentativa após a espera e cinco consecutivas. O Playwright usou um trabalhador, sem novas tentativas automáticas. A preparação dos dados e o login ocorreram antes da medição. Cada tentativa abriu um contexto de navegador novo com a sessão autenticada da rodada. [Protocolo do ensaio](../EnsaioTemposMobileTCC.md).

A inspeção usou uma instância nova por tentativa, com o mesmo checklist de seis itens. Foram registradas quatro respostas conformes, uma não conforme e uma não aplicável, duas observações com textos fixos e zero fotos. O acesso termina quando o checklist vazio está visível e a primeira opção de resposta está habilitada. O preenchimento vai desse ponto até o registro das seis respostas e o desfoque do último campo de observação. O preenchimento até a confirmação local vai do mesmo ponto até a mensagem de conclusão local e início da sincronização. A checagem posterior no PostgreSQL confere respostas, observações, conclusão e sincronização fora do cronômetro.

O cenário de relatório abriu a mesma inspeção histórica em todas as tentativas. A medida termina com o relatório HTML daquela inspeção visível, com os seis itens, as observações esperadas e a ação **Imprimir** habilitada. A interação com a impressão nativa e a gravação de PDF ficaram fora da medição.

A divergência em relação aos 332 ms do protocolo foi identificada no JSON durante a coleta. O cálculo `60.000 / (36,2 × 5)` dá 331,4917 ms e `Math.round` produz 331 ms. O parâmetro foi o mesmo no piloto e em todas as inspeções da rodada. O JSON preserva a cadência configurada e os tempos observados. A modalidade de relatório mede a renderização, sem ações de digitação cronometradas. [Código do roteiro no SHA avaliado](https://github.com/PedroVitor237/safe-watch-insight/blob/b247c8694c06221a64000e6844479bf7a015e429/tests/timing/workflow.spec.ts#L12-L13).

## Resultados

As estatísticas usam as tentativas aprovadas de cada condição e são apresentadas em segundos, com três casas decimais. Pendências são as tentativas previstas sem registro de execução.

### Inspeção — Após seis minutos de espera

| Medida                                | Previstas | Aprovadas | Falhas | Pendências | Média (s) | Mediana (s) | Mínimo (s) | Máximo (s) |
| ------------------------------------- | --------: | --------: | -----: | ---------: | --------: | ----------: | ---------: | ---------: |
| Acesso                                |         3 |         3 |      0 |          0 |     3,688 |       4,068 |      2,559 |      4,438 |
| Preenchimento                         |         3 |         3 |      0 |          0 |    29,023 |      29,078 |     28,893 |     29,098 |
| Preenchimento até a confirmação local |         3 |         3 |      0 |          0 |    29,218 |      29,284 |     29,071 |     29,299 |

### Inspeção — Tentativas consecutivas

| Medida                                | Previstas | Aprovadas | Falhas | Pendências | Média (s) | Mediana (s) | Mínimo (s) | Máximo (s) |
| ------------------------------------- | --------: | --------: | -----: | ---------: | --------: | ----------: | ---------: | ---------: |
| Acesso                                |        15 |        15 |      0 |          0 |     1,675 |       1,556 |      1,298 |      2,417 |
| Preenchimento                         |        15 |        15 |      0 |          0 |    29,062 |      29,070 |     28,848 |     29,180 |
| Preenchimento até a confirmação local |        15 |        15 |      0 |          0 |    29,261 |      29,263 |     29,073 |     29,362 |

### Relatório — Após seis minutos de espera

| Medida         | Previstas | Aprovadas | Falhas | Pendências | Média (s) | Mediana (s) | Mínimo (s) | Máximo (s) |
| -------------- | --------: | --------: | -----: | ---------: | --------: | ----------: | ---------: | ---------: |
| Pronto na tela |         3 |         3 |      0 |          0 |     3,700 |       3,509 |      2,747 |      4,845 |

### Relatório — Tentativas consecutivas

| Medida         | Previstas | Aprovadas | Falhas | Pendências | Média (s) | Mediana (s) | Mínimo (s) | Máximo (s) |
| -------------- | --------: | --------: | -----: | ---------: | --------: | ----------: | ---------: | ---------: |
| Pronto na tela |        15 |        15 |      0 |          0 |     1,682 |       1,512 |      1,358 |      2,619 |

## Rede e atividade dos serviços

A rota padrão do executor usava Wi-Fi. O navegador emulado usou a rede disponível no notebook, sem limitação artificial de banda ou latência. O firewall do projeto de teste restringiu as entradas ao IPv4 de saída do executor. O ambiente foi preparado sem tarefas periódicas do aplicativo. A consulta aos registros HTTP do deploy para a janela da rodada retornou 2.433 requisições em `gru1`, com 2.399 respostas HTTP 200 e 34 respostas HTTP 304.

A sondagem HTTPS de `/login`, feita uma vez antes do piloto e uma vez após a coleta, recebeu HTTP 200 sobre HTTP/2 por IPv4. O cabeçalho da Vercel indicou `gru1::gru1` nas duas sondagens. Os valores abaixo são acumulados desde o início de cada requisição e ficaram fora dos cronômetros do ensaio.

| Sondagem        | Horário local | DNS (s) | Conexão TCP (s) | TLS (s) | Primeiro byte (s) | Total (s) |
| --------------- | ------------- | ------: | --------------: | ------: | ----------------: | --------: |
| Antes do piloto | 12:25:56      |   0,227 |           0,284 |   0,392 |             1,479 |     1,486 |
| Após a rodada   | 13:19:03      |   0,129 |           0,260 |   0,368 |             0,548 |     0,549 |

A consulta posterior a `neon operations list` no projeto do ensaio retornou eventos `suspend_compute` e `start_compute` com estado `finished` para os seis blocos. Cada suspensão ocorreu durante a espera. Cada reativação coincidiu com a abertura da primeira tentativa do bloco, considerando a resolução de um segundo do log de operações. Os horários abaixo usam UTC−03.

| Fluxo e bloco | Suspensão registrada no Neon | Início da primeira tentativa | Reativação registrada no Neon |
| ------------- | ---------------------------- | ---------------------------- | ----------------------------- |
| Inspeção 1    | 12:36:45                     | 12:37:33,743                 | 12:37:34                      |
| Inspeção 2    | 12:46:30                     | 12:47:10,509                 | 12:47:11                      |
| Inspeção 3    | 12:56:00                     | 12:56:37,301                 | 12:56:37                      |
| Relatório 1   | 13:05:16                     | 13:05:58,208                 | 13:05:58                      |
| Relatório 2   | 13:11:31                     | 13:12:12,408                 | 13:12:14                      |
| Relatório 3   | 13:17:45                     | 13:18:26,416                 | 13:18:27                      |

O acesso à inspeção e o relatório pronto na tela tiveram médias cerca de 2,0 s maiores após a espera. As médias de preenchimento ficaram entre 29,023 s e 29,062 s. Os eventos confirmam as reativações do Neon, mas sua resolução e as medições de ponta a ponta não permitem quantificar quanto da diferença veio delas. Os registros HTTP consultados não expõem evidência direta de inicialização de instâncias da Vercel. A comparação é descritiva para estas três tentativas após espera e quinze consecutivas por fluxo, com as condições observadas nesta rodada.
