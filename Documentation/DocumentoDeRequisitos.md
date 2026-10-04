# DOCUMENTO DE REQUISITOS

## Plataforma Web para Apoio a Inspeções e Fiscalizações de Segurança e Saúde no Trabalho (SST)

# 1. Introdução

## 1.1 Objetivo do Documento

Este documento tem como objetivo especificar os requisitos da Plataforma Web para Apoio a Inspeções e Fiscalizações de Segurança e Saúde no Trabalho (SST), descrevendo suas funcionalidades, regras de negócio, requisitos não funcionais e características gerais do sistema.

A plataforma será desenvolvida como parte de um Trabalho de Conclusão de Curso (TCC) em Análise e Desenvolvimento de Sistemas, buscando propor uma solução tecnológica aplicável ao contexto real das atividades de inspeção, auditoria e fiscalização em SST.

---

## 1.2 Contexto do Problema

Profissionais de Segurança e Saúde no Trabalho frequentemente realizam inspeções, auditorias e fiscalizações utilizando formulários impressos, planilhas eletrônicas e documentos dispersos.

Esse cenário dificulta a organização das informações, o acompanhamento de não conformidades, a consulta ao histórico de inspeções e a rastreabilidade das ações corretivas.

Além disso, muitas inspeções são realizadas em ambientes com acesso limitado ou inexistente à internet, tornando necessário um mecanismo que permita registrar informações offline e sincronizá-las posteriormente.

---

## 1.3 Objetivo da Solução

Desenvolver uma plataforma web responsiva com suporte offline para apoiar a realização, rastreabilidade e acompanhamento de inspeções e fiscalizações de Segurança e Saúde no Trabalho.

A solução deverá permitir o registro digital de inspeções, consulta de histórico, gestão de não conformidades, acompanhamento de ações corretivas e emissão de relatórios fundamentados em normas aplicáveis.

---

# 2. Público-Alvo

A plataforma será destinada principalmente a:

- Técnicos de Segurança do Trabalho;
- Engenheiros de Segurança do Trabalho;
- Auditores Internos;
- Supervisores de SST;
- Consultores de SST;
- Profissionais responsáveis por inspeções e conformidade;
- Empresas prestadoras de serviços em SST.

---

# 3. Visão Geral do Sistema

A plataforma deverá funcionar em navegadores web modernos e possuir interface responsiva compatível com:

- Smartphones;
- Tablets;
- Notebooks;
- Computadores desktop.

A solução deverá priorizar dispositivos móveis, permitindo utilização em campo durante inspeções e fiscalizações.

O sistema será desenvolvido com suporte a funcionamento offline, possibilitando o armazenamento local temporário dos dados e sincronização automática quando houver conexão disponível.

---

# 4. Funcionalidades Principais

O sistema deverá oferecer os seguintes módulos:

- Cadastro de empresas;
- Cadastro de checklists;
- Biblioteca de templates de checklist;
- Execução de inspeções;
- Registro de não conformidades;
- Gestão de ações corretivas;
- Consulta de histórico;
- Consulta de normas regulamentadoras;
- Emissão de relatórios;
- Dashboard de acompanhamento;
- Sincronização offline.

---

# 5. Requisitos Funcionais

## RF01 – Autenticação de Usuários

O sistema deve permitir que usuários autenticados acessem a plataforma por meio de login.

Entregue: cadastro público em /register (nome/e-mail/senha/confirmação), sem
auto-login, bcrypt custo 12 e role TECHNICIAN; login por sessão TanStack Start
com cookie HttpOnly de oito horas e validação de usuário não excluído.
ADMIN/TECHNICIAN/SUPERVISOR/AUDITOR são papéis armazenados, sem RBAC funcional.
Recuperação de senha, confirmação de e-mail e gestão de usuários não entregues.

---

## RF02 – Cadastro de Empresas

O sistema deve permitir cadastrar empresas para associação às inspeções.

Cada empresa poderá possuir:

