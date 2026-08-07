# BusinessRules.md

# Regras de Negócio

Este documento descreve todas as regras de negócio da plataforma Safe Watch Insight.

Toda implementação deve seguir estas regras.

Caso alguma regra entre em conflito com a implementação existente, a implementação deve ser corrigida para manter compatibilidade com este documento.

---

# Objetivo da Plataforma

A plataforma tem como objetivo apoiar profissionais de Segurança e Saúde no Trabalho (SST) durante inspeções, auditorias e fiscalizações.

O sistema deve permitir registrar informações de forma rápida, segura, rastreável e preparada para funcionamento offline.

---

# Usuários

Um usuário pode:

- autenticar-se no sistema;
- cadastrar empresas;
- criar checklists;
- reutilizar checklists existentes;
- realizar inspeções;
- registrar evidências;
- registrar não conformidades;
- gerar relatórios.

Todo registro deve possuir um usuário responsável.

---

# Empresas

Uma empresa pode possuir diversas inspeções.

Uma empresa não pode possuir dois cadastros com o mesmo CNPJ.

Caso o CNPJ seja informado, ele deve ser único.

O cadastro da empresa deve armazenar informações suficientes para contextualizar as inspeções futuras.

Campos como CNAE, grau de risco e quantidade de funcionários podem ser utilizados posteriormente para automatizar sugestões de checklists e normas.

---

# Checklists

Os checklists representam modelos reutilizáveis.

Um checklist pode ser:

- Template oficial;
- Checklist personalizado.

Um checklist pode possuir qualquer quantidade de itens.

Itens podem ser adicionados, removidos ou reorganizados.

O sistema deve permitir reutilizar um checklist em diversas inspeções.

O conteúdo executável de um checklist é organizado em versões numeradas:

- uma versão `DRAFT` é editável;
- uma versão `PUBLISHED` está disponível para novas inspeções e é imutável;
- uma versão `RETIRED` deixa de estar disponível para novas inspeções e continua
  imutável para preservar histórico;
- cada checklist pode possuir no máximo um draft;
- várias versões publicadas podem coexistir;
- quando não for informada uma versão na criação da inspeção, o backend escolhe
  a versão publicada mais recente;
- ao alterar um checklist que não possui draft, o sistema deriva automaticamente
  um novo draft da versão publicada ou retirada mais recente;
- publicação sem draft é rejeitada.

Título e descrição fazem parte do conteúdo versionado. Os campos de catálogo
`isTemplate` e `isActive` permanecem na identidade `Checklist`; um checklist
inativo não pode iniciar novas inspeções.

Na publicação, o backend gera um hash SHA-256 do conteúdo canônico. A operação
usa controle otimista e não pode concluir se o draft for editado
concorrentemente.

---

# Itens do Checklist

Cada item representa uma verificação objetiva.

Exemplos:

- Uso de EPI;
- Extintor dentro da validade;
- Sinalização adequada;
- Brigada treinada.

Cada item pode estar associado a uma ou mais normas.

Itens editáveis pertencem à versão `DRAFT`. Criar, editar, remover ou reordenar
um item nunca altera uma versão já publicada. A troca de associações normativas
ocorre atomicamente no draft. Versões derivadas mantêm referência de linhagem ao
item da versão anterior quando aplicável.

---

# Normas

O sistema possui foco principal nas Normas Regulamentadoras (NRs).

Entretanto, a arquitetura deve suportar futuramente:

- NBR;
- Normas Técnicas;
- Legislação estadual;
- Regulamentos internos.

As normas devem ser reutilizáveis.

Nunca duplicar uma mesma norma.

O catálogo `Standard` continua único e reutilizável. Versões publicadas e
snapshots, porém, copiam somente os metadados normativos necessários para a
representação histórica. Essa duplicação controlada é obrigatória: mudanças
posteriores no catálogo não podem reescrever a fundamentação exibida em uma
inspeção antiga.

---

# Inspeções

Uma inspeção sempre deve estar vinculada a:

- usuário;
- empresa;
- checklist;
- versão publicada do checklist;
- snapshot histórico próprio.

Uma inspeção registra exatamente o estado observado durante sua execução.

Após concluída, uma inspeção não deve perder seu histórico.

Alterações posteriores devem preservar rastreabilidade.

Somente checklists ativos e versões `PUBLISHED` podem iniciar inspeções. A
criação da inspeção e a captura do snapshot acontecem na mesma transação. Uma
falha em qualquer item ou associação normativa desfaz toda a operação.

O snapshot contém título, descrição, número da versão, indicação de template,
itens, ordem, obrigatoriedade e metadados normativos. Ele é a fonte de verdade
desde a criação da inspeção, inclusive enquanto a inspeção está planejada ou em
andamento. Alterações futuras do checklist jamais adicionam, removem ou modificam
itens do snapshot existente.

Snapshots normais são `VERIFIED` e possuem origem `INSPECTION_CREATION`.
Snapshots produzidos pela migration para inspeções antigas são
`UNVERIFIED_LEGACY`, pois representam o melhor estado disponível no momento do
backfill, não uma reconstrução comprovada do passado.

---

# Respostas da Inspeção

Cada item aplicável do snapshot recebe no máximo uma resposta durante a
inspeção; a conclusão exige resposta para todos os itens obrigatórios.

Uma resposta pode conter:

- situação;
- observação.

A resposta pode gerar uma não conformidade.

Nem toda resposta gera uma não conformidade.

A resposta deve identificar o item do snapshot da própria inspeção. O contrato
aceita temporariamente `checklistItemId` para clientes legados, mas o Service o
mapeia para o snapshot antes de persistir; novas telas enviam `snapshotItemId`.
É obrigatório enviar exatamente um desses identificadores.

---

# Não Conformidades

Uma não conformidade representa uma irregularidade encontrada durante uma inspeção.

Exemplos:

- ausência de EPI;
- extintor vencido;
- treinamento vencido;
- máquina sem proteção.

Uma não conformidade deve possuir:

- descrição;
- nível de severidade;
- situação;
- prazo quando aplicável.

Quando uma resposta de inspeção for registrada como `NON_COMPLIANT`, o sistema
deve criar automaticamente uma única não conformidade vinculada à resposta.

Na criação automática:

- a descrição inicial utiliza a observação da resposta, quando informada, ou a
  descrição histórica do item do snapshot;
- a severidade inicial é `MEDIUM`;
- o status inicial é `OPEN`;
- o prazo inicial é de sete dias;
- as normas relacionadas são obtidas pelas cópias normativas do snapshot;
- empresa, inspeção e usuário responsável pela inspeção permanecem rastreáveis
  pelo relacionamento da resposta.

Se a resposta for corrigida para `COMPLIANT` ou `NOT_APPLICABLE` antes da
conclusão da inspeção, a não conformidade correspondente deve ser arquivada por
soft delete. Se voltar a `NON_COMPLIANT`, o mesmo registro deve ser restaurado,
preservando seu histórico.

Respostas de inspeções concluídas ou canceladas não podem ser alteradas.

Uma inspeção somente pode ser concluída quando todos os itens obrigatórios
possuírem resposta.

Não conformidades e ações corretivas com prazo vencido e ainda abertas devem
ser identificadas com status de atraso.

---

# Ações Corretivas

Uma não conformidade pode possuir nenhuma, uma ou várias ações corretivas.

Cada ação corretiva deve possuir:

- descrição;
- justificativa, local, método e custo estimado quando informados no plano 5W2H;
- responsável;
- prazo;
- situação.

Uma ação corretiva pode ser concluída posteriormente.

Ao cadastrar a primeira ação corretiva de uma não conformidade aberta, a não
conformidade passa para `IN_PROGRESS`.

Ao concluir uma ação corretiva, o sistema registra `completedAt`. Se a ação for
reaberta, esse timestamp deve ser removido.

---

# Evidências

Uma evidência representa um arquivo relacionado à inspeção.

