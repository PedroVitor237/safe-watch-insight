# 10. Especificação da API

## 10.1 Objetivo

Este documento registra a especificação da camada de comunicação atualmente
implementada na plataforma **Safe Watch Insight**.

Na implementação atual, a aplicação utiliza **TanStack Start Server Functions**
em vez de endpoints REST tradicionais. A documentação detalhada de cada Server
Function implementada está em [AI/API.md](../AI/API.md).

Este arquivo permanece na pasta `Documentation/` por fazer parte do conjunto acadêmico do TCC, mas foi atualizado para refletir a implementação atual.

---

## 10.2 Arquitetura Atual

```text
React
-> Hook / React Query ou chamada direta
-> TanStack Start Server Functions
-> Validação Zod / sessão
-> Services
-> Repositories
-> Prisma ORM
-> PostgreSQL
```

Responsabilidades:

- React renderiza a interface.
- React Query gerencia cache, loading e invalidação.
- Server Functions recebem chamadas do frontend e validam entradas.
- Services concentram regras de negócio.
- Repositories executam persistência com ownership, transações e controles de revisão/deduplicação.
- Prisma acessa o PostgreSQL.

Login chama a Function diretamente; beforeLoad/getAppSession protege navegação.
Respostas/conclusão usam Dexie/fila e sincronizam pela mesma fronteira. Essa
variação não muda a autoridade de sessão/autorização no servidor. Arquitetura e
diagramas: [AI/Architecture.md](../AI/Architecture.md).

---

## 10.3 Autenticação

A autenticação atual usa:

- e-mail e senha;
- bcrypt para validação de senha;
- sessão HTTP-only do TanStack Start;
- cookie `safe_watch_session`;
- duração de sessão de 8 horas.

Cadastro público usa `register`, atribui TECHNICIAN no servidor e não cria sessão
automaticamente. Identidade de negócio vem da sessão; papéis armazenados não
implementam RBAC. Regras completas em [AI/BusinessRules.md](../AI/BusinessRules.md).

Credenciais de demonstração criadas pelo seed:

```text
Email: demo.user@example.test
Senha: Demo@12345
```

---

## 10.4 Padrão de Respostas

Os exemplos abaixo são envelopes dos handlers de aplicação. getGreeting retorna
objeto auxiliar diretamente. Validação Zod anterior ao handler e exceções
inesperadas podem produzir erro do framework, sem esse envelope. statusCode é
lógico e não garante status HTTP. Result não tem campo error; cliente confere
success além de tratar exceções. Alguns Services normalizam genéricos, outros
os relançam: não há conversor global de erro garantido.

Sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "message": "Descrição do erro.",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

---

## 10.5 Server Functions Implementadas

Inventário reconferido na Fase 5: 48 Functions/14 arquivos, 45 POST/3 GET; 43
operações de negócio exigem sessão. Login/register públicos, logout sem exigir
sessão válida, getCurrentSession usa sessão se existir e getGreeting é auxiliar
público. Métodos são os de createServerFn, sem URLs REST manuais.

### Autenticação

- `login`
- `register`
- `getCurrentSession`
- `logout`

### Empresas

- `createCompany`
- `updateCompany`
- `deleteCompany`
- `getCompanyById`
- `listCompanies`

### Checklists

- `createChecklist`
- `updateChecklist`
- `deleteChecklist`
- `getChecklistById`
- `listChecklists`
- `copyChecklist`
- `useOfficialTemplate`

Cópia cria identidade pessoal independente e DRAFT v1. Draft próprio pode ser
origem; terceiro/oficial exige publicação acessível, formato 1 e hash íntegro.
Publicação e retirada exigem ownership; retirada tem API/hook, sem ação na UI.
Contratos e limites em [AI/API.md](../AI/API.md).

### Itens de Checklist

- `createChecklistItem`
- `updateChecklistItem`
- `deleteChecklistItem`
- `listChecklistItems`

### Versões de Checklist

- `listChecklistVersions`
- `publishChecklistVersion`
- `retireChecklistVersion`

### Inspeções

- `createInspection`
- `getInspectionById`
- `listInspections`
- `deleteInspection`

### Respostas da Inspeção

- `listInspectionResponses`
- `saveInspectionResponse`
- `finishInspection`

Os contratos de inspeção preservam compatibilidade progressiva:

- `createInspection` aceita `checklistVersionId` publicado e, quando omitido,
  resolve a publicação mais recente no servidor;
- a criação persiste inspeção e snapshot histórico na mesma transação;
- `saveInspectionResponse` usa `snapshotItemId` e aceita temporariamente o
  `checklistItemId` legado, nunca os dois ao mesmo tempo;
- consultas de inspeção e não conformidade retornam o conteúdo do snapshot, não
  o estado atual do checklist.
- `saveInspectionResponse` e `finishInspection` aceitam metadados opcionais de
  operação offline; a Server Function usa o usuário da sessão e o backend grava
  a deduplicação na mesma transação da mutação.

Não há startInspection: a primeira resposta inicia IN_PROGRESS. Não há
updateInspection/cancelInspection expostos; enums não implicam operações.
Snapshot nasce com inspeção, sem CRUD próprio.

### Normas

- `getStandardById`
- `listStandards`

### Não Conformidades

