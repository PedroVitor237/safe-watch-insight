# Acordos para a escrita acadêmica

Consolidação das instruções dos autores recebidas até 16/10/2026. Este arquivo
orienta a preparação da monografia do Safe Watch Insight. Não modifica o escopo
de implementação da plataforma nem constitui texto final do TCC.

## Objetivo e papel do assistente

O assistente deve conduzir a organização das fontes, identificar lacunas reais,
ajudar nas decisões de escrita e gerar os prompts para o Codex executar a redação
nos arquivos. O prompt inicial era dirigido ao próprio assistente como guia;
o trabalho não se limita a acrescentar instruções a um prompt recebido.

## Prioridade das fontes

1. Relatório das atividades/desenvolvimento no repositório e texto atual da
   monografia: fontes principais para a trajetória do projeto e a continuidade
   acadêmica, respectivamente.
2. Relatos humanos dos autores, especialmente sobre motivações, entrevistas,
   formulários, decisões e participação pessoal.
3. Relatórios retrospectivos dos chats; os mais recentes têm preferência para
   compreender o estado mais recente, sem apagar decisões e etapas anteriores.

Uma divergência deve ser conciliada com a evidência pertinente. A monografia
orienta a continuidade textual, mas não transforma uma funcionalidade desejada
em entrega comprovada. O relato humano pode completar atividades não registradas
no Git. Consultar as fontes existentes antes de pedir novamente informações aos
autores. Recuperar datas importantes quando disponíveis e preservar aproximações.

A proveniência detalhada pertence aos arquivos auxiliares. O texto acadêmico
não precisa anunciar que cada informação veio de um chat ou relato humano.
Citações bibliográficas, descrição dos instrumentos da pesquisa e atribuição de
fontes externas continuam necessárias quando pertinentes.

## Escopo autorizado

| Parte da monografia | Trabalho previsto |
| --- | --- |
| 3.4 Engenharia de software aplicada à solução | Complementações pertinentes ao processo efetivamente adotado, documentação, organização e testes. |
| 3.4.1 Tecnologias utilizadas | Preenchimento com tecnologias efetivamente empregadas, função no projeto e fontes oficiais. |
| 4 Metodologia | Caracterização fundamentada da pesquisa, período, objetivos, fontes, procedimentos, tratamento e emprego dos dados. |
| 4.1 Projeto do sistema | Requisitos, personas, casos de uso, arquitetura, modelagem do banco e protótipos. |
| 4.2 Desenvolvimento da plataforma | Implementação, funcionalidades, integração, revisões e testes. |
| 5 Resultados e discussão | Entregas, avaliação pelos participantes, interpretação, limites e melhorias. |
| 6 Conclusão | Relação dos resultados com os objetivos e continuidade do trabalho. |

A autorização foi ampliada pelo autor para todas as seções 4.1, 4.2, 5 e 6.
Não realizar revisão geral como banca ou orientador. Mudanças em outras partes
que sejam necessárias em decorrência da nova escrita devem ser indicadas no
[arquivo de revisão da dupla](./REVISAO_DA_DUPLA.md), com motivo e localização.
Referências utilizadas nos novos trechos devem ter entradas correspondentes.

## Tom e contribuição acadêmica

O autor informou que recebeu orientação de que a proposta e a qualidade da
monografia teriam maior peso na avaliação, sem exigir necessariamente uma
plataforma integralmente desenvolvida. Isso é uma orientação relatada, não um
regulamento institucional verificado nem uma previsão de aprovação.

A escrita deve valorizar o problema investigado, a proposta, a documentação,
as funcionalidades entregues, a experiência de avaliação e a base construída
para evolução. Segundo o autor, uma parte substancial já funciona e foi útil
nos testes com usuários. As melhorias e os polimentos fazem parte da continuidade
do desenvolvimento. Evitar tom de derrota, pedido de desculpas ou narrativa
centrada no que falta.

Descrever o alcance real com segurança e proporcionalidade: apresentar primeiro
as contribuições sustentadas pelas fontes e, no contexto adequado, os limites e
próximos passos. Não converter resultados favoráveis em prova de eficácia social,
redução de acidentes, segurança integral ou ausência de falhas. Tampouco reduzir
uma entrega funcional a uma mera intenção por não cobrir todo o escopo futuro.

No offline, distinguir o incremento funcional para inspeções já disponíveis no
dispositivo das ampliações futuras. Uma limitação delimitada não anula a entrega.
O objetivo amplo, a implementação descrita e a conclusão precisam ser coerentes.

## Estilo e nível de detalhe

Produzir prosa acadêmica natural, clara, concisa e articulada. Explicar escolhas
e suas razões; evitar uma lista de ferramentas ou um diário de commits. Detalhes
técnicos entram quando ajudam a compreender o método ou a contribuição.
Não transportar hashes, logs, identificadores de auditoria e toda a rastreabilidade
para o corpo da monografia. Não prometer resultados em detectores de IA.

## Referências e enquadramento metodológico

- Nunca inventar referências, autores, títulos, edições, datas, páginas ou DOI.
- Pesquisar na internet a existência e os dados das fontes antes da redação;
  ler os trechos pertinentes e verificar se sustentam a afirmação.
- Usar citações e referências em padrão ABNT, conferindo as normas aplicáveis
  e as orientações institucionais vigentes. Não supor que um ebook antigo
  substitui essa verificação.
