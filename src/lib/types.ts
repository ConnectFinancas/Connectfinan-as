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
  // Quando definido, "Acessar painel" abre esse link externo em vez do painel interno.
  externalUrl?: string;
  // Nomes que aparecem no extrato bancário quando é a própria empresa (ex.: um nome fantasia
  // usado em outra conta) — usado na Conciliação Bancária pra detectar automaticamente
  // transferências entre contas próprias. Sem isso, o padrão é o próprio nome do cliente.
  titularKeywords?: string[];
  // "financeiro" (padrão) mostra o painel financeiro normal (DRE, Contas a Pagar/Receber etc.).
  // "tarefas" troca todo o painel por um quadro de tarefas estilo Todoist — usado pra clientes
  // que na verdade são espaços de organização interna, não empresas com financeiro de verdade.
  tipo?: "financeiro" | "tarefas";
  // Quando true, esconde a aba "Conciliação Bancária" do menu do cliente — usado quando a
  // conciliação já é feita fora do sistema (ex.: direto no Conta Azul), como a Store Pluss.
  conciliacaoExterna?: boolean;
  // Quando true, mostra a aba "Informações do DRE" — onde a receita/CMV/comissão por
  // marketplace são digitadas manualmente (ver ClientFinanceData.marketplaceManual).
  temInformacoesDre?: boolean;
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
  // Em qual conta bancária o valor entrou (ex.: "Bradesco", "PagBank", "Caixa Físico") — distinto
  // de formaRecebimento (que é o MEIO de pagamento, ex.: Pix/Cartão). Usado pelo ledger de Contas.
  conta?: string;
};

// Transferência entre contas da própria empresa (ex.: PagBank → Bradesco) — nunca entra no DRE
// nem em Contas a Pagar/Receber, só aparece como um movimento de saída numa conta e entrada na
// outra na tela de Contas.
export type TransferenciaConta = {
  id: string;
  data: string;
  valor: number;
  contaOrigem: string;
  contaDestino: string;
  descricao: string;
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

// Marketplaces em que a Store Pluss vende — receita, CMV e comissão de cada um são digitados
// manualmente (vêm de fora do sistema), não de Contas a Receber/Pagar. Cada array tem 12
// posições (índice 0 = Jan, 11 = Dez).
export type MarketplaceCanal = "mercadoLivre" | "shopee" | "shein" | "tiktok";
export type MarketplaceMensal = {
  receita: number[];
  cmv: number[];
  comissao: number[];
  // Frete que a própria plataforma desconta direto do repasse (ex.: Tiktok Shop, Mercado
  // Envios) — vira linha própria no DRE, separada do "Frete pago" (Contas a Pagar). Existe em
  // todos os canais pra manter o formato uniforme, mas só é exibido/usado nos que o cliente pediu.
  freteDescontado: number[];
};

// Uma linha de dedução do DRE que aparece destacada, entre a Receita e o "Lucro Bruto ou Valor a
// Gastar" — em vez de cair genericamente na seção de Despesas lá embaixo. A fonte pode ser: o
// total de uma ou mais classificações inteiras de Contas a Pagar, categorias específicas dentro
// de classificações (pra separar sem duplicar), ou um campo digitado manualmente por marketplace.
export type LinhaDestaqueDre = {
  rotulo: string;
  classificacoes?: string[];
  categorias?: { classificacao: string; categoria: string }[];
  marketplaceCampo?: { canal: MarketplaceCanal; campo: keyof MarketplaceMensal };
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
  // Classificações de Contas a Pagar que NÃO entram no DRE (nem em despesa nem em CMV) — usado
  // quando esse custo já está representado de outra forma (ex.: CMV informado por marketplace).
  classificacoesForaDoDre?: string[];
  // Classificações de Contas a Pagar que entram no DRE dentro do detalhamento do CMV, em vez de
  // como linha de despesa própria — ex.: insumos/embalagens que compõem o custo do produto.
  classificacoesNoCmv?: string[];
  // Receita/CMV/comissão por marketplace, digitados manualmente (ver MarketplaceMensal acima).
  // Quando presente, soma automaticamente na RECEITA e no CMV do DRE, e a Comissão vira uma
  // linha própria de dedução.
  marketplaceManual?: Record<MarketplaceCanal, MarketplaceMensal>;
  // Linhas de dedução destacadas do DRE (frete pago, devoluções, impostos etc.), na ordem em que
  // aparecem entre a Receita e o "Lucro Bruto ou Valor a Gastar" — ver LinhaDestaqueDre acima.
  // Quando presente, substitui o fluxo padrão de "Receita Líquida" + deducoesManuais por esse.
  linhasDestaqueDre?: LinhaDestaqueDre[];
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