- `createNonConformity`
- `getNonConformityById`
- `listNonConformities`
- `updateNonConformity`
- `deleteNonConformity`

### Ações Corretivas

- `createCorrectiveAction`
- `listCorrectiveActions`
- `updateCorrectiveAction`
- `deleteCorrectiveAction`

Conclusão de ação usa updateCorrectiveAction com COMPLETED; reabertura de NC
arquivada ocorre por resposta NON_COMPLIANT, sem Function própria de reabertura.
Listagens/detalhes de NC e listagem de ações podem persistir OVERDUE; dashboard
somente calcula atraso na leitura.

### Evidências

- `uploadEvidence` (`FormData`, imagem e exatamente um contexto histórico);
- `listEvidence`;
- `removeEvidence` (remoção externa e soft delete compensado).

O upload é assinado exclusivamente no servidor por uma implementação de
`StorageService`. O cliente nunca recebe o segredo do Cloudinary. Banco guarda
metadados, provedor guarda binário; compensação não é atomicidade distribuída. URL externa não exige
sessão da aplicação em cada download. O contrato
detalhado, validações e erros estão documentados em
[AI/API.md](../AI/API.md).

### Exemplo técnico

- `getGreeting`

### Relatórios e dashboard

- `listAvailableInspectionReports`
- `getInspectionReport`
- `getDashboard`

Consultas limitadas às inspeções do usuário da sessão. Relatório é montado sob
demanda, sem inserir Report ou armazenar PDF; a UI imprime pelo navegador.
Report existe como model persistível, sem CRUD web atual. Disponíveis exige
inspeções COMPLETED; detalhe backend exige snapshot/ownership, sem COMPLETED.
Dashboard usa agregações reais, não mocks. OfflineSyncOperation é confirmação
interna das mutações de resposta/conclusão, sem endpoint universal de fila.

---

## 10.6 Funcionalidades Ainda Não Implementadas na API

Os seguintes módulos estão previstos no projeto ou modelados parcialmente no
banco, mas ainda não possuem API completa:

- usuários administrativos;
- criação integral de inspeção offline;
- reconciliação assistida de conflitos;
- sincronização de evidências binárias offline.

---

## 10.7 Observação sobre REST

Uma API REST tradicional ou Route Handlers de outro framework podem ser
avaliados em evolução futura. O contrato real da aplicação é a camada de Server
Functions documentada em [AI/API.md](../AI/API.md).

Esta especificação teve origem na documentação acadêmica da Atividade 2 e foi
mantida como referência permanente após a evolução da implementação.

## 10.8 Precisões operacionais da Fase 6

Não altera inventário da Fase 5. Inspection nasce PLANNED/SYNCED; respostas
iniciam IN_PROGRESS; finishInspection exige obrigatórios respondidos (N/A válido,
opcionais pendentes permitidos), sem exigir NC resolvida/fotos/ações concluídas.
COMPLETED/CANCELLED bloqueiam novas respostas; NCs/ações/evidências continuam
tratáveis em contextos próprios ativos. deleteInspection é soft delete em
qualquer estado, sem ação UI; não há cancelamento/reabertura/edição geral públicos.

5W2H: description=what obrigatório; why, location=where, dueDate=when,
responsible=who, method=how e estimatedCost opcionais/nullable; completedAt do
servidor. NC nova automática: MEDIUM/OPEN/+sete dias; arquivada restaura OPEN
conservando prazo/dados/filhos. Concluir ações não resolve NC automaticamente.

Evidência: um File por FormData; MIME JPEG/PNG/WebP, até 4.194.304 bytes,
assinatura/tamanho real/nome/legenda validados; XOR também em CHECK SQL.
Upload e destroy externos são compensados por tentativas, sem rollback conjunto;
arquivo órfão/restauração incompleta são possíveis. Não há evidência binária offline.

Relatório: resumo de itens/respondidos/conformes/NC/N/A/pendentes/preenchimento;
preenchimento inclui N/A e é 0 sem itens. DTO de snapshot + empresa/inspetor e
tratativas atuais; atrasos apenas derivados. Lista de disponíveis sem paginação
por inspectionDate DESC/id DESC; detalhe por ID sem exigir COMPLETED.
Report persistível é distinto da projeção; sem PDF backend/registro por leitura.

Dashboard: conformidade arredondada COMPLIANT/(COMPLIANT+NON_COMPLIANT) em
respostas com snapshotItemId de COMPLETED; sem aplicáveis NULL, N/A/pendentes
fora. Recentes até cinco por inspectionDate DESC/createdAt DESC/id DESC.
Ações vencidas só sob NC OPEN/IN_PROGRESS/OVERDUE; atenção soma planejadas +
NCs vencidas + ações vencidas. Sem filtros avançados/BI/pacote offline próprio.

Sincronização local-first conserva revisão remota esperada no payload;
clientCreatedAt vira clientUpdatedAt da resposta, sem substituir updatedAt
remoto. UUID/identidade/hash e mutação são persistidos juntos; conflito bloqueia
fila. Sessão local não autoriza persistência remota. Matriz completa e fluxos
Mermaid/PlantUML: [BusinessRules.md](../AI/BusinessRules.md) e
[Offline.md](../AI/Offline.md). Concerns e validação documental:
[RelatorioFase6.md](./RelatorioFase6.md).