- Razão Social;
- Nome Fantasia;
- CNPJ;
- CNAE;
- Quantidade de funcionários;
- Observações.

---

## RF03 – Cadastro de Checklists

O sistema deve permitir criar checklists personalizados.

Entregue: identidade pessoal da sessão com DRAFT v1. isTemplate permite modelo
pessoal, sem oficialidade; isOfficial não é atribuído pelo cliente. Só o
proprietário gerencia draft/itens e exclui logicamente o checklist.

---

## RF04 – Edição de Checklists

O sistema deve permitir adicionar, remover e editar itens dos checklists.

Entregue: edição no draft; editar publicação deriva próximo draft, sem modificar
conteúdo publicado/snapshots. Publicação calcula SHA-256 e confere revisão lida
pelo servidor; não exige mínimo de itens. Retirada tem backend/hook, sem ação
nas telas atuais; interface completa de histórico de versões não entregue.

---

## RF05 – Templates de Checklist

O sistema deve disponibilizar modelos de checklist previamente cadastrados.

Entregue: dois templates institucionais Safe Watch Insight, construção (12 itens,
NR-18) e altura (8 itens, NR-1/NR-6/NR-35), sem dono usuário. Template pessoal e
publicação de usuário são distintos de oficial. Consulta exige sessão.
Cópia própria prefere draft; terceiro/oficial usa publicação acessível. Resultado
é identidade independente pessoal com DRAFT v1, sem copiar inspeções/tratativas.
Sem administração de templates oficiais pela UI/role.

---

## RF06 – Execução de Inspeções

O sistema deve permitir iniciar e executar inspeções utilizando checklists cadastrados.

Entregue: empresa própria, checklist visível ativo não excluído e versão
PUBLISHED. Captura snapshot de checklist, itens/normas na transação da inspeção;
não congela empresa/usuário/NCs/ações/relatório inteiro. Novas respostas são
bloqueadas após conclusão/cancelamento. Inspeção admite publicação legada com
hash presente sem recálculo do formato 0; cópia exige formato 1 íntegro.

---

## RF07 – Registro de Não Conformidades

O sistema deve permitir registrar não conformidades identificadas durante a inspeção.

Entregue: NON_COMPLIANT cria/restaura NC por resposta do snapshot. Nova NC
usa MEDIUM/OPEN e prazo servidor + sete dias; NC ativa conserva dados e arquivada
volta a OPEN sem renovar prazo. Conforme/N/A arquiva, sem marcar RESOLVED.
Criação explícita requer severidade/descrição e não aplica prazo automático.

---

## RF08 – Associação de Normas

O sistema deve permitir associar itens de checklist a normas aplicáveis.

---

## RF09 – Consulta de Normas

O sistema deve disponibilizar consulta rápida às Normas Regulamentadoras relacionadas aos itens inspecionados.

---

## RF10 – Visualização de Normas Durante a Inspeção

O sistema deve exibir as normas associadas aos itens do checklist durante o preenchimento da inspeção.

---

## RF11 – Associação de Inspeções às Empresas

O sistema deve permitir vincular inspeções a empresas cadastradas.

---

## RF12 – Registro de Solicitante

O sistema deve permitir registrar o solicitante da vistoria ou inspeção.

O preenchimento deverá ser opcional.

**Não entregue / futuro:** não há campo solicitante no schema, contrato ou
formulário atual; observações não equivalem a implementar esse requisito.

---

## RF13 – Emissão de Relatórios

O sistema deve gerar relatórios estruturados com base nas informações registradas.

Entregue: relatório por inspeção própria, DTO/HTML sob demanda de snapshot/
respostas/NCs/ações/evidências ativas e empresa/inspetor atuais. Lista exige
COMPLETED; consulta por ID não exige esse estado, mas exige dono/snapshot.
Não insere Report a cada visualização. Impressão/Salvar como PDF via window.print()
e diálogo do navegador, sem arquivo PDF gerado no backend.

---

