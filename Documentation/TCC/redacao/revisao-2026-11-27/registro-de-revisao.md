# Revisão da monografia do Safe Watch Insight — 27/11/2026

Registro editorial do TCC de Análise e Desenvolvimento de Sistemas da UEMA.
Reúne a revisão integral, as decisões discutidas com um dos autores, a rodada
de correções pontuais e as questões para a próxima edição. A avaliação de
agosto, os incrementos de setembro e outubro e os ensaios de novembro são
marcos distintos do trabalho.

## Versões e sequência das decisões

| Versão ou etapa | O que ocorreu |
| --- | --- |
| Consolidação de 22/11 no GitHub | O Word, o Markdown e os auxiliares incorporaram os ensaios de 21/11. A versão propôs um Apêndice I com os Quadros 3 a 5. É uma referência histórica para a apresentação das evidências. [Versão consolidada](../revisao-2026-11-22/monografia.md) · [Conferência de fontes](../revisao-2026-11-22/conferencia-de-fontes.md). |
| Primeira revisão de 27/11 | Revisão do resumo ao último apêndice. Produziu `TCC_Safe_Watch_Insight_revisado.docx` e `Parecer_de_revisao_do_TCC.docx`, com ajustes de redação, referências, metodologia, interpretação dos resultados e montagem. O parecer distinguiu correções propostas de dúvidas sobre os formulários e elementos pré-textuais. Foi atualizado após a confirmação do ano de Morais et al. |
| Nova versão enviada pelos autores | O arquivo identificado como `Versão_Final(1).docx` já trazia a quinta alternativa da questão 4 do Apêndice C como “Concordo totalmente”, a folha de rosto revisada e os títulos de RESUMO, ABSTRACT e Apêndices A–H padronizados. Essa versão foi escolhida como base das correções pontuais. |
| Correções pontuais de 27/11 | `TCC_Safe_Watch_Insight_correcoes.docx` aplica as decisões abaixo sobre a última versão enviada. Conserva a redação existente onde suficiente, a capa, a folha de rosto e a organização em Apêndices A–H. Os resultados do ensaio de volume aparecem no capítulo 5 e na conclusão. A versão de 22/11 continua sendo a fonte dos quadros suplementares. |

Os arquivos de 27/11 foram tratados fora do repositório. Os identificadores
abaixo permitem reconhecer a base e a entrega em uma próxima revisão.

| Arquivo | SHA-256 |
| --- | --- |
| Versão enviada que serviu de base (`Versão_Final(1).docx`) | `12b32c6f31afd50b68db246fc0ec5281d50c964fc3420092a66466ed75c28de0` |
| Primeira revisão integral (`TCC_Safe_Watch_Insight_revisado.docx`) | `f53e795322c1a8f7eb8798aef7a70de541d1e0b74ac7d5a25ce115cbf68e64f8` |
| Parecer atualizado (`Parecer_de_revisao_do_TCC.docx`) | `3e2897ad278789694de708d15eb09235045aeec85d259a6f428a065f2c0cdc8e` |
| Entrega com as correções pontuais (`TCC_Safe_Watch_Insight_correcoes.docx`) | `0826d0fcfcc53bf1ecc64ad35d8bb2d1de96fc0168dd2bf4a43443054e0d15e0` |

## Decisões aplicadas

### Resumo, introdução e objetivos

- Resumo e abstract passaram a ter um parágrafo cada, com objetivo, método,
  entrega e resultados equivalentes. Informam a avaliação preliminar por quatro
  participantes em agosto e os ensaios automatizados em novembro. A utilidade
  percebida da consulta normativa e a facilidade de aprendizado substituíram a
  formulação “aprovação unânime de especialistas”.
- A introdução já descrevia a dispersão de registros. A adição foi de uma frase
  sobre como isso dificulta recuperar não conformidades e providências na
  vistoria seguinte. O objetivo geral explicita apoio à realização de inspeções
  e ao acompanhamento das ações corretivas. Os registros também podem subsidiar
  fiscalizações.
- Os 2.538 óbitos de 2022 passaram a estar vinculados ao trabalho com carteira
  assinada, com referência à divulgação do Ministério Público do Trabalho.
  A posição no G20 e o percentual de 11,19% sobre LER/Dort foram preservados
  por decisão do autor. [Divulgação do MPT sobre 2022][mpt-2022].

### Referencial teórico e trabalhos relacionados

