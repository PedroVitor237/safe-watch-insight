# Relatório — documentação da Fase 3

Revisão em 3 de outubro de 2026. Estado de referência após checkpoint da Fase 2:
`0a19b4447d9b62356cbcb0a6eaa0b58dce220e57`. Conferência estática do código e da
documentação, sem acesso ao banco ou alteração do comportamento.

## 1. Branch e checkpoint solicitado

Inicial/final: `docs/documentation-update`. Não foi criada outra branch nem
feito checkout de main. HEAD anterior: `0e7c6e4fcebb3edaf8c5eba3efd23dc357dfb8f9`.
Após ler Prompt 3 e antes de iniciar sua execução, foi criado o commit solicitado:

`0a19b44 — docs: consolidate database documentation for phase 2`.

Esse commit registra as nove alterações documentais pré-existentes da Fase 2,
incluindo dicionário, três modelos Markdown, AI/Database, três PlantUMLs e
remoção do antigo DiagramaModeloFisicoDB.puml. `git diff --cached --check` passou
antes do commit, e a working tree ficou limpa. **Nenhum commit da Fase 3 nem push**.

## 2. Arquivos modificados nesta fase

- [AI/BusinessRules.md](../AI/BusinessRules.md): regras implementadas, sessão,
  ownership, matriz de acesso, publicação, snapshots e limites.
- [AI/OfficialTemplates.md](../AI/OfficialTemplates.md): IDs/fontes/publicações,
  distinções e separação de parecer histórico/estado atual.
- [AI/ChecklistCopy.md](../AI/ChecklistCopy.md): elegibilidade, formato, nomes,
  linhagem, independência e fluxo Mermaid.
- [AI/Entities.md](../AI/Entities.md): papel conceitual dos 19 models, sem duplicar
  inventário físico.
- [AI/API.md](../AI/API.md): correções de sessão/ownership/visibilidade/cópia/
  publicação/legado e tratamento de validação.
- [DiagramaDeCasosDeUso.md](./DiagramaDeCasosDeUso.md): funções reais da UI,
  sem administração fictícia ou RBAC.
- [DocumentoDeRequisitos.md](./DocumentoDeRequisitos.md): correções diretamente
  afetadas em autenticação/checklists/snapshot; RF12/RN07 não entregues.
- [MAPA_DE_NAVEGACAO.md](./MAPA_DE_NAVEGACAO.md): correções pontuais das referências
  obsoletas a dashboard/relatórios demonstrativos, inclusive no Mermaid existente.
- [EspecificacaoAPIREST.md](./EspecificacaoAPIREST.md): cadastro/cópia/ownership,
  limite dos envelopes e correção de dashboard/relatórios classificados como futuros.

## 3. Arquivos criados

- [checklist-copy.puml](./diagrams/flows/checklist-copy.puml).
- [use-cases.puml](./diagrams/flows/use-cases.puml).
- [RelatorioFase3.md](./RelatorioFase3.md) (este relatório).

## 4. Preservação

Código, Prisma schema, migrations, seeds, testes, arquitetura/cache/offline,
reports e dashboard não foram alterados. Nenhuma operação consultou ou modificou
banco/dataset; nenhum seed, migration ou teste com fixtures foi executado.
Documentos/diagramas de banco da Fase 2 permanecem idênticos ao checkpoint.
Diagrama de classes, TECH_DECISIONS e demais documentos fora do escopo permanecem
intactos. A verificação de escopo confirmou somente alterações documentais;
resultados na seção 9.

## 5. Regras consolidadas

Cadastro público sem auto-login; e-mail normalizado, senha mínima oito caracteres,
bcrypt custo 12, TECHNICIAN atribuído no servidor e resposta pública mínima.
Sessão safe_watch_session de oito horas, HttpOnly/SameSite=lax/Secure em produção,
usuário não excluído reconsultado, sem JWT/tabela de sessões. Papéis armazenados
não constituem RBAC; persona e responsável textual não concedem acesso.

Checklist identidade, versão editorial e snapshot da inspeção são distintos.
Um draft por checklist, múltiplas publicações, derivação do próximo número,
publicação SHA-256 formato 1 com revisão updatedAt lida pelo servidor. Sem mínimo
de itens, retirada preserva conteúdo/hash/histórico. Retirada possui API/hook,
sem ação nas telas. Snapshot congela conteúdo de checklist e normas, sem congelar
empresa/usuário/respostas/NCs/ações/evidências ou relatório inteiro.

Inspeção exige empresa própria e publicação visível ativa; legado 0 pode ser
aceito sem recálculo do hash, diferente da cópia. Errata Murbach 72–74 abrange
catálogo/UI/novos drafts de cópia, sem reescrever v1/snapshots/relatórios históricos.

