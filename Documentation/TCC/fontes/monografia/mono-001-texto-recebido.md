# MONO-001 Texto de referência da monografia recebida

Recebimento: 16/10/2026. Cópia textual anonimizada do DOCX fornecido pelo autor.
É uma fonte preservada, não a versão revisada ou o arquivo de trabalho futuro.

## Tratamento e limites da extração

- Foram mantidos os parágrafos não vazios do corpo, sua ordem e sua redação,
  inclusive lacunas, erros, campos a confirmar e títulos provisórios.
- Nomes dos dois autores e da orientadora foram substituídos por papéis. Os nomes
  de autores bibliográficos permanecem intactos.
- Estilos de títulos foram representados por marcadores Markdown. Numeração
  automática, marcadores automáticos de lista, sumário gerado por campos,
  paginação, espaços de composição, cabeçalhos/rodapés e logotipos não são
  reproduzidos. Consultar o DOCX original para a apresentação e a numeração.
- A estrutura numerada foi conferida visualmente e está registrada em
  [REVISAO_DA_DUPLA.md](../../REVISAO_DA_DUPLA.md).
- O original foi inspecionado em 29 páginas renderizadas, sem alterações.
  A extração não substitui a preservação do DOCX.
- O SHA-256 do original está no índice. Não se publicou o binário com os nomes
  pessoais e seus metadados.

## Início do conteúdo extraído

UNIVERSIDADE ESTADUAL DO MARANHÃO

PROGRAMA DE FORMAÇÃO PROFISSIONAL TECNOLÓGICA

CURSO SUPERIOR EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS

AUTOR 2

AUTOR 1

DESENVOLVIMENTO DE UMA PLATAFORMA WEB INTERATIVA PARA APOIO À SEGURANÇA DO TRABALHO (Título provisório)

ITAPECURU MIRIM - MA

2026

AUTOR 2

AUTOR 1

DESENVOLVIMENTO DE UMA PLATAFORMA WEB INTERATIVA PARA APOIO À SEGURANÇA DO TRABALHO (Título provisório)

Monografia apresentada ao Programa PROFITEC/UEMA/Itapecuru Mirim da como parte dos requisitos necessários para obtenção do grau Tecnólogo em Análise e Desenvolvimento de Sistemas.

Orientador(a): Prof(a). Me. ORIENTADORA 

.

ITAPECURU MIRIM - MA

2026

## resumo


Palavras-chaves:

## abstract


Keywords:

SUMÁRIO

## INTRODUÇÃO

A Segurança e Saúde no Trabalho (SST) é fundamental para o desenvolvimento sustentável das empresas e para garantir a dignidade humana no ambiente laboral. Mais do que cumprir exigências burocráticas, estruturar um ambiente seguro reflete o compromisso ético e social com a força produtiva. Como a busca constante por produtividade e as inovações tecnológicas introduzem novos riscos operacionais, as respostas preventivas precisam ser cada vez mais sofisticadas. Sem uma gestão eficiente de SST, as consequências vão além de sanções financeiras, refletindo-se na perda de vidas e na queda da qualidade de vida dos trabalhadores.

Apesar do avanço das políticas de proteção e da consolidação de normas específicas nas últimas décadas, o Brasil ainda apresenta altos índices de doenças ocupacionais e acidentes típicos. Entre 2012 e 2021, o país registrou mais de seis milhões de acidentes de trabalho (CANTAVE; DERROSSO; REIS, 2023). Apenas no ano seguinte, o observatório SmartLab (2023) contabilizou 2.538 óbitos relacionados ao ambiente laboral. Esse volume evidencia uma grave crise de saúde pública e de gestão de riscos nos setores industrial e de serviços. Além disso, estimativas do próprio SmartLab, baseadas em dados do Instituto Nacional do Seguro Social (INSS), apontam que o Brasil ocupa a segunda posição no ranking de mortalidade ocupacional entre os países do G20. Esse cenário é agravado por uma taxa de subnotificação próxima a 21,6% no período de 2012 a 2021, o que mascara a real dimensão do problema (SMARTLAB, 2022).

Além dos acidentes, o adoecimento progressivo é um fator crítico. As Lesões por Esforços Repetitivos e os Distúrbios Osteomusculares Relacionados ao Trabalho (LER/DORT), por exemplo, representaram 11,19% de todos os benefícios concedidos pelo INSS em 2017. Essas patologias causam graves impactos biopsicossociais, muitas vezes incapacitando o trabalhador de forma permanente, e geram prejuízos ao já deficitário sistema previdenciário (BITENCOURTE, 2020). Mais do que uma questão econômica, a ocorrência de incidentes laborais fere a dignidade humana, violando direitos constitucionais fundamentais à vida, à saúde e à integridade psicofísica (EIDT, 2017). Portanto, assegurar um meio ambiente de trabalho salubre deixa de ser apenas uma demanda individual e consolida-se como um direito coletivo, que exige atuação do Estado e da sociedade.

