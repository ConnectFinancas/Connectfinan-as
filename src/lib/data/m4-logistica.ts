import { CategoryGroup, Payable, Receivable } from "@/lib/types";

export const anoCorrente = 2026;
export const dreMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// ---------- Fluxo de Caixa (Agosto/2026) — ainda não conectado aos lançamentos ----------

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

// Deduções da Receita que ainda não têm uma tela de lançamento própria
// (ficam fixas até termos um fluxo dedicado para elas).
export const deducoesManuais = {
  impostos: 0,
  inadimplencia: 0,
  investimentos: 2178.27,
};

// ---------- Sementes (estado inicial) — Contas a Receber ----------

export const seedReceivables: Receivable[] = [
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

// ---------- Sementes (estado inicial) — Contas a Pagar ----------

export const seedPayables: Payable[] = [
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

// ---------- Sementes (estado inicial) — Cadastros ----------

export const seedCategoriasPagar: CategoryGroup[] = [
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

export const seedCategoriasReceber: CategoryGroup[] = [
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
