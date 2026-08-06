import { CategoryGroup, DreGridRow, ExpenseSlice, MonthlyFinancials, Payable, Receivable } from "@/lib/types";

export const anoCorrente = 2026;
export const dreMonths = ["Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// ---------- Resumo ----------

export const resumoKpis = {
  receitaMes: { value: 4472.0 },
  saidasMes: { value: 0 },
  resultadoMes: { value: 4472.0 },
  receitaAcumulada: { value: 55053.98 },
};

export const resumoDoAno = {
  receita: 55053.98,
  saidasTotais: 89435.04,
  resultado: 55053.98 - 89435.04,
};

export const indicadores = {
  margemResultado: -62.4,
  receitaRecebidaCaixa: 61.7,
  maiorGrupoSaida: { label: "Despesas Administrativas", valor: 38178.75 },
  mesesComMovimento: 11,
};

export const monthlyFinancials: MonthlyFinancials[] = [
  { month: "Fev/26", receita: 263.5, despesa: 0 },
  { month: "Mar/26", receita: 4899.0, despesa: 13925.7 },
  { month: "Abr/26", receita: 5965.7, despesa: 15411.6 },
  { month: "Mai/26", receita: 5115.0, despesa: 16574.26 },
  { month: "Jun/26", receita: 6900.0, despesa: 19342.39 },
  { month: "Jul/26", receita: 11871.28, despesa: 17731.15 },
  { month: "Ago/26", receita: 4472.0, despesa: 0 },
  { month: "Set/26", receita: 3870.0, despesa: 0 },
  { month: "Out/26", receita: 3870.0, despesa: 0 },
  { month: "Nov/26", receita: 3870.0, despesa: 0 },
  { month: "Dez/26", receita: 3957.5, despesa: 0 },
];

export const evolucaoReceitaAcumulada = [
  { month: "Fev/26", acumulado: 263.5 },
  { month: "Mar/26", acumulado: 5162.5 },
  { month: "Abr/26", acumulado: 11128.2 },
  { month: "Mai/26", acumulado: 16243.2 },
  { month: "Jun/26", acumulado: 23143.2 },
  { month: "Jul/26", acumulado: 35014.48 },
  { month: "Ago/26", acumulado: 39486.48 },
  { month: "Set/26", acumulado: 43356.48 },
  { month: "Out/26", acumulado: 47226.48 },
  { month: "Nov/26", acumulado: 51096.48 },
  { month: "Dez/26", acumulado: 55053.98 },
];

// Saídas por classificação — acumulado do ano (soma = R$ 89.435,04)
export const saidasPorClassificacao: ExpenseSlice[] = [
  { label: "Despesas Administrativas", value: 38178.75, color: "#4f8dfd" },
  { label: "Despesas c/ Pessoas", value: 27325.62, color: "#ff8a5c" },
  { label: "Despesa Administrativa", value: 7000.0, color: "#a78bfa" },
  { label: "Investimento", value: 5774.32, color: "#f5c344" },
  { label: "CMV", value: 4271.67, color: "#22d3a0" },
  { label: "Investimentos (dedução)", value: 2178.27, color: "#f472b6" },
  { label: "Impostos", value: 2042.62, color: "#facc15" },
  { label: "Despesas Logísticas", value: 1645.09, color: "#38bdf8" },
  { label: "Despesas Financeiras", value: 1018.7, color: "#94a3b8" },
];

// ---------- Faturamento & DRE ----------

export const faturamentoKpis = {
  receitaDoAno: { value: 55053.98, hint: "faturamento (competência)" },
  receitaLiquida: { value: 50782.31, hint: "receita − CMV" },
  deducoesDespesas: { value: 89435.04, hint: "CMV + impostos + despesas" },
  geracaoDeCaixa: { value: -34381.06, hint: "resultado do ano" },
};

export const receitaPorServico: ExpenseSlice[] = [
  { label: "Aluguel de Box", value: 21471.05, color: "#4f8dfd" },
  { label: "Prep Center", value: 13212.96, color: "#a78bfa" },
  { label: "Aluguel do Escritório", value: 8808.64, color: "#f472b6" },
  { label: "Serviços Logísticos", value: 6606.48, color: "#22d3a0" },
  { label: "ENVIO FULL", value: 3303.24, color: "#f2a93c" },
  { label: "JADLOG PICKUP", value: 550.54, color: "#38bdf8" },
  { label: "Endereço Fiscal", value: 550.54, color: "#f2665c" },
  { label: "Ponto de Coleta - JADLOG", value: 550.53, color: "#94a3b8" },
];

export const dreGrid: DreGridRow[] = [
  { label: "RECEITA", values: [263.5, 4899.0, 5965.7, 5115.0, 6900.0, 11871.28, 4472.0, 3870.0, 3870.0, 3870.0, 3957.5], acumulado: 55053.98, isHeader: true, expandable: true },
  { label: "= Receita bruta", values: [263.5, 4899.0, 5965.7, 5115.0, 6900.0, 11871.28, 4472.0, 3870.0, 3870.0, 3870.0, 3957.5], acumulado: 55053.98, indent: true },
  { label: "(-) CMV", values: [0, 0, 730.5, 3061.93, 457.24, 22.0, 0, 0, 0, 0, 0], acumulado: 4271.67, negative: true, expandable: true },
  { label: "= Receita líquida", values: [263.5, 4899.0, 5235.2, 2053.07, 6442.76, 11849.28, 4472.0, 3870.0, 3870.0, 3870.0, 3957.5], acumulado: 50782.31, isSubtotal: true },
  { label: "(-) Impostos", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], acumulado: 0, negative: true },
  { label: "(-) Inadimplência", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], acumulado: 0, negative: true },
  { label: "(-) Investimentos", values: [0, 0, 0, 0, 0, 2178.27, 0, 0, 0, 0, 0], acumulado: 2178.27, negative: true, expandable: true },
  { label: "= Valor a gastar", values: [263.5, 4899.0, 5235.2, 2053.07, 6442.76, 9671.01, 4472.0, 3870.0, 3870.0, 3870.0, 3957.5], acumulado: 48604.04, isSubtotal: true },
  { label: "DESPESAS", values: [], acumulado: 0, isSection: true },
  { label: "Despesa Administrativa", values: [0, 0, 0, 0, 0, 7000.0, 0, 0, 0, 0, 0], acumulado: 7000.0, negative: true, expandable: true },
  { label: "IMPOSTOS", values: [0, 101.0, 0, 505.63, 265.74, 1170.25, 0, 0, 0, 0, 0], acumulado: 2042.62, negative: true, expandable: true },
  { label: "DESPESAS LOGISTICAS", values: [0, 158.8, 135.0, 30.0, 424.0, 897.29, 0, 0, 0, 0, 0], acumulado: 1645.09, negative: true, expandable: true },
  { label: "DESPESAS ADMINISTRATIVAS", values: [0, 8225.68, 9788.44, 8160.77, 10758.61, 1245.25, 0, 0, 0, 0, 0], acumulado: 38178.75, negative: true, expandable: true },
  { label: "DESPESAS FINANCEIRAS", values: [0, 232.66, 160.6, 165.1, 298.34, 162.0, 0, 0, 0, 0, 0], acumulado: 1018.7, negative: true, expandable: true },
  { label: "INVESTIMENTO", values: [0, 847.22, 1797.22, 472.47, 2182.47, 474.94, 0, 0, 0, 0, 0], acumulado: 5774.32, negative: true, expandable: true },
  { label: "DESPESAS C/ PESSOAS", values: [0, 4360.34, 3530.34, 7240.29, 5413.23, 6781.42, 0, 0, 0, 0, 0], acumulado: 27325.62, negative: true, expandable: true },
  { label: "= Despesas totais", values: [0, 13925.7, 15411.6, 16574.26, 19342.39, 17731.15, 0, 0, 0, 0, 0], acumulado: 82985.1, isSubtotal: true, negative: true },
  { label: "= Geração de caixa", values: [263.5, -9026.7, -10176.4, -14521.19, -12899.63, -8060.14, 4472.0, 3870.0, 3870.0, 3870.0, 3957.5], acumulado: -34381.06, isTotal: true },
];