A preocupação com os impactos do trabalho sobre o corpo humano, no entanto, não é um fenômeno recente. Registros do Antigo Egito, como o Papiro Anastasi V (cerca de 1.800 a.C.), já relatavam os males decorrentes do esforço físico severo (BARBOSA; BARSANO, 2018). Mais tarde, na Antiguidade, estudiosos como Hipócrates (ROCHA, 1999) e Plínio, o Velho (BARBOSA; BARSANO, 2018), realizaram as primeiras descrições clínicas de patologias ocupacionais. Essas observações iniciais foram essenciais para o reconhecimento de que a forma como o ser humano interage com o trabalho pode deteriorar sua própria saúde.

No âmbito global, um avanço significativo foi a criação da Organização Internacional do Trabalho (OIT), cujo objetivo central é promover oportunidades, garantir o acesso a um trabalho decente e assegurar condições de liberdade e segurança aos trabalhadores (ILO, 2007). Desde a sua fundação, a instituição atua na articulação entre governos, empregadores e sindicatos para estabelecer normas mais seguras e justas. Suas convenções e recomendações continuam ditando as diretrizes que formam a base legislativa de diversos países.

No Brasil, a regulação sobre o tema evoluiu impulsionada pelas pressões da industrialização. Após iniciativas pontuais no final do Império, como o Decreto nº 1.313/1891 (sobre o trabalho de menores), o país publicou sua primeira lei sobre o tema em 1919. O Decreto nº 3.724 passou a responsabilizar os empregadores pelos acidentes e infortúnios laborais. O grande marco, no entanto, veio na Era Vargas, com a promulgação da Consolidação das Leis do Trabalho (CLT) em 1943. A CLT estruturou as bases de proteção à integridade física do obreiro, sustentando a regulação trabalhista contemporânea (CAMISASSA, 2015).

Mais tarde, a legislação brasileira ganhou maturidade técnica com a Lei nº 6.514, de 1977, que alterou o Capítulo V da CLT e modernizou a prevenção de acidentes e a proteção à saúde ocupacional (MURBACH, 2019). Essa legislação, aliada às exigências da OIT, viabilizou a Portaria nº 3.214/1978, responsável por aprovar as primeiras Normas Regulamentadoras (NRs) (MURBACH, 2019). Com isso, orientações técnicas transformaram-se em obrigações legais para todos os empregadores regidos pela CLT.

Atualmente, as NRs representam a base da gestão de segurança no país. O Brasil dispõe de 38 normas vigentes, de observância obrigatória por empregadores e empregados (PEIXOTO, 2010), que variam desde diretrizes gerais, como o Gerenciamento de Riscos Ocupacionais (NR-1) e as Comissões Internas de Prevenção de Acidentes (NR-5), até orientações rigorosas para setores específicos, a exemplo da NR-18 na Construção Civil (MURBACH, 2019) e da NR-17 sobre ergonomia (BITENCOURTE, 2020). Complementando esse arcabouço, a Política Nacional de Segurança e Saúde no Trabalho (PNSST), instituída em 2011, reafirma o papel do Estado na promoção de uma cultura de prevenção contínua (CANTAVE; DERROSSO; REIS, 2023).

Apesar desse aparato legal robusto, a segurança não se materializa apenas com a publicação de normas; ela depende da atuação de profissionais especializados em campo. Nas empresas brasileiras, a estrutura responsável por essa aplicação é o Serviço Especializado em Engenharia de Segurança e em Medicina do Trabalho (SESMT), regulamentado pela NR-4 (LOPES, 2013). Atuando em conjunto com a Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA), atualizada e prevista na NR-5 (OLIVEIRA, 2025), o SESMT funciona como o principal fiscalizador nas indústrias, conectando a teoria das leis à realidade dos canteiros de obras e do chão de fábrica.

A equipe do SESMT exerce funções de alta criticidade. O Engenheiro de Segurança do Trabalho atua nos níveis tático e gerencial, cuidando do planejamento, das avaliações quantitativas de riscos ambientais, da assinatura de laudos periciais e do desenho dos sistemas de gestão (SILVA et al., 2025). O Técnico de Segurança do Trabalho, por sua vez, opera na linha de frente, conduzindo inspeções rotineiras, Diálogos Diários de Segurança (DDS), verificação de Equipamentos de Proteção Individual (EPI) e paralisando atividades de risco iminente (LOPES, 2013). Paralelamente, os gestores de produção e a engenharia devem tomar decisões alinhadas ao SESMT, demonstrando que a segurança não é um departamento isolado, mas uma cultura transversal (LUCENA, 2019).

