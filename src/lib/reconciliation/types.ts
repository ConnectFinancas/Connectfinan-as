export type FormaPagamento = "CARTAO DE CREDITO" | "CARTAO DE DEBITO" | "DINHEIRO" | "PIX" | "BOLETO" | "TRANSFERENCIA" | "OUTROS";

export type VendaExtraida = {
  data: string; // ISO yyyy-mm-dd
  hora: string;
  vendedor: string;
  valor: number;
  forma: FormaPagamento;
};

export type FaturamentoExtraido = {
  vendas: VendaExtraida[];
  totalPorForma: Record<string, number>;
  totalGeral: number;
};

export type MovimentoPagBank = {
  data: string; // ISO
  descricao: string;
  valor: number; // positivo = entrada, negativo = saída
};

export type PagBankExtraido = {
  movimentos: MovimentoPagBank[];
};

export type MovimentoBradesco = {
  data: string; // ISO
  historico: string;
  valor: number; // positivo = entrada, negativo = saída
};

export type BradescoExtraido = {
  movimentos: MovimentoBradesco[];
  viaOcr: boolean;
};

export type MovimentoCaixaFisico = {
  data: string; // ISO
  historico: string;
  entrada?: number;
  saida?: number;
  classificacao?: string; // só se saida
  categoria?: string; // só se saida
};

export type CaixaFisicoExtraido = {
  movimentos: MovimentoCaixaFisico[];
};
