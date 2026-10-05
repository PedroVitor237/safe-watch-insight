# Especificação de Telas — Safe Watch Insight

Este documento descreve as interfaces atuais da plataforma de apoio a
inspeções, auditorias e fiscalizações de Segurança e Saúde no Trabalho (SST).
Revisão da Fase 8 em **4 de outubro de 2026**, sobre
`5d323ae8d1e26d87198592564876616b04936f14`. A conferência é estática, sem
nova validação em navegador. O [mapa de navegação](./MAPA_DE_NAVEGACAO.md)
inventaria todas as URLs; o [guia do usuário](./GUIA_USUARIO.md) explica as tarefas.
[Wireframes](./WIREFRAMES.md) são referência histórica de design.

## Convenções de estado

- **Integrado:** usa Server Functions, Services, Repositories, Prisma e
  PostgreSQL.
- **Integrado com offline parcial:** usa o backend e também a persistência local
  do primeiro incremento Offline/PWA.
- **Demonstrativo:** apresenta a experiência planejada com dados locais
  identificados na interface; não deve ser interpretado como módulo concluído.

Todas as telas internas usam o `AppShell`, com menu lateral recolhível, barra
superior, indicador de sincronização, notificações e acesso ao usuário
autenticado. O menu é dividido entre **Operação** e **Cadastros**.

**Acesso:** `/login` e `/register` são públicos; todas as telas das seções 2–14
exigem sessão pelo layout autenticado. Recursos pessoais pertencem ao usuário;
NCs, ações e evidências seguem a inspeção de origem. Não existe acesso global
administrativo por papel. `$id` é substituído pelo identificador do registro.
`/` apenas encaminha para `/login`; `_app` e `__root` são layouts, sem URL própria.
O sino da barra superior não oferece um fluxo de notificações implementado.

## 1. Login

- **Rota:** `/login`
- **Estado:** integrado

### Objetivo

Autenticar um usuário cadastrado e iniciar uma sessão protegida.

### Componentes

- campos de e-mail e senha;
- botão **Entrar** com estado de envio;
- painel institucional em telas largas;
- bloco com as credenciais do ambiente demonstrativo.

O formulário não possui seletor de perfil. Credenciais inválidas são rejeitadas
pelo backend. E-mail inválido e senha vazia também são rejeitados; falhas são
apresentadas por notificações, sem prometer mensagens de campo como no cadastro.
O botão mostra **Entrando...** durante envio. **Criar conta** abre `/register`.
O bloco **Ambiente de demonstração** expõe **Usuário Demonstração** (técnico),
`demo.user@example.test` / `Demo@12345`; o ambiente precisa conter essa conta.
A sessão dura oito horas; após expiração, pode ser necessário entrar novamente.
A validade local offline não substitui a autenticação para sincronizar.

### Navegação

`/` redireciona para esta tela. Um login válido leva a `/dashboard`; uma
sessão já ativa também evita a reapresentação do formulário.

## 1.1 Cadastro público

- **Rota:** `/register`
- **Estado:** integrado; acesso público
- **Objetivo:** criar uma conta para entrar posteriormente.
- **Campos:** Nome, E-mail, Senha e Confirmar senha; não há seleção de papel.
- **Validação:** nome não vazio após retirar espaços nas extremidades, e-mail
  válido normalizado para minúsculas, senha de pelo menos oito caracteres e
  confirmação idêntica. Erros de campo aparecem no formulário.
- **Feedback:** botão **Criando conta...** durante envio; duplicidade de e-mail
  é recusada, inclusive para conta excluída logicamente. Falhas retornadas são
  notificadas; exceções podem produzir mensagem genérica de nova tentativa.
- **Sucesso:** **Conta criada. Entre com seu e-mail e senha.** e navegação para
  `/login`, sem login automático. Link **Entrar** também leva a `/login`.
- **Limites:** papel técnico (`TECHNICIAN`) fixado pelo servidor; não há confirmação
  de e-mail, recuperação de senha ou administração de usuários. Cadastro exige conexão.