- **Guerra (2020)** aparecia em três parágrafos da seção 3.4 sem entrada
  bibliográfica identificável. O autor pediu para tentar confirmar a obra com
  a dupla antes da troca. Ao concluir a rodada, autorizou Valente (2020).
  Os enunciados sobre engenharia de software, requisitos e arquitetura foram
  ajustados aos capítulos correspondentes, com a referência já presente no
  Word. O exemplo de arquitetura passou a mencionar a consulta após a
  sincronização. [Valente, capítulos 1][valente-1], [3][valente-3] e [7][valente-7].
- **SWEBOK** é o guia de conhecimentos de engenharia de software da IEEE
  Computer Society. A seção 3.4 usa o guia para explicar a gestão contínua de
  requisitos e os níveis de teste. O Word de 27/11 ficou com Washizaki (2025)
  e versão 4.0a após consulta a uma edição indexada com lançamento em setembro
  de 2025. A conferência posterior do PDF oficial revelou a divergência
  registrada abaixo. [PDF da IEEE Computer Society][swebok].
- **Morais et al. (2026)** é o TCC *SST Hub: sistema de planejamento e consulta
  de segurança do trabalho*, da Etec Orlando Quagliato. A página institucional
  registra 30/06/2026 no campo de data e 2025 na referência sugerida. A capa
  apresentada pelo autor confirma 2026. O ano usado na monografia e a
  atualização do parecer estão resolvidos. [Registro do Centro Paula Souza][sst-hub].
- **Quadros 1 e 2.** O autor aprovou “Não informado” para recursos cuja
  disponibilidade a publicação consultada não esclarece. O SEST é descrito
  como aplicativo Android para avaliações de ruído, com persistência local
  (SQLite) e exportação em texto. A centralização pela internet aparece como
  trabalho futuro no artigo. No Safe Watch Insight, o funcionamento offline
  foi classificado como parcial, para inspeções previamente carregadas.
  [Topdjian et al. (2016), seções 2 a 4][sest].
- **Rocha (1999)** já era citado na introdução no trecho sobre Hipócrates.
  A entrada bibliográfica reunia 2001 e 1999 e trazia uma extensão de título e
  uma contagem de folhas divergentes. Com autorização do autor, usou-se 1999,
  UFRGS e o título sobre o cumprimento da NR-18 no subsetor de edificações,
  com base em referências acadêmicas convergentes. A verificação da folha de
  rosto e da passagem histórica ainda depende do exemplar. [Referência acadêmica da UFRGS][rocha-ufrgs] · [Referência na revista Espacios][rocha-espacios].

### Metodologia, funcionamento e avaliação

- O desenvolvimento descrito abrange **maio a outubro de 2026**. A avaliação
  da versão preliminar ocorreu de **28 a 31 de agosto**. Os ensaios automatizados
  de tempo e volume foram realizados em **21 de novembro**, em ambiente de
  teste dedicado.
- O Apêndice A reproduz o formulário de levantamento de necessidades. O B
  reúne o roteiro de três entrevistas. O C reproduz o questionário de avaliação
  da plataforma, com 13 questões fechadas e uma aberta. O autor confirmou que
  três dos quatro avaliadores também estiveram nas etapas iniciais. O quarto
  participou somente da avaliação. Essa confirmação agregada resolve TCC-P039
  para a redação. As respostas permanecem agregadas em [PES-002][pes-002].
- A orientação dada aos avaliadores foi percorrer o fluxo principal. A Tabela 1
  apresenta percepções dos quatro participantes. Cada resposta equivale a 25%
  nas questões fechadas. A questão aberta 13 recebeu três comentários.
  A facilidade de aprendizado, rapidez e sensação de segurança são percepções
  do grupo. O questionário próprio é o instrumento descrito no texto. As
  menções a SUS, UEQ e TAM como instrumentos não aplicados saíram dos resultados
  e da conclusão.
- A inspeção deve estar disponível no dispositivo antes da perda de conexão.
  A entrega permite responder, concluir localmente e sincronizar com conexão
  e sessão disponíveis. O funcionamento integral sem conexão era objetivo do
  projeto. No prazo da defesa, priorizou-se desenvolver e validar esse primeiro
  incremento. Criar inspeções sem rede e registrar evidências fotográficas
  para envio posterior permanecem como evolução.
- O manifesto da PWA contém informações de instalação. O *service worker*
  trata requisições e o cache da estrutura pública. IndexedDB conserva pacotes,
  respostas e a fila local. O texto descreve armazenamento de *hashes* de
  senhas com bcrypt.
- O *snapshot* da inspeção conserva os itens e as referências normativas do
  checklist aplicado. Essa cópia permite interpretar as respostas antigas
  mesmo após a edição do modelo. Cadastros e ações corretivas têm evolução
  própria. [Arquitetura offline][offline] · [Retrospectiva técnica][retro].