É nessa rotina dinâmica que a gestão da informação costuma se tornar um ponto de fragilidade. O padrão de mercado ainda é amplamente baseado no uso de papel, pranchetas e formulários impressos para o registro de inspeções (LOPES, 2013). Essa prática exige a transcrição posterior dos dados para planilhas virtuais, abrindo espaço para falhas humanas, ilegibilidade e atrasos operacionais. As consequências diretas são a perda constante de históricos, a fragmentação de documentos e a dificuldade de auditar informações com rapidez (LOPES, 2013; SILVA et al., 2025). Trata-se de um modelo que fomenta uma postura reativa, na qual os gestores frequentemente tomam decisões apenas após a ocorrência de um acidente (LOPES, 2013).

Diante dessas limitações, a transformação digital surge não apenas como uma facilidade administrativa, mas como um mecanismo essencial de prevenção. A digitalização das rotinas de SST muda a forma como técnicos e auditores monitoram o ambiente laboral. O uso de dispositivos móveis com aplicativos e checklists digitais permite coletar dados no local exato da inspeção (LOPES, 2013). Funcionalidades como a anexação de fotografias e a marcação de coordenadas (GPS) garantem rastreabilidade às ocorrências. Em setores complexos como a Construção Civil, essa automação acelera a geração de relatórios de não conformidades, eliminando o ciclo de retrabalho do modelo analógico (MURBACH, 2019).

Além da coleta em campo, a tecnologia permite centralizar esses dados por meio de sistemas web integrados. A exibição dessas informações em dashboards dinâmicos oferece aos engenheiros e gestores uma visão panorâmica e em tempo real dos canteiros. Os impactos dessa modernização já são descritos na literatura: a análise da implementação de um sistema piloto em uma indústria metalúrgica demonstrou uma redução de quase 50% no tempo de resposta gerencial aos riscos detectados (SILVA et al., 2025), confirmando que a agilidade no fluxo de dados pode efetivamente salvar vidas.

A modernização abrange também a capacitação dos operários. Tecnologias da Indústria 4.0, como ambientes de Realidade Virtual (RV) e gamificação, estão transformando as metodologias de ensino corporativo. Essas abordagens permitem que os trabalhadores vivenciem simulações de risco e internalizem protocolos de segurança de forma controlada, desenvolvendo memória técnica sem se exporem aos perigos reais de quedas ou choques (LUCENA, 2019). A digitalização da área consolida-se, portanto, como um movimento amplo, que vai desde o controle documental até a educação no chão de fábrica.

O levantamento de soluções disponíveis na literatura confirma que a informatização da SST está em fase de consolidação. Ferramentas contemporâneas atestam a viabilidade técnica da automação de relatórios e do uso de checklists padronizados. Iniciativas como o SST Hub — plataforma web focada em ampliar o acesso a conteúdos da área (MORAIS et al., 2026) — e o Sistema Especialista em Segurança do Trabalho (SEST) — voltado ao auxílio automatizado na tomada de decisão (TOPDJIAN et al., 2016) — exemplificam esse movimento. Essas aplicações provam que substituir pranchetas por tablets assegura fluidez à coleta de dados, mesmo diante das pressões da rotina industrial.

No entanto, a pesquisa bibliográfica revela lacunas práticas que merecem atenção. Grande parte das aplicações atuais apresenta limitações de usabilidade ou fragmentação das informações (MORAIS et al., 2026). Além disso, plataformas comerciais mais completas costumam ter custos proibitivos para micro e pequenas empresas (MPEs), ou então desvinculam o registro da auditoria do texto integral das Normas Regulamentadoras. A ausência de uma ferramenta com bom projeto de experiência do usuário (UX), que unifique consulta legal, gestão de EPIs/EPCs e emissão de relatórios responsivos, representa uma clara oportunidade de desenvolvimento tecnológico.

A partir desse contexto, fundamenta-se o problema de pesquisa deste trabalho. O objetivo geral é desenvolver uma plataforma web responsiva para apoiar os profissionais de Segurança e Saúde no Trabalho na execução de inspeções e fiscalizações. A proposta visa digitalizar e sistematizar a coleta, o gerenciamento e o acompanhamento de dados laborais, rompendo com as limitações da gestão analógica.

Espera-se que o sistema proporcione maior agilidade e rastreabilidade às operações, elevando a auditoria a um patamar preventivo e aderente às NRs. Por fim, o projeto converge com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU, especificamente ao dialogar com o ODS 3 (saúde e bem-estar) e contribuir para as metas do ODS 8 (trabalho decente e crescimento econômico), promovendo ambientes laborais mais seguros e livres de riscos iminentes.

## OBJETIVOS

###  Objetivo geral 

Desenvolver uma plataforma web responsiva para apoiar profissionais de Segurança e Saúde no Trabalho na realização de inspeções e fiscalizações, por meio da digitalização dos processos de coleta, gerenciamento e acompanhamento de informações, contribuindo para maior eficiência, rastreabilidade e conformidade com as Normas Regulamentadoras.

