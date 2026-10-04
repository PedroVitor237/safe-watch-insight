# Entidades do domínio

## Estado atual e fontes

Consolidado na Fase 3 em 3 de outubro de 2026. Explica o papel dos **19 models**
implementados. Campos/tipos/enums/chaves/nullability/defaults pertencem ao
[Dicionário de Dados](../Documentation/DicionarioDeDados.md) e à
[referência de banco](./Database.md). Fontes: [schema](../prisma/schema.prisma),
[migrations](../prisma/migrations/) e [Services](../src/server/services/).
Cardinalidade física e exigência do fluxo atual são distintas.

## User

Conta que autentica e possui empresas, checklists pessoais e inspeções. Guarda
identidade/e-mail/hash bcrypt. Ativo significa deletedAt=null, sem User.isActive.
Role admite ADMIN/TECHNICIAN/SUPERVISOR/AUDITOR, sem RBAC; cadastro atribui
TECHNICIAN. Autoria de versão/publicação/Report são relações diferentes de dono.
Não há model de sessão: TanStack usa cookie/userId.

## Company

Empresa fiscalizada pertencente ao usuário por createdById, com várias inspeções.
Não possui checklists subordinados, membros ou permissões multiempresa. CNPJ
opcional globalmente único entre valores não NULL, inclusive excluídos.
Dados atuais da empresa não são congelados pelo snapshot de checklist.

## Checklist

Identidade reutilizável/catalogação. Conteúdo executável pertence às versões;
campos atuais não reconstroem histórico. Pessoal exige dono; institucional usa
isOfficial=true/isTemplate=true/dono NULL. isTemplate sozinho permite template
pessoal sem permissão especial. isActive governa nova reutilização; deletedAt
é soft delete. Não pertence a Company. Compartilhar publicação não compartilha
inspeções de quem a reutiliza.

## ChecklistVersion

Revisão numerada: DRAFT editável, PUBLISHED/RETIRED com conteúdo imutável no
fluxo de aplicação. Vários números únicos por checklist, no máximo um draft.
Criação pessoal/cópia inicia v1; edição de publicação deriva próximo draft na
mesma identidade. Publicar conserva ID/número e adiciona hash/autoria/data.
Retirar impede novas inspeções sem eliminar histórico.

Criador da versão, publicador e dono do Checklist são conceitos distintos.
Bootstrap institucional usa autores NULL, sem conceder direito de editar.
Não existe sourceVersionId neste model nem FK de versão anterior no Checklist.

## ChecklistVersionItem

Pergunta de uma versão com texto/ordem positiva e única/obrigatoriedade.
sourceVersionItemId registra ancestral; sourceChecklistItemId preserva legado.
Não recebe respostas diretamente. Cópia gera novos IDs; de publicação aponta
ao item estável, de draft conserva ancestral anterior/NULL, sem fixar o item
mutável. Conteúdo independente, sem sincronização automática de cópias.
Ver [ChecklistCopy.md](./ChecklistCopy.md).

## Standard

Catálogo compartilhado de normas com NR/NBR/NT/OTHER e código único.
Leitura autenticada implementada, sem administração por role. Metadados atuais
e atividade orientam novas associações. Mudança no catálogo não atualiza cópias
normativas históricas; cópia de checklist reutiliza Standard.

## ChecklistVersionItemStandard

Associação com PK composta entre item de versão e Standard, copiando tipo,
código, título, resumo e URL. Associações próprias por versão/cópia conservam
FK ao catálogo e fundamentação histórica independente.

## ChecklistItem e ChecklistItemStandard

Dois models legados existentes para compatibilidade/backfill/linhagem. Primeiro
mantém pergunta anterior ao versionamento; segundo associa norma sem copiar
metadados. Não são caminho principal de edição atual. Referências legadas não
equivalem a reconstruir histórico pelo catálogo mutável.

## Inspection

Operação do usuário por userId sobre empresa/publicação. Empresa deve ser própria
na criação; checklist pode ser próprio, de terceiro ou oficial. Inicia PLANNED;
resposta inicia IN_PROGRESS; conclusão exige obrigatórios respondidos.
COMPLETED/CANCELLED bloqueiam novas respostas; enum não implica UI de cancelamento.

