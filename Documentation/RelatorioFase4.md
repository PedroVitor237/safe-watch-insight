# Relatório — documentação da Fase 4

Conferência em 3 de outubro de 2026. Escopo exclusivamente documental: regras
implementadas, autenticação/autorização, templates, cópia/linhagem e legado.
Código, schema, migrations, seeds, testes e banco não foram alterados.

## Repository Baseline

- Branch inicial e final: `docs/documentation-update`; nenhuma branch criada.
- HEAD inicial real: `0a19b4447d9b62356cbcb0a6eaa0b58dce220e57` (Fase 2).
- Working tree inicial: nove documentos rastreados modificados e três arquivos
  documentais novos da Fase 3; nada staged. Os novos eram arquivos de diagramas
  (`checklist-copy.puml`, `use-cases.puml`) e `RelatorioFase3.md`.
- Antes das edições da Fase 4, essa documentação preexistente foi revisada e
  consolidada separadamente em `42aeb64f3616fbb62a75f467959fec97c44e32f1`, mensagem
  `docs: consolidate workflow documentation for phase 3`. Após esse checkpoint,
  a working tree estava limpa. Não houve reset/rebase/amend ou push.
- Base efetiva do diff da Fase 4: `42aeb64`. O relatório anterior permanece
  histórico, incluindo seu estado Git ao término daquela execução.

## Documents Updated

| Arquivo                                                                  | Tipo                  | Correções da Fase 4                                                                                                                                                     |
| ------------------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [BusinessRules.md](../AI/BusinessRules.md)                               | Regra implementada    | Separação de autenticação/autorização/visibilidade/estado; classificação de checklists; garantias físicas versus aplicação; NCs, conclusão e campos/transições de ações |
| [API.md](../AI/API.md)                                                   | Contrato implementado | Campos obrigatórios/opcionais, defaults, NC automática, tratamento posterior à conclusão, efeitos de leitura, `409` na conclusão e concern de prazos                    |
| [ChecklistCopy.md](../AI/ChecklistCopy.md)                               | Fluxo implementado    | Matriz de inelegibilidade/legado, ausência de fallback, exemplos de ancestralidade e PKs compostas das associações, limites transacionais                               |
| [OfficialTemplates.md](../AI/OfficialTemplates.md)                       | Catálogo e histórico  | Reconferência de IDs/conteúdo, todos os itens obrigatórios, ausência de limite SQL de quantidade, autoria nullable versus institucional e preservação pelo bootstrap    |
| [Entities.md](../AI/Entities.md)                                         | Domínio               | Revisão otimista/imutabilidade, criação/restauração de NC, ações e nulabilidade versus coerção pública                                                                  |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)                              | Contexto atual        | Cadastro/sessão/ownership, conclusão, opcionais, distinção de templates, cópia/legado/errata e limites da UI                                                            |
| [Database.md](../AI/Database.md)                                         | Referência estrutural | Ajuste textual da validação do hash na criação; formato 0 versus cópia, sem mudar inventário físico                                                                     |
| [DicionarioDeDados.md](./DicionarioDeDados.md)                           | Modelo de dados       | Correção de uma regra da aplicação na tabela de garantias: hash presente, recálculo somente no formato 1                                                                |
| [ModeloConceitualDoBancoDeDados.md](./ModeloConceitualDoBancoDeDados.md) | Modelo conceitual     | Delimitação textual de `VERIFIED`/legado na captura atual, preservando diagrama e cardinalidades                                                                        |
| [RelatorioFase4.md](./RelatorioFase4.md)                                 | Relatório             | Baseline, fontes, resultados, concerns e rastreabilidade Git                                                                                                            |

[ModeloLogico.md](./ModeloLogico.md), [ModeloFisicoDB.md](./ModeloFisicoDB.md) e
os três [PlantUMLs de banco](./diagrams/database/) foram conferidos e preservados.
Os diagramas de fluxo preexistentes em ChecklistCopy e
[checklist-copy.puml](./diagrams/flows/checklist-copy.puml) continuam compatíveis;
nenhum Mermaid ou PlantUML foi alterado nesta fase. Prettier ajustou alinhamento
das tabelas nos Markdown que precisaram de formatação, sem reescrever históricos.