###  Objetivos específicos

Dado o objetivo geral deste trabalho, puderam ser identificados os seguintes objetivos específicos:

Realizar um levantamento bibliográfico e tecnológico sobre Segurança e Saúde no Trabalho, inspeções, fiscalizações e soluções digitais aplicadas ao setor, identificando limitações e oportunidades de melhoria;

Levantar os requisitos funcionais e não funcionais da plataforma, considerando as necessidades dos profissionais de Segurança e Saúde no Trabalho;

Projetar a arquitetura e a modelagem da plataforma, contemplando banco de dados, perfis de usuários, fluxo das inspeções e mecanismos de armazenamento e sincronização das informações;

Implementar uma plataforma web responsiva baseada em arquitetura Progressive Web App (PWA), com suporte ao funcionamento Offline-First, permitindo a realização de inspeções mesmo em ambientes com acesso limitado à internet;

Avaliar a plataforma desenvolvida quanto à sua capacidade de apoio às atividades de inspeção e fiscalização, analisando sua aderência aos requisitos definidos e sua contribuição para a melhoria da gestão das informações em Segurança e Saúde no Trabalho.

## REFERENCIAL TEÓRICO

A construção de uma solução tecnológica voltada às necessidades dos profissionais de segurança do trabalho exige uma base conceitual sólida. Este capítulo fundamenta a pesquisa e estabelece a perspectiva pela qual o problema do gerenciamento de informações nas inspeções e fiscalizações é analisado. Para organizar a discussão, adotou-se o método do funil: o texto parte de uma visão ampla sobre a proteção do ambiente de trabalho e a gestão de riscos, afunilando para o papel das normas e das inspeções rotineiras. Em seguida, aborda-se a produção de dados em campo, as limitações dos processos analógicos e a transformação digital como resposta a esses gargalos. Por fim, o capítulo alinha as necessidades da área aos fundamentos da Engenharia de Software e analisa os trabalhos relacionados, evidenciando a lacuna que justifica o desenvolvimento da plataforma proposta.

### Segurança e Saúde no Trabalho (SST)

A Segurança e Saúde no Trabalho (SST) é um campo multidisciplinar focado na preservação da integridade física, mental e social dos trabalhadores. Mais do que um conjunto de procedimentos técnicos, a área atua diretamente na garantia de um meio ambiente laboral seguro, considerado por Eidt (2017) como uma vertente indissociável do direito ao meio ambiente ecologicamente equilibrado. Trata-se da proteção de bens jurídicos essenciais: a vida, a saúde e a integridade psicofísica. Portanto, a ocorrência de doenças e acidentes ocupacionais não representa apenas uma falha produtiva, mas uma violação direta à dignidade humana (EIDT, 2017), cabendo à SST garantir que o trabalho atue como um vetor de desenvolvimento, e não de adoecimento.

Para garantir a salubridade, a SST baseia-se na prevenção e na gestão de riscos. Oliveira (2025) destaca que esse gerenciamento exige processos sistemáticos de identificação de perigos, avaliação e adoção de medidas de controle. O autor reforça que a prevenção segue uma hierarquia rigorosa: a prioridade absoluta é eliminar o risco na fonte; caso seja inviável, busca-se a minimização por meio de proteções coletivas e medidas administrativas, deixando os Equipamentos de Proteção Individual (EPIs) apenas como última barreira defensiva (OLIVEIRA, 2025). Essa dinâmica entre identificar, avaliar e controlar forma o núcleo da cultura preventiva nas organizações.

Historicamente, a forma de compreender como esses riscos se transformam em acidentes passou por diferentes modelos teóricos. Um dos mais influentes é o Modelo Causal de Perdas, formulado por Frank Bird Jr. e George Germain. Conforme discutido por Lopes (2013), esse modelo — frequentemente chamado de sequencial ou dominó — entende que as perdas não são eventos aleatórios, mas o fim de uma cadeia de falhas previsíveis. A sequência começa na "falta de controle" administrativo, que permite o surgimento de "causas básicas" (fatores pessoais ou do trabalho). Estas geram as "causas imediatas" (condições ou atos inseguros visíveis), culminando no acidente (LOPES, 2013). Nessa visão, o incidente é tratado como um sintoma de um sistema de gestão ineficaz, e não como mera fatalidade.

Contudo, a complexidade dos ambientes de trabalho modernos exigiu uma ampliação dessa visão, dando espaço às abordagens sistêmicas. O modelo de Erik Hollnagel, apresentado por Lucena (2019), argumenta que acidentes em sistemas complexos não decorrem necessariamente de uma quebra isolada de componentes, mas da variabilidade inerente ao desempenho humano e organizacional. As mesmas interações e ajustes diários que fazem a empresa funcionar podem, sob certas condições, resultar em falhas (LUCENA, 2019). A prevenção, nesse caso, não se resume a procurar uma "causa-raiz" isolada após o fato, mas a monitorar a variabilidade do ambiente e fortalecer a resiliência do sistema como um todo.

