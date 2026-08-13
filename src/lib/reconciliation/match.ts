import { Payable } from "@/lib/types";
import {
  BradescoExtraido,
  CaixaFisicoExtraido,
  FaturamentoExtraido,
  MovimentoBradesco,
  MovimentoCaixaFisico,
  MovimentoPagBank,
  PagBankExtraido,
} from "./types";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export type ItemConferencia<T> = {
  vendaValor: number;
  vendaHora?: string;
  match?: T;
  /** Preenchido quando o usuário corrige manualmente o resultado da leitura automática. */
  matchInfo?: string;
  status: "conciliado" | "pendente";
};

export type PagamentoConciliacao = {
  origem: "bradesco" | "pagbank";
  data: string;
  historico: string;
  valor: number;
  tipo: "transferencia" | "pagamento";
  matchLancamento?: Payable;
  status: "conciliado" | "pendente";
  sugestao?: { favorecido: string; classificacao: string; categoria: string };
};

export type ResultadoConciliacao = {
  data: string;
  cartao: {
    faturamentoTotal: number;
    faturamentoQtd: number;
    pagbankTotal: number;
    pagbankQtd: number;
    diferenca: number;
    quantidadeBate: boolean;
    valorBate: boolean;
  };
  cartaoVendas: ItemConferencia<MovimentoPagBank>[];
  pix: ItemConferencia<MovimentoBradesco>[];
  dinheiro: ItemConferencia<MovimentoCaixaFisico>[];
  pagamentos: PagamentoConciliacao[];
  totalPendencias: number;
};

// Casa itens de mesmo valor (com tolerância de 1 centavo) — cada item do lado B só pode
// ser usado uma vez. Estratégia gulosa simples: já é suficiente aqui pois os valores das
// vendas avulsas raramente colidem no mesmo dia.
function casarPorValor<A extends { valor: number }, B extends { valor: number }>(
  itensA: A[],
  itensB: B[]
): { a: A; b?: B }[] {
  const usados = new Set<number>();
  return itensA.map((a) => {
    const idx = itensB.findIndex((b, i) => !usados.has(i) && Math.abs(Math.abs(b.valor) - Math.abs(a.valor)) < 0.01);
    if (idx === -1) return { a };
    usados.add(idx);
    return { a, b: itensB[idx] };
  });
}

// Tolerância de dias ao buscar um lançamento existente em Contas a Pagar pra uma saída do
// banco — o vencimento cadastrado nem sempre é exatamente o dia em que o banco debitou.
const TOLERANCIA_DIAS_PAGAMENTO = 3;

function diasEntre(a: string, b: string): number {
  const diffMs = Math.abs(new Date(`${a}T00:00:00`).getTime() - new Date(`${b}T00:00:00`).getTime());
  return Math.round(diffMs / 86400000);
}

const TITULAR_KEYWORDS = ["MJ PRIME", "MJ ELETRO"];

function ehMesmoTitular(historico: string): boolean {
  const upper = historico.toUpperCase();
  return TITULAR_KEYWORDS.some((k) => upper.includes(k));
}

// Busca o Contas a Pagar existente mais próximo (mesmo valor, dentro da tolerância de dias) —
// entre os candidatos empatados, prefere o de data mais próxima da saída bancária.
function buscarLancamentoProximo(payables: Payable[], valorAbs: number, dataReferencia: string): Payable | undefined {
  const candidatos = payables
    .filter((p) => Math.abs(p.valor - valorAbs) < 0.01 && diasEntre(p.vencimento, dataReferencia) <= TOLERANCIA_DIAS_PAGAMENTO)
    .sort((a, b) => diasEntre(a.vencimento, dataReferencia) - diasEntre(b.vencimento, dataReferencia));
  return candidatos[0];
}

function sugerirFavorecido(historico: string): string {
  return historico
    .replace(/PAGTO ELETRON COBRANCA/gi, "")
    .replace(/TRANSF CC PARA CC/gi, "")
    .replace(/TED[- ]?TRANSF ELET DISPON/gi, "")
    .replace(/REMET\.?/gi, "")
    .trim() || "—";
}