## Business Rules

Company pertence ao criador; Checklist pessoal tem proprietário e oficial tem
autoria institucional sem conta de usuário. Inspection define ownership das
NCs (via resposta), ações (via NC) e evidências (direta ou via NC/resposta).
Relatórios e dashboard filtram `Inspection.userId`. Reutilizar publicação não
concede acesso às inspeções de quem a utilizou.

Resposta `NON_COMPLIANT` cria NC `MEDIUM`/`OPEN`, observação ou descrição do item
histórico e prazo atual + sete dias UTC. NC ativa conserva seus dados/status;
arquivada é restaurada para `OPEN`, preservando prazo, descrição, severidade e
filhos. `COMPLIANT`/`NOT_APPLICABLE` arquivam sem resolver ou apagar filhos.
Criação explícita exige severidade e não recebe prazo automático.

Conclusão exige resposta nos obrigatórios do snapshot; `NOT_APPLICABLE` conta
e opcionais podem ficar sem resposta. Não exige fotos, observações ou NCs
resolvidas. Novas respostas são bloqueadas após conclusão/cancelamento;
tratativas e evidências podem continuar após conclusão.

Ação exige NC e descrição; responsável, prazo, porquê, local, método e custo são
opcionais. Responsável/custo são texto. Criar ação quando NC `OPEN` muda-a para
`IN_PROGRESS`; `COMPLETED` define `completedAt`, outro status enviado limpa-o.
Concluir ações não resolve NC automaticamente. Leituras de NC/ações podem
persistir atraso; Reports/Dashboard derivam atraso sem escrita.

## Authentication / Authorization

Cadastro público `/register`: nome aparado obrigatório; e-mail aparado, válido
e minúsculo; senha com mínimo oito caracteres, sem regra de composição; confirmação
igual. Schema estrito impede escolha de role/autoria. Service atribui `TECHNICIAN`,
gera bcrypt custo 12, trata e-mail duplicado inclusive excluído e disputa `P2002`.
Resposta pública contém apenas id/nome/e-mail. Sem auto-login; navega a `/login`.

Login compara bcrypt e cria sessão TanStack Start: `safe_watch_session`, `userId`,
maxAge 28800 segundos, HttpOnly, SameSite=lax, Path=/, Secure em produção.
`SESSION_SECRET` é obrigatório em produção, com fallback somente fora dela.
Usuário não excluído é reconsultado no servidor. Sessão offline local não
estende nem substitui a sessão remota. Não existem JWT, refresh tokens, tabela
própria de sessões, confirmação de e-mail ou recuperação de senha.

ADMIN/TECHNICIAN/SUPERVISOR/AUDITOR são valores armazenados, sem RBAC funcional.
Permissão vem do ownership/contexto; visibilidade publicada permite leitura/uso;
estado editorial controla versão. Schemas comuns removem extras, cadastro/cópia
os rejeitam. Recurso privado alheio normalmente tem a mesma semântica NOT_FOUND
do inexistente. A proteção de metadados de evidências não garante proteção da URL externa.

## Templates

| ID fixo                                | Nome codificado                                            | Itens | Normas e fonte                                                                |
| -------------------------------------- | ---------------------------------------------------------- | ----: | ----------------------------------------------------------------------------- |
| `a0180000-0000-4000-8000-000000000001` | Construção — treinamento, escavações e transporte vertical |    12 | NR-18; adaptação de Murbach (2019), Apêndice A, páginas 72–74, 83–84, 113–114 |
| `a0350000-0000-4000-8000-000000000002` | Trabalho em altura — preparação e proteção da equipe       |     8 | NR-1, NR-6, NR-35; curadoria Safe Watch Insight (2026)                        |

Ambos têm `isOfficial=true`, `isTemplate=true`, proprietário/criador/publicador
NULL e publicação inicial v1 formato 1/data/hash. Todos os itens são obrigatórios
no bootstrap. Dois é tamanho do catálogo, sem constraint SQL de quantidade.
Modelo pessoal com `isTemplate=true` mantém dono e pode ser privado ou publicado.
Publicar não torna um checklist oficial. Não há editoria institucional pela
API pessoal, inclusive para ADMIN. Referências históricas foram conferidas
no catálogo local; não houve auditoria jurídica ou consulta externa da bibliografia.

