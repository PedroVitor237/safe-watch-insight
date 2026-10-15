# Pendências e divergências para revisão do TCC

Primeira entrada: CHAT-001, recebida em 15/10/2026. Este registro organiza
questões de evidência e redação; não altera decisões técnicas nem o backlog de
implementação. Todas as pendências abaixo permanecem abertas nesta entrada.

Fonte de origem: [CHAT-001 — Estrutura do TCC ADS](./fontes/chats/ads-tcc-duvidas-tecnicas/chat-001-estrutura-do-tcc-ads.md).
Os contrapontos documentais foram consultados no commit
`819c35a582f2e1e799d6ae71857d2dd4706723ed`, conforme o
[índice das fontes](./INDICE_FONTES.md).

| ID | Questão ou diferença | Evidência disponível e seu limite | O que falta conferir / fonte responsável |
| --- | --- | --- | --- |
| TCC-P001 | Quando ocorreram a concepção e a passagem de cartilha para plataforma de inspeções? | CHAT-001 §§ 3 e 4 registra sequência e decisão, sem datas individuais. O recebimento em 15/10/2026 não data os fatos. | Histórico original, documentos anteriores ou confirmação de autores; manter data desconhecida enquanto não houver evidência. |
| TCC-P002 | O módulo educativo foi excluído, adiado ou mantido como secundário? | CHAT-001 §§ 4.2, 6.5 e 12.1 confirma prioridade das inspeções, sem exclusão formal da cartilha. | Documento de Requisitos, monografia e decisão dos autores; consultar orientadora se houver mudança do escopo acadêmico. |
| TCC-P003 | Quais requisitos do MVP foram aprovados e quais vieram de entrevistas? | CHAT-001 §§ 5, 7 e 12.2 contém lista preliminar, sem aprovação formal ou critérios de aceite. | Documento de Requisitos consolidado e rastreio das fontes de cada requisito; não atribuir toda a lista a entrevistas. |
| TCC-P004 | Como a proposta de Next.js evoluiu para a base TanStack Start? | CHAT-001 § 6.2 descreve proposta preliminar; TECH_DECISIONS.md / Framework registra preservação da base Lovable + TanStack Start. A diferença está identificada documentalmente, mas sua sequência histórica ainda não foi conciliada. | Relatório principal do desenvolvimento, histórico de decisões e autores; não presumir que uma migração de Next.js chegou a ocorrer. |
| TCC-P005 | Qual foi a evolução da proposta de sincronização? | CHAT-001 §§ 6.3 e 12.3 classifica “última alteração vence” como sugestão não confirmada. TECH_DECISIONS.md / Offline registra idempotência e bloqueio de conflito por revisão, sem Last Write Wins, em 07/08/2026. | Relacionar a decisão técnica aos relatórios e testes correspondentes; não atribuir a estratégia posterior a este chat preliminar nem declarar nova validação nesta coleta. |
| TCC-P006 | Quando o upload preparado passou a ser entrega real e qual seu alcance? | CHAT-001 §§ 6.4 e 12.4 registra integração futura. TECH_DECISIONS.md / Upload de Evidências registra upload online em 06/08/2026 e mantém binários offline adiados. | Conciliar com retrospectiva, relatórios e evidências de implementação; preservar a diferença entre upload online e sincronização offline. |
| TCC-P007 | Quais entrevistas foram realizadas e quais registros estão disponíveis? | CHAT-001 §§ 2, 10.1 e 12.6 menciona anotações a enviar, mas não as apresenta. Isso não comprova participantes, datas, instrumentos ou resultados. | Registros originais de autores; confirmar realização, método e tratamento acadêmico com os autores e a orientadora. |
| TCC-P008 | Que testes e homologações podem sustentar a descrição da solução? | CHAT-001 §§ 8 e 9 não fornece execuções, testes ou homologação. A ausência é local àquela conversa, não uma conclusão sobre o projeto completo. | Relatório principal, relatórios de execução e código pertinente; distinguir testes de software de avaliação com usuários e registrar limites do offline. |
| TCC-P009 | Qual metodologia foi efetivamente aplicada e como cada integrante e a IA participaram? | CHAT-001 §§ 11.3 e 11.5 descreve apoio consultivo, priorização e resumo técnico; não comprova Scrum, sprints executadas, ganhos de produtividade ou geração de código neste chat. | Relatos de autores, registros do desenvolvimento e monografia; validação da formulação acadêmica pela orientadora. |
| TCC-P010 | Quais decisões receberam aprovação acadêmica e quais materiais de origem ainda precisam ser recuperados? | CHAT-001 §§ 10 e 12.7 não apresenta aprovação da orientadora; vídeo e entrevistas não estavam acessíveis ao relator, e o resumo técnico é apenas descrito no relatório recebido. | Confirmação dos autores/orientadora e recuperação dos materiais originais quando pertinentes; ausência no relatório não significa ausência de aprovação em outro contexto. |

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
