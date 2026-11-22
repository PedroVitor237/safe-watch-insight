UNIVERSIDADE ESTADUAL DO MARANHÃO

PROGRAMA DE FORMAÇÃO PROFISSIONAL TECNOLÓGICA

CURSO SUPERIOR EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS

**FELIPE FERREIRA ARAÚJO**

**PEDRO VITOR SILVA DE BRITO**

**DESENVOLVIMENTO DE UMA PLATAFORMA WEB INTERATIVA PARA APOIO À SEGURANÇA DO TRABALHO**

ITAPECURU MIRIM - MA

2026

**FELIPE FERREIRA ARAÚJO**

**PEDRO VITOR SILVA DE BRITO**

**DESENVOLVIMENTO DE UMA PLATAFORMA WEB INTERATIVA PARA APOIO À SEGURANÇA DO TRABALHO**

> Monografia apresentada ao Programa PROFITEC/UEMA/Itapecuru Mirim da como parte dos requisitos necessários para obtenção do grau Tecnólogo em Análise e Desenvolvimento de Sistemas.
>
> Orientador(a): Prof(a). Me. Yonara Costa Magalhães

.

ITAPECURU MIRIM - MA

2026

# resumo

A gestão de Segurança e Saúde no Trabalho (SST) exige o monitoramento constante de riscos por meio de inspeções regulares. Contudo, o uso predominante de registros analógicos fragmenta as informações operacionais e prejudica a rastreabilidade documental. Para superar esse revés, esta pesquisa teve como objetivo desenvolver uma plataforma *web* responsiva voltada ao apoio de profissionais de SST, promovendo a digitalização e a centralização do gerenciamento dessas auditorias. De natureza aplicada e com abordagem exploratório-descritiva, o estudo apoiou-se em revisão bibliográfica e entrevistas para o levantamento de requisitos, culminando na construção do sistema sob os preceitos da Engenharia de Software.

A arquitetura da aplicação adotou o padrão *Progressive Web App* (PWA) para viabilizar a operação *offline-first*, utilizando as tecnologias *TypeScript*, *React*, *PostgreSQL* e *IndexedDB*. Na prática, a ferramenta consolida o cadastro de empresas, a gestão de *checklists* embasados nas Normas Regulamentadoras (NRs), o acompanhamento de não conformidades e a anexação de evidências fotográficas. Entre as funcionalidades implementadas, destacam-se a captura do contexto temporal dos formulários e o mecanismo de persistência local, que permite o preenchimento de dados em campo sem conexão à internet e a sua posterior sincronização com o servidor.

Os quatro participantes da avaliação preliminar concordaram plenamente com a utilidade da consulta normativa e do histórico de inspeções e com a facilidade de aprender a usar a plataforma. Em novembro, um ensaio automatizado com emulação de dispositivo móvel mediu o acesso à inspeção em 3,688 s, em média, após seis minutos de espera e em 1,675 s nas tentativas consecutivas. Em outro ensaio, 30 inspeções realizadas em sequência foram recuperadas com suas respostas e seus relatórios. A avaliação em campo permanece como etapa futura.

Palavras-chave: segurança e saúde no trabalho; inspeções de segurança; *progressive web app*; desenvolvimento de software.

# abstract

Occupational Health and Safety (OHS) management requires constant risk monitoring through regular inspections. However, the predominant use of analog records fragments operational information and hinders document traceability. To overcome this challenge, this research aimed to develop a responsive web platform designed to support OHS professionals by facilitating the digitization and centralization of audit management. The study, which is applied in nature and employs an exploratory-descriptive approach, relied on a literature review and interviews to gather requirements, culminating in the development of the system based on software engineering principles.

The application architecture utilizes the Progressive Web App (PWA) standard to enable an "offline-first" mode of operation, incorporating technologies such as TypeScript, React, PostgreSQL, and IndexedDB. In practice, the tool consolidates company registration, the management of checklists based on Regulatory Standards (NRs), the tracking of non-conformities, and the attachment of photographic evidence. Key features include the capture of temporal context for forms and a local persistence mechanism, which allows data to be entered in the field without an internet connection and subsequently synchronized with the server.

All four participants in the preliminary evaluation strongly agreed that the regulatory reference and inspection history were useful and that the platform was easy to learn. In November, an automated test using mobile device emulation measured a mean inspection access time of 3.688 s after six minutes of inactivity and 1.675 s on consecutive attempts. In a separate test, all 30 inspections completed in sequence could be retrieved with their responses and reports. Field evaluation remains a subject for future work.

Keywords: occupational health and safety; safety inspections; progressive web app; software development.

# SUMÁRIO

