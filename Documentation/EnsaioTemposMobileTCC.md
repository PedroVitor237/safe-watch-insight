# Ensaio de tempos no Safe Watch Insight

O ensaio mede duas tarefas em uma instalação do Safe Watch Insight com dados sintéticos, usando
Chromium emulado como Pixel 7 pelo Playwright. O login usa uma conta criada para cada execução e
ocorre antes da coleta. O ensaio reutiliza a sessão, abrindo um contexto de navegador novo a cada
tentativa para manter as mesmas condições de cache cliente e armazenamento local. A execução usa
um trabalhador, sem tentativas automáticas adicionais.

## Cenários e critérios de conclusão

| Medida no JSON                | Início                                                                | Fim                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `accessMs`                    | Abertura direta do endereço de uma inspeção nova                      | Checklist vazio visível e primeira opção de resposta habilitada                                                         |
| `fillingMs`                   | Checklist pronto para preenchimento                                   | Seis respostas registradas no progresso, duas observações digitadas e campo da última observação desfocado              |
| `fillingAndLocalCompletionMs` | Checklist pronto para preenchimento                                   | Mensagem da interface de conclusão local e início da sincronização                                                      |
| `reportReadyMs`               | Abertura direta do endereço do relatório de uma inspeção já concluída | Relatório da inspeção correta renderizado, com os seis itens, as observações esperadas e a ação **Imprimir** habilitada |

A inspeção usa seis itens, com quatro respostas conformes, uma não conforme e uma não aplicável.
Duas respostas recebem observações idênticas entre repetições. Cada tentativa de preenchimento
usa uma inspeção nova derivada do mesmo checklist publicado. Após a medição, o ensaio verifica
a persistência das seis respostas, das duas observações e do estado concluído e sincronizado no
PostgreSQL. A verificação fica fora da duração registrada. Tentativas com qualquer verificação
inválida ficam no registro bruto, com a etapa da falha.

No segundo cenário, as tentativas consultam o mesmo relatório histórico preparado com esse
checklist, as mesmas respostas e as mesmas observações. A plataforma prepara o relatório HTML
sob demanda a partir dos dados persistidos. **Imprimir** abre a impressão do navegador, pela qual
também é possível salvar em PDF. A medição termina com o relatório pronto na tela e a ação
habilitada. O diálogo nativo, a gravação do PDF, o tempo de login, a criação da inspeção e o
envio de imagens ficam fora dos tempos. O cenário usa zero fotos, portanto não caracteriza o
upload ou a entrega de imagens pelo Cloudinary.

## Digitação emulada

Foi escolhida como referência a média de **36,2 palavras por minuto** observada por Palin et al.
(2019) em uma tarefa de transcrição com 37.370 voluntários em dispositivos móveis. O estudo
normaliza uma palavra para cinco caracteres. A conversão `60.000 / (36,2 × 5)` resulta em
aproximadamente **332 ms**. Esse é o intervalo configurado no `pressSequentially` para as duas
observações. O roteiro prescreve as respostas e os textos. O tempo medido descreve uma execução
automatizada, com as ações do script e as esperas da plataforma. Ele não mede o tempo humano de
leitura, decisão ou inspeção em campo.