## 2. Dashboard

- **Rota:** `/dashboard`
- **Estado:** integrado

### Objetivo

Exibir a visão operacional das inspeções do usuário autenticado, com agregações
reais do PostgreSQL via useDashboard/getDashboard/Service/Repository.

### Componentes

- cinco cards: Total de inspeções, Concluídas, Em andamento, NCs abertas e
  Conformidade;
- gráfico de barras **Inspeções por status** (Planejadas, Em andamento,
  Concluídas e Canceladas);
- **Requer atenção**: planejadas, NCs vencidas e ações vencidas; o badge soma
  essas contagens, sem deduplicar inspeções;
- até cinco **Inspeções recentes**, título/versão do snapshot, empresa/inspetor
  atuais e status;
- **Nova inspeção**, **Ver todas**, **Ver inspeção** ou **Ver relatório** para
  concluídas (/relatorios?inspectionId=UUID);
- skeletons, erro com **Tentar novamente** e estado sem inspeções.

Recentes são ordenadas por inspectionDate DESC, createdAt DESC, id DESC.
NCs abertas incluem OPEN/IN_PROGRESS/OVERDUE. Conformidade =
round(100 × COMPLIANT/(COMPLIANT+NON_COMPLIANT)) nas respostas com snapshotItemId
em inspeções COMPLETED. N/A e pendentes ficam fora; sem aplicáveis exibe **—**.
Atrasos são calculados sem alterar status no banco. Não há BI, filtros avançados,
séries históricas ou exportação. A query não tem pacote offline próprio.
Fórmulas completas: [BusinessRules.md](../AI/BusinessRules.md).

## 3. Lista de inspeções

- **Rota:** `/inspecoes`
- **Estado:** integrado com offline parcial

### Objetivo

Consultar inspeções persistidas e abrir o fluxo de criação ou execução.

### Componentes

- busca por empresa, checklist ou observações;
- filtro por Planejada, Em andamento, Concluída ou Cancelada;
- botão **Nova inspeção**;
- lista responsiva com código, snapshot/versão, empresa, data, inspetor e
  status;
- estados de carregamento, erro e lista vazia.

Cada registro navega para `/inspecoes/$id`. Lista própria com fallback para
pacotes previamente cacheados no dispositivo; não inclui todo o banco offline.
Não há ação de edição/cancelamento/reabertura/exclusão nessa UI, embora exclusão
lógica exista na Server Function/hook.

## 4. Nova inspeção

- **Rota:** `/inspecoes/nova`
- **Estado:** integrado

### Objetivo

Criar uma inspeção e seu snapshot histórico a partir de uma versão publicada.

### Componentes

O assistente possui três etapas:

1. seleção da empresa;
2. seleção da versão publicada e observações iniciais;
3. data/hora e resumo.

Os botões **Voltar**, **Avançar** e **Criar inspeção** controlam o fluxo. A
criação online usa o usuário autenticado como responsável, empresa própria,
checklist ativo acessível e versão PUBLISHED; persiste PLANNED/SYNCED com snapshot
na mesma transação e retorna à lista de inspeções.

**Avançar** exige empresa no primeiro passo e versão publicada no segundo.
Sem publicações, a tela orienta publicar um checklist. Data/hora é opcional:
se vazia, usa o momento da criação e o resumo mostra **Agora**. Erros são
notificados e o botão fica indisponível durante envio. Não há atalho para criar
empresa nesse assistente: use `/empresas` no menu e depois retorne.
Não há seleção de unidade, solicitante, título independente ou outro inspetor.
Criação exige conexão; a publicação oficial também pode ser utilizada diretamente.

## 5. Detalhe e execução de inspeção

- **Rota:** `/inspecoes/$id`
- **Estado:** integrado com offline parcial

### Objetivo

Executar o snapshot histórico do checklist, registrar respostas e evidências e
concluir a inspeção.

### Componentes

- cabeçalho com status da inspeção e da sincronização;
- aviso para snapshots legados não verificáveis;
- cards de progresso, não conformidades, inspetor e data;
- abas **Execução do checklist**, **Evidências** e **Encerrar**.

