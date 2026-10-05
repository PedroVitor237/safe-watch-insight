# Guia do Usuário — Safe Watch Insight

Este guia descreve as tarefas disponíveis na revisão da Fase 8, em **4 de
outubro de 2026**. A interface também usa o nome **SST Inspeções**. Empresas,
checklists, inspeções, tratativas, relatórios e dashboard utilizam dados reais;
**Equipe** continua demonstrativa. O uso offline cobre inspeções já disponíveis
no dispositivo, com os limites descritos abaixo.

## 1. Acesso e navegação

Ao abrir a aplicação, você é encaminhado ao login. Com sessão válida, chega ao
**Dashboard**. O menu lateral oferece:

- **Operação:** Dashboard, Inspeções, Checklists, Não conformidades e Relatórios.
- **Cadastros:** Empresas, Normas (NRs), Equipe e Configurações.

O avatar abre **Configurações** e a barra superior mostra a sincronização.
O sino não oferece um fluxo de notificações nesta entrega. As telas operacionais
mostram seus recursos; usar um checklist publicado por outra pessoa não
compartilha inspeções com ela. [Mapa das rotas](./MAPA_DE_NAVEGACAO.md).

## 2. Criar conta

1. No login, clique em **Criar conta** para abrir `/register`.
2. Preencha **Nome**, **E-mail**, **Senha** e **Confirmar senha**.
3. Use senha com pelo menos oito caracteres e repita exatamente a mesma senha.
4. Clique em **Criar conta**. Corrija os erros de campo, se houver.
5. Após **Conta criada. Entre com seu e-mail e senha.**, o sistema abre o login.

O nome precisa estar preenchido e o e-mail deve ser válido. Espaços nas
extremidades do nome/e-mail são removidos e o e-mail é convertido para minúsculas.
E-mail já cadastrado é recusado, mesmo se associado a uma conta excluída.
O botão indica envio em andamento; outras falhas são apresentadas por notificação.

Você recebe o papel de técnico, sem seletor de papel ou permissão administrativa.
Cadastro exige conexão e não realiza login automático. Confirmação por e-mail e
recuperação de senha ainda não estão disponíveis.

## 3. Entrar

1. Informe **E-mail** e **Senha** em `/login`.
2. Clique em **Entrar**; o botão mostra **Entrando...** durante envio.
3. Após autenticação, você chega ao **Dashboard**.

E-mail inválido, senha vazia ou credenciais incorretas são rejeitados. Confira a
notificação e tente novamente. A sessão dura oito horas; sua expiração pode
exigir novo login. Para sincronizar, a sessão precisa ser aceita pelo servidor.

O bloco **Ambiente de demonstração** da tela expõe esta conta técnica:

```text
Usuário: Usuário Demonstração
E-mail: demo.user@example.test
Senha: Demo@12345
```

Ela funciona quando o ambiente foi preparado com os dados de demonstração.

## 4. Cadastrar e manter empresas

1. Abra **Empresas** e clique em **Nova empresa**.
2. Preencha razão social e CNAE, grau de risco (inteiro de 1 a 4) e funcionários
   (inteiro igual ou maior que zero).
3. Se desejar, informe nome fantasia, CNPJ, endereço e observações.
4. Clique em **Cadastrar empresa** e confira a notificação.

O CNPJ é opcional; quando informado, deve conter 14 dígitos, com ou sem máscara.
O sistema recusa CNPJ já existente no banco, inclusive em empresa excluída
logicamente. Não há consulta automática de dados por CNPJ.

Os cartões oferecem **Editar** e **Excluir**. A exclusão pede confirmação e
retira a empresa da lista e da seleção de novas inspeções, preservando o histórico.
Você mantém somente empresas próprias. Sem registros, aparece **Nenhuma empresa
cadastrada**; em falha, a tela apresenta mensagem.

Para inspecionar uma empresa, use **Inspeções → Nova inspeção** no menu.
O cartão da empresa não possui atalho nem tela de detalhe.

## 5. Criar, editar e publicar checklists