- PALIN, Kseniia et al. How do people type on mobile devices? Observations from a study with
  37,000 volunteers. In: INTERNATIONAL CONFERENCE ON HUMAN-COMPUTER INTERACTION WITH MOBILE
  DEVICES AND SERVICES, 21., 2019, Taipei. **Proceedings [...]**. New York: ACM, 2019.
  Artigo 9. [DOI](https://doi.org/10.1145/3338286.3340120).
  [Texto integral na Universidade Aalto](https://acris.aalto.fi/ws/portalfiles/portal/38210172/ELEC_Palin_How_do_People_type_MobileHCI.pdf).
- [Documentação do Playwright sobre digitação sequencial](https://playwright.dev/docs/api/class-locator#locator-press-sequentially).

## Condições comparadas

Para cada tarefa, a rodada principal executa três blocos. Cada bloco começa com **seis minutos
sem solicitações do executor ao ambiente**, seguidos de uma primeira tentativa e de cinco
tentativas consecutivas. São **3 tentativas após espera e 15 consecutivas por tarefa**, totalizando
36 tentativas. As seis esperas somam 36 minutos, além da preparação e das execuções.

A comparação é descritiva. O Neon Free pode suspender o processamento após cinco minutos de
inatividade. A janela do ensaio é uma condição operacional. Atribua um aumento a uma reativação
do Neon ou a um _cold start_ de função apenas quando houver evidência direta da ocorrência.
Registre tráfego concorrente, tarefas periódicas, regiões e estado conhecido do serviço.
A verificação de persistência da inspeção pode acessar o banco entre tentativas consecutivas.
Os dois cenários começam por endereço direto, portanto nenhuma navegação autenticada do
executor antecede o primeiro acesso cronometrado de cada bloco.

- [Ciclo de atividade do Neon](https://neon.com/docs/introduction/compute-lifecycle).
- [Execução e localização de funções na Vercel](https://vercel.com/docs/functions).

## Execução e evidências

Use uma instalação dedicada de testes em HTTPS e um PostgreSQL separado chamado
`safe_watch_timing`, com as migrations daquele commit aplicadas e sem executar seed de
demonstração. Configure o mesmo banco na instalação e no executor, sem tráfego externo durante
a coleta. O código interrompe a preparação se detectar contas fora do padrão sintético. As contas
e registros gerados ficam nesse ambiente, identificados por execução. O executor valida o vínculo
com a instalação autenticando a conta única criada no banco.

1. Use a versão de Node da `.nvmrc`, rode `npm ci` e instale Chromium com
   `npx playwright install chromium`.
2. Forneça as variáveis abaixo no ambiente do processo. Mantenha a conexão do banco fora de
   commits, logs e relatórios.

   | Variável                  | Valor                                                                      |
   | ------------------------- | -------------------------------------------------------------------------- |
   | `SW_TIMING_BASE_URL`      | Origem HTTPS da instalação dedicada                                        |
   | `SW_TIMING_DATABASE_URL`  | Conexão do banco separado `safe_watch_timing`                              |
   | `SW_TIMING_CONFIRMATION`  | `dedicated-synthetic-environment`                                          |
   | `SW_TIMING_DEPLOY_SHA`    | SHA completo da revisão que a instalação executa                           |
   | `SW_TIMING_MODE`          | `pilot` para o piloto, depois `study` para a coleta                        |
   | `SW_TIMING_CHROMIUM_PATH` | Opcional. Binário Chromium quando a instalação padrão estiver indisponível |

3. Execute `npx playwright test -c tests/timing/playwright.config.ts` com modo `pilot`. O piloto
   faz uma tentativa por tarefa sem espera. Ele também aceita uma instalação local em
   `http://127.0.0.1` com porta explícita.
4. Com o piloto aprovado na instalação dedicada, execute o mesmo comando em modo `study`.
   Mantenha o executor ativo até o resultado. O piloto e a coleta gravam arquivos separados.
5. Preserve o JSON de `test-results/timing/<execução>/.../tempos-mobile.json`. O comando informa
   o caminho. O JSON registra tentativas, etapas, duração, classificação e ambiente técnico.
   Sua atualização ocorre a cada tentativa, inclusive quando ela falha. As estatísticas usam
   tentativas completas e aprovadas. O resumo apresenta quantidade, média, mediana, mínimo e
   máximo. Preserve também a quantidade de falhas e as tentativas que ficaram por executar.
6. Registre no relatório técnico da rodada o commit do roteiro, commit do deploy, data e hora
   da coleta, região de onde o executor rodou, regiões da Vercel e do Neon, recursos efetivamente
   usados e condições de rede observáveis. Inclua o JSON sanitizado junto ao relatório, com
   um quadro por tarefa e condição. Apresente os tempos em segundos no texto. Registre diferenças
   e falhas com suas evidências. Se uma condição ficar sem amostras válidas, indique isso no quadro.

As médias descrevem o checklist e o ambiente testados. Uma conclusão sobre economia de tempo
em relação a formulários em papel exigiria uma medição comparável desse processo. Depois da
primeira coleta documentada, a equipe revisa o procedimento e os resultados antes de alterar a
monografia ou iniciar outra rodada.
