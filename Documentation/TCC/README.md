# Fontes para revisão do TCC — Safe Watch Insight

Este diretório reúne as fontes recebidas para organizar a revisão da monografia
de Análise e Desenvolvimento de Sistemas da UEMA. A coleta dos nove relatórios
de chats foi encerrada pelo autor; a preparação acadêmica continua.
Receber e indexar uma fonte não significa aprovar suas afirmações para o TCC.

## Como consultar

- [Acordos de escrita](./ACORDOS_DE_ESCRITA.md): escopo, prioridade das fontes, tom, referências, IA e preservação.
- [Plano de continuidade](./PLANO_DE_CONTINUIDADE.md): checkpoint e sequência até a skill e a escrita.
- [Revisão da dupla](./REVISAO_DA_DUPLA.md): mapa da monografia, figuras candidatas e ajustes relacionados.

- [Índice das fontes](./INDICE_FONTES.md): origem, identificação, escopo e integridade de cada material.
- [Linha do tempo](./LINHA_DO_TEMPO.md): marcos extraídos, datas disponíveis e suas incertezas.
- [Pendências e divergências](./PENDENCIAS.md): questões para conferir nas fontes ou com os autores.
- [CHAT-001 — Estrutura do TCC ADS](./fontes/chats/ads-tcc-duvidas-tecnicas/chat-001-estrutura-do-tcc-ads.md): cópia anonimizada do primeiro relatório.
- [CHAT-002 — Lovable para FrontEnd TCC](./fontes/chats/ads-tcc-duvidas-tecnicas/chat-002-lovable-para-frontend-tcc.md): relato anonimizado sobre frontend, Atividade 1 e prompts de documentação.
- [CHAT-003 — Prompts TCC ADS](./fontes/chats/ads-tcc-prompts/chat-003-prompts-tcc-ads.md): relato anonimizado sobre organização dos espaços de trabalho e refinamento do prompt orquestrador.
- [CHAT-004 — Estrutura TCC ADS](./fontes/chats/ads-tcc-pesquisa/chat-004-estrutura-tcc-ads.md): preparação de mensagem e perguntas para uma possível conversa exploratória com profissional de SST.
- [CHAT-005 — Estrutura e Orientações TCC](./fontes/chats/ads-tcc-documentos/chat-005-estrutura-e-orientacoes-tcc.md): revisão preliminar do projeto acadêmico inicial, com objetivos, metodologia planejada, cronograma e referências não verificadas.
- [CHAT-006 — Documentação Plataforma TCC](./fontes/chats/ads-tcc-documentacao-plataforma/chat-006-documentacao-plataforma-tcc.md): correções de datas e React relatadas, verificações direcionadas e preparação de avaliação da Atividade 2.
- [CHAT-007 — Regra de Prompt Codex](./fontes/chats/ads-tcc-desenvolvimento/chat-007-regra-de-prompt-codex.md): padrão de prompts, revisão documental relatada, divisão de responsabilidades e análise preliminar de licenciamento.
- [CHAT-008 — Desenvolvimento TCC Segurança do Trabalho](./fontes/chats/ads-tcc-desenvolvimento/chat-008-desenvolvimento-tcc-seguranca-do-trabalho.md): autorização de evidências, homologação PWA/offline com limitações e prompt de cadastro; inclui divergência temporal a conferir.

- [CHAT-009 — Gerar Prompt de Auditoria](./fontes/chats/ads-tcc-desenvolvimento/chat-009-gerar-prompt-de-auditoria.md): correções de isolamento/cache, PRs rastreáveis e preparação documental; merges confirmados em outubro.

## Organização e preservação

Os relatórios de chats são guardados em
`fontes/chats/<project-de-origem>/<id>-<titulo-do-chat>.md`.
O nome de cada project e o título do chat, com a grafia informada na coleta,
ficam no índice. Os caminhos usam nomes sem espaços e sem acentos.

O identificador `CHAT-001` representa a ordem de recebimento, não a ordem
cronológica do desenvolvimento. A data de recebimento também não determina a
data dos acontecimentos narrados.

Os relatórios históricos são cópias anonimizadas. As novas fontes podem ser
sínteses explicitamente identificadas ou extrações textuais com limites declarados.
O original
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

Relatos dos autores, orientações, pesquisa e monografia são organizados em
`fontes/relatos/`, `fontes/orientacoes/`, `fontes/pesquisa/` e `fontes/monografia/`.
A versão original da monografia é preservada fora deste diretório público;
a extração de referência é MONO-001. A futura revisão deve usar arquivo distinto.

## Autoridade e uso das fontes

A consulta prioriza o relatório principal de desenvolvimento e a monografia
existente; depois, os relatos dos autores; por último, os relatórios dos chats,
com preferência pelos mais recentes para o estado mais recente. A comprovação de cada afirmação depende das evidências pertinentes:
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

1. Registrar tipo, origem e data de recebimento; para chats, também project e título.
2. Preservar o original fora do repositório público e preparar uma cópia anonimizada; registrar o tratamento e o SHA-256 da cópia publicada.
3. Acrescentar a ficha ao índice e relacionar os marcos à seção de origem.
4. Registrar lacunas, conflitos e limites sem modificar os fatos relatados.
5. Publicar as adições na branch de coleta e atualizar o PR em andamento.

Datas desconhecidas continuam desconhecidas. Quando só houver sequência
narrativa, registrar essa ordem sem estimar um calendário. O nome de um anexo
que pareça conter uma data não comprova a data da conversa ou do acontecimento.

## Estado da coleta

Atualizado em 16/10/2026: nove relatórios históricos, um relato humano, as
orientações da dupla, duas sínteses de pesquisa e a extração textual da monografia
estão indexados. Os originais DOCX e capturas com identificação pessoal não foram
publicados. O ebook permanece sem análise nesta etapa.

Esta consolidação registra o que foi acordado; não redige a monografia, não cria
skill e não altera código. A escrita deverá valorizar a proposta, as entregas e
a avaliação, descrevendo o estágio atual com precisão e as melhorias como
continuidade do trabalho, sem tom de derrota. Detalhes de conciliação ficam nos
registros auxiliares, conforme os acordos.
