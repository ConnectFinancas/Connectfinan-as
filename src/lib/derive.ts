import { categoryColor } from "@/lib/categoryColor";
import { dreMonths, fullMonthNames } from "@/lib/constants";
import { formatDateBR, HOJE, isVencido, parseISO } from "@/lib/today";
import {
  CategoryGroup,
  DreGridRow,
  ExpenseSlice,
  LinhaDestaqueDre,
  MarketplaceCanal,
  MarketplaceMensal,
  MonthlyFinancials,
  Payable,
  Receivable,
  Status,
} from "@/lib/types";

type DeducoesManuais = { impostos: number; inadimplencia: number; investimentos: number };

export const MARKETPLACE_LABELS: Record<MarketplaceCanal, string> = {
  mercadoLivre: "Mercado Livre",
  shopee: "Shopee",
  shein: "Shein",
  tiktok: "TikTok Shop",
};

export function emptyMarketplaceManual(): Record<MarketplaceCanal, MarketplaceMensal> {
  const canal = (): MarketplaceMensal => ({
    receita: Array(12).fill(0),
    cmv: Array(12).fill(0),
    comissao: Array(12).fill(0),
    freteDescontado: Array(12).fill(0),
  });
  return { mercadoLivre: canal(), shopee: canal(), shein: canal(), tiktok: canal() };
}

// Configuração de DRE específica de um cliente — ver campos equivalentes em ClientFinanceData.
type DreConfig = {
  classificacoesForaDoDre?: string[];
  classificacoesNoCmv?: string[];
  marketplaceManual?: Record<MarketplaceCanal, MarketplaceMensal>;
  linhasDestaqueDre?: LinhaDestaqueDre[];
};

// Total mensal de uma linha de destaque do DRE — soma classificações inteiras, categorias
// específicas, ou um campo digitado manualmente por marketplace (ver LinhaDestaqueDre).
function valoresDestaque(
  payables: Payable[],
  marketplaceManual: Record<MarketplaceCanal, MarketplaceMensal> | undefined,
  linha: LinhaDestaqueDre
): number[] {
  if (linha.classificacoes) {
    return monthTotals(payables.filter((p) => linha.classificacoes!.includes(p.classificacao)));
  }
  if (linha.categorias) {
    const chaves = new Set(linha.categorias.map((c) => `${c.classificacao}|${c.categoria}`));
    return monthTotals(payables.filter((p) => chaves.has(`${p.classificacao}|${p.categoria}`)));
  }
  if (linha.marketplaceCampo && marketplaceManual) {
    return marketplaceManual[linha.marketplaceCampo.canal][linha.marketplaceCampo.campo];
  }
  return Array(12).fill(0);
}

// Soma um campo (receita/cmv/comissao) dos marketplaces, mês a mês.
function somarMarketplace(
  dados: Record<MarketplaceCanal, MarketplaceMensal> | undefined,
  campo: keyof MarketplaceMensal
): number[] {
  const totals = Array(12).fill(0);
  if (!dados) return totals;
  for (const canal of Object.values(dados)) {
    canal[campo].forEach((v, i) => (totals[i] += v || 0));
  }
  return totals;
}

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

export function computeMonthlyFinancials(
  payables: Payable[],
  receivables: Receivable[],
  receitaExtra: number[] = Array(12).fill(0)
): MonthlyFinancials[] {
  const receitaPorMes = monthTotals(receivables);
  const despesaPorMes = monthTotals(payables);
  return dreMonths.map((m, i) => ({
    month: `${m}/${String(anoCorrenteShort())}`,
    receita: round2(receitaPorMes[i] + receitaExtra[i]),
    despesa: round2(despesaPorMes[i]),
  }));
}

export function computeEvolucaoReceita(receivables: Receivable[], receitaExtra: number[] = Array(12).fill(0)) {
  const receitaPorMes = monthTotals(receivables);
  let acumulado = 0;
  return dreMonths.map((m, i) => {
    acumulado += receitaPorMes[i] + receitaExtra[i];
    return { month: `${m}/${anoCorrenteShort()}`, acumulado: round2(acumulado) };
  });
}