O diálogo entre essas duas perspectivas teóricas embasa o raciocínio desta pesquisa. Enquanto o modelo clássico de Bird evidencia a necessidade de estruturação e controle gerencial, a abordagem de Hollnagel alerta para a constante variabilidade e complexidade do ambiente. Fica claro, portanto, que a prevenção não pode ser um ato pontual ou exclusivamente reativo. Para suprir a falta de controle e monitorar as variações do dia a dia, as organizações precisam de mecanismos contínuos e sistemáticos de verificação. É exatamente aí que as diretrizes legais e as rotinas de inspeção se tornam ferramentas indispensáveis.

### Normas Regulamentadoras e inspeções

No Brasil, os parâmetros técnicos e administrativos de segurança são ditados pelas Normas Regulamentadoras (NRs). Criadas para detalhar os dispositivos da Consolidação das Leis do Trabalho (CLT), as NRs são de cumprimento obrigatório pelas empresas e estruturam a forma como a prevenção deve ocorrer na prática (EIDT, 2017; MORAIS et al., 2026). A NR-1, por exemplo, estabelece o Programa de Gerenciamento de Riscos (PGR), exigindo inventários atualizados e planos de ação (SILVA et al., 2025). Normas complementares definem desde a infraestrutura preventiva — como o SESMT (NR-4) e a CIPA (NR-5) — até o controle de exposições e o uso de EPIs (MORAIS et al., 2026).

Para garantir que esse complexo planejamento normativo seja executado, o ambiente laboral exige avaliações constantes. É preciso, no entanto, diferenciar as atividades de fiscalização e inspeção, que possuem naturezas distintas. A fiscalização, conforme pontua Eidt (2017), é uma atividade de Estado conduzida por Auditores Fiscais do Trabalho, dotada de poder de polícia administrativa. Ela atua de fora para dentro, com caráter coercitivo e regulatório, podendo punir infrações ou adotar uma postura orientadora em pequenas empresas (EIDT, 2017).

Em contrapartida, a inspeção de segurança é um instrumento interno e proativo. Realizada pelos membros do SESMT, da CIPA ou pelas lideranças do setor, a inspeção monitora o ambiente para detectar desvios operacionais e condições inseguras antes que gerem acidentes (LOPES, 2013). Como as NRs impõem centenas de requisitos técnicos, confiar apenas na memória visual do avaliador durante as rondas é ineficaz. Surge, então, a necessidade de adotar o checklist (lista de verificação).

Murbach (2019) define o checklist como uma ferramenta estruturada para checar a aplicação prática de prescrições normativas. Ao transformar os textos densos das normas em perguntas objetivas ("A máquina possui proteção nas partes móveis?"), o instrumento permite que o profissional documente rapidamente o que está conforme e o que precisa ser ajustado. Cria-se, assim, um fluxo direto: a norma exige o requisito; a inspeção o verifica; o checklist documenta; e a não conformidade identificada passa a exigir monitoramento para correção (MURBACH, 2019).

Essa dinâmica leva a uma constatação central para a presente pesquisa: a partir do momento em que a equipe técnica inspeciona o ambiente rotineiramente, ela passa a gerar um volume denso e contínuo de dados. Se a gestão preventiva depende do rastreamento histórico dessas falhas e correções, a forma como essas informações são coletadas, armazenadas e recuperadas torna-se o verdadeiro diferencial para o sucesso do programa de SST.

### Transformação digital na SST

A gestão preventiva depende, fundamentalmente, da produção e da análise de dados. As inspeções e auditorias geram informações que precisam ser transformadas em ações corretivas rápidas. Contudo, o modelo de gerenciamento tradicional tem se mostrado analógico e incompatível com a velocidade da indústria atual. Lopes (2013) destaca que a coleta de dados no chão de fábrica ainda é feita, majoritariamente, com pranchetas e formulários impressos, exigindo que o profissional arquive os documentos físicos e transcreva as informações manualmente para planilhas em computadores de mesa.

As limitações desse fluxo convencional são bem estabelecidas na literatura. A transcrição de dados abre espaço para erros e retrabalho (LOPES, 2013), enquanto o armazenamento descentralizado em planilhas isoladas dificulta o cruzamento de históricos e inviabiliza a geração de indicadores em tempo real. Pior ainda, a fragmentação prejudica a rastreabilidade: uma anotação em papel pode se perder, atrasando a correção do problema e prolongando a exposição do trabalhador ao risco. Na prática, conhecer a norma não é suficiente; a ineficiência no trânsito da informação pode comprometer todo o esforço preventivo.

