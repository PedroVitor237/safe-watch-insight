# Índice das fontes do TCC

## Fontes recebidas

| ID | Tipo | Project de origem (ChatGPT) | Chat | Recebimento | Período dos acontecimentos | Situação |
| --- | --- | --- | --- | --- | --- | --- |
| CHAT-001 | Relatório retrospectivo de chat | ADS_TCC - Dúvidas Técnicas | Estrutura do TCC ADS | 15/10/2026 | Datas não identificadas; sequência narrativa disponível | Cópia anonimizada e indexada; afirmações históricas aguardam conciliação |
| CHAT-002 | Relatório retrospectivo de chat | ADS_TCC - Dúvidas Técnicas | Lovable para FrontEnd TCC | 15/10/2026 | Datas dos acontecimentos não identificadas; referência contextual a 14/10/2026 sem confirmação das datas das mensagens | Cópia anonimizada e indexada; prompts e resultados de execução diferenciados |

## CHAT-001 — Estrutura do TCC ADS

- **Arquivo:** [chat-001-estrutura-do-tcc-ads.md](./fontes/chats/ads-tcc-duvidas-tecnicas/chat-001-estrutura-do-tcc-ads.md).
- **Arquivo recebido:** `Pasted text(1).txt`.
- **Quem forneceu e identificou a origem:** autor responsável pela coleta.
- **Data do recebimento:** 15/10/2026, referência America/Fortaleza. Não é data de criação do relatório nem dos fatos narrados.
- **Integridade da cópia publicada:** 36.411 bytes; SHA-256 `1da01aec12685db7842b4646f5aa8c35b9abbf2e43b654489b4922d902e18542`.
- **Tratamento:** nomes dos dois autores e da orientadora substituídos por papéis; nome original do arquivo de vídeo substituído pelo alias `VIDEO-001.mp4`; aviso de anonimização acrescentado ao início do relatório. As demais partes do relato foram mantidas sem alteração.
- **Original:** anexo fornecido preservado fora do repositório público. A cópia publicada não é uma reprodução byte a byte desse anexo.
- **Natureza:** relato retrospectivo produzido por outro chat; a conversa original não foi consultada nesta coleta.

### Identificação da origem

O responsável pela coleta informou **ADS_TCC - Dúvidas Técnicas** como project e **Estrutura do TCC
ADS** como chat. O corpo do relatório usa o nome do project no campo `Chat`.
A identificação acima segue a informação direta do responsável pela coleta;
a diferença fica registrada aqui, sem correção desse campo na cópia anonimizada.

### Conteúdo e utilidade

Registro de concepção e viabilidade: passagem de cartilha informativa para
plataforma de inspeções de SST; recorte de MVP; proposta mobile-first/PWA;
Next.js e demais tecnologias preliminares; IndexedDB/Dexie; sincronização;
armazenamento externo de imagens; resumo preparado para o chat de documentação.

Pode subsidiar a reconstrução das motivações, alternativas e escolhas
preliminares. O próprio relatório declara ausência de implementação e testes
naquela conversa. Afirmações de decisões explícitas são atribuídas ao relatório
recebido, sem nova comprovação por leitura do chat original.

### Limites e acompanhamento

- Datas individuais das mensagens não estão disponíveis.
- Vídeo, entrevistas, monografia e documento de requisitos não foram consultados pelo chat ao elaborar o relato.
- O resumo técnico citado foi descrito pelo relatório, mas não recebido como arquivo independente nesta coleta.
- Next.js é proposta preliminar; a documentação de referência consultada registra TanStack Start.
- A sugestão de “última alteração vence” não é decisão confirmada no relato; a documentação técnica registra bloqueio de conflitos por revisão.
- Cloudinary aparece como integração futura no relato; a documentação técnica consultada registra uma entrega posterior de upload online.
- As diferenças são pistas de evolução a conferir, não justificativas para atualizar retroativamente o original.

Ver [marcos CHAT-001-M01 a CHAT-001-M10](./LINHA_DO_TEMPO.md) e
[pendências TCC-P001 a TCC-P010](./PENDENCIAS.md).

## CHAT-002 — Lovable para FrontEnd TCC

