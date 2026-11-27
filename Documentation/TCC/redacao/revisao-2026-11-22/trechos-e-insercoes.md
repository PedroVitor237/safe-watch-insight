# Trechos acrescentados e pontos de inserção

Use a revisão de 18/11/2026 como referência de localização. O texto abaixo já está aplicado na [monografia completa](./monografia.md). Os parágrafos identificados como substituições entram no lugar dos originais.

## Resumo e Abstract

### Resumo, último parágrafo

Os quatro participantes da avaliação preliminar concordaram plenamente com a utilidade da consulta normativa e do histórico de inspeções e com a facilidade de aprender a usar a plataforma. Em novembro, um ensaio automatizado com emulação de dispositivo móvel mediu o acesso à inspeção em 3,688 s, em média, após seis minutos de espera e em 1,675 s nas tentativas consecutivas. Em outro ensaio, 30 inspeções realizadas em sequência foram recuperadas com suas respostas e seus relatórios. A avaliação em campo permanece como etapa futura.

### Abstract, último parágrafo

All four participants in the preliminary evaluation strongly agreed that the regulatory reference and inspection history were useful and that the platform was easy to learn. In November, an automated test using mobile device emulation measured a mean inspection access time of 3.688 s after six minutes of inactivity and 1.675 s on consecutive attempts. In a separate test, all 30 inspections completed in sequence could be retrieved with their responses and reports. Field evaluation remains a subject for future work.

## Introdução

### Introdução, parágrafo sobre as notificações de acidentes

Entre 2012 e 2021, foram notificados mais de seis milhões de acidentes de trabalho no Brasil (Cantave; Derrosso; Reis, 2023). Para 2022, o Observatório de Segurança e Saúde no Trabalho registrou 612,9 mil acidentes e 2.538 óbitos entre pessoas com carteira assinada, com base nas comunicações ao Instituto Nacional do Seguro Social (INSS). Os dados situam a dimensão do problema no emprego formal e a importância de manter registros que subsidiem a prevenção (Ministério Público do Trabalho, 2023).

### Introdução, parágrafo sobre adoecimento ocupacional

O adoecimento também pode afastar o trabalhador de suas atividades. Entre 2011 e 2021, a Previdência Social concedeu 632.578 benefícios acidentários por lesões por esforços repetitivos e distúrbios osteomusculares relacionados ao trabalho (LER/Dort), segundo a Fundacentro (2024). A difusão de informações sobre ergonomia também motivou a pesquisa de Bitencourte (2020) sobre aplicativos voltados à saúde do trabalhador. Em sua dimensão jurídica, a proteção do ambiente de trabalho envolve a preservação da vida, da saúde e da integridade dos trabalhadores (Eidt, 2017).

### Introdução, parágrafo histórico que antecede a apresentação da OIT

A relação entre trabalho e adoecimento já era objeto de observação na Antiguidade. Assis (2021) retoma os relatos de Hipócrates sobre a exposição de trabalhadores a metais e os escritos de Plínio, o Velho, sobre uma forma de proteção respiratória. Na literatura técnica contemporânea, esse tema integra o estudo da prevenção e das condições de segurança no ambiente de trabalho (Barsano; Barbosa, 2018).

### Introdução, parágrafo sobre a Organização Internacional do Trabalho

No âmbito internacional, a Organização Internacional do Trabalho (OIT) reúne representantes de governos, empregadores e trabalhadores na elaboração de normas e políticas. A Declaração do Centenário da OIT reafirma o trabalho decente, o diálogo social e a proteção dos trabalhadores entre as prioridades da instituição (International Labour Organization, 2019).

### Introdução, parágrafo sobre as Normas Regulamentadoras

Na relação publicada pelo Ministério do Trabalho e Emprego, a numeração das Normas Regulamentadoras vai da NR-1 à NR-38. Como a NR-2 e a NR-27 foram revogadas, permanecem 36 normas em vigor. Há disposições gerais sobre gerenciamento de riscos ocupacionais (NR-1) e regras específicas sobre a Comissão Interna de Prevenção de Acidentes e de Assédio (NR-5), a ergonomia (NR-17) e a construção civil (NR-18) (Brasil, 2020). A identificação dos riscos e a definição de medidas preventivas integram a prática de segurança do trabalho (Peixoto, 2010). A Política Nacional de Segurança e Saúde no Trabalho, instituída em 2011, também orienta a prevenção no país (Cantave; Derrosso; Reis, 2023).