export function computeSaidasPorClassificacao(
  payables: Payable[],
  categorias: CategoryGroup[],
  cmvManual: number[] = Array(12).fill(0),
  dreConfig: DreConfig = {}
): ExpenseSlice[] {
  const foraDoDre = new Set(dreConfig.classificacoesForaDoDre ?? []);
  const noCmv = new Set(dreConfig.classificacoesNoCmv ?? []);
  const byClass = new Map<string, number>();
  for (const p of payables) {
    // Pagamento a fornecedor não entra no DRE (ver computeDreGrid) — mantido fora daqui também
    // para o "Saídas por classificação" bater com o "Saídas totais" do Resumo.
    if (p.classificacao === "CMV" && p.categoria === CUSTO_MERCADORIA_CATEGORIA) continue;
    if (foraDoDre.has(p.classificacao)) continue;
    if (noCmv.has(p.classificacao)) {
      byClass.set("CMV", (byClass.get("CMV") ?? 0) + p.valor);
      continue;
    }
    byClass.set(p.classificacao, (byClass.get(p.classificacao) ?? 0) + p.valor);
  }
  const cmvManualTotal =
    cmvManual.reduce((a, v) => a + v, 0) +
    somarMarketplace(dreConfig.marketplaceManual, "cmv").reduce((a, v) => a + v, 0);
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

export function computeReceitaPorServico(
  receivables: Receivable[],
  marketplaceManual?: Record<MarketplaceCanal, MarketplaceMensal>
): ExpenseSlice[] {
  const byCategoria = new Map<string, number>();
  for (const r of receivables) {
    byCategoria.set(r.categoria, (byCategoria.get(r.categoria) ?? 0) + r.valor);
  }
  if (marketplaceManual) {
    for (const canal of Object.keys(marketplaceManual) as MarketplaceCanal[]) {
      const total = marketplaceManual[canal].receita.reduce((a, v) => a + (v || 0), 0);
      if (total > 0) byCategoria.set(MARKETPLACE_LABELS[canal], (byCategoria.get(MARKETPLACE_LABELS[canal]) ?? 0) + total);
    }
  }
  return [...byCategoria.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value: round2(value), color: categoryColor(label).fg }));
}