### Ensaios automatizados de 21/11

O Playwright executou o Chromium com emulação móvel. Foram 18 execuções do
fluxo de inspeção e 18 consultas ao mesmo relatório histórico. Cada fluxo
teve três blocos. Após seis minutos de espera, cada bloco teve uma tentativa
inicial e cinco consecutivas, totalizando três tentativas após a espera e
15 consecutivas por fluxo. A digitação das duas observações usou **331 ms
por caractere**, conforme a configuração efetivamente executada. O protocolo
preliminar registrava 332 ms. A base de 36,2 palavras por minuto veio de uma
tarefa de transcrição em dispositivos móveis de Palin et al. (2019).
[Conferência da rodada][tempos] · [Dados individuais][tempos-json] · [Estudo de Palin et al.][palin].

| Tabela 2 — medida | Após espera (n = 3), em s | Consecutivas (n = 15), em s |
| --- | ---: | ---: |
| Acesso à inspeção | 3,688 | 1,675 |
| Preenchimento da inspeção | 29,023 | 29,062 |
| Preenchimento até a confirmação local | 29,218 | 29,261 |
| Relatório pronto na tela | 3,700 | 1,682 |

O cronômetro de preenchimento e o de preenchimento até a confirmação local
começam juntos. A segunda medida inclui a primeira. A sincronização no
servidor foi conferida depois, e a abertura do relatório termina com os dados
visíveis e a impressão habilitada. Foram observadas reativações do Neon
próximas ao início dos seis blocos. A medição abrange o percurso pela interface,
aplicação e banco, sem atribuir a diferença a um único componente.

No ensaio de volume, um executor percorreu **30 ciclos sequenciais com dados
sintéticos**. Cada ciclo produziu uma empresa, um checklist publicado com dois
itens, uma inspeção concluída e sincronizada e sua cópia histórica. Os 30
relatórios corresponderam às inspeções dos respectivos ciclos. Das **60
respostas geradas pelo roteiro**, dez foram marcadas intencionalmente como
não conformes e receberam observações. A conferência validou que esses dez
registros simulados apareceram no banco de testes e nos relatórios esperados.
As medições descrevem esse roteiro. Tempo de vistoria em campo, comparação com
o papel e uso simultâneo por vários profissionais permanecem para avaliações
futuras. [Relatório do ensaio de volume][volume] · [Resultados por ciclo][volume-json].

### Montagem do Word

- A capa e a folha de rosto ficaram iguais à versão enviada, inclusive texto
  institucional e identificação da orientadora. O autor pediu preservação
  integral da folha de rosto.
- As cinco figuras foram conferidas com título e fonte na mesma página.
  A chamada do cadastro de empresas passou a indicar a Figura 5. A Figura 1
  mostra camadas e persistência. As Figuras 2 a 4 mostram painel, relatório
  e checklist.
- No Apêndice C, a questão 4 conserva “Concordo” e “Concordo totalmente”,
  como na última versão enviada e em acordo com a Tabela 1. A nota sobre
  duplicação que aparecia na primeira revisão ficou fora da entrega.
- Na questão 5 do Apêndice A, a instrução “Pular para a pergunta 7” foi
  preservada por decisão expressa do autor. O destino não aparece na
  reprodução, que contém a questão 6 e a complementar 5.1.
- A renderização final teve **61 folhas**. As **25 entradas do sumário** foram
  comparadas às páginas de destino. A numeração do corpo começa em 5. As duas
  primeiras folhas foram comparadas visualmente com a base e as duas tabelas
  de resultados foram conferidas célula a célula. Essa validação foi do
  documento, sem nova execução dos ensaios da plataforma.

## Pendências para a próxima revisão