### Introdução, parágrafo sobre SESMT e CIPA

Nas organizações, as ações internas de prevenção envolvem os Serviços Especializados em Segurança e em Medicina do Trabalho (SESMT), disciplinados pela NR-4, e a Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA), disciplinada pela NR-5 (Brasil, 2020). A identificação de perigos e o acompanhamento das medidas de prevenção aproximam essas atividades das inspeções discutidas neste trabalho. A fiscalização estatal das normas é tratada na seção 3.2.

### Introdução, parágrafo sobre o tempo de resposta no estudo metalúrgico

Além da coleta em campo, os sistemas digitais podem reunir informações de várias inspeções para consulta pelos gestores. Na implantação piloto em uma indústria metalúrgica, Silva *et al.* (2025) relataram redução de quase 50% no tempo de resposta gerencial aos riscos identificados. O indicador daquele estudo diz respeito à atuação dos gestores após o registro de um risco.

## Referencial teórico

### Seção 3.4, segundo parágrafo, sobre engenharia de software

Valente (2020, cap. 1) apresenta a engenharia de software como uma área que articula técnicas de requisitos, projeto, testes e manutenção. No desenvolvimento da plataforma, a equipe definiu quais informações registrar em cada vistoria, como distribuí-las entre o navegador e o servidor e como verificar se poderiam ser recuperadas posteriormente.

### Seção 3.4, parágrafo seguinte, sobre requisitos

A engenharia de requisitos envolve identificar as necessidades dos usuários, documentá-las e verificar se a especificação corresponde ao problema que se pretende resolver (Valente, 2020, cap. 3). As entrevistas e os formulários orientaram, neste projeto, a definição dos registros necessários à inspeção. Uma exigência foi associar a resposta ao item do checklist que o profissional efetivamente examinou, de modo que uma edição posterior do modelo preservasse o sentido do registro original. Essa passagem da necessidade de campo à especificação é também discutida por Pressman e Maxim (2016).

### Seção 3.4, parágrafo seguinte, sobre arquitetura

Na arquitetura em camadas, a distribuição de responsabilidades delimita as dependências entre os componentes (Valente, 2020, cap. 7). Para a plataforma, isso significou distinguir a apresentação do checklist, as regras de conclusão e a persistência das respostas, em consonância com o princípio de separação discutido por Martin (2019). A distinção tem uma consequência para o técnico em campo. A interface pode confirmar que a resposta foi salva no dispositivo enquanto sua transmissão ao servidor ainda está pendente.

### Seção 3.4.1, parágrafo sobre armazenamento local e PWA

Na aplicação web progressiva (PWA), o manifesto descreve a aplicação para o navegador. O *service worker* intercepta as requisições previstas pela aplicação e permite reutilizar arquivos públicos armazenados localmente (MDN Web Docs, 2026). Depois da preparação de uma inspeção, esses recursos permitem reabrir a interface sem rede. As respostas e a fila de sincronização ficam no IndexedDB.

### Seção 3.4.2, trabalho relacionado de Silva e colaboradores

Silva *et al.* (2025) desenvolveram um sistema de controle de riscos para o setor metalúrgico. Os autores relataram redução de quase 50% no tempo de resposta gerencial aos riscos detectados durante a implantação piloto. Na plataforma desta pesquisa, o foco da avaliação técnica recaiu sobre etapas do registro de uma inspeção e sobre a recuperação de seu relatório.

### Seção 3.4.2, parágrafo de apresentação dos Quadros 1 e 2

O Quadro 1 reúne as funcionalidades comparadas pelos autores e o Quadro 2 detalha os recursos voltados ao trabalho em campo. A classificação das outras ferramentas se refere ao que foi identificado nas publicações consultadas. Os ensaios de novembro, apresentados no capítulo 5, foram executados exclusivamente na plataforma desenvolvida neste trabalho.

### Seção 3.4.2, título do Quadro 1

**Quadro 1 – Síntese comparativa dos trabalhos analisados**

## Metodologia

### Metodologia, segundo parágrafo, delimitação temporal

