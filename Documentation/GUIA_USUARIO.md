# Guia do Usuário — Safe Watch Insight

## 1. Sobre a plataforma

O Safe Watch Insight, identificado na interface como **SST Inspeções**, apoia o
registro e o acompanhamento de inspeções, auditorias e fiscalizações de
Segurança e Saúde no Trabalho.

O fluxo principal utiliza dados persistidos no backend. Dashboard, relatórios e
equipe ainda são prévias demonstrativas e aparecem identificados dessa forma na
interface. O funcionamento offline cobre a continuidade de inspeções já
disponibilizadas no dispositivo, mas ainda não representa suporte offline
completo.

## 2. Acesso

Ao abrir a aplicação, o usuário é direcionado para `/login`.

1. Informe o e-mail e a senha de um usuário cadastrado.
2. Clique em **Entrar**.
3. Após a autenticação, o sistema abre o **Dashboard**.

No ambiente preparado pelo seed, as credenciais demonstrativas são:

```text
E-mail: admin@demo.com
Senha: Admin@123
```

A autenticação é real e cria uma sessão HTTP-only. Não há seleção de perfil no
formulário de login.

## 3. Navegação

As telas autenticadas usam um menu lateral dividido em:

- **Operação:** Dashboard, Inspeções, Checklists, Não conformidades e
  Relatórios.
- **Cadastros:** Empresas, Normas (NRs), Equipe e Configurações.

A barra superior apresenta o estado de sincronização, notificações e o usuário
autenticado. O avatar abre **Configurações**. A opção **Sair**, no rodapé do menu,
encerra a sessão e tenta remover os dados offline armazenados no dispositivo.

## 4. Empresas

A tela **Empresas** lista os registros persistidos no PostgreSQL.

Para cadastrar:

1. Clique em **Nova empresa**.
2. Preencha razão social, nome fantasia, CNPJ, CNAE, grau de risco, quantidade
   de funcionários, endereço e observações.
3. Clique em **Cadastrar empresa**.

Os botões **Editar** e **Excluir** permitem atualizar ou remover uma empresa. A
validação é executada no backend, inclusive para os campos obrigatórios e a
unicidade do CNPJ ativo.

## 5. Checklists e versões

A **Biblioteca de checklists** lista os modelos ativos persistidos.

### Criar ou editar um checklist

1. Clique em **Novo modelo**.
2. Informe título e descrição.
3. Defina se o registro é um template e se está ativo.
4. Salve o formulário.

Cada cartão também oferece **Abrir**, **Editar** e **Excluir**.

### Manter itens e normas

Ao abrir um checklist:

1. Use **Novo item** para cadastrar uma verificação.
2. Informe a descrição e se o item é obrigatório.
3. Selecione as Normas Regulamentadoras aplicáveis.
4. Salve o item.

Itens existentes podem ser editados ou excluídos. Quando o conteúdo de uma
versão já publicada é alterado, o sistema mantém a publicação anterior imutável
e trabalha no próximo rascunho.

### Publicar

O botão **Publicar vN** transforma o rascunho em uma versão imutável. Somente
versões publicadas ficam disponíveis para criar novas inspeções. Inspeções
existentes continuam ligadas ao snapshot que receberam na criação.

## 6. Criar uma inspeção

Na lista de **Inspeções**, clique em **Nova inspeção**. O assistente possui três
passos:

1. **Empresa:** selecione a empresa fiscalizada.
2. **Checklist e observações:** selecione uma versão publicada e, se necessário,
   registre observações iniciais.
3. **Agendamento:** informe data e hora e revise o resumo.

Clique em **Criar inspeção**. O sistema cria a inspeção e seu snapshot histórico
na mesma operação e retorna à lista. Abra a linha recém-criada para iniciar a
execução.

O usuário responsável é o usuário autenticado. A interface não solicita uma
unidade, um título independente ou outro inspetor nesse assistente.

## 7. Executar e concluir uma inspeção

A tela da inspeção mostra progresso, quantidade de não conformidades, inspetor,
data, versão histórica e estado de sincronização.

Na aba **Execução do checklist**, escolha uma resposta para cada item:

- **Conforme**;
- **NC** (não conforme);
- **N/A** (não aplicável).

Após responder, use o campo de observação para registrar contexto adicional. Uma
resposta **NC** cria ou restaura automaticamente a não conformidade associada;
alterar a resposta para outro estado arquiva a não conformidade automática
quando a regra de negócio permitir.

As respostas são gravadas primeiro no dispositivo e enfileiradas para envio. A
mensagem de sucesso local não deve ser interpretada como confirmação de
persistência no PostgreSQL; consulte o indicador de sincronização.

### Evidências da inspeção

Na aba **Evidências** é possível selecionar uma ou mais imagens, conferir a
prévia, adicionar legenda e enviar. São aceitos JPEG, PNG e WebP de até 4 MB por
imagem. O upload exige conexão e credenciais Cloudinary configuradas no
servidor. Evidências já enviadas podem ser abertas ou removidas.

### Conclusão

Na aba **Encerrar**, clique em **Concluir inspeção**. Itens obrigatórios precisam
estar respondidos. Após a conclusão, a inspeção não aceita novas respostas e o
sistema retorna à lista.

A assinatura digital ainda não está disponível.

## 8. Funcionamento offline

O primeiro incremento Offline/PWA permite continuar o preenchimento de
inspeções do usuário autenticado que já tenham sido abertas ou listadas enquanto
havia conexão.

- O pacote da inspeção, seu snapshot, respostas e fila ficam em
  Dexie/IndexedDB.
- Respostas e conclusão pendentes são reenviadas após a reconexão.
- Retry mantém o identificador original da operação para evitar duplicidade.
- Conflitos de revisão são bloqueados; o sistema não sobrescreve
  automaticamente o dado remoto.
- **Configurações** mostra inspeções armazenadas, operações pendentes, falhas e
  conflitos e oferece **Sincronizar agora** quando aplicável.

Limitações atuais:

- não é possível criar uma inspeção completamente offline;
- conflitos ainda não possuem resolução assistida na interface;
- arquivos de evidência não entram na fila offline;
- a homologação está concentrada no Chromium local.

## 9. Não conformidades e ações corretivas

A tela **Não conformidades** usa dados persistidos e permite:

- busca por descrição, item ou empresa;
- filtro por severidade;
- visualização em Kanban ou lista;
- acesso ao detalhe de cada registro.

No detalhe, o usuário pode editar descrição, severidade e prazo, alterar o
status, arquivar a não conformidade, consultar o item e as normas históricas,
abrir a inspeção de origem e acompanhar o histórico.

O painel de ações corretivas permite cadastrar, editar, concluir e excluir
ações. Ele registra descrição, justificativa, local, responsável, prazo, método,
custo estimado e status conforme os campos aplicáveis do 5W2H. Evidências
fotográficas também podem ser vinculadas diretamente à não conformidade.

## 10. Normas Regulamentadoras

A tela **Normas** consulta o catálogo persistido. É possível pesquisar por
código, título ou descrição e filtrar normas vigentes, revogadas ou todas. Os
registros que possuem endereço oficial oferecem o link **Consultar fonte
oficial**.

## 11. Módulos demonstrativos

Os módulos abaixo ainda não representam dados reais do fluxo integrado:

- **Dashboard:** apresenta KPIs, gráficos e listas demonstrativas.
- **Relatórios:** exibe uma prévia baseada em dados locais demonstrativos;
  impressão e PDF estão desabilitados.
- **Equipe:** apresenta profissionais e métricas demonstrativas.
- **Perfil ativo em Configurações:** afeta apenas telas mockadas e não altera o
  usuário autenticado nem permissões do servidor.

O botão **Restaurar dados demonstrativos**, em Configurações, limpa somente os
dados locais usados por esses módulos. Empresas, checklists e inspeções
persistidos no banco não são alterados.

## 12. Encerrar a sessão

Use **Sair** no menu lateral. O sistema encerra a sessão remota quando possível,
remove a sessão local e tenta limpar pacotes e operações offline do dispositivo.
Se alguma etapa falhar, uma notificação informa a condição ao usuário.