Tem respostas, evidências diretas, operações offline e Report opcional. Versão
nullable/snapshot zero ou um no schema; fluxo atual exige ambos na execução,
criando inspeção/snapshot na transação. Sem campo solicitante (RF12/RN07 não entregues).

## InspectionChecklistSnapshot

Fotografia do **conteúdo de checklist** para uma inspeção: título/descrição,
número/IDs de origem/isTemplate/formato/hash/captura, itens/normas próprios.
Não congela User/Company/respostas/NCs/ações/evidências/relatório inteiro nem
copia isOfficial.

Captura atual usa INSPECTION_CREATION/VERIFIED; backfill usa
LEGACY_BACKFILL/UNVERIFIED_LEGACY/formato 0, sem prova retrospectiva. Criação
atual aceita publicação de formato diferente de 1 sem recalcular hash; VERIFIED
nesse caminho não representa validação canônica no formato atual.
Ver [BusinessRules.md](./BusinessRules.md).

## InspectionSnapshotItem

Pergunta congelada com ID próprio/ordem/obrigatoriedade, FK obrigatória ao item
de versão e FK legada opcional. Recebe respostas no contexto da Inspection;
não é o item editável de checklist.

## InspectionSnapshotItemStandard

Associação histórica de item capturado/Standard com PK composta e metadados
copiados. Execução/relatório usam cópias; FK conserva rastreabilidade.

## InspectionResponse

Resposta/observação: COMPLIANT, NON_COMPLIANT, NOT_APPLICABLE. Fluxo resolve item
no snapshot da própria inspeção; referência legada permanece opcional. Contrato
exige um identificador; CHECK físico exige ao menos um, permitindo ambos.
Tem zero ou uma NC, inclusive arquivada. updatedAt é revisão remota;
clientUpdatedAt guarda horário local, sem decidir conflito por relógio do cliente.

## NonConformity

Irregularidade de uma resposta, com severidade/prazo opcional/status/soft delete.
Dono vem de resposta → Inspection.userId, sem owner direto/solicitante/norma
direta. Fundamentação usa item histórico. Pode ter várias ações/evidências.
NON_COMPLIANT cria/restaura; outra resposta arquiva, sem eliminar histórico.

## CorrectiveAction

Tratamento 5W2H: descrição obrigatória; responsável/prazo/porquê/local/método/custo
opcionais. Responsável/custo são texto, sem FK User ou valor monetário calculável.
Dono é o da inspeção da NC; nome do responsável não recebe acesso. Conclusão
registra completedAt; reabertura por status limpa-o. Sem Evidence direta à ação.

## Evidence

Metadados de imagem externa, ligada exatamente a Inspection **ou** NonConformity.
Cloudinary guarda binário; banco identificação/URL/MIME/tamanho/dimensões/legenda/
timestamps. Service exige dono/contexto histórico. Upload/listagem/remoção são
reais online com soft delete/compensações; binários offline futuros. Não é parte
congelada do snapshot. Autorização de metadados não protege por si só URL externa.

## Report

Registro persistível de gerador/versão/data/observações, zero ou um por inspeção
pela FK única; version não cria várias linhas históricas. **Diferente do relatório
sob demanda**: Repository consulta Inspection, e abrir DTO/HTML/imprimir não
insere Report nem armazena PDF. Projeção combina checklist congelado com cadastro/
operação atuais, limitada por Inspection.userId. Ver [API.md](./API.md).

## OfflineSyncOperation

Confirmação remota idempotente de SAVE_INSPECTION_RESPONSE/FINISH_INSPECTION,
do usuário da sessão/inspeção. UUID estável do cliente/tipo/hash/horários identificam
confirmação na transação da mutação. Sem status/payload completo/fila; fila é
IndexedDB. Retry compara usuário/inspeção/tipo/hash. Não substitui snapshot nem
constitui audit log completo. [Offline.md](./Offline.md) delimita incremento parcial.

## Relações e referências

Company e Checklist são raízes independentes. Inspection combina referências,
possui snapshot/respostas e define ownership das tratativas. Evidence tem dois
contextos exclusivos; relatório sob demanda projeta essas relações.
Não é cadeia linear Company → Checklist → Report → Evidence.

Regras: [BusinessRules.md](./BusinessRules.md). Curadoria:
[OfficialTemplates.md](./OfficialTemplates.md). Modelos/constraints:
[Database.md](./Database.md) e [Dicionário de Dados](../Documentation/DicionarioDeDados.md).