export function conciliarDia(
  data: string,
  faturamento: FaturamentoExtraido,
  pagbank: PagBankExtraido,
  bradesco: BradescoExtraido,
  caixa: CaixaFisicoExtraido,
  payablesExistentes: Payable[]
): ResultadoConciliacao {
  // ---------- Cartão (crédito + débito) x PagBank ----------
  const vendasCartao = faturamento.vendas.filter((v) => v.forma === "CARTAO DE CREDITO" || v.forma === "CARTAO DE DEBITO");
  const creditosPagBank = pagbank.movimentos.filter((m) => m.valor > 0 && /disponivel/i.test(m.descricao));

  const faturamentoTotal = round2(vendasCartao.reduce((a, v) => a + v.valor, 0));
  const pagbankTotal = round2(creditosPagBank.reduce((a, m) => a + m.valor, 0));
  const diferenca = round2(faturamentoTotal - pagbankTotal);

  const cartao = {
    faturamentoTotal,
    faturamentoQtd: vendasCartao.length,
    pagbankTotal,
    pagbankQtd: creditosPagBank.length,
    diferenca,
    quantidadeBate: vendasCartao.length === creditosPagBank.length,
    valorBate: diferenca >= 0, // negativo indicaria PagBank creditando mais que o faturado — sinal de algo errado
  };

  // Baixa por baixa: diferente de Pix/Dinheiro, o crédito de cada venda no PagBank normalmente
  // NÃO chega com o mesmo valor da venda (a maquininha desconta a taxa por transação, ou os
  // valores vêm antecipados/agrupados de outro jeito) — casar por valor exato deixava tudo
  // como "pendente" mesmo quando a quantidade batia certinho. Em vez disso, casa por posição
  // (ordem de chegada) quando a quantidade de vendas bate com a quantidade de créditos — é o
  // mesmo critério que já validava o card-resumo do cartão (quantidadeBate).
  const cartaoVendas: ItemConferencia<MovimentoPagBank>[] = vendasCartao.map((venda, i) => {
    const match = vendasCartao.length === creditosPagBank.length ? creditosPagBank[i] : undefined;
    return {
      vendaValor: venda.valor,
      vendaHora: venda.hora,
      match,
      status: match ? "conciliado" : "pendente",
    };
  });

  // ---------- Pix: vendas faturadas x recebidos no Bradesco ----------
  const vendasPix = faturamento.vendas.filter((v) => v.forma === "PIX");
  const pixRecebidosBradesco = bradesco.movimentos.filter((m) => m.valor > 0 && /pix recebido/i.test(m.historico) && !ehMesmoTitular(m.historico));
  const pixCasados = casarPorValor(vendasPix, pixRecebidosBradesco);
  const pix: ItemConferencia<MovimentoBradesco>[] = pixCasados.map(({ a, b }) => ({
    vendaValor: a.valor,
    vendaHora: a.hora,
    match: b,
    status: b ? "conciliado" : "pendente",
  }));

  // ---------- Dinheiro/Espécie: vendas faturadas x caixa físico ----------
  const vendasDinheiro = faturamento.vendas.filter((v) => v.forma === "DINHEIRO");
  const entradasCaixa = caixa.movimentos.filter((m) => (m.entrada ?? 0) > 0).map((m) => ({ ...m, valor: m.entrada! }));
  const dinheiroCasados = casarPorValor(vendasDinheiro, entradasCaixa);
  const dinheiro: ItemConferencia<MovimentoCaixaFisico>[] = dinheiroCasados.map(({ a, b }) => ({
    vendaValor: a.valor,
    vendaHora: a.hora,
    match: b,
    status: b ? "conciliado" : "pendente",
  }));

  // ---------- Saídas do PagBank (transferências / não identificado) ----------
  const pagamentos: PagamentoConciliacao[] = [];
  const entradasBradescoMesmoTitular = bradesco.movimentos.filter((m) => m.valor > 0 && ehMesmoTitular(m.historico));
  const saidasPagBank = pagbank.movimentos.filter((m) => m.valor < 0 && !/reserva de saldo/i.test(m.descricao));

  for (const saida of saidasPagBank) {
    const valorAbs = Math.abs(saida.valor);
    const destinoIdx = entradasBradescoMesmoTitular.findIndex((e) => Math.abs(e.valor - valorAbs) < 0.01);
    if (destinoIdx !== -1) {
      pagamentos.push({
        origem: "pagbank",
        data: saida.data,
        historico: `Transferência PagBank → ${entradasBradescoMesmoTitular[destinoIdx].historico}`,
        valor: valorAbs,
        tipo: "transferencia",
        status: "conciliado",
      });
      entradasBradescoMesmoTitular.splice(destinoIdx, 1);
    } else {
      pagamentos.push({
        origem: "pagbank",
        data: saida.data,
        historico: saida.descricao,
        valor: valorAbs,
        tipo: "pagamento",
        status: "pendente",
        sugestao: { favorecido: sugerirFavorecido(saida.descricao), classificacao: "DESPESAS ADMINISTRATIVAS", categoria: "" },
      });
    }
  }

  // ---------- Saídas do Bradesco: pagamentos a fornecedor / despesas ----------
  const saidasBradesco = bradesco.movimentos.filter((m) => m.valor < 0);
  for (const saida of saidasBradesco) {
    const valorAbs = Math.abs(saida.valor);
    const ehTransferenciaMesmoTitular = ehMesmoTitular(saida.historico);
    const matchLancamento = buscarLancamentoProximo(payablesExistentes, valorAbs, data);

    pagamentos.push({
      origem: "bradesco",
      data: saida.data,
      historico: saida.historico,
      valor: valorAbs,
      tipo: ehTransferenciaMesmoTitular ? "transferencia" : "pagamento",
      matchLancamento,
      status: matchLancamento || ehTransferenciaMesmoTitular ? "conciliado" : "pendente",
      sugestao:
        !matchLancamento && !ehTransferenciaMesmoTitular
          ? { favorecido: sugerirFavorecido(saida.historico), classificacao: "DESPESAS ADMINISTRATIVAS", categoria: "" }
          : undefined,
    });
  }

  const totalPendencias =
    cartaoVendas.filter((v) => v.status === "pendente").length +
    pix.filter((p) => p.status === "pendente").length +
    dinheiro.filter((d) => d.status === "pendente").length +
    pagamentos.filter((p) => p.status === "pendente" && p.tipo === "pagamento").length;

  return { data, cartao, cartaoVendas, pix, dinheiro, pagamentos, totalPendencias };
}