Entre maio e outubro de 2026, a equipe delimitou o tema, levantou requisitos com profissionais de SST, projetou a plataforma e revisou as funcionalidades implementadas. A avaliação da versão preliminar com participantes ocorreu de 28 a 31 de agosto. Em 21 de novembro, dois ensaios automatizados complementaram a avaliação técnica. A proposta inicial, uma cartilha digital para consulta de normas, deu lugar a uma ferramenta de apoio às inspeções. A consulta às Normas Regulamentadoras permaneceu disponível durante o registro, e a apreciação das condições de segurança coube ao profissional.

### Metodologia, parágrafo que encerra a descrição da avaliação de agosto

As revisões de código e os testes de integração e de navegador acompanharam as entregas até outubro. Os registros dessas verificações documentam as condições em que cada comportamento foi observado. O questionário de agosto descreve a experiência com a versão então disponível. Os relatórios históricos e os painéis com dados reais foram integrados posteriormente.

### Inserir após o parágrafo que encerra a descrição da avaliação de agosto

No ensaio de tempos, o Playwright controlou o Chromium em um notebook Linux conectado por Wi-Fi em Itapecuru Mirim (MA). O navegador emulou o perfil de um Pixel 7, com área de exibição de 412 × 839 pixels. A aplicação foi hospedada na Vercel e o PostgreSQL no Neon, em ambientes dedicados na região de São Paulo. Um fluxo envolveu abrir e preencher uma nova inspeção. O outro consistiu em consultar o mesmo relatório histórico a cada tentativa. Em cada fluxo houve três blocos. Após seis minutos sem requisições do executor, fez-se uma tentativa seguida de cinco consecutivas. Cada tentativa começou em um novo contexto de navegação, com a sessão já autenticada. As duas tentativas do piloto ficaram fora da análise.

Em cada inspeção, o roteiro marcou quatro itens conformes, um não conforme e um não aplicável, digitou duas observações fixas e dispensou fotografias. A cadência de digitação tomou como referência o estudo de Palin *et al.* (2019), no qual 37.370 voluntários transcreveram frases em dispositivos móveis, à média de 36,2 palavras por minuto. Pela convenção de cinco caracteres por palavra usada no estudo, o intervalo calculado é de aproximadamente 331,5 ms por caractere. O protocolo indicava 332 ms, e a execução usou 331 ms. Calcularam-se as médias aritméticas dos tempos observados nas três primeiras tentativas e nas 15 consecutivas de cada fluxo.

O segundo ensaio acompanhou 30 ciclos de uso em sequência. Cada ciclo compreendeu cadastrar uma empresa sintética, publicar um checklist de dois itens, concluir a inspeção e recuperar as respostas em outro contexto de navegação. Em seguida, conferiram-se a identificação da inspeção e o conteúdo do relatório. A cada terceiro ciclo, o segundo item previa uma não conformidade com observação própria. Ao fim da rodada, os registros no PostgreSQL foram confrontados com os dados exibidos na interface.

### Seção 4.2, última frase do último parágrafo

Cada alteração estrutural motivou atualizações na documentação do sistema e nos cenários de teste. As revisões do desenvolvimento documentadas até outubro antecederam os ensaios complementares de novembro.

## Resultados e Discussão

### Inserir após o parágrafo sobre a operação offline e antes da avaliação de agosto

Na homologação de setembro, três cenários exercitaram a retomada de uma inspeção sem rede, o reenvio de operações e o tratamento de uma edição conflitante. Em outubro, 18 verificações em PostgreSQL local e dez em Chromium com armazenamento local confirmaram, nos casos exercitados, que repetir uma operação já aceita preservava uma única gravação. O Apêndice I apresenta as condições dessas verificações e os resultados relativos ao histórico dos checklists e ao acesso por contas distintas.

### Inserir após a Figura 5 e sua fonte, antes do parágrafo sobre a contribuição acadêmica

Em 21 de novembro, as 36 tentativas cronometradas atenderam aos critérios do roteiro. Foram 18 inspeções distintas e 18 consultas ao mesmo relatório histórico. A Tabela 2 apresenta as médias por condição. As três medidas da inspeção descrevem etapas das mesmas tentativas.

**Tabela 2 – Tempos médios de execução da inspeção e de abertura do relatório em navegador com emulação móvel**

| Medida | Após 6 min de espera (n = 3), em s | Tentativas consecutivas (n = 15), em s |
| --- | ---: | ---: |
| Acesso à inspeção | 3,688 | 1,675 |
| Preenchimento da inspeção | 29,023 | 29,062 |
| Preenchimento até a confirmação local | 29,218 | 29,261 |
| Relatório pronto na tela | 3,700 | 1,682 |