Nesse cenário, a transformação digital atua como uma reconfiguração da arquitetura informacional da segurança do trabalho. A digitalização permite coletar registros diretamente na fonte, armazená-los em nuvem e gerar relatórios automaticamente, garantindo rastreabilidade desde a identificação do problema até a sua solução (SILVA et al., 2025). Essa mudança ataca diretamente o gargalo do modelo tradicional, convertendo dados dispersos em painéis de apoio à decisão.

A eficácia dessa transição possui comprovação empírica. Ao analisarem a implementação de um sistema informatizado para controle de riscos em uma metalúrgica, Silva et al. (2025) observaram que a tecnologia reduziu em quase 50% o tempo de resposta a riscos críticos, quando comparado ao método analógico anterior. Além da agilidade, a centralização dos dados melhorou a integração entre os setores operacionais e o SESMT, indicando que a tecnologia não substitui o profissional, mas potencializa sua capacidade de agir a tempo (SILVA et al., 2025).

Apesar dos benefícios claros, o sucesso dessas ferramentas depende de como elas se adaptam à rotina dos usuários. Técnicos e engenheiros não inspecionam canteiros de obras sentados em escritórios (MORAIS et al., 2026; MURBACH, 2019). Sistemas complexos, projetados apenas para monitores desktop, costumam falhar ao serem levados para o campo. Morais et al. (2026) ressaltam que plataformas de SST modernas exigem alto nível de responsividade — a capacidade técnica da interface de se adaptar organicamente a telas de smartphones e tablets. Aliada a isso, a usabilidade bem aplicada reduz a carga cognitiva da ferramenta, permitindo que o profissional foque sua atenção no que realmente importa: identificar o perigo no ambiente, e não lutar para preencher um software engessado.

Compreende-se, portanto, que a necessidade das empresas não é apenas documentar informações, mas dispor de um ecossistema móvel e integrado que viabilize todo o ciclo da inspeção. Para materializar essa solução de forma escalável e segura, a pesquisa fundamenta-se nos preceitos da Engenharia de Software.

### Engenharia de software aplicada à solução

Levar processos sensíveis da Segurança do Trabalho para o ambiente digital exige extremo rigor metodológico. O desenvolvimento de ferramentas sem embasamento pode resultar em softwares instáveis e com falhas na integridade dos dados — o que, no contexto prevencionista, pode significar a falha em evitar um acidente. Por essa razão, a plataforma web proposta neste trabalho ancora-se nas bases teóricas e práticas da Engenharia de Software.

Guerra (2020) define a área como a disciplina computacional que aplica abordagens sistemáticas, estruturadas e quantificáveis a todo o ciclo de vida de um sistema, desde a especificação até a manutenção. Três pilares dessa disciplina justificam as decisões deste projeto: engenharia de requisitos, arquitetura e atributos de qualidade.

O processo começa com a engenharia de requisitos, cuja função é mapear com precisão o que o sistema deve fazer (GUERRA, 2020). Para a plataforma de SST, os requisitos nascem da necessidade real do campo: digitalizar checklists baseados nas NRs, garantir acesso seguro, anexar evidências fotográficas e emitir relatórios rastreáveis. Se essa etapa for mal conduzida, o software entregue pode ser tecnicamente impecável, mas sem nenhuma utilidade prática para o técnico.

O segundo pilar é a definição da arquitetura (GUERRA, 2020). A escolha por desenvolver uma plataforma baseada na web (modelo cliente-servidor em nuvem) atende diretamente à necessidade de centralização e mobilidade discutida anteriormente. Com essa arquitetura, um técnico pode preencher um formulário pelo celular no pátio da indústria e o gestor consegue visualizar o resultado imediatamente em um painel (dashboard) no escritório, eliminando instalações locais e sincronizações manuais.

Por fim, foca-se nos atributos de qualidade não funcionais. Guerra (2020) explica que características como usabilidade (apoiando as ideias de Morais et al., 2026), confiabilidade e manutenibilidade são essenciais para a sobrevivência do produto. Na gestão de SST, a confiabilidade garante que o histórico de uma inspeção crítica não seja corrompido, enquanto a manutenibilidade permite que o código da plataforma seja facilmente atualizado caso o governo publique uma alteração legal nas Normas Regulamentadoras. A Engenharia de Software funciona, assim, como o arcabouço técnico que garante que o projeto cumpra seu objetivo prevencionista.

#### Tecnologias utilizadas 

(Seção reservada para a descrição das linguagens, frameworks e bancos de dados)

#### Trabalhos relacionados

Para comprovar a relevância tecnológica e científica deste projeto, é essencial analisar soluções prévias que tentaram resolver o gargalo informacional da SST. A revisão dos trabalhos relacionados ajuda a compreender o nível atual das ferramentas disponíveis, identificar padrões na comunidade acadêmica e evidenciar as limitações práticas que justificam a construção desta nova plataforma.