Na execução, cada item exibe descrição, ordem, obrigatoriedade e normas
históricas. As respostas disponíveis são **Conforme**, **NC** e **N/A**. Após
uma resposta, o campo de observação é exibido. Uma resposta NC gera a não
conformidade correspondente por regra de negócio.

A aba de evidências permite seleção múltipla, prévia, legenda opcional (até 500
caracteres), upload, consulta e remoção de JPEG, PNG ou WebP de até 4 MB por
arquivo. Arquivos vazios/formato/tamanho inválidos são recusados; envios podem
ter sucesso parcial e apresentam notificações. A lista exibe foto, nome, tamanho,
dimensões quando disponíveis e legenda; abrir usa imagem/link e remover pede
confirmação para arquivar. Seleção/upload ficam indisponíveis sem conexão.

A aba de encerramento informa a imutabilidade após conclusão e apresenta o botão
**Concluir inspeção**. A assinatura não está disponível. Respostas e conclusão
são persistidas localmente antes da tentativa de sincronização, inclusive online.
N/A atende item obrigatório; opcionais podem ficar pendentes. Não exige NC
resolvida/fotos/ações concluídas. COMPLETED/CANCELLED desabilitam respostas e
observações; não congela NCs/ações/evidências. Em COMPLETED aparece **Ver relatório**
com inspectionId na busca; encerramento retorna à lista e só se confirma no
servidor após sync. Sem reabertura de inspeção.

## 6. Biblioteca de checklists

- **Rota:** `/checklists`
- **Estado:** integrado; operações online
- **Objetivo:** consultar conteúdo disponível e manter checklists pessoais.

A abertura inicia em **Templates oficiais**. **Meus checklists** mostra recursos
próprios; **Publicados por usuários** mostra publicações acessíveis de terceiros.
A Biblioteca lista somente ativos, com paginação **Anterior/Próxima** quando
necessária. Desativar um pessoal faz com que deixe de aparecer nessa lista;
não há filtro de inativos na tela atual.

Os cartões exibem título, descrição, tipo, atividade, versão de trabalho e
quantidade de itens. Existem estados de carregamento, falha e **Nenhum checklist
cadastrado**. **Abrir** navega para `/checklists/$id`. **Usar template** em oficial
cria uma cópia pessoal e abre seu novo detalhe.

**Novo modelo** abre diálogo com título obrigatório (1–255 caracteres após
aparar espaços), descrição opcional, **Template pessoal** e **Ativo**. Salvar
cria rascunho v1 e seleciona **Meus checklists**. **Editar** metadados e **Excluir**
com confirmação aparecem somente nos recursos próprios. Exclusão é lógica e
preserva o histórico de inspeções. Envios mostram sucesso/falha por notificações.
Não há formulário para criar ou editar templates oficiais.

## 7. Detalhe, editor e cópia de checklist

- **Rota:** `/checklists/$id`
- **Estado:** integrado; operações online
- **Objetivo:** consultar itens publicados ou manter o conteúdo pessoal e publicar.

Exibe título/descrição, tipo, atividade, versão, quantidade/ordem dos itens,
obrigatoriedade e NRs. O proprietário vê o rascunho atual quando disponível;
terceiros e oficiais expõem publicação, sem permitir editar draft alheio.
Há carregamento, recurso não encontrado e ausência/carregamento de itens.
**Voltar** retorna à Biblioteca.

**Novo item**, **Editar** e **Excluir** por item são controles pessoais. O diálogo
exige descrição e permite indicar obrigatoriedade e selecionar NRs vigentes;
a associação normativa é opcional. Excluir item e publicar pedem confirmação;
erros e sucessos são notificados. A tela mostra ordem, sem controle completo de
reordenação.

