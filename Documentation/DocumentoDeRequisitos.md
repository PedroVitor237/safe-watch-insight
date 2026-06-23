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

* Técnicos de Segurança do Trabalho;
* Engenheiros de Segurança do Trabalho;
* Auditores Internos;
* Supervisores de SST;
* Consultores de SST;
* Profissionais responsáveis por inspeções e conformidade;
* Empresas prestadoras de serviços em SST.

---

# 3. Visão Geral do Sistema

A plataforma deverá funcionar em navegadores web modernos e possuir interface responsiva compatível com:

* Smartphones;
* Tablets;
* Notebooks;
* Computadores desktop.

A solução deverá priorizar dispositivos móveis, permitindo utilização em campo durante inspeções e fiscalizações.

O sistema será desenvolvido com suporte a funcionamento offline, possibilitando o armazenamento local temporário dos dados e sincronização automática quando houver conexão disponível.

---

# 4. Funcionalidades Principais

O sistema deverá oferecer os seguintes módulos:

* Cadastro de empresas;
* Cadastro de checklists;
* Biblioteca de templates de checklist;
* Execução de inspeções;
* Registro de não conformidades;
* Gestão de ações corretivas;
* Consulta de histórico;
* Consulta de normas regulamentadoras;
* Emissão de relatórios;
* Dashboard de acompanhamento;
* Sincronização offline.

---

# 5. Requisitos Funcionais

## RF01 – Autenticação de Usuários

O sistema deve permitir que usuários autenticados acessem a plataforma por meio de login.

---

## RF02 – Cadastro de Empresas

O sistema deve permitir cadastrar empresas para associação às inspeções.

Cada empresa poderá possuir:

* Razão Social;
* Nome Fantasia;
* CNPJ;
* CNAE;
* Quantidade de funcionários;
* Observações.

---

## RF03 – Cadastro de Checklists

O sistema deve permitir criar checklists personalizados.

---

## RF04 – Edição de Checklists

O sistema deve permitir adicionar, remover e editar itens dos checklists.

---

## RF05 – Templates de Checklist

O sistema deve disponibilizar modelos de checklist previamente cadastrados.

---

## RF06 – Execução de Inspeções

O sistema deve permitir iniciar e executar inspeções utilizando checklists cadastrados.

---

## RF07 – Registro de Não Conformidades

O sistema deve permitir registrar não conformidades identificadas durante a inspeção.

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

---

## RF13 – Emissão de Relatórios

O sistema deve gerar relatórios estruturados com base nas informações registradas.

---

## RF14 – Modelos de Relatórios

O sistema deve disponibilizar modelos padronizados de relatório.

---

## RF15 – Registro de Ações Corretivas

O sistema deve permitir registrar ações corretivas associadas às não conformidades.

---

## RF16 – Definição de Prazo

O sistema deve permitir definir prazo para correção de não conformidades.

---

## RF17 – Controle de Pendências

O sistema deve permitir identificar ações corretivas pendentes, concluídas ou vencidas.

---

## RF18 – Consulta ao Histórico

O sistema deve permitir consultar inspeções realizadas anteriormente.

---

## RF19 – Dashboard

O sistema deve apresentar indicadores resumidos sobre inspeções, não conformidades e ações corretivas.

---

## RF20 – Operação Offline

O sistema deve permitir o registro de inspeções mesmo sem conexão com a internet.

---

## RF21 – Sincronização Automática

O sistema deve sincronizar automaticamente os dados armazenados localmente quando houver conexão disponível.

---

## RF22 – Registro de Evidências (Evolução Futura)

O sistema poderá permitir anexar fotografias e demais evidências relacionadas às inspeções.

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

---

## RN06

Uma inspeção somente poderá ser finalizada após o preenchimento dos itens obrigatórios.

---

## RN07

O campo solicitante será opcional.

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

* Registro fotográfico de evidências;
* Armazenamento de anexos;
* Consulta automática de CNAE por CNPJ;
* Sugestão automática de normas aplicáveis;
* Integração com eSocial;
* Integração com sistemas governamentais;
* Notificações automáticas;
* Assinaturas digitais;
* Geolocalização;
* Business Intelligence (BI);
* Dashboards avançados;
* Recursos de Inteligência Artificial para apoio à elaboração de relatórios.

---

# 10. Considerações Finais

A proposta busca digitalizar e organizar os processos de inspeção e fiscalização em Segurança e Saúde no Trabalho, oferecendo suporte às atividades realizadas em campo e em ambiente corporativo.

Os requisitos definidos foram fundamentados tanto na literatura quanto em entrevistas realizadas com profissionais atuantes na área de SST, permitindo que a solução reflita necessidades reais observadas no contexto profissional.

A plataforma prioriza usabilidade, rastreabilidade, mobilidade e funcionamento offline, características consideradas essenciais para apoiar profissionais que realizam inspeções, auditorias e fiscalizações em diferentes ambientes de trabalho.
