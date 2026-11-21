# Conferência da rodada 01 de tempos mobile

Em 21 de novembro de 2026, as 36 entradas de `samples` foram conferidas por fluxo e condição. Para cada medida, a média aritmética foi calculada a partir dos valores inteiros em milissegundos das tentativas aprovadas, convertida em segundos e arredondada a três casas decimais. Os totais conferem com `summary` no JSON e com o relatório da rodada. Os arquivos originais permanecem no commit `fcf9bb451cdefa2e2cdb19da00bfd99987fff8e8`. [JSON original](./tempos-mobile-rodada-01.json) · [Relatório original](./Rodada01.md).

| Fluxo     | Condição                    | Previstas | Registradas | Aprovadas | Falhas | Pendências |
| --------- | --------------------------- | --------: | ----------: | --------: | -----: | ---------: |
| Inspeção  | Após seis minutos de espera |         3 |           3 |         3 |      0 |          0 |
| Inspeção  | Consecutivas                |        15 |          15 |        15 |      0 |          0 |
| Relatório | Após seis minutos de espera |         3 |           3 |         3 |      0 |          0 |
| Relatório | Consecutivas                |        15 |          15 |        15 |      0 |          0 |
| **Total** |                             |    **36** |      **36** |    **36** |  **0** |      **0** |

| Fluxo e medida                                  | Média após espera (s) | Média consecutiva (s) |
| ----------------------------------------------- | --------------------: | --------------------: |
| Inspeção, acesso                                |                 3,688 |                 1,675 |
| Inspeção, preenchimento                         |                29,023 |                29,062 |
| Inspeção, preenchimento até a confirmação local |                29,218 |                29,261 |
| Relatório, pronto na tela                       |                 3,700 |                 1,682 |

O protocolo previa **332 ms** entre caracteres. O roteiro e o JSON registram **331 ms**, pois `60.000 ÷ (36,2 × 5)` dá aproximadamente 331,4917 ms, cujo arredondamento para o inteiro mais próximo é 331 ms. O intervalo efetivamente configurado foi 1 ms menor que o previsto. As seis esperas registradas variaram de 360,065 a 360,101 s. O piloto ficou fora das 36 tentativas. [Protocolo original](../EnsaioTemposMobileTCC.md) · [Roteiro da rodada](../../tests/timing/workflow.spec.ts).

As médias descrevem a execução observada. Os eventos `suspend_compute` e `start_compute` fornecem evidência direta de suspensão e reativação do compute Neon nos seis blocos. Comparando os horários exibidos em `Rodada01.md` com o início das tentativas no JSON, as marcações de reativação aparecem entre 0,301 s antes e 1,592 s depois da primeira abertura de cada bloco. No segundo bloco de relatório, a diferença exibida é de 1,592 s. Os logs do Neon têm resolução de um segundo, então a associação temporal é aproximada. A parcela da diferença de ponta a ponta atribuível ao Neon permanece indeterminada. A rodada também carece de evidência direta sobre inicialização de instâncias da Vercel. [Registros e condições descritos na rodada](./Rodada01.md#rede-e-atividade-dos-serviços).
