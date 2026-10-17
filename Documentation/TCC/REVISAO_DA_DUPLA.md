# Apoio à revisão da dupla

Atualizado em **16/10/2026**, após conciliação, verificação das novas referências e
redação das seções autorizadas. A entrega principal está em
[monografia-trabalho.docx](./redacao/monografia-trabalho.docx); os novos trechos,
em [secoes-redigidas.md](./redacao/secoes-redigidas.md). Este auxiliar distingue
conciliações concluídas, lacunas delimitadas e montagem final. Não é um parecer
geral sobre a monografia nem uma nova auditoria da aplicação.

A orientação posterior do autor foi incorporada: **SUS não foi aplicado e não
integra a monografia, nem como explicação sobre ausência de escore**. A menção
histórica permanece somente nos registros auxiliares. O instrumento descrito é
o questionário próprio de 14 questões de PES-002, com quatro avaliações.

## Entrada, escopo e versão descrita

- Entrada preservada: [monografia-atual.docx](./fontes/monografia/docx/monografia-atual.docx),
  SHA-256 `474dbdd725b191a7d8853f3e954d9f3626d2bbcecd5bdc3d773b69846ab6fe77`.
  Nomes, logos e formatação recebida foram conservados. MONO-001 e fontes
  anonimizadas de pesquisa não foram sobrescritos.
- Branch documental: `docs/coleta-fontes-tcc`; HEAD da entrada documental:
  `c67b4d8eeb323f361b606fef1abdfdc3701b4bed`. Nenhuma mudança de código nesta tarefa.
- Estado técnico: integração `819c35a582f2e1e799d6ae71857d2dd4706723ed`, com as
  correções incorporadas até **13/10/2026**. O último commit de implementação
  considerado é `6dba3697813b0a33979ef7e0461374b41e07bc61`. A branch documental não
  altera `src`, `prisma`, `public` ou a arquitetura em relação à integração.
  Isso identifica o repositório descrito, não certifica a versão implantada.
- Pesquisa: percurso de maio a outubro de 2026; avaliação da versão preliminar
  de **28 a 31/08/2026**, distinta do estado técnico final.

| Seção efetiva do DOCX | Intervenção concluída |
| --- | --- |
| 3.4 Engenharia de software aplicada à solução | Acrescentados dois parágrafos sobre requisitos e níveis de teste. Os cinco parágrafos anteriores foram mantidos. |
| 3.4.1 Tecnologias utilizadas | Substituído o marcador por tecnologias, funções e justificativas verificadas. |
| 3.4.2 Trabalhos relacionados | Preservada integralmente; este é o título real, embora os acordos também empreguem “correlatos”. |
| 4 Metodologia | Redigidos enquadramento, período, fontes, participantes, instrumentos e procedimentos de análise. |
| 4.1 Projeto do sistema | Relacionados necessidades, requisitos, personas, casos de uso, arquitetura, modelos e protótipo; incluído marcador da Figura 1. |
| 4.2 Desenvolvimento da plataforma | Redigidos incrementos, integração, verificações, revisões e atuação dos autores com apoio de IA. |
| 5 Resultados e discussão | Apresentadas entregas, alcance offline e avaliação; Tabela 1 com as 13 questões fechadas e discussão da questão aberta 13. |
| 6 Conclusão | Articuladas contribuições, objetivos, alcance da avaliação e continuidade. |
| Referências | Acrescentadas apenas 13 entradas utilizadas e verificadas, sem alterar as anteriores. |

## Conciliação das fontes e pendências históricas

Fontes centrais: [retrospectiva técnica](../RetrospectivaTecnicaDesenvolvimentoSafeWatchInsight.md),
[auditoria e atualizações](../RelatorioAuditoriaTecnicaPreEscritaTCC.md),
[HUM-001](./fontes/relatos/hum-001-relato-do-desenvolvimento.md),
[ORI-001](./fontes/orientacoes/ori-001-orientacoes-da-dupla.md),
[PES-001](./fontes/pesquisa/pes-001-registros-das-entrevistas.md) e
[PES-002](./fontes/pesquisa/pes-002-avaliacao-da-plataforma.md).
As conclusões abaixo atualizam, para a redação, o estado de
[PENDENCIAS.md](./PENDENCIAS.md), sem apagar o motivo histórico de cada questão.