Murbach (2019) focou no desenvolvimento de um aplicativo móvel voltado à verificação e fiscalização da segurança. O autor comprovou que a coleta móvel de dados substitui eficientemente os antigos cadernos em canteiros de obras. A limitação da sua ferramenta, porém, está no escopo: por ser desenhada exclusivamente para os requisitos da NR-18 (Construção Civil), a solução apresenta pouca flexibilidade, não permitindo que profissionais de outros ramos industriais criem checklists personalizados.

Lopes (2013) foi precursor ao estudar o uso de smartphones para mapear condições inseguras, baseando-se no modelo de causalidade de perdas. O estudo teve o mérito de identificar o registro em papel como um problema sistêmico, sugerindo o envio de dados diretamente para o SESMT. A principal barreira desse trabalho hoje é a natural defasagem tecnológica, visto que as soluções arquiteturais e os padrões de usabilidade adotados na época já não correspondem à fluidez, integração em nuvem e responsividade exigidas pelos sistemas web atuais.

Em uma abordagem contemporânea e focada no mundo corporativo, Silva et al. (2025) criaram um sistema colaborativo de controle de riscos para o setor metalúrgico. A solução se destaca por alinhar-se à gestão macro exigida pela nova NR-1, conseguindo reduzir pela metade o tempo de resposta aos perigos mapeados na matriz de riscos da corporação. No entanto, por ser um software robusto voltado à estrutura interna de uma indústria pesada, a ferramenta carece de mecanismos ágeis para auditorias rápidas e generalistas — cenário comum para consultores de SST ou gestores de micro e pequenas empresas (MPEs).

Já Morais et al. (2026) priorizaram a acessibilidade ao desenvolverem o "SST Hub", uma plataforma web responsiva voltada à educação e democratização da informação normativa. O trabalho emprega excelentes conceitos de usabilidade e interface, oferecendo teias de acesso às legislações e especialistas. Sua limitação para o problema desta pesquisa, no entanto, é o caráter estritamente consultivo. O SST Hub não oferece funcionalidades operacionais em campo, como formulários de inspeção, registro in loco ou dashboards de acompanhamento de riscos.

A análise dessas iniciativas revela uma clara lacuna metodológica e tecnológica no ecossistema de soluções para a área. Observa-se que aplicativos voltados à inspeção de campo (como os de Murbach e Lopes) costumam ficar restritos a uma norma específica ou esbarram em limitações de arquiteturas legadas. Paralelamente, sistemas industriais modernos (Silva et al.) focam de forma densa nas matrizes de risco de grandes corporações, enquanto as ferramentas web mais intuitivas (Morais et al.) limitam-se à consulta educativa.

Falta, portanto, uma solução tecnológica equilibrada e generalista. Identifica-se a necessidade de uma plataforma que ofereça a usabilidade e a acessibilidade dos sistemas web responsivos modernos não apenas para fins educacionais, mas como motor ativo de gerenciamento operacional. Uma ferramenta que permita a profissionais de qualquer setor configurar e aplicar checklists dinâmicos baseados em múltiplas NRs em campo, garantindo armazenamento estruturado e rastreabilidade integral, sem a complexidade excessiva de softwares industriais pesados. É exatamente sobre essa lacuna que a presente pesquisa se posiciona, unindo a necessidade inadiável de gestão da prevenção à capacidade organizadora da Engenharia de Software contemporânea.

## METODOLOGIA

### Projeto do sistema

Levantamento de requisitos

Personas

Casos de Uso

Arquitetura

Modelagem do banco

Protótipos

### Desenvolvimento da plataforma 

Implementação

Funcionalidades

Integração dos componentes

## RESULTADOS E DISCUSSÃO

## CONCLUSÃO

## REFERÊNCIAS


BARSANO, P.R.; BARBOSA, R.P. Segurança do trabalho: guia prático e didático. 2. ed. São Paulo: Érica/Saraiva, 2018. 


BITENCOURTE, Adakrishna Sampaio Saraiva. [Título do trabalho a confirmar]: [subtítulo a confirmar]. 2020. [Total de folhas] f. Dissertação (Mestrado) – Universidade do Estado do Rio de Janeiro, [Local a confirmar], 2020.

CAMISASSA, Mara Queiroga. Segurança e saúde no trabalho: NRs 1 a 36 comentadas e descomplicadas. São Paulo: Método LTDA, 2015. Disponível em: http://www,norminha,net,br/Normas/Arquivos/NR-1-36Comentadaedescomplicad a,pdf,pdf. Acesso em: 02 out. 2026. 