// ---------- Fluxo de Caixa (Agosto/2026) ----------

export const fluxoCaixaPeriodo = "01/08/2026 a 31/08/2026";

export const fluxoCaixaKpis = {
  saldoInicial: -54549.19,
  recebimentos: 1262.0,
  pagamentos: 0,
  geracaoLiquida: 1262.0,
  geracaoLiquidaPct: 100.0,
  saldoFinal: -53287.19,
  crescimentoCaixa: 2.3,
};

export const fluxoDiario = Array.from({ length: 31 }, (_, i) => {
  const dia = i + 1;
  const saldo = dia <= 3 ? fluxoCaixaKpis.saldoInicial : fluxoCaixaKpis.saldoFinal;
  return { dia: String(dia).padStart(2, "0"), saldo };
});

export const faturamentoXRecebimentos = {
  faturamento: 4472.0,
  recebido: 1262.0,
  conversaoEmCaixa: 28.2,
  diferenca: -3210.0,
};

export const maioresRecebimentos = [{ data: "04/08", valor: 1262.0, pctTotal: 100.0 }];
export const maioresPagamentos: { data: string; valor: number; pctTotal: number }[] = [];

export const indicesFinanceiros = [
  { label: "Índice de geração de caixa", value: "100,0%" },
  { label: "Índice de consumo de caixa", value: "0,0%" },
  { label: "Conversão do faturamento", value: "28,2%" },
  { label: "Variação do caixa no período", value: "+2,3%" },
];

