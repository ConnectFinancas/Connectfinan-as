import { categoryColor } from "@/lib/categoryColor";
import { deducoesManuais, dreMonths } from "@/lib/data/m4-logistica";
import { HOJE, isVencido, parseISO } from "@/lib/today";
import { CategoryGroup, DreGridRow, ExpenseSlice, MonthlyFinancials, Payable, Receivable, Status } from "@/lib/types";

export function displayStatus(status: Status, vencimento: string): Status {
  if (status === "pago" || status === "recebido") return status;
  return isVencido(vencimento) ? "atrasado" : "pendente";
}

function monthIndex(dateISO: string): number {
  return parseISO(dateISO).getMonth();
}

function monthTotals(items: { vencimento: string; valor: number }[]): number[] {
  const totals = Array(12).fill(0);
  for (const item of items) {
    totals[monthIndex(item.vencimento)] += item.valor;
  }
  return totals;
}

export function computeContasPagarKpis(payables: Payable[]) {
  const despesasPeriodo = payables.reduce((a, p) => a + p.valor, 0);
  const pago = payables.filter((p) => p.status === "pago").reduce((a, p) => a + p.valor, 0);
  const emAberto = despesasPeriodo - pago;
  const maiorValor = payables.reduce((a, p) => Math.max(a, p.valor), 0);
  const pagoPct = despesasPeriodo > 0 ? (pago / despesasPeriodo) * 100 : 0;
  return {
    despesasPeriodo: { value: despesasPeriodo, hint: `${payables.length} contas` },
    pago: { value: pago, hint: `${pagoPct.toFixed(0)}% do total` },
    emAberto: { value: emAberto, hint: "a pagar" },
    maiorValor: { value: maiorValor, hint: "no filtro atual" },
  };
}

export function computeContasReceberKpis(receivables: Receivable[]) {
  const totalPeriodo = receivables.reduce((a, r) => a + r.valor, 0);
  const recebido = receivables.filter((r) => r.status === "recebido").reduce((a, r) => a + r.valor, 0);
  const emAtraso = receivables
    .filter((r) => displayStatus(r.status, r.vencimento) === "atrasado")
    .reduce((a, r) => a + r.valor, 0);
  const aReceber = totalPeriodo - recebido;
  const recebidoPct = totalPeriodo > 0 ? (recebido / totalPeriodo) * 100 : 0;
  return {
    totalPeriodo: { value: totalPeriodo, hint: `${receivables.length} contas` },
    recebido: { value: recebido, hint: `${recebidoPct.toFixed(0)}% do total` },
    aReceber: { value: aReceber, hint: "em aberto" },
    emAtraso: { value: emAtraso, hint: "inadimplência" },
  };
}

export function computeMonthlyFinancials(payables: Payable[], receivables: Receivable[]): MonthlyFinancials[] {
  const receitaPorMes = monthTotals(receivables);
  const despesaPorMes = monthTotals(payables);
  return dreMonths.map((m, i) => ({
    month: `${m}/${String(anoCorrenteShort())}`,
    receita: round2(receitaPorMes[i]),
    despesa: round2(despesaPorMes[i]),
  }));
}

export function computeEvolucaoReceita(receivables: Receivable[]) {
  const receitaPorMes = monthTotals(receivables);
  let acumulado = 0;
  return dreMonths.map((m, i) => {
    acumulado += receitaPorMes[i];
    return { month: `${m}/${anoCorrenteShort()}`, acumulado: round2(acumulado) };
  });
}

export function computeSaidasPorClassificacao(payables: Payable[], categorias: CategoryGroup[]): ExpenseSlice[] {
  const byClass = new Map<string, number>();
  for (const p of payables) {
    byClass.set(p.classificacao, (byClass.get(p.classificacao) ?? 0) + p.valor);
  }
  return [...byClass.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label: titleCase(label),
      value: round2(value),
      color: categorias.find((c) => c.classificacao === label)?.color ?? categoryColor(label).fg,
    }));
}

export function computeReceitaPorServico(receivables: Receivable[]): ExpenseSlice[] {
  const byCategoria = new Map<string, number>();
  for (const r of receivables) {
    byCategoria.set(r.categoria, (byCategoria.get(r.categoria) ?? 0) + r.valor);
  }
  return [...byCategoria.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value: round2(value), color: categoryColor(label).fg }));
}

