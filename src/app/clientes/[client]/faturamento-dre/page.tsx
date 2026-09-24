"use client";

import { Fragment, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronRight, Download, Info } from "lucide-react";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { DetalhamentoMesModal } from "@/components/client/DetalhamentoMesModal";
import { dreMonths } from "@/lib/constants";
import { useFinance } from "@/lib/store/FinanceContext";
import { cmvMarketplacePorCanal, comissaoMarketplacePorCanal } from "@/lib/derive";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";
import { DreGridRow, MarketplaceCanal, Payable } from "@/lib/types";

const RevenueExpenseChart = dynamic(() => import("@/components/charts/RevenueExpenseChart").then((m) => m.RevenueExpenseChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const ExpensePieChart = dynamic(() => import("@/components/charts/ExpensePieChart").then((m) => m.ExpensePieChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

function Kpi({ label, value, hint, tone }: { label: string; value: number; hint: string; tone?: "positive" | "negative" }) {
  const color = tone === "positive" ? "text-accent-500" : tone === "negative" ? "text-danger-500" : "text-brand-900";
  return (
    <div className="card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${color}`}>{formatCurrencyPrecise(value)}</p>
      <p className="mt-1.5 text-xs text-faint">{hint}</p>
    </div>
  );
}

function classTotals(payables: Payable[], classificacao: string) {
  const items = payables.filter((p) => p.classificacao === classificacao);
  const values = Array(12).fill(0);
  for (const p of items) values[new Date(p.vencimento + "T00:00:00").getMonth()] += p.valor;
  const acumulado = items.reduce((a, p) => a + p.valor, 0);
  return { values, acumulado };
}

function categoriaRowsFor(payables: Payable[], classificacao: string) {
  const items = payables.filter((p) => p.classificacao === classificacao);
  const byCategoria = new Map<string, Payable[]>();
  for (const p of items) {
    if (!byCategoria.has(p.categoria)) byCategoria.set(p.categoria, []);
    byCategoria.get(p.categoria)!.push(p);
  }
  return [...byCategoria.entries()]
    .map(([categoria, list]) => {
      const values = Array(12).fill(0);
      for (const p of list) values[new Date(p.vencimento + "T00:00:00").getMonth()] += p.valor;
      const acumulado = list.reduce((a, p) => a + p.valor, 0);
      return {
        categoria,
        values,
        acumulado,
        lancamentos: [...list].sort((a, b) => a.vencimento.localeCompare(b.vencimento)),
      };
    })
    .sort((a, b) => b.acumulado - a.acumulado);
}

// Formata percentual de representatividade — "—" quando a base é zero (nada pra comparar ainda).
function formatPct(pct: number | null) {
  return pct === null ? "—" : `${pct.toFixed(1)}%`;
}

export default function FaturamentoDrePage() {
  const { summary, payables, marketplaceManual, classificacoesNoCmv } = useFinance();
  const { anoCorrente, faturamentoKpis, monthlyFinancials, receitaPorServico, dreGrid } = summary;
  const [detalhamentoAberto, setDetalhamentoAberto] = useState(false);
  const [classAberta, setClassAberta] = useState<string | null>(null);
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null);
  const [cmvSubAberta, setCmvSubAberta] = useState<string | null>(null);
  // null = ano inteiro (12 colunas); um índice = mostra só aquele mês na tabela e nos
  // detalhamentos (categoria/lançamento).
  const [mesFiltro, setMesFiltro] = useState<number | null>(null);
  const mesesExibidos = mesFiltro === null ? dreMonths.map((_, i) => i) : [mesFiltro];

  // Representatividade em %: da RECEITA até "Valor a Gastar"/Lucro Bruto (inclusive), a base é a
  // receita total (100%). Dali pra baixo (despesas), a base vira o próprio Valor a Gastar — assim
  // "gastei 20% com despesas de pessoas" é sempre em cima do que sobrou depois do CMV/comissão,
  // não do faturamento bruto.
  const receitaRow = dreGrid.find((r) => r.label === "RECEITA");
  const valorAGastarRow = dreGrid.find((r) => r.label === "= Lucro Bruto ou Valor a Gastar" || r.label === "= Valor a gastar");
  const valorAGastarIdx = valorAGastarRow ? dreGrid.indexOf(valorAGastarRow) : -1;

  function refValor(row: { values: number[]; acumulado: number }) {
    return mesFiltro !== null ? row.values[mesFiltro] : row.acumulado;
  }
  function pctLinha(row: DreGridRow, idx: number): number | null {
    if (!receitaRow) return null;
    const baseRow = valorAGastarRow && idx > valorAGastarIdx ? valorAGastarRow : receitaRow;
    const base = refValor(baseRow);
    if (!base) return null;
    return (refValor(row) / base) * 100;
  }
  // Linhas dentro do "(-) CMV" (por canal ou por classificação tipo Insumos/Embalagens) ainda
  // fazem parte do mesmo bloco da receita — usam a receita total como base, igual a linha-mãe.
  function pctReceita(row: { values: number[]; acumulado: number }): number | null {
    if (!receitaRow) return null;
    const base = refValor(receitaRow);
    if (!base) return null;
    return (refValor(row) / base) * 100;
  }
  // Categorias dentro de uma despesa (abaixo do Valor a Gastar) usam o Valor a Gastar como base,
  // igual a classificação-mãe.
  function pctValorAGastar(row: { values: number[]; acumulado: number }): number | null {
    if (!valorAGastarRow) return null;
    const base = refValor(valorAGastarRow);
    if (!base) return null;
    return (refValor(row) / base) * 100;
  }
  // Comissão/CMV por canal de marketplace: aqui a comparação é com a receita DAQUELE canal, não
  // com a receita total — "faturei 100 na Shopee e paguei 10 de CMV" = 10% da Shopee, não da loja toda.
  function pctCanal(canal: MarketplaceCanal, row: { values: number[]; acumulado: number }): number | null {
    const receitaCanal = marketplaceManual[canal]?.receita ?? [];
    const base = mesFiltro !== null ? receitaCanal[mesFiltro] : receitaCanal.reduce((a, v) => a + v, 0);
    if (!base) return null;
    return (refValor(row) / base) * 100;
  }

  // rótulo + meses + (acumulado do ano, só quando "ano inteiro" está selecionado) + %
  const colSpanTotal = mesesExibidos.length + (mesFiltro === null ? 3 : 2);

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Ano</label>
            <select className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900">
              <option>{anoCorrente}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Mês</label>
            <select
              value={mesFiltro === null ? "" : mesFiltro}
              onChange={(e) => {
                setMesFiltro(e.target.value === "" ? null : Number(e.target.value));
                setClassAberta(null);
                setCategoriaAberta(null);
                setCmvSubAberta(null);
              }}
              className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
            >
              <option value="">Ano inteiro</option>
              {dreMonths.map((m, i) => (
                <option key={m} value={i}>
                  {m}/{anoCorrente}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setDetalhamentoAberto(true)}
            className="mt-4 rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
          >
            Detalhamento por mês
          </button>
          <button className="mt-4 flex items-center gap-1.5 rounded-lg bg-client-accent px-3 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors">
            <Download size={13} />
            Exportar Excel
          </button>
        </div>
        <div className="flex items-start gap-2 text-xs text-faint max-w-md">
          <Info size={14} className="mt-0.5 shrink-0" />
          <p>
            Regime de <span className="text-brand-700 font-medium">competência</span> (pela data de vencimento). Receita
            vem do Contas a Receber (por serviço); despesas do Contas a Pagar (por classificação). Clique em ▸ para abrir cada grupo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Kpi label="Receita do Ano" value={faturamentoKpis.receitaDoAno.value} hint={faturamentoKpis.receitaDoAno.hint} />
        <Kpi label="Receita Líquida" value={faturamentoKpis.receitaLiquida.value} hint={faturamentoKpis.receitaLiquida.hint} />
        <Kpi label="Deduções + Despesas" value={faturamentoKpis.deducoesDespesas.value} hint={faturamentoKpis.deducoesDespesas.hint} />
        <Kpi
          label="Geração de Caixa"
          value={faturamentoKpis.geracaoDeCaixa.value}
          hint={faturamentoKpis.geracaoDeCaixa.hint}
          tone={faturamentoKpis.geracaoDeCaixa.value >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Receita x Despesa por mês</h2>
          <p className="mb-2 text-xs text-faint">Meses com lançamentos no ano</p>
          <RevenueExpenseChart data={monthlyFinancials} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Receita por serviço</h2>
          <p className="mb-3 text-xs text-faint">Acumulado do ano</p>
          <ExpensePieChart
            data={receitaPorServico}
            centerLabel={formatCurrencyPrecise(faturamentoKpis.receitaDoAno.value)}
            centerSub={`receita ${anoCorrente}`}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 pb-4">
          <h2 className="text-sm font-semibold text-brand-900">DRE</h2>
          <p className="text-xs text-faint">
            {mesFiltro !== null ? `Só ${dreMonths[mesFiltro]}/${anoCorrente}` : "Demonstrativo mês a mês"} · clique em ▸ para ver as categorias
            de cada grupo · % é a representatividade sobre a receita (até o Valor a Gastar) ou sobre o Valor a Gastar (despesas){" "}
            {mesFiltro !== null ? `— sempre do mês selecionado` : "— do ano inteiro"}
          </p>
        </div>
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-[11px] text-faint">
                <th className="py-2 pl-5 pr-3 font-medium sticky left-0 bg-surface">Conta</th>
                {mesesExibidos.map((i) => (
                  <th key={dreMonths[i]} className="py-2 px-3 text-right font-medium whitespace-nowrap">
                    {dreMonths[i].toUpperCase()}
                  </th>
                ))}
                {mesFiltro === null && (
                  <th className="py-2 pl-3 pr-3 text-right font-medium whitespace-nowrap">Acum. {anoCorrente}</th>
                )}
                <th className="py-2 pl-3 pr-5 text-right font-medium whitespace-nowrap">%</th>
              </tr>
            </thead>
            <tbody>
              {dreGrid.map((row, idx) => {
                if (row.isSection) {
                  return (
                    <tr key={idx} className="border-b border-border-subtle bg-surface-muted">
                      <td colSpan={colSpanTotal} className="py-2 pl-5 text-[11px] font-semibold uppercase tracking-wide text-faint">
                        {row.label}
                      </td>
                    </tr>
                  );
                }
                const isComissaoRow = row.label === "(-) Comissões de Marketplace";
                const isCmvRow = row.label === "(-) CMV";
                const isClassRow = !!row.expandable && !row.isHeader && !row.isSubtotal && !row.isTotal && !isComissaoRow && !isCmvRow;
                const isExpandableRow = (isClassRow || isComissaoRow || isCmvRow) && !!row.expandable;
                const isOpen = isExpandableRow && classAberta === row.label;
                const rowColor = row.isSubtotal
                  ? "text-brand-900"
                  : row.negative
                    ? "text-warn-500"
                    : "text-muted";
                const acumColor = row.isTotal ? (row.acumulado >= 0 ? "text-accent-500" : "text-danger-500") : rowColor;
                const pct = pctLinha(row, idx);
                return (
                  <Fragment key={idx}>
                    <tr
                      onClick={isExpandableRow ? () => setClassAberta(isOpen ? null : row.label) : undefined}
                      className={`border-b border-border-subtle last:border-0 ${row.isSubtotal || row.isTotal ? "bg-surface-muted" : ""} ${
                        isExpandableRow ? "cursor-pointer hover:bg-surface-muted/60" : ""
                      }`}
                    >
                      <td
                        className={`py-2.5 pl-5 pr-3 whitespace-nowrap sticky left-0 ${row.isSubtotal || row.isTotal ? "bg-surface-muted" : "bg-surface"} ${
                          row.isTotal || row.isSubtotal || row.isHeader ? "font-semibold text-brand-900" : "text-muted"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {row.expandable && (
                            <ChevronRight size={12} className={`text-faint transition-transform ${isOpen ? "rotate-90" : ""}`} />
                          )}
                          {row.label}
                        </span>
                      </td>
                      {mesesExibidos.map((i) => (
                        <td
                          key={i}
                          className={`py-2.5 px-3 text-right tabular-nums whitespace-nowrap ${
                            row.isTotal ? (row.values[i] >= 0 ? "text-accent-500" : "text-danger-500") : rowColor
                          }`}
                        >
                          {formatCurrencyPrecise(row.values[i])}
                        </td>
                      ))}
                      {mesFiltro === null && (
                        <td className={`py-2.5 pl-3 pr-3 text-right tabular-nums whitespace-nowrap font-semibold ${acumColor}`}>
                          {formatCurrencyPrecise(row.acumulado)}
                        </td>
                      )}
                      <td className="py-2.5 pl-3 pr-5 text-right text-xs tabular-nums whitespace-nowrap font-medium text-brand-700">
                        {formatPct(pct)}
                      </td>
                    </tr>
                    {isOpen &&
                      isClassRow &&
                      categoriaRowsFor(payables, row.label).map((catRow) => {
                        const catKey = `${row.label}|${catRow.categoria}`;
                        const catOpen = categoriaAberta === catKey;
                        const catPct = pctValorAGastar(catRow);
                        return (
                          <Fragment key={catKey}>
                            <tr
                              onClick={() => setCategoriaAberta(catOpen ? null : catKey)}
                              className="cursor-pointer border-b border-border-subtle bg-client-accent/[0.06] hover:bg-client-accent/[0.1]"
                            >
                              <td className="py-2 pl-9 pr-3 whitespace-nowrap sticky left-0 bg-surface text-xs text-muted">
                                <span className="inline-flex items-center gap-1">
                                  <ChevronRight size={11} className={`text-faint transition-transform ${catOpen ? "rotate-90" : ""}`} />
                                  {catRow.categoria}
                                </span>
                              </td>
                              {mesesExibidos.map((i) => (
                                <td key={i} className="py-2 px-3 text-right text-xs tabular-nums text-muted whitespace-nowrap">
                                  {formatCurrencyPrecise(catRow.values[i])}
                                </td>
                              ))}
                              {mesFiltro === null && (
                                <td className="py-2 pl-3 pr-3 text-right text-xs font-medium tabular-nums text-muted whitespace-nowrap">
                                  {formatCurrencyPrecise(catRow.acumulado)}
                                </td>
                              )}
                              <td className="py-2 pl-3 pr-5 text-right text-xs font-medium tabular-nums text-brand-700 whitespace-nowrap">
                                {formatPct(catPct)}
                              </td>
                            </tr>
                            {catOpen && (
                              <tr className="border-b border-border-subtle bg-client-accent/[0.1]">
                                <td colSpan={colSpanTotal} className="py-2 pl-14 pr-5">
                                  <div className="flex max-w-2xl flex-col gap-1">
                                    {catRow.lancamentos
                                      .filter((l) => mesFiltro === null || new Date(l.vencimento + "T00:00:00").getMonth() === mesFiltro)
                                      .map((l) => (
                                        <div key={l.id} className="flex items-center gap-3 text-[11px] text-faint">
                                          <span className="w-16 shrink-0">{formatDateBR(l.vencimento)}</span>
                                          <span className="flex-1 truncate">
                                            {l.favorecido !== "—" ? `${l.favorecido} — ` : ""}
                                            {l.descricao}
                                          </span>
                                          <span className="w-28 shrink-0 text-right tabular-nums">{formatCurrencyPrecise(l.valor)}</span>
                                        </div>
                                      ))}
                                    {catRow.lancamentos.filter(
                                      (l) => mesFiltro === null || new Date(l.vencimento + "T00:00:00").getMonth() === mesFiltro
                                    ).length === 0 && <p className="text-[11px] text-faint">Sem lançamentos</p>}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    {isOpen &&
                      isComissaoRow &&
                      comissaoMarketplacePorCanal(marketplaceManual).map((canalRow) => (
                        <tr key={canalRow.canal} className="border-b border-border-subtle bg-client-accent/[0.06]">
                          <td className="py-2 pl-9 pr-3 whitespace-nowrap sticky left-0 bg-surface text-xs text-muted">{canalRow.label}</td>
                          {mesesExibidos.map((i) => (
                            <td key={i} className="py-2 px-3 text-right text-xs tabular-nums text-muted whitespace-nowrap">
                              {formatCurrencyPrecise(canalRow.values[i])}
                            </td>
                          ))}
                          {mesFiltro === null && (
                            <td className="py-2 pl-3 pr-3 text-right text-xs font-medium tabular-nums text-muted whitespace-nowrap">
                              {formatCurrencyPrecise(canalRow.acumulado)}
                            </td>
                          )}
                          <td className="py-2 pl-3 pr-5 text-right text-xs font-medium tabular-nums text-brand-700 whitespace-nowrap">
                            {formatPct(pctCanal(canalRow.canal, canalRow))}
                          </td>
                        </tr>
                      ))}
                    {isOpen &&
                      isCmvRow &&
                      cmvMarketplacePorCanal(marketplaceManual).map((canalRow) => (
                        <tr key={canalRow.canal} className="border-b border-border-subtle bg-client-accent/[0.06]">
                          <td className="py-2 pl-9 pr-3 whitespace-nowrap sticky left-0 bg-surface text-xs text-muted">{canalRow.label}</td>
                          {mesesExibidos.map((i) => (
                            <td key={i} className="py-2 px-3 text-right text-xs tabular-nums text-muted whitespace-nowrap">
                              {formatCurrencyPrecise(canalRow.values[i])}
                            </td>
                          ))}
                          {mesFiltro === null && (
                            <td className="py-2 pl-3 pr-3 text-right text-xs font-medium tabular-nums text-muted whitespace-nowrap">
                              {formatCurrencyPrecise(canalRow.acumulado)}
                            </td>
                          )}
                          <td className="py-2 pl-3 pr-5 text-right text-xs font-medium tabular-nums text-brand-700 whitespace-nowrap">
                            {formatPct(pctCanal(canalRow.canal, canalRow))}
                          </td>
                        </tr>
                      ))}
                    {isOpen &&
                      isCmvRow &&
                      (classificacoesNoCmv ?? []).map((classificacao) => {
                        const { values, acumulado } = classTotals(payables, classificacao);
                        if (acumulado <= 0) return null;
                        const subOpen = cmvSubAberta === classificacao;
                        const subPct = pctReceita({ values, acumulado });
                        return (
                          <Fragment key={classificacao}>
                            <tr
                              onClick={() => setCmvSubAberta(subOpen ? null : classificacao)}
                              className="cursor-pointer border-b border-border-subtle bg-client-accent/[0.06] hover:bg-client-accent/[0.1]"
                            >
                              <td className="py-2 pl-9 pr-3 whitespace-nowrap sticky left-0 bg-surface text-xs text-muted">
                                <span className="inline-flex items-center gap-1">
                                  <ChevronRight size={11} className={`text-faint transition-transform ${subOpen ? "rotate-90" : ""}`} />
                                  {classificacao}
                                </span>
                              </td>
                              {mesesExibidos.map((i) => (
                                <td key={i} className="py-2 px-3 text-right text-xs tabular-nums text-muted whitespace-nowrap">
                                  {formatCurrencyPrecise(values[i])}
                                </td>
                              ))}
                              {mesFiltro === null && (
                                <td className="py-2 pl-3 pr-3 text-right text-xs font-medium tabular-nums text-muted whitespace-nowrap">
                                  {formatCurrencyPrecise(acumulado)}
                                </td>
                              )}
                              <td className="py-2 pl-3 pr-5 text-right text-xs font-medium tabular-nums text-brand-700 whitespace-nowrap">
                                {formatPct(subPct)}
                              </td>
                            </tr>
                            {subOpen &&
                              categoriaRowsFor(payables, classificacao).map((catRow) => {
                                const catKey = `${classificacao}|${catRow.categoria}`;
                                const catOpen = categoriaAberta === catKey;
                                const catPct = pctReceita(catRow);
                                const catLancamentos = catRow.lancamentos.filter(
                                  (l) => mesFiltro === null || new Date(l.vencimento + "T00:00:00").getMonth() === mesFiltro
                                );
                                return (
                                  <Fragment key={catKey}>
                                    <tr
                                      onClick={() => setCategoriaAberta(catOpen ? null : catKey)}
                                      className="cursor-pointer border-b border-border-subtle bg-client-accent/[0.1] hover:bg-client-accent/[0.14]"
                                    >
                                      <td className="py-2 pl-14 pr-3 whitespace-nowrap sticky left-0 bg-surface text-[11px] text-faint">
                                        <span className="inline-flex items-center gap-1">
                                          <ChevronRight size={10} className={`text-faint transition-transform ${catOpen ? "rotate-90" : ""}`} />
                                          {catRow.categoria}
                                        </span>
                                      </td>
                                      {mesesExibidos.map((i) => (
                                        <td key={i} className="py-2 px-3 text-right text-[11px] tabular-nums text-faint whitespace-nowrap">
                                          {formatCurrencyPrecise(catRow.values[i])}
                                        </td>
                                      ))}
                                      {mesFiltro === null && (
                                        <td className="py-2 pl-3 pr-3 text-right text-[11px] font-medium tabular-nums text-faint whitespace-nowrap">
                                          {formatCurrencyPrecise(catRow.acumulado)}
                                        </td>
                                      )}
                                      <td className="py-2 pl-3 pr-5 text-right text-[11px] font-medium tabular-nums text-brand-700 whitespace-nowrap">
                                        {formatPct(catPct)}
                                      </td>
                                    </tr>
                                    {catOpen && (
                                      <tr className="border-b border-border-subtle bg-client-accent/[0.14]">
                                        <td colSpan={colSpanTotal} className="py-2 pl-20 pr-5">
                                          <div className="flex max-w-2xl flex-col gap-1">
                                            {catLancamentos.map((l) => (
                                              <div key={l.id} className="flex items-center gap-3 text-[11px] text-faint">
                                                <span className="w-16 shrink-0">{formatDateBR(l.vencimento)}</span>
                                                <span className="flex-1 truncate">
                                                  {l.favorecido !== "—" ? `${l.favorecido} — ` : ""}
                                                  {l.descricao}
                                                </span>
                                                <span className="w-28 shrink-0 text-right tabular-nums">{formatCurrencyPrecise(l.valor)}</span>
                                              </div>
                                            ))}
                                            {catLancamentos.length === 0 && <p className="text-[11px] text-faint">Sem lançamentos</p>}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                );
                              })}
                          </Fragment>
                        );
                      })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detalhamentoAberto && <DetalhamentoMesModal onClose={() => setDetalhamentoAberto(false)} />}
    </div>
  );
}