**Publicar vN**, quando há rascunho próprio, fixa o conteúdo daquela versão.
Alterações seguintes criam/reutilizam o próximo rascunho na mesma identidade,
preservando publicação e inspeções antigas. A nova publicação não retira as
anteriores automaticamente. `RETIRED` é estado de versão no backend; não existe
botão de retirada nem interface completa de histórico/seleção de versões nesta tela.

| Termo               | Comportamento atual                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Checklist pessoal   | Pertence ao usuário; rascunho editável, inicialmente privado                                               |
| Checklist publicado | Versão imutável; quando a identidade está ativa, pode ser consultada/reutilizada por usuários autenticados |
| Template oficial    | Conteúdo institucional Safe Watch Insight; original consultável, sem manutenção pelo usuário comum         |
| Cópia independente  | Novo checklist pessoal ativo, rascunho v1 e itens com identidades próprias                                 |

**Copiar checklist** aparece no detalhe pessoal/publicado quando há draft ou
publicação; **Usar template** aparece no oficial, com fonte/escopo e aviso de
curadoria da plataforma. Sucesso abre `/checklists/$id` com **novo identificador**
e orienta revisar/publicar. Não há rota separada de cópia ou edição.

Origem própria prefere seu draft; na ausência, última publicação elegível,
inclusive para próprio inativo não excluído. Origem de terceiro/oficial exige
identidade ativa e última publicação acessível íntegra, sem copiar draft alheio.
Só versões retiradas, conteúdo excluído ou publicação legada/inconsistente
podem impedir a cópia; a tela apresenta a falha da operação.

Itens/associações/metadados normativos são independentes; a linhagem disponível
por item é preservada, incluindo ancestral publicado ao copiar um draft, quando
existente. Não transfere autoria institucional, marca de template, inspeções,
respostas ou histórico de tratativas. Detalhes:
[ChecklistCopy.md](../AI/ChecklistCopy.md). Definições e fontes:
[OfficialTemplates.md](../AI/OfficialTemplates.md). Construção adapta Murbach
(2019); trabalho em altura é curadoria da plataforma, sem atribuição a Murbach.

## 8. Lista de não conformidades

- **Rota:** `/nao-conformidades`
- **Estado:** integrado

### Objetivo

Pesquisar e acompanhar as não conformidades geradas nas inspeções.

### Componentes

- busca por descrição, item ou empresa;
- filtro por severidade;
- abas **Kanban** e **Lista**;
- colunas Abertas, Em tratativa, Resolvidas e Vencidas;
- cards e linhas com código, item histórico, empresa, prazo, responsável,
  severidade e status.

Cards e linhas levam a `/nao-conformidades/$id`.

## 9. Detalhe de não conformidade

- **Rota:** `/nao-conformidades/$id`
- **Estado:** integrado

### Objetivo

Tratar uma não conformidade sem perder o contexto histórico da inspeção.

### Componentes

- edição de descrição, severidade e prazo;
- painel de ações corretivas com campos aplicáveis do 5W2H;
- histórico de criação, atualização e ações;
- detalhes da empresa, inspetor, prazo e inspeção de origem;
- normas históricas e links oficiais quando disponíveis;
- seletor de status;
- painel de evidências;
- ações **Arquivar** e **Voltar**.

O identificador da inspeção de origem é um link para `/inspecoes/$id`. A NC é
isolada pela inspeção do usuário; descrição/severidade/prazo/status continuam
editáveis após conclusão da inspeção. Arquivar oculta NC/filhos na API sem
exclusão física; mudar resposta de NC para Conforme/N/A também arquiva a NC.
Nova NC automática é MEDIUM/OPEN com prazo de sete dias; restauração conserva
prazo/descrição/severidade/filhos e volta a OPEN.

No 5W2H, apenas descrição é conteúdo obrigatório; justificativa, local,
responsável, prazo, método e custo são opcionais. Ações oferecem status Pendente,
Em andamento, Concluída e Vencida, com criação/edição e exclusão confirmada. Criar ação
em NC OPEN muda NC para IN_PROGRESS; concluir ações não resolve NC automaticamente.
A conclusão ocorre por **Editar → Status → Concluída → Salvar alterações**;
a data é registrada automaticamente, sem campo para preenchê-la.
Listas/detalhes de NC e listagem de ações persistem atrasos,
diferentemente de dashboard/relatório. UI possui histórico derivado de datas,
sem audit log completo. Coerção de prazo vazio/NULL e concerns em
[BusinessRules.md](../AI/BusinessRules.md).