A **Biblioteca de checklists** abre em **Templates oficiais** e também oferece
**Meus checklists** e **Publicados por usuários**. Exibe somente ativos e tem
**Anterior/Próxima** quando há mais páginas.

1. Clique em **Novo modelo**.
2. Informe título; descrição é opcional. **Template pessoal** apenas classifica
   seu modelo, sem torná-lo oficial.
3. Mantenha **Ativo** para encontrá-lo na Biblioteca e depois utilizá-lo em novas
   inspeções. Salve em **Cadastrar checklist**.
4. Em **Meus checklists**, clique em **Abrir**.
5. Use **Novo item**, informe descrição, escolha se é obrigatório e selecione
   NRs aplicáveis, se necessário. Salve em **Cadastrar item**.
6. Revise os itens e clique em **Publicar vN**, confirmando a publicação.

**Editar/Excluir** de metadados ficam na Biblioteca; os controles dos itens ficam
no detalhe. Somente você mantém seu checklist. Não há controle completo de
reordenação. Desativar retira o modelo da Biblioteca atual, que não tem filtro
para inativos. Excluir pede confirmação e preserva o histórico das inspeções.

O rascunho é editável e inicialmente privado. A publicação preserva aquela
versão; editar depois cria ou utiliza o próximo rascunho do mesmo checklist.
Apenas versões publicadas de checklists ativos acessíveis podem iniciar
inspeções. Publicações de terceiros são consultáveis/reutilizáveis, sem permitir
editar seu conteúdo original. Uma nova publicação não retira as antigas
automaticamente. Não há botão para retirar versões ou interface completa de
histórico de versões.

## 6. Usar template oficial

1. Em **Templates oficiais**, clique em **Abrir** para consultar itens, NRs,
   versão, fonte e escopo.
2. Clique em **Usar template**, no cartão ou no detalhe.
3. O sistema abre sua nova cópia pessoal em rascunho v1.
4. Revise/adapte os itens e publique antes de usar a cópia em uma inspeção.

O selo **Oficial · Safe Watch Insight** indica curadoria institucional da
plataforma. O original é preservado e não pode ser editado pelo usuário comum.
Templates não são documentos governamentais nem garantia de conformidade legal
atual. Construção adapta Murbach (2019); trabalho em altura é curadoria da
Safe Watch Insight. Fontes e definições: [Templates oficiais](../AI/OfficialTemplates.md).
Uma publicação oficial também pode ser selecionada diretamente em **Nova inspeção**.

## 7. Copiar outro checklist

1. Abra um checklist próprio ou uma publicação acessível de outro usuário.
2. Clique em **Copiar checklist** no detalhe.
3. Após sucesso, o sistema abre um **novo checklist pessoal**, cujo título recebe
   **— Cópia** (com numeração quando necessária).
4. Revise os itens e publique seu rascunho v1. Você pode renomeá-lo pela Biblioteca.

A cópia tem itens independentes, preserva associações e metadados normativos e
mantém a linhagem disponível dos itens de origem. Editar sua cópia não altera
o original. Ela não herda oficialidade/marca de template nem copia inspeções,
respostas, não conformidades, ações, evidências ou histórico de inspeções.

Para origem própria, o sistema prefere seu rascunho; sem ele, utiliza a última
publicação elegível. Para terceiro/oficial, utiliza somente a última publicação
acessível de checklist ativo, nunca seu rascunho privado. Origem excluída,
somente retirada ou publicação legada/inconsistente pode impedir a operação;
confira a mensagem apresentada. A cópia exige conexão. Regras detalhadas:
[Cópia de checklist](../AI/ChecklistCopy.md).

## 8. Criar e abrir uma inspeção

1. Em **Inspeções**, clique em **Nova inspeção**.
2. No passo **Empresa**, selecione uma empresa própria.
3. Em **Checklist e observações**, selecione a versão publicada e, se desejar,
   informe observações iniciais.
4. Em **Agendamento**, informe data/hora ou deixe vazio para usar **Agora**.
5. Revise o resumo e clique em **Criar inspeção**.
6. O sistema retorna à lista; abra a inspeção criada para executá-la.