## Checklist Copy

Origem própria não excluída prefere draft, inclusive inativa; sem draft usa a
publicação de maior número. Terceiro/oficial exige ativo/publicado acessível,
sem expor draft. Só retirada, sem conteúdo elegível ou sem acesso retorna
NOT_FOUND; publicação selecionada exige formato 1/hash íntegro ou retorna
CONFLICT, sem tentar publicação anterior. `useOfficialTemplate` delega à mesma
operação e exige adicionalmente origem oficial.

Resultado: nova identidade pessoal ativa, dono da sessão, `isOfficial=false`,
`isTemplate=false`, DRAFT v1 sem hash/publicação, novos UUIDs e associações
normativas próprias com Standard reutilizado/metadados copiados. Não copia
inspeções, respostas, snapshots, NCs, ações, evidências ou Report.

De publicação, novo `sourceVersionItemId` aponta ao item publicado. De draft,
conserva ancestral anterior ou NULL, sem referenciar o item mutável. Referência
legada também é preservada; não há sourceVersionId na identidade/versão.
Linhagem não sincroniza conteúdo nem é garantia SQL de ancestral publicado.

`RepeatableRead` abrange leitura/autorização/títulos/preparação/inserts checklist
→ versão → itens em lote → associações em lote → leitura final. Erro aborta e
reverte a cópia. Sem publicação futura/Cloudinary nessa transação, sem reserva
serializada de nome. Nomes: `Título — Cópia`, `Título — Cópia (2)` etc.; primeiro
disponível pessoal não excluído, truncado a 255 caracteres, sem UNIQUE de título.

## Legacy Compatibility

Criação de inspeção exige hash presente e só recalcula formato 1; outros formatos,
incluindo 0, são aceitos sem recálculo, ainda com INSPECTION_CREATION/VERIFIED.
Esse rótulo não comprova integridade canônica do legado. Cópia de publicação
exige formato 1 íntegro. Backfill preserva formato 0/LEGACY_BACKFILL/
UNVERIFIED_LEGACY, sem reconstrução retrospectiva comprovada.

Snapshot congela conteúdo do checklist, itens e normas, sem congelar cadastro
de empresa/usuário ou todas as tratativas. Errata bibliográfica de construção
preserva a publicação original com 73–74 e acrescenta a referência 72–74 na
exibição/novas cópias quando identificada pelo helper. Inspeção direta da
publicação antiga captura descrição original; não altera snapshots/relatórios
existentes. Hashes históricos e pareceres foram preservados como histórico.

## Validation

Validações documentais finais e revisão do diff registradas abaixo. Não foram
executados testes da aplicação, build, Prisma generate/validate, seeds,
migrations ou qualquer operação de banco. Comandos de leitura (`cat`, `sed`,
`find`, `grep`, `wc`, Git) somente inspecionaram fontes locais. `rg` estava
indisponível; buscas usaram as alternativas locais.

```bash
git branch --show-current
git status --short
git log --oneline -5
git diff --check
node node_modules/prettier/bin/prettier.cjs --check AI/API.md AI/BusinessRules.md AI/ChecklistCopy.md AI/Entities.md AI/OfficialTemplates.md AI/Database.md PROJECT_CONTEXT.md Documentation/DicionarioDeDados.md Documentation/ModeloConceitualDoBancoDeDados.md
node node_modules/prettier/bin/prettier.cjs --write AI/BusinessRules.md AI/ChecklistCopy.md Documentation/DicionarioDeDados.md Documentation/RelatorioFase4.md
node node_modules/prettier/bin/prettier.cjs --check AI/API.md AI/BusinessRules.md AI/ChecklistCopy.md AI/Entities.md AI/OfficialTemplates.md AI/Database.md PROJECT_CONTEXT.md Documentation/DicionarioDeDados.md Documentation/ModeloConceitualDoBancoDeDados.md Documentation/RelatorioFase4.md
python3 /tmp/swi-phase4-doc-validation.py
git diff --stat
git diff
git diff --cached --check
git diff --cached --stat
git diff --cached
git log --oneline -3
git status --porcelain=v1
```