Fonte: elaboração dos autores com base nos registros do ensaio de 21 de novembro de 2026.

Nota: n indica o número de tentativas por fluxo em cada condição. As duas medidas de preenchimento partem do instante em que o checklist está disponível para resposta. A confirmação local assinala o início da sincronização. A conferência no banco ocorreu depois da cronometragem. Para o relatório, o marco final foi a exibição dos itens e das observações com a opção Imprimir habilitada.

Nas tentativas consecutivas, a inspeção ficou disponível para resposta cerca de dois segundos antes, em média, do que nas primeiras aberturas após a espera. Observou-se diferença semelhante na apresentação do relatório. O banco Neon registrou reativações próximas à primeira abertura dos seis blocos. Como a medição abrangeu todo o percurso entre navegador, aplicação e banco, a parcela de tempo de cada componente permanece indeterminada. O preenchimento, com a mesma sequência de respostas e a mesma cadência de digitação, permaneceu próximo de 29 segundos nas duas condições.

No ensaio de volume, os 30 ciclos chegaram à consulta do relatório da respectiva inspeção. A consulta ao banco confirmou 30 empresas, 30 checklists com uma versão publicada cada, 30 inspeções concluídas e sincronizadas, 30 cópias históricas dos formulários e 60 respostas. As dez não conformidades previstas apareceram com as observações correspondentes nos respectivos relatórios. A correspondência entre a tela e os registros persistidos mostra que, nesse conjunto, foi possível recuperar a versão e as respostas de cada vistoria após sua conclusão. O Apêndice I detalha as conferências por etapa.

### Resultados e Discussão, parágrafo sobre os limites da avaliação com participantes

A avaliação com quatro participantes descreve a experiência de um grupo pequeno e com perfis distintos. Os dados foram analisados de forma agregada. Cada resposta corresponde a 25% do grupo, o que restringe a interpretação das diferenças entre as questões. A aplicação do questionário em ambiente controlado também deixa em aberto como as condições de conectividade, a necessidade de manter as mãos livres e o uso prolongado da plataforma influenciam a vistoria em campo.

### Resultados e Discussão, parágrafo seguinte, sobre o alcance das medições

Os quatro participantes concordaram plenamente que conseguiam realizar as tarefas com rapidez e eficiência na versão avaliada em agosto. A Tabela 2 apresenta o tempo de um roteiro automatizado com respostas, observações e cadência de digitação predefinidas. Uma estimativa de economia de tempo no trabalho exigiria observar profissionais executando tarefas comparáveis com a plataforma e com o procedimento habitual. A duração de vistorias reais, a incidência de acidentes e o valor de multas ficaram fora das medidas desta pesquisa.

## Conclusão

### Inserir após o parágrafo sobre as limitações da avaliação com potenciais usuários

Nos ensaios complementares, o acesso à inspeção e a abertura do relatório levaram, em média, cerca de 3,7 segundos após a espera e 1,7 segundo nas tentativas consecutivas. A recuperação de 30 inspeções distintas em sequência, com as respectivas respostas e observações de não conformidade quando aplicáveis, complementou a percepção de utilidade do histórico registrada pelos participantes. Esses resultados caracterizam o funcionamento da plataforma nas condições ensaiadas.

### Conclusão, segunda frase, após a proposta de ampliar a avaliação em campo

Uma comparação entre o registro habitual e a plataforma poderia cronometrar tarefas equivalentes, distinguindo o tempo de observação dos riscos, de preenchimento e de recuperação do relatório.

## Referências

Inserir Assis antes de Barsano, Fundacentro e International Labour Organization entre Fowler e Lopes, Ministério Público do Trabalho entre Microsoft e Morais e Palin antes de Peixoto. Substituir as entradas de Cantave, Dexie.js, MDN Web Docs, TanStack Start e Valente. Retirar as entradas antigas do relatório de 2007 da OIT, de Rocha e do SmartLab, que perderam suas chamadas. O DOI de Cantave e os links conferidos ficam nas respectivas entradas.

ASSIS, Mara Queiroga Camisassa de. História da segurança e saúde no trabalho no Brasil e no mundo. **Revista da Escola Nacional da Inspeção do Trabalho**, ano 5, 2021. Disponível em: https://revistaenit.trabalho.gov.br/index.php/RevistaEnit/article/view/127. Acesso em: 22 nov. 2026.