export function computeDreGrid(
  payables: Payable[],
  categorias: CategoryGroup[],
  receitaBrutaBase: number[],
  acumReceitaBase: number,
  deducoesManuais: DeducoesManuais,
  cmvManual: number[] = Array(12).fill(0),
  dreConfig: DreConfig = {}
): DreGridRow[] {
  const foraDoDre = new Set(dreConfig.classificacoesForaDoDre ?? []);
  const noCmv = new Set(dreConfig.classificacoesNoCmv ?? []);
  const temMarketplace = !!dreConfig.marketplaceManual;

  // Receita: quando o cliente informa receita por marketplace, o DRE usa SÓ esse valor — Contas
  // a Receber desse cliente existe pro Fluxo de Caixa, mas não entra no DRE (evita contar a
  // mesma venda duas vezes). Sem marketplace configurado, a receita continua vindo normalmente
  // de Contas a Receber, como em todo cliente.
  const receitaExtra = somarMarketplace(dreConfig.marketplaceManual, "receita");
  const receitaBruta = temMarketplace ? receitaExtra.map(round2) : receitaBrutaBase.map((v, i) => round2(v + receitaExtra[i]));
  const acumReceita = temMarketplace
    ? round2(receitaExtra.reduce((a, v) => a + v, 0))
    : round2(acumReceitaBase + receitaExtra.reduce((a, v) => a + v, 0));

  // Comissão de marketplace: linha própria de dedução, só aparece pra clientes com esse dado.
  const comissaoValues = somarMarketplace(dreConfig.marketplaceManual, "comissao").map(round2);
  const acumComissao = round2(comissaoValues.reduce((a, v) => a + v, 0));
  const receitaAposComissao = receitaBruta.map((v, i) => round2(v - comissaoValues[i]));
  const acumReceitaAposComissao = round2(acumReceita - acumComissao);

  // CMV do DRE = CSV (custo sobre serviços, automático via lançamentos) + CMV manual do mês
  // (preço de custo do produto vendido, informado à parte) + classificações marcadas como
  // "entram no detalhamento do CMV" (ex.: insumos) + CMV manual por marketplace. Pagamentos a
  // fornecedor (CUSTO_MERCADORIA_CATEGORIA) e classificações "fora do DRE" NÃO entram aqui.
  const csvAutoValues = monthTotals(
    payables.filter((p) => p.classificacao === "CMV" && p.categoria !== CUSTO_MERCADORIA_CATEGORIA)
  );
  const noCmvValues = monthTotals(payables.filter((p) => noCmv.has(p.classificacao)));
  const cmvExtra = somarMarketplace(dreConfig.marketplaceManual, "cmv");
  const cmvValues = csvAutoValues.map((v, i) => round2(v + (cmvManual[i] ?? 0) + noCmvValues[i] + cmvExtra[i]));
  const acumCmv = round2(cmvValues.reduce((a, v) => a + v, 0));

  const receitaLiquida = receitaAposComissao.map((v, i) => v - cmvValues[i]);
  const acumReceitaLiquida = round2(acumReceitaAposComissao - acumCmv);

  // Linhas de destaque (frete pago, devoluções, impostos etc.) — quando o cliente tem essa
  // config (ver LinhaDestaqueDre), elas substituem o fluxo padrão de "Receita Líquida" +
  // deduções manuais, indo direto pro "Lucro Bruto ou Valor a Gastar".
  const linhasDestaque = dreConfig.linhasDestaqueDre ?? [];
  const destaqueRows = linhasDestaque.map((linha) => {
    const values = valoresDestaque(payables, dreConfig.marketplaceManual, linha).map(round2);
    const acumulado = round2(values.reduce((a, v) => a + v, 0));
    return { label: linha.rotulo, values, acumulado, negative: true };
  });
  const totalDestaqueValues = Array(12).fill(0);
  let acumTotalDestaque = 0;
  for (const row of destaqueRows) {
    row.values.forEach((v, i) => (totalDestaqueValues[i] += v));
    acumTotalDestaque += row.acumulado;
  }
  acumTotalDestaque = round2(acumTotalDestaque);

  const { impostos, inadimplencia, investimentos } = deducoesManuais;
  const usaDestaque = linhasDestaque.length > 0;

  // "Lucro Bruto ou Valor a Gastar": com linhas de destaque, é receita − comissão − CMV − todas
  // as linhas de destaque; sem elas, é o fluxo padrão (receita líquida − deduções manuais).
  const valorAGastar = usaDestaque
    ? receitaLiquida.map((v, i) => round2(v - totalDestaqueValues[i]))
    : receitaLiquida.map((v) => v); // deduções manuais aplicadas só no acumulado/valor final
  const acumValorAGastar = usaDestaque
    ? round2(acumReceitaLiquida - acumTotalDestaque)
    : round2(acumReceitaLiquida - impostos - inadimplencia - investimentos);

  const classRows = categorias
    .filter((c) => c.classificacao !== "CMV" && !foraDoDre.has(c.classificacao) && !noCmv.has(c.classificacao))
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

  const resultadoValues = valorAGastar.map((v, i) => round2(v - despesasTotaisValues[i]));
  const acumResultado = round2(acumValorAGastar - acumDespesasTotais);

  const rows: DreGridRow[] = [
    { label: "RECEITA", values: receitaBruta.map(round2), acumulado: round2(acumReceita), isHeader: true, expandable: true },
    { label: "= Receita bruta", values: receitaBruta.map(round2), acumulado: round2(acumReceita), indent: true },
    ...(temMarketplace
      ? [{ label: "(-) Comissões de Marketplace", values: comissaoValues, acumulado: acumComissao, negative: true }]
      : []),
    { label: "(-) CMV", values: cmvValues.map(round2), acumulado: acumCmv, negative: true, expandable: true },
    ...(usaDestaque
      ? [...destaqueRows, { label: "= Lucro Bruto ou Valor a Gastar", values: valorAGastar.map(round2), acumulado: acumValorAGastar, isSubtotal: true }]
      : [
          { label: "= Receita líquida", values: receitaLiquida.map(round2), acumulado: acumReceitaLiquida, isSubtotal: true },
          { label: "(-) Impostos", values: Array(12).fill(0), acumulado: impostos, negative: true },
          { label: "(-) Inadimplência", values: Array(12).fill(0), acumulado: inadimplencia, negative: true },
          { label: "(-) Investimentos", values: Array(12).fill(0), acumulado: investimentos, negative: true },
          { label: "= Valor a gastar", values: valorAGastar.map(round2), acumulado: acumValorAGastar, isSubtotal: true },
        ]),
    { label: "DESPESAS", values: [], acumulado: 0, isSection: true },
    ...classRows,
    { label: "= Despesas totais", values: despesasTotaisValues.map(round2), acumulado: acumDespesasTotais, isSubtotal: true, negative: true },
    { label: "= Geração de caixa", values: resultadoValues, acumulado: acumResultado, isTotal: true },
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
  cmvManual: number[] = Array(12).fill(0),
  dreConfig: DreConfig = {}
) {
  const receitaBrutaPorMesBase = monthTotals(receivables);
  const acumReceitaBase = round2(receitaBrutaPorMesBase.reduce((a, v) => a + v, 0));

  const dreGrid = computeDreGrid(payables, categoriasPagar, receitaBrutaPorMesBase, acumReceitaBase, deducoesManuais, cmvManual, dreConfig);
  // Receita "oficial" pro resto do Resumo (inclui a receita extra de marketplace, se houver) —
  // lida direto da linha RECEITA do próprio grid pra não duplicar a soma aqui.
  const receitaBrutaPorMes = dreGrid.find((r) => r.label === "RECEITA")?.values ?? receitaBrutaPorMesBase;
  const acumReceita = dreGrid.find((r) => r.label === "RECEITA")?.acumulado ?? acumReceitaBase;
  const cmv = dreGrid.find((r) => r.label === "(-) CMV")?.acumulado ?? 0;
  const geracaoDeCaixa = dreGrid.find((r) => r.isTotal)?.acumulado ?? 0;
  // Com linhas de destaque (ver computeDreGrid), não existe mais "Receita Líquida" separada —
  // usa o "Lucro Bruto ou Valor a Gastar" no lugar (já é receita menos CMV e as outras deduções).
  const receitaLiquida =
    dreGrid.find((r) => r.label === "= Receita líquida")?.acumulado ??
    dreGrid.find((r) => r.label === "= Lucro Bruto ou Valor a Gastar")?.acumulado ??
    0;
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
  const receitaMes = round2(receitaBrutaPorMes[mesReferencia] ?? 0);
  const saidasMes = round2(payables.filter((p) => monthIndex(p.vencimento) === mesReferencia).reduce((a, p) => a + p.valor, 0));
  const mesReferenciaLabel = `${fullMonthNames[mesReferencia]}/2026`;

  const mesesComMovimento = dreMonths.filter((_, i) => receitaBrutaPorMes[i] > 0 || monthTotals(payables)[i] > 0).length;
  const recebido = round2(receivables.filter((r) => r.status === "recebido").reduce((a, r) => a + r.valor, 0));
  const saidasPorClassificacao = computeSaidasPorClassificacao(payables, categoriasPagar, cmvManual, dreConfig);
  const maiorGrupoSaida = saidasPorClassificacao[0] ?? { label: "—", value: 0 };
  const receitaExtraPorMes = somarMarketplace(dreConfig.marketplaceManual, "receita");

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
    monthlyFinancials: computeMonthlyFinancials(payables, receivables, receitaExtraPorMes),
    evolucaoReceitaAcumulada: computeEvolucaoReceita(receivables, receitaExtraPorMes),
    saidasPorClassificacao,
    receitaPorServico: computeReceitaPorServico(receivables, dreConfig.marketplaceManual),
    dreGrid,
    cmv,
  };
}

