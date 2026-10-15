# Fontes para revisão do TCC — Safe Watch Insight

Este diretório reúne as fontes recebidas para organizar a revisão da monografia
de Análise e Desenvolvimento de Sistemas da UEMA. A coleta está em andamento.
Receber e indexar uma fonte não significa aprovar suas afirmações para o TCC.

## Como consultar

- [Índice das fontes](./INDICE_FONTES.md): origem, identificação, escopo e integridade de cada material.
- [Linha do tempo](./LINHA_DO_TEMPO.md): marcos extraídos, datas disponíveis e suas incertezas.
- [Pendências e divergências](./PENDENCIAS.md): questões para conferir nas fontes ou com os autores.
- [CHAT-001 — Estrutura do TCC ADS](./fontes/chats/ads-tcc-duvidas-tecnicas/chat-001-estrutura-do-tcc-ads.md): cópia anonimizada do primeiro relatório.
- [CHAT-002 — Lovable para FrontEnd TCC](./fontes/chats/ads-tcc-duvidas-tecnicas/chat-002-lovable-para-frontend-tcc.md): relato anonimizado sobre frontend, Atividade 1 e prompts de documentação.
- [CHAT-003 — Prompts TCC ADS](./fontes/chats/ads-tcc-prompts/chat-003-prompts-tcc-ads.md): relato anonimizado sobre organização dos espaços de trabalho e refinamento do prompt orquestrador.
- [CHAT-004 — Estrutura TCC ADS](./fontes/chats/ads-tcc-pesquisa/chat-004-estrutura-tcc-ads.md): preparação de mensagem e perguntas para uma possível conversa exploratória com profissional de SST.

## Organização e preservação

Os relatórios de chats são guardados em
`fontes/chats/<project-de-origem>/<id>-<titulo-do-chat>.md`.
O nome de cada project e o título do chat, com a grafia informada na coleta,
ficam no índice. Os caminhos usam nomes sem espaços e sem acentos.

O identificador `CHAT-001` representa a ordem de recebimento, não a ordem
cronológica do desenvolvimento. A data de recebimento também não determina a
data dos acontecimentos narrados.

Cada arquivo publicado é uma cópia anonimizada da fonte recebida. O original
fornecido é preservado fora do repositório público. Nomes pessoais são
substituídos por papéis e identificadores pessoais desnecessários são omitidos
ou substituídos por aliases. Credenciais e dados de participantes de pesquisas
não devem ser publicados. O tratamento é registrado no índice, sem publicar a
chave de identificação das pessoas.

A anonimização mantém as decisões, a sequência dos fatos, as evidências e as
incertezas do relato. Não corrige silenciosamente identificações imprecisas ou
informações posteriormente superadas. O índice, a cronologia e as pendências
são registros de organização separados da fonte. Retificações futuras devem ser
identificadas e relacionadas à versão recebida.

Novos tipos de material, como monografia original, relatos dos autores e
referências, serão registrados no mesmo índice e ganharão diretórios próprios
quando forem recebidos. A versão original da monografia deve ser preservada e
as revisões devem ser gravadas em arquivos distintos.

## Autoridade e uso das fontes

A consulta parte do relatório principal de desenvolvimento, da monografia
existente, dos relatos dos autores e dos relatórios dos chats, nessa ordem
inicial. A comprovação de cada afirmação depende das evidências pertinentes:
código, testes, registros de execução, documentos acadêmicos ou bibliografia.
A hierarquia não elimina divergências nem substitui evidências diretas.

Os chats podem narrar sugestões, decisões preliminares ou estados antigos.
Preservar a distinção entre fato observado, relato, decisão, proposta,
inferência e informação não verificada. Resultados técnicos não demonstram,
por si, eficácia em campo, avaliação com usuários ou conformidade legal.

O repositório já contém a
[Retrospectiva técnica do desenvolvimento](../RetrospectivaTecnicaDesenvolvimentoSafeWatchInsight.md)
e o [Relatório de auditoria técnica pré-escrita](../RelatorioAuditoriaTecnicaPreEscritaTCC.md).
Esses documentos permanecem nos caminhos existentes. Sua leitura e conciliação
com as fontes coletadas pertencem à próxima etapa, sem duplicar seus conteúdos.

## Procedimento de entrada

1. Registrar project, título do chat, arquivo recebido e data de recebimento.
2. Preservar o original fora do repositório público e preparar uma cópia anonimizada; registrar o tratamento e o SHA-256 da cópia publicada.
3. Acrescentar a ficha ao índice e relacionar os marcos à seção de origem.
4. Registrar lacunas, conflitos e limites sem modificar os fatos relatados.
5. Publicar as adições na branch de coleta e atualizar o PR em andamento.

Datas desconhecidas continuam desconhecidas. Quando só houver sequência
narrativa, registrar essa ordem sem estimar um calendário. O nome de um anexo
que pareça conter uma data não comprova a data da conversa ou do acontecimento.

## Estado da coleta

Em 15/10/2026, foram recebidos quatro relatórios de chats. A monografia e os relatos
humanos ainda não foram adicionados a este diretório. Esta entrega organiza a
coleta; a auditoria documental integrada e a redação da monografia ocorrerão
após a reunião e avaliação das fontes.
