# Wireframes ASCII - SST Inspecoes

Este documento representa, em ASCII, a estrutura visual das principais telas implementadas no projeto. Os wireframes foram baseados nas rotas em `src/routes/` e no layout compartilhado `AppShell`.

## Estrutura comum das telas internas

Todas as telas internas usam menu lateral, barra superior e area de conteudo.

```text
+----------------------+------------------------------------------------------+
| SST Inspecoes        | [menu]                         [offline] [bell] [user] |
| Plataforma fisc.     +------------------------------------------------------+
|                      |                                                      |
| OPERACAO             |  PageHeader                                           |
| > Dashboard          |  +--------------------------------------+-----------+ |
| > Inspecoes          |  | Titulo da tela                       | Acoes     | |
| > Checklists         |  | Descricao opcional                   |           | |
| > Nao conformidades  |  +--------------------------------------+-----------+ |
| > Relatorios         |                                                      |
|                      |  Conteudo da pagina                                  |
| CADASTROS            |                                                      |
| > Empresas           |                                                      |
| > Normas (NRs)       |                                                      |
| > Equipe             |                                                      |
| > Configuracoes      |                                                      |
|                      |                                                      |
| Sair                 |                                                      |
+----------------------+------------------------------------------------------+
```

Quando o modo offline esta ativo, uma faixa informativa aparece abaixo da barra superior.

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Topbar                                               |
|                      +------------------------------------------------------+
|                      | Voce esta em modo offline. Alteracoes em fila.       |
|                      +------------------------------------------------------+
|                      | Conteudo                                             |
+----------------------+------------------------------------------------------+
```

## Login

Rota: `/login`

```text
+------------------------------------------------+--------------------------------+
|                                                |                                |
|  S SST Inspecoes                               |  +--------------------------+  |
|                                                |  | Entrar na plataforma     |  |
|                                                |  | Prototipo: credenciais... |  |
|  [icone escudo]                                |  |                          |  |
|  Inspecoes, auditorias e fiscalizacoes         |  | E-mail                   |  |
|  de SST em um so lugar.                        |  | [ana.lima@...]           |  |
|                                                |  |                          |  |
|  Execucao de checklists, registro de NCs,      |  | Senha                    |  |
|  planos de acao e relatorios.                  |  | [********]               |  |
|                                                |  |                          |  |
|  (c) 2026 SST Inspecoes                        |  | Perfil                   |  |
|                                                |  | ( ) inspetor ( ) gestor  |  |
|                                                |  | ( ) auditor              |  |
|                                                |  |                          |  |
|                                                |  | [ Entrar ]               |  |
|                                                |  +--------------------------+  |
+------------------------------------------------+--------------------------------+
```

Em telas menores, o painel institucional da esquerda fica oculto e o card de login ocupa o centro.

## Dashboard

Rota: `/dashboard`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Dashboard                                  [user]     |
|                      +------------------------------------------------------+
|                      | Dashboard                                            |
|                      | Visao geral das inspecoes, conformidade e NCs.        |
|                      +------------------------------------------------------+
|                      | +-----------+ +-----------+ +-----------+ +---------+ |
|                      | | Inspecoes | | NCs       | | Taxa      | | Prazo   | |
|                      | | no mes    | | abertas   | | conform.  | | medio   | |
|                      | +-----------+ +-----------+ +-----------+ +---------+ |
|                      |                                                      |
|                      | +-----------------------------------+ +------------+ |
|                      | | Inspecoes por mes                 | | NCs por    | |
|                      | | [grafico de barras]               | | criticid.  | |
|                      | |                                   | | [rosca]    | |
|                      | +-----------------------------------+ +------------+ |
|                      |                                                      |
|                      | +-----------------------------------+ +------------+ |
|                      | | NCs por norma                     | | NCs crit.  | |
|                      | | [grafico barras horizontais]      | | item >     | |
|                      | |                                   | | item >     | |
|                      | +-----------------------------------+ +------------+ |
|                      |                                                      |
|                      | +--------------------------------------------------+ |
|                      | | Proximas inspecoes                    [Ver todas] | |
|                      | | inspecao / empresa / data                  status | |
|                      | | inspecao / empresa / data                  status | |
|                      | +--------------------------------------------------+ |
+----------------------+------------------------------------------------------+
```

