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
  // Só usado pela Stone (MJ Shoes): taxa da maquineta já discriminada no próprio relatório, sem
  // precisar ser calculada por diferença contra o valor da venda como é feito com o PagBank —
  // ver conciliarDiaMjShoes. "valor" nesse caso é o BRUTO da venda, sem descontar essa taxa.
  taxa?: number;
};

export type PagBankExtraido = {
  movimentos: MovimentoPagBank[];
};

export type MovimentoBradesco = {
  data: string; // ISO
  historico: string;
  valor: number; // positivo = entrada, negativo = saída; 0 quando valorLegivel é false
  /** false quando o OCR não conseguiu ler o valor com confiança — precisa ser corrigido manualmente. */
  valorLegivel?: boolean;
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
