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

// "vendaValor" fica undefined quando o item só existe do lado do banco (não tem venda
// correspondente no relatório de faturamento) — nesse caso o quadrado do sistema aparece em
// branco na tela, pronto pra criar um novo lançamento de recebimento a partir do valor do banco.
export type ItemConferencia<T> = {
  vendaValor?: number;
  vendaHora?: string;
  match?: T;
  /** Preenchido quando o usuário corrige manualmente o resultado da leitura automática. */
  matchInfo?: string;
  status: "conciliado" | "pendente";
};

export type PagamentoConciliacao = {
  origem: "bradesco" | "pagbank" | "caixa";
  data: string;
  historico: string;
  valor: number;
  tipo: "transferencia" | "pagamento";
  matchLancamento?: Payable;
  status: "conciliado" | "pendente";
  sugestao?: { favorecido: string; classificacao: string; categoria: string };
  /** Só em transferências: informação do outro lado do lançamento, pra mostrar os dois lados. */
  contraparte?: { origem: "bradesco" | "pagbank"; historico: string; data: string };
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

// Casa itens de mesmo valor (com tolerância de 1 centavo) — cada item do lado B só pode ser
// usado uma vez. Sobras do lado B (que não casaram com nenhum item do lado A) também entram no
// resultado, como um item "só do banco" (a undefined) — vira quadrado em branco do lado do
// sistema na tela, pra o usuário poder criar um novo lançamento a partir do valor do banco.
function casarPorValorComSobras<A extends { valor: number }, B extends { valor: number }>(
  itensA: A[],
  itensB: B[]
): { a?: A; b?: B }[] {
  const usados = new Set<number>();
  const pareados = itensA.map((a) => {
    const idx = itensB.findIndex((b, i) => !usados.has(i) && Math.abs(Math.abs(b.valor) - Math.abs(a.valor)) < 0.01);
    if (idx === -1) return { a };
    usados.add(idx);
    return { a, b: itensB[idx] };
  });
  const sobras = itensB.filter((_, i) => !usados.has(i)).map((b) => ({ b }));
  return [...pareados, ...sobras];
}

// Re-casa a seção "Dinheiro" depois que o usuário corrige um lançamento do caixa físico (valor
// digitado errado, por exemplo) — refaz o pareamento com as vendas em dinheiro do faturamento
// (que continuam as mesmas, só o lado do caixa mudou) pra já bater sozinho com o valor certo.
export function recalcularDinheiro(
  dinheiroAtual: ItemConferencia<MovimentoCaixaFisico>[],
  caixaAtualizado: MovimentoCaixaFisico[]
): ItemConferencia<MovimentoCaixaFisico>[] {
  const vendas = dinheiroAtual
    .filter((d) => d.vendaValor !== undefined)
    .map((d) => ({ valor: d.vendaValor!, hora: d.vendaHora }));
  const entradasCaixa = caixaAtualizado.filter((m) => (m.entrada ?? 0) > 0).map((m) => ({ ...m, valor: m.entrada! }));
  const casados = casarPorValorComSobras(vendas, entradasCaixa);
  return casados.map(({ a, b }) => ({
    vendaValor: a?.valor,
    vendaHora: a?.hora,
    match: b,
    status: b ? "conciliado" : "pendente",
  }));
}

// Tolerância de dias ao buscar um lançamento existente em Contas a Pagar pra uma saída do
// banco — o vencimento cadastrado nem sempre é exatamente o dia em que o banco debitou.
const TOLERANCIA_DIAS_PAGAMENTO = 3;

function diasEntre(a: string, b: string): number {
  const diffMs = Math.abs(new Date(`${a}T00:00:00`).getTime() - new Date(`${b}T00:00:00`).getTime());
  return Math.round(diffMs / 86400000);
}

// Casa cada venda no cartão com o crédito do PagBank mais próximo (só um pouco menor —
// a diferença é a taxa da maquineta), em vez de por posição/ordem de chegada: crédito e
// débito costumam ter prazos de liquidação diferentes, então a ordem no PagBank não bate
// necessariamente com a ordem das vendas do dia. Tolerância generosa (até 20% de taxa)
// cobre parcelamento; nunca casa um crédito MAIOR que a venda (sinal de venda errada).
// Créditos do PagBank que sobram (sem venda correspondente) também entram, como sobra.
const TOLERANCIA_TAXA_MAQUINETA = 0.2;

function casarCartaoPorTaxaComSobras(
  vendas: { valor: number; hora: string }[],
  creditos: MovimentoPagBank[]
): { a?: { valor: number; hora: string }; b?: MovimentoPagBank }[] {
  const usados = new Set<number>();
  const pareados = vendas.map((venda) => {
    let melhorIdx = -1;
    let melhorDiferenca = Infinity;
    creditos.forEach((credito, i) => {
      if (usados.has(i)) return;
      const diferenca = venda.valor - credito.valor;
      if (diferenca < -0.01 || diferenca > venda.valor * TOLERANCIA_TAXA_MAQUINETA) return;
      if (diferenca < melhorDiferenca) {
        melhorDiferenca = diferenca;
        melhorIdx = i;
      }
    });
    if (melhorIdx === -1) return { a: venda };
    usados.add(melhorIdx);
    return { a: venda, b: creditos[melhorIdx] };
  });
  const sobras = creditos.filter((_, i) => !usados.has(i)).map((b) => ({ b }));
  return [...pareados, ...sobras];
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
  payablesExistentes: Payable[],
  // Nomes que aparecem no extrato quando é a própria empresa do outro lado do lançamento (ex.:
  // "MJ PRIME", "MJ ELETRO") — usado pra detectar automaticamente uma saída do PagBank/Bradesco
  // que é na verdade uma transferência entre contas próprias, não uma despesa de verdade. Cada
  // cliente tem os seus (ver Client.titularKeywords); sem nenhum informado, nada é auto-detectado
  // como transferência — o usuário ainda pode marcar manualmente pelo botão na tela.
  titularKeywords: string[] = []
): ResultadoConciliacao {
  const titularKeywordsUpper = titularKeywords.map((k) => k.toUpperCase());
  function ehMesmoTitular(historico: string): boolean {
    const upper = historico.toUpperCase();
    return titularKeywordsUpper.some((k) => upper.includes(k));
  }

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

  // Baixa por baixa: cada venda casa com o crédito do PagBank mais próximo, respeitando que
  // o valor recebido só pode ser MENOR (a diferença é a taxa da maquineta).
  const cartaoCasados = casarCartaoPorTaxaComSobras(vendasCartao, creditosPagBank);
  const cartaoVendas: ItemConferencia<MovimentoPagBank>[] = cartaoCasados.map(({ a, b }) => ({
    vendaValor: a?.valor,
    vendaHora: a?.hora,
    match: b,
    status: b ? "conciliado" : "pendente",
  }));

  // ---------- Pix: vendas faturadas x recebidos no Bradesco ----------
  const vendasPix = faturamento.vendas.filter((v) => v.forma === "PIX");
  const pixRecebidosBradesco = bradesco.movimentos.filter((m) => m.valor > 0 && /pix recebido/i.test(m.historico) && !ehMesmoTitular(m.historico));
  const pixCasados = casarPorValorComSobras(vendasPix, pixRecebidosBradesco);
  const pix: ItemConferencia<MovimentoBradesco>[] = pixCasados.map(({ a, b }) => ({
    vendaValor: a?.valor,
    vendaHora: a?.hora,
    match: b,
    status: b ? "conciliado" : "pendente",
  }));

  // ---------- Dinheiro/Espécie: vendas faturadas x caixa físico ----------
  const vendasDinheiro = faturamento.vendas.filter((v) => v.forma === "DINHEIRO");
  const entradasCaixa = caixa.movimentos.filter((m) => (m.entrada ?? 0) > 0).map((m) => ({ ...m, valor: m.entrada! }));
  const dinheiroCasados = casarPorValorComSobras(vendasDinheiro, entradasCaixa);
  const dinheiro: ItemConferencia<MovimentoCaixaFisico>[] = dinheiroCasados.map(({ a, b }) => ({
    vendaValor: a?.valor,
    vendaHora: a?.hora,
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
      const destino = entradasBradescoMesmoTitular[destinoIdx];
      pagamentos.push({
        origem: "pagbank",
        data: saida.data,
        historico: saida.descricao,
        valor: valorAbs,
        tipo: "transferencia",
        status: "pendente",
        contraparte: { origem: "bradesco", historico: destino.historico, data: destino.data },
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

  // ---------- Saídas do caixa físico (despesas pagas em espécie) ----------
  const saidasCaixa = caixa.movimentos.filter((m) => (m.saida ?? 0) > 0);
  for (const saida of saidasCaixa) {
    const valorAbs = saida.saida!;
    const matchLancamento = buscarLancamentoProximo(payablesExistentes, valorAbs, data);
    pagamentos.push({
      origem: "caixa",
      data: saida.data,
      historico: saida.historico,
      valor: valorAbs,
      tipo: "pagamento",
      matchLancamento,
      status: matchLancamento ? "conciliado" : "pendente",
      sugestao: !matchLancamento
        ? { favorecido: "—", classificacao: saida.classificacao || "DESPESAS ADMINISTRATIVAS", categoria: saida.categoria || "" }
        : undefined,
    });
  }

  // ---------- Saídas do Bradesco: pagamentos a fornecedor / despesas ----------
  // Inclui também lançamentos com valor não lido pelo OCR (valorLegivel === false) — o
  // valor chega como 0, mas o usuário precisa VER esse lançamento na tela pra poder
  // corrigi-lo manualmente, em vez de ele simplesmente desaparecer da conciliação.
  const saidasBradesco = bradesco.movimentos.filter((m) => m.valor < 0 || m.valorLegivel === false);
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