## Lista de Inspecoes

Rota: `/inspecoes`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Inspecoes                                 [user]     |
|                      +------------------------------------------------------+
|                      | Inspecoes                         [ + Nova inspecao ]|
|                      | Lista de inspecoes planejadas, em andamento...       |
|                      +------------------------------------------------------+
|                      | +--------------------------------------------------+ |
|                      | | [buscar codigo, titulo ou empresa..............] | |
|                      | |                                      [status v]  | |
|                      | +--------------------------------------------------+ |
|                      |                                                      |
|                      | +--------------------------------------------------+ |
|                      | | Codigo | Inspecao | Empresa | Agendada | Insp. | |
|                      | | INS... | titulo   | empresa | data     | nome  | |
|                      | | INS... | titulo   | empresa | data     | nome  | |
|                      | | INS... | titulo   | empresa | data     | nome  | |
|                      | +--------------------------------------------------+ |
+----------------------+------------------------------------------------------+
```

No mobile, cada linha da tabela vira um bloco em coluna, mantendo codigo, titulo, empresa, data, inspetor e status.

## Nova Inspecao

Rota: `/inspecoes/nova`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Nova inspecao                              [user]     |
|                      +------------------------------------------------------+
|                      | Nova inspecao                                        |
|                      | Defina empresa, checklist e agendamento.             |
|                      +------------------------------------------------------+
|                      |                                                      |
|                      |             (1) ---- (2) ---- (3)                    |
|                      |                                                      |
|                      |        +--------------------------------------+      |
|                      |        | 1. Empresa e unidade                 |      |
|                      |        |                                      |      |
|                      |        | Empresa                              |      |
|                      |        | [ selecione... v ]                   |      |
|                      |        |                                      |      |
|                      |        | Unidade                              |      |
|                      |        | [ selecione... v ]                   |      |
|                      |        |                                      |      |
|                      |        | [ Voltar ]              [ Avancar ]  |      |
|                      |        +--------------------------------------+      |
+----------------------+------------------------------------------------------+
```

Passo 2:

```text
+--------------------------------------------------------------+
| 2. Checklist e titulo                                        |
| Checklist / Norma                                            |
| [ selecione... v ]                                           |
| Titulo da inspecao                                           |
| [ Ex.: Auditoria mensal de EPIs............................] |
| Observacoes iniciais                                         |
| [ texto livre...............................................] |
| [ Voltar ]                                      [ Avancar ]  |
+--------------------------------------------------------------+
```

Passo 3:

```text
+--------------------------------------------------------------+
| 3. Agendamento                                               |
| [ Data e hora.......... ]  [ Inspetor responsavel v ]        |
|                                                              |
| + Resumo --------------------------------------------------+ |
| | Empresa: ...                                             | |
| | Unidade: ...                                             | |
| | Checklist: ...                                           | |
| +----------------------------------------------------------+ |
| [ Voltar ]                              [ Criar inspecao ]  |
+--------------------------------------------------------------+
```

## Execucao de Inspecao