## 10. Relatórios

- **Rota:** `/relatorios`, busca opcional `inspectionId` UUID
- **Estado:** integrado

### Objetivo

Visualizar relatório por inspeção própria, montado sob demanda a partir de dados
persistidos, e imprimir pelo navegador.

### Componentes

- seletor de inspeções COMPLETED próprias com snapshot, ordenadas por data DESC/
  id DESC; sem busca seleciona a primeira disponível;
- identificação, empresa e inspetor atuais, título/versão/captura do snapshot;
- alerta UNVERIFIED_LEGACY quando aplicável;
- resumo (total/respondidos/conformes/NC/N/A/pendentes/preenchimento), notas,
  resultados item a item, fundamentação normativa, evidências gerais, NCs e
  ações corretivas/evidências ativas;
- skeletons, ausência de concluídas, erros e **Tentar novamente**;
- **Imprimir** habilitado quando há relatório: window.print() → diálogo do
  navegador → impressão ou salvar como PDF. CSS A4 oculta menu/controles.

O parâmetro inspectionId consulta diretamente mesmo fora da lista: backend
valida dono/snapshot, sem exigir COMPLETED. Essa diferença está registrada para
Final QA em [RelatorioFase6.md](./RelatorioFase6.md). Nenhuma visualização insere
Report ou gera arquivo PDF backend; Report é model persistível separado.
Preenchimento conta N/A e retorna 0 sem itens; não é taxa de conformidade.
Opcionais pendentes podem existir em concluídas. Conclusão não redireciona
automaticamente a esta tela; **Ver relatório** existe no detalhe/dashboard.
Não há pacote/fila offline dedicado para relatórios.

## 11. Empresas

- **Rota:** `/empresas`
- **Estado:** integrado

### Objetivo

Manter as empresas fiscalizadas utilizadas nas inspeções.

### Componentes

- cards com razão social, nome fantasia, CNPJ, CNAE, endereço, funcionários e
  grau de risco;
- botão **Nova empresa**;
- ações **Editar** e **Excluir**;
- diálogo com razão social, nome fantasia, CNPJ, CNAE, grau de risco,
  funcionários, endereço e observações.

**Acesso e validação:** lista somente empresas próprias não excluídas. Razão
social e CNAE são obrigatórios; grau de risco é inteiro entre 1 e 4 e funcionários
é inteiro não negativo. Nome fantasia, CNPJ, endereço e observações são opcionais.
CNPJ informado aceita 14 dígitos, com ou sem máscara, e é normalizado; não há
consulta externa nem validação prometida de dígitos verificadores. Unicidade
abrange o banco, inclusive empresas excluídas logicamente e de outros usuários.
Não equivale a acesso ao cadastro alheio.

**Estados e feedback:** carregamento, falha e **Nenhuma empresa cadastrada**;
salvar notifica sucesso/falha e desabilita envio enquanto processa. **Excluir**
pede confirmação e arquiva logicamente, retirando o registro da lista/seleção de
novas inspeções. Não há botão de restauração, detalhe ou atalho direto para
inspeções no cartão. Use o menu **Inspeções → Nova inspeção** para selecioná-la.

## 12. Normas Regulamentadoras

- **Rota:** `/normas`
- **Estado:** integrado

### Objetivo

Consultar o catálogo de Normas Regulamentadoras persistido.

### Componentes

- busca por código, título ou descrição;
- filtro por vigentes, revogadas ou todas;
- cards com código, título, resumo e estado;
- link **Consultar fonte oficial** quando o endereço está cadastrado.

## 13. Equipe

- **Rota:** `/equipe`
- **Estado:** demonstrativo

### Objetivo