## RF14 – Modelos de Relatórios

O sistema deve disponibilizar modelos padronizados de relatório.

Entregue parcialmente: um componente padronizado InspectionReport, sem catálogo
de modelos editáveis. Geração customizada/armazenamento/download direto PDF futuros.

---

## RF15 – Registro de Ações Corretivas

O sistema deve permitir registrar ações corretivas associadas às não conformidades.

Entregue: vínculo obrigatório com NC própria ativa. description é obrigatório;
why/location/responsible/dueDate/method/estimatedCost são opcionais/nullable.
Status PENDING/IN_PROGRESS/COMPLETED/OVERDUE; completedAt calculado no servidor.
Criar ação em NC OPEN muda NC para IN_PROGRESS; concluir ações não resolve NC.

---

## RF16 – Definição de Prazo

O sistema deve permitir definir prazo para correção de não conformidades.

Entregue: prazo opcional editável. Consultar lista/detalhe de NC ou lista de
ações persiste OVERDUE para estados ativos vencidos; relatório/dashboard
calculam atraso sem escrita. Adiar prazo sozinho não reverte OVERDUE. Coerção
JSON null → epoch é concern conhecido, não correção desta fase.

---

## RF17 – Controle de Pendências

O sistema deve permitir identificar ações corretivas pendentes, concluídas ou vencidas.

Entregue: status/lista de ações e pendências no dashboard. Ações vencidas do
dashboard exigem NC OPEN/IN_PROGRESS/OVERDUE; não há notificações/job de atraso.

---

## RF18 – Consulta ao Histórico

O sistema deve permitir consultar inspeções realizadas anteriormente.

Entregue: lista/detalhe próprios com conteúdo de checklist capturado. Snapshot
não congela cadastro/tratativas. Sem edição geral/cancelamento/reabertura públicos;
soft delete de inspeção existe na API, sem ação nas telas. Não há audit log completo.

---

## RF19 – Dashboard

O sistema deve apresentar indicadores resumidos sobre inspeções, não conformidades e ações corretivas.

Entregue: totais de inspeções por quatro estados, NCs totais/abertas/resolvidas,
NCs e ações vencidas, gráfico por status e até cinco recentes (inspectionDate
DESC/createdAt DESC/id DESC). Conformidade = round(100 × COMPLIANT/(COMPLIANT +
NON_COMPLIANT)), com snapshotItemId em COMPLETED; N/A/pendentes excluídos.
Sem aplicáveis: NULL/UI “—”. Sem BI/filtros analíticos/comparação temporal/exportação.

---

## RF20 – Operação Offline

O sistema deve permitir o registro de inspeções mesmo sem conexão com a internet.

Parcial: execução/respostas/conclusão local-first de inspeções criadas online
e previamente cacheadas em Dexie/IndexedDB por usuário, com snapshot. Não cria
inspeção integralmente offline; NC local é projeção da resposta. Evidências
binárias/CRUD de ações/relatórios/dashboard não possuem fluxo offline próprio.

---

## RF21 – Sincronização Automática

O sistema deve sincronizar automaticamente os dados armazenados localmente quando houver conexão disponível.

Entregue no incremento de RF20: fila FIFO por usuário, UUID/dependências/revisão
esperada, retry e deduplicação remota atômica com mutação. Sessão reautenticada no
servidor; conflito bloqueia fila sem resolução automática/assistida. Logout limpa
dados locais. Sem garantia global de concorrência entre abas/dispositivos.

---

## RF22 – Registro de Evidências

O sistema deve permitir selecionar, visualizar, enviar, consultar e remover
fotografias relacionadas à inspeção ou a uma não conformidade. O arquivo deve
permanecer em armazenamento externo e o banco deve guardar somente URL e
metadados. O MVP aceita JPEG, PNG e WebP com até 4 MB.