CANTAVE, Jerry; DERROSSO, Giuliano; REIS, Waneska Cavalcante Ferreira de Albuquerque. Acidentes de trabalho no Brasil: análise temporal de 2012 a 2021. B Téc Senac, Rio de Janeiro, v. 49, e23009, 2023 


EIDT, Dilnei José. A fiscalização das normas regulamentadoras da segurança e saúde do trabalho no âmbito das microempresas e empresas de pequeno porte - MPE. 2017. 288 f. Dissertação (Mestrado em Direito) – Universidade Comunitária da Região de Chapecó, Chapecó, 2017 


ILO, International Labor Organization. Promoting Decent Work in Construction and Related Services: The Key Role of Local Authorities. Final Report 2007. Geneva International Academic Network. 2007. Disponível em: . Acesso em: 02 out. 2026 

LOPES, Paulo Richard Sicca. [Título do trabalho a confirmar]: [subtítulo a confirmar]. 2013. [Total de folhas] f. Monografia (Especialização em Engenharia de Segurança do Trabalho) – Universidade Federal do Rio Grande do Sul, [Local a confirmar], 2013.

LUCENA, Arthur Felipe Echs. Desenvolvimento de recursos baseados em jogos e realidade virtual para capacitação em segurança do trabalho de gestores da construção civil. 2019. 174 f. Dissertação (Mestrado em Engenharia Civil) – Universidade Estadual de Londrina, Londrina, 2019 

MORAIS, Amanda Ferreira de; ALMEIDA, Cainã Carreira de; PIRES, Diego Donizeti da Silva; GUIMARÃES, Natanael Victor Rodrigues; BLASQUES, Victor Araujo. SST Hub: sistema de planejamento e consulta de segurança do trabalho. 2026. 34 f. Trabalho de Conclusão de Curso (Técnico em Desenvolvimento de Sistemas) – Etec "Orlando Quagliato", Centro Estadual de Educação Tecnológica Paula Souza, Santa Cruz do Rio Pardo, 2026.

MURBACH, Tiago. Desenvolvimento de uma ferramenta de verificação para gestão e fiscalização da segurança do trabalho na Indústria da Construção. 2019. 120 f. Monografia (Especialização em Engenharia de Segurança do Trabalho) – Universidade Tecnológica Federal do Paraná, Curitiba, 2019 

OLIVEIRA, Israel Chagas de. [Título do trabalho a confirmar]: [subtítulo a confirmar]. 2025. [Total de folhas] f. Dissertação (Mestrado) – Instituto de Economia, Universidade Estadual de Campinas, [Local a confirmar], 2025.

PEIXOTO, N. H. Curso técnico em automação industrial: segurança do trabalho. – 3. ed. – Santa Maria: Universidade Federal de Santa Maria: Colégio Técnico Industrial de Santa Maria, 2010. 128 p. 

ROCHA, C.A.G.S.C. Diagnóstico do cumprimento da NR-18 no subsetor edificações da construção civil e sugestões para melhoria da gestão da segurança e saúde ocupacional nas empresas da construção civil. 148 p. Dissertação de Mestrado em Engenharia Civil, Universidade Federal do Rio Grande do Sul. Porto Alegre – RS, 1999. 


SILVA, Bruno Alves Matias da; GONÇALVES, Danielle Pedrosa; CALDAS, Quezia Varanda Soares Martins; BRAGA, Enilson Salino. Desenvolvimento de sistema de controle de risco na engenharia de segurança do trabalho. Revista Ibero-Americana de Humanidades, Ciências e Educação, São Paulo, v. 11, n. 8, p. 1179-1193, ago. 2025. DOI: 10.51891/rease.vni8.20589.

SMARTLAB – Observatório de Segurança e Saúde no Trabalho. Estatísticas nacionais de acidentes de trabalho. Disponível em: https://smartlabbr.org/sst. Acesso em: 02 out. 2026. 

SMARTLAB. Observatório Digital de Saúde e Segurança no Trabalho. 2022. Disponível em: https://smartlabbr,org/. Acesso: 02 out. 2026. 

TOPDJIAN, Ulysses; MACIEL, Joylan Nunes; MALETZKE, André Gustavo; NADAI, Barbara Lepretti de; SCHAEFER, Ricardo Luís. Análise de ferramentas e tecnologias de desenvolvimento de software para dispositivos móveis: estudo de caso aplicado à implementação de um sistema especialista na área de segurança do trabalho. [Nome do Periódico ou Evento a confirmar], [Local de publicação a confirmar], p. 460-464, 2016.

VALENTE, Marco Tulio. Engenharia de Software Moderna: princípios e práticas para desenvolvimento de software com produtividade. [Local a confirmar]: Editora: Independente, 2020. 

APÊNDICE A - Mesa de trabalho do supervisor de estágio

APÊNDICE B - Mesa de trabalho do supervisor de estágio

APÊNDICE C - Mesa de trabalho do supervisor de estágio