export const destaquesPeriodo = [
  { title: "Caixa encerrou em -R$ 53.287,19", desc: "Gerou R$ 1.262,00 no período." },
  { title: "Geração positiva de R$ 1.262,00", desc: "100,0% dos recebimentos." },
  { title: "Conversão em caixa de 28,2%", desc: "Do que foi faturado, quanto entrou no caixa." },
  { title: "1 recebimento · 0 pagamentos", desc: "Maior entrada = 100,0% do total." },
];

export const resumoExecutivo = [
  "No período, a empresa teve R$ 1.262,00 em recebimentos e R$ 0,00 em pagamentos, resultando em geração de caixa positiva de R$ 1.262,00 e variação de +2,3% no saldo.",
  "A conversão do faturamento em caixa foi de 28,2%, o que merece atenção no recebimento das vendas.",
];

export const pontoDeAtencao =
  "Os recebimentos estão concentrados — a maior entrada representa 100,0% do total, o que pode afetar a previsibilidade do caixa.";

// ---------- Contas a Receber ----------

export const contasReceberKpis = {
  totalPeriodo: { value: 55053.98, hint: "107 contas" },
  recebido: { value: 33969.58, hint: "62% do total" },
  aReceber: { value: 21084.4, hint: "em aberto" },
  emAtraso: { value: 0, hint: "inadimplência" },
};

export const totalContasReceber = 107;

export const receivables: Receivable[] = [
  { id: "r1", cliente: "LDGS TECH PB LTDA", categoria: "Serviços Logísticos", classificacao: "Receita Variável", vencimento: "2026-02-28", valor: 263.5, status: "recebido", recebimento: "2026-02-28", descricao: "Despacho fev/2026 · 527 volumes" },
  { id: "r2", cliente: "LDGS TECH PB LTDA", categoria: "Prep Center", classificacao: "Receita Recorrente", vencimento: "2026-03-02", valor: 263.5, status: "recebido", recebimento: "2026-03-02", descricao: "SERVIÇOS DE PREP CENTER" },
  { id: "r3", cliente: "KAIO MIKE | MIX CLIMATRONICA", categoria: "Aluguel de Box", classificacao: "Receita Recorrente", vencimento: "2026-03-09", valor: 80.0, status: "recebido", recebimento: "2026-03-09", descricao: "LOCACAO DO BOX" },
  { id: "r4", cliente: "LEONARDO DE ALBURQUERQUE | STREET BIKE", categoria: "Aluguel de Box", classificacao: "Receita Recorrente", vencimento: "2026-03-09", valor: 800.0, status: "recebido", recebimento: "2026-03-09", descricao: "ALUGUEL DO BOX" },
  { id: "r5", cliente: "FERNANDO ANTONIO MAIA FILHO", categoria: "Aluguel de Box", classificacao: "Receita Recorrente", vencimento: "2026-03-09", valor: 60.0, status: "recebido", recebimento: "2026-03-09", descricao: "LOCACAO DO BOX" },
  { id: "r6", cliente: "CONNECT CONTABIL LTDA", categoria: "Aluguel do Escritório", classificacao: "Receita Recorrente", vencimento: "2026-03-12", valor: 1000.0, status: "recebido", recebimento: "2026-03-12", descricao: "ALUGUEL ESCRITORIOS" },
  { id: "r7", cliente: "LDGS TECH PB LTDA", categoria: "Prep Center", classificacao: "Receita Recorrente", vencimento: "2026-03-16", valor: 674.5, status: "recebido", recebimento: "2026-03-16", descricao: "SERVICOS DE PREP CENTER" },
  { id: "r8", cliente: "64.735.955 ARTUR MORAIS XAVIER", categoria: "Aluguel de Box", classificacao: "Receita Recorrente", vencimento: "2026-03-27", valor: 240.0, status: "recebido", recebimento: "2026-03-27", descricao: "LOCACAO DO BOX" },
  { id: "r9", cliente: "TECHGADGETS BRASIL LTDA", categoria: "ENVIO FULL", classificacao: "Receita Variável", vencimento: "2026-08-10", valor: 1450.0, status: "pendente", descricao: "ENVIO FULL - LOTE AGO/26" },
  { id: "r10", cliente: "BOA VISTA ELETRO", categoria: "Serviços Logísticos", classificacao: "Receita Variável", vencimento: "2026-08-18", valor: 890.0, status: "pendente", descricao: "DESPACHO AGO/2026" },
];

