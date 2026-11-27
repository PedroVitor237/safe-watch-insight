# Conferência de evidências e referências

A revisão de 22/11/2026 parte da [monografia de 18/11](../../fontes/monografia/mono-002-revisao-2026-11-18.md). A versão completa incorpora os ensaios de 21/11 e conserva a avaliação feita com quatro participantes de 28 a 31/08. Os pontos de inserção e os textos correspondentes estão em [trechos-e-insercoes.md](./trechos-e-insercoes.md).

## Resultados e rastreabilidade

| Uso na monografia | Evidência consultada | Conferência |
| --- | --- | --- |
| Capítulo 4, procedimento e cadência | [Protocolo][protocolo], [relato da rodada][tempos], [roteiro executado][roteiro] e [Palin et al.][palin] | A cadência de referência vem de uma tarefa de transcrição em dispositivos móveis. Os 36,2 palavras por minuto equivalem a 331,4917 ms/caractere pela fórmula 60.000 ÷ (36,2 × 5). O protocolo registra 332 ms e a rodada usou 331 ms, obtidos por arredondamento no roteiro. Preparação e login precederam o cronômetro. |
| Capítulo 5, Tabela 2 | [36 tentativas individuais][json-tempos] e [conferência da rodada][conferencia] | Agrupadas por fluxo e condição, as 36 tentativas aprovadas produziram as oito médias da tabela. Os seis blocos tiveram uma primeira tentativa após a espera e cinco consecutivas. O piloto teve duas tentativas adicionais. |
| Capítulo 5, diferença de acesso e de abertura do relatório | [Horários de coleta e atividade do Neon][tempos] e [ciclo do compute documentado pelo Neon][neon] | Diferenças entre as médias arredondadas de 2,013 s no acesso à inspeção e 2,018 s na abertura do relatório. Nos seis blocos, houve eventos de suspensão e reativação. A distância temporal calculada entre abertura e marca de reativação vai de 0,301 s antes a 1,592 s depois, com resolução de um segundo no log. O roteiro mediu o percurso completo, com a participação do Neon e a inicialização da Vercel indeterminadas. |
| Capítulo 4, capítulo 5 e Quadro 3 | [Procedimento e ocorrências do ensaio de volume][volume], [30 ciclos e vínculos no JSON][json-volume] e [roteiro de volume][roteiro-volume] | Os identificadores de 30 relatórios correspondem a 30 inspeções distintas. Foram aprovadas todas as etapas aplicáveis, incluindo as dez com não conformidade. O banco confirmou 30 empresas, 30 checklists e versões publicadas, 30 inspeções concluídas e sincronizadas, 30 cópias históricas, 60 respostas e dez não conformidades ativas. A preparação anterior foi interrompida por tempo limite de leitura, com zero ciclos iniciados. |
| Capítulo 5 e Quadro 4 | [Homologação offline de 05/09][offline], [homologação de concorrência de 12/10][concorrencia] e [auditoria técnica][auditoria] | Três cenários offline em Chromium com servidor local e banco Neon. Em outubro, 18/18 verificações em PostgreSQL 18.4 local e 10/10 com Chromium, HTTP e IndexedDB. Os ambientes e os resultados são descritos por execução. |
| Capítulo 5 e Quadro 5 | [Modelos institucionais][templates], [cópia de checklists][copia] e [auditoria técnica][auditoria] | Confirmados os cenários de preservação do histórico, cópia e separação de dados de duas contas. Os denominadores de 8 e 10 incluem o teste principal. Os resultados de cache de consultas e do service worker, 5/5 e 8/8, referem-se a execuções com dados ou respostas sintéticas. |
| Resumo, metodologia, capítulo 5, conclusão e Apêndice C | [PES-002, avaliação de agosto][pes-002] e análise original da dupla, p. 3 | A questão 7 informa rapidez percebida por quatro pessoas. Na reprodução da questão 4 no Apêndice C, corrigiu-se a repetição da quinta alternativa. O registro original de respostas para essa questão confirma “Concordo totalmente” para os quatro participantes. |

Os ensaios de novembro foram feitos com um executor e em infraestrutura dedicada. A representação de um Pixel 7 veio dos recursos de [emulação do Playwright][emulacao]. A Tabela 2 mede etapas de navegação, preenchimento com texto predefinido, confirmação local e exibição do relatório. O ponto de chegada do relatório inclui a disponibilidade do comando de impressão. Login, sincronização concluída, manipulação de fotos, exportação de PDF, simultaneidade de usuários e comparação com o papel ficaram fora dos cronômetros. O ensaio de volume exercitou a repetição funcional dos registros e a consistência dos vínculos em sequência.