**Avançar** depende de empresa/versão selecionada. Sem publicação disponível,
a tela orienta publicar um checklist. A criação exige conexão e usa você como
inspetor. Não há seleção de outro inspetor, unidade, título independente ou
solicitante. Se faltar empresa, cadastre-a no menu **Empresas** e volte ao fluxo.

A inspeção usa o conteúdo da versão de checklist capturada na criação,
preservando seu histórico mesmo que o checklist seja alterado depois. Registros
legados podem apresentar aviso de que a versão original não pôde ser certificada.

A lista permite busca por empresa, checklist ou observações e filtro por status.
O ciclo usual é **Planejada → Em andamento → Concluída**: a primeira resposta
inicia o andamento. **Cancelada** é estado consultável; não há ação de cancelar,
reabrir, excluir ou editar dados gerais de inspeção nas telas atuais.

## 9. Responder e concluir

1. Na aba **Execução do checklist**, escolha por item:
   **Conforme**, **NC** (não conforme) ou **N/A** (não aplicável).
2. Após responder, registre observação se necessário; ela é salva ao sair do
   campo. Respostas/observações podem ser alteradas durante a execução.
3. Confira progresso e estado de sincronização no cabeçalho.
4. Na aba **Encerrar**, clique em **Concluir inspeção**.

Todos os obrigatórios precisam de resposta. **N/A** atende essa condição e não
conta como não conformidade; opcionais podem ficar pendentes. Não é necessário
resolver NCs, concluir ações ou enviar fotos para encerrar. Não há assinatura digital.

Respostas e conclusão são salvas primeiro no dispositivo, mesmo com conexão.
A conclusão retorna à lista e bloqueia novas respostas/observações; aguarde a
confirmação da sincronização antes de consultar os resultados remotos.
NCs, ações e evidências podem continuar em tratamento após a conclusão.

## 10. Acompanhar não conformidades

Responder **NC** cria ou reabre automaticamente a não conformidade associada
quando o envio é confirmado. A indicação local durante pendência é provisória.
Uma NC nova recebe severidade **Média**, status **Aberta** e prazo de sete dias.
Reabrir conserva prazo e dados anteriores; mudar para Conforme/N/A arquiva a NC
sem apagar fisicamente seu histórico. Alterar apenas observação não reescreve
os dados de uma NC ativa.

1. Abra **Não conformidades** após sincronizar.
2. Pesquise por descrição, item ou empresa, filtre severidade e escolha **Kanban**
   ou **Lista**.
3. Abra um registro para editar descrição, severidade e prazo e salvar alterações.
4. No seletor **Status**, escolha Aberta, Em tratativa, Resolvida ou Vencida.

O detalhe inclui item/normas históricos, link para a inspeção de origem,
histórico derivado das datas registradas, ações e evidências. **Arquivar** pede
confirmação e retorna à lista. Não há formulário autônomo para criar NC.
Severidades disponíveis: Baixa, Média, Alta e Crítica. O acesso segue a inspeção
própria; essas operações exigem conexão.

## 11. Registrar ações corretivas

1. No detalhe da NC, em **Plano de ação 5W2H**, clique em **Nova ação**.
2. Preencha **O quê?** (descrição obrigatória).
3. Se desejar, informe **Por quê?**, **Onde?**, **Quem?**, **Quando?**, **Como?** e
   **Quanto?**. São campos opcionais; responsável é texto, sem conceder acesso.
4. Escolha o status: Pendente, Em andamento, Concluída ou Vencida.
5. Clique em **Cadastrar ação**. Para concluir depois, use **Editar**, selecione
   **Concluída** e clique em **Salvar alterações**.

A data de conclusão é registrada automaticamente. Os cartões mostram
responsável/prazo/status e conclusão quando disponível. **Excluir** pede
confirmação e arquiva a ação. Criar uma ação em NC Aberta muda a NC para
Em tratativa; concluir ações não resolve a NC automaticamente. Se aplicável,
selecione **Resolvida** no status da NC.