| Pendência / tema | Conciliação e decisão de escrita | Estado |
| --- | --- | --- |
| TCC-P001, P002, P021 — tema e período | HUM-001 situa a reunião de mudança de foco em 25/05, no contexto de 2026. Consulta às NRs permanece associada às inspeções. O período maio–outubro reúne trajetória humana e implementação; não representa calendário institucional ou data de defesa. | Resolvido para a redação. |
| TCC-P003 — necessidades e requisitos | HUM-001, DocumentoDeRequisitos.md e modelos sustentam organização dos registros, histórico e conectividade. Conferidos 22 RF e oito RNF. Não existe rastreio de fala individual para cada requisito; não se atribui aprovação formal de todos aos entrevistados. | Relação geral sustentada; rastreio individual não alegado. |
| TCC-P004 — framework | TECH_DECISIONS.md e retrospectiva confirmam preservação da base Lovable/TanStack Start. Next.js foi proposta, sem migração demonstrada. | Resolvido. |
| TCC-P005, P006, P029 — sincronização e fotos | Respostas/conclusão com persistência local e fila idempotente, conflito por revisão e upload online no Cloudinary. Não se adotou a sugestão histórica de última escrita vencer. Binários offline continuam evolução futura. | Resolvido no recorte técnico. |
| TCC-P007 — entrevistas | Três reuniões/perfis em PES-001. ENT-01: legenda 05/06, gravação indicada 04/06/2026; ENT-02: legenda 10/05, gravação 10/06/2026; ENT-03: legenda 08/05, gravação 08/06/2026. O autor favorece as datas das gravações; mídias não foram inspecionadas nesta escrita. Usa-se junho, sem fixar dias conflitantes no corpo. | Realização sustentada; discrepâncias diárias localizadas. |
| TCC-P009 — processo e IA | HUM-001 sustenta decisões, orientação de prompts, revisões, critérios de avanço e pequenas alterações manuais. ChatGPT e Codex descritos como apoio. Não inferidos TDD, SDD, Scrum ou produtividade medida. | Resolvido para a descrição. |
| TCC-P014 — primeiro protótipo | HUM-001 recorda modelos em 18/07 e envio do protótipo no dia seguinte. O Git e a retrospectiva registram base de frontend e planejamento em junho e backend em julho. O dia 19/07 não foi adotado como criação do primeiro frontend. A redação conserva a sequência de prototipação e integração, sem data exata desse marco. | Data exata não conciliada; não impede o texto. |
| TCC-P017, P037 — instrumentos | Formulário inicial é relatado em HUM-001, mas instrumento e respostas não foram localizados. PES-001 não contém roteiro integral ou transcrições. PES-002 é a avaliação posterior, com resultados utilizáveis. Não atribuídos números ou resultados ao formulário inicial. | Lacuna delimitada; avaliação conciliada. |
| TCC-P020 — instrumento de avaliação | Confirmação direta do autor: não houve aplicação de SUS. A monografia descreve somente o questionário efetivamente utilizado, sem menção histórica ou explicação de escore. | Encerrado para a redação. |
| TCC-P028, P033, P038 — avaliação e versão | Avaliação em 28–31/08; relatórios reais em 03/09, dashboard em 04/09, templates em outubro e correções até 13/10. O resumo que encerrava tudo em setembro ou antecipava relatórios para antes de agosto foi superado pelas evidências específicas. Não localizado hash exato do deploy acessado por cada participante. | Recortes conciliados; versão individual não alegada. |
| TCC-P039 — participantes | Três registros de entrevistas e quatro avaliações: estudante, técnico, engenheiro e consultor/auditor. O relato de envio a pessoas consultadas não comprova correspondência individual. Não inventada quarta entrevista nem exigida identificação pessoal. | Quantidades resolvidas; grupos tratados separadamente. |
| TCC-P018, P040, P041 — fundamentação | Prodanov/Freitas e SWEBOK consultados nos trechos indicados no auxiliar bibliográfico. PMBOK descrito como influência em aula; edição usada na disciplina não identificada. Código Limpo não incluído. Guerra/Valente permanece REV-02. | Novas fontes verificadas; divergência antiga localizada. |
| TCC-P042 — figuras e apêndices | Figura 1 selecionada, recorte fornecido; avaliação organizada em tabela. Modelos completos ficam como proposta de apêndice, sem remissão falsa a material já incluído. | Preparação concluída; montagem abaixo. |

### Alcance dos resultados técnicos

A retrospectiva preserva o estado da auditoria inicial de 11/10. Foram lidas as
**atualizações posteriores no próprio relatório**, de modo que os 14 achados da
abertura não foram reapresentados como 14 problemas ainda sem remediação.

