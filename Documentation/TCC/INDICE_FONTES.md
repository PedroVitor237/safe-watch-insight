# Índice das fontes do TCC

## Fontes recebidas

| ID | Tipo | Project de origem (ChatGPT) | Chat | Recebimento | Período dos acontecimentos | Situação |
| --- | --- | --- | --- | --- | --- | --- |
| CHAT-001 | Relatório retrospectivo de chat | ADS_TCC - Dúvidas Técnicas | Estrutura do TCC ADS | 15/10/2026 | Datas não identificadas; sequência narrativa disponível | Cópia anonimizada e indexada; afirmações históricas aguardam conciliação |

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