- Seguir o padrão de citações e referências já usado na monografia nas novas
  entradas, conforme instrução de 16/10/2026. Preservar escolhas compatíveis com
  ABNT; não reproduzir campos incompletos, URLs inválidas ou erros como convenções.
  Não padronizar toda a bibliografia nesta tarefa.
- PMBOK: o autor relata influência de conteúdos vistos em aula na organização
  e documentação inicial. Não declarar aplicação integral do guia ou adoção
  ortodoxa de sua metodologia. Confirmar edição/conteúdo antes de citar.
- Código Limpo: foi cogitado como apoio teórico; não há confirmação de que o
  livro tenha sido consultado durante o desenvolvimento. Não inventar esse uso
  histórico. Eventual leitura posterior pode fundamentar análise atual.
- TDD, SDD, Scrum e outros rótulos não devem ser atribuídos apenas por haver
  testes, documentação, IA ou desenvolvimento por etapas. Descrever primeiro
  o processo realizado e avaliar o enquadramento com as fontes.
- Documentações oficiais das tecnologias foram consultadas, segundo o autor,
  principalmente para esclarecer dúvidas e resolver erros. Citar apenas
  tecnologias e conteúdos pertinentes, com os dados efetivamente verificados.

## Participação humana e ferramentas de IA

O autor definiu ideias, escopo e decisões, refinou prompts com ChatGPT, orientou
o Codex, revisou entregas, definiu condições para avançar e fez pequenas alterações
manuais no código. ChatGPT apoiou esboços, documentação e prompts; Codex apoiou
implementação e revisões por fases/tarefas, seguidas de testes e revisão humana.

O autor inicialmente preferiu omitir IA se fosse possível, mas aceitou uma
descrição pertinente de seu uso efetivo e documentado. A direção atual permite
uma apresentação breve e proporcional do desenvolvimento assistido, preservando
a atuação humana. A redação final deve observar as exigências acadêmicas
aplicáveis; nenhuma política institucional específica foi estabelecida aqui.
Não apresentar IA, documentação ou testes como garantia absoluta de qualidade.

## Documentação, diagramas e materiais complementares

Dicionário de dados, diagrama de classes, modelo relacional/lógico e modelo físico
são documentos próprios utilizados no desenvolvimento. Resumir sua finalidade
e contribuição em um ou dois parágrafos, ou mais quando necessário, sem copiar
documentos inteiros para o corpo do TCC.

Selecionar materiais pertinentes para apêndices quando elaborados pela equipe
e anexos quando provenientes de terceiros, conforme a normalização adotada.
Não incluir automaticamente todos os diagramas. Quando um recorte no corpo for
necessário, indicar o ponto de inserção e a legenda e fornecer PlantUML fiel à
documentação ou instrução precisa do trecho a exportar/capturar. Não inventar
entidades ou relações para ilustrar o texto.

## Preservação e publicação

Preservar o DOCX original; escrever posteriormente em uma cópia de trabalho
Markdown ou em outro arquivo, mantendo comparabilidade das alterações. Não
confundir a transcrição de referência com o texto revisado.

Foi autorizada a anonimização de dados sensíveis ou pessoais desnecessários.
Priorizar o processo, sem publicar nomes, rostos, contatos ou empregadores dos
participantes. Não apagar nomes de autores de obras citadas. Os originais dos
anexos ficam preservados fora deste diretório público; os arquivos aqui explicam
o tratamento aplicado. Não houve decisão para mudar a visibilidade do repositório.

## Skill e sequência de trabalho

A intenção inicial era criar a skill no último passo de preparação. Após a análise
seletiva do ebook, em 16/10/2026, o autor solicitou avançar para sua criação com as
informações já levantadas. A skill está em
[escrever-tcc-safe-watch](../../.agents/skills/escrever-tcc-safe-watch/SKILL.md).
Ela incorpora as orientações da dupla, o padrão de referências da monografia e os
limites de escopo. Sua criação não significa que a conciliação integral das fontes,
a seleção das referências ou a redação estejam concluídas.

O ebook foi identificado como Prodanov e Freitas, 2. ed., Feevale, 2013. Seu mapa de
leitura e os limites de uso estão nas
[notas metodológicas da skill](../../.agents/skills/escrever-tcc-safe-watch/references/metodologia-e-referencias.md).
Usar seus conceitos metodológicos, conferindo a normalização aplicável separadamente.

O plugin “Humanização de Texto”, atribuído a Felipe Carvalho Mouco, foi discutido,
mas não foi instalado, validado ou adotado como dependência. O prompt de execução
foi produzido posteriormente nesta mesma data; sua existência
não significa que a redação tenha sido executada.

## Entrada DOCX e prompt de execução — atualização de 16/10/2026

O autor solicitou o diretório para o DOCX e autorizou o uso do arquivo já enviado.
Em seguida, dispensou a anonimização. A monografia integral foi preservada em
[fontes/monografia/docx/monografia-atual.docx](./fontes/monografia/docx/monografia-atual.docx),
sem alterações nos bytes. Essa instrução atualiza a orientação anterior de manter
somente sua cópia anonimizada no repositório. Não altera retrospectivamente as
fontes já preservadas nem publica originais da pesquisa com participantes.

O [prompt de conciliação e redação](./prompts/01-conciliar-e-redigir.md) orienta o
Codex a concluir a preparação necessária e produzir uma cópia DOCX de trabalho,
os trechos em Markdown e a revisão auxiliar. A entrada deve permanecer intacta.
A geração do prompt não executou a redação nesta rodada.