Rota: `/inspecoes/$id`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Inspecao                                  [user]     |
|                      +------------------------------------------------------+
|                      | Titulo da inspecao        [status] [<- Voltar]       |
|                      | INS-2026-0000 - Empresa                            |
|                      +------------------------------------------------------+
|                      | +----------+ +----------+ +----------+ +----------+ |
|                      | | Progresso| | NCs      | | Inspetor | | Geo      | |
|                      | | 75%      | | 2        | | nome     | | lat/lng  | |
|                      | +----------+ +----------+ +----------+ +----------+ |
|                      |                                                      |
|                      | [ Execucao do checklist ] [ Timeline ] [ Encerrar ]  |
|                      |                                                      |
|                      | +--------------------------------------------------+ |
|                      | | Secao do checklist                               | |
|                      | | + item, criticidade, norma                     + | |
|                      | | | [Conforme] [NC] [N/A]                       | | |
|                      | | | [observacoes se houver NC ou texto]          | | |
|                      | | | [Anexar foto]  NC gerada automaticamente     | | |
|                      | | +------------------------------------------------+ |
|                      | | + item, criticidade, norma [Conforme][NC][N/A] | |
|                      | +--------------------------------------------------+ |
+----------------------+------------------------------------------------------+
```

Aba Timeline:

```text
+--------------------------------------------------------------+
| [ Execucao do checklist ] [ Timeline ] [ Encerrar ]          |
|                                                              |
| +----------------------------------------------------------+ |
| | o Inspecao agendada                                     | |
| |   data e hora - autor                                   | |
| | o Inspecao iniciada                                     | |
| |   data e hora - autor                                   | |
| | o Inspecao concluida e assinada                         | |
| |   data e hora - autor                                   | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

Aba Encerrar:

```text
+--------------------------------------------------------------+
| [ Execucao do checklist ] [ Timeline ] [ Encerrar ]          |
|                                                              |
| + Encerramento e assinatura -------------------------------+ |
| | Texto de orientacao                                      | |
| | +------------------------------------------------------+ | |
| | | canvas de assinatura                                | | |
| | +------------------------------------------------------+ | |
| | [ Limpar ]                         [ Concluir e assinar ] |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

## Biblioteca de Checklists

Rota: `/checklists`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Checklists                                [user]     |
|                      +------------------------------------------------------+
|                      | Biblioteca de checklists        [ + Novo modelo ]    |
|                      | Modelos de checklist por norma regulamentadora.      |
|                      +------------------------------------------------------+
|                      | +----------------+ +----------------+ +------------+ |
|                      | | icone      v1  | | icone      v2  | | icone  v1  | |
|                      | | Titulo         | | Titulo         | | Titulo     | |
|                      | | NR - norma     | | NR - norma     | | NR - norma | |
|                      | | descricao      | | descricao      | | descricao  | |
|                      | | 3 secoes 12 it | | 4 secoes 16 it | | ...        | |
|                      | +----------------+ +----------------+ +------------+ |
+----------------------+------------------------------------------------------+
```

## Editor / Visualizador de Checklist

Rota: `/checklists/$id`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Checklist                                 [user]     |
|                      +------------------------------------------------------+
|                      | Titulo do checklist              [<- Voltar]         |
|                      | NR - titulo da norma - versao                       |
|                      +------------------------------------------------------+
|                      | +--------------------------------------------------+ |
|                      | | Secao 1                                          | |
|                      | | 1. Texto do item                  [criticidade]  | |
|                      | |    referencia normativa                         | |
|                      | | 2. Texto do item                  [criticidade]  | |
|                      | +--------------------------------------------------+ |
|                      | +--------------------------------------------------+ |
|                      | | Secao 2                                          | |
|                      | | 1. Texto do item                  [criticidade]  | |
|                      | +--------------------------------------------------+ |
+----------------------+------------------------------------------------------+
```

## Lista de Nao Conformidades

Rota: `/nao-conformidades`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Nao conformidades                         [user]     |
|                      +------------------------------------------------------+
|                      | Nao conformidades                                    |
|                      | Gestao de NCs, planos de acao 5W2H e tratativas.     |
|                      +------------------------------------------------------+
|                      | [ Kanban ] [ Lista ]                                 |
|                      |                                                      |
|                      | +-----------+ +-----------+ +-----------+ +---------+ |
|                      | | Abertas 2 | | Em trat. | | Resolvidas| | Vencidas| |
|                      | | +-------+ | | +-------+ | | +-------+ | | Vazia   | |
|                      | | |NC card| | | |NC card| | | |NC card| | |         | |
|                      | | |codigo | | | |codigo | | | |codigo | | |         | |
|                      | | |prazo  | | | |prazo  | | | |prazo  | | |         | |
|                      | | +-------+ | | +-------+ | | +-------+ | |         | |
|                      | +-----------+ +-----------+ +-----------+ +---------+ |
+----------------------+------------------------------------------------------+
```

