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

---

# Itens do Checklist

Cada item representa uma verificação objetiva.

Exemplos:

- Uso de EPI;
- Extintor dentro da validade;
- Sinalização adequada;
- Brigada treinada.

Cada item pode estar associado a uma ou mais normas.

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

---

# Inspeções

Uma inspeção sempre deve estar vinculada a:

- usuário;
- empresa;
- checklist.

Uma inspeção registra exatamente o estado observado durante sua execução.

Após concluída, uma inspeção não deve perder seu histórico.

Alterações posteriores devem preservar rastreabilidade.

---

# Respostas da Inspeção

Cada item do checklist recebe exatamente uma resposta durante uma inspeção.

Uma resposta pode conter:

- situação;
- observação.

A resposta pode gerar uma não conformidade.

Nem toda resposta gera uma não conformidade.

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

---

# Ações Corretivas

Uma não conformidade pode possuir nenhuma, uma ou várias ações corretivas.

Cada ação corretiva deve possuir:

- descrição;
- responsável;
- prazo;
- situação.

Uma ação corretiva pode ser concluída posteriormente.

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

---

# Relatórios

Cada inspeção pode gerar um relatório.

Relatórios devem utilizar as informações registradas durante a inspeção.

Nunca armazenar informações duplicadas que possam ser obtidas diretamente da inspeção.

Sempre que possível, o relatório deve referenciar:

- empresa;
- checklist;
- normas;
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

A arquitetura deve permanecer compatível com sincronização offline.

Mesmo que a funcionalidade ainda não esteja completamente implementada, nenhuma decisão arquitetural deve impedir sua futura implementação.

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
