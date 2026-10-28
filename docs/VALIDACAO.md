# Validação

## Motor estatístico

Comando: `npm test`.

A suíte contém 21 testes, com referências independentes calculadas manualmente e testes de comportamento. Os casos incluem:

- I–MR para leituras 10, 12, 11, 13: média 11,5; MR̄ = 5/3; σ̂ = (5/3)/1,128.
- X̄–R com três subgrupos de cinco peças: média 4; R̄ = 4; limites X̄ 1,692 e 6,308; LSC de R 8,456.
- Desvio global com divisor N−1 e distinção dos estimadores de capacidade/desempenho.
- Cpk negativo, dispersão zero, bases curtas e fronteiras de especificação.
- Regras de ponto, sequência, tendência e zona, incluindo empates e janelas.
- Índices dos sinais MR associados à segunda leitura do par.
- CSV com BOM, cabeçalho, aspas, vírgula decimal, tabulação e rejeição de células inválidas.
- Objetivos didáticos dos seis cenários em I–MR e X̄–R.

## Conferência funcional no navegador

| Fluxo | Estado |
| --- | --- |
| Navegação entre laboratório, dados, capacidade e exercícios | Conferido em desktop |
| Troca de cenário e atualização dos indicadores | Conferido |
| Carta R e seleção de um ponto | Conferido |
| Entrada manual e cálculo I–MR de referência | Conferido |
| Rejeição de subgrupo incompleto sem aplicar a base | Conferido |
| Respostas correta/incorreta e questão numérica dos exercícios | Conferido |
| Exportação CSV | Download recebido |
| Seletor nativo de arquivos | Verificação interrompida por falha de protocolo no navegador de QA |
| Inspeção visual em tela móvel | Pendente |
| Download do relatório Markdown e restauração JSON completos | Implementados; verificação ponta a ponta pendente |

A suíte automatizada não substitui a conferência funcional dos fluxos pendentes. Não há alegação de validação metrológica, aprovação de cliente ou certificação oficial.

## Integração contínua

O workflow `.github/workflows/ci.yml` confere sintaxe e executa os testes em Node.js 22 e 24 para pushes e pull requests em `main`. Não contém etapa de implantação, credenciais de serviços externos ou publicação do site. Seu resultado remoto deve ser conferido após o primeiro envio ao GitHub.
