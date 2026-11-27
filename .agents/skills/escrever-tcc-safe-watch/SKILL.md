---
name: escrever-tcc-safe-watch
description: Preparar, redigir e revisar as seções autorizadas do TCC de ADS/UEMA sobre Safe Watch Insight, com prosa acadêmica natural, fontes verificadas, referências no padrão da monografia e revisão auxiliar da dupla. Usar para metodologia, projeto, desenvolvimento, tecnologias, resultados e conclusão deste TCC ou para preparar seu prompt de escrita. Não usar para implementar a plataforma, revisar toda a monografia ou trabalhar no HidroFlorestas.
---

# Escrever o TCC do Safe Watch Insight

## Determinar a tarefa e localizar as fontes

1. Identificar se o pedido é de preparação, prompt, redação ou revisão. Executar
   somente o estágio solicitado; criar/ativar a skill não autoriza iniciar o TCC.
2. Localizar `PedroVitor237/safe-watch-insight` e suas instruções `AGENTS.md`.
   Não confundir com HidroFlorestas nem importar sua tecnologia/história. Se só
   houver acesso remoto, ler os arquivos pela integração disponível.
3. Ler os documentos exigidos por AGENTS.md e, em `Documentation/TCC/`, ler
   `ACORDOS_DE_ESCRITA.md`, `PLANO_DE_CONTINUIDADE.md`, `INDICE_FONTES.md` e
   `REVISAO_DA_DUPLA.md`. Consultar pendências e linha do tempo seletivamente.
4. Ler [fontes-e-limites.md](references/fontes-e-limites.md) para localizar fontes
   e confusões já identificadas. Antes de enquadrar a pesquisa ou inserir citações,
   ler [metodologia-e-referencias.md](references/metodologia-e-referencias.md).
5. Usar arquivos efetivamente disponíveis. Se faltar acesso, preparar o que for
   possível e registrar a falta; nunca declarar que consultou uma fonte indisponível.
   A memória desta skill não substitui a leitura dos materiais atuais.

## Aplicar a autoridade das fontes

- Priorizar o relatório de atividades/desenvolvimento e o texto atual da monografia.
  Ler `Documentation/RetrospectivaTecnicaDesenvolvimentoSafeWatchInsight.md` e
  trechos pertinentes de `Documentation/RelatorioAuditoriaTecnicaPreEscritaTCC.md`.
- Usar relatos humanos para motivações, decisões e atividades fora do Git; usar
  retrospectivas de chats por último. Preferir as mais recentes para estado atual,
  sem apagar o histórico.
- Resolver divergências pela evidência específica. Um objetivo escrito não comprova
  uma entrega; uma versão atual não comprova o que participantes usaram antes.
  Consultar código/documentação técnica pontualmente quando necessário, sem
  transformar a escrita em nova auditoria ou tarefa de implementação.
- Identificar versão/período técnico descrito e separar avaliação com usuários de
  evoluções posteriores. Preservar datas aproximadas e divergências não resolvidas.
- Manter proveniência detalhada nos auxiliares. No texto acadêmico, explicar o método
  e citar bibliografia/instrumentos pertinentes, sem narrar de qual chat veio cada fato.

## Respeitar o escopo e preservar os originais

| Seção | Intervenção permitida no escopo combinado |
| --- | --- |
| 3.4 Engenharia de software aplicada à solução | Complementar fundamentos pertinentes ao processo documentado. |
| 3.4.1 Tecnologias utilizadas | Preencher tecnologias, funções e justificativas sustentadas. |
| 4 Metodologia | Explicar pesquisa, período, participantes, fontes, coleta, tratamento e uso dos dados. |
| 4.1 Projeto do sistema | Relacionar requisitos, personas, casos de uso, arquitetura, banco e protótipos. |
| 4.2 Desenvolvimento da plataforma | Descrever implementação, integração, revisões e testes. |
| 5 Resultados e discussão | Apresentar entregas e avaliação, interpretar contribuições e limites. |
| 6 Conclusão | Responder aos objetivos e indicar continuidade, sem novos resultados. |

- Confirmar títulos na versão de trabalho; a numeração pode mudar.
- Preservar 3.4.2 Trabalhos correlatos e demais partes fora do escopo. A autorização
  para complementar 3.4 não permite reescrever todas as suas subseções.
- Acrescentar às referências somente entradas verificadas necessárias aos novos
  trechos. Registrar ajustes relacionados em outras partes no auxiliar da dupla.
- Preservar o DOCX original e `fontes/monografia/mono-001-texto-recebido.md`.
  Redigir na cópia de trabalho existente ou criar uma cópia identificada em
  `Documentation/TCC/redacao/`. Comparar o diff e preservar conteúdo fora do escopo.
  Usar skills de DOCX/PDF disponíveis quando o formato exigir renderização.
- Não modificar código, dependências, banco, infraestrutura ou visibilidade do
  repositório. Não executar testes da aplicação apenas para editar texto acadêmico.

## Preparar a escrita sem inventar etapas

1. Relacionar as seções solicitadas às evidências, referências a verificar e lacunas
   que realmente afetam a redação. Reutilizar os auxiliares existentes.
2. Conferir período, recrutamento, participantes e instrumentos. Distinguir o
   questionário inicial, as entrevistas e o questionário de avaliação.