Apresentar a experiência planejada para consulta da equipe.

### Componentes

- aviso **Dados demonstrativos**;
- cards de usuários com nome, e-mail, perfil, registro e métricas locais.

Não há gestão de usuários integrada ao backend nesta tela.

## 14. Configurações

- **Rota:** `/configuracoes`
- **Estado:** misto

### Objetivo

Reunir preferências locais, diagnóstico da persistência offline e controles dos
módulos demonstrativos.

### Componentes

- **Aparência:** alternância local de modo escuro;
- **Perfil ativo:** seleção demonstrativa que afeta apenas telas mockadas;
- **Funcionamento offline:** conexão detectada, inspeções no dispositivo,
  operações pendentes, falhas, conflitos e **Sincronizar agora**;
- **Dados do protótipo:** restauração somente dos dados demonstrativos.

O modo escuro é um controle da tela, sem persistência de preferência entre
aberturas. O texto de **Dados do protótipo** ainda cita dashboard/relatórios;
esses módulos atuais consultam dados reais e não são restaurados por esse botão.
Não há edição persistida de perfil ou administração de usuários.

Não existe alternância manual para simular conectividade. O estado online vem do
navegador e o resultado das operações é confirmado pelo servidor.

## 14.1 Continuidade offline, sincronização e saída

Inspeções próprias criadas, listadas ou abertas online podem ser disponibilizadas
localmente. A lista/detalhe usam esses pacotes offline; disponibilidade da página
após reabertura também depende de ter sido carregada/armazenada no dispositivo.
Respostas, observações e conclusão são salvas localmente, inclusive online;
não representam confirmação remota. Concluir valida obrigatórios e bloqueios
locais de falha/conflito, retorna à lista e deixa envio pendente.

O indicador superior mostra Online/Offline, pendências, sincronização, falhas ou
conflitos. Há retry no botão **Sincronizar dados locais** da barra e em
**Sincronizar agora** nas Configurações. A fila pode reenviar automaticamente
com conexão e sessão remota válida. Erro pode ser retentado; conflito bloqueia
avanço e não possui resolução automática ou assistida. A primeira operação
bloqueada pode impedir envios de outras inspeções.

**Sair** retorna a `/login` e tenta limpar sessão, inspeções, alterações pendentes
e cache local de navegação. Trocar a identidade autenticada também limpa dados
anteriores. **Sincronize antes de sair ou trocar de conta**; falhas de limpeza
ou logout remoto geram notificações. Não há promessa de retenção contra limpeza
do navegador. Cadastro/criação de inspeção/checklist, manutenção de NCs/ações e
upload de imagens exigem conexão; relatório/dashboard não têm pacote offline
próprio. Referências: [Offline.md](../AI/Offline.md) e
[offline-inspection.puml](./diagrams/flows/offline-inspection.puml).

## 15. Estados globais

O componente raiz oferece telas para:

- página não encontrada;
- falha de carregamento, com ações de tentar novamente e voltar ao início.

## Resumo

| Tela              | Estado                      | Responsabilidade                                   |
| ----------------- | --------------------------- | -------------------------------------------------- |
| Cadastro          | Integrado                   | Conta pública sem login automático                 |
| Login             | Integrado                   | Autenticação e sessão                              |
| Dashboard         | Integrado                   | Indicadores operacionais próprios                  |
| Inspeções         | Integrado + offline parcial | Consulta e criação                                 |
| Execução          | Integrado + offline parcial | Respostas, evidências e conclusão                  |
| Checklists        | Integrado                   | Catálogo, itens, normas e versões                  |
| Não conformidades | Integrado                   | Tratativa, ações e evidências                      |
| Relatórios        | Integrado                   | DTO/HTML sob demanda e impressão nativa            |
| Empresas          | Integrado                   | Cadastro de empresas                               |
| Normas            | Integrado                   | Consulta de NRs                                    |
| Equipe            | Demonstrativo               | Prévia da equipe                                   |
| Configurações     | Misto                       | Preferências, sincronização e dados demonstrativos |
