# Continuidade da preparação e escrita do TCC

Atualizado em **16/10/2026**, após execução do
[prompt de conciliação e redação](./prompts/01-conciliar-e-redigir.md) com a
[skill escrever-tcc-safe-watch](../../.agents/skills/escrever-tcc-safe-watch/SKILL.md).
A pausa por limite de uso preservou o Markdown inicial; a retomada conferiu a
entrada e concluiu a integração e os auxiliares, sem alterações da aplicação.

## Estado atual

- Conciliação concluída para o escopo da escrita, confrontando monografia,
  retrospectiva, atualizações da auditoria, relato humano, pesquisa e projeto.
- Recorte fixado: percurso de maio a outubro de 2026; avaliação de 28–31/08;
  estado técnico com integrações até 13/10. Divergências remanescentes ficaram
  localizadas no auxiliar, sem afirmações inventadas.
- Treze referências novas verificadas em fontes primárias; páginas/trechos,
  datas de consulta e metadados registrados em
  [referencias-verificadas.md](./redacao/referencias-verificadas.md).
- Redigidas 3.4 (complementação), 3.4.1, 4, 4.1, 4.2, 5 e 6 em
  [monografia-trabalho.docx](./redacao/monografia-trabalho.docx), com as referências
  integradas. [secoes-redigidas.md](./redacao/secoes-redigidas.md) permite revisar
  somente o conteúdo acrescentado.
- Tabela 1 editável contém as 13 questões fechadas; a questão aberta 13, seus
  três comentários e a abstenção são discutidos no texto. Não há SUS na
  monografia nem explicação sobre ausência de escore, conforme instrução do autor.
- [Figura 1](./redacao/figuras/fig-01-arquitetura.puml) preparada como recorte fiel,
  com marcador de inserção no DOCX e instruções na revisão da dupla.
- DOCX original, MONO-001 e fontes de pesquisa preservados. Comparação do XML
  confirmou conteúdo fora do escopo e componentes do documento; renderização
  e revisão visual concluídas. Detalhes em
  [validacao-editorial.md](./redacao/validacao-editorial.md).
- [REVISAO_DA_DUPLA.md](./REVISAO_DA_DUPLA.md) atualizada com conciliações, limites,
  figuras, propostas de apêndices e ajustes externos ao escopo. PENDENCIAS.md
  conserva o histórico e aponta para o estado conciliado.
- A redação e a validação não envolveram execução da aplicação, instalação de
  dependências ou merge. Após a entrega, o autor solicitou explicitamente o
  commit e o push dos arquivos na branch documental, em 16/10/2026.

## Baseline e preservação

Branch de trabalho: `docs/coleta-fontes-tcc`. HEAD documental de entrada:
`c67b4d8eeb323f361b606fef1abdfdc3701b4bed`. O estado técnico corresponde à integração
`819c35a582f2e1e799d6ae71857d2dd4706723ed`; a versão descrita não é uma comprovação
independente do deploy de agosto nem da publicação de cada correção.

Entrada: `fontes/monografia/docx/monografia-atual.docx`, SHA-256
`474dbdd725b191a7d8853f3e954d9f3626d2bbcecd5bdc3d773b69846ab6fe77`.
A cópia de trabalho conserva autores, estrutura, conteúdo recebido de 3.4 e a
subseção 3.4.2 **Trabalhos relacionados**, além das demais partes não autorizadas.

## Próxima etapa da dupla

1. Ler o DOCX e revisar os trechos entregues. Conferir propostas REV-01 a REV-07,
   especialmente a identificação de Guerra (2020), o exemplo arquitetural antigo,
   resumos vazios e os títulos herdados dos apêndices. Essas partes não foram
   reescritas nesta tarefa.
2. Exportar o recorte da Figura 1, substituir o marcador e conferir legibilidade,
   título e fonte. Escolher os materiais que efetivamente integrarão apêndices;
   não criar remissões a documentos ainda não inseridos.
3. Concluir a montagem: atualizar sumário, conferir numeração/continuidade das
   páginas e quebras de seção, e renderizar novamente após a edição final.
4. Se recuperados os materiais ausentes, complementar somente as afirmações
   pertinentes: formulário inicial, datas conflitantes de marcos e edição
   estudada em aula. Não reconstruir dados individuais da avaliação a partir
   de resultados agregados.

## Como retomar

Partir de `redacao/monografia-trabalho.docx`, inspecionando qualquer contribuição
posterior da dupla antes de editar. Não regenerar a saída sobre novas alterações
nem substituir o DOCX original. Consultar o Markdown para comparação textual,
o auxiliar de referências para suporte bibliográfico e REVISAO_DA_DUPLA.md para
os pontos ainda abertos. Os intermediários de renderização ficaram em `/tmp` e
não fazem parte da entrega versionável.

A redação autorizada está concluída; a revisão autoral e a montagem final
permanecem distintas da implementação futura da plataforma. Não reabrir a coleta
inteira nem executar nova auditoria de software para retomar a edição acadêmica.
