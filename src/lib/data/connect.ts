import { ClientFinanceData } from "@/lib/types";

// Contas a Pagar de outubro-dezembro/2026 importado da planilha "CONTAS_A_PAGAR_.Xlsx" (aba
// "CONTAS A PAGAR"), uma lista de despesas recorrentes mensais só com dia de vencimento (sem
// mês) — repetida pra out/nov/dez/2026. A classificação/categoria de cada linha foi definida
// cruzando a descrição/fornecedor com o relatório oficial do sistema (doc_22.pdf, "Relatório de
// contas à pagar (Analítico)", ago-set/2026, já identificado), que serviu de base pros nomes de
// classificação usados (ex.: "SALARIOS", "SISTEMAS", "Despesas Aluguel Escritorios" etc.).
//
// Itens da planilha que NÃO foram lançados (ids da linha original, pra referência):
// - Linha 6 "COMISSÃO ALEXANDRE" e linha 52 "DAS - BIKE E E-COMMERCE": valor R$ 0,00.
// - Linha 24 "ALUGUEL FLAT SANDRA" e linha 35 "APORTE 10% CONNECT E-COMMERCE": sem valor.
// - Linha 41 "PAGAMENTO DO CONSORCIO (LEMBRAR DO VENCIMENTO)": é uma nota/lembrete, sem valor.
// - Linha 57 "SITTAX RT": marcado "NÃO PAGAR" na planilha.
// - Linhas 59, 62 e 81 (compra de equipamentos Elton Tavares, manutenção moto Alexandre, Conta
//   Azul): parcelamentos que já terminaram antes de outubro (última parcela em setembro/agosto).
//
// Pontos de atenção (vale confirmar com o Ewerton):
// - "PARCELAMENTO VALOR DO CONSORCIO" aparece 5 vezes na planilha, R$ 3.400,00 cada, em dias
//   diferentes do mês (5, 11, 17, 26, 30) — lancei as 5 como parcelas distintas (categoria
//   "Consórcio"), mas pode ser duplicidade de uma mesma linha copiada várias vezes.
// - "DEVOLUÇÃO VALORES CONNECT E-COMMERCE" aparece com duas numerações de parcela diferentes
//   (3/17 e 4/17) em dias distintos — lancei como duas séries separadas (categoria "Repasses /
//   Acertos Societários"), confirme se não é a mesma série duplicada.
// - "FERIAS DE RENATA" (R$ 2.307,11) foi lançada só em outubro, por parecer um pagamento pontual
//   de férias — confirme se deve se repetir em novembro/dezembro.
// - "MULTAS CRIATIVAEDU" é uma série de 3 parcelas (R$ 2.284,09 em setembro — já paga — e
//   R$ 2.500,00 em outubro e novembro); não lancei parcela de dezembro.
// - "SISTEMA ACESSORIES" (R$ 1.446,23 na planilha) e "HOSTGATOR - CONNECT" (R$ 449,79) têm
//   valores que não batem exatos com o relatório do sistema (que mostra R$ 1.635,23 e valores
//   entre R$ 70 e R$ 500 variando mês a mês, respectivamente) — mantive o valor da planilha.
export const connectData: ClientFinanceData = {
  // Bump 1 → 2: importação do Contas a Pagar recorrente de outubro a dezembro/2026, a partir da
  // planilha enviada pelo Ewerton, classificado com base no relatório do sistema.
  dataVersion: 2,
  deducoesManuais: {
    impostos: 0,
    inadimplencia: 0,
    investimentos: 0,
  },

  fluxoCaixaPeriodo: "—",
  fluxoCaixaKpis: {
    saldoInicial: 0,
    recebimentos: 0,
    pagamentos: 0,
    geracaoLiquida: 0,
    geracaoLiquidaPct: 0,
    saldoFinal: 0,
    crescimentoCaixa: 0,
  },
  faturamentoXRecebimentos: {
    faturamento: 0,
    recebido: 0,
    conversaoEmCaixa: 0,
    diferenca: 0,
  },
  maioresRecebimentos: [],
  maioresPagamentos: [],
  indicesFinanceiros: [
    { label: "Índice de geração de caixa", value: "—" },
    { label: "Índice de consumo de caixa", value: "—" },
    { label: "Conversão do faturamento", value: "—" },
    { label: "Variação do caixa no período", value: "—" },
  ],
  destaquesPeriodo: [],
  resumoExecutivo: ["Ainda não há lançamentos cadastrados para a Connect — os dados aparecem aqui assim que forem lançados."],
  pontoDeAtencao: "Sem lançamentos no período.",

  seedReceivables: [],

  seedPayables: [
  { id: "p1", favorecido: "PLANO DE SAUDE COLABORADORES", categoria: "Plano de Saúde", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-01", valor: 4570.33, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 4 da planilha
  { id: "p2", favorecido: "PLANO DE SAUDE COLABORADORES", categoria: "Plano de Saúde", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-01", valor: 4570.33, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 4 da planilha
  { id: "p3", favorecido: "PLANO DE SAUDE COLABORADORES", categoria: "Plano de Saúde", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-01", valor: 4570.33, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 4 da planilha
  { id: "p4", favorecido: "ALUGUEL OFFICE MORENO", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-01", valor: 200.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 5 da planilha
  { id: "p5", favorecido: "ALUGUEL OFFICE MORENO", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-01", valor: 200.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 5 da planilha
  { id: "p6", favorecido: "ALUGUEL OFFICE MORENO", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-01", valor: 200.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 5 da planilha
  { id: "p7", favorecido: "SALARIOS FOLHA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-04", valor: 16000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 7 da planilha
  { id: "p8", favorecido: "SALARIOS FOLHA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-04", valor: 16000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 7 da planilha
  { id: "p9", favorecido: "SALARIOS FOLHA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-04", valor: 16000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 7 da planilha
  { id: "p10", favorecido: "SALARIO HELTON + AJUDA DE CUSTO", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-04", valor: 2250.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 8 da planilha
  { id: "p11", favorecido: "SALARIO HELTON + AJUDA DE CUSTO", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-04", valor: 2250.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 8 da planilha
  { id: "p12", favorecido: "SALARIO HELTON + AJUDA DE CUSTO", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-04", valor: 2250.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 8 da planilha
  { id: "p13", favorecido: "SALARIO DE ALEXANDRE", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-04", valor: 1750.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 9 da planilha
  { id: "p14", favorecido: "SALARIO DE ALEXANDRE", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-04", valor: 1750.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 9 da planilha
  { id: "p15", favorecido: "SALARIO DE ALEXANDRE", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-04", valor: 1750.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 9 da planilha
  { id: "p16", favorecido: "SALARIO SANDRA 5100 + ALIMENTAÇÃO 400", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-04", valor: 2550.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 10 da planilha
  { id: "p17", favorecido: "SALARIO SANDRA 5100 + ALIMENTAÇÃO 400", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-04", valor: 2550.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 10 da planilha
  { id: "p18", favorecido: "SALARIO SANDRA 5100 + ALIMENTAÇÃO 400", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-04", valor: 2550.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 10 da planilha
  { id: "p19", favorecido: "CADEIRAS DOS ESCRITORIOS PE E PB (10x) — última em 05/07/2027", categoria: "Compra | Ativos Mobilizados", classificacao: "INVESTIMENTO", vencimento: "2026-10-05", valor: 624.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 11 da planilha
  { id: "p20", favorecido: "CADEIRAS DOS ESCRITORIOS PE E PB (10x) — última em 05/07/2027", categoria: "Compra | Ativos Mobilizados", classificacao: "INVESTIMENTO", vencimento: "2026-11-05", valor: 624.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 11 da planilha
  { id: "p21", favorecido: "CADEIRAS DOS ESCRITORIOS PE E PB (10x) — última em 05/07/2027", categoria: "Compra | Ativos Mobilizados", classificacao: "INVESTIMENTO", vencimento: "2026-12-05", valor: 624.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 11 da planilha
  { id: "p22", favorecido: "CONDOMINIO RATEIO AGUA E ENERGIA (RIO MAR)", categoria: "Condomínio", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-05", valor: 598.66, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 12 da planilha
  { id: "p23", favorecido: "CONDOMINIO RATEIO AGUA E ENERGIA (RIO MAR)", categoria: "Condomínio", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-05", valor: 598.66, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 12 da planilha
  { id: "p24", favorecido: "CONDOMINIO RATEIO AGUA E ENERGIA (RIO MAR)", categoria: "Condomínio", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-05", valor: 598.66, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 12 da planilha
  { id: "p25", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (1/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-05", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 1ª de 5 parcelas de consórcio listadas na planilha, em dias diferentes do mês — confirme se não é duplicidade." },  // linha 13 da planilha
  { id: "p26", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (1/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-05", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 1ª de 5 parcelas de consórcio listadas na planilha, em dias diferentes do mês — confirme se não é duplicidade." },  // linha 13 da planilha
  { id: "p27", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (1/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-05", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 1ª de 5 parcelas de consórcio listadas na planilha, em dias diferentes do mês — confirme se não é duplicidade." },  // linha 13 da planilha
  { id: "p28", favorecido: "INTERNET - SMARTLINK", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-05", valor: 139.9, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 14 da planilha
  { id: "p29", favorecido: "INTERNET - SMARTLINK", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-05", valor: 139.9, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 14 da planilha
  { id: "p30", favorecido: "INTERNET - SMARTLINK", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-05", valor: 139.9, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 14 da planilha
  { id: "p31", favorecido: "ADVOGADO", categoria: "Advogado / Jurídico", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-05", valor: 1000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 15 da planilha
  { id: "p32", favorecido: "ADVOGADO", categoria: "Advogado / Jurídico", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-05", valor: 1000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 15 da planilha
  { id: "p33", favorecido: "ADVOGADO", categoria: "Advogado / Jurídico", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-05", valor: 1000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 15 da planilha
  { id: "p34", favorecido: "AGUA", categoria: "Água e Esgoto", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-06", valor: 160.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 16 da planilha
  { id: "p35", favorecido: "AGUA", categoria: "Água e Esgoto", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-06", valor: 160.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 16 da planilha
  { id: "p36", favorecido: "AGUA", categoria: "Água e Esgoto", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-06", valor: 160.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 16 da planilha
  { id: "p37", favorecido: "REPOR - CERTIFICADO DIGITAL", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-07", valor: 2100.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Reclassificado pra Serviço Terceirizado (bate com 'REPORT CERTIFICADO DIGITAL LTDA' do relatório do sistema)." },  // linha 17 da planilha
  { id: "p38", favorecido: "REPOR - CERTIFICADO DIGITAL", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-07", valor: 2100.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Reclassificado pra Serviço Terceirizado (bate com 'REPORT CERTIFICADO DIGITAL LTDA' do relatório do sistema)." },  // linha 17 da planilha
  { id: "p39", favorecido: "REPOR - CERTIFICADO DIGITAL", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-07", valor: 2100.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Reclassificado pra Serviço Terceirizado (bate com 'REPORT CERTIFICADO DIGITAL LTDA' do relatório do sistema)." },  // linha 17 da planilha
  { id: "p40", favorecido: "CAPITAL DE GIRO / RESERVA DE EMERGÊNCIA", categoria: "Banco | Reserva de Emergência", classificacao: "INVESTIMENTO", vencimento: "2026-10-08", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 18 da planilha
  { id: "p41", favorecido: "CAPITAL DE GIRO / RESERVA DE EMERGÊNCIA", categoria: "Banco | Reserva de Emergência", classificacao: "INVESTIMENTO", vencimento: "2026-11-08", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 18 da planilha
  { id: "p42", favorecido: "CAPITAL DE GIRO / RESERVA DE EMERGÊNCIA", categoria: "Banco | Reserva de Emergência", classificacao: "INVESTIMENTO", vencimento: "2026-12-08", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 18 da planilha
  { id: "p43", favorecido: "HOSPEDAGEM ELTON, EWERTON E MARCOS (10-11/10)", categoria: "Despesas Eventuais", classificacao: "DESPESAS EVENTUAIS", vencimento: "2026-10-10", valor: 318.24, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Viagem pontual de outubro — não recorrente." },  // linha 19 da planilha
  { id: "p44", favorecido: "FATURA VIVO (INTERNET DE VERONICA)", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-10", valor: 85.88, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 20 da planilha
  { id: "p45", favorecido: "FATURA VIVO (INTERNET DE VERONICA)", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-10", valor: 85.88, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 20 da planilha
  { id: "p46", favorecido: "FATURA VIVO (INTERNET DE VERONICA)", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-10", valor: 85.88, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 20 da planilha
  { id: "p47", favorecido: "FATURA VIVO (CELULAR DE VERONICA)", categoria: "Telefonia", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-10", valor: 60.32, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 21 da planilha
  { id: "p48", favorecido: "FATURA VIVO (CELULAR DE VERONICA)", categoria: "Telefonia", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-10", valor: 60.32, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 21 da planilha
  { id: "p49", favorecido: "FATURA VIVO (CELULAR DE VERONICA)", categoria: "Telefonia", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-10", valor: 60.32, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 21 da planilha
  { id: "p50", favorecido: "SILZANDRA LIMPEZA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-10", valor: 1400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 22 da planilha
  { id: "p51", favorecido: "SILZANDRA LIMPEZA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-10", valor: 1400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 22 da planilha
  { id: "p52", favorecido: "SILZANDRA LIMPEZA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-10", valor: 1400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 22 da planilha
  { id: "p53", favorecido: "SISTEMA FINANCEIRO OXC", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-10", valor: 644.48, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 23 da planilha
  { id: "p54", favorecido: "SISTEMA FINANCEIRO OXC", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-10", valor: 644.48, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 23 da planilha
  { id: "p55", favorecido: "SISTEMA FINANCEIRO OXC", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-10", valor: 644.48, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 23 da planilha
  { id: "p56", favorecido: "SEGURO EMPRESA - RC PROFISSIONAL (última em 03/2027)", categoria: "Seguros", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-10", valor: 1232.77, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 25 da planilha
  { id: "p57", favorecido: "SEGURO EMPRESA - RC PROFISSIONAL (última em 03/2027)", categoria: "Seguros", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-10", valor: 1232.77, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 25 da planilha
  { id: "p58", favorecido: "SEGURO EMPRESA - RC PROFISSIONAL (última em 03/2027)", categoria: "Seguros", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-10", valor: 1232.77, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 25 da planilha
  { id: "p59", favorecido: "ALUGUEL RICAVI", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-10", valor: 500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 26 da planilha
  { id: "p60", favorecido: "ALUGUEL RICAVI", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-10", valor: 500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 26 da planilha
  { id: "p61", favorecido: "ALUGUEL RICAVI", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-10", valor: 500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 26 da planilha
  { id: "p62", favorecido: "SISTEMA DOMINIO", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-10", valor: 2613.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 27 da planilha
  { id: "p63", favorecido: "SISTEMA DOMINIO", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-10", valor: 2613.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 27 da planilha
  { id: "p64", favorecido: "SISTEMA DOMINIO", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-10", valor: 2613.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 27 da planilha
  { id: "p65", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (2/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-11", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 2ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 28 da planilha
  { id: "p66", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (2/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-11", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 2ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 28 da planilha
  { id: "p67", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (2/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-11", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 2ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 28 da planilha
  { id: "p68", favorecido: "JOÃO PRO LABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-12", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 29 da planilha
  { id: "p69", favorecido: "JOÃO PRO LABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-12", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 29 da planilha
  { id: "p70", favorecido: "JOÃO PRO LABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-12", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 29 da planilha
  { id: "p71", favorecido: "ELTON TAVARES - PROLABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-12", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 30 da planilha
  { id: "p72", favorecido: "ELTON TAVARES - PROLABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-12", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 30 da planilha
  { id: "p73", favorecido: "ELTON TAVARES - PROLABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-12", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 30 da planilha
  { id: "p74", favorecido: "LIMPEZA ESCRITORIO PEDRAS DE FOGO", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-12", valor: 40.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 31 da planilha
  { id: "p75", favorecido: "LIMPEZA ESCRITORIO PEDRAS DE FOGO", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-12", valor: 40.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 31 da planilha
  { id: "p76", favorecido: "LIMPEZA ESCRITORIO PEDRAS DE FOGO", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-12", valor: 40.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 31 da planilha
  { id: "p77", favorecido: "ALUGUEL M4", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-12", valor: 1000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 32 da planilha
  { id: "p78", favorecido: "ALUGUEL M4", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-12", valor: 1000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 32 da planilha
  { id: "p79", favorecido: "ALUGUEL M4", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-12", valor: 1000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 32 da planilha
  { id: "p80", favorecido: "CARTÃO VINICIUS (10x) — última em 07/2027", categoria: "Cartão de Crédito", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-12", valor: 412.8, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 33 da planilha
  { id: "p81", favorecido: "CARTÃO VINICIUS (10x) — última em 07/2027", categoria: "Cartão de Crédito", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-12", valor: 412.8, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 33 da planilha
  { id: "p82", favorecido: "CARTÃO VINICIUS (10x) — última em 07/2027", categoria: "Cartão de Crédito", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-12", valor: 412.8, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 33 da planilha
  { id: "p83", favorecido: "CAPITAL DE GIRO / RESERVA DE EMERGÊNCIA", categoria: "Banco | Reserva de Emergência", classificacao: "INVESTIMENTO", vencimento: "2026-10-14", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 34 da planilha
  { id: "p84", favorecido: "CAPITAL DE GIRO / RESERVA DE EMERGÊNCIA", categoria: "Banco | Reserva de Emergência", classificacao: "INVESTIMENTO", vencimento: "2026-11-14", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 34 da planilha
  { id: "p85", favorecido: "CAPITAL DE GIRO / RESERVA DE EMERGÊNCIA", categoria: "Banco | Reserva de Emergência", classificacao: "INVESTIMENTO", vencimento: "2026-12-14", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 34 da planilha
  { id: "p86", favorecido: "SISTEMA NOTION (valor em dólar, pode variar)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-14", valor: 150.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Valor em dólar — pode variar mês a mês." },  // linha 36 da planilha
  { id: "p87", favorecido: "SISTEMA NOTION (valor em dólar, pode variar)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-14", valor: 150.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Valor em dólar — pode variar mês a mês." },  // linha 36 da planilha
  { id: "p88", favorecido: "SISTEMA NOTION (valor em dólar, pode variar)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-14", valor: 150.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Valor em dólar — pode variar mês a mês." },  // linha 36 da planilha
  { id: "p89", favorecido: "ECONET", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-15", valor: 99.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 37 da planilha
  { id: "p90", favorecido: "ECONET", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-15", valor: 99.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 37 da planilha
  { id: "p91", favorecido: "ECONET", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-15", valor: 99.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 37 da planilha
  { id: "p92", favorecido: "ECONET", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-15", valor: 837.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 38 da planilha
  { id: "p93", favorecido: "ECONET", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-15", valor: 837.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 38 da planilha
  { id: "p94", favorecido: "ECONET", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-15", valor: 837.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 38 da planilha
  { id: "p95", favorecido: "INSTALAÇÃO CAMERAS E EQUIP. DE SEGURANÇA NO RIO MAR (última em dezembro)", categoria: "Compra | Ativos Mobilizados", classificacao: "INVESTIMENTO", vencimento: "2026-10-15", valor: 1144.2, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 39 da planilha
  { id: "p96", favorecido: "INSTALAÇÃO CAMERAS E EQUIP. DE SEGURANÇA NO RIO MAR (última em dezembro)", categoria: "Compra | Ativos Mobilizados", classificacao: "INVESTIMENTO", vencimento: "2026-11-15", valor: 1144.2, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 39 da planilha
  { id: "p97", favorecido: "INSTALAÇÃO CAMERAS E EQUIP. DE SEGURANÇA NO RIO MAR (última em dezembro)", categoria: "Compra | Ativos Mobilizados", classificacao: "INVESTIMENTO", vencimento: "2026-12-15", valor: 1144.2, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 39 da planilha
  { id: "p98", favorecido: "PLANO ODONTOLOGICO EQUIPE - UNIDENTS", categoria: "Plano de Saúde", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-15", valor: 198.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 40 da planilha
  { id: "p99", favorecido: "PLANO ODONTOLOGICO EQUIPE - UNIDENTS", categoria: "Plano de Saúde", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-15", valor: 198.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 40 da planilha
  { id: "p100", favorecido: "PLANO ODONTOLOGICO EQUIPE - UNIDENTS", categoria: "Plano de Saúde", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-15", valor: 198.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 40 da planilha
  { id: "p101", favorecido: "ADIANTAMENTO FUNCIONARIOS", categoria: "Adiantamento de Funcionários", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-15", valor: 24000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 42 da planilha
  { id: "p102", favorecido: "ADIANTAMENTO FUNCIONARIOS", categoria: "Adiantamento de Funcionários", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-15", valor: 24000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 42 da planilha
  { id: "p103", favorecido: "ADIANTAMENTO FUNCIONARIOS", categoria: "Adiantamento de Funcionários", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-15", valor: 24000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 42 da planilha
  { id: "p104", favorecido: "ENERGIA FLAT SANDRA", categoria: "Energia Elétrica", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-16", valor: 82.98, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 43 da planilha
  { id: "p105", favorecido: "ENERGIA FLAT SANDRA", categoria: "Energia Elétrica", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-16", valor: 82.98, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 43 da planilha
  { id: "p106", favorecido: "ENERGIA FLAT SANDRA", categoria: "Energia Elétrica", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-16", valor: 82.98, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 43 da planilha
  { id: "p107", favorecido: "BRUNA - AUXILIO NAS FOLHAS E DP", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-16", valor: 150.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 44 da planilha
  { id: "p108", favorecido: "BRUNA - AUXILIO NAS FOLHAS E DP", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-16", valor: 150.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 44 da planilha
  { id: "p109", favorecido: "BRUNA - AUXILIO NAS FOLHAS E DP", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-16", valor: 150.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 44 da planilha
  { id: "p110", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (3/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-17", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 3ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 45 da planilha
  { id: "p111", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (3/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-17", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 3ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 45 da planilha
  { id: "p112", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (3/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-17", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 3ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 45 da planilha
  { id: "p113", favorecido: "FATURA VIVO - CONNECT", categoria: "Telefonia e Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-18", valor: 1100.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 46 da planilha
  { id: "p114", favorecido: "FATURA VIVO - CONNECT", categoria: "Telefonia e Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-18", valor: 1100.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 46 da planilha
  { id: "p115", favorecido: "FATURA VIVO - CONNECT", categoria: "Telefonia e Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-18", valor: 1100.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 46 da planilha
  { id: "p116", favorecido: "HOSPEDAGEM ELTON, MARCOS E VINICIUS RECIFE (20/10)", categoria: "Despesas Eventuais", classificacao: "DESPESAS EVENTUAIS", vencimento: "2026-10-20", valor: 652.98, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Viagem pontual de outubro — não recorrente." },  // linha 47 da planilha
  { id: "p117", favorecido: "SISTEMA ACESSORIES", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-20", valor: 1446.23, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Valor um pouco diferente do relatório do sistema (R$1.635,23) — confirme." },  // linha 48 da planilha
  { id: "p118", favorecido: "SISTEMA ACESSORIES", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-20", valor: 1446.23, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Valor um pouco diferente do relatório do sistema (R$1.635,23) — confirme." },  // linha 48 da planilha
  { id: "p119", favorecido: "SISTEMA ACESSORIES", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-20", valor: 1446.23, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Valor um pouco diferente do relatório do sistema (R$1.635,23) — confirme." },  // linha 48 da planilha
  { id: "p120", favorecido: "LIMPEZA ESCRITORIO PEDRAS DE FOGO", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-20", valor: 40.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 49 da planilha
  { id: "p121", favorecido: "LIMPEZA ESCRITORIO PEDRAS DE FOGO", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-20", valor: 40.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 49 da planilha
  { id: "p122", favorecido: "LIMPEZA ESCRITORIO PEDRAS DE FOGO", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-20", valor: 40.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 49 da planilha
  { id: "p123", favorecido: "FGTS", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-20", valor: 3100.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 50 da planilha
  { id: "p124", favorecido: "FGTS", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-20", valor: 3100.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 50 da planilha
  { id: "p125", favorecido: "FGTS", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-20", valor: 3100.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 50 da planilha
  { id: "p126", favorecido: "INSS", categoria: "INSS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-20", valor: 1850.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 51 da planilha
  { id: "p127", favorecido: "INSS", categoria: "INSS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-20", valor: 1850.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 51 da planilha
  { id: "p128", favorecido: "INSS", categoria: "INSS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-20", valor: 1850.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 51 da planilha
  { id: "p129", favorecido: "SISTEMA SIEG", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-20", valor: 5348.15, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 53 da planilha
  { id: "p130", favorecido: "SISTEMA SIEG", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-20", valor: 5348.15, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 53 da planilha
  { id: "p131", favorecido: "SISTEMA SIEG", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-20", valor: 5348.15, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 53 da planilha
  { id: "p132", favorecido: "IMPOSTOS RCA DAGS", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-10-20", valor: 4500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 54 da planilha
  { id: "p133", favorecido: "IMPOSTOS RCA DAGS", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-11-20", valor: 4500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 54 da planilha
  { id: "p134", favorecido: "IMPOSTOS RCA DAGS", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-12-20", valor: 4500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 54 da planilha
  { id: "p135", favorecido: "SISTEMA ST - SITTAX (mensalidade)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-20", valor: 522.24, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 55 da planilha
  { id: "p136", favorecido: "SISTEMA ST - SITTAX (mensalidade)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-20", valor: 522.24, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 55 da planilha
  { id: "p137", favorecido: "SISTEMA ST - SITTAX (mensalidade)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-20", valor: 522.24, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 55 da planilha
  { id: "p138", favorecido: "SISTEMA SECUPERA - SITTAX (mensalidade)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-20", valor: 299.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 56 da planilha
  { id: "p139", favorecido: "SISTEMA SECUPERA - SITTAX (mensalidade)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-20", valor: 299.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 56 da planilha
  { id: "p140", favorecido: "SISTEMA SECUPERA - SITTAX (mensalidade)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-20", valor: 299.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 56 da planilha
  { id: "p141", favorecido: "SISTEMA SITTAX (mensalidade)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-20", valor: 1500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 58 da planilha
  { id: "p142", favorecido: "SISTEMA SITTAX (mensalidade)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-20", valor: 1500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 58 da planilha
  { id: "p143", favorecido: "SISTEMA SITTAX (mensalidade)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-20", valor: 1500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 58 da planilha
  { id: "p144", favorecido: "VIVO INTERNET (VIVO FIXO - VIVO MARCOS)", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-21", valor: 281.75, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 60 da planilha
  { id: "p145", favorecido: "VIVO INTERNET (VIVO FIXO - VIVO MARCOS)", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-21", valor: 281.75, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 60 da planilha
  { id: "p146", favorecido: "VIVO INTERNET (VIVO FIXO - VIVO MARCOS)", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-21", valor: 281.75, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 60 da planilha
  { id: "p147", favorecido: "FERIAS DE RENATA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-21", valor: 2307.11, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Pagamento de férias — tratado como pontual (outubro); confirme se deve repetir em novembro/dezembro." },  // linha 61 da planilha
  { id: "p148", favorecido: "DEVOLUÇÃO VALORES CONNECT E-COMMERCE (parcela 3/17)", categoria: "Repasses / Acertos Societários", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-21", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Acerto entre sócios com a Connect Ecommerce — confirme numeração das parcelas restantes." },  // linha 63 da planilha
  { id: "p149", favorecido: "DEVOLUÇÃO VALORES CONNECT E-COMMERCE (parcela 3/17)", categoria: "Repasses / Acertos Societários", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-21", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Acerto entre sócios com a Connect Ecommerce — confirme numeração das parcelas restantes." },  // linha 63 da planilha
  { id: "p150", favorecido: "DEVOLUÇÃO VALORES CONNECT E-COMMERCE (parcela 3/17)", categoria: "Repasses / Acertos Societários", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-21", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Acerto entre sócios com a Connect Ecommerce — confirme numeração das parcelas restantes." },  // linha 63 da planilha
  { id: "p151", favorecido: "CARTÃO CONNECT", categoria: "Cartão de Crédito", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-22", valor: 5500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 64 da planilha
  { id: "p152", favorecido: "CARTÃO CONNECT", categoria: "Cartão de Crédito", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-22", valor: 5500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 64 da planilha
  { id: "p153", favorecido: "CARTÃO CONNECT", categoria: "Cartão de Crédito", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-22", valor: 5500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 64 da planilha
  { id: "p154", favorecido: "COMISSÃO HELTON MATHEUS", categoria: "Comissões de Vendas", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-22", valor: 951.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 65 da planilha
  { id: "p155", favorecido: "COMISSÃO HELTON MATHEUS", categoria: "Comissões de Vendas", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-22", valor: 951.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 65 da planilha
  { id: "p156", favorecido: "COMISSÃO HELTON MATHEUS", categoria: "Comissões de Vendas", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-22", valor: 951.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 65 da planilha
  { id: "p157", favorecido: "COMISSÃO PAULINHO", categoria: "Comissões de Vendas", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-22", valor: 2300.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 66 da planilha
  { id: "p158", favorecido: "COMISSÃO PAULINHO", categoria: "Comissões de Vendas", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-22", valor: 2300.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 66 da planilha
  { id: "p159", favorecido: "COMISSÃO PAULINHO", categoria: "Comissões de Vendas", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-22", valor: 2300.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 66 da planilha
  { id: "p160", favorecido: "JOÃO PRO LABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-22", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 67 da planilha
  { id: "p161", favorecido: "JOÃO PRO LABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-22", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 67 da planilha
  { id: "p162", favorecido: "JOÃO PRO LABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-22", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 67 da planilha
  { id: "p163", favorecido: "ELTON TAVARES - PROLABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-22", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 68 da planilha
  { id: "p164", favorecido: "ELTON TAVARES - PROLABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-22", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 68 da planilha
  { id: "p165", favorecido: "ELTON TAVARES - PROLABORE", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-22", valor: 7500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 68 da planilha
  { id: "p166", favorecido: "BOLETO CLOUD - SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-25", valor: 678.71, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 69 da planilha
  { id: "p167", favorecido: "BOLETO CLOUD - SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-25", valor: 678.71, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 69 da planilha
  { id: "p168", favorecido: "BOLETO CLOUD - SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-25", valor: 678.71, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 69 da planilha
  { id: "p169", favorecido: "PAGAMENTO CONTABILIDADE - PROBLEMA RENAN SSK (24/10, 2ª de 2)", categoria: "Contabilidade", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-24", valor: 10000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 2ª e última parcela (1ª foi em setembro) — só outubro." },  // linha 70 da planilha
  { id: "p170", favorecido: "HOSPEDAGEM ELTON E MARCOS (25/10)", categoria: "Despesas Eventuais", classificacao: "DESPESAS EVENTUAIS", vencimento: "2026-10-25", valor: 177.91, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Viagem pontual de outubro — não recorrente." },  // linha 71 da planilha
  { id: "p171", favorecido: "SCI SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-25", valor: 1118.11, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 72 da planilha
  { id: "p172", favorecido: "SCI SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-25", valor: 1118.11, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 72 da planilha
  { id: "p173", favorecido: "SCI SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-25", valor: 1118.11, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 72 da planilha
  { id: "p174", favorecido: "INTERNET - CONNECT (BAYEUX)", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-25", valor: 99.9, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 73 da planilha
  { id: "p175", favorecido: "INTERNET - CONNECT (BAYEUX)", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-25", valor: 99.9, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 73 da planilha
  { id: "p176", favorecido: "INTERNET - CONNECT (BAYEUX)", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-25", valor: 99.9, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 73 da planilha
  { id: "p177", favorecido: "INTERNET - UMTELECOM", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-25", valor: 199.99, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 74 da planilha
  { id: "p178", favorecido: "INTERNET - UMTELECOM", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-25", valor: 199.99, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 74 da planilha
  { id: "p179", favorecido: "INTERNET - UMTELECOM", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-25", valor: 199.99, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 74 da planilha
  { id: "p180", favorecido: "SISTEMAS DIGISAT (TERCEIRIZAÇÃO)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-25", valor: 1370.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 75 da planilha
  { id: "p181", favorecido: "SISTEMAS DIGISAT (TERCEIRIZAÇÃO)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-25", valor: 1370.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 75 da planilha
  { id: "p182", favorecido: "SISTEMAS DIGISAT (TERCEIRIZAÇÃO)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-25", valor: 1370.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 75 da planilha
  { id: "p183", favorecido: "REPASSE FATURAMENTO CONNECT E-COMMERCE - SOCIOS", categoria: "Repasses / Acertos Societários", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-24", valor: 8500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Repasse entre sócios — confirme se é recorrente nesse valor." },  // linha 76 da planilha
  { id: "p184", favorecido: "REPASSE FATURAMENTO CONNECT E-COMMERCE - SOCIOS", categoria: "Repasses / Acertos Societários", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-24", valor: 8500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Repasse entre sócios — confirme se é recorrente nesse valor." },  // linha 76 da planilha
  { id: "p185", favorecido: "REPASSE FATURAMENTO CONNECT E-COMMERCE - SOCIOS", categoria: "Repasses / Acertos Societários", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-24", valor: 8500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Repasse entre sócios — confirme se é recorrente nesse valor." },  // linha 76 da planilha
  { id: "p186", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (4/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-26", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 4ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 77 da planilha
  { id: "p187", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (4/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-26", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 4ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 77 da planilha
  { id: "p188", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (4/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-26", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 4ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 77 da planilha
  { id: "p189", favorecido: "LIMPEZA RICAVI", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-26", valor: 40.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 78 da planilha
  { id: "p190", favorecido: "LIMPEZA RICAVI", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-26", valor: 40.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 78 da planilha
  { id: "p191", favorecido: "LIMPEZA RICAVI", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-26", valor: 40.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 78 da planilha
  { id: "p192", favorecido: "FATURA CLARO - ESCRITORIO ITABAIANA", categoria: "Telefonia", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-26", valor: 37.97, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 79 da planilha
  { id: "p193", favorecido: "FATURA CLARO - ESCRITORIO ITABAIANA", categoria: "Telefonia", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-26", valor: 37.97, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 79 da planilha
  { id: "p194", favorecido: "FATURA CLARO - ESCRITORIO ITABAIANA", categoria: "Telefonia", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-26", valor: 37.97, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 79 da planilha
  { id: "p195", favorecido: "NEOENERGIA - RICAVI", categoria: "Energia Elétrica", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-27", valor: 256.34, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 80 da planilha
  { id: "p196", favorecido: "NEOENERGIA - RICAVI", categoria: "Energia Elétrica", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-27", valor: 256.34, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 80 da planilha
  { id: "p197", favorecido: "NEOENERGIA - RICAVI", categoria: "Energia Elétrica", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-27", valor: 256.34, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 80 da planilha
  { id: "p198", favorecido: "ENDEREÇO FISCAL - PEDRAS DE FOGO", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-27", valor: 65.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 82 da planilha
  { id: "p199", favorecido: "ENDEREÇO FISCAL - PEDRAS DE FOGO", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-27", valor: 65.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 82 da planilha
  { id: "p200", favorecido: "ENDEREÇO FISCAL - PEDRAS DE FOGO", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-27", valor: 65.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 82 da planilha
  { id: "p201", favorecido: "PARCELAMENTO CONNECT - DAS EM ABERTO", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-10-27", valor: 316.63, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 83 da planilha
  { id: "p202", favorecido: "PARCELAMENTO CONNECT - DAS EM ABERTO", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-11-27", valor: 316.63, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 83 da planilha
  { id: "p203", favorecido: "PARCELAMENTO CONNECT - DAS EM ABERTO", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-12-27", valor: 316.63, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 83 da planilha
  { id: "p204", favorecido: "PARCELAMENTO FGTS (entrada + 34x de 181,72, 1ª em abril/2026)", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-26", valor: 181.72, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 84 da planilha
  { id: "p205", favorecido: "PARCELAMENTO FGTS (entrada + 34x de 181,72, 1ª em abril/2026)", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-26", valor: 181.72, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 84 da planilha
  { id: "p206", favorecido: "PARCELAMENTO FGTS (entrada + 34x de 181,72, 1ª em abril/2026)", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-26", valor: 181.72, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 84 da planilha
  { id: "p207", favorecido: "DEVOLUÇÃO VALORES CONNECT E-COMMERCE (parcela 4/17)", categoria: "Repasses / Acertos Societários", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-28", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Outra série de acerto com a Connect Ecommerce, numerada separado da linha 63 — confirme se não é duplicidade." },  // linha 85 da planilha
  { id: "p208", favorecido: "DEVOLUÇÃO VALORES CONNECT E-COMMERCE (parcela 4/17)", categoria: "Repasses / Acertos Societários", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-28", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Outra série de acerto com a Connect Ecommerce, numerada separado da linha 63 — confirme se não é duplicidade." },  // linha 85 da planilha
  { id: "p209", favorecido: "DEVOLUÇÃO VALORES CONNECT E-COMMERCE (parcela 4/17)", categoria: "Repasses / Acertos Societários", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-28", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Outra série de acerto com a Connect Ecommerce, numerada separado da linha 63 — confirme se não é duplicidade." },  // linha 85 da planilha
  { id: "p210", favorecido: "MULTAS CRIATIVAEDU (3x — 28/09 R$2.284,09, 28/10 e 28/11 R$2.500,00)", categoria: "Multas / Taxas", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-28", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Série de 3 parcelas: 1ª (set) já paga; restam out e nov, sem parcela em dezembro." },  // linha 86 da planilha
  { id: "p211", favorecido: "MULTAS CRIATIVAEDU (3x — 28/09 R$2.284,09, 28/10 e 28/11 R$2.500,00)", categoria: "Multas / Taxas", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-28", valor: 2500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Série de 3 parcelas: 1ª (set) já paga; restam out e nov, sem parcela em dezembro." },  // linha 86 da planilha
  { id: "p212", favorecido: "ALUGUEL", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-28", valor: 9500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 87 da planilha
  { id: "p213", favorecido: "ALUGUEL", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-28", valor: 9500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 87 da planilha
  { id: "p214", favorecido: "ALUGUEL", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-28", valor: 9500.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 87 da planilha
  { id: "p215", favorecido: "INTERNET - ESCRITORIO ITABAIANA", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-28", valor: 60.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 88 da planilha
  { id: "p216", favorecido: "INTERNET - ESCRITORIO ITABAIANA", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-28", valor: 60.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 88 da planilha
  { id: "p217", favorecido: "INTERNET - ESCRITORIO ITABAIANA", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-28", valor: 60.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 88 da planilha
  { id: "p218", favorecido: "HOSTGATOR - CONNECT (e-mails)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-28", valor: 449.79, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Valor varia bastante mês a mês no relatório do sistema (R$70 a R$500) — confirme." },  // linha 89 da planilha
  { id: "p219", favorecido: "HOSTGATOR - CONNECT (e-mails)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-28", valor: 449.79, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Valor varia bastante mês a mês no relatório do sistema (R$70 a R$500) — confirme." },  // linha 89 da planilha
  { id: "p220", favorecido: "HOSTGATOR - CONNECT (e-mails)", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-28", valor: 449.79, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — Valor varia bastante mês a mês no relatório do sistema (R$70 a R$500) — confirme." },  // linha 89 da planilha
  { id: "p221", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (5/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-30", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 5ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 90 da planilha
  { id: "p222", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (5/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-30", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 5ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 90 da planilha
  { id: "p223", favorecido: "PARCELAMENTO VALOR DO CONSORCIO (5/5)", categoria: "Consórcio", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-30", valor: 3400.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect) — 5ª de 5 parcelas de consórcio — confirme se não é duplicidade." },  // linha 90 da planilha
  { id: "p224", favorecido: "SISTEMA DE PONTO - CONNECT", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-30", valor: 149.9, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 91 da planilha
  { id: "p225", favorecido: "SISTEMA DE PONTO - CONNECT", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-30", valor: 149.9, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 91 da planilha
  { id: "p226", favorecido: "SISTEMA DE PONTO - CONNECT", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-30", valor: 149.9, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 91 da planilha
  { id: "p227", favorecido: "VALE TRANSPORTE", categoria: "Vale Transporte", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-30", valor: 1000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 92 da planilha
  { id: "p228", favorecido: "VALE TRANSPORTE", categoria: "Vale Transporte", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-30", valor: 1000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 92 da planilha
  { id: "p229", favorecido: "VALE TRANSPORTE", categoria: "Vale Transporte", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-30", valor: 1000.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 92 da planilha
  { id: "p230", favorecido: "VALE ALIMENTAÇÃO COLABORADORES", categoria: "Vale Alimentação", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-30", valor: 6300.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 93 da planilha
  { id: "p231", favorecido: "VALE ALIMENTAÇÃO COLABORADORES", categoria: "Vale Alimentação", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-30", valor: 6300.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 93 da planilha
  { id: "p232", favorecido: "VALE ALIMENTAÇÃO COLABORADORES", categoria: "Vale Alimentação", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-30", valor: 6300.0, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 93 da planilha
  { id: "p233", favorecido: "PARC SIMPLES NACIONAL CONNECT (débito automático)", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-10-30", valor: 309.94, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 94 da planilha
  { id: "p234", favorecido: "PARC SIMPLES NACIONAL CONNECT (débito automático)", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-11-30", valor: 309.94, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 94 da planilha
  { id: "p235", favorecido: "PARC SIMPLES NACIONAL CONNECT (débito automático)", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-12-30", valor: 309.94, status: "pendente", descricao: "Despesa recorrente mensal (planilha Contas a Pagar Connect)" },  // linha 94 da planilha
  ],

  seedCategoriasPagar: [
    {
      classificacao: "DESPESAS C/ PESSOAS",
      color: "#a78bfa",
      padrao: true,
      categorias: [
        { nome: "Salário", padrao: true },
        { nome: "Pró-Labore", padrao: true },
        { nome: "Comissões de Vendas", padrao: true },
        { nome: "Vale Transporte", padrao: true },
        { nome: "INSS", padrao: true },
        { nome: "FGTS", padrao: true },
        { nome: "Serviço Terceirizado", padrao: true },
        { nome: "Plano de Saúde", padrao: true },
        { nome: "Vale Alimentação", padrao: true },
        { nome: "Adiantamento de Funcionários", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS ADMINISTRATIVAS",
      color: "#5b93fd",
      padrao: true,
      categorias: [
        { nome: "Aluguel", padrao: true },
        { nome: "Contabilidade", padrao: true },
        { nome: "Energia Elétrica", padrao: true },
        { nome: "Internet", padrao: true },
        { nome: "Telefonia", padrao: true },
        { nome: "Sistemas", padrao: true },
        { nome: "Telefonia e Internet", padrao: true },
        { nome: "Água e Esgoto", padrao: true },
        { nome: "Condomínio", padrao: true },
        { nome: "Seguros", padrao: true },
        { nome: "Advogado / Jurídico", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS FINANCEIRAS",
      color: "#f2665c",
      padrao: true,
      categorias: [
        { nome: "Tarifas Bancárias", padrao: true },
        { nome: "Tarifas de Maquininhas", padrao: true },
        { nome: "Multas / Taxas", padrao: true },
        { nome: "Consórcio", padrao: true },
        { nome: "Cartão de Crédito", padrao: true },
        { nome: "Repasses / Acertos Societários", padrao: true },
      ],
    },
    {
      classificacao: "CMV",
      color: "#22d3a0",
      padrao: true,
      categorias: [
        { nome: "Custo sobre Mercadorias Vendidas", padrao: true },
        { nome: "CSV (Custos sobre Serviços)", padrao: true },
      ],
    },
    {
      classificacao: "CUSTOS VARIAVEIS",
      color: "#fb923c",
      padrao: true,
      categorias: [
        { nome: "Pagamentos a Fornecedores", padrao: true },
      ],
    },
    {
      classificacao: "IMPOSTOS",
      color: "#f5c344",
      padrao: true,
      categorias: [
        { nome: "Imposto (Simples Nacional)", padrao: true },
        { nome: "ICMS", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS LOGISTICAS",
      color: "#38bdf8",
      padrao: true,
      categorias: [
        { nome: "Frete", padrao: true },
        { nome: "Combustível", padrao: true },
        { nome: "Manutenção de Veículos", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS COMERCIAIS / MARKETING",
      color: "#f472b6",
      padrao: true,
      categorias: [
        { nome: "Marketing", padrao: true },
        { nome: "Comercial", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS EVENTUAIS",
      color: "#94a3b8",
      padrao: true,
      categorias: [
        { nome: "Material de Escritório", padrao: true },
        { nome: "Uso e Consumo", padrao: true },
        { nome: "Manutenção de Equipamentos", padrao: true },
        { nome: "Despesas Eventuais", padrao: true },
      ],
    },
    {
      classificacao: "INVESTIMENTO",
      color: "#4f8dfd",
      padrao: true,
      categorias: [
        { nome: "Banco | Reserva de Emergência", padrao: true },
        { nome: "Nova Loja | Investimentos", padrao: true },
        { nome: "Compra | Ativos Mobilizados", padrao: true },
      ],
    },
  ],

  seedCategoriasReceber: [
    {
      classificacao: "Faturamento",
      color: "#22d3a0",
      padrao: true,
      categorias: [{ nome: "Faturamento Geral", padrao: true }],
    },
  ],
};