| Situação | Questão e encaminhamento |
| --- | --- |
| **Reaberta — ano do SWEBOK** | O registro de 22/11 citava 2026. O Word de 27/11 cita 2025 após a primeira conferência. Ao preparar este registro, a capa do PDF oficial servido no mesmo endereço foi conferida e indica **“Released August 2026”**, ainda como 4.0a. A página de direitos indica copyright até 2025. Ao retomar o Word, usar **Washizaki (2026)** nas duas chamadas e na referência se o exemplar citado for esse PDF. Preservar o ano da edição efetivamente consultada caso se opte pelo exemplar de setembro de 2025. [PDF oficial, capa e p. iv][swebok]. |
| **Em aberto — NRs na introdução** | A mesma frase chama 38 e 36 de vigentes. A lista oficial do MTE vai da NR-1 à NR-38 e identifica a NR-2 e a NR-27 como revogadas. A redação pode distinguir a faixa de numeração da quantidade vigente e citar a lista oficial na próxima edição. [Lista do MTE][mte-nrs]. |
| **Preservado por decisão — G20 e LER/Dort** | Se a dupla retomar esses dados, explicitar período e métrica do comparativo do G20 e conferir o denominador de 11,19% no dado primário. A frase sobre subnotificação de 21,6% também foi herdada da base e requer vincular período e fonte. O MPT reproduz o comparativo publicado em 2021. Um artigo de Bitencourte e Rendeiro menciona 22.029 benefícios acidentários por afastamentos superiores a 15 dias em 2017. Conferir a fonte previdenciária antes de generalizar o percentual. [MPT, comparativo de 2021][mpt-g20] · [Bitencourte e Rendeiro][ler]. |
| **Em aberto — referência de Rocha** | As fontes secundárias sustentam 1999 e a identificação geral da dissertação. Conferir título, grafia do nome e passagem sobre Hipócrates no exemplar original se localizado. A revisão de 22/11 registra uma alternativa bibliográfica direta para a passagem histórica. [Conferência de 22/11](../revisao-2026-11-22/conferencia-de-fontes.md). |
| **Conferência bibliográfica localizada** | A revisão de 22/11 contém correções de autoria de Cantave, de separação das entradas Dexie.js e TanStack, além de outras fontes. O Word de 27/11 partiu de outra base e não absorveu toda essa lista. Conferir essas entradas e o parágrafo do SESMT/CIPA em revisão própria. Os itens do SST Hub classificados como “Não informado” podem ser reavaliados se a íntegra documentar as funcionalidades. [Conferência de 22/11](../revisao-2026-11-22/conferencia-de-fontes.md). |
| **Preservado por decisão — Apêndice A** | Se o questionário original for recuperado, pode esclarecer para onde levava “Pular para a pergunta 7”. A rodada pontual preservou o instrumento recebido. |
| **Montagem final** | Inserir ficha catalográfica e folha de aprovação com os dados institucionais na etapa correspondente. Atualizar o sumário completo no Word e conferir a paginação após a inserção. [Manual de normalização da UEMA][uema]. |

O [histórico de pendências](../../PENDENCIAS.md) continua sendo a referência
para lacunas de etapas anteriores, como datas diárias das entrevistas,
matriz individual indisponível e identificação do deploy usado em agosto.
A confirmação agregada de participação e o uso autorizado de Valente
atualizam TCC-P039 e a parte relativa a Guerra de TCC-P040/REV-02.
A edição do PMBOK estudada em aula é uma questão distinta.

[pes-002]: ../../fontes/pesquisa/pes-002-avaliacao-da-plataforma.md
[offline]: ../../../../AI/Offline.md
[retro]: ../../../RetrospectivaTecnicaDesenvolvimentoSafeWatchInsight.md
[tempos]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioTemposMobileTCC/ConferenciaRodada01.md
[tempos-json]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioTemposMobileTCC/tempos-mobile-rodada-01.json
[volume]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioVolumeTCC/Rodada01.md
[volume-json]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioVolumeTCC/volume-rodada-01.json
[palin]: https://doi.org/10.1145/3338286.3340120
[valente-1]: https://engsoftmoderna.info/cap1.html
[valente-3]: https://engsoftmoderna.info/cap3.html
[valente-7]: https://engsoftmoderna.info/cap7.html
[swebok]: https://ieeecs-media.computer.org/media/education/swebok/swebok-v4.pdf
[sst-hub]: https://ric.cps.sp.gov.br/handle/123456789/46338
[sest]: https://dspace.unila.edu.br/handle/123456789/1393
[rocha-ufrgs]: https://lume.ufrgs.br/bitstream/handle/10183/34398/000789681.pdf
[rocha-espacios]: https://www.revistaespacios.com/a15v36n13/15361307.html
[mpt-2022]: https://www.prt20.mpt.mp.br/informe-se/noticias-do-mpt-se/1130-mortalidade-no-trabalho-cresce-em-2022-e-acidentes-notificados-ao-sus-batem-recorde
[mte-nrs]: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes
[mpt-g20]: https://www.prt13.mpt.mp.br/servicos/edital-de-cadastro-de-entidades/2-uncategorised/1278-gastos-com-doencas-e-acidentes-do-trabalho-chegam-a-100-bi-desde-2012
[ler]: https://sol.sbc.org.br/index.php/sbcas/article/download/11545/11408/
[uema]: https://www.biblioteca.uema.br/wp-content/uploads/2026/05/Manual-Normalizacao_UEMA.pdf