- [1 INTRODUÇÃO](#secao-1) — 5
- [2 OBJETIVOS](#secao-2) — 10
  - [2.1 Objetivo geral](#secao-2-1) — 10
  - [2.2 Objetivos específicos](#secao-2-2) — 10
- [3 REFERENCIAL TEÓRICO](#secao-3) — 12
  - [3.1 Segurança e Saúde no Trabalho (SST)](#secao-3-1) — 12
  - [3.2 Normas Regulamentadoras e inspeções](#secao-3-2) — 14
  - [3.3 Transformação digital na SST](#secao-3-3) — 15
  - [3.4 Engenharia de software aplicada à solução](#secao-3-4) — 16
    - [3.4.1 Tecnologias utilizadas](#secao-3-4-1) — 19
    - [3.4.2 Trabalhos relacionados](#secao-3-4-2) — 21
- [4 METODOLOGIA](#secao-4) — 25
  - [4.1 Projeto do sistema](#secao-4-1) — 28
  - [4.2 Desenvolvimento da plataforma](#secao-4-2) — 31
- [5 RESULTADOS E DISCUSSÃO](#secao-5) — 36
- [6 CONCLUSÃO](#secao-6) — 46
- [REFERÊNCIAS](#referencias) — 48
- [aPÊNDICE A – FORMULÁRIO DE vALIDAÇÃO E LEVANTAMENTO DE Requisitos: Plataforma de SAÚDE E Segurança do Trabalho](#apendice-a) — 52
- [APÊNDICE B – Entrevista de Validação e Levantamento de Requisitos: Plataforma de SAÚDE E Segurança do Trabalho](#apendice-b) — 54
- [APÊNDICE C – Questionário de Avaliação da Plataforma Web de Apoio à Segurança do Trabalho (Teste de Protótipo)](#apendice-c) — 56
- [APÊNDICE d – requisitos funcionais do sistema](#apendice-d) — 59
- [APÊNDICE e – requisitos não funcionais do sistema](#apendice-e) — 60
- [APÊNDICE f – Casos de uso](#apendice-f) — 61
- [APÊNDICE g – modelo lógico](#apendice-g) — 62
- [APÊNDICE h – diagrama de classes](#apendice-h) — 63
- [APÊNDICE I – Síntese das verificações técnicas da plataforma](#apendice-i) — 64

<a name="secao-1"></a>

# 1 INTRODUÇÃO

A Segurança e Saúde no Trabalho (SST) é fundamental para o desenvolvimento sustentável das empresas e para garantir a dignidade humana no ambiente laboral. Mais do que cumprir exigências burocráticas, estruturar um ambiente seguro reflete o compromisso ético e social com a força produtiva. Como a busca constante por produtividade e as inovações tecnológicas introduzem novos riscos operacionais, as respostas preventivas precisam ser cada vez mais sofisticadas. Sem uma gestão eficiente de SST, as consequências vão além de sanções financeiras, refletindo-se na perda de vidas e na queda da qualidade de vida dos trabalhadores.

Entre 2012 e 2021, foram notificados mais de seis milhões de acidentes de trabalho no Brasil (Cantave; Derrosso; Reis, 2023). Para 2022, o Observatório de Segurança e Saúde no Trabalho registrou 612,9 mil acidentes e 2.538 óbitos entre pessoas com carteira assinada, com base nas comunicações ao Instituto Nacional do Seguro Social (INSS). Os dados situam a dimensão do problema no emprego formal e a importância de manter registros que subsidiem a prevenção (Ministério Público do Trabalho, 2023).

O adoecimento também pode afastar o trabalhador de suas atividades. Entre 2011 e 2021, a Previdência Social concedeu 632.578 benefícios acidentários por lesões por esforços repetitivos e distúrbios osteomusculares relacionados ao trabalho (LER/Dort), segundo a Fundacentro (2024). A difusão de informações sobre ergonomia também motivou a pesquisa de Bitencourte (2020) sobre aplicativos voltados à saúde do trabalhador. Em sua dimensão jurídica, a proteção do ambiente de trabalho envolve a preservação da vida, da saúde e da integridade dos trabalhadores (Eidt, 2017).

A relação entre trabalho e adoecimento já era objeto de observação na Antiguidade. Assis (2021) retoma os relatos de Hipócrates sobre a exposição de trabalhadores a metais e os escritos de Plínio, o Velho, sobre uma forma de proteção respiratória. Na literatura técnica contemporânea, esse tema integra o estudo da prevenção e das condições de segurança no ambiente de trabalho (Barsano; Barbosa, 2018).

No âmbito internacional, a Organização Internacional do Trabalho (OIT) reúne representantes de governos, empregadores e trabalhadores na elaboração de normas e políticas. A Declaração do Centenário da OIT reafirma o trabalho decente, o diálogo social e a proteção dos trabalhadores entre as prioridades da instituição (International Labour Organization, 2019).

No Brasil, a regulação sobre o tema evoluiu impulsionada pelas pressões da industrialização. Após iniciativas pontuais no final do Império, como o Decreto nº 1.313/1891 (sobre o trabalho de menores), o país publicou sua primeira lei sobre o tema em 1919. O Decreto nº 3.724 passou a responsabilizar os empregadores pelos acidentes e infortúnios laborais. O grande marco, no entanto, veio na Era Vargas, com a promulgação da Consolidação das Leis do Trabalho (CLT) em 1943. A CLT estruturou as bases de proteção à integridade física do obreiro, sustentando a regulação trabalhista contemporânea (CAMISASSA, 2015).

Mais tarde, a legislação brasileira ganhou maturidade técnica com a Lei nº 6.514, de 1977, que alterou o Capítulo V da CLT e modernizou a prevenção de acidentes e a proteção à saúde ocupacional (MURBACH, 2019). Essa legislação, aliada às exigências da OIT, viabilizou a Portaria nº 3.214/1978, responsável por aprovar as primeiras Normas Regulamentadoras (NRs) (MURBACH, 2019). Com isso, orientações técnicas transformaram-se em obrigações legais para todos os empregadores regidos pela CLT.

Na relação publicada pelo Ministério do Trabalho e Emprego, a numeração das Normas Regulamentadoras vai da NR-1 à NR-38. Como a NR-2 e a NR-27 foram revogadas, permanecem 36 normas em vigor. Há disposições gerais sobre gerenciamento de riscos ocupacionais (NR-1) e regras específicas sobre a Comissão Interna de Prevenção de Acidentes e de Assédio (NR-5), a ergonomia (NR-17) e a construção civil (NR-18) (Brasil, 2020). A identificação dos riscos e a definição de medidas preventivas integram a prática de segurança do trabalho (Peixoto, 2010). A Política Nacional de Segurança e Saúde no Trabalho, instituída em 2011, também orienta a prevenção no país (Cantave; Derrosso; Reis, 2023).

Nas organizações, as ações internas de prevenção envolvem os Serviços Especializados em Segurança e em Medicina do Trabalho (SESMT), disciplinados pela NR-4, e a Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA), disciplinada pela NR-5 (Brasil, 2020). A identificação de perigos e o acompanhamento das medidas de prevenção aproximam essas atividades das inspeções discutidas neste trabalho. A fiscalização estatal das normas é tratada na seção 3.2.

A equipe do SESMT exerce funções de alta criticidade. O Engenheiro de Segurança do Trabalho atua nos níveis tático e gerencial, cuidando do planejamento, das avaliações quantitativas de riscos ambientais, da assinatura de laudos periciais e do desenho dos sistemas de gestão (SILVA *et al*., 2025). O Técnico de Segurança do Trabalho, por sua vez, opera na linha de frente, conduzindo inspeções rotineiras, Diálogos Diários de Segurança (DDS), verificação de Equipamentos de Proteção Individual (EPI) e paralisando atividades de risco iminente (LOPES, 2013). Paralelamente, os gestores de produção e a engenharia devem tomar decisões alinhadas ao SESMT, demonstrando que a segurança não é um departamento isolado, mas uma cultura transversal (LUCENA, 2019).

É nessa rotina dinâmica que a gestão da informação costuma se tornar um ponto de fragilidade. O padrão de mercado ainda é amplamente baseado no uso de papel, pranchetas e formulários impressos para o registro de inspeções (LOPES, 2013). Essa prática exige a transcrição posterior dos dados para planilhas virtuais, abrindo espaço para falhas humanas, ilegibilidade e atrasos operacionais. As consequências diretas são a perda constante de históricos, a fragmentação de documentos e a dificuldade de auditar informações com rapidez (LOPES, 2013; SILVA *et al*., 2025). Trata-se de um modelo que fomenta uma postura reativa, na qual os gestores frequentemente tomam decisões apenas após a ocorrência de um acidente (LOPES, 2013).

Diante dessas limitações, a transformação digital surge não apenas como uma facilidade administrativa, mas como um mecanismo essencial de prevenção. A digitalização das rotinas de SST muda a forma como técnicos e auditores monitoram o ambiente laboral. O uso de dispositivos móveis com aplicativos e checklists digitais permite coletar dados no local exato da inspeção (LOPES, 2013). Funcionalidades como a anexação de fotografias e a marcação de coordenadas (GPS) garantem rastreabilidade às ocorrências. Em setores complexos como a Construção Civil, essa automação acelera a geração de relatórios de não conformidades, eliminando o ciclo de retrabalho do modelo analógico (MURBACH, 2019).

Além da coleta em campo, os sistemas digitais podem reunir informações de várias inspeções para consulta pelos gestores. Na implantação piloto em uma indústria metalúrgica, Silva *et al.* (2025) relataram redução de quase 50% no tempo de resposta gerencial aos riscos identificados. O indicador daquele estudo diz respeito à atuação dos gestores após o registro de um risco.

A modernização abrange também a capacitação dos operários. Tecnologias da Indústria 4.0, como ambientes de Realidade Virtual (RV) e gamificação, estão transformando as metodologias de ensino corporativo. Essas abordagens permitem que os trabalhadores vivenciem simulações de risco e internalizem protocolos de segurança de forma controlada, desenvolvendo memória técnica sem se exporem aos perigos reais de quedas ou choques (LUCENA, 2019). A digitalização da área consolida-se, portanto, como um movimento amplo, que vai desde o controle documental até a educação no chão de fábrica.

O levantamento de soluções disponíveis na literatura confirma que a informatização da SST está em fase de consolidação. Ferramentas contemporâneas atestam a viabilidade técnica da automação de relatórios e do uso de checklists padronizados. Iniciativas como o SST Hub — plataforma web focada em ampliar o acesso a conteúdos da área (MORAIS *et al*., 2026) — e o Sistema Especialista em Segurança do Trabalho (SEST) — voltado ao auxílio automatizado na tomada de decisão (TOPDJIAN *et al*., 2016) — exemplificam esse movimento. Essas aplicações provam que substituir pranchetas por tablets assegura fluidez à coleta de dados, mesmo diante das pressões da rotina industrial.

No entanto, a pesquisa bibliográfica revela lacunas práticas que merecem atenção. Grande parte das aplicações atuais apresenta limitações de usabilidade ou fragmentação das informações (MORAIS *et al*., 2026). Além disso, plataformas comerciais mais completas costumam ter custos proibitivos para micro e pequenas empresas (MPEs), ou então desvinculam o registro da auditoria do texto integral das Normas Regulamentadoras. A ausência de uma ferramenta com bom projeto de experiência do usuário (UX), que unifique consulta legal contextualizada, rastreabilidade de ações corretivas e emissão de relatórios responsivos integrados às Normas Regulamentadoras, representa uma clara oportunidade de desenvolvimento tecnológico.

A partir desse contexto, fundamenta-se o problema de pesquisa deste trabalho. O objetivo geral é desenvolver uma plataforma web responsiva para apoiar os profissionais de Segurança e Saúde no Trabalho na execução de inspeções e fiscalizações. A proposta visa digitalizar e sistematizar a coleta, o gerenciamento e o acompanhamento de dados laborais, rompendo com as limitações da gestão analógica.

Espera-se que o sistema proporcione maior agilidade e rastreabilidade às operações, elevando a auditoria a um patamar preventivo e aderente às NRs. Por fim, o projeto converge com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU, especificamente ao dialogar com o ODS 3 (saúde e bem-estar) e contribuir para as metas do ODS 8 (trabalho decente e crescimento econômico), promovendo ambientes laborais mais seguros e livres de riscos iminentes.

<a name="secao-2"></a>

# 2 OBJETIVOS

<a name="secao-2-1"></a>

## 2.1 Objetivo geral

Desenvolver uma plataforma web responsiva para apoiar profissionais de Segurança e Saúde no Trabalho na realização de inspeções e fiscalizações, por meio da digitalização dos processos de coleta, gerenciamento e acompanhamento de informações, contribuindo para maior eficiência, rastreabilidade e conformidade com as Normas Regulamentadoras.

<a name="secao-2-2"></a>

## 2.2 Objetivos específicos

Dado o objetivo geral deste trabalho, puderam ser identificados os seguintes objetivos específicos:

- Realizar um levantamento bibliográfico e tecnológico sobre Segurança e Saúde no Trabalho, inspeções, fiscalizações e soluções digitais aplicadas ao setor, identificando limitações e oportunidades de melhoria;

- Levantar os requisitos funcionais e não funcionais da plataforma, considerando as necessidades dos profissionais de Segurança e Saúde no Trabalho;

- Projetar a arquitetura e a modelagem da plataforma, contemplando banco de dados, perfis de usuários, fluxo das inspeções e mecanismos de armazenamento e sincronização das informações;

- Implementar uma plataforma web responsiva baseada em arquitetura *Progressive Web App* (PWA), com suporte a armazenamento local (*IndexedDB*) para viabilizar a persistência, o preenchimento contínuo e a sincronização posterior das respostas de inspeções, mesmo em ambientes com acesso limitado à internet;

- Avaliar a plataforma desenvolvida, por meio de questionário, quanto à sua capacidade de apoio às atividades de inspeção e fiscalização, analisando sua aderência aos requisitos definidos e sua contribuição para a melhoria da gestão das informações em Segurança e Saúde no Trabalho.

<a name="secao-3"></a>

# 3 REFERENCIAL TEÓRICO

A construção de uma solução tecnológica voltada às necessidades dos profissionais de segurança do trabalho exige uma base conceitual sólida. Este capítulo fundamenta a pesquisa e estabelece a perspectiva pela qual o problema do gerenciamento de informações nas inspeções e fiscalizações é analisado. Para organizar a discussão, adotou-se o método do funil: o texto parte de uma visão ampla sobre a proteção do ambiente de trabalho e a gestão de riscos, afunilando para o papel das normas e das inspeções rotineiras. Em seguida, aborda-se a produção de dados em campo, as limitações dos processos analógicos e a transformação digital como resposta a esses gargalos. Por fim, o capítulo alinha as necessidades da área aos fundamentos da Engenharia de Software e analisa os trabalhos relacionados, evidenciando a lacuna que justifica o desenvolvimento da plataforma proposta.

<a name="secao-3-1"></a>

## 3.1 Segurança e Saúde no Trabalho (SST)

A Segurança e Saúde no Trabalho (SST) é um campo multidisciplinar focado na preservação da integridade física, mental e social dos trabalhadores. Mais do que um conjunto de procedimentos técnicos, a área atua diretamente na garantia de um meio ambiente laboral seguro, considerado por Eidt (2017) como uma vertente indissociável do direito ao meio ambiente ecologicamente equilibrado. Trata-se da proteção de bens jurídicos essenciais: a vida, a saúde e a integridade psicofísica. Portanto, a ocorrência de doenças e acidentes ocupacionais não representa apenas uma falha produtiva, mas uma violação direta à dignidade humana (EIDT, 2017), cabendo à SST garantir que o trabalho atue como um vetor de desenvolvimento, e não de adoecimento.

Para garantir a salubridade, a SST baseia-se na prevenção e na gestão de riscos. Oliveira (2025) destaca que esse gerenciamento exige processos sistemáticos de identificação de perigos, avaliação e adoção de medidas de controle. O autor reforça que a prevenção segue uma hierarquia rigorosa: a prioridade absoluta é eliminar o risco na fonte; caso seja inviável, busca-se a minimização por meio de proteções coletivas e medidas administrativas, deixando os Equipamentos de Proteção Individual (EPIs) apenas como última barreira defensiva (OLIVEIRA, 2025). Essa dinâmica entre identificar, avaliar e controlar forma o núcleo da cultura preventiva nas organizações.

Historicamente, a forma de compreender como esses riscos se transformam em acidentes passou por diferentes modelos teóricos. Um dos mais influentes é o Modelo Causal de Perdas, formulado por Frank Bird Jr. e George Germain. Conforme discutido por Lopes (2013), esse modelo, frequentemente chamado de sequencial ou dominó, entende que as perdas não são eventos aleatórios, mas o fim de uma cadeia de falhas previsíveis. A sequência começa na "falta de controle" administrativo, que permite o surgimento de "causas básicas" (fatores pessoais ou do trabalho). Estas geram as "causas imediatas" (condições ou atos inseguros visíveis), culminando no acidente (LOPES, 2013). Nessa visão, o incidente é tratado como um sintoma de um sistema de gestão ineficaz, e não como mera fatalidade.

Contudo, a complexidade dos ambientes de trabalho modernos exigiu uma ampliação dessa visão, dando espaço às abordagens sistêmicas. O modelo de Erik Hollnagel, apresentado por Lucena (2019), argumenta que acidentes em sistemas complexos não decorrem necessariamente de uma quebra isolada de componentes, mas da variabilidade inerente ao desempenho humano e organizacional. As mesmas interações e ajustes diários que fazem a empresa funcionar podem, sob certas condições, resultar em falhas (LUCENA, 2019). A prevenção, nesse caso, não se resume a procurar uma "causa-raiz" isolada após o fato, mas a monitorar a variabilidade do ambiente e fortalecer a resiliência do sistema como um todo.

O diálogo entre essas duas perspectivas teóricas embasa o raciocínio desta pesquisa. Enquanto o modelo clássico de Bird evidencia a necessidade de estruturação e controle gerencial, a abordagem de Hollnagel alerta para a constante variabilidade e complexidade do ambiente. Fica claro, portanto, que a prevenção não pode ser um ato pontual ou exclusivamente reativo. Para suprir a falta de controle e monitorar as variações do dia a dia, as organizações precisam de mecanismos contínuos e sistemáticos de verificação. É exatamente aí que as diretrizes legais e as rotinas de inspeção se tornam ferramentas indispensáveis.

<a name="secao-3-2"></a>

## 3.2 Normas Regulamentadoras e inspeções

No Brasil, os parâmetros técnicos e administrativos de segurança são ditados pelas Normas Regulamentadoras (NRs). Criadas para detalhar os dispositivos da Consolidação das Leis do Trabalho (CLT), as NRs são de cumprimento obrigatório pelas empresas e estruturam a forma como a prevenção deve ocorrer na prática (EIDT, 2017; MORAIS *et al*., 2026). A NR-1, por exemplo, estabelece o Programa de Gerenciamento de Riscos (PGR), exigindo inventários atualizados e planos de ação (SILVA *et al*., 2025). Normas complementares definem desde a infraestrutura preventiva — como o SESMT (NR-4) e a CIPA (NR-5) — até o controle de exposições e o uso de EPIs (MORAIS *et al*., 2026).

Para garantir que esse complexo planejamento normativo seja executado, o ambiente laboral exige avaliações constantes. É preciso, no entanto, diferenciar as atividades de fiscalização e inspeção, que possuem naturezas distintas. A fiscalização, conforme pontua Eidt (2017), é uma atividade de Estado conduzida por Auditores Fiscais do Trabalho, dotada de poder de polícia administrativa. Ela atua de fora para dentro, com caráter coercitivo e regulatório, podendo punir infrações ou adotar uma postura orientadora em pequenas empresas (EIDT, 2017).

Em contrapartida, a inspeção de segurança é um instrumento interno e proativo. Realizada pelos membros do SESMT, da CIPA ou pelas lideranças do setor, a inspeção monitora o ambiente para detectar desvios operacionais e condições inseguras antes que gerem acidentes (LOPES, 2013). Como as NRs impõem centenas de requisitos técnicos, confiar apenas na memória visual do avaliador durante as rondas é ineficaz. Surge, então, a necessidade de adotar o *checklist* (lista de verificação).

Murbach (2019) define o *checklist* como uma ferramenta estruturada para checar a aplicação prática de prescrições normativas. Ao transformar os textos densos das normas em perguntas objetivas ("A máquina possui proteção nas partes móveis?"), o instrumento permite que o profissional documente rapidamente o que está conforme e o que precisa ser ajustado. Cria-se, assim, um fluxo direto: a norma exige o requisito; a inspeção o verifica; o *checklist* documenta; e a não conformidade identificada passa a exigir monitoramento para correção (MURBACH, 2019).

Essa dinâmica leva a uma constatação central para a presente pesquisa: a partir do momento em que a equipe técnica inspeciona o ambiente rotineiramente, ela passa a gerar um volume denso e contínuo de dados. Se a gestão preventiva depende do rastreamento histórico dessas falhas e correções, a forma como essas informações são coletadas, armazenadas e recuperadas torna-se o verdadeiro diferencial para o sucesso do programa de SST.

<a name="secao-3-3"></a>

## 3.3 Transformação digital na SST

A gestão preventiva depende, fundamentalmente, da produção e da análise de dados. As inspeções e auditorias geram informações que precisam ser transformadas em ações corretivas rápidas. Contudo, o modelo de gerenciamento tradicional tem se mostrado analógico e incompatível com a velocidade da indústria atual. Lopes (2013) destaca que a coleta de dados no chão de fábrica ainda é feita, majoritariamente, com pranchetas e formulários impressos, exigindo que o profissional arquive os documentos físicos e transcreva as informações manualmente para planilhas em computadores de mesa.

As limitações desse fluxo convencional são bem estabelecidas na literatura. A transcrição de dados abre espaço para erros e retrabalho (LOPES, 2013), enquanto o armazenamento descentralizado em planilhas isoladas dificulta o cruzamento de históricos e inviabiliza a geração de indicadores em tempo real. Pior ainda, a fragmentação prejudica a rastreabilidade: uma anotação em papel pode se perder, atrasando a correção do problema e prolongando a exposição do trabalhador ao risco. Na prática, conhecer a norma não é suficiente; a ineficiência no trânsito da informação pode comprometer todo o esforço preventivo.

Nesse cenário, a transformação digital atua como uma reconfiguração da arquitetura informacional da segurança do trabalho. A digitalização permite coletar registros diretamente na fonte, armazená-los em nuvem e gerar relatórios automaticamente, garantindo rastreabilidade desde a identificação do problema até a sua solução (SILVA *et al*., 2025). Essa mudança ataca diretamente o gargalo do modelo tradicional, convertendo dados dispersos em painéis de apoio à decisão.

A eficácia dessa transição possui comprovação empírica. Ao analisarem a implementação de um sistema informatizado para controle de riscos em uma metalúrgica, Silva *et al*. (2025) observaram que a tecnologia reduziu em quase 50% o tempo de resposta a riscos críticos, quando comparado ao método analógico anterior. Além da agilidade, a centralização dos dados melhorou a integração entre os setores operacionais e o SESMT, indicando que a tecnologia não substitui o profissional, mas potencializa sua capacidade de agir a tempo (SILVA *et al*., 2025).

Apesar dos benefícios claros, o sucesso dessas ferramentas depende de como elas se adaptam à rotina dos usuários. Técnicos e engenheiros não inspecionam canteiros de obras sentados em escritórios (MORAIS *et al*., 2026; MURBACH, 2019). Sistemas complexos, projetados apenas para monitores desktop, costumam falhar ao serem levados para o campo. Morais *et al*. (2026) ressaltam que plataformas de SST modernas exigem alto nível de responsividade, a capacidade técnica da interface de se adaptar organicamente a telas de smartphones e tablets. Aliada a isso, a usabilidade bem aplicada reduz a carga cognitiva da ferramenta, permitindo que o profissional foque sua atenção no que realmente importa: identificar o perigo no ambiente, e não lutar para preencher um software engessado.

Compreende-se, portanto, que a necessidade das empresas não é apenas documentar informações, mas dispor de um ecossistema móvel e integrado que viabilize todo o ciclo da inspeção. Para materializar essa solução de forma escalável e segura, a pesquisa fundamenta-se nos preceitos da Engenharia de Software.

<a name="secao-3-4"></a>

## 3.4 Engenharia de software aplicada à solução

Levar processos operacionais da Segurança e Saúde no Trabalho (SST) para o ambiente digital exige extremo rigor metodológico. O desenvolvimento de ferramentas sem embasamento técnico adequado frequentemente resulta em *softwares* instáveis e vulneráveis quanto à integridade dos dados; falhas que, no contexto prevencionista, adquirem um peso crítico, pois podem comprometer o monitoramento de riscos e contribuir indiretamente para a ocorrência de acidentes. Por esse motivo, a construção da plataforma *web* proposta neste trabalho ancora-se nas bases teóricas e práticas da Engenharia de *Software*.

Valente (2020, cap. 1) apresenta a engenharia de software como uma área que articula técnicas de requisitos, projeto, testes e manutenção. No desenvolvimento da plataforma, a equipe definiu quais informações registrar em cada vistoria, como distribuí-las entre o navegador e o servidor e como verificar se poderiam ser recuperadas posteriormente.

A engenharia de requisitos envolve identificar as necessidades dos usuários, documentá-las e verificar se a especificação corresponde ao problema que se pretende resolver (Valente, 2020, cap. 3). As entrevistas e os formulários orientaram, neste projeto, a definição dos registros necessários à inspeção. Uma exigência foi associar a resposta ao item do checklist que o profissional efetivamente examinou, de modo que uma edição posterior do modelo preservasse o sentido do registro original. Essa passagem da necessidade de campo à especificação é também discutida por Pressman e Maxim (2016).

Na arquitetura em camadas, a distribuição de responsabilidades delimita as dependências entre os componentes (Valente, 2020, cap. 7). Para a plataforma, isso significou distinguir a apresentação do checklist, as regras de conclusão e a persistência das respostas, em consonância com o princípio de separação discutido por Martin (2019). A distinção tem uma consequência para o técnico em campo. A interface pode confirmar que a resposta foi salva no dispositivo enquanto sua transmissão ao servidor ainda está pendente.

O terceiro pilar foca na garantia dos atributos de qualidade não funcionais. Características estruturais como a usabilidade, alinhada às discussões de Morais *et al.* (2026) sobre interfaces responsivas que minimizam a carga cognitiva, a confiabilidade e a manutenibilidade são imprescindíveis. Na gestão prevencionista, a exigência por dados fidedignos traduz de forma exata o conceito de confiabilidade (*dependability*) abordado por Sommerville (2011), um atributo intransigente em sistemas cujas falhas operacionais podem mascarar vulnerabilidades em ambientes físicos. É essa camada de confiabilidade que impede que o histórico de uma inspeção crítica se perca.

Em paralelo, a manutenibilidade atua como facilitadora da evolução tecnológica da ferramenta. Conforme demonstra Fowler (2019), zelar pela estrutura interna e pela legibilidade do código reduz a sua complexidade, o que minimiza o risco de novos defeitos e *bugs* durante futuras intervenções. No contexto deste projeto, um código coeso e adaptável garante que a plataforma esteja preparada para absorver futuras atualizações legais nas Normas Regulamentadoras sem que essas inserções quebrem a estabilidade das funções prévias. A Engenharia de *Software*, desta forma, funciona não apenas como um guia de programação, mas como a base científica que viabiliza a existência do projeto a longo prazo.

Entretanto, materializar um sistema funcional exige mais do que mapear as regras; requer acompanhamento rigoroso entre o que o usuário precisa, o que foi especificado e a verificação das entregas ao longo do ciclo. O corpo de conhecimento *SWEBOK* adverte sobre a diferença estrutural entre a fase inicial de levantamento de requisitos e a sua posterior gestão, que lida com o inevitável amadurecimento do entendimento sobre o problema durante as semanas de codificação (WASHIZAKI, 2026). No decorrer da construção da plataforma, essa gestão materializou-se em três atuações práticas: na documentação das necessidades do campo, na definição de regras para inserção de registros no banco e na revisão cíclica das entregas por etapas. A documentação atuou como uma âncora, orientando o desenvolvimento e esclarecendo de forma transparente as distinções entre as funcionalidades originalmente projetadas e aquelas que, de fato, alcançaram estabilidade técnica na versão avaliada.

Por fim, a etapa de verificação metodológica engloba lidar com escopos distintos de teste. Washizaki (2026) pontua que os testes unitários avaliam minúsculos fragmentos isolados de código, enquanto os testes de integração examinam se as conexões entre diferentes componentes operam sem atrito, e os testes de sistema analisam, de forma panorâmica, o comportamento final da aplicação perante o usuário. O arcabouço dessa teoria explica a abordagem adotada pela pesquisa: validar uma regra limitadora de preenchimento, averiguar se os dados estão sendo gravados no banco de dados e simular a condução de uma inspeção real diretamente pelo navegador são ações de verificação complementares. Complementando as validações sistêmicas, a avaliação conduzida junto aos participantes da pesquisa introduziu o essencial ponto de vista do uso ergonômico e humano em cenários cotidianos. Contudo, cabe ressalvar que essa avaliação complementa, mas não substitui, o rigor dos testes automatizados, tampouco confere atestado técnico irrefutável a todos os atributos de qualidade exigidos por uma ferramenta desse porte.

<a name="secao-3-4-1"></a>

### 3.4.1 Tecnologias utilizadas

O desenvolvimento da plataforma baseou-se no uso de *TypeScript*, tanto na interface quanto no servidor. Isso garantiu a verificação estática de tipos, permitindo a identificação de incompatibilidades antes mesmo da execução do código (MICROSOFT, 2026). No projeto, a linguagem foi aplicada em modo estrito para definir com segurança as estruturas de dados, como empresas, *checklists*, inspeções e respostas, viabilizando o compartilhamento de contratos entre as diferentes camadas da aplicação. Porém, como os valores enviados pelo navegador precisam ser conferidos em tempo de execução, a tipagem foi complementada por uma rigorosa validação dos dados recebidos.

Para a construção da interface, optou-se pelo *React 19* (REACT, 2026). Sua arquitetura baseada em componentes facilitou a criação de elementos reutilizáveis para estruturar formulários, indicadores de situação e painéis de evidências. O visual responsivo foi organizado com o *Tailwind CSS* (TAILWIND LABS, 2026), adotando-se regras baseadas na largura da tela e uma abordagem inicial voltada a dispositivos móveis (*mobile-first*). Essa base visual foi enriquecida com a biblioteca *Radix UI* e com o pacote de ícones *Lucide*, mantendo-se íntegra durante a integração com o servidor.

A unificação entre a interface e o backend ocorreu por meio do *TanStack Start*. A ferramenta utiliza *Server Functions* para invocar operações no servidor diretamente a partir da aplicação (TANSTACK, 2026b), mecanismo escolhido para intermediar o fluxo de dados e a autenticação. A navegação, por sua vez, é gerenciada pelo *TanStack Router*. A manutenção dessa arquitetura deveu-se à decisão de aproveitar o *frontend* gerado na fase de prototipação com a ferramenta *Lovable*. Dessa forma, concentrou-se o esforço de desenvolvimento na integração das funcionalidades operacionais, evitando-se uma migração complexa de *framework* durante o prazo de entrega acadêmica.

O gerenciamento de estado, as consultas e o armazenamento temporário de dados ficaram a cargo do *TanStack React Query* (TANSTACK, 2026a). Os *hooks* da biblioteca coordenam de forma eficiente as telas de carregamento e as atualizações de interface. Nos formulários de cadastro, empregou-se o *React Hook Form* em conjunto com os esquemas da biblioteca *Zod* (ZOD, 2026). Enquanto o *Zod* garante a validação estrutural das entradas com forte integração à tipagem do *TypeScript*, ressalta-se que essa verificação ocorre em duas camadas: mesmo com as mensagens de alerta exibidas na interface, a validação no servidor permanece ativa por questões de segurança e integridade.

No que diz respeito à persistência de dados em nuvem, a plataforma adota o banco relacional *PostgreSQL*, hospedado no serviço *Neon*. A comunicação com o banco é mediada pelo *Prisma ORM 7*, que fornece um cliente de consultas e um mecanismo ágil para acompanhar as migrações estruturais do modelo (PRISMA, 2026). O modelo relacional reflete os vínculos entre empresas, inspeções, tratativas e respostas. Para assegurar a consistência dessas relações, utilizam-se as transações do *PostgreSQL* (POSTGRESQL GLOBAL DEVELOPMENT GROUP, 2026). Esse recurso garante, por exemplo, que a gravação de uma nova inspeção e do conteúdo histórico do checklist que a acompanha ocorra como uma operação única, que só é confirmada se ambas forem bem-sucedidas.

Como a inspeção em campo frequentemente ocorre em ambientes com conectividade restrita, a execução offline tornou-se um requisito. Para viabilizá-la, implementou-se o *IndexedDB* (banco de dados local do navegador) acessado por meio da biblioteca *Dexie.js* (DEXIE.JS, 2023). Diferente do cache em memória do *React Query*, o *IndexedDB* preserva os pacotes de inspeção baixados e a fila de respostas de forma persistente, garantindo que os registros locais continuem disponíveis após a página ser recarregada ou reaberta.

Na aplicação web progressiva (PWA), o manifesto descreve a aplicação para o navegador. O *service worker* intercepta as requisições previstas pela aplicação e permite reutilizar arquivos públicos armazenados localmente (MDN Web Docs, 2026). Depois da preparação de uma inspeção, esses recursos permitem reabrir a interface sem rede. As respostas e a fila de sincronização ficam no IndexedDB.

Por fim, o gerenciamento de mídias (como as fotografias capturadas durante as auditorias) é realizado na plataforma *Cloudinary* (CLOUDINARY, 2026). As imagens são enviadas online por meio de chamadas autenticadas no servidor, e o *PostgreSQL* armazena apenas os metadados e os vínculos dessas mídias com as respectivas não conformidades. A aplicação final foi hospedada na *Vercel*, com o processo de *build* gerenciado pelo *Nitro*. Todo o controle de versão do código e da documentação ocorreu via *Git* e *GitHub*, assegurando a rastreabilidade das alterações e a recuperação dos marcos de desenvolvimento do projeto.

<a name="secao-3-4-2"></a>

### 3.4.2 Trabalhos relacionados

Para comprovar a relevância tecnológica e científica deste projeto, é essencial analisar soluções prévias que tentaram resolver o gargalo informacional da SST. A revisão dos trabalhos relacionados ajuda a compreender o nível atual das ferramentas disponíveis, identificar padrões na comunidade acadêmica e evidenciar as limitações práticas que justificam a construção desta nova plataforma.

Murbach (2019) focou no desenvolvimento de um aplicativo móvel voltado à verificação e fiscalização da segurança. O autor comprovou que a coleta móvel de dados substitui eficientemente os antigos cadernos em canteiros de obras. A limitação da sua ferramenta, porém, está no escopo: por ser desenhada exclusivamente para os requisitos da NR-18 (Construção Civil), a solução apresenta pouca flexibilidade, não permitindo que profissionais de outros ramos industriais criem *checklists* personalizados.

Lopes (2013) foi precursor ao estudar o uso de *smartphones* para mapear condições inseguras, baseando-se no modelo de causalidade de perdas. O estudo teve o mérito de identificar o registro em papel como um problema sistêmico, sugerindo o envio de dados diretamente para o SESMT. A principal barreira desse trabalho hoje é a natural defasagem tecnológica, visto que as soluções arquiteturais e os padrões de usabilidade adotados na época já não correspondem à fluidez, integração em nuvem e responsividade exigidas pelos sistemas *web* atuais.

Silva *et al.* (2025) desenvolveram um sistema de controle de riscos para o setor metalúrgico. Os autores relataram redução de quase 50% no tempo de resposta gerencial aos riscos detectados durante a implantação piloto. Na plataforma desta pesquisa, o foco da avaliação técnica recaiu sobre etapas do registro de uma inspeção e sobre a recuperação de seu relatório.

Já Morais *et al*. (2026) priorizaram a acessibilidade ao desenvolverem o "SST Hub", uma plataforma *web* responsiva voltada à educação e democratização da informação normativa. O trabalho emprega excelentes conceitos de usabilidade e interface, oferecendo teias de acesso às legislações e especialistas. Sua limitação para o problema desta pesquisa, no entanto, é o caráter estritamente consultivo. O SST Hub não oferece funcionalidades operacionais em campo, como formulários de inspeção, registro *in loco* ou *dashboards* de acompanhamento de riscos.

A análise dessas iniciativas revela uma clara lacuna metodológica e tecnológica no ecossistema de soluções para a área. Observa-se que aplicativos voltados à inspeção de campo (como os de Murbach e Lopes) costumam ficar restritos a uma norma específica ou esbarram em limitações de arquiteturas legadas. Paralelamente, sistemas industriais modernos (Silva *et al*.) focam de forma densa nas matrizes de risco de grandes corporações, enquanto as ferramentas *web* mais intuitivas (Morais *et al*.) limitam-se à consulta educativa.

Falta, portanto, uma solução tecnológica equilibrada e generalista. Identifica-se a necessidade de uma plataforma que ofereça a usabilidade e a acessibilidade dos sistemas *web* responsivos modernos não apenas para fins educacionais, mas como motor ativo de gerenciamento operacional. Uma ferramenta que permita a profissionais de qualquer setor configurar e aplicar *checklists* dinâmicos baseados em múltiplas NRs em campo, garantindo armazenamento estruturado e rastreabilidade integral, sem a complexidade excessiva de *softwares* industriais pesados. É exatamente sobre essa lacuna que a presente pesquisa se posiciona, unindo a necessidade inadiável de gestão da prevenção à capacidade organizadora da Engenharia de Software contemporânea.

A análise comparativa evidencia que as soluções encontradas na literatura oferecem contribuições relevantes para a informatização de processos ligados à Segurança e Saúde no Trabalho. Porém, observa-se que a maioria dessas ferramentas foca em aspectos específicos e fragmentados do domínio. Projetos anteriores concentraram-se na disponibilização de conteúdos normativos ou no apoio à tomada de decisão, deixando uma lacuna crítica: a falta de integração prática entre o gerenciamento de inspeções de campo, o acompanhamento temporal de não conformidades, a centralização de dados em nuvem e, principalmente, a capacidade de operação em ambientes industriais com conectividade limitada.

É precisamente nesse contexto que a solução proposta neste trabalho se posiciona. O sistema desenvolvido busca consolidar essas demandas em uma única plataforma *web* responsiva, estendendo a utilidade tecnológica do escritório para o chão de fábrica e aprimorando a aplicabilidade da ferramenta em cenários reais de fiscalização.

Para fins de ilustração, ao analisarmos as ferramentas contemporâneas destacadas na literatura (SST Hub e SEST), constata-se a referida fragmentação operacional. Enquanto o SST Hub funciona como uma plataforma consultiva para acesso a conteúdos legais e o SEST oferece apoio à tomada de decisão, nenhuma das duas soluções contempla, de forma integrada, a tríade da auditoria prática: execução de inspeções via formulários dinâmicos, acompanhamento de ações corretivas e funcionamento *offline*. Ao englobar esses recursos em um mesmo ecossistema, o projeto aqui apresentado supera o escopo consultivo, atuando ativamente no gerenciamento das inspeções.

O Quadro 1 reúne as funcionalidades comparadas pelos autores e o Quadro 2 detalha os recursos voltados ao trabalho em campo. A classificação das outras ferramentas se refere ao que foi identificado nas publicações consultadas. Os ensaios de novembro, apresentados no capítulo 5, foram executados exclusivamente na plataforma desenvolvida neste trabalho.

**Quadro 1 – Síntese comparativa dos trabalhos analisados**

| Critério                          | SST Hub       | SEST          | Trabalho Proposto |
|-----------------------------------|---------------|---------------|-------------------|
| Plataforma Web                    | Sim           | Não informado | Sim               |
| Interface Responsiva              | Parcial       | Não informado | Sim               |
| Funcionamento Offline             | Não           | Não           | Sim (PWA)         |
| Cadastro de Empresas              | Não           | Não           | Sim               |
| Gestão de Inspeções               | Parcial       | Sim           | Sim               |
| Gestão de Não Conformidades       | Não informado | Parcial       | Sim               |
| Consulta às NRs                   | Sim           | Parcial       | Sim               |
| Emissão de Relatórios             | Limitada      | Não informado | Sim               |
| Armazenamento Centralizado        | Sim           | Sim           | Sim               |
| Foco em Micro e Pequenas Empresas | Não informado | Não informado | Sim               |
| Código Aberto                     | Não informado | Não informado | Não               |
| Tecnologias Web Modernas          | Parcial       | Não informado | Sim               |

**Fonte:** Autores (2026)

**Quadro 2 – Diferenciais tecnológicos da plataforma**

| Critério                      | SST Hub | SEST          | Trabalho Proposto |
|-------------------------------|---------|---------------|-------------------|
| *Progressive* *Web App* (PWA) | Não     | Não           | Sim               |
| Armazenamento *Offline*       | Não     | Não           | Sim               |
| *Dashboard* Gerencial         | Não     | Não           | Sim               |
| *Checklists* Digitalizados    | Não     | Parcial       | Sim               |
| Sincronização de Dados        | Não     | Não           | Sim               |
| Arquitetura *Web* Responsiva  | Sim     | Não informado | Sim               |

**Fonte:** Autores (2026)

<a name="secao-4"></a>

# 4 METODOLOGIA

Esta pesquisa possui natureza aplicada, já que se ocupa da construção de uma solução tecnológica para um problema prático e específico: a organização das informações geradas nas inspeções de Segurança e Saúde no Trabalho (SST). Em relação aos objetivos, o estudo assume um caráter exploratório durante o levantamento das necessidades dos usuários, e descritivo ao detalhar as funcionalidades da plataforma e avaliar a sua versão preliminar. Esse enquadramento metodológico apoia-se em Prodanov e Freitas (2013), que diferenciam pesquisas orientadas à aplicação prática daquelas voltadas à compreensão inicial de um fenômeno ou à mera descrição de suas características.

Entre maio e outubro de 2026, a equipe delimitou o tema, levantou requisitos com profissionais de SST, projetou a plataforma e revisou as funcionalidades implementadas. A avaliação da versão preliminar com participantes ocorreu de 28 a 31 de agosto. Em 21 de novembro, dois ensaios automatizados complementaram a avaliação técnica. A proposta inicial, uma cartilha digital para consulta de normas, deu lugar a uma ferramenta de apoio às inspeções. A consulta às Normas Regulamentadoras permaneceu disponível durante o registro, e a apreciação das condições de segurança coube ao profissional.

Para fundamentar a pesquisa, utilizou-se material bibliográfico focado em SST, gestão da informação e engenharia de software, somado à documentação oficial das tecnologias adotadas. Paralelamente, os documentos internos produzidos durante a construção do sistema (levantamento de requisitos, personas, casos de uso, modelagem de dados e registros de versionamento) serviram para basear a descrição arquitetural e atestar as entregas da equipe. Essa separação entre a revisão da literatura e a análise documental do próprio projeto segue a classificação proposta por Prodanov e Freitas (2013).

A etapa inicial de levantamento de dados envolveu profissionais com formação ou experiência direta na área de SST. Para isso, foram conduzidas entrevistas via *Google Meet* (roteiro utilizado presente no Apêndice B) e aplicado um formulário de necessidades (Apêndice A), instrumento que diferiu do questionário de avaliação utilizado na fase final. As entrevistas (três) foram conduzidas em junho de 2026, abrangendo diferentes perfis profissionais: um técnico em segurança sem atuação no mercado, um técnico atuando como docente e um gestor responsável pelo setor de SST de uma empresa. O objetivo foi mapear as ferramentas já utilizadas no mercado, entender como os registros operacionais são organizados e identificar as principais dificuldades enfrentadas durante as auditorias. Os participantes foram selecionados por conveniência, a partir dos contatos acessíveis à equipe, sem a adoção de sorteios ou exigência de representatividade estatística.

Embora os registros dessas entrevistas documentem os temas abordados e os objetivos das consultas, optou-se por não realizar transcrições literais. A síntese das demandas captadas foi complementada pelas observações empíricas dos desenvolvedores e validada no documento de requisitos. Esse levantamento qualitativo foi fundamental para estabelecer as três premissas norteadoras do projeto: centralizar informações dispersas, agilizar a recuperação de históricos de inspeção e garantir a continuidade do trabalho em ambientes com conectividade limitada.

Para avaliar a versão preliminar da plataforma aplicou-se, em agosto de 2026, um questionário composto por 14 questões, sendo 13 fechadas e uma aberta, destinado a investigar o perfil dos usuários, a frequência de realização de inspeções, a utilidade da consulta normativa integrada e do histórico de dados, além da curva de aprendizado e da rapidez percebida do sistema (Apêndice C). O instrumento também permitiu aos testadores relatar livremente os aspectos positivos, as dificuldades encontradas e suas sugestões de melhoria.

Ao todo, obteve-se o retorno de quatro avaliadores com atuações variadas a área: um estudante, um técnico, um engenheiro e um consultor/auditor de SST. Avaliou-se a clareza das mensagens da interface, a densidade visual das informações, o conforto durante o uso e a intenção de recomendação. Antes de responderem, os participantes receberam a instrução de executar o fluxo principal de uma inspeção dentro do sistema. Cabe pontuar que essa orientação garante a interação com o núcleo da ferramenta, mas não atesta que cada pessoa tenha percorrido todas as operações secundárias ou ativado rigorosamente o modo *offline*. Além disso, embora o convite para a avaliação tenha incluído profissionais consultados no início do projeto, os dois momentos da pesquisa compõem conjuntos distintos, não havendo correspondência entre os respondentes de cada fase.

Os dados oriundos das respostas fechadas foram examinados por meio de contagem simples e distribuição percentual, tendo como universo amostral os quatro respondentes. Paralelamente, os três comentários deixados na questão aberta foram lidos e categorizados conforme seus conteúdos: sugestões sobre o escopo de proteção coletiva, dúvidas sobre a localização do recurso de fotografias e impressões gerais sobre a interface. O tratamento desses dados assumiu um caráter estritamente descritivo, dispensando o uso de protocolos formais de análise de conteúdo. Também não foram realizados cruzamentos analíticos individuais entre o perfil do avaliador e suas respostas, em vista do volume reduzido de dados. A interpretação restringiu-se a relacionar a recepção da plataforma às necessidades iniciais mapeadas, sem o intuito de realizar testes de significância ou projetar inferências para toda a população de profissionais de SST.

As revisões de código e os testes de integração e de navegador acompanharam as entregas até outubro. Os registros dessas verificações documentam as condições em que cada comportamento foi observado. O questionário de agosto descreve a experiência com a versão então disponível. Os relatórios históricos e os painéis com dados reais foram integrados posteriormente.

No ensaio de tempos, o Playwright controlou o Chromium em um notebook Linux conectado por Wi-Fi em Itapecuru Mirim (MA). O navegador emulou o perfil de um Pixel 7, com área de exibição de 412 × 839 pixels. A aplicação foi hospedada na Vercel e o PostgreSQL no Neon, em ambientes dedicados na região de São Paulo. Um fluxo envolveu abrir e preencher uma nova inspeção. O outro consistiu em consultar o mesmo relatório histórico a cada tentativa. Em cada fluxo houve três blocos. Após seis minutos sem requisições do executor, fez-se uma tentativa seguida de cinco consecutivas. Cada tentativa começou em um novo contexto de navegação, com a sessão já autenticada. As duas tentativas do piloto ficaram fora da análise.

Em cada inspeção, o roteiro marcou quatro itens conformes, um não conforme e um não aplicável, digitou duas observações fixas e dispensou fotografias. A cadência de digitação tomou como referência o estudo de Palin *et al.* (2019), no qual 37.370 voluntários transcreveram frases em dispositivos móveis, à média de 36,2 palavras por minuto. Pela convenção de cinco caracteres por palavra usada no estudo, o intervalo calculado é de aproximadamente 331,5 ms por caractere. O protocolo indicava 332 ms, e a execução usou 331 ms. Calcularam-se as médias aritméticas dos tempos observados nas três primeiras tentativas e nas 15 consecutivas de cada fluxo.

O segundo ensaio acompanhou 30 ciclos de uso em sequência. Cada ciclo compreendeu cadastrar uma empresa sintética, publicar um checklist de dois itens, concluir a inspeção e recuperar as respostas em outro contexto de navegação. Em seguida, conferiram-se a identificação da inspeção e o conteúdo do relatório. A cada terceiro ciclo, o segundo item previa uma não conformidade com observação própria. Ao fim da rodada, os registros no PostgreSQL foram confrontados com os dados exibidos na interface.

<a name="secao-4-1"></a>

## 4.1 Projeto do sistema

O projeto foi estruturado com base no fluxo de uma inspeção real: preparar o *checklist*, vincular a atividade à empresa, registrar as respostas, identificar não conformidades e acompanhar as ações corretivas. Essa sequência permitiu conectar as necessidades mapeadas durante a pesquisa às funcionalidades da plataforma. Cada desafio operacional motivou uma solução: a dispersão de dados foi resolvida pela centralização em uma base estruturada; a dificuldade em resgatar o histórico de auditorias embasou o desenvolvimento de mecanismos de preservação de conteúdo; e a conectividade limitada em ambientes industriais orientou a adoção do armazenamento local integrado a uma posterior sincronização.

Essas premissas foram formalizadas no documento de requisitos, que reúne 22 especificações funcionais e oito não funcionais (Apêndices D e E, respectivamente ). Entre as funcionalidades principais, destacam-se o cadastro de empresas, a gestão de *checklists*, a consulta legal às normas, o registro de evidências e o acompanhamento de pendências geradas pela inspeção. Por outro lado, os requisitos não funcionais englobam aspectos de usabilidade, responsividade, rastreabilidade dos dados e suporte à continuidade operacional *offline*. É importante ressaltar que a documentação orientou o escopo, mas o atendimento a alguns itens ocorreu de forma parcial na versão entregue. A capacidade de operação integral *offline* e a geração de modelos totalmente editáveis de relatórios, por exemplo, ainda se encontram em fase de aperfeiçoamento, enquanto a inserção de campos específicos para o solicitante permaneceu apenas como um fluxo previsto para futuras iterações.

Para aproximar as decisões de *design* das rotinas práticas, foram desenvolvidas três personas: um técnico de SST, uma supervisora e um consultor externo. Embora não correspondam de forma literal aos participantes da pesquisa de campo, esses perfis fictícios ajudaram a alinhar a interface e os fluxos de acompanhamento às demandas de quem gerencia múltiplas empresas simultaneamente. Paralelamente, elaboraram-se os casos de uso para mapear as ações de visitantes e usuários autenticados, desde o *login* até a exportação do histórico (Apêndice F). Destaca-se, contudo, que embora o modelo teórico englobe diferentes papéis profissionais, o controle de acesso implementado baseia-se na propriedade sobre os registros criados (o autor do dado é o dono do dado), dispensando, nesta versão inicial, uma complexa hierarquia de permissões e equipes.

No que diz respeito à arquitetura de *software*, adotou-se a separação de responsabilidades entre a interface visual, a comunicação *client-server*, as regras de negócio e a camada de persistência. A interface emprega *hooks* e delega grande parte do controle de estado e consultas ao *React Query*. As *Server Functions* assumem o papel de intermediárias, recebendo requisições, validando a identidade do usuário e as entradas de dados, para, em seguida, direcioná-las aos serviços competentes. A camada de repositório concentra as interações com o *Prisma* e o *PostgreSQL*, aplicando filtros de propriedade e gerenciando o contexto das transações. Essa divisão arquitetural isola as regras de auditoria do acesso direto ao banco de dados pela camada de visualização, assegurando a integridade dos contratos compartilhados entre os componentes.

O ciclo de respostas e conclusão de inspeções exige, dadas as condições do campo, uma etapa essencial de persistência local. Os dados preenchidos são inicialmente gravados no banco do navegador, o *IndexedDB*, antes mesmo do envio ao servidor, independentemente da existência de conexão imediata com a *internet*. Posteriormente, um mecanismo de sincronização processa as operações retidas, cabendo ao servidor revalidar a identidade, o contexto da auditoria e lidar com potenciais conflitos de versão. O processo de autenticação, por sua vez, efetua uma chamada imediata à respectiva *Server Function*. Essa dinâmica, incluindo a gestão de arquivos fotográficos, está sintetizada na Figura 1, que ilustra como a plataforma articula o fluxo *online* com a necessidade tática de persistência local.

**FIGURA 1 — Camadas e persistência da plataforma**

![Camadas e persistência da plataforma](../../fontes/monografia/midia-revisao-2026-11-18/figura-01-camadas-e-persistencia.png)

**Fonte:** Autores (2026)

A modelagem do banco de dados reflete as interações de domínio entre os usuários, as empresas, os *checklists*, as inspeções, as respostas, as não conformidades, as ações corretivas e as evidências. Para estruturá-la, utilizou-se o modelo conceitual para mapear as entidades; o lógico para detalhar atributos, chaves primárias/estrangeiras e cardinalidades; e o físico para estabelecer a tipagem rigorosa e as restrições inerentes ao *PostgreSQL* (Apêndice G). O dicionário de dados atua como um guia sobre as condições de preenchimento, enquanto o diagrama de classes esclarece a estrutura hierárquica lida pela aplicação (Apêndice H).

Entre as escolhas de modelagem, uma das decisões centrais foi isolar o *checklist* base (modelo reutilizável) da versão efetivamente aplicada durante uma auditoria. Sempre que uma nova inspeção é iniciada, o sistema gera uma cópia histórica (um *snapshot*) que congela os títulos, a ordem, a exigência normativa e a formulação das perguntas naquele exato momento. Isso garante que eventuais alterações futuras no *checklist* matriz não alterem ou invalidem o histórico das respostas de inspeções passadas. Trata-se de uma duplicação controlada focada na preservação do contexto legal da avaliação, não implicando, desta forma, no congelamento irrestrito de todos os dados cadastrais ou tratativas da empresa.

Por fim, o ciclo de desenvolvimento valeu-se da etapa inicial de prototipação com a ferramenta *Lovable* para criar uma base estrutural navegável e testar fluxos de tela. Os *wireframes* gerados nessa etapa são o reflexo dos objetivos visuais iniciais e ilustram comportamentos baseados em simulações, não devendo ser interpretados como provas definitivas do atual funcionamento da aplicação final. A estratégia adotada, no entanto, foi altamente eficaz: o projeto aproveitou a casca responsiva gerada durante a prototipação e, progressivamente, substituiu os dados de demonstração (*mockups*) pelas lógicas e *endpoints* persistentes reais. Essa transição fluida conectou o *design* visual inicial à implementação do *backend* sem a necessidade de reconstruir a interface do zero a cada novo módulo desenvolvido ou desafio estrutural encontrado.

<a name="secao-4-2"></a>

## 4.2 Desenvolvimento da plataforma

O desenvolvimento da plataforma adotou uma abordagem que priorizou entregas por conjuntos relacionados de funcionalidades. Inicialmente, a base visual do sistema foi conectada progressivamente ao servidor e ao banco de dados, começando pelos módulos de autenticação, gestão de empresas, configuração de *checklists* e rotinas de inspeção. Em seguida, foram incorporadas as opções de respostas, bases normativas, registro de não conformidades e gestão de ações corretivas. A estruturação do projeto em fases, tarefas e decisões devidamente registradas serviu como eixo norteador tanto para a execução técnica quanto para a revisão de cada entrega. Cabe ressaltar que os conteúdos sobre gestão de projetos associados ao PMBOK, abordados ao longo do curso, inspiraram a organização e a documentação inicial da pesquisa, ainda que o trabalho não pleiteie a aplicação integral do guia ou a comprovação de adoção de um método específico de gerenciamento.

Nessa dinâmica, coube aos autores a definição do escopo, das regras de negócio e a tomada de decisões de desenvolvimento, assim como a revisão de cada pacote entregue e a definição dos critérios para avanço das etapas. Como suporte operacional, ferramentas de inteligência artificial foram empregadas de forma delimitada: o *ChatGPT* auxiliou na redação de esboços de documentação e no refinamento lógico de *prompts*, enquanto o *Codex* foi utilizado para agilizar a implementação de trechos de código e colaborar em revisões técnicas específicas, acompanhadas também de intervenções manuais. Destaca-se, contudo, que o emprego dessas tecnologias esteve sempre subordinado ao crivo arquitetural dos autores e em momento algum substituiu a coleta de dados primários com os usuários ou o rigor nos critérios de verificação das funcionalidades da plataforma.

Durante a integração estrutural, os formulários da interface passaram a encaminhar seus dados diretamente para as *Server Functions*, que atuam em conjunto com serviços e repositórios. Essa comunicação incluiu a adoção de esquemas rígidos de validação antes de qualquer persistência no *PostgreSQL*. No módulo de segurança, a autenticação foi construída utilizando a sessão nativa da aplicação, assegurando que as senhas transitem e sejam armazenadas exclusivamente sob a criptografia de *hash* (padrão *bcrypt*). Ao longo da evolução do código, os controles de propriedade foram aprimorados para garantir que informações sensíveis (dados de empresas, conteúdo das inspeções e tratativas de correção) fossem acessadas apenas pelos respectivos criadores. Posteriormente, o módulo de cadastro público de novos usuários foi adicionado e integrado à rota de *login*, complementado pela devida validação de dados de entrada. Enfatiza-se que esses controles refletem os mecanismos defensivos previstos no código, sem se assumir como garantia absoluta contra todas as vulnerabilidades cibernéticas.

Na prática operacional, a execução de uma inspeção baseia-se nos itens congelados no *snapshot* do *checklist*. Caso o usuário marque um item como não conforme, o sistema exige e gera um registro associado a essa irregularidade, o qual pode ser detalhado com descrição, nível de gravidade, prazo para correção e definição de ações corretivas. Essas ações permitem a inclusão de informações clássicas de planejamento, como a motivação, o local, o responsável, a metodologia e o custo, sendo o preenchimento desses campos opcional, de acordo com as regras estabelecidas. Para que uma inspeção seja concluída pelo sistema, o usuário precisa registrar respostas para todos os itens marcados como obrigatórios, havendo a possibilidade de utilizar a opção "não aplicável" quando pertinente ao cenário. É válido notar que a existência de não conformidades (pendências) não bloqueia o encerramento do preenchimento do formulário da inspeção; pelo contrário, o acompanhamento e o saneamento dessas falhas continuam ativamente após a emissão do registro.

Em agosto, os recursos de versionamento dos *checklists* e a captura de seus históricos foram implementados, formando a base necessária para a geração posterior de relatórios e para a operação sem rede (*offline*). Os registros criados antes do funcionamento desse novo mecanismo passaram por rotinas de compatibilidade, mas, por precaução metodológica, não são tratados como reconstruções históricas absolutas nesta pesquisa. O fluxo fotográfico de evidências também foi refinado: o *upload* passou a conectar diretamente a fotografia à inspeção geral ou a uma não conformidade específica. Enquanto os arquivos brutos de imagem são enviados e mantidos *online* na plataforma *Cloudinary*, a interface oferece funcionalidades de seleção, pré-visualização, consulta e exclusão, cabendo ao *PostgreSQL* conservar apenas os metadados indispensáveis para vincular a imagem ao registro no banco.

Ainda em agosto, a equipe desenvolveu e validou o primeiro grande incremento para a operação *offline*. Quando um usuário cria uma inspeção *online* e a torna previamente disponível em seu dispositivo, ele passa a conseguir responder e concluir a auditoria localmente, com os dados persistindo em uma fila durável (*IndexedDB*). Durante essa etapa, cada registro ou alteração adquire uma identidade de operação estável, mecanismo vital para evitar duplicações caso haja instabilidade e o envio precise ser repetido pelo celular. Ao recuperar conectividade, com a aplicação ativa e a sessão ainda válida, o sincronizador entra em ação e despacha as pendências retidas na fila. Caso o servidor detecte divergências em relação à última revisão salva na base de dados principal, a escrita é bloqueada, exigindo que o usuário ou a equipe trate o conflito em vez de o sistema sobrescrever a última informação salva.

No mês de setembro, ocorreu a integração dos relatórios e dos painéis de indicadores (*dashboards*) alimentados por dados reais. O relatório unifica, em uma única visão, o contexto histórico do *checklist*, as alternativas marcadas, as não conformidades geradas, as ações apontadas e as fotografias. O processo de impressão e a geração do arquivo PDF ocorrem por meio de rotinas nativas do próprio navegador. O *dashboard*, por sua vez, foi desenhado para agregar as estatísticas de auditorias e o volume de pendências sob a responsabilidade do usuário conectado. Por fim, em outubro, a plataforma recebeu um módulo de *templates* institucionais que permite ao profissional duplicar modelos para a sua base pessoal; vale pontuar que essa designação "institucional" indica apenas que o formulário passou por curadoria técnica da equipe do projeto, não implicando, contudo, chancela governamental sobre o modelo.

Para atestar a robustez do que foi construído, os ciclos de verificação técnica abrangeram testes de integração direta contra o *PostgreSQL*, armazenamento simulado de imagens e execução de validações de regras de negócio. Adotou-se o *framework* *Playwright* executado sobre o navegador *Chromium* para automatizar e exercitar fluxos críticos, tais como a inserção de respostas *offline*, a reabertura inesperada da página e a sincronização posterior da fila. Essas rotinas operacionais foram complementadas pela rigorosa conferência de tipos (*TypeScript*) e pela geração final do artefato de construção da aplicação. Ressalta-se que o escopo dessas verificações simuladas focou no limite dos componentes locais, sendo separadas dos testes realizados contra os serviços em nuvem ou bancos de dados reais.

Todas essas camadas de revisão geraram ações corretivas na ferramenta. Ao testar a cópia de *checklists*, por exemplo, detectou-se um gargalo de processamento no serviço de nuvem Neon, o que obrigou a equipe a reescrever e agrupar as inserções (escritas em lote) e rever o fluxo. Revisões subsequentes ajustaram problemas menores, como o comportamento do sistema diante de prazos deixados em branco, o *feedback* de confirmação visual para alterações locais, o isolamento correto dos *caches* quando diferentes usuários acessam o mesmo dispositivo, e a classificação de mensagens de erro durante falhas de sincronização. Cada alteração estrutural motivou atualizações na documentação do sistema e nos cenários de teste. As revisões do desenvolvimento documentadas até outubro antecederam os ensaios complementares de novembro.

<a name="secao-5"></a>

# 5 RESULTADOS E DISCUSSÃO

O principal resultado desta pesquisa foi a entrega de uma plataforma *web* funcional para o registro e acompanhamento de inspeções de Segurança e Saúde no Trabalho (SST). Até o encerramento do desenvolvimento, o sistema contemplou o gerenciamento de empresas, a edição de *checklists*, a execução de auditorias, o registro de respostas, o acompanhamento de não conformidades, as ações corretivas e a anexação *online* de evidências fotográficas. Todo esse fluxo foi incrementado pela geração de relatórios e *dashboards* de indicadores. A entrega atinge diretamente o objetivo de digitalização proposto ao unificar registros que antes ficavam fragmentados entre pranchetas de papel, fotografias e planilhas eletrônicas (Figura 2).

**FIGURA 2 — *Dashboard***

![Dashboard](../../fontes/monografia/midia-revisao-2026-11-18/figura-02-dashboard.png)

**Fonte:** Autores (2026)

Do ponto de vista da arquitetura, a decisão de preservar cópias do *checklist* utilizado no dia da inspeção mostrou-se fundamental para a rastreabilidade do processo. Ao congelar as perguntas e as exigências normativas na criação de cada auditoria, os relatórios conseguem se conectar ao contexto original, mesmo que o modelo matriz do formulário venha a ser editado no futuro (Figura 3). Dessa forma, enquanto os dados gerais de cadastro continuam passíveis de atualização, a ferramenta resguarda o arcabouço histórico da inspeção, ainda que não constitua uma trilha de auditoria imutável (como o modelo *blockchain*) para todos os eventos da plataforma.

**FIGURA 3 — Relatório**

![Relatório](../../fontes/monografia/midia-revisao-2026-11-18/figura-03-relatorio.png)

**Fonte:** Autores (2026)

A implementação da continuidade de operação sem rede (*offline*) atendeu de forma parcial ao problema da conectividade no campo. Nos cenários executados em agosto e setembro, foi possível iniciar uma inspeção no sistema, interromper o acesso à rede, responder ao formulário, fechar e reabrir a página e, após o restabelecimento da internet, sincronizar os dados com sucesso. Essa etapa, envolvendo operações assíncronas, teve sua persistência em nuvem conferida no servidor Neon e, posteriormente (já em outubro), complementada por simulações de concorrência em um banco de dados *PostgreSQL* local. Embora atestem a estabilidade nos ambientes testados, esses resultados não substituem uma validação exaustiva em múltiplos dispositivos e navegadores. Adicionalmente, as funções de criar novas auditorias integralmente sem conexão inicial, subir fotos em modo *offline* e automatizar resoluções de conflitos permanecem como aprimoramentos para as próximas versões.

Na homologação de setembro, três cenários exercitaram a retomada de uma inspeção sem rede, o reenvio de operações e o tratamento de uma edição conflitante. Em outubro, 18 verificações em PostgreSQL local e dez em Chromium com armazenamento local confirmaram, nos casos exercitados, que repetir uma operação já aceita preservava uma única gravação. O Apêndice I apresenta as condições dessas verificações e os resultados relativos ao histórico dos checklists e ao acesso por contas distintas.

A recepção de uma versão preliminar do sistema (anterior à integração de relatórios, *dashboards* reais e rotinas refinadas de *cache*) foi avaliada por participantes com vivência no setor entre os dias 28 e 31 de agosto de 2026. A Tabela 1 (abaixo) sintetiza as respostas às questões fechadas do instrumento de pesquisa, preservando a numeração original do formulário. Destaca-se que o universo amostral foi composto por quatro participantes, de modo que cada resposta individual corresponde a 25% da amostra. A questão de número 13, por conta da sua natureza discursiva, foi deliberadamente omitida da tabela, sendo analisada a seguir.

**Tabela 1 — Avaliação da versão preliminar da plataforma (dados coletados de 28 a 31 de agosto de 2026)**

| **Questão apresentada**                                             | **Respostas registradas**                                                                                     |
|---------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| 1\. Relação com SST                                                 | Estudante: 1 (25%); técnico: 1 (25%); engenheiro: 1 (25%); consultor/auditor: 1 (25%).                        |
| 2\. Frequência de inspeções/vistorias                               | Não realiza diretamente: 1 (25%); semanalmente: 1 (25%); mensalmente: 1 (25%); ocasionalmente: 1 (25%).       |
| 3\. Utilidade da consulta às NRs durante a inspeção                 | Concordo totalmente: 4 (100%).                                                                                |
| 4\. Histórico para acompanhar pendências e evolução                 | Concordo totalmente: 4 (100%).                                                                                |
| 5\. Integração coerente das funcionalidades                         | Concordo totalmente: 3 (75%); concordo: 1 (25%).                                                              |
| 6\. Facilidade de aprender a utilizar                               | Concordo totalmente: 4 (100%).                                                                                |
| 7\. Rapidez e eficiência percebidas na realização de tarefas        | Concordo totalmente: 4 (100%).                                                                                |
| 8\. Suficiência das mensagens, retornos e indicações                | Concordo totalmente: 3 (75%); concordo: 1 (25%).                                                              |
| 9\. Adequação da quantidade de informações nas telas                | Concordo totalmente: 3 (75%); nem concordo nem discordo: 1 (25%).                                             |
| 10\. Conforto e sensação de segurança durante o uso                 | Concordo totalmente: 4 (100%).                                                                                |
| 11\. Fatores que poderiam dificultar o uso em vistoria              | Nenhuma dificuldade significativa: 2 (50%); internet: 1 (25%); necessidade de manter as mãos livres: 1 (25%). |
| 12\. Relevância para minimizar dificuldades do processo tradicional | Muito relevante: 3 (75%); moderadamente relevante: 1 (25%).                                                   |
| 14\. Probabilidade de recomendar a plataforma                       | Com certeza recomendaria: 4 (100%).                                                                           |

**Fonte:** Autores (2026)

A análise dos dados aponta um alto grau de alinhamento entre as expectativas dos profissionais e as soluções desenvolvidas. A totalidade dos participantes (100%) concordou com a utilidade da consulta normativa integrada e da disponibilidade do histórico de inspeções. Esse resultado dialoga com o problema apontado no referencial teórico: a necessidade de conectar a verificação prática em campo ao controle de tratativas posteriores. A concordância sobre a facilidade de aprendizado e a intenção de recomendar o uso do *software* comprovam a recepção favorável da usabilidade. Em paralelo a isso, aspectos de engenharia de interface, como a integração entre as telas e o *feedback* de ações, receberam avaliações positivas, mas com leves variações de intensidade (75% de concordância total contra 25% de concordância parcial).

As respostas também forneceram subsídios para futuras revisões de experiência do usuário (*UX*). Sobre a densidade informacional (questão 9), três avaliadores a consideraram plenamente adequada, enquanto um optou pela neutralidade. Embora essa posição neutra não ateste sobrecarga visual, alerta para o cuidado constante com a organização dos painéis em atualizações futuras. No que diz respeito aos obstáculos operacionais (questão 11), metade do grupo não previu dificuldades sistêmicas, porém as outras opiniões sinalizaram barreiras inerentes à rotina industrial: a ausência de internet e a necessidade tática de "manter as mãos livres". O receio justificado em relação à falta de rede comprova a adequação da estratégia de engenharia de investir na capacidade *offline* do aplicativo, mesmo não sendo possível confirmar, por este formulário, se todos os respondentes chegaram a forçar o funcionamento dessa contingência durante o teste.

Na pergunta discursiva (questão 13), dedicada ao mapeamento livre de pontos fortes, fracos e sugestões, obteve-se adesão de 75% da amostra. Um dos comentários destacou a intuitividade da ferramenta e a facilidade de aprendizado durante sua utilização. Por outro lado, o relato de uma dificuldade passageira em encontrar o botão para o *upload* das fotografias não invalida a presença da funcionalidade, mas indica uma falha de "descobrimento". Esse apontamento será útil para nortear uma reformulação na disposição e no destaque desse elemento na tela da auditoria. Por fim, uma sugestão valiosa abordou a inclusão de lógicas voltadas aos Equipamentos de Proteção Coletiva (EPCs); esse *feedback* destaca a necessidade de validar o conteúdo dos formulários junto aos gestores de SST no mercado, sem implicar, desta forma, que o algoritmo da plataforma deva ser o único responsável por inferir ou decidir automaticamente os arranjos de segurança de uma planta industrial.

A avaliação positiva realizada pelos participantes é um resultado importante, pois fornece evidências iniciais de que a plataforma atende às necessidades do público-alvo e apresenta potencial para aplicação prática. Esse resultado contribui para a resolução do problema de pesquisa ao indicar que a solução desenvolvida pode facilitar a execução das inspeções e o acompanhamento das informações relacionadas à SST. Além disso, os achados corroboram a literatura sobre desenvolvimento de sistemas centrados no usuário, segundo a qual a percepção de utilidade e facilidade de uso constitui fator fundamental para a adoção de novas tecnologias em ambientes organizacionais.

A implementação dos mecanismos de funcionamento offline representa um resultado relevante, pois amplia a aplicabilidade da ferramenta em cenários nos quais a conectividade com a internet é limitada ou inexistente. Essa característica contribui diretamente para solucionar uma das dificuldades encontradas em inspeções de campo, garantindo a continuidade das atividades sem interrupções operacionais. Do ponto de vista da literatura, o resultado reforça a utilização de aplicações web progressivas como alternativa para aumentar a disponibilidade e a confiabilidade de sistemas móveis, além de representar um diferencial em relação às soluções analisadas durante a pesquisa.

A análise comparativa da solução desenvolvida em relação aos trabalhos e ferramentas identificados na literatura permite evidenciar contribuições relevantes. Diferentemente do SST Hub, cuja proposta está voltada principalmente para a disponibilização e consulta de informações relacionadas à Segurança e Saúde no Trabalho, a plataforma desenvolvida incorpora funcionalidades operacionais que apoiam diretamente a execução e o gerenciamento das inspeções, incluindo o registro de não conformidades, o acompanhamento de ações corretivas e a emissão de relatórios. Além disso, a solução amplia a proposta apresentada por Murbach (2019), ao possibilitar a criação e utilização de múltiplos checklists adaptados a diferentes contextos organizacionais e demandas de inspeção, conferindo maior flexibilidade ao processo de avaliação (Figura 4). Outro diferencial observado é a disponibilização de recursos de funcionamento offline, permitindo a continuidade das inspeções mesmo em ambientes com conectividade limitada ou inexistente, característica não identificada nas soluções analisadas durante a revisão da literatura. Por fim, a plataforma integra, em um único ambiente, funcionalidades de consulta normativa, realização de inspeções, registro de evidências, acompanhamento de não conformidades e monitoramento de ações corretivas, reduzindo a necessidade de utilização de múltiplas ferramentas e contribuindo para maior eficiência na gestão das atividades de Segurança e Saúde no Trabalho.

**FIGURA 4 — Checklist**

![Checklist](../../fontes/monografia/midia-revisao-2026-11-18/figura-04-checklist.png)

**Fonte:** Autores (2026)

Os resultados obtidos demonstram o atendimento dos objetivos específicos estabelecidos nesta pesquisa. O levantamento bibliográfico e tecnológico permitiu identificar as principais limitações dos processos tradicionais de inspeção em Segurança e Saúde no Trabalho, bem como as lacunas existentes nas soluções encontradas na literatura. O processo de elicitação de requisitos, realizado por meio de entrevistas e formulários aplicados a profissionais da área, possibilitou a definição dos requisitos funcionais e não funcionais que nortearam o desenvolvimento da solução. Em seguida, a modelagem da arquitetura, do banco de dados e dos fluxos operacionais forneceu a base para a implementação da plataforma web responsiva. Como resultado, foi desenvolvida uma aplicação capaz de gerenciar empresas, checklists, inspeções, não conformidades, ações corretivas e relatórios, incorporando ainda mecanismos de persistência local e sincronização de dados (Figura 3). Por fim, a avaliação conduzida junto aos usuários indicou percepção positiva quanto à utilidade, facilidade de uso e potencial de aplicação da ferramenta, evidenciando a aderência da solução aos requisitos inicialmente definidos e aos objetivos propostos para o trabalho.

**FIGURA 5 — Cadastro de empresas**

![Cadastro de empresas](../../fontes/monografia/midia-revisao-2026-11-18/figura-05-cadastro-de-empresas.png)

**Fonte:** Autores (2026)

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

Além da contribuição tecnológica materializada na implementação da plataforma, esta pesquisa também apresenta uma contribuição acadêmica ao sistematizar requisitos, funcionalidades e desafios associados à digitalização de inspeções de Segurança e Saúde no Trabalho. O estudo consolida evidências obtidas na literatura e junto aos profissionais da área, oferecendo uma referência para futuras pesquisas sobre aplicações web progressivas voltadas à gestão de SST e à realização de inspeções em campo.

A avaliação com quatro participantes descreve a experiência de um grupo pequeno e com perfis distintos. Os dados foram analisados de forma agregada. Cada resposta corresponde a 25% do grupo, o que restringe a interpretação das diferenças entre as questões. A aplicação do questionário em ambiente controlado também deixa em aberto como as condições de conectividade, a necessidade de manter as mãos livres e o uso prolongado da plataforma influenciam a vistoria em campo.

Os quatro participantes concordaram plenamente que conseguiam realizar as tarefas com rapidez e eficiência na versão avaliada em agosto. A Tabela 2 apresenta o tempo de um roteiro automatizado com respostas, observações e cadência de digitação predefinidas. Uma estimativa de economia de tempo no trabalho exigiria observar profissionais executando tarefas comparáveis com a plataforma e com o procedimento habitual. A duração de vistorias reais, a incidência de acidentes e o valor de multas ficaram fora das medidas desta pesquisa.

Em resumo, a presente pesquisa articulou de maneira consistente a fase de entendimento dos problemas do mercado à projeção, implementação e avaliação de um produto mínimo viável. O sistema entrega uma base resolutiva para a dispersão de informações, respondendo satisfatoriamente (ainda que sob certas limitações temporais do escopo acadêmico) ao desafio do armazenamento de evidências. As lacunas encontradas apontam o caminho natural para a evolução do sistema. Restam o aprimoramento na gestão de proteção da privacidade de imagens acessadas externamente (URLs), a evolução tática do fluxo de sincronização offline e o estabelecimento de uma arquitetura definitiva de permissões. Tais frentes lançam as bases da transição do trabalho acadêmico atual para um produto apto às pressões ininterruptas do cotidiano industrial.

<a name="secao-6"></a>

# 6 CONCLUSÃO

Este trabalho apresentou o desenvolvimento de uma plataforma web responsiva voltada ao apoio das inspeções de Segurança e Saúde no Trabalho (SST). A solução desenvolvida integra a gestão de checklists, o registro de respostas e não conformidades, a definição de ações corretivas e o armazenamento de evidências fotográficas, contribuindo para a centralização das informações e para a redução dos problemas de dispersão documental identificados no levantamento inicial.

Os objetivos propostos foram alcançados por meio do levantamento de requisitos, da modelagem da solução e da implementação da plataforma. Entre os principais resultados obtidos destacam-se a disponibilização de um histórico auditável das inspeções, a integração das funcionalidades de acompanhamento e gestão das não conformidades e a implementação de mecanismos de persistência local de dados, permitindo a continuidade das atividades mesmo em situações de conectividade limitada. Ainda que o funcionamento offline tenha sido alcançado de forma parcial, os resultados demonstram a viabilidade técnica da abordagem adotada.

A pesquisa também contribui para preencher uma lacuna identificada tanto na literatura quanto nas soluções analisadas, que geralmente oferecem funcionalidades isoladas sem contemplar o ciclo completo de inspeção em SST. Nesse contexto, a plataforma desenvolvida reúne, em um único ambiente, recursos de consulta normativa, execução de inspeções, registro de evidências, acompanhamento de não conformidades e monitoramento de ações corretivas.

Como contribuição tecnológica, a pesquisa disponibilizou uma arquitetura baseada em *Progressive Web Application* (PWA), incorporando mecanismos de persistência local e sincronização posterior de dados para apoiar inspeções realizadas em ambientes com restrições de conectividade. Como contribuição acadêmica, o estudo sistematizou requisitos, funcionalidades e práticas relacionadas à digitalização de inspeções em SST, podendo servir como referência para futuras pesquisas e iniciativas de desenvolvimento na área.

A validação preliminar realizada com potenciais usuários indicou percepção positiva quanto à utilidade, facilidade de uso e potencial de aplicação da solução. Entretanto, os resultados devem ser interpretados considerando as limitações da pesquisa, especialmente o número reduzido de participantes, a ausência de avaliações em ambientes industriais reais e a não utilização de instrumentos padronizados de avaliação de usabilidade e aceitação tecnológica.

Nos ensaios complementares, o acesso à inspeção e a abertura do relatório levaram, em média, cerca de 3,7 segundos após a espera e 1,7 segundo nas tentativas consecutivas. A recuperação de 30 inspeções distintas em sequência, com as respectivas respostas e observações de não conformidade quando aplicáveis, complementou a percepção de utilidade do histórico registrada pelos participantes. Esses resultados caracterizam o funcionamento da plataforma nas condições ensaiadas.

Como trabalhos futuros, recomenda-se ampliar a validação da plataforma em cenários reais de operação, envolvendo um número maior de usuários e organizações. Uma comparação entre o registro habitual e a plataforma poderia cronometrar tarefas equivalentes, distinguindo o tempo de observação dos riscos, de preenchimento e de recuperação do relatório. Também poderão ser explorados recursos como assinatura digital, georreferenciamento das inspeções, integração com sistemas corporativos, aprimoramento das funcionalidades offline e aplicação de técnicas de Inteligência Artificial para apoio à identificação de não conformidades e geração de recomendações.

Em síntese, os resultados obtidos demonstram que a solução proposta possui potencial para apoiar a digitalização e a gestão das inspeções de Segurança e Saúde no Trabalho, estabelecendo uma base sólida para sua evolução tecnológica e para futuras investigações acadêmicas no tema.

<a name="referencias"></a>

# REFERÊNCIAS

ASSIS, Mara Queiroga Camisassa de. História da segurança e saúde no trabalho no Brasil e no mundo. **Revista da Escola Nacional da Inspeção do Trabalho**, ano 5, 2021. Disponível em: https://revistaenit.trabalho.gov.br/index.php/RevistaEnit/article/view/127. Acesso em: 22 nov. 2026.

BARSANO, Paulo Roberto; BARBOSA, Rildo Pereira. **Segurança do trabalho**: guia prático e didático. 2. ed. São Paulo: Érica/Saraiva Educação, 2018.

BITENCOURTE, Adakrishna Sampaio Saraiva. **Conscientização ergonômica e saúde do trabalhador**: avaliação dos aplicativos de ergonomia e elaboração de protótipo de aplicativo ergonômico informativo. 2020. Dissertação (Mestrado) – Universidade do Estado do Rio de Janeiro, Rio de Janeiro, 2020.

BRASIL. Ministério do Trabalho e Emprego. **Normas Regulamentadoras Vigentes**. Brasília, Distrito Federal: Ministério do Trabalho e Emprego, 22 out. 2020. Disponível em: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes. Acesso em: 02 out. 2026.

CAMISASSA, Mara Queiroga<strong>. Segurança e saúde no trabalho</strong>: NRs 1 a 36 comentadas e descomplicadas. São Paulo: Método LTDA, 2015. Disponível em: https://saude.ufpr.br/epmufpr/wp-content/uploads/sites/42/2020/10/NRs-comentadas.pdf. Acesso em: 02 out. 2026.

CANTAVE, Jerry; DERROSSO, Giuliano; REIS, Waneska Cavalcante Ferreira de Albuquerque. Acidentes de trabalho no Brasil: análise temporal de 2012 a 2021. **Boletim Técnico do Senac**, Rio de Janeiro, v. 49, e23009, 2023. DOI: https://doi.org/10.26849/bts.v49i.949.

CLOUDINARY. **Upload**. \[S. l.\]: Cloudinary, 2026. Disponível em: https://cloudinary.com/documentation/upload_images. Acesso em: 02 out. 2026.

DEXIE.JS. **Design**. \[S. l.\]: Dexie.js, 2023. Disponível em: https://dexie.org/docs/Tutorial/Design. Acesso em: 16 out. 2026.

EIDT, Dilnei José. **A fiscalização das normas regulamentadoras da segurança e saúde do trabalho no âmbito das microempresas e empresas de pequeno porte - MPE**. 2017. 288f. Dissertação (Mestrado em Direito) – Universidade Comunitária da Região de Chapecó, Chapecó, 2017.

FOWLER, Martin. **Refatoração**: aperfeiçoando o design de códigos existentes. 2. ed. São Paulo: Novatec, 2019.

FUNDACENTRO. **Trabalhadores com LER/Dort podem sofrer assédio moral e transtornos mentais**. 2024. Disponível em: https://www.gov.br/fundacentro/pt-br/comunicacao/noticias/noticias/2024/marco/trabalhadores-com-ler-dort-podem-sofrer-assedio-moral-e-transtornos-mentais. Acesso em: 22 nov. 2026.

INTERNATIONAL LABOUR ORGANIZATION. **ILO Centenary Declaration for the Future of Work**. Geneva: ILO, 2019. Disponível em: https://www.ilo.org/resource/ilc/108/ilo-centenary-declaration-future-work. Acesso em: 22 nov. 2026.

LOPES, Paulo Richard Sicca. **Utilização de ferramenta de software no levantamento de informações de campo em segurança e saúde do trabalho**. 2013. 40f. Monografia (Especialização em Engenharia de Segurança do Trabalho) – Universidade Federal do Rio Grande do Sul, Porto Alegre, 2013.

LUCENA, Arthur Felipe Echs. **Desenvolvimento de recursos baseados em jogos e realidade virtual para capacitação em segurança do trabalho de gestores da construção civil**. 2019. 173 f. Dissertação (Mestrado em Engenharia Civil) – Universidade Estadual de Londrina, Londrina, 2019.

MARTIN, Robert C. **Arquitetura limpa**: o guia do artesão para estrutura e design de software. Rio de Janeiro: Alta Books, 2019.

MDN WEB DOCS. **Offline and background operation**. \[S. l.\]: Mozilla, 2026. Disponível em: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation. Acesso em: 02 out. 2026.

MICROSOFT. **The TypeScript handbook**. \[S. l.\]: Microsoft, 2026. Disponível em: https://www.typescriptlang.org/docs/handbook/intro.html. Acesso em: 02 out. 2026.

MINISTÉRIO PÚBLICO DO TRABALHO. **Mortalidade no trabalho cresce em 2022 e acidentes notificados ao SUS batem recorde**. 30 mar. 2023. Disponível em: https://www.prt20.mpt.mp.br/informe-se/noticias-do-mpt-se/1130-mortalidade-no-trabalho-cresce-em-2022-e-acidentes-notificados-ao-sus-batem-recorde. Acesso em: 22 nov. 2026.

MORAIS, Amanda Ferreira de. *et al.* **SST Hub**: sistema de planejamento e consulta de segurança do trabalho. 2026. 34f. Trabalho de Conclusão de Curso (Técnico em Desenvolvimento de Sistemas) – Etec Orlando Quagliato, Centro Estadual de Educação Tecnológica Paula Souza, Santa Cruz do Rio Pardo, 2026.

MURBACH, Tiago. **Desenvolvimento de uma ferramenta de verificação para gestão e fiscalização da segurança do trabalho na Indústria da Construção**. 2019. 119f. Monografia (Especialização em Engenharia de Segurança do Trabalho) – Universidade Tecnológica Federal do Paraná, Curitiba, 2019.

OLIVEIRA, Israel Chagas de. **Acidentes do trabalho fatais analisados pelo MPT à luz das normas de saúde e segurança do trabalho**. 2025. 94f. Dissertação (Mestrado) – Instituto de Economia, Universidade Estadual de Campinas, Campinas, 2025.

PALIN, K.; FEIT, A. M.; KIM, S.; KRISTENSSON, P. O.; OULASVIRTA, A. How do people type on mobile devices? Observations from a study with 37,000 volunteers. In: INTERNATIONAL CONFERENCE ON HUMAN-COMPUTER INTERACTION WITH MOBILE DEVICES AND SERVICES, 21., 2019, Taipei. **Proceedings of the 21st International Conference on Human-Computer Interaction with Mobile Devices and Services**. New York: ACM, 2019. Art. 9, p. 1–12. DOI: https://doi.org/10.1145/3338286.3340120.

PEIXOTO, Néverton Hofstadler. **Curso técnico em automação industrial**: segurança do trabalho. 3. ed. Santa Maria: Universidade Federal de Santa Maria: Colégio Técnico Industrial de Santa Maria, 2010. 128 p.

POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL 18 documentation: transactions**. \[S. l.\]: PostgreSQL Global Development Group, c2026. Disponível em: https://www.postgresql.org/docs/18/tutorial-transactions.html. Acesso em: 02 out. 2026.

PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de software**: uma abordagem profissional. 8. ed. Porto Alegre: AMGH, 2016.

PRISMA. **What is Prisma 7?** \[S. l.\]: Prisma, 2026. Disponível em: https://www.prisma.io/docs/orm/v7. Acesso em: 02 out. 2026.

PRODANOV, Cleber Cristiano; FREITAS, Ernani Cesar de. **Metodologia do trabalho científico**: métodos e técnicas da pesquisa e do trabalho acadêmico. 2. ed. Novo Hamburgo: Feevale, 2013. E-book. Disponível em: https://www.feevale.br/institucional/editora-feevale/metodologia-do-trabalho-cientifico---2-edicao. Acesso em: 02 out. 2026.

REACT. **Quick start**. \[S. l.\]: React, 2026. Disponível em: https://react.dev/learn. Acesso em: 16 out. 2026.

SILVA, Bruno Alves Matias da. *et al.* Desenvolvimento de sistema de controle de risco na engenharia de segurança do trabalho. **Revista Ibero-Americana de Humanidades, Ciências e Educação**, São Paulo, v. 11, n. 8, p. 1179-1193, ago. 2025.

SOMMERVILLE, Ian. **Engenharia de software**. 9. ed. São Paulo: Pearson Prentice Hall, 2011.

TAILWIND LABS. **Responsive design**. \[S. l.\]: Tailwind Labs, 2026. Disponível em: https://tailwindcss.com/docs/responsive-design. Acesso em: 02 out. 2026.

TANSTACK. **Overview**. TanStack Query: React documentation. \[S. l.\]: TanStack, 2026a. Disponível em: https://tanstack.com/query/latest/docs/framework/react/overview. Acesso em: 02 out. 2026.

TANSTACK. **Server functions**. TanStack Start: React documentation. \[S. l.\]: TanStack, 2026b. Disponível em: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions. Acesso em: 22 nov. 2026.

TOPDJIAN, Ulysses. *et al.* Análise de ferramentas e tecnologias de desenvolvimento de software para dispositivos móveis: estudo de caso aplicado à implementação de um sistema especialista na área de segurança do trabalho. *In*. **Anais do V Encontro de Iniciação Científica e I Encontro Anual de Iniciação ao Desenvolvimento Tecnológico e Inovação – EICTI 2016**. \[Foz do Iguaçu, Paraná\]: UNILA, 2016.

VALENTE, Marco Tulio. **Engenharia de software moderna**: princípios e práticas para desenvolvimento de software com produtividade. [S. l.]: Independente, 2020. Disponível em: https://engsoftmoderna.info/index.html. Acesso em: 22 nov. 2026.

WASHIZAKI, Hironori (ed.). **Guide to the software engineering body of knowledge**. Version 4.0a. \[S. l.\]: IEEE Computer Society, 2026. Disponível em: https://ieeecs-media.computer.org/media/education/swebok/swebok-v4.pdf. Acesso em: 02 out. 2026.

ZOD. Zod. **Documentação da versão 3**. \[S. l.\]: Zod, 2026. Disponível em: https://github.com/colinhacks/zod/blob/main/packages/docs-v3/home.md. Acesso em: 02 out. 2026.

<a name="apendice-a"></a>

# aPÊNDICE A – FORMULÁRIO DE vALIDAÇÃO E LEVANTAMENTO DE Requisitos: Plataforma de SAÚDE E Segurança do Trabalho

1.  Como você realiza e registra as suas vistorias, fiscalizações e avaliações atualmente?

> () No papel (prancheta, bloco de notas, formulários impressos).
>
> () Documentos digitais avulsos (Word, Excel, planilhas no celular/tablet).
>
> () Aplicativos genéricos de checklist (Google Forms, Microsoft Forms).
>
> () Software específico de Segurança do Trabalho fornecido pela empresa.
>
> () Outro:\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

2.  Sobre a metodologia e os roteiros utilizados nas avaliações, como eles são estruturados?

> () Uso o mesmo roteiro padrão para quase todas as empresas/setores, avaliando em formato "Sim / Não / Não se Aplica".
>
> () Adapto os checklists de acordo com o ramo (obras, clínicas, etc.) e as NRs exigidas, avaliando por formato "Sim / Não / Não se Aplica".
>
> () Utilizo um sistema de pontuação/notas para classificar o nível de adequação ou risco.
>
> () Meu roteiro é majoritariamente descritivo (texto livre anotando o que está adequado ou inadequado).
>
> () Outro: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

3.  Quais são as suas maiores dificuldades e desafios no processo atual de fiscalização e guarda de histórico?

> () Perda de dados ou dificuldade física de armazenar e organizar papéis.
>
> () Problemas com caligrafia (minha ou de colegas) na hora de repassar as informações.
>
> () Muita demora para compilar os dados da vistoria e gerar o relatório final.
>
> () Dificuldade em consultar rapidamente o histórico de vistorias anteriores de uma empresa.
>
> () Dificuldade em consultar a vigência e os detalhes das NRs durante a fiscalização.
>
> () Outro: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

4.  Como você lida com a necessidade de consultar as Normas Regulamentadoras (NRs) durante o seu trabalho em campo ou ao redigir o relatório?

> () Confio na memória, raramente preciso consultar na hora.
>
> () Carrego material impresso ou PDFs salvos no celular/computador.
>
> () Consulto os canais oficiais do governo pelo navegador de internet quando surge a dúvida.
>
> () Utilizo algum aplicativo específico apenas para leitura de NRs.
>
> () Outro: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

5.  Se a sua empresa adquirisse um software/aplicativo moderno para substituir o papel e as planilhas, que armazenasse o histórico e tivesse consulta rápida de NRs, qual seria a sua reação?

> () Usaria prontamente. Facilitaria muito o meu trabalho e pouparia tempo.
>
> () Usaria, mas me preocupo com a curva de aprendizado ou com a dependência de internet no local da vistoria.
>
> () Preferiria continuar com o meu método atual, pois já estou acostumado e funciona bem para mim. *Pular para a pergunta 7*
>
> () Seria contrário, pois acho que sistemas engessam a análise técnica do profissional. *Pular para a pergunta 5.1.*

6.  De forma breve, o que NÃO PODE FALTAR de jeito nenhum em um software feito para facilitar as suas avaliações de Segurança do Trabalho?

> \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
>
> 5.1. Quais são as principais vantagens que o seu método de hoje (papel, planilhas, etc.) tem e que você acha difícil um software conseguir substituir?
>
> \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

<a name="apendice-b"></a>

# **APÊNDICE B** **– Entrevista de Validação e Levantamento de Requisitos: Plataforma de SAÚDE E Segurança do Trabalho**

1.  Você poderia me descrever o passo a passo de uma fiscalização típica, desde o momento em que você chega na empresa até a entrega do relatório final?

2.  Ao gerar o relatório final ou laudo, quais são as informações que dão mais trabalho para serem compiladas ou calculadas?

3.  Durante uma vistoria em uma obra ou indústria, você costuma usar EPIs como luvas, ou precisa estar com as mãos livres para subir em locais altos. Como você imagina que seria a interação física com um celular ou tablet nesses cenários?

4.  Onde você costuma realizar a consulta das NRs? É no meio da vistoria, em pé, ou você deixa para consultar quando senta no escritório para redigir o documento?

5.  É comum você realizar vistorias em locais sem acesso à internet ou com sinal muito ruim (como subsolos, áreas rurais ou canteiros de obras isolados)?

6.  Como é tratada a confidencialidade das informações que você coleta hoje? Há preocupação com o vazamento de dados de adequação ou infrações das empresas?

7.  Você mencionou que os roteiros mudam dependendo do ramo (ex: clínica vs. panificadora). Você poderia me dar um exemplo prático de como um checklist muda drasticamente de um ambiente para outro?

8.  Hoje, quando você retorna a uma empresa para uma segunda vistoria, como você utiliza o histórico da visita anterior para verificar se os problemas foram resolvidos?

9.  Se você pudesse criar uma funcionalidade específica nessa plataforma para resolver a tarefa mais chata e repetitiva do seu dia a dia, qual seria ela?

<a name="apendice-c"></a>

# **APÊNDICE C – Questionário de Avaliação da Plataforma Web de Apoio à Segurança do Trabalho (Teste de Protótipo)**

1\. Qual é sua relação principal com a área de Saúde e Segurança do Trabalho (SST)?

() Técnico(a) de Segurança do Trabalho

() Engenheiro(a) de Segurança do Trabalho

() Professor(a) / Pesquisador(a)

() Gestor(a) / Responsável por SST

() Consultor(a) / Auditor(a)

() Estudante

() Outro: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

2\. Com que frequência você realiza ou acompanha inspeções/vistorias de Segurança do Trabalho?

() Diariamente

() Semanalmente

() Mensalmente

() Ocasionalmente

() Não realizo diretamente

3\. A consulta às Normas Regulamentadoras (NRs) é útil para apoiar a tomada de decisão durante a inspeção.

() Discordo totalmente

() Discordo

() Nem concordo nem discordo

() Concordo

() Concordo totalmente

4\. O histórico das inspeções permite acompanhar adequadamente as pendências e sua evolução.

() Discordo totalmente

() Discordo

() Nem concordo nem discordo

() Concordo

() Concordo totalmente

5\. As funcionalidades da plataforma estão integradas de forma coerente para apoiar as atividades de inspeção.

() Discordo totalmente

() Discordo

() Nem concordo nem discordo

() Concordo

() Concordo totalmente

6\. Foi fácil aprender a utilizar a plataforma.

() Discordo totalmente

() Discordo

() Nem concordo nem discordo

() Concordo

() Concordo totalmente

7\. A plataforma permite realizar as tarefas de forma rápida e eficiente.

() Discordo totalmente

() Discordo

() Nem concordo nem discordo

() Concordo

() Concordo totalmente

8\. A plataforma apresenta mensagens, retornos ou indicações suficientes para orientar o usuário durante as ações.

() Discordo totalmente

() Discordo

() Nem concordo nem discordo

() Concordo

() Concordo totalmente

9\. A quantidade de informações apresentadas nas telas é adequada.

() Discordo totalmente

() Discordo

() Nem concordo nem discordo

() Concordo

() Concordo totalmente

10\. Eu me senti confortável e seguro(a) ao utilizar a plataforma. \* **Alternativas:**

() Discordo totalmente

() Discordo

() Nem concordo nem discordo

() Concordo

() Concordo totalmente

11\. Considerando o uso da plataforma durante uma vistoria, quais fatores poderiam dificultar sua utilização?

() Uso de luvas ou outros EPIs

() Necessidade de manter as mãos livres

() Tamanho dos elementos da interface

() Nenhuma dificuldade significativa

() Outro: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

12\. Após utilizar a plataforma, você considera que ela contribui para minimizar dificuldades presentes no processo tradicional de inspeção de Segurança do Trabalho?

() Muito relevante

() Relevante

() Moderadamente relevante

() Pouco relevante

() Não seria relevante

13\. Considerando sua experiência com a plataforma, quais aspectos você considera positivos, quais dificuldades ou aspectos negativos identificou e o que você sugere que seja melhorado?

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

14\. Considerando sua experiência geral, qual é a probabilidade de você recomendar esta plataforma a outro profissional de Segurança do Trabalho?

() Com certeza recomendaria

() Provavelmente recomendaria

() Talvez recomendaria

() Provavelmente não recomendaria

() Com certeza não recomendaria

<a name="apendice-d"></a>

# **APÊNDICE d – requisitos funcionais do sistema**

![Síntese dos requisitos funcionais](../../fontes/monografia/midia-revisao-2026-11-18/apendice-d-requisitos-funcionais.png)

<a name="apendice-e"></a>

# **APÊNDICE e – requisitos não funcionais do sistema**

![Síntese dos requisitos não funcionais](../../fontes/monografia/midia-revisao-2026-11-18/apendice-e-requisitos-nao-funcionais.png)

<a name="apendice-f"></a>

# **APÊNDICE f – Casos de uso**

![Diagrama de casos de uso](../../fontes/monografia/midia-revisao-2026-11-18/apendice-f-casos-de-uso.png)

<a name="apendice-g"></a>

# **APÊNDICE g – modelo lógico**

![Modelo lógico](../../fontes/monografia/midia-revisao-2026-11-18/apendice-g-modelo-logico.png)

<a name="apendice-h"></a>

# **APÊNDICE h – diagrama de classes**

![Diagrama de classes](../../fontes/monografia/midia-revisao-2026-11-18/apendice-h-diagrama-de-classes.png)

<a name="apendice-i"></a>

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
