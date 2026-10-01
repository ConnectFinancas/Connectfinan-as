import { ClientFinanceData } from "@/lib/types";

// Cliente novo: painel criado com a mesma estrutura da Thiago Bike/MJ Prime (mesmas
// classificações/categorias como modelo inicial). Contas a Pagar de Set-Dez/2026 importadas da
// planilha "Contas a Pagar MJ SHOES Set-Dez 2026" — projeção baseada no detalhamento de mai/2026
// do DRE (único mês preenchido), todas em aberto (vencimento futuro em relação a HOJE).
//
// Maio/2026 (seedPayables ids p90+ e seedReceivables): extraído linha a linha da aba
// "Detalhamento Mai2026" da planilha DRE_2026_-_M_J_SHOES, igual fizemos nos demais clientes.
// Pontos de atenção:
// - Pagamentos a fornecedor (bloco sem título/sem cabeçalho de seção no fim da aba, descrição
//   livre) entram em CMV / "Custo sobre Mercadorias Vendidas" — essa categoria é
//   intencionalmente excluída do DRE por competência (ver CUSTO_MERCADORIA_CATEGORIA em
//   derive.ts) pra não duplicar o CMV oficial (abaixo, em cmvManual); ficam visíveis em Contas a
//   Pagar e no Fluxo de Caixa normalmente. 5 lançamentos desse mesmo bloco (FIDC Multissetorial,
//   Master Giro Fomento x2, Mille-FIDC, Solus Fundo de Investimento) são fomento/factoring, não
//   compra de produto — fui para "DESPESAS FINANCEIRAS / Empréstimos e Antecipações". Alguns
//   favorecidos desse bloco (Miranda Cavalcanti de Andrade, Wolney Cavalcanti Silva, Valéria
//   Correia Carneiro Mello — mesmo nome de uma colaboradora da folha) têm valores altos ou
//   repetidos; classifiquei como CMV por padrão, mas vale confirmar com o Ewerton.
// - cmvManual (abaixo) usa o "CMV PRODUTOS" oficial da aba Ano 2026 (R$93.465,51) — não é a soma
//   dos pagamentos a fornecedor de maio (R$88.995,54 no Detalhamento), porque CMV é regime de
//   competência (o que foi vendido), não o que foi pago no mês; a diferença é normal.
// - 4 despesas estão na aba Ano 2026 mas sem lançamento individual no Detalhamento (Sistemas
//   R$250, BPO Financeiro R$1.500, Contabilidade R$997, Taxas Maquinetas R$287,99) — lancei
//   essas com vencimento 01/05 e descrição avisando a origem.
// - IMPOSTOS entra como despesa normal do DRE (como em todos os outros clientes) — na planilha
//   original o "VALOR A GASTAR"/"GERAÇÃO DE CAIXA" da aba Ano 2026 não desconta Impostos (parece
//   lacuna na fórmula da planilha deles), então o resultado final aqui fica menor que o de lá.
export const mjShoesData: ClientFinanceData = {
  // Bump 2 → 6: nome completo no favorecido da folha (Lucas/July/Valéria/Thamy), remoção dos
  // lançamentos futuros da Reylane (demitida), valor de Salário fixado em R$1.500,00 para
  // Lucas/July/Valéria/Thamires, remoção de todos os lançamentos de Complemento Salarial, e
  // construção do Contas a Pagar/Receber de maio/2026 a partir do Detalhamento da planilha DRE.
  dataVersion: 6,
  deducoesManuais: {
    impostos: 0,
    inadimplencia: 0,
    investimentos: 0,
  },
  // CMV oficial de maio/2026 (aba "Ano 2026" da planilha DRE) — ver nota acima sobre por que não
  // é a soma dos pagamentos a fornecedor do Detalhamento. Índice 0 = Jan, 4 = Maio, 11 = Dez.
  cmvManual: [0, 0, 0, 0, 93465.51, 0, 0, 0, 0, 0, 0, 0],

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
  resumoExecutivo: ["Ainda não há lançamentos cadastrados para a MJ Shoes — os dados aparecem aqui assim que forem lançados."],
  pontoDeAtencao: "Sem lançamentos no período.",

  seedReceivables: [
  { id: "r1", cliente: "Clientes da Loja", categoria: "Faturamento Geral", classificacao: "Faturamento", descricao: "Receita de vendas de maio/2026 — Pix", vencimento: "2026-05-31", valor: 108031.83, status: "recebido", recebimento: "2026-05-31", formaRecebimento: "Pix" },
  { id: "r2", cliente: "Clientes da Loja", categoria: "Faturamento Geral", classificacao: "Faturamento", descricao: "Receita de vendas de maio/2026 — Cartões", vencimento: "2026-05-31", valor: 236517.75, status: "recebido", recebimento: "2026-05-31", formaRecebimento: "Cartão" },
  { id: "r3", cliente: "Clientes da Loja", categoria: "Faturamento Geral", classificacao: "Faturamento", descricao: "Receita de vendas de maio/2026 — Dinheiro", vencimento: "2026-05-31", valor: 35391.50, status: "recebido", recebimento: "2026-05-31", formaRecebimento: "Dinheiro" },
  ],

  seedPayables: [
  { id: "p1", favorecido: "JOSENILDO LUCAS DA CRUZ SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-02", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p2", favorecido: "JULY ADILA GOMES DA SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p4", favorecido: "THAMIRES LUANA MACEDO VIANA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p5", favorecido: "VALÉRIA CORREIA CARNEIRO MELLO", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p7", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-05", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p9", favorecido: "SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-09-10", valor: 250.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p10", favorecido: "BANCO DO BRASIL", categoria: "Tarifas Bancárias", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-09-11", valor: 285.6, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p11", favorecido: "ALUGUEL", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-09-12", valor: 3500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p12", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-12", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p13", favorecido: "TIM", categoria: "Telefonia e Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-09-19", valor: 240.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p14", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-19", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p15", favorecido: "CONNECT SOLUÇÕES CONTÁBEIS", categoria: "BPO Financeiro", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-09-20", valor: 1500.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p16", favorecido: "CONNECT SOLUÇÕES CONTÁBEIS", categoria: "Contabilidade", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-09-20", valor: 997.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p17", favorecido: "CAIXA ECONÔMICA FEDERAL", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-20", valor: 259.36, status: "pendente", descricao: "Valor de maio" },
  { id: "p18", favorecido: "RECEITA FEDERAL", categoria: "INSS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-20", valor: 421.45, status: "pendente", descricao: "Valor de maio" },
  { id: "p19", favorecido: "RECEITA FEDERAL", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-09-20", valor: 28902.42, status: "pendente", descricao: "Valor de maio" },
  { id: "p20", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-09-26", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p21", favorecido: "SEFAZ PE", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-09-28", valor: 28886.71, status: "pendente", descricao: "Valor de maio. Confirmar se é antecipação mensal ou parcelamento" },
  { id: "p22", favorecido: "SEFAZ PE", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-09-29", valor: 15220.35, status: "pendente", descricao: "Valor de maio. Confirmar se é antecipação mensal ou parcelamento" },
  { id: "p23", favorecido: "JOSENILDO LUCAS DA CRUZ SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-02", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p24", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-03", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p25", favorecido: "JULY ADILA GOMES DA SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p27", favorecido: "THAMIRES LUANA MACEDO VIANA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p28", favorecido: "VALÉRIA CORREIA CARNEIRO MELLO", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p31", favorecido: "SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-10", valor: 250.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p32", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-10", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p33", favorecido: "BANCO DO BRASIL", categoria: "Tarifas Bancárias", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-10-11", valor: 285.6, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p34", favorecido: "ALUGUEL", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-12", valor: 3500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p35", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-17", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p36", favorecido: "TIM", categoria: "Telefonia e Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-19", valor: 240.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p37", favorecido: "CONNECT SOLUÇÕES CONTÁBEIS", categoria: "BPO Financeiro", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-20", valor: 1500.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p38", favorecido: "CONNECT SOLUÇÕES CONTÁBEIS", categoria: "Contabilidade", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-10-20", valor: 997.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p39", favorecido: "CAIXA ECONÔMICA FEDERAL", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-20", valor: 259.36, status: "pendente", descricao: "Valor de maio" },
  { id: "p40", favorecido: "RECEITA FEDERAL", categoria: "INSS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-20", valor: 421.45, status: "pendente", descricao: "Valor de maio" },
  { id: "p41", favorecido: "RECEITA FEDERAL", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-10-20", valor: 28902.42, status: "pendente", descricao: "Valor de maio" },
  { id: "p42", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-24", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p43", favorecido: "SEFAZ PE", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-10-28", valor: 28886.71, status: "pendente", descricao: "Valor de maio. Confirmar se é antecipação mensal ou parcelamento" },
  { id: "p44", favorecido: "SEFAZ PE", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-10-29", valor: 15220.35, status: "pendente", descricao: "Valor de maio. Confirmar se é antecipação mensal ou parcelamento" },
  { id: "p45", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-10-31", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p46", favorecido: "JOSENILDO LUCAS DA CRUZ SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-02", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p47", favorecido: "JULY ADILA GOMES DA SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p49", favorecido: "THAMIRES LUANA MACEDO VIANA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p50", favorecido: "VALÉRIA CORREIA CARNEIRO MELLO", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p53", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-07", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p54", favorecido: "SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-10", valor: 250.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p55", favorecido: "BANCO DO BRASIL", categoria: "Tarifas Bancárias", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-11-11", valor: 285.6, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p56", favorecido: "ALUGUEL", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-12", valor: 3500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p57", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-14", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p58", favorecido: "TIM", categoria: "Telefonia e Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-19", valor: 240.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p59", favorecido: "CONNECT SOLUÇÕES CONTÁBEIS", categoria: "BPO Financeiro", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-20", valor: 1500.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p60", favorecido: "CONNECT SOLUÇÕES CONTÁBEIS", categoria: "Contabilidade", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-11-20", valor: 997.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p61", favorecido: "CAIXA ECONÔMICA FEDERAL", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-20", valor: 259.36, status: "pendente", descricao: "Valor de maio" },
  { id: "p62", favorecido: "RECEITA FEDERAL", categoria: "INSS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-20", valor: 421.45, status: "pendente", descricao: "Valor de maio" },
  { id: "p63", favorecido: "RECEITA FEDERAL", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-11-20", valor: 28902.42, status: "pendente", descricao: "Valor de maio" },
  { id: "p64", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-21", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p65", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-11-28", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p66", favorecido: "SEFAZ PE", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-11-28", valor: 28886.71, status: "pendente", descricao: "Valor de maio. Confirmar se é antecipação mensal ou parcelamento" },
  { id: "p67", favorecido: "SEFAZ PE", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-11-29", valor: 15220.35, status: "pendente", descricao: "Valor de maio. Confirmar se é antecipação mensal ou parcelamento" },
  { id: "p68", favorecido: "JOSENILDO LUCAS DA CRUZ SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-02", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p69", favorecido: "JULY ADILA GOMES DA SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p71", favorecido: "THAMIRES LUANA MACEDO VIANA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p72", favorecido: "VALÉRIA CORREIA CARNEIRO MELLO", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-04", valor: 1500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p74", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-05", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p76", favorecido: "SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-10", valor: 250.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p77", favorecido: "BANCO DO BRASIL", categoria: "Tarifas Bancárias", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-12-11", valor: 285.6, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p78", favorecido: "ALUGUEL", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-12", valor: 3500.0, status: "pendente", descricao: "Pago em espécie" },
  { id: "p79", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-12", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p80", favorecido: "TIM", categoria: "Telefonia e Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-19", valor: 240.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p81", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-19", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p82", favorecido: "CONNECT SOLUÇÕES CONTÁBEIS", categoria: "BPO Financeiro", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-20", valor: 1500.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p83", favorecido: "CONNECT SOLUÇÕES CONTÁBEIS", categoria: "Contabilidade", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-12-20", valor: 997.0, status: "pendente", descricao: "Projeção Set-Dez/2026" },
  { id: "p84", favorecido: "CAIXA ECONÔMICA FEDERAL", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-20", valor: 259.36, status: "pendente", descricao: "Valor de maio" },
  { id: "p85", favorecido: "RECEITA FEDERAL", categoria: "INSS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-20", valor: 421.45, status: "pendente", descricao: "Valor de maio" },
  { id: "p86", favorecido: "RECEITA FEDERAL", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-12-20", valor: 28902.42, status: "pendente", descricao: "Valor de maio" },
  { id: "p87", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-12-26", valor: 50.0, status: "pendente", descricao: "Pago todo sábado em espécie" },
  { id: "p88", favorecido: "SEFAZ PE", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-12-28", valor: 28886.71, status: "pendente", descricao: "Valor de maio. Confirmar se é antecipação mensal ou parcelamento" },
  { id: "p89", favorecido: "SEFAZ PE", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-12-29", valor: 15220.35, status: "pendente", descricao: "Valor de maio. Confirmar se é antecipação mensal ou parcelamento" },


  // --- Maio/2026: extraído do Detalhamento Mai2026 da planilha DRE_2026_-_M_J_SHOES ---
  { id: "p90", favorecido: "RECEITA FEDERAL", categoria: "Imposto (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-05-20", valor: 28902.42, status: "pago", pagamento: "2026-05-20", descricao: "SIMPLES NACIONAL (maio/2026)" },
  { id: "p91", favorecido: "RECEITA FEDERAL", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-05-28", valor: 28886.71, status: "pago", pagamento: "2026-05-28", descricao: "ICMS DIV E-FISCO (maio/2026)" },
  { id: "p92", favorecido: "RECEITA FEDERAL", categoria: "ICMS", classificacao: "IMPOSTOS", vencimento: "2026-05-29", valor: 15220.35, status: "pago", pagamento: "2026-05-29", descricao: "ICMS DIV E-FISCO (maio/2026)" },
  { id: "p93", favorecido: "JOSENILDO LUCAS DA CRUZ SILVA", categoria: "Complemento Salarial", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-05", valor: 182.0, status: "pago", pagamento: "2026-05-05", descricao: "COMPLEMENTO SALARIAL - LUCAS (maio/2026)" },
  { id: "p94", favorecido: "THAMIRES LUANA MACEDO VIANA", categoria: "Complemento Salarial", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-05", valor: 247.0, status: "pago", pagamento: "2026-05-05", descricao: "COMPLEMENTO SALARIAL - THAMY (maio/2026)" },
  { id: "p95", favorecido: "NAYARA", categoria: "Diárias", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-12", valor: 54.0, status: "pago", pagamento: "2026-05-12", descricao: "DIARIA NAYARA (DOMINGO) (maio/2026)" },
  { id: "p96", favorecido: "LUCAS/JULY/THAMY", categoria: "Diárias", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-11", valor: 162.0, status: "pago", pagamento: "2026-05-11", descricao: "DIARIAS LUCAS/JULY E THAMY - DOMINGO (maio/2026)" },
  { id: "p97", favorecido: "JULY (CAMILA)", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-23", valor: 100.0, status: "pago", pagamento: "2026-05-23", descricao: "JULY  - CAMILA SALARIOS (maio/2026)" },  // Descrição original: 'JULY - CAMILA SALARIOS' — não ficou claro se é salário de uma funcionária chamada Camila pago pela July, ou outra coisa. Confirmar.
  { id: "p98", favorecido: "JULY ADILA GOMES DA SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-04", valor: 4095.8, status: "pago", pagamento: "2026-05-04", descricao: "SALÁRIO - JULY (maio/2026)" },
  { id: "p99", favorecido: "REYLANE", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-04", valor: 1621.0, status: "pago", pagamento: "2026-05-04", descricao: "SALÁRIO - REYLANE (maio/2026)" },
  { id: "p100", favorecido: "THAMIRES LUANA MACEDO VIANA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-04", valor: 121.0, status: "pago", pagamento: "2026-05-04", descricao: "SALÁRIO - TAMY (maio/2026)" },
  { id: "p101", favorecido: "VALÉRIA CORREIA CARNEIRO MELLO", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-04", valor: 2622.5, status: "pago", pagamento: "2026-05-04", descricao: "SALÁRIO - VALÉRIA (maio/2026)" },
  { id: "p102", favorecido: "JOSENILDO LUCAS DA CRUZ SILVA", categoria: "Salário", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-02", valor: 980.0, status: "pago", pagamento: "2026-05-02", descricao: "SALARIO LUCAS (maio/2026)" },
  { id: "p103", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-28", valor: 70.0, status: "pago", pagamento: "2026-05-28", descricao: "RETIRA BRENDA - RETIRADA DE SOCIAS (maio/2026)" },
  { id: "p104", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-27", valor: 4.0, status: "pago", pagamento: "2026-05-27", descricao: "RETIRADA (maio/2026)" },
  { id: "p105", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-19", valor: 5.0, status: "pago", pagamento: "2026-05-19", descricao: "RETIRADA DE SOCIAS (maio/2026)" },
  { id: "p106", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-11", valor: 926.0, status: "pago", pagamento: "2026-05-11", descricao: "RETIRADA DE SOCIAS - BRENDA (maio/2026)" },
  { id: "p107", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-28", valor: 100.0, status: "pago", pagamento: "2026-05-28", descricao: "RETIRADA DE SOCIAS STEPHANE (maio/2026)" },
  { id: "p108", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-07", valor: 70.0, status: "pago", pagamento: "2026-05-07", descricao: "RETIRADA DE SOCIOS (maio/2026)" },
  { id: "p109", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-30", valor: 810.0, status: "pago", pagamento: "2026-05-30", descricao: "RETIRADA DE SOCIOS (maio/2026)" },
  { id: "p110", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-30", valor: 345.0, status: "pago", pagamento: "2026-05-30", descricao: "RETIRADA DE SOCIOS (maio/2026)" },
  { id: "p111", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-28", valor: 112.0, status: "pago", pagamento: "2026-05-28", descricao: "RETIRADA DE SOCIOS  - BRENDA (maio/2026)" },
  { id: "p112", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-14", valor: 139.4, status: "pago", pagamento: "2026-05-14", descricao: "STEPHANE - RETIRADA DE SOCIOS (maio/2026)" },
  { id: "p113", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-27", valor: 340.0, status: "pago", pagamento: "2026-05-27", descricao: "STEPHANE - RETIRADA DE SOCIOS (maio/2026)" },
  { id: "p114", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-27", valor: 132.0, status: "pago", pagamento: "2026-05-27", descricao: "STEPHANE - RETIRADA DE SOCIOS (maio/2026)" },
  { id: "p115", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-08", valor: 112.0, status: "pago", pagamento: "2026-05-08", descricao: "STHEPANE GÁS - RETIRADA DE SOCIOS (maio/2026)" },
  { id: "p116", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-02", valor: 2000.0, status: "pago", pagamento: "2026-05-02", descricao: "STEPHANE - RETIRADA DE SOCIAS (maio/2026)" },
  { id: "p117", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-04", valor: 5000.0, status: "pago", pagamento: "2026-05-04", descricao: "STEPHANE - RETIRADA DE SOCIAS (maio/2026)" },
  { id: "p118", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-27", valor: 3000.0, status: "pago", pagamento: "2026-05-27", descricao: "STEPHANI - RETIRADA DE SOCIAS (maio/2026)" },
  { id: "p119", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-30", valor: 5000.0, status: "pago", pagamento: "2026-05-30", descricao: "BRENDA MIRANDA - RETIRADA DE SOCIAS (maio/2026)" },
  { id: "p120", favorecido: "RECEITA FEDERAL", categoria: "INSS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-20", valor: 421.45, status: "pago", pagamento: "2026-05-20", descricao: "DARF SIMPLES (maio/2026)" },
  { id: "p121", favorecido: "FGTS", categoria: "FGTS", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-20", valor: 259.36, status: "pago", pagamento: "2026-05-20", descricao: "FGTS CAIXA (maio/2026)" },
  { id: "p122", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-05", valor: 16.0, status: "pago", pagamento: "2026-05-05", descricao: "AGUA - USO E CONSUMO (maio/2026)" },
  { id: "p123", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-25", valor: 18.0, status: "pago", pagamento: "2026-05-25", descricao: "AGUA - USO E CONSUMO (maio/2026)" },
  { id: "p124", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-06", valor: 65.0, status: "pago", pagamento: "2026-05-06", descricao: "CHOCOLATE - USO E CONSUMO (maio/2026)" },
  { id: "p125", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-22", valor: 127.0, status: "pago", pagamento: "2026-05-22", descricao: "FESTA BRENDA (maio/2026)" },
  { id: "p126", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-28", valor: 70.0, status: "pago", pagamento: "2026-05-28", descricao: "LANCHE - USO E CONSUMO (maio/2026)" },
  { id: "p127", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-13", valor: 16.0, status: "pago", pagamento: "2026-05-13", descricao: "LANCHES - USO E CONSUMO (maio/2026)" },
  { id: "p128", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-05", valor: 107.2, status: "pago", pagamento: "2026-05-05", descricao: "MARCOS VARIEDADES - USO  E CONSUMO (maio/2026)" },
  { id: "p129", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-08", valor: 36.8, status: "pago", pagamento: "2026-05-08", descricao: "MERCADO - USO E CONSUMO (maio/2026)" },
  { id: "p130", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-13", valor: 154.4, status: "pago", pagamento: "2026-05-13", descricao: "MERCADO - USO E CONSUMO (maio/2026)" },
  { id: "p131", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-08", valor: 16.0, status: "pago", pagamento: "2026-05-08", descricao: "USO E CONSUMO (maio/2026)" },
  { id: "p132", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-13", valor: 145.0, status: "pago", pagamento: "2026-05-13", descricao: "USO E CONSUMO (maio/2026)" },
  { id: "p133", favorecido: "USO E CONSUMO", categoria: "Uso e Consumo", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-08", valor: 200.0, status: "pago", pagamento: "2026-05-08", descricao: "VALE PRESENTE - PREMIAÇÕES (maio/2026)" },
  { id: "p134", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-02", valor: 50.0, status: "pago", pagamento: "2026-05-02", descricao: "SEGURANÇA (maio/2026)" },
  { id: "p135", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-09", valor: 50.0, status: "pago", pagamento: "2026-05-09", descricao: "SEGURANÇA (maio/2026)" },
  { id: "p136", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-23", valor: 50.0, status: "pago", pagamento: "2026-05-23", descricao: "SEGURANÇA (maio/2026)" },
  { id: "p137", favorecido: "SEGURANÇA", categoria: "Serviço Terceirizado", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-30", valor: 50.0, status: "pago", pagamento: "2026-05-30", descricao: "SEGURANÇA (maio/2026)" },
  { id: "p138", favorecido: "IMOBILIÁRIA", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-12", valor: 3500.0, status: "pago", pagamento: "2026-05-12", descricao: "1. ALUGUEL (maio/2026)" },
  { id: "p139", favorecido: "TIM", categoria: "Telefonia e Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-19", valor: 240.0, status: "pago", pagamento: "2026-05-19", descricao: "3. CONTA TIM - TELEFONIA E INTERNET (maio/2026)" },
  { id: "p140", favorecido: "MANUTENÇÃO PREDIAL", categoria: "Manutenção Predial", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-19", valor: 275.0, status: "pago", pagamento: "2026-05-19", descricao: "8. MANUTENÇÃO PREDIAL (maio/2026)" },
  { id: "p141", favorecido: "MANUTENÇÃO PREDIAL", categoria: "Manutenção Predial", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-13", valor: 13.1, status: "pago", pagamento: "2026-05-13", descricao: "8. TORNEIA - MANUTENÇÃO PREDIAL (maio/2026)" },
  { id: "p142", favorecido: "MANUTENÇÃO PREDIAL", categoria: "Manutenção Predial", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-02", valor: 1500.0, status: "pago", pagamento: "2026-05-02", descricao: "8. 1° PARTE SALA THAMI - MANUTENÇÃO PREDIAL (maio/2026)" },
  { id: "p143", favorecido: "MATERIAL DE ESCRITÓRIO", categoria: "Material de Escritório", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-21", valor: 30.0, status: "pago", pagamento: "2026-05-21", descricao: "9. COMPRA DE MATERIAL DE ESCRITORIO (maio/2026)" },
  { id: "p144", favorecido: "MATERIAL DE ESCRITÓRIO", categoria: "Material de Escritório", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-19", valor: 42.0, status: "pago", pagamento: "2026-05-19", descricao: "9. VASSOURA E PASTAS - MATERIAL DE ESCRITORIO (maio/2026)" },
  { id: "p145", favorecido: "MATERIAL DE ESCRITÓRIO", categoria: "Material de Escritório", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-28", valor: 20.0, status: "pago", pagamento: "2026-05-28", descricao: "9. PILHA - MATERIAL DE ESCRITÓRIO (maio/2026)" },
  { id: "p146", favorecido: "MATERIAL DE ESCRITÓRIO", categoria: "Material de Escritório", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-23", valor: 50.8, status: "pago", pagamento: "2026-05-23", descricao: "9.  CALCULADORAS - MATERIAIS DE ESCRIT (maio/2026)" },
  { id: "p147", favorecido: "EMBALAGENS/DECORAÇÃO", categoria: "Material de Escritório", classificacao: "DESPESAS EVENTUAIS", vencimento: "2026-05-13", valor: 53.7, status: "pago", pagamento: "2026-05-13", descricao: "BALÃO - DESPESAS EVENTUAIS (maio/2026)" },
  { id: "p148", favorecido: "EMBALAGENS/DECORAÇÃO", categoria: "Material de Escritório", classificacao: "DESPESAS EVENTUAIS", vencimento: "2026-05-08", valor: 94.8, status: "pago", pagamento: "2026-05-08", descricao: "FITA - DESPESAS EVENTUAIS (maio/2026)" },
  { id: "p149", favorecido: "EMBALAGENS/DECORAÇÃO", categoria: "Material de Escritório", classificacao: "DESPESAS EVENTUAIS", vencimento: "2026-05-13", valor: 112.0, status: "pago", pagamento: "2026-05-13", descricao: "FITA - DESPESAS EVENTUAIS (maio/2026)" },
  { id: "p150", favorecido: "EMBALAGENS/DECORAÇÃO", categoria: "Material de Escritório", classificacao: "DESPESAS EVENTUAIS", vencimento: "2026-05-28", valor: 28.96, status: "pago", pagamento: "2026-05-28", descricao: "PAPEL TOALHA - DESPESAS EVENTUAIS (maio/2026)" },
  { id: "p151", favorecido: "EMBALAGENS/DECORAÇÃO", categoria: "Material de Escritório", classificacao: "DESPESAS EVENTUAIS", vencimento: "2026-05-13", valor: 30.0, status: "pago", pagamento: "2026-05-13", descricao: "SACO - DESPESAS EVENTUAIS (maio/2026)" },
  { id: "p152", favorecido: "EMBALAGENS/DECORAÇÃO", categoria: "Material de Escritório", classificacao: "DESPESAS EVENTUAIS", vencimento: "2026-05-12", valor: 46.0, status: "pago", pagamento: "2026-05-12", descricao: "TECIDO - DESPESAS EVENTUAIS (maio/2026)" },
  { id: "p153", favorecido: "RVF FRANQUIAS", categoria: "Royalties Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-25", valor: 1958.0, status: "pago", pagamento: "2026-05-25", descricao: "RVF FRANQUIAS (maio/2026)" },
  { id: "p154", favorecido: "RVF FRANQUIAS", categoria: "Royalties Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-25", valor: 419.0, status: "pago", pagamento: "2026-05-25", descricao: "RVF FRANQUIAS (maio/2026)" },
  { id: "p155", favorecido: "RVF FRANQUIAS", categoria: "Royalties Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-25", valor: 481.0, status: "pago", pagamento: "2026-05-25", descricao: "RVF FRANQUIAS (maio/2026)" },
  { id: "p156", favorecido: "RVF FRANQUIAS", categoria: "Royalties Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-25", valor: 695.25, status: "pago", pagamento: "2026-05-25", descricao: "RVF FRANQUIAS (maio/2026)" },
  { id: "p157", favorecido: "RVF FRANQUIAS", categoria: "Royalties Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-25", valor: 740.0, status: "pago", pagamento: "2026-05-25", descricao: "RVF FRANQUIAS (maio/2026)" },
  { id: "p158", favorecido: "RVF FRANQUIAS", categoria: "Royalties Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-25", valor: 2920.0, status: "pago", pagamento: "2026-05-25", descricao: "RVF FRANQUIAS (maio/2026)" },
  { id: "p159", favorecido: "RVF FRANQUIAS", categoria: "Royalties Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-11", valor: 3120.52, status: "pago", pagamento: "2026-05-11", descricao: "RVF FRANQUIAS LTDA (maio/2026)" },
  { id: "p160", favorecido: "RVF FRANQUIAS", categoria: "Royalties Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-28", valor: 3430.0, status: "pago", pagamento: "2026-05-28", descricao: "RVF FRANQUIAS LTDA (maio/2026)" },
  { id: "p161", favorecido: "MERKE ASSESSORIA DE MARKETING", categoria: "Marketing Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-27", valor: 4892.78, status: "pago", pagamento: "2026-05-27", descricao: "MERKE ASSES MARKETING (maio/2026)" },
  { id: "p162", favorecido: "MERKE ASSESSORIA DE MARKETING", categoria: "Marketing Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-25", valor: 1779.27, status: "pago", pagamento: "2026-05-25", descricao: "MERKE ASSESS DE MARKETING (maio/2026)" },
  { id: "p163", favorecido: "MERKE ASSESSORIA DE MARKETING", categoria: "Marketing Franquia", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-04", valor: 2186.05, status: "pago", pagamento: "2026-05-04", descricao: "MERKE ASSESS DE MARKETING LTDA (maio/2026)" },
  { id: "p164", favorecido: "MATERIAL PARA MARKETING", categoria: "Marketing", classificacao: "DESPESAS COMERCIAIS / MARKETING", vencimento: "2026-05-06", valor: 100.0, status: "pago", pagamento: "2026-05-06", descricao: "ADESIVOS - MATERIAL P/ MARKETING (maio/2026)" },
  { id: "p165", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-05", valor: 10.0, status: "pago", pagamento: "2026-05-05", descricao: "ENTREGAS (maio/2026)" },
  { id: "p166", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-05", valor: 5.0, status: "pago", pagamento: "2026-05-05", descricao: "ENTREGAS (maio/2026)" },
  { id: "p167", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-06", valor: 5.0, status: "pago", pagamento: "2026-05-06", descricao: "ENTREGAS (maio/2026)" },
  { id: "p168", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-06", valor: 20.0, status: "pago", pagamento: "2026-05-06", descricao: "ENTREGAS (maio/2026)" },
  { id: "p169", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-07", valor: 5.0, status: "pago", pagamento: "2026-05-07", descricao: "ENTREGAS (maio/2026)" },
  { id: "p170", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-07", valor: 5.0, status: "pago", pagamento: "2026-05-07", descricao: "ENTREGAS (maio/2026)" },
  { id: "p171", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-08", valor: 5.0, status: "pago", pagamento: "2026-05-08", descricao: "ENTREGAS (maio/2026)" },
  { id: "p172", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-09", valor: 12.0, status: "pago", pagamento: "2026-05-09", descricao: "ENTREGAS (maio/2026)" },
  { id: "p173", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-11", valor: 5.0, status: "pago", pagamento: "2026-05-11", descricao: "ENTREGAS (maio/2026)" },
  { id: "p174", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-11", valor: 10.0, status: "pago", pagamento: "2026-05-11", descricao: "ENTREGAS (maio/2026)" },
  { id: "p175", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-11", valor: 5.0, status: "pago", pagamento: "2026-05-11", descricao: "ENTREGAS (maio/2026)" },
  { id: "p176", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-12", valor: 5.0, status: "pago", pagamento: "2026-05-12", descricao: "ENTREGAS (maio/2026)" },
  { id: "p177", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-12", valor: 5.0, status: "pago", pagamento: "2026-05-12", descricao: "ENTREGAS (maio/2026)" },
  { id: "p178", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-22", valor: 8.0, status: "pago", pagamento: "2026-05-22", descricao: "ENTREGAS (maio/2026)" },
  { id: "p179", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-22", valor: 5.0, status: "pago", pagamento: "2026-05-22", descricao: "ENTREGAS (maio/2026)" },
  { id: "p180", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-23", valor: 40.0, status: "pago", pagamento: "2026-05-23", descricao: "ENTREGAS (maio/2026)" },
  { id: "p181", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-05", valor: 35.0, status: "pago", pagamento: "2026-05-05", descricao: "ENTREGAS -SURUBIM (maio/2026)" },
  { id: "p182", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-05", valor: 35.0, status: "pago", pagamento: "2026-05-05", descricao: "ENTREGAS -SURUBIM (maio/2026)" },
  { id: "p183", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-06", valor: 25.0, status: "pago", pagamento: "2026-05-06", descricao: "ENTREGAS -SURUBIM (maio/2026)" },
  { id: "p184", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-07", valor: 50.0, status: "pago", pagamento: "2026-05-07", descricao: "ENTREGAS -SURUBIM (maio/2026)" },
  { id: "p185", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-08", valor: 35.0, status: "pago", pagamento: "2026-05-08", descricao: "ENTREGAS -SURUBIM (maio/2026)" },
  { id: "p186", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-13", valor: 25.0, status: "pago", pagamento: "2026-05-13", descricao: "ENTREGAS -SURUBIM (maio/2026)" },
  { id: "p187", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-02", valor: 46.0, status: "pago", pagamento: "2026-05-02", descricao: "ENTREGAS LIMOEIRO (maio/2026)" },
  { id: "p188", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-19", valor: 48.0, status: "pago", pagamento: "2026-05-19", descricao: "MOTO - ENTREGA (maio/2026)" },
  { id: "p189", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-27", valor: 5.0, status: "pago", pagamento: "2026-05-27", descricao: "MOTO - ENTREGA (maio/2026)" },
  { id: "p190", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-30", valor: 5.0, status: "pago", pagamento: "2026-05-30", descricao: "MOTO - ENTREGA (maio/2026)" },
  { id: "p191", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-28", valor: 8.0, status: "pago", pagamento: "2026-05-28", descricao: "MOTO - ENTREGA (maio/2026)" },
  { id: "p192", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-28", valor: 15.0, status: "pago", pagamento: "2026-05-28", descricao: "MOTO - ENTREGA (maio/2026)" },
  { id: "p193", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-23", valor: 12.0, status: "pago", pagamento: "2026-05-23", descricao: "MOTO - ENTREGA (maio/2026)" },
  { id: "p194", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-29", valor: 50.0, status: "pago", pagamento: "2026-05-29", descricao: "MOTO - ENTREGA (maio/2026)" },
  { id: "p195", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-22", valor: 35.0, status: "pago", pagamento: "2026-05-22", descricao: "MOTO SURUBIM (maio/2026)" },
  { id: "p196", favorecido: "ENTREGAS/MOTOBOY", categoria: "Frete", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-05-26", valor: 25.0, status: "pago", pagamento: "2026-05-26", descricao: "MOTO SURUBIM (maio/2026)" },
  { id: "p197", favorecido: "BANCO DO BRASIL", categoria: "Tarifas Bancárias", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-05-11", valor: 285.6, status: "pago", pagamento: "2026-05-11", descricao: "TARIFA BANCARIA (maio/2026)" },
  { id: "p198", favorecido: "PREFEITURA DE CARPINA", categoria: "Multas / Taxas", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-05-04", valor: 681.0, status: "pago", pagamento: "2026-05-04", descricao: "MUNICIPIO DE CARPINA - TAXA IMAGEM FAXADAS (maio/2026)" },
  { id: "p199", favorecido: "SÓCIOS", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-05-02", valor: 150.0, status: "pago", pagamento: "2026-05-02", descricao: "RETIRADA - Dr KALINA (maio/2026)" },  // Descrição original 'RETIRADA - Dr KALINA' — classifiquei como retirada de sócio, mesmo padrão das demais retiradas.
  { id: "p200", favorecido: "FIDC MULTISSETORIAL", categoria: "Empréstimos e Antecipações", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-05-25", valor: 2541.66, status: "pago", pagamento: "2026-05-25", descricao: "FIDC MULTISSETORIAL (maio/2026)" },  // Nome de empresa de fomento/factoring — classifiquei como antecipação de recebíveis/empréstimo, não como compra de produto.
  { id: "p201", favorecido: "MASTER GIRO FOMENTO", categoria: "Empréstimos e Antecipações", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-05-25", valor: 3261.39, status: "pago", pagamento: "2026-05-25", descricao: "MASTER GIRO FOMENTO (maio/2026)" },  // Nome de empresa de fomento/factoring — classifiquei como antecipação de recebíveis/empréstimo, não como compra de produto.
  { id: "p202", favorecido: "MASTER GIRO FOMENTO", categoria: "Empréstimos e Antecipações", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-05-25", valor: 1419.14, status: "pago", pagamento: "2026-05-25", descricao: "MASTER GIRO FOMENTO (maio/2026)" },  // Nome de empresa de fomento/factoring — classifiquei como antecipação de recebíveis/empréstimo, não como compra de produto.
  { id: "p203", favorecido: "MILLE -FIDC MULTISSETORIAL LP", categoria: "Empréstimos e Antecipações", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-05-07", valor: 2410.33, status: "pago", pagamento: "2026-05-07", descricao: "MILLE -FIDC MULTISSETORIAL LP (maio/2026)" },  // Nome de empresa de fomento/factoring — classifiquei como antecipação de recebíveis/empréstimo, não como compra de produto.
  { id: "p204", favorecido: "ROGERIO LUIZ BATISTA LTDA", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-04", valor: 1534.0, status: "pago", pagamento: "2026-05-04", descricao: "ROGERIO LUIZ BATISTA LTDA (maio/2026)" },
  { id: "p205", favorecido: "SOLUS FUNDO DE INVESTIMENTO EM", categoria: "Empréstimos e Antecipações", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-05-04", valor: 2720.0, status: "pago", pagamento: "2026-05-04", descricao: "SOLUS FUNDO DE INVESTIMENTO EM (maio/2026)" },  // Nome de empresa de fomento/factoring — classifiquei como antecipação de recebíveis/empréstimo, não como compra de produto.
  { id: "p206", favorecido: "SPIKES INJETADOS", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-04", valor: 561.0, status: "pago", pagamento: "2026-05-04", descricao: "SPIKES INJETADOS (maio/2026)" },
  { id: "p207", favorecido: "SUZANE APARECIDA BEZERRA DA SILVA", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-01", valor: 1000.0, status: "pago", pagamento: "2026-05-01", descricao: "SUZANE APARECIDA BEZERRA DA SILVA (maio/2026)" },
  { id: "p208", favorecido: "VALERIA CORRERIA CARNEIRO MELLO", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-04", valor: 1932.5, status: "pago", pagamento: "2026-05-04", descricao: "VALERIA CORRERIA CARNEIRO MELLO (maio/2026)" },  // Mesmo nome de uma colaboradora da folha (Valéria Correia Carneiro Mello) — confirmar se é mesmo fornecedora ou se é outra retirada/adiantamento.
  { id: "p209", favorecido: "JOSE CARLOS DA SILVA JUNIOR", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-06", valor: 410.0, status: "pago", pagamento: "2026-05-06", descricao: "JOSE CARLOS DA SILVA JUNIOR (maio/2026)" },
  { id: "p210", favorecido: "MIRANDA CAVALCANTI DE ANDRADE", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-07", valor: 10000.0, status: "pago", pagamento: "2026-05-07", descricao: "MIRANDA CAVALCANTI DE ANDRADE (maio/2026)" },  // Valor alto (R$10.000) para pessoa física — confirmar se é fornecedor/fornecedora de verdade ou sócio/mutuante.
  { id: "p211", favorecido: "WOLNEY CAVALCANTI SILVA", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-08", valor: 2000.0, status: "pago", pagamento: "2026-05-08", descricao: "WOLNEY CAVALCANTI SILVA (maio/2026)" },  // Repetido com a linha de 28/05 (mesmo nome) — confirmar se são dois fornecedores diferentes ou lançamento duplicado.
  { id: "p212", favorecido: "MIRANDA CAVALCANTI DE ANDRADE", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-09", valor: 20000.0, status: "pago", pagamento: "2026-05-09", descricao: "MIRANDA CAVALCANTI DE ANDRADE (maio/2026)" },  // Valor alto (R$20.000) para pessoa física — confirmar se é fornecedor/fornecedora de verdade ou sócio/mutuante.
  { id: "p213", favorecido: "MA BAROSSO COMERCIO DE ROUPAS", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-11", valor: 500.0, status: "pago", pagamento: "2026-05-11", descricao: "MA BAROSSO COMERCIO DE ROUPAS (maio/2026)" },
  { id: "p214", favorecido: "JUSTA MODA ATACADO", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-11", valor: 320.0, status: "pago", pagamento: "2026-05-11", descricao: "JUSTA MODA ATACADO (maio/2026)" },
  { id: "p215", favorecido: "FASHION LUZ", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-11", valor: 785.0, status: "pago", pagamento: "2026-05-11", descricao: "FASHION LUZ (maio/2026)" },
  { id: "p216", favorecido: "LAC CONFECCÇOES", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-11", valor: 315.0, status: "pago", pagamento: "2026-05-11", descricao: "LAC CONFECCÇOES (maio/2026)" },
  { id: "p217", favorecido: "D K YOO CONFECCOES", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-11", valor: 400.0, status: "pago", pagamento: "2026-05-11", descricao: "D K YOO CONFECCOES (maio/2026)" },
  { id: "p218", favorecido: "MB GUERRERO", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-11", valor: 480.0, status: "pago", pagamento: "2026-05-11", descricao: "MB GUERRERO (maio/2026)" },
  { id: "p219", favorecido: "LUIZ GUSTAVO PINHEIRO MONTEIRO", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-11", valor: 2030.0, status: "pago", pagamento: "2026-05-11", descricao: "LUIZ GUSTAVO PINHEIRO MONTEIRO (maio/2026)" },
  { id: "p220", favorecido: "FERNANDA ZANCHETTA FERNANDES", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-11", valor: 490.0, status: "pago", pagamento: "2026-05-11", descricao: "FERNANDA ZANCHETTA FERNANDES (maio/2026)" },
  { id: "p221", favorecido: "CHIQUE MODAS FASHION", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-11", valor: 2690.0, status: "pago", pagamento: "2026-05-11", descricao: "CHIQUE MODAS FASHION (maio/2026)" },
  { id: "p222", favorecido: "VERONICA CRISTINA DA SILVA", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-13", valor: 240.0, status: "pago", pagamento: "2026-05-13", descricao: "VERONICA CRISTINA DA SILVA (maio/2026)" },
  { id: "p223", favorecido: "ANA KALINA", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-25", valor: 10000.0, status: "pago", pagamento: "2026-05-25", descricao: "ANA KALINA (maio/2026)" },
  { id: "p224", favorecido: "MIRANDA CAVALCANTI DE ANDRADE", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-27", valor: 10000.0, status: "pago", pagamento: "2026-05-27", descricao: "MIRANDA CAVALCANTI DE ANDRADE (maio/2026)" },  // Repetido com as linhas de 07/05 e 09/05 (mesmo nome) — confirmar se são compras diferentes.
  { id: "p225", favorecido: "MIRANDA CAVALCANTI DE ANDRADE", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-27", valor: 3000.0, status: "pago", pagamento: "2026-05-27", descricao: "MIRANDA CAVALCANTI DE ANDRADE (maio/2026)" },  // Repetido com as linhas de 07/05, 09/05 e 27/05 (mesmo nome) — confirmar se são compras diferentes.
  { id: "p226", favorecido: "BEMOBI PAYTECH", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-28", valor: 5485.04, status: "pago", pagamento: "2026-05-28", descricao: "BEMOBI PAYTECH (maio/2026)" },  // 'BEMOBI PAYTECH' soa a serviço de pagamento/assinatura, não confecção — confirmar se é mesmo compra de produto.
  { id: "p227", favorecido: "MIRANDA C DE ANDRADE ARTIGOS DO VESTUARIO", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-28", valor: 5000.0, status: "pago", pagamento: "2026-05-28", descricao: "MIRANDA C DE ANDRADE ARTIGOS DO VESTUARIO (maio/2026)" },
  { id: "p228", favorecido: "ADRIANO PEREIRA CINTRA", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-28", valor: 1000.0, status: "pago", pagamento: "2026-05-28", descricao: "ADRIANO PEREIRA CINTRA (maio/2026)" },
  { id: "p229", favorecido: "ANA KALINA E FILHAS", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-28", valor: 5000.0, status: "pago", pagamento: "2026-05-28", descricao: "ANA KALINA E FILHAS (maio/2026)" },
  { id: "p230", favorecido: "WOLNEY CAVALCANTI SILVA", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-28", valor: 2123.0, status: "pago", pagamento: "2026-05-28", descricao: "WOLNEY CAVALCANTI SILVA (maio/2026)" },  // Repetido com a linha de 08/05 (mesmo nome) — confirmar se são dois fornecedores diferentes.
  { id: "p231", favorecido: "ITALA ROBERTA ALBUQUERQUE", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-29", valor: 640.0, status: "pago", pagamento: "2026-05-29", descricao: "ITALA ROBERTA ALBUQUERQUE (maio/2026)" },
  { id: "p232", favorecido: "JONATAS FARIAS SALGADO", categoria: "Custo sobre Mercadorias Vendidas", classificacao: "CMV", vencimento: "2026-05-29", valor: 1060.0, status: "pago", pagamento: "2026-05-29", descricao: "JONATAS FARIAS SALGADO (maio/2026)" },
  { id: "p233", favorecido: "BPO FINANCEIRO", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-01", valor: 250.0, status: "pago", pagamento: "2026-05-01", descricao: "Sistemas de maio/2026 — valor da aba Ano 2026 da planilha, sem lançamento individual no Detalhamento" },
  { id: "p234", favorecido: "RICAVI FINANÇAS", categoria: "BPO Financeiro", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-01", valor: 1500.0, status: "pago", pagamento: "2026-05-01", descricao: "BPO Financeiro de maio/2026 — valor da aba Ano 2026 da planilha, sem lançamento individual no Detalhamento" },
  { id: "p235", favorecido: "CONTADOR", categoria: "Contabilidade", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-05-01", valor: 997.0, status: "pago", pagamento: "2026-05-01", descricao: "Contabilidade de maio/2026 — valor da aba Ano 2026 da planilha, sem lançamento individual no Detalhamento" },
  { id: "p236", favorecido: "MAQUININHA DE CARTÃO", categoria: "Tarifas de Maquininhas", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-05-01", valor: 287.99, status: "pago", pagamento: "2026-05-01", descricao: "Taxas Maquinetas de maio/2026 — valor da aba Ano 2026 da planilha, sem lançamento individual no Detalhamento" },
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
        { nome: "Complemento Salarial", padrao: true },
        { nome: "Serviço Terceirizado", padrao: true },
        { nome: "Uso e Consumo", padrao: true },
        { nome: "Diárias", padrao: true },
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
        { nome: "BPO Financeiro", padrao: true },
        { nome: "Telefonia e Internet", padrao: true },
        { nome: "Manutenção Predial", padrao: true },
        { nome: "Material de Escritório", padrao: true },
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
        { nome: "Empréstimos e Antecipações", padrao: true },
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
        { nome: "Royalties Franquia", padrao: true },
        { nome: "Marketing Franquia", padrao: true },
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
