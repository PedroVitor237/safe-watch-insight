# 8. Modelo Físico do Banco de Dados

## 8.1 Objetivo

O modelo físico descreve a implementação PostgreSQL/Neon mapeada pelo Prisma
ORM. O arquivo `prisma/schema.prisma` é a fonte oficial; alterações estruturais
são aplicadas exclusivamente por Prisma Migrate.

## 8.2 Diagrama

A Figura 10 está definida em
[`iagramaModeloFisicoDB.puml`](./iagramaModeloFisicoDB.puml) e representa as
tabelas vigentes, incluindo versões publicadas e snapshots de inspeção.

> **Figura 10 – Modelo Físico do Banco de Dados da Plataforma SST**

O núcleo histórico segue o fluxo:

```text
Checklist
  -> ChecklistVersion
    -> ChecklistVersionItem
      -> ChecklistVersionItemStandard

Inspection
  -> InspectionChecklistSnapshot
    -> InspectionSnapshotItem
      -> InspectionSnapshotItemStandard
      -> InspectionResponse
        -> NonConformity
          -> CorrectiveAction
```

## 8.3 Tipos e tabelas adicionados

Enums:

- `ChecklistVersionStatus`: `DRAFT`, `PUBLISHED`, `RETIRED`;
- `InspectionSnapshotOrigin`: `INSPECTION_CREATION`, `LEGACY_BACKFILL`;
- `InspectionSnapshotIntegrityStatus`: `VERIFIED`, `UNVERIFIED_LEGACY`.

Tabelas:

- `ChecklistVersion`;
- `ChecklistVersionItem`;
- `ChecklistVersionItemStandard`;
- `InspectionChecklistSnapshot`;
- `InspectionSnapshotItem`;
- `InspectionSnapshotItemStandard`.

Alterações expansivas:

- `Inspection.checklistVersionId` foi adicionado como FK opcional durante a
  compatibilidade;
- `InspectionResponse.snapshotItemId`, `createdAt` e `updatedAt` foram
  adicionados;
- `InspectionResponse.checklistItemId` tornou-se opcional e permanece apenas
  como ponte legada.

## 8.4 Restrições de integridade

| Restrição | Garantia |
| --- | --- |
| `UNIQUE ChecklistVersion(checklistId, versionNumber)` | numeração não se repete |
| índice único parcial de draft | no máximo um `DRAFT` por checklist |
| checks de publicação | draft sem hash/publicação; publicada/retirada com hash, autor e data |
| `UNIQUE ChecklistVersionItem(checklistVersionId, orderIndex)` | ordem única na versão |
| `UNIQUE InspectionChecklistSnapshot(inspectionId)` | um snapshot por inspeção |
| `UNIQUE InspectionSnapshotItem(snapshotId, orderIndex)` | ordem única no snapshot |
| `UNIQUE InspectionResponse(inspectionId, snapshotItemId)` | uma resposta por item histórico |
| check de referência da resposta | snapshot ou relação legada obrigatória |
| `ON DELETE RESTRICT` nas FKs históricas | conteúdo referenciado não é removido |
| hashes `CHAR(64)` validados | representação hexadecimal de SHA-256 |

Os índices adicionais cobrem status e publicação de versões, chaves de origem,
itens por versão/snapshot, códigos normativos, versão da inspeção e situação de
integridade.

## 8.5 Backfill físico

A migration
`20260803150000_add_checklist_versions_and_inspection_snapshots` executa uma
expansão sem excluir dados:

1. cria uma versão publicada inicial para cada checklist existente;
2. copia itens e metadados normativos;
3. vincula inspeções à versão importada;
4. cria snapshot e itens com identificadores determinísticos;
5. copia normas do snapshot;
6. mapeia cada resposta legada ao item histórico;
7. aborta toda a transação se alguma inspeção ou resposta ficar sem mapeamento.

O hash do backfill usa o melhor estado recuperável. Como o modelo antigo não
guardava revisões, snapshots importados recebem `LEGACY_BACKFILL`,
`UNVERIFIED_LEGACY` e formato 0.

## 8.6 Compatibilidade e evolução

`ChecklistItem` e `ChecklistItemStandard` não foram removidos. Essa estratégia
permite implantação progressiva e rollback operacional sem destruir o grafo
existente de respostas, não conformidades e ações corretivas. Novas gravações,
entretanto, usam versão publicada, snapshot e `snapshotItemId`.

Depois que não houver consumidores legados e a sincronização offline estiver
definida, uma migration futura poderá tornar as novas FKs obrigatórias e remover
as tabelas antigas. Essa limpeza não pertence ao sprint atual.

## 8.7 Considerações

A duplicação de campos nos limites de versão e snapshot é deliberada. Ela
preserva título, perguntas e fundamentação normativa sem depender do estado
atual do catálogo, oferecendo uma base estável para relatórios, evidências,
assinaturas e sincronização futuras.