NCs/ações com prazo vencido podem aparecer como Vencidas. Adiar somente o prazo
não restaura o status. Existe limitação conhecida ao salvar prazo vazio: ele
pode reaparecer como data antiga e indicar atraso; confira o resultado após
salvar. Esse comportamento não torna o prazo um campo obrigatório.

## 12. Enviar evidências online

1. Abra a aba **Evidências** da inspeção ou o painel no detalhe da NC.
2. Selecione uma ou mais imagens **JPEG, PNG ou WebP**, até **4 MB por arquivo**.
3. Confira as prévias; remova da seleção imagens indevidas.
4. Se desejar, informe **Legenda opcional** (até 500 caracteres), aplicada às
   imagens enviadas nessa seleção.
5. Clique em **Enviar evidências** e confira a confirmação de cada envio.

Arquivos vazios, formatos/tamanhos inválidos são recusados. Um lote pode ter
sucesso parcial: confira a lista e reenvie os arquivos que falharam. A lista
mostra imagem, nome, tamanho, dimensões quando disponíveis e legenda. Clique
na imagem/ícone para abrir; o botão de remoção pede confirmação e arquiva o registro.

O envio associa a evidência à inspeção **ou** à NC do painel utilizado. Não há
associação direta à ação corretiva. Seleção/upload ficam desabilitados offline;
selecione e envie após reconectar. Não há fila offline de imagens, compressão ou
gestão de quota offline.

## 13. Consultar e imprimir relatório

1. Aguarde a sincronização da conclusão.
2. Abra **Relatórios** pelo menu ou **Ver relatório** no detalhe de uma inspeção
   concluída ou no dashboard.
3. Selecione uma inspeção concluída própria; sem seleção, a tela usa a primeira
   disponível. Sem concluídas, exibe mensagem de ausência de relatório.
4. Confira identificação da inspeção, empresa e inspetor, checklist/versão
   históricos, resumo, observações, resultados/normas por item, NCs, ações e fotos.
5. Clique em **Imprimir**. No diálogo do navegador, imprima ou escolha
   **Salvar como PDF**, quando disponível.

O relatório é HTML; não há download direto nem arquivo PDF gerado pelo sistema.
Abri-lo não cria um registro persistido de relatório a cada visualização.
Fotos incluem nome, legenda, tamanho e data; NCs/ações mostram status/prazo e
tratativas ativas. Empresa/inspetor e tratativas refletem dados atuais, enquanto
o conteúdo do checklist permanece histórico.

O resumo distingue Conforme, NC, N/A e pendentes. **Preenchimento** inclui N/A;
opcionais pendentes podem aparecer mesmo após conclusão. Ele é diferente da
conformidade do dashboard. Erros de consulta oferecem **Tentar novamente**.
O acesso por identificador direto pode mostrar inspeção própria ainda aberta,
embora o seletor liste apenas concluídas; isso permanece registrado para QA.

## 14. Acompanhar o dashboard

O **Dashboard** mostra dados próprios: Total de inspeções, Concluídas,
Em andamento, NCs abertas, Conformidade, gráfico por status, **Requer atenção**
e até cinco inspeções recentes, ordenadas pela data da inspeção.

A taxa de conformidade considera respostas de inspeções concluídas:

```text
100 × Conforme / (Conforme + NC)
```

O resultado é arredondado; N/A e itens sem resposta ficam fora do denominador.
Sem respostas aplicáveis, aparece **—**. NCs abertas incluem as em tratativa e
vencidas. **Requer atenção** soma planejadas, NCs vencidas e ações vencidas;
mais de uma pendência pode pertencer à mesma inspeção. As contagens de atraso
não alteram o estado dos registros durante a consulta do dashboard.

Use **Nova inspeção**, **Ver todas**, links das pendências e **Ver relatório**
nas recentes concluídas. Há carregamento, erro com **Tentar novamente** e estado
sem inspeções. Não há filtros de BI ou análise temporal avançada.

