# Apoio à revisão da dupla

Registro inicial em 16/10/2026. Este arquivo reúne pontos para a futura revisão
do texto gerado, posicionamento de figuras e ajustes relacionados fora do escopo.
A redação ainda não começou; indicações abaixo são candidatas e devem ser
atualizadas com a localização exata quando o texto existir.

## Leitura da monografia recebida

O DOCX foi lido e suas 29 páginas renderizadas foram inspecionadas. Há texto na
introdução, objetivos e referencial teórico, incluindo trabalhos relacionados.
O arquivo tem somente os logotipos institucionais como imagens; não contém
diagramas técnicos inseridos. Ver [MONO-001](./fontes/monografia/mono-001-texto-recebido.md).

| Seção | Estado observado | Encaminhamento |
| --- | --- | --- |
| Introdução e 3.3 | Já discutem papel, perda/fragmentação de registros, histórico e centralização | Aproveitar a continuidade conceitual; explicar na metodologia como a pesquisa local orientou os requisitos, sem repetir o referencial. |
| 3.4 | Texto existente sobre requisitos, arquitetura e qualidade | Complementar apenas o necessário ao processo adotado e conferir a fonte bibliográfica. |
| 3.4.1 | Apenas indicação de preenchimento | Descrever tecnologias e suas funções; não transformar em tutorial de instalação. |
| 4 | Título sem desenvolvimento | Explicar desenho e percurso da pesquisa, instrumentos, período e tratamento dos dados. |
| 4.1 | Lista de requisitos, personas, casos de uso, arquitetura, banco e protótipos | Redigir com base nos documentos do projeto. |
| 4.2 | Lista de implementação, funcionalidades e integração | Explicar processo de desenvolvimento, revisão, testes e participação humana. |
| 5 e 6 | Títulos sem desenvolvimento | Apresentar resultados e interpretação, depois concluir em relação aos objetivos. |

## Figuras e documentos complementares candidatos

| ID | Local candidato | Material e propósito | Ação pendente |
| --- | --- | --- | --- |
| FIG-01 | 4.1, após explicação da arquitetura | Visão geral das camadas e integração | Selecionar diagrama existente; fornecer trecho PlantUML fiel se a figura for necessária. |
| FIG-02 | 4.1, após síntese da modelagem do banco | Relações centrais do ciclo de inspeção | Preferir explicação breve e remissão ao modelo completo; usar recorte apenas se agregar compreensão. |
| FIG-03 | 4.1, ao abordar prototipação | Tela ou fluxo do protótipo pertinente às decisões | Localizar versão histórica correta e distinguir protótipo da interface atual. |
| FIG-04 | 5, junto aos resultados da avaliação | Quadro ou gráfico compacto com dados de PES-002 | Selecionar somente indicadores úteis, sempre com n=4; não reproduzir automaticamente os 13 gráficos. |
| APP-01 | Apêndices | Diagramas/modelos e instrumentos elaborados pela equipe | Selecionar os materiais realmente citados, definir letras/títulos e remissões após a escrita. |

Não gerar diagramas nesta consolidação. Na etapa de escrita, cada indicação
deve especificar seção/parágrafo, finalidade, legenda, fonte, caminho do artefato
e, quando cabível, trecho exato para captura/exportação. A documentação completa
continua utilizável independentemente do TCC.

## Ajustes relacionados a conferir

| ID | Local | Ponto observado | Encaminhamento |
| --- | --- | --- | --- |
| REV-01 | 2.2, objetivo de PWA/Offline-First | O objetivo é amplo; a entrega offline tem alcance delimitado nos registros técnicos | Relacionar resultados e conclusão ao incremento entregue. Sugerir ajuste no objetivo apenas se necessário, sem diminuir as contribuições nem declarar cobertura universal. |
| REV-02 | 3.4 e Referências | Guerra (2020) é citado no texto, sem entrada correspondente; consta uma obra de Valente (2020) | Identificar a fonte realmente usada antes de alterar autor ou reutilizar a citação. Não substituir por suposição. |
| REV-03 | 3.4, descrição arquitetural | Há exemplo de visualização imediata por gestor e menção à eliminação de sincronizações manuais | Conferir se é exemplo geral ou comportamento específico implementado, considerando conectividade e acesso por usuário. |
| REV-04 | Apêndices A, B e C | Títulos atuais dizem “Mesa de trabalho do supervisor de estágio” e não têm conteúdo | Reorganizar para materiais do TCC, com letras e títulos coerentes com as remissões. |
| REV-05 | Sumário e remissões | Há paginação de referências/apêndices aparentemente herdada; novas seções/figuras mudarão páginas | Atualizar automaticamente ao concluir a edição no editor de texto. |
| REV-06 | Resumo e Abstract | Estão vazios | Indicar à dupla que deverão refletir método, resultados e conclusão finais; preenchimento não incluído automaticamente no escopo atual. |
| REV-07 | Referências utilizadas nos trechos novos | Há entradas com campos “a confirmar” no documento recebido | Verificar as fontes que forem reutilizadas e incluir as novas em ABNT. Sinalizar as demais à dupla sem iniciar revisão geral não solicitada. |

## Questões que podem ser resolvidas pelas fontes

- Identificar a versão da plataforma avaliada em agosto e não atribuir aos
  participantes funcionalidades entregues somente depois.
- Distinguir os três registros de entrevistas dos quatro respondentes da avaliação;
  conferir eventual participante adicional sem solicitar identidades desnecessárias.
- Localizar formulário inicial e resultados, roteiro das entrevistas e documento
  de requisitos antes de pedir complementação aos autores.
- Esclarecer o tratamento efetivo das respostas abertas, se o termo “análise de
  conteúdo” for utilizado, e localizar a edição/conteúdo do PMBOK pertinente.

Ver [PENDENCIAS.md](./PENDENCIAS.md) para rastreabilidade. Esses pontos não são
condições para exigir conclusão integral do software nem um parecer de banca.