- **Arquivo:** [chat-002-lovable-para-frontend-tcc.md](./fontes/chats/ads-tcc-duvidas-tecnicas/chat-002-lovable-para-frontend-tcc.md).
- **Arquivo recebido:** `Pasted text(2).txt`.
- **Origem informada na coleta:** project **ADS_TCC - Dúvidas Técnicas**, chat **Lovable para FrontEnd TCC**. O título descritivo proposto pelo relator permanece no corpo da cópia.
- **Data do recebimento:** 15/10/2026, referência America/Fortaleza; não data os acontecimentos nem a geração do relato.
- **Integridade da cópia publicada:** 29.993 bytes; SHA-256 `29a008605e5cfc0bb3c9124f6092b7af5bea0047959031299c4ba993253df688`.
- **Tratamento:** cinco ocorrências de nomes pessoais substituídas por papéis e aviso de anonimização acrescentado ao início; demais partes mantidas sem alteração. Original fornecido preservado fora do repositório público.
- **Natureza:** relato retrospectivo de apoio consultivo e documental; sem nova consulta à conversa original, aos PDFs ou ao código nesta entrada.

### Conteúdo e contribuição

O relatório descreve dúvidas sobre Lovable, preferências de interface limpa e
responsiva, relato do usuário de que o frontend já utilizava TanStack e análise
da **Atividade 1: Desenvolvimento Completo do Frontend do TCC**. Registra prompts
para especificação de telas, navegação, wireframes, guia e README, sem retorno
que comprove sua execução ou a entrega dos artefatos.

### Relação com outras fontes

- **CHAT-001 / TCC-P004:** acrescenta o esclarecimento de que Next.js havia sido sugerido antes de o usuário informar o frontend existente em TanStack. Isso favorece interpretar as fontes como evolução de direcionamento, sem inferir uma migração executada. As datas e a ligação exata entre os chats ainda não estão comprovadas.
- **Material `Estrutura do TCC ADS.txt`:** citado como resumo de contexto pelo relator. O título sugere relação temática com CHAT-001, mas o arquivo não foi recebido separadamente; não foi considerado idêntico ao relatório CHAT-001.
- **Documentos acadêmicos:** o relator afirma ter consultado quatro páginas de `ATIVIDADE 1 Desenvolvimento Completo do Frontend.pdf`. O PDF não integra esta entrada; exigências de formato e extensão permanecem atribuídas ao relato até consulta ao original.
- **Artefatos no repositório:** a árvore consultada contém `Documentation/ESPECIFICACAO_DE_TELAS.md`, `Documentation/MAPA_DE_NAVEGACAO.md`, `Documentation/WIREFRAMES.md`, `Documentation/GUIA_USUARIO.md` e `README.md`. Sua existência não comprova que tenham sido gerados pelos prompts deste chat. O relato propõe `GUIA_DO_USUARIO.md`, nome diferente do arquivo existente.

### Limites temporais e de resultado

A referência contextual a **14/10/2026**, em CHAT-002 § 4, não comprova quando
ocorreram as interações ou a atividade acadêmica. Nenhuma data foi atribuída aos
marcos com base nessa referência. Os percentuais informais sobre capacidade de
geração de interface não são métricas de produtividade. Opções de exportação e
condições do plano gratuito do Lovable não foram verificadas nesta coleta.

Ver [marcos CHAT-002-M01 a CHAT-002-M09](./LINHA_DO_TEMPO.md) e
[pendências TCC-P011 a TCC-P014](./PENDENCIAS.md), além das atualizações de
TCC-P004, TCC-P008 e TCC-P009.

## Referências consultadas para a organização

Os arquivos `AGENTS.md`, `PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`,
`TASKS.md` e `TECH_DECISIONS.md` foram lidos em `main` no commit
`819c35a582f2e1e799d6ae71857d2dd4706723ed` para respeitar a organização do
repositório e delimitar as diferenças entre proposta e documentação vigente.
Essa leitura não constitui nova auditoria do código ou reexecução dos testes.

Contrapontos documentais utilizados:

| Assunto | Referência (versão consultada indicada acima) | Uso neste levantamento |
| --- | --- | --- |
| Framework | [TECH_DECISIONS.md — Framework](../../TECH_DECISIONS.md#framework) | Registra TanStack Start e preservação da base existente; não comprova quando a proposta inicial de Next.js foi abandonada. |
| Sincronização | [TECH_DECISIONS.md — Offline](../../TECH_DECISIONS.md#offline) | Registra decisão de 07/08/2026 com idempotência e bloqueio por revisão, sem Last Write Wins. |
| Evidências | [TECH_DECISIONS.md — Upload de Evidências](../../TECH_DECISIONS.md#upload-de-evidências) | Registra entrega de upload online em 06/08/2026 e mantém upload offline futuro. |

As datas dessas referências pertencem aos registros técnicos e não foram
atribuídas aos acontecimentos sem data de CHAT-001. A cronologia global será
conciliada após a coleta das demais fontes.
