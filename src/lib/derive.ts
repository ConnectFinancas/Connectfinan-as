import { categoryColor } from "@/lib/categoryColor";
import { dreMonths, fullMonthNames } from "@/lib/constants";
import { formatDateBR, HOJE, isVencido, parseISO } from "@/lib/today";
import { CategoryGroup, DreGridRow, ExpenseSlice, MonthlyFinancials, Payable, Receivable, Status } from "@/lib/types";

type DeducoesManuais = { impostos: number; inadimplencia: number; investimentos: number };

// Categoria usada nos lançamentos de pagamento a fornecedor (custo de mercadoria vendida).
// Esses lançamentos ficam em Contas a Pagar mas NÃO entram no DRE — o CMV do DRE é informado
// manualmente por mês (cmvManual), pois a análise estratégica é pelo preço de custo do produto
// vendido, não pelo que foi pago ao fornecedor no período. CSV (custo sobre serviços) continua
// somado automaticamente a partir dos lançamentos.
const CUSTO_MERCADORIA_CATEGORIA = "Custo sobre Mercadorias Vendidas";

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

export function computeSaidasPorClassificacao(
  payables: Payable[],
  categorias: CategoryGroup[],
  cmvManual: number[] = Array(12).fill(0)
): ExpenseSlice[] {
  const byClass = new Map<string, number>();
  for (const p of payables) {
    // Pagamento a fornecedor não entra no DRE (ver computeDreGrid) — mantido fora daqui também
    // para o "Saídas por classificação" bater com o "Saídas totais" do Resumo.
    if (p.classificacao === "CMV" && p.categoria === CUSTO_MERCADORIA_CATEGORIA) continue;
    byClass.set(p.classificacao, (byClass.get(p.classificacao) ?? 0) + p.valor);
  }
  const cmvManualTotal = cmvManual.reduce((a, v) => a + v, 0);
  if (cmvManualTotal > 0) {
    byClass.set("CMV", (byClass.get("CMV") ?? 0) + cmvManualTotal);
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

export function computeDreGrid(
  payables: Payable[],
  categorias: CategoryGroup[],
  receitaBruta: number[],
  acumReceita: number,
  deducoesManuais: DeducoesManuais,
  cmvManual: number[] = Array(12).fill(0)
): DreGridRow[] {
  // CMV do DRE = CSV (custo sobre serviços, automático via lançamentos) + CMV manual do mês
  // (preço de custo do produto vendido, informado à parte). Pagamentos a fornecedor NÃO entram aqui.
  const csvAutoValues = monthTotals(
    payables.filter((p) => p.classificacao === "CMV" && p.categoria !== CUSTO_MERCADORIA_CATEGORIA)
  );
  const cmvValues = csvAutoValues.map((v, i) => round2(v + (cmvManual[i] ?? 0)));
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

// Pagamentos a fornecedor (custo de mercadoria) não entram no DRE, mas ficam disponíveis aqui
// para o detalhamento do mês — total e dividido por fornecedor quando identificado.
export function computePagamentosFornecedores(payables: Payable[], mesIndex: number) {
  const items = payables.filter(
    (p) => p.classificacao === "CMV" && p.categoria === CUSTO_MERCADORIA_CATEGORIA && monthIndex(p.vencimento) === mesIndex
  );
  const total = round2(items.reduce((a, p) => a + p.valor, 0));
  const porFornecedor = new Map<string, number>();
  for (const p of items) {
    const key = p.favorecido && p.favorecido !== "—" ? p.favorecido : "Não identificado";
    porFornecedor.set(key, round2((porFornecedor.get(key) ?? 0) + p.valor));
  }
  return {
    total,
    quantidade: items.length,
    porFornecedor: [...porFornecedor.entries()]
      .map(([fornecedor, valor]) => ({ fornecedor, valor }))
      .sort((a, b) => b.valor - a.valor),
  };
}

// Detalhamento do mês: classificação → categoria → lançamentos, com % de representatividade
// sobre o total de saídas do mês (usado no painel "Detalhamento por mês" do DRE).
export function computeDetalhamentoMes(payables: Payable[], categoriasPagar: CategoryGroup[], mesIndex: number) {
  const doMes = payables.filter((p) => monthIndex(p.vencimento) === mesIndex);
  const totalMes = round2(doMes.reduce((a, p) => a + p.valor, 0));

  const porClassificacao = new Map<string, Payable[]>();
  for (const p of doMes) {
    if (!porClassificacao.has(p.classificacao)) porClassificacao.set(p.classificacao, []);
    porClassificacao.get(p.classificacao)!.push(p);
  }

  const classificacoes = [...porClassificacao.entries()]
    .map(([classificacao, items]) => {
      const valor = round2(items.reduce((a, p) => a + p.valor, 0));
      const porCategoria = new Map<string, Payable[]>();
      for (const p of items) {
        if (!porCategoria.has(p.categoria)) porCategoria.set(p.categoria, []);
        porCategoria.get(p.categoria)!.push(p);
      }
      const categorias = [...porCategoria.entries()]
        .map(([categoria, lancamentos]) => {
          const valorCategoria = round2(lancamentos.reduce((a, p) => a + p.valor, 0));
          return {
            categoria,
            valor: valorCategoria,
            pctDoTotal: totalMes > 0 ? round2((valorCategoria / totalMes) * 100) : 0,
            lancamentos: [...lancamentos].sort((a, b) => a.vencimento.localeCompare(b.vencimento)),
          };
        })
        .sort((a, b) => b.valor - a.valor);
      return {
        classificacao,
        valor,
        pctDoTotal: totalMes > 0 ? round2((valor / totalMes) * 100) : 0,
        color: categoriasPagar.find((c) => c.classificacao === classificacao)?.color ?? categoryColor(classificacao).fg,
        categorias,
      };
    })
    .sort((a, b) => b.valor - a.valor);

  return { mes: dreMonths[mesIndex], totalMes, classificacoes };
}

export function computeFinanceSummary(
  payables: Payable[],
  receivables: Receivable[],
  categoriasPagar: CategoryGroup[],
  deducoesManuais: DeducoesManuais,
  cmvManual: number[] = Array(12).fill(0)
) {
  const receitaBrutaPorMes = monthTotals(receivables);
  const acumReceita = round2(receitaBrutaPorMes.reduce((a, v) => a + v, 0));

  const dreGrid = computeDreGrid(payables, categoriasPagar, receitaBrutaPorMes, acumReceita, deducoesManuais, cmvManual);
  const cmv = dreGrid.find((r) => r.label === "(-) CMV")?.acumulado ?? 0;
  const geracaoDeCaixa = dreGrid.find((r) => r.isTotal)?.acumulado ?? 0;
  const receitaLiquida = dreGrid.find((r) => r.label === "= Receita líquida")?.acumulado ?? 0;
  const deducoesDespesas = round2(acumReceita - geracaoDeCaixa);
  // Despesas totais do "Resumo do ano": consistentes com o DRE (exclui pagamentos a
  // fornecedor, que não entram no demonstrativo — ver computeDreGrid).
  const despesasTotais = round2(acumReceita - geracaoDeCaixa);

  // Mês de referência do Resumo: o mês mais recente (até hoje) que teve algum lançamento,
  // em vez do mês fixo de "hoje" — evita mostrar R$ 0,00 em clientes cujo período informado já passou.
  const despesaPorMesResumo = monthTotals(payables);
  let mesReferencia = HOJE.getMonth();
  for (let i = Math.min(HOJE.getMonth(), 11); i >= 0; i--) {
    if (receitaBrutaPorMes[i] > 0 || despesaPorMesResumo[i] > 0) {
      mesReferencia = i;
      break;
    }
  }
  const receitaMes = round2(receivables.filter((r) => monthIndex(r.vencimento) === mesReferencia).reduce((a, r) => a + r.valor, 0));
  const saidasMes = round2(payables.filter((p) => monthIndex(p.vencimento) === mesReferencia).reduce((a, p) => a + p.valor, 0));
  const mesReferenciaLabel = `${fullMonthNames[mesReferencia]}/2026`;

  const mesesComMovimento = dreMonths.filter((_, i) => receitaBrutaPorMes[i] > 0 || monthTotals(payables)[i] > 0).length;
  const recebido = round2(receivables.filter((r) => r.status === "recebido").reduce((a, r) => a + r.valor, 0));
  const saidasPorClassificacao = computeSaidasPorClassificacao(payables, categoriasPagar, cmvManual);
  const maiorGrupoSaida = saidasPorClassificacao[0] ?? { label: "—", value: 0 };

  return {
    anoCorrente: 2026,
    resumoKpis: {
      receitaMes: { value: receitaMes, mesLabel: mesReferenciaLabel },
      saidasMes: { value: saidasMes, mesLabel: mesReferenciaLabel },
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

// Fluxo de Caixa é por regime de CAIXA (data de recebimento/pagamento efetivo), diferente do
// resto do sistema (DRE/Resumo), que é por competência (vencimento) — por isso tem uma conta
// própria em vez de reusar computeFinanceSummary. Sem saldo bancário inicial cadastrado no
// sistema ainda, o saldo inicial do período fica em zero (só a geração líquida do período conta).
export function computeFluxoCaixa(payables: Payable[], receivables: Receivable[]) {
  const recebidos = receivables.filter((r) => r.status === "recebido" && r.recebimento);
  const pagos = payables.filter((p) => p.status === "pago" && p.pagamento);

  const mesesComMovimento = new Set<number>();
  recebidos.forEach((r) => mesesComMovimento.add(monthIndex(r.recebimento!)));
  pagos.forEach((p) => mesesComMovimento.add(monthIndex(p.pagamento!)));
  let mesReferencia = HOJE.getMonth();
  for (let i = Math.min(HOJE.getMonth(), 11); i >= 0; i--) {
    if (mesesComMovimento.has(i)) {
      mesReferencia = i;
      break;
    }
  }
  const fluxoCaixaPeriodo = `${fullMonthNames[mesReferencia]}/2026`;

  const recebidosMes = recebidos.filter((r) => monthIndex(r.recebimento!) === mesReferencia);
  const pagosMes = pagos.filter((p) => monthIndex(p.pagamento!) === mesReferencia);
  const recebimentos = round2(recebidosMes.reduce((a, r) => a + r.valor, 0));
  const pagamentos = round2(pagosMes.reduce((a, p) => a + p.valor, 0));
  const geracaoLiquida = round2(recebimentos - pagamentos);
  const geracaoLiquidaPct = recebimentos > 0 ? round2((geracaoLiquida / recebimentos) * 100) : 0;

  const saldoInicial = 0;
  const saldoFinal = round2(saldoInicial + geracaoLiquida);
  const crescimentoCaixa = recebimentos > 0 || pagamentos > 0 ? geracaoLiquidaPct : 0;

  const faturamentoMes = round2(
    receivables.filter((r) => monthIndex(r.vencimento) === mesReferencia).reduce((a, r) => a + r.valor, 0)
  );
  const conversaoEmCaixa = faturamentoMes > 0 ? round2((recebimentos / faturamentoMes) * 100) : 0;
  const diferenca = round2(faturamentoMes - recebimentos);

  const maioresRecebimentos = [...recebidosMes]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5)
    .map((r) => ({ data: formatDateBR(r.recebimento!), valor: r.valor, pctTotal: recebimentos > 0 ? round2((r.valor / recebimentos) * 100) : 0 }));

  const maioresPagamentos = [...pagosMes]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5)
    .map((p) => ({ data: formatDateBR(p.pagamento!), valor: p.valor, pctTotal: pagamentos > 0 ? round2((p.valor / pagamentos) * 100) : 0 }));

  const indicesFinanceiros = [
    { label: "Índice de geração de caixa", value: recebimentos > 0 ? `${geracaoLiquidaPct.toFixed(1)}%` : "—" },
    { label: "Índice de consumo de caixa", value: recebimentos > 0 ? `${round2((pagamentos / recebimentos) * 100).toFixed(1)}%` : "—" },
    { label: "Conversão do faturamento", value: faturamentoMes > 0 ? `${conversaoEmCaixa.toFixed(1)}%` : "—" },
    { label: "Variação do caixa no período", value: `${crescimentoCaixa >= 0 ? "+" : ""}${crescimentoCaixa.toFixed(1)}%` },
  ];

  return {
    fluxoCaixaPeriodo,
    fluxoCaixaKpis: { saldoInicial, recebimentos, pagamentos, geracaoLiquida, geracaoLiquidaPct, saldoFinal, crescimentoCaixa },
    faturamentoXRecebimentos: { faturamento: faturamentoMes, recebido: recebimentos, conversaoEmCaixa, diferenca },
    maioresRecebimentos,
    maioresPagamentos,
    indicesFinanceiros,
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