## 15. Preparar e continuar offline

1. Enquanto conectado, entre na sua conta e crie/liste/abra as inspeções desejadas.
2. Confira em **Configurações → Funcionamento offline** quantas inspeções estão
   no dispositivo. Abra os detalhes que pretende usar antes de ir a campo.
3. Sem conexão, continue nas inspeções já disponíveis, respondendo e registrando
   observações. Também é possível concluir se os obrigatórios estiverem atendidos
   e não houver bloqueio local de falha/conflito.
4. Os dados ficam pendentes de envio; use os indicadores para acompanhar.

Somente inspeções disponibilizadas localmente ficam acessíveis; não é todo o
histórico do banco. Reabrir sem rede depende também da página já carregada e
armazenada e da validade da sessão local (oito horas). O navegador pode remover
armazenamento local; ele não é uma garantia permanente de retenção.

## 16. Sincronizar e tentar novamente

Com conexão e sessão aceita, a aplicação tenta enviar respostas e conclusão
automaticamente. **Online** indica conectividade detectada, sem garantir que o
servidor esteja acessível. Aguarde pendências, falhas e conflitos desaparecerem.

Em **Configurações**, confira inspeções armazenadas, operações pendentes, falhas
e conflitos. **Sincronizar agora** reenvia pendências/erros quando habilitado;
a barra superior também oferece **Sincronizar dados locais** quando aplicável.
Se a autenticação expirou, conecte-se e entre novamente na mesma conta para
validar a sessão, preservando as pendências existentes dessa identidade.

Conflito bloqueia a fila; retry não o resolve. Não há sobrescrita automática nem
resolução assistida na interface. Uma primeira operação bloqueada pode impedir
as demais, inclusive de outra inspeção. Relatórios/dashboard consultam dados
remotos e podem estar desatualizados em relação a mudanças locais pendentes.

## 17. Sair ou trocar de conta

**Sincronize as alterações pendentes antes de sair ou trocar de conta.**
**Sair**, no menu, tenta encerrar a sessão remota e limpar sessão local,
inspeções armazenadas, fila de alterações e cache de navegação do dispositivo,
retornando ao login. Troca de identidade também limpa dados anteriores.
Alterações ainda não enviadas podem ser perdidas nessa limpeza.

Falha de logout remoto ou limpeza local é informada por notificação; confira a
mensagem. Entrar novamente na mesma conta para renovar autenticação difere de
sair ou trocar para outra identidade.

## 18. Outros módulos e limites atuais

**Normas (NRs)** permite buscar código/título/descrição, filtrar vigentes,
revogadas ou todas e abrir a fonte oficial quando cadastrada. Não há manutenção
do catálogo pela interface.

**Equipe** é prévia demonstrativa. Em **Configurações**, **Perfil ativo** só afeta
dados demonstrativos e não muda conta/permissões; **Modo escuro** é controle da
tela, sem preferência persistida. **Restaurar dados demonstrativos** atua nos
módulos locais; não altera dashboard/relatórios reais, empresas, checklists ou
inspeções persistidos, apesar da menção antiga a dashboard/relatórios no texto
do painel.

Continuam fora da entrega: solicitante, administração/RBAC, edição persistida de
perfil, recuperação de senha, assinatura digital, múltiplos modelos de relatório
editáveis e PDF customizado. Offline ainda não cobre criar inspeções do zero,
CRUD de outros módulos, imagens, reconciliação assistida ou pacotes dedicados de
relatório/dashboard. A homologação funcional histórica concentra-se no Chromium
local; outros navegadores e o fluxo autenticado completo em produção permanecem
pendentes. Esta revisão não executou testes funcionais.

Para limites e concerns já registrados, consulte
[Requisitos](./DocumentoDeRequisitos.md), [Offline](../AI/Offline.md) e
[Relatório da Fase 6](./RelatorioFase6.md). A navegação e tarefas correspondem aos
[casos de uso atuais](./DiagramaDeCasosDeUso.md); os
[wireframes](./WIREFRAMES.md) permanecem históricos.
