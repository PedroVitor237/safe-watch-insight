# Validação editorial da cópia de trabalho

Conferência realizada em **16/10/2026**. Entrega:
[monografia-trabalho.docx](./monografia-trabalho.docx).
Esta verificação trata da integração documental e das evidências utilizadas;
não constitui teste ou homologação adicional da aplicação.

## Integridade e preservação

| Arquivo | SHA-256 conferido |
| --- | --- |
| Entrada `fontes/monografia/docx/monografia-atual.docx` | `474dbdd725b191a7d8853f3e954d9f3626d2bbcecd5bdc3d773b69846ab6fe77` |
| Saída `redacao/monografia-trabalho.docx` | `2d9af9cd4c0455775d77a419421aa83c24395cb48e6acdd97cd9bad9bca7fc31` |
| MONO-001 | `c7763f471b793aa5382f989760c2299c1d0a378760f0e1c3e8f4bdebc8dc53e7` |
| PES-001 | `4a2ffa629874b47a45ddf415a2c76e157d929016417c3454f2b17390fb8ca477` |
| PES-002 | `3e58bb519649e3c74e2dc160604bc053db302e55d4be86aa2b5047d85cea51bf` |

A entrada mantém o hash registrado no README e na preparação. O DOCX foi editado
por inserções localizadas no XML principal, sem conversão genérica do documento
inteiro a partir de Markdown. Foram mantidos os parágrafos de título e seus
marcadores, estilos e propriedades de numeração.

- O pacote contém **15 partes**; somente `word/document.xml` tem conteúdo alterado.
  As outras **14 partes** são idênticas em bytes descompactados: três cabeçalhos,
  relações, estilos, numeração, configurações, fontes, tema, dois logos e demais
  componentes do pacote. Não havia parte própria de rodapé a reconstruir.
- Dos 455 elementos originais diretamente no corpo, **288 foram preservados e
  comparados individualmente por XML canônico**. Isso inclui capa, folha de rosto,
  nomes, resumos, sumário, introdução, objetivos, referencial anterior, cinco
  parágrafos recebidos de 3.4, toda a subseção 3.4.2, referências anteriores,
  apêndices e propriedades de seção.
- **167 elementos** de marcadores, tópicos e espaços reservados das seções
  autorizadas foram substituídos. Foram acrescentados **67 elementos** de texto,
  tabela e referências, resultando em 355 elementos no corpo da saída.
- As **três propriedades de seção** foram conservadas. O parágrafo que contém a
  quebra após o título da conclusão foi mantido após o texto inserido dessa seção,
  conservando as propriedades e a ordem relativa dos elementos originais.
- O pacote ZIP final passou na verificação de integridade. A entrada, MONO-001 e
  registros de pesquisa continuam inalterados no diff do repositório.

## Conteúdo e coerência

1. Conferida a presença integral de cada parágrafo novo do Markdown no DOCX,
   retirando somente a marcação de negrito para comparação. A tabela foi verificada
   pelas células, contagens e alternativas, sem perda de dados na integração.
2. As **13 questões fechadas** correspondem às categorias de PES-002 e somam
   quatro respostas cada. Cada percentual é exatamente 25 vezes a contagem;
   cada linha soma 100%. Q13 tem três comentários (75%) e uma abstenção (25%).
   Não foram criados cruzamentos entre perfis e respostas.
3. As perguntas estão identificadas como sínteses do instrumento, sem suposta
   transcrição literal do formulário original. A análise descrita corresponde a
   contagens/percentuais e síntese descritiva dos comentários disponíveis.
4. Conferida a ausência de **SUS** no texto integral do DOCX e nos novos trechos
   acadêmicos em Markdown, inclusive ausência de explicação sobre escore.
5. Conferida a correspondência das **13 novas fontes** entre chamadas e entradas
   bibliográficas. TanStack 2026a/2026b e o ano 2026 da chamada de PostgreSQL,
   com `c2026` na referência, foram mantidos de modo consistente. Detalhes de
   verificação estão em [referencias-verificadas.md](./referencias-verificadas.md).
6. Conferidos os recortes de maio–outubro e da avaliação de agosto, separando
   relatórios/dashboard e revisões posteriores. Não foi atribuído offline completo,
   RBAC amplo, ganho medido de tempo ou redução de acidentes à avaliação.
7. Comparado o grafo da Figura 1 com o arquivo-fonte: **14 nós e 15 relações**
   pertencem à arquitetura original, com rótulos equivalentes após retirar
   quebras de linha. Foram omitidos apenas SW/CACHE e suas duas ligações.
8. Conferida a relação entre objetivos recebidos, metodologia, entregas,
   resultados e conclusão. O alcance parcial do objetivo offline é explícito.
   Ajustes relacionados fora do escopo foram encaminhados à revisão da dupla.

## Renderização e apresentação

Ferramentas disponíveis: **LibreOffice 25.2.3.2**, Poppler (`pdfinfo`, `pdftotext`,
`pdftoppm`) e inspeção de imagens. O LibreOffice foi usado somente para gerar PDFs
em diretório temporário; não regravou a entrada ou a cópia DOCX.

- Entrada renderizada: **30 páginas A4**; saída final: **39 páginas A4**.
  O registro anterior de 29 páginas pertence à inspeção da preparação; esta
  contagem é a renderização local de comparação, sem mudança do hash da entrada.
- Inspecionadas visualmente as 39 páginas da saída por folhas de contato e
  ampliações dos trechos necessários. As primeiras **17 páginas têm imagem
  idêntica pixel a pixel** à entrada renderizada com o mesmo tamanho.
- Conferidos a continuidade de 3.4/3.4.1, preservação visual de 3.4.2, títulos,
  parágrafos, marcador da Figura 1, tabela, conclusão e referências acrescentadas.
  A tabela cabe em uma página, tem cabeçalhos legíveis e conserva a alternativa
  completa de Q9. Não se observaram cortes ou sobreposição nos novos trechos.
- Ajustadas repetições em resultados para evitar uma página quase vazia antes
  da tabela e duas linhas isoladas ao fim do capítulo. Conferida a separação da
  referência nova de Washizaki em relação à entrada preexistente de Valente.
- Localização nesta renderização: complementação/tecnologias nas páginas físicas
  18–20; metodologia e projeto em 23–27; desenvolvimento em 27–29; resultados
  em 30–32 (Tabela 1 em 31); conclusão em 33; referências em 34–36.
  Essas posições poderão mudar na montagem da figura e no editor final.

Não foram reformadas a página vazia preexistente entre objetivos e referencial,
os campos de sumário com números antigos, as propriedades de paginação após a
conclusão ou os apêndices herdados. A Figura 1 permanece como marcador autorizado,
com PlantUML pronto para exportação; não se declara a imagem final já inserida.
Esses pontos estão detalhados em
[REVISAO_DA_DUPLA.md](../REVISAO_DA_DUPLA.md).

Os PDFs, imagens, scripts e relatórios intermediários ficaram em `/tmp`, fora
dos arquivos da entrega. A validação não envolveu instalação de dependências,
testes da aplicação ou ações de publicação; o pedido de commit e push ocorreu
depois da entrega e está registrado no plano de continuidade.