// Fluxo de Caixa é por regime de CAIXA (data de recebimento/pagamento efetivo), diferente do
// resto do sistema (DRE/Resumo), que é por competência (vencimento) — por isso tem uma conta
// própria em vez de reusar computeFinanceSummary. Sem saldoBancarioMensal informado pro mês de
// referência, o saldo inicial do período fica em zero (só a geração líquida do período conta).
export function computeFluxoCaixa(
  payables: Payable[],
  receivables: Receivable[],
  saldoBancarioMensal?: ({ saldoInicial: number; saldoFinalInformado: number } | undefined)[]
) {
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

  const saldoReal = saldoBancarioMensal?.[mesReferencia];
  const saldoInicial = saldoReal?.saldoInicial ?? 0;
  const saldoFinal = round2(saldoInicial + geracaoLiquida);
  const saldoFinalInformado = saldoReal?.saldoFinalInformado;
  const diferencaSaldo = saldoFinalInformado !== undefined ? round2(saldoFinal - saldoFinalInformado) : undefined;
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
    fluxoCaixaKpis: {
      saldoInicial,
      recebimentos,
      pagamentos,
      geracaoLiquida,
      geracaoLiquidaPct,
      saldoFinal,
      crescimentoCaixa,
      saldoFinalInformado,
      diferencaSaldo,
    },
    faturamentoXRecebimentos: { faturamento: faturamentoMes, recebido: recebimentos, conversaoEmCaixa, diferenca },
    maioresRecebimentos,
    maioresPagamentos,
    indicesFinanceiros,
  };
}

function anoCorrenteShort() {
  return "26";
}