Entregue online: XOR inspeção ou NC; autorização pela inspeção da sessão e
contexto de snapshot; MIME/assinatura/tamanho/nome/legenda validados. Limite exato
4.194.304 bytes. Cloudinary guarda imagem, PostgreSQL metadados; soft delete/
destroy com compensações tentadas, sem transação distribuída. Sem upload/fila
binária/compressão/quota de evidências offline.

---

# 6. Requisitos Não Funcionais

## RNF01 – Responsividade

O sistema deverá ser compatível com smartphones, tablets e computadores.

---

## RNF02 – Mobile First

A interface deverá ser projetada priorizando dispositivos móveis.

---

## RNF03 – Disponibilidade Offline

O sistema deverá permitir utilização sem conexão com a internet.

---

## RNF04 – Sincronização Segura

A sincronização deverá preservar a integridade dos dados registrados offline.

---

## RNF05 – Facilidade de Uso

A interface deverá ser simples e intuitiva para utilização em ambientes operacionais.

---

## RNF06 – Rastreabilidade

Todas as inspeções deverão permanecer registradas para consulta futura.

---

## RNF07 – Escalabilidade

A arquitetura deverá permitir evolução futura sem necessidade de reestruturação completa da solução.

---

## RNF08 – Compatibilidade PWA

O sistema deverá ser compatível com os conceitos de Progressive Web App.

---

# 7. Regras de Negócio

## RN01

Uma inspeção deverá estar associada a uma empresa cadastrada.

---

## RN02

Toda não conformidade deverá estar vinculada à inspeção que a originou.

---

## RN03

Uma ação corretiva deverá estar vinculada a uma não conformidade.

---

## RN04

O histórico de inspeções não deverá ser excluído fisicamente do sistema.

---

## RN05

Os registros realizados offline deverão manter sua data e horário originais após sincronização.

Incremento atual: clientCreatedAt da operação preservado; respostas guardam-no
em clientUpdatedAt. updatedAt permanece revisão do servidor. Conclusão preserva
horário do dispositivo na confirmação OfflineSyncOperation, sem campo dedicado
de data original de conclusão em Inspection. Datas provisórias/IDs locais de
NC/resposta não equivalem aos defaults/IDs gerados no servidor.

---

## RN06

Uma inspeção somente poderá ser finalizada após o preenchimento dos itens obrigatórios.

---

## RN07

O campo solicitante será opcional.

**Regra prevista, não entregue:** depende da futura implementação de RF12.
Não existe campo persistido ou fluxo específico de solicitante atualmente.

---

## RN08

Os relatórios deverão apresentar fundamentação normativa quando disponível.

---

# 8. Estrutura Padrão dos Relatórios

Os relatórios emitidos pelo sistema deverão seguir, preferencialmente, a seguinte estrutura:

| Campo                   | Descrição                   |
| ----------------------- | --------------------------- |
| Item inadequado         | Situação encontrada         |
| Não conformidade        | Descrição da irregularidade |
| Fundamentação normativa | Norma aplicável             |
| Recomendação            | Ação corretiva sugerida     |
| Prazo                   | Data limite para adequação  |

---

# 9. Funcionalidades Previstas para Evoluções Futuras

As seguintes funcionalidades não fazem parte do MVP, mas poderão ser implementadas em versões futuras:

- Compressão e upload offline de fotografias (upload online entregue em RF22);
- Armazenamento de anexos;
- Consulta automática de CNAE por CNPJ;
- Sugestão automática de normas aplicáveis;
- Integração com eSocial;
- Integração com sistemas governamentais;
- Notificações automáticas;
- Assinaturas digitais;
- Geolocalização;
- Business Intelligence (BI);
- Dashboards avançados;
- Recursos de Inteligência Artificial para apoio à elaboração de relatórios.

---

# 10. Considerações Finais

A proposta busca digitalizar e organizar os processos de inspeção e fiscalização em Segurança e Saúde no Trabalho, oferecendo suporte às atividades realizadas em campo e em ambiente corporativo.

