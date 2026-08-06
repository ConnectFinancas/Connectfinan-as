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

export type Status = "pago" | "pendente" | "atrasado" | "agendado" | "conciliado" | "nao_conciliado";

export type Payable = {
  id: string;
  favorecido: string;
  categoria: string;
  vencimento: string;
  valor: number;
  status: Status;
};

export type Receivable = {
  id: string;
  cliente: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: Status;
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
