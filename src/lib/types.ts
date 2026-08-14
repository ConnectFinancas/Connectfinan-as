export type ClientStatus = "ativo" | "em_breve";

export type Client = {
  slug: string;
  name: string;
  legalName: string;
  cnpj: string;
  segment: string;
  monogram: string;
  accent: string;
  accentDark: string;
  status: ClientStatus;
  responsible: string;
  regime: string;
  // Tema do painel (depois de selecionar o cliente). "dark" é o padrão.
  // "black-gold" é o tema exclusivo preto + dourado (usado pela Connect).
  theme?: "dark" | "light" | "black-gold";
};

export type MonthlyFinancials = {
  month: string;
  receita: number;
  despesa: number;
};

export type CashFlowPoint = {
  month: string;
  entradas: number;
  saidas: number;
  saldo: number;
};

export type DreLine = {
  label: string;
  value: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
  indent?: boolean;
  negative?: boolean;
};

export type Status = "pago" | "recebido" | "pendente" | "atrasado" | "agendado" | "conciliado" | "nao_conciliado";

export type Payable = {
  id: string;
  favorecido: string;
  categoria: string;
  classificacao: string;
  vencimento: string;
  valor: number;
  status: Status;
  pagamento?: string;
  descricao: string;
  conta?: string;
};

export type Receivable = {
  id: string;
  cliente: string;
  categoria: string;
  classificacao: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: Status;
  recebimento?: string;
  formaRecebimento?: string;
};

export type BankTransaction = {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  status: Status;
};

export type TaxObligation = {
  id: string;
  nome: string;
  competencia: string;
  vencimento: string;
  valor: number;
  status: Status;
};

export type ExpenseSlice = {
  label: string;
  value: number;
  color: string;
};

export type DreGridRow = {
  label: string;
  values: number[];
  acumulado: number;
  isHeader?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isSection?: boolean;
  indent?: boolean;
  negative?: boolean;
  expandable?: boolean;
};

export type CategoryGroup = {
  classificacao: string;
  color: string;
  padrao: boolean;
  categorias: { nome: string; padrao: boolean }[];
};

export type ClientFinanceData = {
  seedPayables: Payable[];
  seedReceivables: Receivable[];
  seedCategoriasPagar: CategoryGroup[];
  seedCategoriasReceber: CategoryGroup[];
  deducoesManuais: { impostos: number; inadimplencia: number; investimentos: number };
  // CMV (preço de custo do produto vendido) informado manualmente por mês — não vem dos
  // pagamentos a fornecedor em Contas a Pagar. Índice 0 = Jan, 11 = Dez. Ainda pendente de
  // preenchimento com valores reais para a maioria dos clientes.
  cmvManual?: number[];
  fluxoCaixaPeriodo: string;
  fluxoCaixaKpis: {
    saldoInicial: number;
    recebimentos: number;
    pagamentos: number;
    geracaoLiquida: number;
    geracaoLiquidaPct: number;
    saldoFinal: number;
    crescimentoCaixa: number;
  };
  faturamentoXRecebimentos: { faturamento: number; recebido: number; conversaoEmCaixa: number; diferenca: number };
  maioresRecebimentos: { data: string; valor: number; pctTotal: number }[];
  maioresPagamentos: { data: string; valor: number; pctTotal: number }[];
  indicesFinanceiros: { label: string; value: string }[];
  destaquesPeriodo: { title: string; desc: string }[];
  resumoExecutivo: string[];
  pontoDeAtencao: string;
};