Os requisitos definidos foram fundamentados tanto na literatura quanto em entrevistas realizadas com profissionais atuantes na área de SST, permitindo que a solução reflita necessidades reais observadas no contexto profissional.

A plataforma prioriza usabilidade, rastreabilidade, mobilidade e funcionamento offline, características consideradas essenciais para apoiar profissionais que realizam inspeções, auditorias e fiscalizações em diferentes ambientes de trabalho.

## Estado de implementação Offline/PWA em 17 de agosto de 2026

RF20, RF21, RNF03, RNF04 e RNF08 possuem um primeiro incremento funcional para
inspeções previamente disponibilizadas no dispositivo: snapshot em IndexedDB,
respostas/conclusão locais, fila idempotente, conflito por revisão, indicadores
reais e service worker. O cenário online → offline → reabertura → retry →
reconexão foi validado em Chromium real contra o Neon. O marco está encerrado
para o escopo do TCC como atendimento parcial; o requisito integral continua
pendente por não incluir criação offline, reconciliação assistida, evidências
binárias offline, Background Sync nem homologação no domínio HTTPS publicado e
em outros navegadores/dispositivos.

## Delimitação da revisão documental — 3 de outubro de 2026

RF01/RF03/RF04/RF05/RF06 e RF12/RN07 foram conferidos contra a implementação.
As demais seções preservam requisitos de análise e não constituem declaração
de entrega integral. Persona não determina role/permissão: recursos pessoais
usam ownership da sessão, sem acesso administrativo global. Matriz e regras
vigentes: [BusinessRules.md](../AI/BusinessRules.md). IDs/fontes/errata:
[OfficialTemplates.md](../AI/OfficialTemplates.md). Resultados históricos não
são testes desta revisão: [RelatorioFase3.md](./RelatorioFase3.md).

## Delimitação da Fase 6 — 4 de outubro de 2026

RF07/RF13–RF22 e RN05 foram reconciliados com código sobre `5080142`, mantendo
requisitos desejados separados da entrega atual. RN06 aceita N/A e opcionais
pendentes; não exige fotos, ações concluídas ou NCs resolvidas. RN08 usa normas
copiadas do snapshot, sem reconstrução pelo catálogo atual. Isolamento remoto
usa sessão/Inspection.userId; papel não concede visão global.

O checkpoint Offline/PWA de agosto acima é histórico: homologação de setembro
validou assets/registro/fallback em HTTPS publicado, sem fluxo autenticado completo
em produção nem outros navegadores. Não há nova homologação ou Final QA aprovado
nesta revisão. Regras/fórmulas/autorizações: [BusinessRules.md](../AI/BusinessRules.md).
Achados: [RelatorioFase6.md](./RelatorioFase6.md).

## Rastreabilidade de classes e casos de uso — Fase 7

Revisão em 4 de outubro de 2026 sobre `da43f71`, sem mudar o escopo dos requisitos.
O [modelo de classes](./DiagramaDeClasses_VersaoTecnica.md) distingue persistência,
legado, projeção de relatório e confirmação de sincronização; existência de
model/enum não declara uma função entregue. Os
[casos de uso oficiais](./DiagramaDeCasosDeUso.md) e o
[mapa de navegação](./MAPA_DE_NAVEGACAO.md) representam telas/operações reais.

Continuam **não entregues** RF12/RN07 (solicitante) e administração/RBAC/gestão
de usuários; persona não autoriza acesso gerencial global. RF14 possui um
componente de relatório, sem múltiplos modelos editáveis; RF20/RNF03 permanecem
parciais, restritos a pacotes de inspeções já criadas online. Não há criação
integral offline, empresas/checklists offline, binários de evidências offline
nem reconciliação automática/assistida. RF18 não implica CRUD completo de inspeção:
CANCELLED é estado modelado, não ação de cancelar, e não há edição geral/reabertura
públicas. Report persistível não implica gravação por visualização ou PDF backend.
Resultados históricos/concerns não foram reexecutados ou corrigidos nesta fase.