// ---------- Contas a Pagar ----------

export const contasPagarKpis = {
  despesasPeriodo: { value: 89435.04, hint: "153 contas" },
  pago: { value: 87256.77, hint: "98% do total" },
  emAberto: { value: 2178.27, hint: "a pagar" },
  maiorValor: { value: 7000.0, hint: "no filtro atual" },
};

export const totalContasPagar = 153;

export const payables: Payable[] = [
  { id: "p1", favorecido: "—", categoria: "Frete de Materiais", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-03-02", valor: 158.8, status: "pago", pagamento: "2026-03-02", descricao: "FRETE TRANSPALETEIRA - PAGAR VIA BOLETO" },
  { id: "p2", favorecido: "SICOOB COOPERATIVA DO BRASIL S.A.", categoria: "Taxa Bancária", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-03-05", valor: 159.99, status: "pago", pagamento: "2026-03-05", descricao: "TAXA BANCARIA - DEB PARCELAS SUBSC INTEG" },
  { id: "p3", favorecido: "—", categoria: "ISS", classificacao: "IMPOSTOS", vencimento: "2026-03-10", valor: 101.0, status: "pago", pagamento: "2026-03-10", descricao: "ISS M4 LOGISTICA" },
  { id: "p4", favorecido: "BRISANET LTDA", categoria: "Internet", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-03-12", valor: 99.9, status: "pago", pagamento: "2026-03-12", descricao: "BRISANET - INTERNET" },
  { id: "p5", favorecido: "AUGUSTO DE ALMEIDA NETO", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-03-15", valor: 7000.0, status: "pago", pagamento: "2026-03-15", descricao: "ALUGUEL GALPÃO - R$7.000,00" },
  { id: "p6", favorecido: "JOSE FABIO DE FREITAS ANISIO", categoria: "Manutenção Predial", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-03-16", valor: 352.97, status: "pago", pagamento: "2026-03-16", descricao: "REEMBOLSO FABINHO - MAT. INSTALAÇÃO EXAUSTOR" },
  { id: "p7", favorecido: "JOSE FABIO DE FREITAS ANISIO", categoria: "Manutenção Predial", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-03-16", valor: 130.0, status: "pago", pagamento: "2026-03-16", descricao: "MÃO DE OBRA INSTALAÇÃO EXAUSTOR" },
  { id: "p8", favorecido: "JOSE FABIO DE FREITAS ANISIO", categoria: "Manutenção Predial", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-03-19", valor: 120.0, status: "pago", pagamento: "2026-03-19", descricao: "REEMBOLSO FABINHO - MATERIAIS DIVERSOS MANUTENÇÃO" },
  { id: "p9", favorecido: "POSTO IPIRANGA", categoria: "Combustivel", classificacao: "DESPESAS LOGISTICAS", vencimento: "2026-08-08", valor: 890.5, status: "pendente", descricao: "COMBUSTÍVEL FROTA - AGO/26" },
  { id: "p10", favorecido: "WMS CLOUD SISTEMAS", categoria: "Sistemas", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-08-15", valor: 1287.77, status: "pendente", descricao: "MENSALIDADE WMS - AGO/26" },
];

// ---------- Cadastros ----------

export const categoriasPagar: CategoryGroup[] = [
  {
    classificacao: "DESPESAS C/ PESSOAS",
    color: "#a78bfa",
    padrao: true,
    categorias: [
      { nome: "Salário", padrao: true },
      { nome: "Pró-Labore", padrao: true },
      { nome: "Alimentação", padrao: true },
      { nome: "Transporte", padrao: true },
      { nome: "INSS", padrao: true },
      { nome: "FGTS", padrao: true },
      { nome: "Comissões/Gratificações", padrao: true },
      { nome: "Uso e Consumo", padrao: true },
      { nome: "Treinamento/Cursos", padrao: true },
      { nome: "Serviços de Terceiros", padrao: true },
    ],
  },
  {
    classificacao: "DESPESAS ADMINISTRATIVAS",
    color: "#5b93fd",
    padrao: true,
    categorias: [
      { nome: "Aluguel", padrao: true },
      { nome: "Sistemas", padrao: true },
      { nome: "Telefonia", padrao: true },
      { nome: "Internet", padrao: true },
      { nome: "Energia Elétrica", padrao: true },
      { nome: "Água", padrao: true },
      { nome: "Anuidade e Renovações", padrao: true },
      { nome: "Despesas Eventuais", padrao: true },
      { nome: "Manutenção Predial", padrao: false },
    ],
  },
  {
    classificacao: "DESPESAS FINANCEIRAS",
    color: "#f2665c",
    padrao: true,
    categorias: [
      { nome: "Taxa Bancária", padrao: true },
      { nome: "Taxa Cobrança", padrao: true },
      { nome: "Taxas e Multas Sobre Serviços", padrao: true },
      { nome: "Impostos Diversos", padrao: true },
    ],
  },
  {
    classificacao: "CMV",
    color: "#22d3a0",
    padrao: true,
    categorias: [
      { nome: "Custo Sobre Serviços", padrao: true },
      { nome: "Insumos", padrao: true },
      { nome: "Custo de Envios Full", padrao: true },
    ],
  },
  {
    classificacao: "IMPOSTOS",
    color: "#f5c344",
    padrao: true,
    categorias: [
      { nome: "ISS", padrao: true },
      { nome: "DAS MEI", padrao: false },
    ],
  },
  {
    classificacao: "DESPESAS LOGISTICAS",
    color: "#38bdf8",
    padrao: false,
    categorias: [
      { nome: "Cargas e Descargas", padrao: false },
      { nome: "Combustivel", padrao: false },
      { nome: "Entrega JADLOG", padrao: false },
      { nome: "Frete de Materiais", padrao: false },
      { nome: "Fretes Gerais", padrao: false },
    ],
  },
  {
    classificacao: "INVESTIMENTO",
    color: "#4f8dfd",
    padrao: false,
    categorias: [{ nome: "Maquinas e Equipamentos", padrao: false }],
  },
  {
    classificacao: "Sem classificação",
    color: "#64748b",
    padrao: true,
    categorias: [
      { nome: "Agua e Esgoto", padrao: false },
      { nome: "Energia Eletrica", padrao: false },
    ],
  },
];

export const categoriasReceber: CategoryGroup[] = [
  {
    classificacao: "Receita Recorrente",
    color: "#22d3a0",
    padrao: true,
    categorias: [
      { nome: "Prep Center", padrao: true },
      { nome: "Aluguel de Box", padrao: true },
      { nome: "Aluguel do Escritório", padrao: true },
    ],
  },
  {
    classificacao: "Receita Variável",
    color: "#4f8dfd",
    padrao: true,
    categorias: [
      { nome: "Serviços Logísticos", padrao: true },
      { nome: "ENVIO FULL", padrao: false },
      { nome: "JADLOG PICKUP", padrao: false },
      { nome: "Endereço Fiscal", padrao: false },
      { nome: "Ponto de Coleta - JADLOG", padrao: false },
    ],
  },
];