export function computeDreGrid(payables: Payable[], categorias: CategoryGroup[], receitaBruta: number[], acumReceita: number): DreGridRow[] {
  const cmvValues = monthTotals(payables.filter((p) => p.classificacao === "CMV"));
  const acumCmv = round2(cmvValues.reduce((a, v) => a + v, 0));

  const receitaLiquida = receitaBruta.map((v, i) => v - cmvValues[i]);
  const acumReceitaLiquida = round2(acumReceita - acumCmv);

  const { impostos, inadimplencia, investimentos } = deducoesManuais;
  const valorAGastar = receitaLiquida.map((v) => v); // deduções manuais aplicadas só no acumulado/valor final
  const acumValorAGastar = round2(acumReceitaLiquida - impostos - inadimplencia - investimentos);

  const classRows = categorias
    .filter((c) => c.classificacao !== "CMV")
    .map((c) => {
      const values = monthTotals(payables.filter((p) => p.classificacao === c.classificacao));
      const acumulado = round2(values.reduce((a, v) => a + v, 0));
      return { label: c.classificacao, values: values.map(round2), acumulado, negative: true, expandable: true };
    })
    .filter((row) => row.acumulado > 0 || categorias.find((c) => c.classificacao === row.label)?.padrao);

  const despesasTotaisValues = Array(12).fill(0);
  let acumDespesasTotais = 0;
  for (const row of classRows) {
    row.values.forEach((v, i) => (despesasTotaisValues[i] += v));
    acumDespesasTotais += row.acumulado;
  }
  acumDespesasTotais = round2(acumDespesasTotais);

  const geracaoDeCaixaValues = valorAGastar.map((v, i) => round2(v - despesasTotaisValues[i]));
  const acumGeracaoDeCaixa = round2(acumValorAGastar - acumDespesasTotais);

  const rows: DreGridRow[] = [
    { label: "RECEITA", values: receitaBruta.map(round2), acumulado: round2(acumReceita), isHeader: true, expandable: true },
    { label: "= Receita bruta", values: receitaBruta.map(round2), acumulado: round2(acumReceita), indent: true },
    { label: "(-) CMV", values: cmvValues.map(round2), acumulado: acumCmv, negative: true, expandable: true },
    { label: "= Receita líquida", values: receitaLiquida.map(round2), acumulado: acumReceitaLiquida, isSubtotal: true },
    { label: "(-) Impostos", values: Array(12).fill(0), acumulado: impostos, negative: true },
    { label: "(-) Inadimplência", values: Array(12).fill(0), acumulado: inadimplencia, negative: true },
    { label: "(-) Investimentos", values: Array(12).fill(0), acumulado: investimentos, negative: true },
    { label: "= Valor a gastar", values: valorAGastar.map(round2), acumulado: acumValorAGastar, isSubtotal: true },
    { label: "DESPESAS", values: [], acumulado: 0, isSection: true },
    ...classRows,
    { label: "= Despesas totais", values: despesasTotaisValues.map(round2), acumulado: acumDespesasTotais, isSubtotal: true, negative: true },
    { label: "= Geração de caixa", values: geracaoDeCaixaValues, acumulado: acumGeracaoDeCaixa, isTotal: true },
  ];

  return rows;
}

export function computeFinanceSummary(payables: Payable[], receivables: Receivable[], categoriasPagar: CategoryGroup[]) {
  const receitaBrutaPorMes = monthTotals(receivables);
  const acumReceita = round2(receitaBrutaPorMes.reduce((a, v) => a + v, 0));
  const despesasTotais = round2(payables.reduce((a, p) => a + p.valor, 0));

  const dreGrid = computeDreGrid(payables, categoriasPagar, receitaBrutaPorMes, acumReceita);
  const cmv = dreGrid.find((r) => r.label === "(-) CMV")?.acumulado ?? 0;
  const geracaoDeCaixa = dreGrid.find((r) => r.isTotal)?.acumulado ?? 0;
  const receitaLiquida = dreGrid.find((r) => r.label === "= Receita líquida")?.acumulado ?? 0;
  const deducoesDespesas = round2(acumReceita - geracaoDeCaixa);

  const mesAtual = HOJE.getMonth();
  const receitaMes = round2(receivables.filter((r) => monthIndex(r.vencimento) === mesAtual).reduce((a, r) => a + r.valor, 0));
  const saidasMes = round2(payables.filter((p) => monthIndex(p.vencimento) === mesAtual).reduce((a, p) => a + p.valor, 0));

  const mesesComMovimento = dreMonths.filter((_, i) => receitaBrutaPorMes[i] > 0 || monthTotals(payables)[i] > 0).length;
  const recebido = round2(receivables.filter((r) => r.status === "recebido").reduce((a, r) => a + r.valor, 0));
  const saidasPorClassificacao = computeSaidasPorClassificacao(payables, categoriasPagar);
  const maiorGrupoSaida = saidasPorClassificacao[0] ?? { label: "—", value: 0 };

  return {
    anoCorrente: 2026,
    resumoKpis: {
      receitaMes: { value: receitaMes },
      saidasMes: { value: saidasMes },
      resultadoMes: { value: round2(receitaMes - saidasMes) },
      receitaAcumulada: { value: acumReceita },
    },
    resumoDoAno: {
      receita: acumReceita,
      saidasTotais: despesasTotais,
      resultado: round2(acumReceita - despesasTotais),
    },
    indicadores: {
      margemResultado: acumReceita > 0 ? round2(((acumReceita - despesasTotais) / acumReceita) * 100) : 0,
      receitaRecebidaCaixa: acumReceita > 0 ? round2((recebido / acumReceita) * 100) : 0,
      maiorGrupoSaida: { label: maiorGrupoSaida.label, valor: maiorGrupoSaida.value },
      mesesComMovimento,
    },
    faturamentoKpis: {
      receitaDoAno: { value: acumReceita, hint: "faturamento (competência)" },
      receitaLiquida: { value: receitaLiquida, hint: "receita − CMV" },
      deducoesDespesas: { value: deducoesDespesas, hint: "CMV + impostos + despesas" },
      geracaoDeCaixa: { value: geracaoDeCaixa, hint: "resultado do ano" },
    },
    monthlyFinancials: computeMonthlyFinancials(payables, receivables),
    evolucaoReceitaAcumulada: computeEvolucaoReceita(receivables),
    saidasPorClassificacao,
    receitaPorServico: computeReceitaPorServico(receivables),
    dreGrid,
    cmv,
  };
}

function anoCorrenteShort() {
  return "26";
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function titleCase(s: string) {
  if (s === s.toUpperCase() && s.length > 4) {
    return s
      .toLowerCase()
      .split(" ")
      .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  }
  return s;
}