| Registro | Evidência considerada e limite de uso |
| --- | --- |
| IC-P9-01, IC-P6-04 e IC-P9-03 | Atualizações documentam correções de prazo vazio, confirmação/projeção de alteração local e classificação de falhas. Foram descritas como revisões do desenvolvimento, sem reproduzir identificadores no corpo. |
| IC-P6-03 | Atualização e [homologação PostgreSQL](../HomologacaoConcorrenciaPostgreSQLIC-P6-03.md) registram trava por inspeção, tratamento de colisão e validação dirigida. São 18/18 cenários PostgreSQL e 10/10 HTTP/armazenamento local no ambiente descartável; 173 testes gerais naquela execução. Não foram somados a outras baterias nem convertidos em cobertura ou garantia do Neon. |
| IC-P6-02 | Revisão de 13/10 isola o QueryClient por identidade, com regressão sintética. Não equivale a homologação de todas as combinações de sessão, abas e produção. |
| IC-P9-02 | Correção de 13/10 restringe o cache do service worker à estrutura pública e recursos permitidos; documentos/API privados não devem ser cacheados. Esse estado prevalece na descrição de 3.4.1. |
| Offline agosto/setembro | Retrospectiva § 7 e auditoria § 5.6: inspeções pré-carregadas, persistência, reabertura da página e reconexão em Chromium; setembro registra seis itens e nove operações, com conferência no Neon. A checagem HTTPS de publicação não é fluxo autenticado completo em produção; reabertura da página não é reinício integral do navegador. |
| Limites mantidos | Formatos históricos/verificação (IC-P9-04), coerência referencial (IC-P9-08), URLs externas das imagens e compensação de exclusão (IC-P9-10), além de manutenção e ampliações de escopo. Não é uma lista exaustiva nem declaração de encerramento da auditoria. |

A rastreabilidade descrita limita o snapshot ao checklist. Não foram afirmados
congelamento de cadastros e tratativas, trilha imutável geral, RBAC completo,
resolução automática de não conformidade pela ação concluída, upload offline,
Background Sync ou um índice de conformidade legal. A conclusão de inspeção é
encerramento do preenchimento, admitindo acompanhamento posterior de pendências.

Fontes de projeto: [requisitos](../DocumentoDeRequisitos.md),
[personas](../Personas.md), [casos de uso](../DiagramaDeCasosDeUso.md),
[arquitetura](../../AI/Architecture.md), [offline](../../AI/Offline.md),
[modelo conceitual](../ModeloConceitualDoBancoDeDados.md),
[lógico](../ModeloLogico.md), [físico](../ModeloFisicoDB.md),
[dicionário](../DicionarioDeDados.md), [classes](../DiagramaDeClasses_VersaoTecnica.md)
e [wireframes](../WIREFRAMES.md). Esses documentos foram usados para explicar
relações e escolhas, sem tratar todo requisito planejado como implementado.

### Conferência do questionário

- Treze questões fechadas: Q1–Q12 e Q14; uma aberta: Q13. As perguntas são
  apresentadas como **sínteses**, conforme PES-002; não como transcrição literal
  de um formulário original que não está no repositório.
- Cada questão fechada soma quatro respostas (100%). Uma = 25%, duas = 50%,
  três = 75%, quatro = 100%. Q13 tem três comentários e uma abstenção.
- Q9 conserva a alternativa “nem concordo nem discordo”, sem convertê-la em
  insatisfação. Q11 conserva as três categorias de dificuldade. Q13 distingue
  sugestão sobre EPCs, localização de fotos e elogio à interface.
- Metodologia: contagem e percentual nas fechadas; leitura e síntese descritiva
  dos três comentários, sem inventar codificação ou protocolo formal. Ausência
  de matriz individual impede cruzamentos entre perfil e resposta.
- Orientação para realizar uma inspeção não comprova execução de todas as
  tarefas por cada pessoa. Percepção de rapidez/segurança não é medida de tempo,
  eficácia, redução de acidentes ou auditoria técnica.

## Figuras e materiais complementares

| ID | Local e propósito | Artefato, legenda e instrução | Estado |
| --- | --- | --- | --- |
| FIG-01 | 4.1, após o parágrafo iniciado por “O fluxo de respostas e conclusão acrescenta uma etapa local” | [fig-01-arquitetura.puml](./redacao/figuras/fig-01-arquitetura.puml), recorte de [application.puml](../diagrams/architecture/application.puml). Título: **Figura 1 — Camadas e persistência do Safe Watch Insight**. Fonte: **Elaborado pelos autores (2026), a partir da documentação de arquitetura do projeto.** | Marcador inserido no DOCX e Markdown; arquivo PlantUML entregue. |
| FIG-02 | 4.1, síntese dos modelos | Não acrescentar figura repetitiva ao corpo. Selecionar modelo completo para apêndice se a dupla decidir incluí-lo. | Dispensada no corpo nesta versão. |
| FIG-03 | 4.1, prototipação | Wireframes explicados em prosa. Uma captura futura deve identificar a versão histórica; não substituir a interface de agosto por tela atual sem legenda temporal. | Sem figura necessária ou captura histórica confirmada. |
| FIG-04 | 5, resultados da avaliação | Tabela 1 já integrada como tabela editável; 13 questões fechadas. Comentários de Q13 no texto imediatamente posterior. Fonte: resultados agregados de PES-002, 28–31/08/2026. | Concluído; não são necessários 13 gráficos. |
| APP-01 | Apêndices | Seleção sugerida: A — requisitos e alcance de atendimento; B — modelos e diagramas selecionados; C — questionário de avaliação, caso se recupere o formulário original. São materiais da equipe. Materiais externos, se necessários, pertencem a anexos. | Proposta, não conteúdo incluído. |