## 6. Matriz final de acesso

Todos os acessos de domínio exigem sessão. Versão completa com condições:
[BusinessRules.md](../AI/BusinessRules.md#matriz-de-autorização).

| Recurso                       | Próprio                                               | Terceiro                                      | Institucional/compartilhado                            |
| ----------------------------- | ----------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| Company                       | Criar/ler/editar/soft delete                          | Sem acesso                                    | Sem catálogo público                                   |
| Checklist draft               | Ler/editar/publicar/copiar elegível                   | Privado                                       | Draft oficial sem acesso pela sessão                   |
| Checklist publicado           | Ler/derivar draft/copiar/retirar                      | Ler/copiar/usar publicação ativa não excluída | Oficial publicado permite leitura/cópia/uso            |
| Checklist retirado            | Histórico/derivar draft, sem reutilização direta      | Sem acesso                                    | Retirada institucional sem acesso                      |
| Template oficial              | Sem dono usuário                                      | Mutações bloqueadas, inclusive ADMIN          | Consulta/cópia/inspeção própria; bootstrap fora da API |
| Inspection/respostas/snapshot | Criar/ler/excluir; responder/concluir conforme estado | Sem acesso                                    | Publicação não compartilha inspeção                    |
| NonConformity                 | Operar via resposta/inspeção própria                  | Sem acesso                                    | Sem acesso público                                     |
| CorrectiveAction              | Operar via NC/inspeção própria                        | Sem acesso                                    | Nome de responsável não concede acesso                 |
| Evidence                      | Contexto histórico próprio: upload/lista/remoção      | Sem acesso                                    | Sem API pública; URL externa tem limites próprios      |
| Relatório sob demanda         | Detalhe próprio; lista de concluídas                  | Sem acesso                                    | Sem compartilhamento                                   |
| Dashboard                     | Agregados próprios                                    | Sem acesso                                    | Sem administração global                               |
| OfflineSync                   | Resposta/conclusão próprias com sessão/hash/revisão   | Sem acesso                                    | Conteúdo compartilhado não autoriza inspeção alheia    |
| Standard                      | Leitura autenticada                                   | Mesmo catálogo                                | Sem UI/API de administração                            |

## 7. Templates e cópia

Dois oficiais: construção/NR-18 (12 itens) e altura/NR-1/NR-6/NR-35 (8 itens).
IDs fixos preservados, autores institucionais NULL, isOfficial/isTemplate true;
hashes históricos identificados como evidência anterior, sem consulta atual.

Origem própria usa draft ou última publicação; terceiro/oficial usa última
publicação acessível. Publicação para cópia exige formato 1/hash íntegro. Resultado
é nova identidade pessoal ativa/isOfficial=false/isTemplate=false/DRAFT v1,
IDs/associações próprios, Standard reutilizado. Sem copiar dados operacionais.
Linhagem por sourceVersionItemId, sem sourceVersionId na identidade/versão;
draft conserva ancestral anterior/NULL, sem vincular novo item ao draft mutável.
Nomes “ — Cópia”, “ — Cópia (2)” buscam primeiro disponível no próprio catálogo
não excluído, sem UNIQUE/reserva concorrente. Transação RepeatableRead abrange
leitura/autorização/preparação/inserts ordenados; erro reverte toda a cópia.

## 8. Diagramas

| Mermaid em Markdown                                                           | PlantUML correspondente                                     | Representação                                                       |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| [ChecklistCopy.md](../AI/ChecklistCopy.md#fluxo-implementado)                 | [checklist-copy.puml](./diagrams/flows/checklist-copy.puml) | Sessão, elegibilidade/origens, hash condicional, inserts e rollback |
| [DiagramaDeCasosDeUso.md](./DiagramaDeCasosDeUso.md#visão-de-funcionalidades) | [use-cases.puml](./diagrams/flows/use-cases.puml)           | Visitante/usuário autenticado, funções reais e limites de acesso    |

Mermaid de casos de uso usa flowchart; PlantUML utiliza notação UML. Diagramas
descrevem as mesmas regras, sem exigir equivalência gráfica entre notações.
O Mermaid já existente em MAPA_DE_NAVEGACAO.md recebeu somente correção dos
rótulos de dashboard e relatórios, sem mudar sua topologia.

## 9. Validações desta fase

- `git diff --check`: passou. `git diff --cached --check`: passou, staging vazio.
- Prettier local 3.9.1: formatação e `--check` nos dez Markdown desta fase.
- Links relativos e âncoras: 92 verificados nos dez Markdown, incluindo referências
  ao código, diagramas e documentos da Fase 2; sem referência ausente.
- Headings/fences Markdown: verificação estrutural passou.
- Mermaid: conferência estrutural dos três flowcharts modificados/criados,
  delimitadores, definições de nós e referências de arestas.
- PlantUML: conferência estrutural dos dois novos arquivos, delimitadores,
  condicionais/notas e correspondência com Mermaid. O par de casos de uso tem
  mesmos atores, rótulos e relações; o par da cópia mantém as mesmas regras.
- **Limitação:** mmdc e plantuml não estão disponíveis. Não houve validação por
  parser oficial nem renderização dos diagramas; nenhuma dependência foi instalada.
- Busca de coerência nos Markdown de AI/ e Documentation/: termos de papéis,
  RBAC, mocks, entregas futuras, cópia/templates, ownership e solicitante
  analisados por contexto; históricos, personas e módulos demonstrativos reais
  foram diferenciados do estado implementado.
- Escopo Git: nove documentos rastreados modificados e três arquivos documentais
  novos. Nenhum arquivo de código/schema/migrations/seeds/testes foi alterado.
  Não houve execução de testes da aplicação, builds ou operações de banco.

## 10. Divergências e limites ainda existentes

Requisitos de análise fora do recorte não foram transformados em entrega integral.
Textos antigos de Offline/PWA/contexto contêm marcos anteriores à homologação de
setembro; preservação cronológica não significa reexecutar validações históricas.
Diagrama de classes resume invariantes do fluxo (como snapshot na criação),
enquanto o dicionário/modelos da Fase 2 delimitam cardinalidades físicas opcionais.
TECH_DECISIONS conserva decisões históricas; não foi reescrito nesta fase.

## 11. Problemas técnicos — documentação e implementação

### DOCUMENTAÇÃO

Corrigidos: prioridade invertida entre regra desejada/código, cadeia linear de
entidades, administração/RBAC inexistentes nos casos de uso, visibilidade de
draft/retirada na API, ausência de register na lista de operações públicas,
RF12/RN07 implícitos como entrega e parecer NEEDS FIX aparentando estado atual.
Histórico de P2003 e validações de templates foi preservado e contextualizado.

### IMPLEMENTAÇÃO — registrados, sem correção nesta fase

- ChecklistRepository busca/ordena por title/description atuais da identidade,
  embora o DTO de terceiros mostre metadados publicados. **Inferência da leitura
  estática:** busca pode sinalizar correspondência com metadados alterados no
  draft de um checklist que já tem publicação; conteúdo do draft não é devolvido.
  Não foi feito teste de exploração nesta fase.
- InspectionService aceita formato diferente de 1 sem recálculo, mas cria snapshot
  com VERIFIED. Não equiparar esse rótulo à verificação canônica do legado;
  backfill original permanece UNVERIFIED_LEGACY.
- Unicidade de nomes de cópia é convenção de aplicação, sem constraint/reserva
  concorrente; solicitações simultâneas podem escolher mesmo título.
- UNIQUE de e-mail é sensível à caixa no SQL, embora Service faça normalização/
  consulta case-insensitive; não alegar constraint SQL case-insensitive.
- Validação Zod anterior ao handler não garante envelope Result uniforme.
- Filtro de Evidence protege API de metadados, não assegura controle da URL
  externa. Banco/Cloudinary usam compensações, sem atomicidade entre serviços.
- Divergência já documentada na Fase 2: ação implícita do schema nullable de
  Checklist.createdById difere da FK RESTRICT das migrations. Não foi revalidada
  contra banco nem corrigida; ver [dicionário](./DicionarioDeDados.md#8-divergência-constatada-entre-schema-e-migrations).
- Funcionalidades futuras/ausentes: RBAC/gestão de usuários, solicitante,
  recuperação/validação de e-mail, UI completa de retirada/histórico, criação
  integral offline, reconciliação assistida e upload binário offline.

## 12. Git e classificação

HEAD: `0a19b4447d9b62356cbcb0a6eaa0b58dce220e57`.
Branch: `docs/documentation-update`. Staged: vazio.
Working tree: nove documentos rastreados modificados e três arquivos documentais
novos, todos não staged. Fase 2 preservada no checkpoint.
Commit: somente checkpoint da Fase 2 solicitado **antes** da execução.
Fase 3: **nenhum commit / nenhum push**.

**DOCUMENTATION PHASE 3 — READY FOR REVIEW**.

Atualização concluída no escopo documental, com a limitação dos parsers de
diagramas registrada na seção 9. Problemas de implementação foram apenas
documentados para eventual Final QA.