Inicialmente:

- fotografias.

No futuro:

- vídeos;
- documentos;
- anexos.

Uma evidência pode estar associada:

- diretamente à inspeção;
- ou a uma não conformidade.

Deve existir exatamente um desses vínculos. A inspeção precisa possuir seu
snapshot histórico; a não conformidade precisa estar vinculada a uma resposta e
a um item do snapshot. Evidências nunca podem referenciar entidades mutáveis do
checklist.

No MVP são aceitas imagens JPEG, PNG e WebP com até 4 MB. O backend valida
MIME type, tamanho e assinatura binária antes do envio. O upload é assinado no
servidor através da abstração `StorageService`; segredos do provedor não são
enviados ao cliente.

Em caso de falha ao persistir metadados, o Service tenta remover imediatamente
o arquivo enviado. A remoção arquiva o registro por soft delete e restaura os
metadados se o provedor rejeitar a exclusão.

---

# Relatórios

Cada inspeção pode gerar um relatório.

Relatórios devem utilizar as informações registradas durante a inspeção.

Nunca armazenar informações duplicadas que possam ser obtidas diretamente da inspeção.

Sempre que possível, o relatório deve referenciar:

- empresa;
- snapshot do checklist e versão de origem;
- normas copiadas no snapshot;
- não conformidades;
- ações corretivas.

---

# Histórico

O sistema deve preservar o histórico completo das inspeções.

Nunca excluir informações que comprometam auditorias futuras.

Sempre priorizar rastreabilidade.

---

# Exclusão de Dados

Sempre que possível utilizar exclusão lógica (soft delete) em vez de exclusão física.

Caso uma exclusão física seja realmente necessária, garantir que não existam dependências.

---

# Auditoria

Registros importantes devem manter:

- data de criação;
- data de atualização;
- usuário responsável quando aplicável.

---

# Validação

Toda entrada de dados deve ser validada.

Utilizar Zod para validação.

Nunca confiar em dados enviados pelo cliente.

---

# Segurança

Senhas devem ser armazenadas utilizando hash (bcrypt).

Nunca armazenar senhas em texto puro.

Nunca expor informações sensíveis em respostas da API.

---

# Integração Frontend

O frontend nunca deve acessar diretamente o banco.

Todo acesso deve ocorrer através de:

Frontend

↓

Server Function / API

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

---

# Funcionamento Offline

A execução offline usa exclusivamente o snapshot já pertencente à inspeção. Uma
resposta local deve referenciar `snapshotItemId`, manter o horário original e
entrar em fila durável. O servidor revalida estado, item, NC e sessão.

Retry do mesmo ID/payload deve ser idempotente. Reutilização divergente do ID ou
mudança da revisão remota é conflito e bloqueia operações dependentes. Não usar
`Last Write Wins` para respostas, conclusão, versões publicadas ou snapshots.

O cliente só pode apresentar `SYNCED` depois da confirmação remota. Estado salvo
no IndexedDB é `PENDING`, ainda que o navegador reporte conexão disponível.

---

# Registro de Fotos

A estrutura da aplicação deve permitir anexar fotografias às inspeções.

O armazenamento definitivo será realizado em serviço externo (Cloudinary).

O banco armazenará apenas:

- URL;
- metadados;
- referência à inspeção ou à não conformidade.

---

# Escalabilidade

Toda implementação deve considerar que futuramente o sistema poderá suportar:

- múltiplas empresas;
- múltiplos usuários;
- permissões por perfil;
- notificações;
- dashboards avançados;
- sincronização offline completa;
- assinatura digital;
- geolocalização.

Nenhuma implementação deve dificultar essas futuras evoluções.

---

# Princípios Gerais

Durante o desenvolvimento, sempre priorizar:

- simplicidade;
- legibilidade;
- reutilização de código;
- baixo acoplamento;
- alta coesão;
- compatibilidade com a documentação do TCC.

Em caso de dúvida, preservar a consistência entre regras de negócio, banco de dados e documentação antes de implementar novas funcionalidades.