CANTAVE, Jerry; DERROSSO, Giuliano; REIS, Waneska Cavalcante Ferreira de Albuquerque. Acidentes de trabalho no Brasil: análise temporal de 2012 a 2021. **Boletim Técnico do Senac**, Rio de Janeiro, v. 49, e23009, 2023. DOI: https://doi.org/10.26849/bts.v49i.949.

DEXIE.JS. **Design**. \[S. l.\]: Dexie.js, 2023. Disponível em: https://dexie.org/docs/Tutorial/Design. Acesso em: 16 out. 2026.

FUNDACENTRO. **Trabalhadores com LER/Dort podem sofrer assédio moral e transtornos mentais**. 2024. Disponível em: https://www.gov.br/fundacentro/pt-br/comunicacao/noticias/noticias/2024/marco/trabalhadores-com-ler-dort-podem-sofrer-assedio-moral-e-transtornos-mentais. Acesso em: 22 nov. 2026.

INTERNATIONAL LABOUR ORGANIZATION. **ILO Centenary Declaration for the Future of Work**. Geneva: ILO, 2019. Disponível em: https://www.ilo.org/resource/ilc/108/ilo-centenary-declaration-future-work. Acesso em: 22 nov. 2026.

MDN WEB DOCS. **Offline and background operation**. \[S. l.\]: Mozilla, 2026. Disponível em: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation. Acesso em: 02 out. 2026.

MINISTÉRIO PÚBLICO DO TRABALHO. **Mortalidade no trabalho cresce em 2022 e acidentes notificados ao SUS batem recorde**. 30 mar. 2023. Disponível em: https://www.prt20.mpt.mp.br/informe-se/noticias-do-mpt-se/1130-mortalidade-no-trabalho-cresce-em-2022-e-acidentes-notificados-ao-sus-batem-recorde. Acesso em: 22 nov. 2026.

PALIN, K.; FEIT, A. M.; KIM, S.; KRISTENSSON, P. O.; OULASVIRTA, A. How do people type on mobile devices? Observations from a study with 37,000 volunteers. In: INTERNATIONAL CONFERENCE ON HUMAN-COMPUTER INTERACTION WITH MOBILE DEVICES AND SERVICES, 21., 2019, Taipei. **Proceedings of the 21st International Conference on Human-Computer Interaction with Mobile Devices and Services**. New York: ACM, 2019. Art. 9, p. 1–12. DOI: https://doi.org/10.1145/3338286.3340120.

TANSTACK. **Server functions**. TanStack Start: React documentation. \[S. l.\]: TanStack, 2026b. Disponível em: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions. Acesso em: 22 nov. 2026.

VALENTE, Marco Tulio. **Engenharia de software moderna**: princípios e práticas para desenvolvimento de software com produtividade. [S. l.]: Independente, 2020. Disponível em: https://engsoftmoderna.info/index.html. Acesso em: 22 nov. 2026.

## Apêndices

### Apêndice C, quinta alternativa da questão 4, imediatamente antes da questão 5

() Concordo totalmente

### Inserir após o Apêndice H e incluir a entrada no sumário

# APÊNDICE I – Síntese das verificações técnicas da plataforma

Os quadros reúnem as verificações que sustentam a discussão do capítulo 5. O Quadro 3 acompanha cada etapa do ensaio de volume. Os Quadros 4 e 5 registram como foram verificadas a continuidade do trabalho sem rede, a integridade do histórico e a separação de dados entre contas.

**Quadro 3 – Verificações do ensaio de volume sequencial**

| Etapa | Resultado observado |
| --- | --- |
| Cadastro e publicação | 30 empresas e 30 checklists distintos, com dois itens e uma versão publicada por checklist. |
| Conclusão e nova consulta | 30 inspeções concluídas e sincronizadas, com 60 respostas recuperadas em novos contextos de navegação. |
| Relatório histórico | 30 relatórios exibidos sob demanda. O identificador de cada relatório correspondeu ao da inspeção do ciclo. |
| Não conformidades | 10 ciclos com uma ocorrência e observação correspondente. Os outros 20 relatórios apresentaram a seção sem ocorrências. |
| Conferência no banco | 30 cópias históricas, 60 respostas e 10 não conformidades ativas. Os vínculos com a empresa, o checklist e a inspeção foram conferidos nos 30 ciclos. |