- `git diff --check`: passou. Staged diff também conferido por `--check` antes do commit.
- Prettier inicial apontou três Markdown; apenas os documentos apontados e o
  relatório foram formatados. Check final dos dez Markdown: passou.
- Validador local documental: referências/âncoras, fences, enums/campos,
  escopo e preservação do código/diagramas: **PASS**, 12 documentos, 200 referências
  relativas e 25 âncoras válidas, 19 models/12 enums conferidos, fences balanceados.
- Revisão de coerência incluiu os dez documentos exigidos, AI/Database e
  diagramas de banco; modelos lógico/físico não exigiram mudança.

Foi executado também este diagnóstico puramente local da união Zod usada nos
dois schemas, sem importar Services/Prisma nem persistir dados:

```bash
node --input-type=module -e 'import { z } from "zod"; const dateSchema = z.union([z.coerce.date(), z.literal("").transform(() => null), z.null()]).optional(); for (const input of [undefined, "", null, "2026-10-03T12:00:00.000Z"]) { const result = dateSchema.parse(input); console.log(JSON.stringify({ input: input === undefined ? "omitted" : input, output: result instanceof Date ? result.toISOString() : result === undefined ? "omitted" : result })); }'
```

Resultado: omissão preservada; vazio → NULL; JSON null →
`1970-01-01T00:00:00.000Z`; data válida preservada. Trata-se de reprodução isolada
da coerção; não é teste de integração nem homologação do fluxo na UI.

## Out of Scope — Implementation Concerns / Follow-up

1. **Coerção de prazo (novo achado):** NC/ação usam `z.coerce.date()` antes de
   `z.null()`; JSON null vira epoch. Documentado, sem corrigir schema/código.
2. **Integridade legada:** snapshot atual de formato não recalculado recebe
   VERIFIED. Documentar corretamente não corrige nem valida criptograficamente
   essas publicações.
3. **Busca compartilhada:** busca/ordenação usam metadados atuais da identidade,
   embora DTO alheio mostre publicação. Possível sinalização de metadados de draft
   é inferência estática já registrada na Fase 3, sem teste de exploração aqui.
4. **Nomes e e-mail:** título de cópia não tem reserva concorrente/UNIQUE;
   UNIQUE de e-mail SQL não é case-insensitive, apesar da normalização da aplicação.
5. **Garantias externas:** Cloudinary e banco usam compensações; sem transação
   distribuída ou controle garantido da URL. Zod antes do handler pode lançar
   exceção sem envelope uniforme.
6. **FK existente:** schema nullable de Checklist.createdById gera SET NULL,
   enquanto migrations preservam RESTRICT, conforme Fase 2; sem correção/drift remoto.
7. **Funcionalidades ausentes:** RBAC/gestão de usuários, recuperação/validação de
   e-mail, interface completa de retirada/histórico, criação integral offline,
   reconciliação assistida e upload binário offline permanecem futuros.

Esses itens não impedem a conclusão documental; não representam QA funcional
aprovado nesta fase. Pareceres e resultados funcionais anteriores são históricos.

## Git

O checkpoint `42aeb64` contém apenas as alterações preexistentes da Fase 3.
O commit da Fase 4 contém somente os dez Markdown desta tabela, revisados
antes de staging/commit, sem código/schema/migrations/seeds/testes/segredos novos.

Mensagem do commit da Fase 4:
`docs: consolidate business rules and checklist copy documentation`.

Identificador do commit criado: **o próprio commit que adiciona este relatório**.
Referência verificável sem hash autorreferente no arquivo:

```bash
git log -1 --format='%H %s' -- Documentation/RelatorioFase4.md
```

O hash literal de um commit que inclui este arquivo depende do conteúdo deste
arquivo; por isso o relatório usa essa referência Git, e o hash final é informado
também na entrega da tarefa. Working tree final: **CLEAN**, conferida após commit.
Push: **NOT PERFORMED**. Nenhuma alteração das fases anteriores foi incorporada
ao diff do commit da Fase 4.
