# Referências verificadas para os novos trechos

Consulta e conferência: **16/10/2026**, horário de Fortaleza. Registro restrito às
fontes acrescentadas nesta redação. As referências preexistentes foram preservadas;
este arquivo não certifica a bibliografia anterior. A lista acadêmica das 13 novas
entradas está ao final de [secoes-redigidas.md](./secoes-redigidas.md) e integrada
à bibliografia de [monografia-trabalho.docx](./monografia-trabalho.docx).

Foram consultados os trechos indicados abaixo, não necessariamente as obras
integrais. As fontes fundamentam a redação atual; não comprovam sua leitura
histórica pelos autores. Documentação online sem paginação foi identificada pelo
título da seção. Não foram criados DOI, ISBN, local de publicação ou edição ausentes.
`[S. l.]` indica local não identificado para a publicação consultada.

## Obras e conteúdo efetivamente utilizado

### Prodanov e Freitas (2013)

PRODANOV, Cleber Cristiano; FREITAS, Ernani Cesar de. **Metodologia do trabalho
científico**: métodos e técnicas da pesquisa e do trabalho acadêmico. 2. ed.
Novo Hamburgo: Feevale, 2013. E-book.

- [Página da editora](https://www.feevale.br/institucional/editora-feevale/metodologia-do-trabalho-cientifico---2-edicao)
  e [PDF institucional](https://www.feevale.br/Comum/midias/0163c988-1f5d-496f-b118-a6e009a7a2f9/E-book%20Metodologia%20do%20Trabalho%20Cientifico.pdf).
  Autores, edição, cidade, editora e ano confirmados na apresentação e ficha
  catalográfica. ISBN identificado: 978-85-7717-158-3; não é necessário à entrada.
- Páginas impressas 51–52: natureza aplicada e objetivos exploratórios/descritivos;
  54–55: pesquisa bibliográfica e documental; 105–106 e 108–109: coleta, entrevistas,
  questionários e perguntas abertas/fechadas; 112–114: organização e interpretação;
  126–130: delineamento e articulação dos procedimentos.
- Uso em **4**: citações específicas às páginas 51–52, 54–55 e 108–109. O livro
  ajuda a caracterizar procedimentos demonstrados; não comprova execução de
  pré-teste, amostragem aleatória, protocolo de análise de conteúdo ou métodos mistos.
  As regras de normalização de 2013 não foram adotadas como norma vigente.

### Washizaki, editor (2026)

WASHIZAKI, Hironori (ed.). **Guide to the software engineering body of knowledge**.
Version 4.0a. [S. l.]: IEEE Computer Society, 2026.

- [PDF oficial consultado](https://ieeecs-media.computer.org/media/education/swebok/swebok-v4.pdf)
  e [apresentação institucional](https://www.computer.org/education/bodies-of-knowledge/software-engineering).
  Capa do PDF: versão 4.0a, lançamento em agosto de 2026; editor identificado no
  próprio documento. A página de apresentação conserva informação anterior de
  lançamento em setembro de 2025 e o copyright do PDF inclui 2014–2025. A entrada
  adota a versão e o ano da capa do exemplar efetivamente lido, sem equipará-lo à
  versão 4.0 original de 2024. O ISBN provisório do arquivo não foi reproduzido.
- Leitura: capítulo 1, páginas 1-6 a 1-8, atividades de requisitos e sua gestão;
  capítulo 5, páginas 5-6 e 5-7, testes unitários, de integração e de sistema.
- Uso em **3.4**, nos dois parágrafos acrescentados. É fundamentação própria da
  complementação; não foi usada para substituir silenciosamente Guerra (2020).

## Documentação oficial das tecnologias

Todas as páginas abaixo foram acessadas em **16 out. 2026**. O ano da entrada foi
conferido pela atualização da página, pela revisão de seu arquivo no repositório
oficial ou, no PostgreSQL, pelo copyright, indicado como `c2026` na referência e
`2026` na chamada. A revisão de uma página não é o lançamento da tecnologia nem
uma data de consulta pelos desenvolvedores. Não se atribui a versão mais recente
da documentação ao software automaticamente.

| Autor; título; publicação e ano adotados | Fonte específica e trecho lido | Afirmação sustentada em 3.4.1 |
| --- | --- | --- |
| CLOUDINARY. **Upload**. Cloudinary, 2026. | [Upload](https://cloudinary.com/documentation/upload_images): apresentação, chamadas autenticadas e proteção do API secret; página atualizada em 30 set. 2026. | Recebimento online de mídia e manutenção do segredo no servidor. O uso concreto da abstração de armazenamento é evidência do repositório. |
| DEXIE.JS. **Design**. Dexie.js, 2023. | [Design](https://dexie.org/docs/Tutorial/Design): conexão, transações e operações assíncronas. Revisão do arquivo oficial de 11 ago. 2023, abaixo. | Operações e transações sobre IndexedDB; a documentação não comprova o alcance offline da plataforma. |
| MDN WEB DOCS. **Offline and background operation**. Mozilla, 2026. | [Guia PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation): service workers, cache offline e distinção de operação em segundo plano; última modificação em 13 set. 2026. | Função do service worker; não foi atribuída implementação de Background Sync ao projeto. |
| MICROSOFT. **The TypeScript handbook**. Microsoft, 2026. | [Introdução ao handbook](https://www.typescriptlang.org/docs/handbook/intro.html): About this Handbook e verificação estática; atualização indicada em 16 out. 2026. | Tipagem estática; não substitui validação de entrada durante a execução. |
| POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL 18 documentation: transactions**. PostgreSQL Global Development Group, c2026. | [Tutorial § 3.4 Transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html): atomicidade, COMMIT e ROLLBACK; copyright 1996–2026 no rodapé. | Escritas relacionadas confirmadas ou desfeitas em conjunto. Não implica transação única com Cloudinary ou IndexedDB. |
| PRISMA. **What is Prisma 7?** Prisma, 2026. | [Documentação da versão 7](https://www.prisma.io/docs/orm/v7): apresentação de Client, Migrate e modelo; revisão de 12 out. 2026. | Cliente de consulta e migrações. O endereço genérico que redirecionou à v6 foi descartado para esta citação. |
| REACT. **Quick start**. React, 2026. | [Quick start](https://react.dev/learn): Creating and nesting components; revisão de 9 abr. 2026. | Organização da interface por componentes; não vincula o projeto a toda atualização indicada no site. |
| TAILWIND LABS. **Responsive design**. Tailwind Labs, 2026. | [Responsive design](https://tailwindcss.com/docs/responsive-design): breakpoints e Working mobile-first; revisão de 12 maio 2026. | Regras responsivas e organização inicial para telas menores. |
| TANSTACK. **Overview**. TanStack Query: React documentation. TanStack, 2026a. | [Overview](https://tanstack.com/query/latest/docs/framework/react/overview): estado assíncrono do servidor, consulta e cache; revisão de 2 set. 2026. | Papel do React Query. Não equivale à fila durável de operações da plataforma. |
| TANSTACK. **Server functions**. TanStack Start: React documentation. TanStack, 2026b. | [Server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions) e [arquivo oficial](https://raw.githubusercontent.com/TanStack/router/main/docs/start/framework/react/guide/server-functions.md): introdução e execução no servidor; revisão de 12 out. 2026. | Operações de servidor invocadas pela aplicação. O arquivo oficial foi consultado quando a página não retornou conteúdo legível. |
| ZOD. **Zod**. Documentação da versão 3. Zod, 2026. | [Arquivo oficial da documentação v3](https://github.com/colinhacks/zod/blob/main/packages/docs-v3/home.md), seção Introduction, também lida em formato raw; revisão de 30 set. 2026. | Esquemas, validação e inferência de tipos. Foi mantida a autoria institucional do projeto; a página credita Colin McDonnell como criador. |

### Rastreabilidade das datas de revisão

Metadados conferidos pela API do GitHub para o caminho de cada documento, sem
usar o ano do acesso como substituto automático da data de publicação:

| Página | Caminho oficial | Última revisão identificada |
| --- | --- | --- |
| React | `reactjs/react.dev: src/content/learn/index.md` | [abe931a](https://github.com/reactjs/react.dev/commit/abe931a8cb3aee3e8b15ef7e187214789164162a), 09/04/2026. |
| TanStack Query | `TanStack/query: docs/framework/react/overview.md` | [4c568a2](https://github.com/TanStack/query/commit/4c568a28c8c0bffb9bca9fe8c9d5249f955e7790), 02/09/2026. |
| TanStack Start | `TanStack/router: docs/start/framework/react/guide/server-functions.md` | [94d6d8e](https://github.com/TanStack/router/commit/94d6d8e49694e225cb07e2a6777633d08aeeb3c5), 12/10/2026. |
| Dexie.js | `dexie/dexie-website-old: docs/Tutorial/Design.md` | [319d756](https://github.com/dexie/dexie-website-old/commit/319d756200ecc25124a85f7e632abf0c3200d8f2), 11/08/2023; o repositório anterior redireciona para este. |
| Tailwind CSS | `tailwindlabs/tailwindcss.com: src/docs/responsive-design.mdx` | [b1345a7](https://github.com/tailwindlabs/tailwindcss.com/commit/b1345a76bfdfe3f7f4f89665df0439b1048932cc), 12/05/2026. |
| Zod v3 | `colinhacks/zod: packages/docs-v3/home.md` | [8fb2faf](https://github.com/colinhacks/zod/commit/8fb2faf0584828a6a027d8279db36f6f52784462), 30/09/2026. |
| Prisma 7 | `prisma/web: apps/docs/content/docs/orm/v7/index.mdx` | [866b345](https://github.com/prisma/web/commit/866b345a0371e14ff86228a59f0925f81a6a3ddb), 12/10/2026; consulta de `prisma/docs` redirecionada ao repositório atual. |

## Consulta editorial e candidatos não acrescentados

- **UEMA, Sistema Integrado de Bibliotecas. Manual de normalização de trabalhos
  acadêmicos. 6. ed. São Luís: EDUEMA, 2026.** [PDF institucional](https://www.biblioteca.uema.br/wp-content/uploads/2026/05/Manual-Normalizacao_UEMA.pdf).
  Conferidos apresentação e ficha catalográfica; páginas impressas 45–46
  (referências, alinhamento e destaque dos títulos), 47–49 (apêndices e anexos),
  50 e 56 (elementos de referências e datas), 75–77 (sistema autor-data).
  Mantidos sistema autor-data e título em negrito nas novas entradas. Chamadas
  parentéticas novas usam maiúsculas/minúsculas, conforme o manual; as antigas
  em caixa alta não foram reformadas. O manual menciona NBR 6023:2025 em um trecho
  e 6023:2018 em outro: não se declara conformidade integral de toda a monografia
  com base nessa consulta seletiva. Esta fonte orienta edição, sem citação no corpo,
  e por isso não foi adicionada à bibliografia acadêmica.
- **PMBOK:** verificados os dados da 7ª edição de 2021 na
  [apresentação do PMI](https://www.pmi.org/es-es/brasil/sitecore/content/home/standards/pmbok)
  e o conteúdo do [material oficial sobre adaptação](https://www.pmi.org/-/media/pmi/documents/public/pdf/pmbok-standards/pmbok-tailoring-explainer-20-oct-2020.pdf)
  (sete páginas: escolha de abordagem, adaptação à organização/projeto e revisão).
  Não foi lido o guia integral, nem identificada a edição usada em aula. Em 4.2,
  consta somente a influência relatada em HUM-001, sem citação teórica ou entrada
  bibliográfica do guia. Essa opção evita atribuir uma edição à experiência em aula.
- **Código Limpo:** candidato descartado desta redação; não há evidência de leitura
  histórica e o texto não necessita de uma citação decorativa.
- **Guerra (2020) / Valente (2020):** divergência preexistente mantida em REV-02.
  Nenhuma das duas entradas foi validada por associação entre os nomes.
- Não foi identificada nesta consulta uma instrução específica da UEMA sobre a
  declaração de IA aplicável a este trabalho. O relato breve de 4.2 decorre das
  atividades e da autorização dos autores; não é apresentado como cumprimento
  de uma política institucional não localizada.

## Conferência de uso

As 13 entradas têm chamadas nos novos trechos; as duas obras de TanStack foram
distinguidas por `2026a` (Overview) e `2026b` (Server functions). Tecnologias
mencionadas apenas para descrever a implementação concreta, como Neon, Vercel,
Radix UI, Lucide e Git, não receberam referências genéricas sem função teórica.
Fatos do projeto e dados de pesquisa têm sua proveniência em
[REVISAO_DA_DUPLA.md](../REVISAO_DA_DUPLA.md), sem transportar hashes ou relatórios
de chat para o corpo acadêmico.