Fonte: elaboração dos autores com base no ensaio de volume de 21 de novembro de 2026.

Nota: na preparação anterior, uma leitura do banco excedeu o tempo limite antes da primeira gravação. A rodada apresentada começou após o ajuste dessa consulta. Os ciclos foram executados um a um.

**Quadro 4 – Operação sem rede e concorrência na sincronização**

| Execução e ambiente | Resultado observado |
| --- | --- |
| Retomada sem rede e reenvio • Chromium e Neon | A inspeção preparada foi reaberta sem conexão. A fila foi recuperada e uma operação reenviada com o mesmo identificador foi gravada uma única vez. |
| Edição e conclusão sem rede • Chromium e Neon | Seis itens e nove operações foram sincronizados em ordem. A observação foi preservada e o reenvio da conclusão manteve um único resultado. |
| Conflito de revisão • Chromium e Neon | A operação local ficou bloqueada para tratamento e o dado já confirmado no servidor foi preservado. |
| Operações concorrentes • PostgreSQL 18.4 local | 18 de 18 verificações aprovadas, incluindo reenvios e preservação de registros confirmados em conflitos. |
| Abas e perda de confirmação • Chromium, HTTP e IndexedDB locais | 10 de 10 verificações aprovadas. O reenvio após perda da confirmação evitou uma segunda gravação. A alteração da aba em conflito permaneceu na fila local. |

Fonte: elaboração dos autores com base nas homologações de 5 de setembro e 12 de outubro de 2026.

Nota: os três primeiros registros correspondem à homologação de setembro. Os dois últimos apresentam as execuções de outubro em banco local descartável.

**Quadro 5 – Histórico, cópia de checklists e separação de dados entre contas**

| Objeto e ambiente | Resultado observado |
| --- | --- |
| Histórico • PostgreSQL no Neon | Foram conferidas duas versões de checklist, suas cópias históricas com itens e normas, a não conformidade vinculada e a recuperação da inspeção após edição do modelo. |
| Modelos institucionais e cópia pessoal • Neon | A validação dos modelos registrou 8 de 8 e a da cópia registrou 10 de 10. A edição de uma cópia pela interface preservou o modelo de origem (1 de 1 em Chromium). |
| Acesso por duas contas • PostgreSQL no Neon | A conta titular concluiu a inspeção. As leituras e alterações de registros privados por outra conta foram recusadas nos casos verificados. |
| Armazenamento temporário • Chromium local com respostas sintéticas | A troca ou expiração da sessão foi verificada em 5 de 5 testes de cache de consultas e em 8 de 8 testes do service worker. |

Fonte: elaboração dos autores com base nas verificações de histórico, de modelos e de isolamento de dados realizadas durante o desenvolvimento.

Nota: as contagens de modelos e cópia incluem um teste principal e, respectivamente, sete e nove subtestes. Os grupos têm cenários em comum e são apresentados por execução.

## Montagem da versão consolidada

| Elemento | Local na monografia | Aplicação |
| --- | --- | --- |
| Tabela 2 | Capítulo 5, logo após a chamada que sucede a Figura 5 | Tabela editável. O título precede os valores. A fonte e a nota que define os marcos ficam imediatamente abaixo. |
| Quadro 3 | Início do Apêndice I, após o parágrafo de apresentação | Resultados do ensaio de volume por etapa. |
| Quadro 4 | Página seguinte do Apêndice I | Resultados de operação sem rede e de concorrência. |
| Quadro 5 | Última página do Apêndice I | Resultados referentes ao histórico, à cópia de checklists e à separação de dados entre contas. |
| Figuras e diagramas da revisão de 18/11 | Figuras 1 a 5 nos capítulos 4 e 5 e diagramas nos Apêndices D a H | No Word, cada diagrama dos Apêndices D a H foi posto na mesma página do título correspondente. Os arquivos de imagem são os mesmos da monografia recebida. |

Os [quatro diagramas PlantUML elaborados para os ensaios](https://github.com/PedroVitor237/safe-watch-insight/tree/93f667fe92554657ceeb33b8e9982bb81bfa8da1/Documentation/diagrams/testes) servem de apoio. O primeiro corresponde à Tabela 2. Os demais correspondem aos Quadros 3 a 5. A versão consolidada já inclui os dados em tabelas e quadros editáveis.