Aba Lista:

```text
+--------------------------------------------------------------+
| [ Kanban ] [ Lista ]                                         |
| +----------------------------------------------------------+ |
| | ! Titulo da NC                         [crit.] [status]  | |
| |   NC-2026-0000 - Empresa                                | |
| | ! Titulo da NC                         [crit.] [status]  | |
| |   NC-2026-0001 - Empresa                                | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

## Detalhe de Nao Conformidade

Rota: `/nao-conformidades/$id`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | NC                                       [user]      |
|                      +------------------------------------------------------+
|                      | Titulo da NC        [criticidade] [status] [Voltar]  |
|                      | NC-2026-0000 - Empresa                              |
|                      +------------------------------------------------------+
|                      | +-----------------------------------+ +------------+ |
|                      | | Descricao                         | | Detalhes   | |
|                      | | texto da ocorrencia               | | aberta em  | |
|                      | +-----------------------------------+ | prazo      | |
|                      |                                       | empresa    | |
|                      | +-----------------------------------+ | resp.      | |
|                      | | Plano de acao 5W2H                | +------------+ |
|                      | | [O que?] [Por que?]               | +------------+ |
|                      | | [Onde? ] [Quem?    ]              | | Status v   | |
|                      | | [Quando?] [Quanto? ]              | +------------+ |
|                      | | [Como? texto longo.............]  | +------------+ |
|                      | |                    [Salvar plano] | | Evidencias | |
|                      | +-----------------------------------+ | [Anexar]   | |
|                      |                                       +------------+ |
|                      | +-----------------------------------+                |
|                      | | Timeline                          |                |
|                      | | o evento - data - autor           |                |
|                      | | o evento - data - autor           |                |
|                      | +-----------------------------------+                |
+----------------------+------------------------------------------------------+
```

## Relatorios

Rota: `/relatorios`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Relatorios                                [user]     |
|                      +------------------------------------------------------+
|                      | Relatorios             [Imprimir] [Exportar PDF]     |
|                      | Geracao e visualizacao de relatorios de inspecao.    |
|                      +------------------------------------------------------+
|                      | +--------------------------------------------------+ |
|                      | | [ Selecione uma inspecao concluida... v ]        | |
|                      | +--------------------------------------------------+ |
|                      |                                                      |
|                      | +--------------------------------------------------+ |
|                      | | Relatorio de Inspecao              Emitido em... | |
|                      | | Titulo da inspecao                 SST v1.0      | |
|                      | | Codigo                                           | |
|                      | |--------------------------------------------------| |
|                      | | Empresa | CNPJ | Unidade | Setor                 | |
|                      | | Inspetor | Checklist | Inicio | Conclusao        | |
|                      | |                                                  | |
|                      | | Resumo: [Total] [Conformes] [Nao conformes]      | |
|                      | |                                                  | |
|                      | | Detalhamento                                     | |
|                      | | item do checklist                         status | |
|                      | | item do checklist                         status | |
|                      | |                                                  | |
|                      | | Nao conformidades registradas                    | |
|                      | | NC card                                          | |
|                      | |                                                  | |
|                      | | Assinatura do responsavel                        | |
|                      | +--------------------------------------------------+ |
+----------------------+------------------------------------------------------+
```

Quando nao ha inspecao concluida:

```text
+--------------------------------------------------------------+
| [ Selecione uma inspecao... v ]                              |
|                                                              |
| +----------------------------------------------------------+ |
| | [icone documento] Nenhuma inspecao concluida...          | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

## Empresas e Unidades