## Referências alteradas ou acrescentadas

| Fonte | Verificação e consequência editorial |
| --- | --- |
| Guerra (2020) e Valente (2020) | A revisão de 18/11 trazia três chamadas a Guerra sem entrada bibliográfica. O autor informou que não dispõe da fonte. Os três parágrafos foram reescritos após cotejo com os capítulos de [introdução][val1], [requisitos][val3] e [arquitetura][val7] de Valente. O livro já constava das referências. A redação nova associa cada afirmação ao capítulo que a fundamenta e descreve como a plataforma distingue a confirmação local da sincronização. |
| Palin et al. (2019) | Artigo 9, DOI 10.1145/3338286.3340120, nos anais da ACM. Conferidos os autores, a amostra final de 37.370 pessoas, a média de 36,2 palavras por minuto e a convenção de cinco caracteres por palavra. A obra fundamenta o intervalo de digitação usado no cenário, sem estimar tempo de leitura, inspeção ou navegação dos participantes desta pesquisa. [Exemplar institucional Aalto](https://acris.aalto.fi/ws/portalfiles/portal/38210172/ELEC_Palin_How_do_People_type_MobileHCI.pdf) |
| Cantave, Derrosso e Reis (2023) | Autoria completa, e23009, DOI e número superior a seis milhões de notificações conferidos na revista e no artigo. A Introdução usa a expressão “foram notificados”. [Registro da revista][cantave] · [PDF primário][cantave-pdf] |
| SmartLab e Ministério Público do Trabalho (2023) | Os números de 2022 foram vinculados à divulgação conjunta dos dados do Observatório pelo MPT, com o recorte do trabalho com carteira assinada. Retiraram-se as duas entradas genéricas anteriores e os enunciados sobre G20 e subnotificação, cujos recortes e metodologia não ficaram comprovados para as afirmações da monografia. [Divulgação oficial][mpt] |
| Rocha (1999/2001) e Assis (2021) | A referência original de Rocha combinava dois anos e era usada para uma afirmação histórica sobre Hipócrates. A passagem foi reescrita a partir do artigo de Mara Queiroga Camisassa de Assis, que documenta diretamente as observações atribuídas a Hipócrates e Plínio. A entrada de Rocha foi retirada após deixar de ser citada. Conservou-se Barsano e Barbosa com a ordem dos autores da obra. [Artigo de Assis][assis] |
| Bitencourte (2020) e Fundacentro (2024) | A fonte acadêmica foi identificada no registro de orientação. Como o percentual de 11,19% e seu denominador não puderam ser confirmados, a introdução agora usa o total acidentário de 2011 a 2021 publicado pela Fundacentro. A referência de Bitencourte fica vinculada ao tema confirmado da dissertação, sobre aplicativos de ergonomia. [Divulgação da Fundacentro][fundacentro] |
| International Labour Organization (2019) | A declaração do centenário fundamenta a menção ao trabalho decente, à proteção do trabalhador e ao diálogo social. Substitui a chamada a um relatório de 2007 sobre construção com endereço quebrado no original. [Declaração oficial][ilo] · [Missão e composição][ilo-missao] |
| Brasil (2020) e Peixoto (2010) | A lista mantida pelo MTE discrimina da NR-1 à NR-38, inclusive as duas revogadas. A contagem de 36 vigentes e a identificação de NR-4 e NR-5 vêm dessa página. O material de Peixoto foi aplicado à prevenção e identificação de riscos. O ano de 2010 consta da ficha catalográfica do PDF da UFSM, embora o expediente do exemplar também traga 2011. [Relação oficial das NRs][mte] · [Edição da UFSM][peixoto] |
| Dexie.js (2023) e TanStack (2026b) | O endereço de *Server functions* estava no fim da entrada de Dexie.js. Foi recolocado na entrada correspondente. Para identificar a revisão do conteúdo, conferiu-se também o arquivo da documentação oficial mantida no repositório da TanStack. [Dexie.js][dexie] · [TanStack][tanstack] · [Fonte da documentação][tanstack-raw] |
| MDN Web Docs (2026) | A descrição da PWA passou a atribuir ao manifesto a descrição da aplicação e ao service worker a interceptação de requisições. A persistência dos formulários e da fila é descrita conforme o projeto. [Documentação sobre funcionamento offline][mdn] |
| Silva et al. (2025) | O artigo informa uma redução de quase 50% no tempo de resposta aos riscos em um piloto metalúrgico. A Introdução e os trabalhos relacionados atribuem a medida ao estudo publicado. O artigo não mede a duração das inspeções cronometradas nesta monografia. [Artigo original][silva] |

## Demais referências da revisão de 18/11

| Entrada | Resultado da conferência |
| --- | --- |
| Barsano e Barbosa (2018) | Autores, título e edição identificados no catálogo da editora e em bibliografia institucional. Os relatos históricos da nova redação são sustentados pelo artigo de Assis. [Registro editorial][barsano] |
| Bitencourte (2020) | Autora, título, natureza e ano identificados em registro institucional de orientação. A consulta pública não permitiu validar a íntegra ou identificar a página do percentual antigo. A questão foi tratada no texto, conforme o quadro anterior. |
| Camisassa (2015) | Livro identificado na cópia disponibilizada pela UFPR. É fonte da contextualização histórica. A vigência atual das NRs foi conferida diretamente com o MTE. [PDF disponibilizado pela UFPR][camisassa] |
| Eidt (2017) | Dissertação e objeto confirmados na cópia institucional. Sustenta o tratamento jurídico da proteção laboral e a discussão sobre a fiscalização em micro e pequenas empresas. [PDF em portal governamental][eidt] |
| Fowler (2019), Martin (2019), Pressman e Maxim (2016) e Sommerville (2011) | Título e edição identificados por editora, catálogo ou exemplar institucional. As chamadas se referem a refatoração, separação de responsabilidades, requisitos e confiabilidade. [Novatec][fowler] · [Alta Books][martin] · [Grupo A, 8ª edição][pressman] · [Catálogo do IFTM][sommerville] |
| Lopes (2013) | Título, autoria, vínculo com a UFRGS e ano constam da cópia localizada. O registro institucional direto e as páginas das afirmações sobre a prevalência de papel no mercado permanecem pendentes. O ensaio de novembro ficou fora dessas alegações. |
| Lucena (2019) | Título, autoria e escopo de jogos e realidade virtual para capacitação de gestores confirmados em repositório da UEL. A aplicação de uma referência teórica de Hollnagel por intermédio dessa dissertação merece conferência de página antes do depósito. [Registro da UEL][lucena] |
| Morais et al. (2026 na revisão de 18/11) | O Centro Paula Souza cataloga o SST Hub com o ano de 2025 na citação sugerida e junho de 2026 no campo de data. Manteve-se 2026 enquanto a capa não pôde ser consultada. O escopo consultivo é descrito no registro. As células dos Quadros 1 e 2 sobre funcionalidades não documentadas devem ser cotejadas com o texto integral. [Registro do Centro Paula Souza][morais] |
| Murbach (2019) | Autoria, ano e escopo na construção civil confirmados no repositório da UTFPR. A entrada identifica a ferramenta de verificação para o setor. [Registro da UTFPR][murbach] |
| Oliveira (2025) | Autoria, ano e dissertação identificados na Unicamp. A Introdução passou a usar diretamente o MTE para fundamentar a definição da CIPA. [Cópia institucional][oliveira] |
| Prodanov e Freitas (2013) | Edição, ficha catalográfica e capítulos de metodologia identificados. Sustenta a classificação e o delineamento, com as páginas registradas na conferência anterior. [Editora Feevale][prodanov] |
| Topdjian et al. (2016) | Título, autores, ano e objeto identificados no catálogo da UNILA. As funcionalidades do SEST na comparação devem ser lidas como inventário da bibliografia consultada. [Repositório da UNILA][topdjian] |
| Washizaki (2026) | O exemplar conferido tem “Version 4.0a” e “Released August 2026” na capa. Preservou-se o ano desta versão e o nome do editor. [PDF oficial][swebok] |
| Cloudinary, Microsoft, PostgreSQL, Prisma, React, Tailwind Labs, TanStack Query e Zod | Documentação oficial com páginas, trechos e datas registrados na [conferência técnica anterior](../referencias-verificadas.md#documentação-oficial-das-tecnologias). São fontes sobre a tecnologia. Os resultados de uso desta plataforma decorrem dos relatórios e registros do projeto. |

A conferência abrangeu o vínculo entre chamadas e entradas, a identificação bibliográfica disponível e a leitura dos trechos usados nos argumentos novos. O ano de Morais e as páginas de Lopes são as pendências bibliográficas com efeito sobre a versão acadêmica. Os comparativos com ferramentas externas têm caráter documental. O [Manual de normalização da UEMA, 6ª ed.][uema] orientou o uso de títulos, fontes, notas e a inclusão do apêndice no sumário.

[protocolo]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioTemposMobileTCC.md
[tempos]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioTemposMobileTCC/Rodada01.md
[json-tempos]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioTemposMobileTCC/tempos-mobile-rodada-01.json
[conferencia]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioTemposMobileTCC/ConferenciaRodada01.md
[roteiro]: https://github.com/PedroVitor237/safe-watch-insight/blob/b247c8694c06221a64000e6844479bf7a015e429/tests/timing/workflow.spec.ts
[volume]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioVolumeTCC/Rodada01.md
[json-volume]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/EnsaioVolumeTCC/volume-rodada-01.json
[roteiro-volume]: https://github.com/PedroVitor237/safe-watch-insight/blob/286f511abaa33ee3d939d0aa730fc8c112b60d6a/tests/volume/workflow.ts
[offline]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/AI/Offline.md
[concorrencia]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/HomologacaoConcorrenciaPostgreSQLIC-P6-03.md
[auditoria]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/RelatorioAuditoriaTecnicaPreEscritaTCC.md
[templates]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/AI/OfficialTemplates.md
[copia]: https://github.com/PedroVitor237/safe-watch-insight/blob/93f667fe92554657ceeb33b8e9982bb81bfa8da1/AI/ChecklistCopy.md
[pes-002]: ../../fontes/pesquisa/pes-002-avaliacao-da-plataforma.md
[palin]: https://doi.org/10.1145/3338286.3340120
[neon]: https://neon.com/docs/introduction/compute-lifecycle
[emulacao]: https://playwright.dev/docs/emulation
[val1]: https://engsoftmoderna.info/cap1.html
[val3]: https://engsoftmoderna.info/cap3.html
[val7]: https://engsoftmoderna.info/cap7.html
[cantave]: https://www.bts.senac.br/bts/article/view/949
[cantave-pdf]: https://www.bts.senac.br/bts/article/download/949/801/2389
[mpt]: https://www.prt20.mpt.mp.br/informe-se/noticias-do-mpt-se/1130-mortalidade-no-trabalho-cresce-em-2022-e-acidentes-notificados-ao-sus-batem-recorde
[assis]: https://revistaenit.trabalho.gov.br/index.php/RevistaEnit/article/view/127
[fundacentro]: https://www.gov.br/fundacentro/pt-br/comunicacao/noticias/noticias/2024/marco/trabalhadores-com-ler-dort-podem-sofrer-assedio-moral-e-transtornos-mentais
[ilo]: https://www.ilo.org/resource/ilc/108/ilo-centenary-declaration-future-work
[ilo-missao]: https://www.ilo.org/about-ilo/mission-and-impact-ilo
[mte]: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes
[peixoto]: https://redeetec.mec.gov.br/images/stories/pdf/eixo_ctrl_proc_indust/tec_autom_ind/seg_trab/161012_seg_do_trab.pdf
[dexie]: https://dexie.org/docs/Tutorial/Design
[tanstack]: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
[tanstack-raw]: https://raw.githubusercontent.com/TanStack/router/main/docs/start/framework/react/guide/server-functions.md
[mdn]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
[silva]: https://periodicorease.pro.br/rease/article/view/20589
[barsano]: https://books.google.com.br/books?id=h7hiDwAAQBAJ
[camisassa]: https://saude.ufpr.br/epmufpr/wp-content/uploads/sites/42/2020/10/NRs-comentadas.pdf
[eidt]: https://bibliotecadigital.gestao.gov.br/bitstream/777/521653/1/DILNEI_JOSE_EIDT.pdf
[fowler]: https://novatec.com.br/livros/refatoracao/
[martin]: https://altabooks.com.br/produto/arquitetura-limpa/
[pressman]: https://grupoa-mkt.com.br/livro/PRESSMAN_Engenharia_Software_8ed/Email_Adocao/
[sommerville]: https://biblioteca.iftm.edu.br/Acervo/Detalhe/1915
[lucena]: https://repositorio.uel.br/items/a20dc132-80cd-47b6-8445-432cf5a35adc
[morais]: https://ric.cps.sp.gov.br/handle/123456789/46338
[murbach]: https://riut.utfpr.edu.br/jspui/handle/1/17523
[oliveira]: https://repositorio.unicamp.br/Resultado/Listar?guid=1767744005974
[prodanov]: https://www.feevale.br/institucional/editora-feevale/metodologia-do-trabalho-cientifico---2-edicao
[topdjian]: https://dspace.unila.edu.br/browse/title?scope=8dd3336e-53c8-483b-98df-03ef2ffc29bd
[swebok]: https://ieeecs-media.computer.org/media/education/swebok/swebok-v4.pdf
[uema]: https://www.biblioteca.uema.br/wp-content/uploads/2026/05/Manual-Normalizacao_UEMA.pdf
