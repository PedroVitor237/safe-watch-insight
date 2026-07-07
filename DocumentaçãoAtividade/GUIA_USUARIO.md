# Guia do Usuário — SST Inspeções

## Introdução

O SST Inspeções é uma plataforma para apoiar atividades de Segurança e Saúde no Trabalho. O sistema reúne, em um só lugar, o cadastro de empresas, modelos de checklists, planejamento de inspeções, registro de não conformidades, acompanhamento de histórico e emissão de relatórios.

Este guia apresenta as principais telas e explica como utilizar o sistema de forma simples. A entrega atual possui login real por sessão e fluxo principal integrado ao backend. Alguns módulos ainda utilizam dados de demonstração e ações simuladas, como anexar arquivos e exportar PDF.

## Objetivo do sistema

O objetivo do sistema é facilitar o trabalho de inspetores, gestores de SST e auditores durante inspeções, auditorias e fiscalizações. Com ele, o usuário pode:

- consultar indicadores no Dashboard;
- visualizar empresas e unidades fiscalizadas;
- acessar modelos de checklists por norma regulamentadora;
- planejar novas inspeções;
- executar checklists em campo;
- registrar itens conformes, não conformes ou não aplicáveis;
- gerar não conformidades automaticamente;
- acompanhar planos de ação e histórico;
- emitir relatórios de inspeções concluídas.

## Como acessar

Ao abrir o sistema, o usuário é direcionado para a tela de Login.

Para entrar:

1. Informe um e-mail.
2. Informe uma senha.
3. Escolha o perfil de acesso: Inspetor, Gestor ou Auditor.
4. Clique em **Entrar**.

No protótipo, qualquer credencial é aceita. A escolha do perfil serve para simular o uso por diferentes tipos de usuário.

Após o login, o sistema abre o **Dashboard**, que é a tela inicial da área interna.

## Como navegar

A navegação principal fica no menu lateral. Ele está dividido em dois grupos:

**Operação**

- **Dashboard:** mostra indicadores, gráficos, próximas inspeções e NCs críticas.
- **Inspeções:** permite consultar, filtrar, criar e executar inspeções.
- **Checklists:** mostra os modelos de checklist disponíveis.
- **Não conformidades:** permite acompanhar e tratar NCs.
- **Relatórios:** permite visualizar e emitir relatórios de inspeções concluídas.

**Cadastros**

- **Empresas:** mostra empresas e unidades fiscalizadas.
- **Normas (NRs):** apresenta normas regulamentadoras cadastradas.
- **Equipe:** mostra os profissionais cadastrados.
- **Configurações:** reúne preferências, perfil ativo, modo offline e restauração dos dados de demonstração.

Na parte superior da tela há uma barra com o botão para abrir ou recolher o menu, indicador de modo offline, itens pendentes de sincronização, notificações e acesso ao perfil do usuário. Ao clicar no avatar do usuário, o sistema abre a tela de Configurações.

Para sair, use a opção **Sair** no rodapé do menu lateral.

## Como cadastrar empresas

Acesse **Empresas** no menu lateral para consultar as empresas e unidades fiscalizadas.

Nessa tela, cada empresa aparece em um cartão com informações como nome fantasia, razão social, CNPJ, setor, endereço, unidades e riscos associados.

Para iniciar o cadastro de uma nova empresa, clique em **Nova empresa**. No protótipo atual, esse botão indica o ponto de entrada do cadastro, mas ainda não abre um formulário completo de inclusão. As empresas exibidas são dados de demonstração.

Ao trabalhar com inspeções, as empresas e unidades cadastradas aparecem como opções no assistente de criação de nova inspeção.

## Como utilizar checklists

Acesse **Checklists** no menu lateral para abrir a biblioteca de modelos.

Cada modelo informa:

- título do checklist;
- norma regulamentadora relacionada;
- versão;
- descrição;
- quantidade de seções;
- quantidade de itens.

Para consultar um checklist, clique no cartão do modelo desejado. O sistema abrirá a tela do checklist com suas seções, itens, referências normativas e criticidade de cada item.

Use o botão **Voltar** para retornar à biblioteca.

O botão **Novo modelo** representa a criação de um novo checklist, mas no protótipo atual essa ação ainda não possui formulário completo.

## Como executar inspeções

Para consultar inspeções, acesse **Inspeções** no menu lateral. A tela mostra uma lista com código, título, empresa, data agendada, inspetor responsável e status.

É possível:

- buscar por código, título ou empresa;
- filtrar por status;
- clicar em uma inspeção para abrir sua execução;
- clicar em **Nova inspeção** para criar uma inspeção.

Para criar uma nova inspeção:

1. Clique em **Nova inspeção**.
2. No passo 1, selecione a empresa e a unidade.
3. No passo 2, selecione o checklist e informe o título da inspeção.
4. No passo 3, informe data, hora e inspetor responsável.
5. Revise o resumo.
6. Clique em **Criar inspeção**.

Depois disso, o sistema abre a tela de execução da inspeção.

Na execução, o checklist aparece dividido por seções. Para cada item, escolha uma das opções:

- **Conforme:** quando o item atende ao requisito.
- **NC:** quando existe uma não conformidade.
- **N/A:** quando o item não se aplica.

Quando um item é marcado como **NC**, o sistema cria automaticamente uma não conformidade vinculada à inspeção. Também é possível preencher observações e usar **Anexar foto** para simular o registro de evidência.

A tela de inspeção também mostra progresso, quantidade de não conformidades, inspetor, geolocalização simulada e abas de execução, timeline e encerramento.

Para finalizar uma inspeção:

1. Abra a aba **Encerrar**.
2. Faça a assinatura no campo indicado.
3. Clique em **Concluir e assinar**.

Após concluir, a inspeção fica disponível para relatório.

## Como consultar histórico

O histórico pode ser consultado em mais de uma área do sistema.

Na tela de inspeção, abra a aba **Timeline** para ver os eventos da inspeção, como agendamento, início e conclusão.

Na área **Não conformidades**, clique em uma NC para abrir seus detalhes. Nessa tela, a seção **Timeline** mostra alterações realizadas, como criação da NC, atualização do plano de ação e mudança de status.

Também é possível consultar o histórico geral usando as listas:

- em **Inspeções**, use busca e filtros para encontrar inspeções antigas;
- em **Não conformidades**, alterne entre as visões **Kanban** e **Lista** para acompanhar NCs abertas, em tratativa, resolvidas ou vencidas.

## Como emitir relatórios

Acesse **Relatórios** no menu lateral.

Nessa tela, selecione uma inspeção concluída no campo de seleção. O sistema exibe uma prévia do relatório com:

- dados da empresa;
- unidade e setor;
- inspetor responsável;
- checklist utilizado;
- datas de início e conclusão;
- resumo dos itens;
- detalhamento das respostas;
- não conformidades registradas;
- assinatura do responsável, quando houver.

Para emitir o relatório, use:

- **Imprimir:** abre a impressão do navegador.
- **Exportar PDF:** simula a geração de um arquivo PDF no protótipo.

Caso não exista inspeção concluída, o sistema informa que não há relatório disponível para geração.