Rota: `/empresas`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Empresas                                  [user]     |
|                      +------------------------------------------------------+
|                      | Empresas e unidades            [ + Nova empresa ]    |
|                      | Cadastro das empresas e unidades fiscalizadas.       |
|                      +------------------------------------------------------+
|                      | +--------------------------+ +--------------------+ |
|                      | | icone      [setor]       | | icone      [setor] | |
|                      | | Nome fantasia            | | Nome fantasia      | |
|                      | | Razao social             | | Razao social       | |
|                      | | CNPJ                     | | CNPJ               | |
|                      | | pin Endereco cidade/UF   | | pin Endereco       | |
|                      | | Unidades (n)             | | Unidades (n)       | |
|                      | | - unidade                | | - unidade          | |
|                      | | [risco] [risco] [risco]  | | [risco] [risco]    | |
|                      | +--------------------------+ +--------------------+ |
+----------------------+------------------------------------------------------+
```

## Normas Regulamentadoras

Rota: `/normas`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Normas                                    [user]     |
|                      +------------------------------------------------------+
|                      | Normas Regulamentadoras                              |
|                      | Biblioteca de NRs aplicaveis.                       |
|                      +------------------------------------------------------+
|                      | +----------------+ +----------------+ +------------+ |
|                      | | icone    [NR]  | | icone    [NR]  | | icone [NR] | |
|                      | | Titulo         | | Titulo         | | Titulo     | |
|                      | | descricao      | | descricao      | | descricao  | |
|                      | | [topico][top.] | | [topico][top.] | | [topico]   | |
|                      | +----------------+ +----------------+ +------------+ |
+----------------------+------------------------------------------------------+
```

## Equipe

Rota: `/equipe`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Equipe                                    [user]     |
|                      +------------------------------------------------------+
|                      | Equipe                                               |
|                      | Inspetores, gestores e auditores cadastrados.        |
|                      +------------------------------------------------------+
|                      | +----------------+ +----------------+ +------------+ |
|                      | | avatar Nome    | | avatar Nome    | | avatar Nome| |
|                      | | email          | | email          | | email      | |
|                      | | [perfil] reg.  | | [perfil] reg.  | | [perfil]   | |
|                      | | +-----+ +----+ | | +-----+ +----+ | | +---+ +--+ | |
|                      | | |Ins. | |NCs | | | |Ins. | |NCs | | | |In | |NC| | |
|                      | | +-----+ +----+ | | +-----+ +----+ | | +---+ +--+ | |
|                      | +----------------+ +----------------+ +------------+ |
+----------------------+------------------------------------------------------+
```

## Configuracoes

Rota: `/configuracoes`

```text
+----------------------+------------------------------------------------------+
| Menu lateral         | Configuracoes                             [user]     |
|                      +------------------------------------------------------+
|                      | Configuracoes                                        |
|                      | Preferencias da conta, sincronizacao e dados.        |
|                      +------------------------------------------------------+
|                      | +---------------------------+ +--------------------+ |
|                      | | Aparencia                 | | Perfil ativo       | |
|                      | | Modo escuro       [on/off]| | [ perfil v ]       | |
|                      | | texto auxiliar           | | texto auxiliar     | |
|                      | +---------------------------+ +--------------------+ |
|                      |                                                      |
|                      | +---------------------------+ +--------------------+ |
|                      | | Sincronizacao             | | Dados do prototipo | |
|                      | | Modo offline      [on/off]| | texto explicativo  | |
|                      | | +-----------------------+ | | [Restaurar dados] | |
|                      | | | Itens pendentes     0 | | +--------------------+ |
|                      | | | [Sincronizar agora]  | |                      |
|                      | | +-----------------------+ |                      |
|                      | +---------------------------+                      |
+----------------------+------------------------------------------------------+
```

## Telas de estado do roteador

Estas telas nao fazem parte do fluxo principal, mas estao implementadas no componente raiz.

### Pagina nao encontrada

```text
+--------------------------------------------------------------+
|                                                              |
|                          404                                 |
|                    Page not found                            |
|       The page you're looking for doesn't exist...           |
|                                                              |
|                       [ Go home ]                            |
|                                                              |
+--------------------------------------------------------------+
```

### Erro de carregamento

```text
+--------------------------------------------------------------+
|                                                              |
|                   This page didn't load                      |
|      Something went wrong on our end. You can try...         |
|                                                              |
|                  [ Try again ] [ Go home ]                   |
|                                                              |
+--------------------------------------------------------------+
```