// ---------- DRE de Caixa (regime de caixa, dentro do Fluxo de Caixa) ----------
// Mesma ideia/estrutura do DRE por competência (computeDreGrid), mas usando a data de
// pagamento/recebimento efetivo em vez do vencimento, com as entradas separadas por fonte de
// recebimento (forma de recebimento) em vez de por classificação. Diferente do DRE por
// competência, aqui os pagamentos a fornecedor ENTRAM normalmente — não tem exclusão nenhuma,
// é o caixa que de fato saiu, classificado como "Custos Variáveis" quando lançado na categoria
// "Pagamentos a Fornecedores" (ver seedCategoriasPagar de cada cliente).
function monthTotalsPorData<T>(items: T[], dataDe: (item: T) => string | undefined, valorDe: (item: T) => number): number[] {
  const totals = Array(12).fill(0);
  for (const item of items) {
    const data = dataDe(item);
    if (!data) continue;
    totals[monthIndex(data)] += valorDe(item);
  }
  return totals;
}

export function computeFluxoCaixaDreGrid(
  payables: Payable[],
  receivables: Receivable[],
  categoriasPagar: CategoryGroup[]
): DreGridRow[] {
  const recebidos = receivables.filter((r) => r.status === "recebido" && r.recebimento);
  const pagos = payables.filter((p) => p.status === "pago" && p.pagamento);

  const porFonte = new Map<string, Receivable[]>();
  for (const r of recebidos) {
    const fonte = r.formaRecebimento?.trim() || "Não informado";
    if (!porFonte.has(fonte)) porFonte.set(fonte, []);
    porFonte.get(fonte)!.push(r);
  }
  const entradaRows = [...porFonte.entries()]
    .map(([label, items]) => {
      const values = monthTotalsPorData(items, (r) => r.recebimento, (r) => r.valor).map(round2);
      const acumulado = round2(values.reduce((a, v) => a + v, 0));
      return { label, values, acumulado, expandable: true };
    })
    .sort((a, b) => b.acumulado - a.acumulado);

  const totalEntradasValues = Array(12).fill(0);
  let acumEntradas = 0;
  for (const row of entradaRows) {
    row.values.forEach((v, i) => (totalEntradasValues[i] += v));
    acumEntradas += row.acumulado;
  }
  acumEntradas = round2(acumEntradas);

  const saidaRows = categoriasPagar
    .map((c) => {
      const items = pagos.filter((p) => p.classificacao === c.classificacao);
      const values = monthTotalsPorData(items, (p) => p.pagamento, (p) => p.valor).map(round2);
      const acumulado = round2(values.reduce((a, v) => a + v, 0));
      return { label: c.classificacao, values, acumulado, negative: true, expandable: true };
    })
    .filter((row) => row.acumulado > 0 || categoriasPagar.find((c) => c.classificacao === row.label)?.padrao);

  const totalSaidasValues = Array(12).fill(0);
  let acumSaidas = 0;
  for (const row of saidaRows) {
    row.values.forEach((v, i) => (totalSaidasValues[i] += v));
    acumSaidas += row.acumulado;
  }
  acumSaidas = round2(acumSaidas);

  const resultadoValues = totalEntradasValues.map((v, i) => round2(v - totalSaidasValues[i]));
  const acumResultado = round2(acumEntradas - acumSaidas);

  return [
    { label: "ENTRADAS", values: Array(12).fill(0), acumulado: 0, isSection: true },
    ...entradaRows,
    { label: "= Total de entradas", values: totalEntradasValues.map(round2), acumulado: acumEntradas, isSubtotal: true },
    { label: "SAÍDAS", values: Array(12).fill(0), acumulado: 0, isSection: true },
    ...saidaRows,
    { label: "= Total de saídas", values: totalSaidasValues.map(round2), acumulado: acumSaidas, isSubtotal: true, negative: true },
    { label: "= Resultado de caixa", values: resultadoValues, acumulado: acumResultado, isTotal: true },
  ];
}

// Linhas (lançamentos) por trás de uma linha do grid de DRE de Caixa — usado no drill-down ao
// clicar numa fonte de entrada ou numa classificação de saída.
export function lancamentosFluxoCaixaPorLinha(
  payables: Payable[],
  receivables: Receivable[],
  tipo: "entrada" | "saida",
  label: string
) {
  if (tipo === "entrada") {
    return receivables
      .filter((r) => r.status === "recebido" && r.recebimento && (r.formaRecebimento?.trim() || "Não informado") === label)
      .sort((a, b) => a.recebimento!.localeCompare(b.recebimento!));
  }
  return payables
    .filter((p) => p.status === "pago" && p.pagamento && p.classificacao === label)
    .sort((a, b) => a.pagamento!.localeCompare(b.pagamento!));
}