3. Explicar como dificuldades se converteram em requisitos e como os resultados
   orientam melhorias; evitar uma simples lista cronológica.
4. Fundamentar a classificação no que foi feito. Não atribuir automaticamente
   estudo de caso, pesquisa-ação, métodos mistos, análise de conteúdo, amostragem
   aleatória ou instrumentos validados por haver entrevistas/questionários.
5. Separar testes técnicos e avaliação por participantes. Não atribuir à avaliação
   de agosto funcionalidades implementadas depois.
6. Pesquisar e ler fontes externas antes de incluí-las. Procurar dados essenciais
   nos materiais antes de perguntar. Avançar nas partes sustentadas; deixar
   pendências localizadas no auxiliar, sem preenchê-las por suposição.

## Escrever com clareza e proporcionalidade

- Escrever em português brasileiro, com prosa acadêmica natural, precisa e concisa,
  mantendo terminologia e voz compatíveis com a monografia. Desenvolver uma ideia
  por parágrafo e ligar decisões às necessidades e aos resultados.
- Explicar termos técnicos quando necessário. Selecionar detalhes que ajudam a
  compreender a pesquisa; evitar inventário de bibliotecas, diário de commits,
  logs, hashes e linguagem de auditoria no corpo do TCC.
- Evitar frases genéricas, autoelogios, repetição e adjetivos absolutos. Não fabricar
  experiências, falas ou citações para humanizar; não prometer evasão de detectores.
- Apresentar contribuições e funcionamento comprovado com segurança. Delimitar
  limitações e melhorias como continuidade, sem tom de derrota e sem ocultá-las.
- Descrever offline pelo alcance real. Não substituir funcionamento parcial por
  ausência total de funcionamento, nem chamá-lo de completo.
- Descrever o apoio de ChatGPT/Codex quando pertinente, preservando decisões,
  orientação, revisão, critérios de avanço e pequenas alterações manuais dos autores.
  Conferir exigências acadêmicas pertinentes, sem inventar política institucional.
- Tratar PMBOK como influência de conteúdos vistos em aula quando sustentado;
  não declarar aplicação integral. Não afirmar leitura histórica de Código Limpo
  sem evidência. Não inferir TDD, SDD ou Scrum por existir documentação e testes.

## Referências e citações

- Seguir o padrão efetivamente usado na monografia para novas citações e entradas,
  preservando escolhas compatíveis com ABNT e orientações institucionais. Não
  impor outro estilo nem padronizar toda a bibliografia nesta tarefa.
- Inspecionar exemplos do DOCX quando o Markdown perder negrito/itálico. Não
  reproduzir erros, campos incompletos ou URLs inválidas como convenções. Registrar
  conflitos normativos pertinentes no auxiliar.
- Verificar existência, autoria, título, edição, ano e conteúdo em fontes confiáveis;
  preferir editoras, repositórios institucionais e documentação oficial. Registrar
  URL, data real de consulta e páginas efetivamente lidas nos auxiliares.
- Vincular cada fonte à afirmação sustentada. Não inventar DOI, página, edição,
  resultados ou data de acesso; não citar original não lido como se o tivesse lido.
- Diferenciar fundamentação consultada agora de materiais usados historicamente.
  Não incluir livros por prestígio nem citar a página inicial de uma tecnologia
  como suporte automático a qualquer afirmação técnica.
- Se a verificação externa estiver indisponível, registrar a referência como
  pendente no auxiliar e não apresentá-la como validada no texto final.

## Figuras, apêndices e revisão da dupla

- Explicar documentos de projeto em um ou dois parágrafos, ampliando quando
  necessário. Selecionar diagramas úteis ao argumento, sem copiar todos ao corpo.
- Destinar material da equipe a apêndices e material de terceiros a anexos conforme
  o padrão adotado. Não prometer apêndice inexistente.
- Para figura necessária, inserir marcador editorial na cópia de trabalho, com
  título provisório e ponto de inserção. Fornecer recorte PlantUML fiel à fonte
  ou instrução precisa de exportação/captura. Não inventar entidades/relações.
- Atualizar `REVISAO_DA_DUPLA.md` com localização, ação, razão, arquivo-fonte,
  legenda/fonte da figura e estado. Separar ajustes fora do escopo de lacunas
  factuais e montagem. Evitar repetir pendências já registradas.
- Anonimizar participantes, contatos, rostos e empregadores desnecessários; usar
  identificadores estáveis sem inferir ligações entre conjuntos de participantes.
  Preservar autores das referências e não publicar originais sensíveis no Git.

## Conferir e entregar

Conferir coerência entre objetivos/método/resultados/conclusão, cronologia e versões,
contagens e denominadores, citações/referências, alcance offline, fidelidade dos
diagramas e diff do escopo. Não exigir maturidade de produto comercial para
reconhecer a contribuição acadêmica. Não considerar uma etapa concluída só por
existir uma instrução nesta skill.

Ao gerar prompt para Codex, indicar fontes, arquivo de trabalho, seções, saídas e
critérios de revisão. Ao redigir, entregar texto e auxiliar; ao preparar, entregar
somente a preparação solicitada. Relatar o que mudou e o que falta sem alegar
execução de testes ou validações não realizadas.
