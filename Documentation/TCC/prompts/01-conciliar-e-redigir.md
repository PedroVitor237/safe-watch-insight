# Conciliar as fontes e redigir as seções autorizadas do TCC

Use $escrever-tcc-safe-watch para executar esta tarefa no repositório
`PedroVitor237/safe-watch-insight`. Se a skill não aparecer no seletor, leia
`.agents/skills/escrever-tcc-safe-watch/SKILL.md` e suas referências diretamente.

Quero que você conclua a preparação necessária e redija o texto nos arquivos,
seguindo as etapas abaixo. Não pare apenas em um plano ou em outro prompt.

## 1. Preparação e preservação

- Leia AGENTS.md e os documentos exigidos por ele. Confira branch, estado do Git e
  alterações preexistentes. Trabalhe na branch documental que contém estes arquivos
  (`docs/coleta-fontes-tcc`, salvo se já tiver sido integrada). Não descarte trabalho
  alheio, não faça merge, reset destrutivo ou force push.
- Leia `Documentation/TCC/ACORDOS_DE_ESCRITA.md`, `PLANO_DE_CONTINUIDADE.md`,
  `INDICE_FONTES.md`, `REVISAO_DA_DUPLA.md` e as fontes pertinentes.
- A monografia de referência está em
  `Documentation/TCC/fontes/monografia/docx/monografia-atual.docx`.
  Leia o documento completo para compreender voz, estrutura, referências e objetivos.
  O autor autorizou explicitamente manter esse DOCX integral, sem anonimização.
  Preserve nomes e formatação; não altere o arquivo de entrada. Os registros de
  pesquisa já anonimizados permanecem como estão.
- Consulte o README desse diretório e registre o hash da entrada. Se o usuário
  tiver substituído o arquivo por versão mais recente, use a nova entrada real e
  registre essa atualização. Não force a versão antiga por causa do hash registrado.
- `fontes/monografia/mono-001-texto-recebido.md` é uma transcrição histórica auxiliar;
  não a sobrescreva. Para texto, estrutura e formatação da monografia, prevalece o
  DOCX de entrada, especialmente se ele tiver sido atualizado.

## 2. Conciliação das fontes

Priorize o relatório de desenvolvimento e a monografia, depois os relatos humanos,
e por último os relatórios de chats; entre estes, os mais recentes ajudam a explicar
o estado atual. Leia a retrospectiva técnica e as partes pertinentes da auditoria:

- `Documentation/RetrospectivaTecnicaDesenvolvimentoSafeWatchInsight.md`;
- `Documentation/RelatorioAuditoriaTecnicaPreEscritaTCC.md`.

Confronte-os com o relato humano, orientações da dupla, registros das entrevistas,
avaliação, documentação de requisitos, arquitetura e modelagem. Procure respostas
às pendências nos arquivos antes de fazer perguntas. Consulte código pontualmente
se necessário para resolver uma afirmação técnica, sem executar uma nova auditoria.

Delimite o período da pesquisa, a versão/estado técnico descrito e a avaliação com
usuários. Não atribua aos testes de agosto funcionalidades implementadas depois.
Não transforme datas aproximadas em exatas. Mantenha a diferença entre três registros
de entrevistas e quatro avaliações; não invente correspondência entre pessoas.

Registre conciliações e lacunas relevantes em `REVISAO_DA_DUPLA.md`, atualizando
pendências existentes quando resolvidas. Detalhes de origem, commits e verificações
ficam nos auxiliares, sem sobrecarregar o texto acadêmico.

## 3. Referências e enquadramento

Pesquise na internet, confirme os dados bibliográficos e leia os trechos necessários
antes de citar. Prefira fontes primárias, editoras, repositórios institucionais e
páginas específicas da documentação oficial. Nunca invente referências, páginas,
autores, edições, DOI ou datas de acesso.

Siga o padrão de citações e referências usado na monografia, preservando escolhas
compatíveis com ABNT e as orientações institucionais aplicáveis. Não faça uma reforma
bibliográfica geral nem reproduza campos incompletos como se fossem convenções.
Adicione apenas as referências efetivamente utilizadas nos novos trechos. Preserve
as entradas preexistentes; indique correções relacionadas fora do escopo no auxiliar.

Use as notas da skill sobre Prodanov e Freitas (2013) para localizar a obra e os
conceitos metodológicos. Verifique a edição/conteúdo pertinente do PMBOK antes de
citá-lo. Trate PMBOK como influência dos conteúdos estudados, sem declarar adoção
integral. Código Limpo é candidato a fundamentação, não leitura histórica comprovada.
Não atribua TDD, SDD, Scrum, estudo de caso, métodos mistos ou análise de conteúdo
formal apenas porque houve documentação, testes, entrevistas e questionários.

Registre em `Documentation/TCC/redacao/referencias-verificadas.md` os dados das novas
fontes, links, data real da consulta, páginas/trechos e afirmações sustentadas. Esse
arquivo é de apoio; a bibliografia acadêmica deve estar também no DOCX de saída.

## 4. Redação autorizada

Crie `Documentation/TCC/redacao/monografia-trabalho.docx` a partir da entrada,
preservando todas as partes não autorizadas. Se já existir trabalho nesse arquivo,
inspecione-o e continue sem sobrescrever contribuições posteriores.