// ---------- Margem média e ponto de equilíbrio (a partir do DRE por competência) ----------
// Custos variáveis aqui = CMV do DRE (CSV automático + CMV manual, já calculado em
// computeDreGrid) — é o que efetivamente acompanha o volume de vendas. Custos fixos = todas as
// outras despesas do DRE (pessoal, administrativas, comerciais etc.), que não escalam
// diretamente com a receita. É a leitura padrão de ponto de equilíbrio pra um negócio de
// serviços/varejo, dado o que já está classificado no plano de contas.
export function computeMargemEPontoEquilibrio(dreGrid: DreGridRow[]) {
  const receita = dreGrid.find((r) => r.label === "RECEITA")?.acumulado ?? 0;
  const cmv = dreGrid.find((r) => r.label === "(-) CMV")?.acumulado ?? 0;
  const custosFixos = dreGrid.find((r) => r.label === "= Despesas totais")?.acumulado ?? 0;
  const resultado = dreGrid.find((r) => r.isTotal)?.acumulado ?? 0;

  const margemContribuicaoPct = receita > 0 ? round2(((receita - cmv) / receita) * 100) : 0;
  const margemLiquidaPct = receita > 0 ? round2((resultado / receita) * 100) : 0;
  const pontoEquilibrio = margemContribuicaoPct > 0 ? round2(custosFixos / (margemContribuicaoPct / 100)) : 0;
  const distanciaDoPontoEquilibrio = round2(receita - pontoEquilibrio);

  return {
    receita,
    custosVariaveis: cmv,
    custosFixos,
    margemContribuicaoPct,
    margemLiquidaPct,
    pontoEquilibrio,
    distanciaDoPontoEquilibrio,
    atingiuPontoEquilibrio: receita >= pontoEquilibrio && pontoEquilibrio > 0,
  };
}

// Mesma conta de computeMargemEPontoEquilibrio, mas mês a mês em vez de só o acumulado do ano —
// pra clientes que precisam ver quanto precisam faturar por mês, não só no total.
export function computeMargemEPontoEquilibrioPorMes(dreGrid: DreGridRow[]) {
  const receitaValues = dreGrid.find((r) => r.label === "RECEITA")?.values ?? Array(12).fill(0);
  const cmvValues = dreGrid.find((r) => r.label === "(-) CMV")?.values ?? Array(12).fill(0);
  const custosFixosValues = dreGrid.find((r) => r.label === "= Despesas totais")?.values ?? Array(12).fill(0);

  return dreMonths.map((mes, i) => {
    const receita = receitaValues[i] ?? 0;
    const cmv = cmvValues[i] ?? 0;
    const custosFixos = custosFixosValues[i] ?? 0;
    const margemContribuicao = round2(receita - cmv);
    const margemContribuicaoPct = receita > 0 ? round2((margemContribuicao / receita) * 100) : 0;
    const pontoEquilibrio = margemContribuicaoPct > 0 ? round2(custosFixos / (margemContribuicaoPct / 100)) : 0;
    const folga = round2(receita - pontoEquilibrio);
    return {
      mes,
      receita: round2(receita),
      margemContribuicao,
      margemContribuicaoPct,
      custosFixos: round2(custosFixos),
      pontoEquilibrio,
      folga,
      atingiuPontoEquilibrio: receita >= pontoEquilibrio && pontoEquilibrio > 0,
    };
  });
}

// Capital de giro recomendado: a média mensal de saídas de caixa efetivas (regime de caixa, só
// meses com pagamento) usada como colchão mínimo — 1 mês de despesas médias guardado pra cobrir
// o negócio caso a receita do mês seguinte atrase ou falhe. É uma régua simples e genérica
// (funciona pra qualquer cliente, não depende de configuração específica de DRE).
export function computeCapitalDeGiroRecomendado(payables: Payable[]) {
  const pagos = payables.filter((p) => p.status === "pago" && p.pagamento);
  const porMes = monthTotalsPorData(pagos, (p) => p.pagamento, (p) => p.valor);
  const mesesComMovimento = porMes.filter((v) => v > 0).length;
  const totalPago = round2(porMes.reduce((a, v) => a + v, 0));
  const mediaMensal = mesesComMovimento > 0 ? round2(totalPago / mesesComMovimento) : 0;

  return {
    mediaMensal,
    recomendado: mediaMensal,
    mesesComMovimento,
  };
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
