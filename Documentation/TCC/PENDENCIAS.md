# Pendências e divergências para revisão do TCC

Entradas: CHAT-001 e CHAT-002, recebidas em 15/10/2026. Este registro organiza
questões de evidência e redação; não altera decisões técnicas nem o backlog de
implementação. As pendências permanecem abertas, com novos elementos de
CHAT-002 para as questões TCC-P004, TCC-P008 e TCC-P009.

Fonte de origem: [CHAT-001 — Estrutura do TCC ADS](./fontes/chats/ads-tcc-duvidas-tecnicas/chat-001-estrutura-do-tcc-ads.md).
Segunda fonte: [CHAT-002 — Lovable para FrontEnd TCC](./fontes/chats/ads-tcc-duvidas-tecnicas/chat-002-lovable-para-frontend-tcc.md).
Os contrapontos documentais foram consultados no commit
`819c35a582f2e1e799d6ae71857d2dd4706723ed`, conforme o
[índice das fontes](./INDICE_FONTES.md).

| ID | Questão ou diferença | Evidência disponível e seu limite | O que falta conferir / fonte responsável |
| --- | --- | --- | --- |
| TCC-P001 | Quando ocorreram a concepção e a passagem de cartilha para plataforma de inspeções? | CHAT-001 §§ 3 e 4 registra sequência e decisão, sem datas individuais. O recebimento em 15/10/2026 não data os fatos. | Histórico original, documentos anteriores ou confirmação de autores; manter data desconhecida enquanto não houver evidência. |
| TCC-P002 | O módulo educativo foi excluído, adiado ou mantido como secundário? | CHAT-001 §§ 4.2, 6.5 e 12.1 confirma prioridade das inspeções, sem exclusão formal da cartilha. | Documento de Requisitos, monografia e decisão dos autores; consultar orientadora se houver mudança do escopo acadêmico. |
| TCC-P003 | Quais requisitos do MVP foram aprovados e quais vieram de entrevistas? | CHAT-001 §§ 5, 7 e 12.2 contém lista preliminar, sem aprovação formal ou critérios de aceite. | Documento de Requisitos consolidado e rastreio das fontes de cada requisito; não atribuir toda a lista a entrevistas. |
| TCC-P004 | Como a proposta de Next.js evoluiu para a base TanStack Start? | CHAT-001 § 6.2 descreve proposta preliminar; TECH_DECISIONS.md / Framework registra preservação da base Lovable + TanStack Start. CHAT-002 §§ 5.2 e 10.1 acrescenta o relato de que o usuário informou frontend já feito em TanStack após a sugestão de Next.js. | Conciliação parcial: há evidência narrativa de esclarecimento da base existente, sem comprovação de migração. Conferir datas, histórico e relatório principal; não presumir que Next.js chegou a ser implementado. |
| TCC-P005 | Qual foi a evolução da proposta de sincronização? | CHAT-001 §§ 6.3 e 12.3 classifica “última alteração vence” como sugestão não confirmada. TECH_DECISIONS.md / Offline registra idempotência e bloqueio de conflito por revisão, sem Last Write Wins, em 07/08/2026. | Relacionar a decisão técnica aos relatórios e testes correspondentes; não atribuir a estratégia posterior a este chat preliminar nem declarar nova validação nesta coleta. |
| TCC-P006 | Quando o upload preparado passou a ser entrega real e qual seu alcance? | CHAT-001 §§ 6.4 e 12.4 registra integração futura. TECH_DECISIONS.md / Upload de Evidências registra upload online em 06/08/2026 e mantém binários offline adiados. | Conciliar com retrospectiva, relatórios e evidências de implementação; preservar a diferença entre upload online e sincronização offline. |
| TCC-P007 | Quais entrevistas foram realizadas e quais registros estão disponíveis? | CHAT-001 §§ 2, 10.1 e 12.6 menciona anotações a enviar, mas não as apresenta. Isso não comprova participantes, datas, instrumentos ou resultados. | Registros originais de autores; confirmar realização, método e tratamento acadêmico com os autores e a orientadora. |
| TCC-P008 | Que testes e homologações podem sustentar a descrição da solução? | CHAT-001 §§ 8 e 9 e CHAT-002 § 7 não fornecem execuções de testes ou homologação. A análise do PDF descrita em CHAT-002 é documental. A ausência é local a essas conversas, não uma conclusão sobre o projeto completo. | Relatório principal, relatórios de execução e código pertinente; distinguir testes de software de avaliação com usuários e registrar limites do offline. |
| TCC-P009 | Qual metodologia foi efetivamente aplicada e como cada integrante e a IA participaram? | CHAT-001 §§ 11.3 e 11.5 descreve apoio consultivo; CHAT-002 §§ 6.4, 6.6 e 9 registra preparação de prompts sem confirmação de execução nem divisão individual de tarefas. Percentuais informais sobre Lovable não são medidas de produtividade. | Relatos dos autores e registros efetivos de uso, revisão e incorporação dos resultados; não atribuir código ou documentos à IA apenas por existir um prompt. Validar a formulação acadêmica com a orientadora. |
| TCC-P010 | Quais decisões receberam aprovação acadêmica e quais materiais de origem ainda precisam ser recuperados? | CHAT-001 §§ 10 e 12.7 não apresenta aprovação da orientadora; vídeo e entrevistas não estavam acessíveis ao relator, e o resumo técnico é apenas descrito no relatório recebido. | Confirmação dos autores/orientadora e recuperação dos materiais originais quando pertinentes; ausência no relatório não significa ausência de aprovação em outro contexto. |
| TCC-P011 | Quais eram os formatos e critérios oficiais da Atividade 1? | CHAT-002 §§ 2.1 e 6.3 afirma consulta a PDF de quatro páginas, com especificação de ao menos cinco telas em PDF/DOCX, wireframes, frontend e guia de uma a duas páginas. Os prompts descritos pedem Markdown. O PDF não foi recebido nesta coleta. | Recuperar o enunciado original, confirmar critérios e possíveis conversões dos artefatos; avaliação pelo professor quando houver dúvida. Não tratar o relato como nova leitura direta do PDF. |
| TCC-P012 | Os wireframes foram produzidos e a representação escolhida foi aceita? | CHAT-002 §§ 6.4 e 10.3 relata sugestão de ASCII, cuja equivalência ao protótipo exigido não foi confirmada. A existência atual de WIREFRAMES.md não prova a entrega ou aprovação dessa versão. | Artefatos finais, versões históricas e avaliação do professor; distinguir representação estrutural sugerida de protótipo efetivamente entregue. |
| TCC-P013 | Quais prompts de documentação foram executados e quais artefatos derivaram deles? | CHAT-002 §§ 6.4 e 6.6 não confirma execução. A árvore do repositório contém documentos de telas, navegação, wireframes, guia e README, mas o guia atual se chama GUIA_USUARIO.md, diferente de GUIA_DO_USUARIO.md proposto no relato. | Histórico de arquivos/commits, respostas do Codex e registros de revisão humana; conferir conteúdo antes de afirmar origem, conclusão ou equivalência entre nomes. |
| TCC-P014 | Quando ocorreram a criação do frontend e a entrega acadêmica, e qual material de contexto foi usado? | CHAT-002 § 4 cita referência contextual a 14/10/2026 sem datar mensagens; §§ 2 e 8 cita Estrutura do TCC ADS.txt, não recebido separadamente. Coincidência com o título de CHAT-001 não prova identidade entre os materiais. | Datas e registros originais de frontend, atividade e entrega; recuperar o resumo citado e confirmar relação com CHAT-001. Não atribuir marcos a 14/10/2026 sem evidência. |

## Tratamento da identificação do chat

A divergência entre project e título do chat foi resolvida para fins de
catalogação pela identificação direta do responsável pela coleta: **ADS_TCC - Dúvidas Técnicas →
Estrutura do TCC ADS**. A cópia publicada foi anonimizada. Não é necessário alterar seu
campo `Chat` para manter o índice correto.

## Atualização das pendências

Quando uma fonte esclarecer uma questão, acrescentar sua identificação, a
conclusão e o alcance da confirmação. Preservar o que motivou a dúvida e a
distinção entre proposta inicial e entrega posterior. A confirmação documental
de um registro de teste não equivale à reexecução desse teste.