Redija ou complemente somente:

- **3.4 Engenharia de software aplicada à solução:** complementações necessárias
  ao processo efetivo. Preserve a subseção 3.4.2 Trabalhos correlatos.
- **3.4.1 Tecnologias utilizadas:** tecnologias realmente utilizadas, suas funções,
  justificativas pertinentes e referências oficiais.
- **4 Metodologia:** natureza/objetivos da pesquisa, período, fontes, participantes,
  instrumentos, coleta, tratamento dos dados e como foram empregados.
- **4.1 Projeto do sistema:** necessidades, requisitos, personas, casos de uso,
  arquitetura, modelos do banco e protótipos, conforme a documentação.
- **4.2 Desenvolvimento da plataforma:** implementação, integração, documentação,
  revisões e testes, incluindo a atuação humana e o apoio de IA quando pertinente.
- **5 Resultados e discussão:** entregas, interpretação da avaliação e relação com
  objetivos/referencial, alcance real e melhorias identificadas.
- **6 Conclusão:** contribuição e resposta aos objetivos nos limites das evidências,
  com continuidade do desenvolvimento.

Confira a numeração/títulos reais do DOCX. Não reescreva introdução, objetivos,
resumos, trabalhos correlatos ou outras seções. Se algo nessas partes precisar de
ajuste por consequência direta da nova escrita, explique a proposta no auxiliar.
Não transforme este trabalho em avaliação geral da monografia.

Escreva em português brasileiro com linguagem acadêmica natural, clara e concisa,
compatível com o texto existente. Explique relações entre problema, decisões e
resultados. Evite diário de commits, inventário de ferramentas e linguagem de auditoria.
Não anuncie a cada parágrafo que a informação veio de chat ou relato humano.

Valorize proposta, entregas funcionais e avaliação favorável. Seja preciso sobre
limites, sem tom de derrota. Não trate a plataforma como completa nem reduza uma
entrega funcional a mera intenção. Descreva offline conforme seu alcance documentado.
Percepção favorável de quatro participantes não comprova eficácia em larga escala,
segurança técnica absoluta ou redução de acidentes. Confira denominadores e use
contagens junto aos percentuais quando isso facilitar a interpretação.

Ao descrever o desenvolvimento assistido por IA, preserve a atuação dos autores:
ideias e decisões, orientação/refinamento de prompts, revisão das entregas, critérios
para avançar e pequenas alterações manuais no código. Não atribua à IA autoria de
entrevistas, decisões humanas ou validações não realizadas.

## 5. Diagramas e revisão da dupla

Resuma a contribuição do dicionário de dados, diagramas e modelos em poucos parágrafos
adequados à seção. Não copie todos os documentos/diagramas para o corpo do TCC.

Quando uma figura for necessária, indique sua posição no texto com marcador claro,
título e fonte provisórios. Gere o recorte PlantUML fiel à documentação em
`Documentation/TCC/redacao/figuras/`, ou forneça instrução precisa do trecho a exportar.
Não invente entidades/relações. Recomende apêndices para material da equipe e anexos
para material de terceiros. Não declare que um apêndice já está incluído se não está.

Atualize `Documentation/TCC/REVISAO_DA_DUPLA.md` com:

- figuras necessárias, localização, legenda/fonte, arquivo e instrução de inserção;
- materiais sugeridos para apêndices/anexos e sua relação com os trechos;
- alterações relacionadas fora do escopo, com motivo e proposta localizada;
- dúvidas factuais essenciais ainda abertas, sem repetir questões já resolvidas;
- itens de montagem final, incluindo atualização do sumário e paginação se necessária.

## 6. Validação e entrega

Salve também `Documentation/TCC/redacao/secoes-redigidas.md` com os novos trechos,
títulos e referências utilizadas, para facilitar revisão e comparação. A entrega
principal é o DOCX integrado, não apenas uma resposta no chat.

Compare entrada e saída para verificar preservação das seções fora do escopo, nomes,
conteúdo preexistente, estilos, cabeçalhos/rodapés e elementos gráficos. Confira a
correspondência de citações/referências, cronologia, números, limites técnicos e
coerência entre objetivos, método, resultados e conclusão. Não execute a aplicação,
instale dependências no projeto ou altere código para esta tarefa.

Renderize o DOCX e revise a apresentação se houver ferramentas disponíveis. Evite
substituir todo o documento por conversão genérica de Markdown que perca a formatação.
Se uma limitação concreta impedir integração/renderização, entregue os trechos
completos em Markdown e descreva exatamente o que falta no DOCX; não alegue validação
visual que não realizou. Não inclua intermediários de renderização no Git.

Avance nas partes sustentadas sem pedir confirmações rotineiras. Se uma lacuna impedir
uma afirmação, use formulação proporcional às evidências ou registre a pendência;
não preencha com fatos inventados. Faça perguntas apenas sobre impedimentos essenciais
que não puder resolver pelas fontes, após concluir o restante possível.

Atualize o plano de continuidade com o estado real. Ao terminar, informe os arquivos,
as seções trabalhadas, as verificações realizadas e as pendências para a dupla.
Não faça merge ou publique arquivos adicionais por conta própria.