**Montagem de FIG-01:** abrir o arquivo entregue em um renderizador PlantUML
local; exportar preferencialmente SVG, ou PNG em resolução suficiente para
300 dpi na largura final aproximada de 16 cm. Substituir todo o marcador pela
figura, título acima e fonte abaixo, conferindo legibilidade e remissão. Não
capturar uma janela com nomes de participantes ou dados reais. O recorte conserva
14 nós e 15 relações existentes; omite somente os nós SW/CACHE e suas duas
ligações, explicados em 3.4.1. As quebras de linha e o estilo visual não mudam
rótulos ou relações. As setas não representam uma transação única entre bancos.
PlantUML não estava instalado; não houve instalação de dependência nem alegação
de exportação visual da figura. O marcador e o recorte atendem ao formato
expressamente autorizado no prompt.

## Ajustes relacionados fora do escopo

Os pontos seguintes **não foram alterados** no DOCX; dependem da revisão da dupla.

| ID | Local | Proposta localizada e motivo | Estado |
| --- | --- | --- | --- |
| REV-01 | 2.2, objetivo de PWA/Offline-First | Se a dupla optar por tornar o objetivo mais específico, explicitar continuidade de inspeções previamente disponibilizadas no dispositivo, respostas, conclusão e sincronização posterior. Resultados e conclusão já descrevem atendimento parcial do objetivo amplo recebido. | Coerência tratada no texto novo; ajuste do objetivo sugerido. |
| REV-02 | 3.4 e Referências | Recuperar a fonte realmente usada para Guerra (2020), incluindo título e dados bibliográficos. A presença de Valente (2020) não autoriza substituir o nome. SWEBOK sustenta apenas a complementação nova. | Pendente de identificação pela dupla. |
| REV-03 | 3.4, parágrafo “O segundo pilar...” | Rever o exemplo de gestor visualizar resultado imediatamente e de eliminação de sincronizações manuais. Se permanecer como exemplo geral, distingui-lo da plataforma. Para descrever a entrega, considerar propriedade por usuário, conexão/sessão e fila; não prometer colaboração instantânea entre perfis. | Proposta localizada; original preservado. |
| REV-04 | Apêndices A–C | Substituir os títulos herdados de estágio pelos materiais realmente selecionados e incluí-los antes de criar remissões. Seguir APP-01 como sugestão, não aprovação automática. | Montagem pendente fora do escopo. |
| REV-05 | Sumário, numeração e remissões | Atualizar o sumário após a Figura 1 e a montagem final. Conferir quebras de seção, início/continuidade dos números e o título 3.4.2. Há página vazia preexistente entre objetivos e referencial e cabeçalhos distintos após conclusão. Os campos e propriedades originais foram preservados. | Atualização final necessária. |
| REV-06 | Resumo e Abstract | Preencher com problema, objetivo, método, entrega e avaliação final, com os limites de quatro respondentes. Não afirmar redução medida de acidentes ou tempo. | Fora do escopo; campos originais vazios. |
| REV-07 | Referências preexistentes | Corrigir campos “a confirmar”, endereços defeituosos e separação de entradas quando a dupla recuperar as fontes. A nova lista segue autor-data e títulos destacados, sem reproduzir erros antigos. | Somente 13 novas entradas verificadas nesta tarefa. |

## Lacunas que permanecem localizadas

Não impedem os trechos entregues: dia exato do primeiro protótipo; divergências
entre legendas e datas das entrevistas; instrumento/respostas do formulário
inicial e roteiro/transcrições integrais; hash do deploy efetivamente acessado
por cada avaliador; edição do PMBOK estudada em aula; identidade bibliográfica
de Guerra (2020). Não preencher por suposição nem perguntar novamente sobre
quantidades de participantes, datas da avaliação ou uso de SUS, já esclarecidos.
As demais dúvidas históricas de atividades escolares em PENDENCIAS.md não foram
convertidas em condições para concluir esta redação.

## Verificação da entrega

Ver [validacao-editorial.md](./redacao/validacao-editorial.md) para comparação
estrutural, hashes e revisão da renderização. O DOCX de saída é uma cópia de
trabalho integrada; o sumário, a figura indicada e os ajustes fora do escopo
continuam para a montagem da dupla. Nenhum teste da aplicação foi executado
e nenhuma dependência foi instalada. Após essa entrega, o autor autorizou
explicitamente o commit e o push na branch documental, sem merge.
