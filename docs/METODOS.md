# Métodos estatísticos

## Estimadores

Para N leituras individuais, a média é a soma das leituras dividida por N. O desvio global `s` usa a soma dos desvios quadráticos em relação à média, com divisor `N−1`.

Em X̄–R, cada linha é um subgrupo de n leituras e seu R é a diferença entre máximo e mínimo. A média geral coincide com a média das médias porque o tamanho dos subgrupos é constante.

Em I–MR, `MRᵢ = |xᵢ − xᵢ₋₁|`. A primeira leitura não tem amplitude móvel. A amplitude é representada na posição da segunda leitura do par.

## Cartas de controle

| Carta | Centro | Limite inferior | Limite superior |
| --- | --- | --- | --- |
| I | Média geral | Média − 3 × MR̄/1,128 | Média + 3 × MR̄/1,128 |
| MR | MR̄ | 0 | 3,267 × MR̄ |
| X̄ | Média geral | Média − A₂ × R̄ | Média + A₂ × R̄ |
| R | R̄ | D₃ × R̄ | D₄ × R̄ |

Os limites são de Fase I e usam a base atual completa. Não há congelamento de limites para Fase II nem exclusão automática de causas especiais.

## Constantes

| n | d₂ | A₂ | D₃ | D₄ |
| --- | --- | --- | --- | --- |
| 2 | 1,128 | 1,880 | 0 | 3,267 |
| 3 | 1,693 | 1,023 | 0 | 2,574 |
| 4 | 2,059 | 0,729 | 0 | 2,282 |
| 5 | 2,326 | 0,577 | 0 | 2,114 |
| 6 | 2,534 | 0,483 | 0 | 2,004 |
| 7 | 2,704 | 0,419 | 0,076 | 1,924 |
| 8 | 2,847 | 0,373 | 0,136 | 1,864 |
| 9 | 2,970 | 0,337 | 0,184 | 1,816 |
| 10 | 3,078 | 0,308 | 0,223 | 1,777 |

São usadas constantes tabeladas a três casas decimais. O A₂ tabelado pode diferir ligeiramente de `3/(d₂√n)` calculado com d₂ arredondado. A sinalização de zonas usa um terço da distância entre centro e limite superior da carta de localização.

## Regras

| Identificador | Critério | Ativação inicial |
| --- | --- | --- |
| r1 | 1 ponto estritamente além de 3σ | Ativa |
| r2 | 9 pontos consecutivos no mesmo lado do centro | Ativa |
| r3 | 6 pontos consecutivos estritamente crescentes ou decrescentes | Ativa |
| r4 | 2 de 3 pontos além de 2σ, no mesmo lado | Opcional |
| r5 | 4 de 5 pontos além de 1σ, no mesmo lado | Opcional |

O conjunto é didático e configurável, não uma implementação completa de todas as regras Nelson ou Western Electric. A comparação numérica adota tolerância de 1e−10 nas fronteiras de σ. Pontos exatamente nas fronteiras não contam como ultrapassagem. Empates interrompem tendências e valores no centro interrompem sequências de mesmo lado. Janelas sobrepostas são registradas como ocorrências separadas.

Na dispersão, sempre se verifica ponto além de LIC/LSC de R ou MR, mesmo com r1 desmarcada para a localização. As regras de sequência e zona não são aplicadas a R/MR.

## Capacidade e desempenho

```text
σ̂ dentro = R̄/d₂ em X̄–R; MR̄/1,128 em I–MR
Cp  = (LS − LI)/(6 × σ̂ dentro)
Cpk = mínimo[(LS − média)/(3 × σ̂ dentro), (média − LI)/(3 × σ̂ dentro)]
Pp  = (LS − LI)/(6 × s global)
Ppk = mínimo[(LS − média)/(3 × s global), (média − LI)/(3 × s global)]
```

Se o desvio correspondente for zero, o índice fica indisponível. Cpk negativo é preservado quando a média está além da especificação. Leituras iguais a LI ou LS são consideradas conformes.

A meta inicial 1,33 é didática e configurável, não um requisito universal. A análise aceita apenas especificações bilaterais. Os índices pressupõem um modelo de distribuição e coleta apropriados; o aplicativo não verifica automaticamente normalidade, independência, autocorrelação ou MSA.

## Estados da interface

- **Sinais especiais:** há pelo menos uma ocorrência nas regras ativas ou na dispersão.
- **Base preliminar:** menos de 20 pontos/subgrupos, sem outro sinal. O limite é um alerta didático de amostragem.
- **Sem sinais:** não houve ocorrência nas regras configuradas e há pelo menos 20 pontos/subgrupos com variação estimável. Não equivale a prova definitiva de estabilidade.
- **Revisar medição:** amplitude média zero. A capacidade não é estimável pelo método de variação dentro.

## Referências

As fontes estão relacionadas no README. O algoritmo usa métodos clássicos de SPC e não reproduz integralmente o manual licenciado AIAG & VDA SPC. Não se deve interpretar o projeto como verificação de conformidade a todas as exigências de um cliente ou norma.
