"use client";

import { Fragment, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronRight, Download, Info } from "lucide-react";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { DetalhamentoMesModal } from "@/components/client/DetalhamentoMesModal";
import { dreMonths } from "@/lib/constants";
import { useFinance } from "@/lib/store/FinanceContext";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";
import { Payable } from "@/lib/types";

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

export default function FaturamentoDrePage() {
  const { summary, payables } = useFinance();
  const { anoCorrente, faturamentoKpis, monthlyFinancials, receitaPorServico, dreGrid } = summary;
  const [detalhamentoAberto, setDetalhamentoAberto] = useState(false);
  const [classAberta, setClassAberta] = useState<string | null>(null);
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null);

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
          <button
            onClick={() => setDetalhamentoAberto(true)}
            className="mt-4 rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
          >
            Detalhamento por mês
          </button>
          <button className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-2 text-xs font-semibold text-brand-950 hover:bg-accent-600 transition-colors">
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
          <p className="text-xs text-faint">Demonstrativo mês a mês · clique em ▸ para ver as categorias de cada grupo</p>
        </div>
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-[11px] text-faint">
                <th className="py-2 pl-5 pr-3 font-medium sticky left-0 bg-surface">Conta</th>
                {dreMonths.map((m) => (
                  <th key={m} className="py-2 px-3 text-right font-medium whitespace-nowrap">{m.toUpperCase()}</th>
                ))}
                <th className="py-2 pl-3 pr-5 text-right font-medium whitespace-nowrap">Acum. {anoCorrente}</th>
              </tr>
            </thead>
            <tbody>
              {dreGrid.map((row, idx) => {
                if (row.isSection) {
                  return (
                    <tr key={idx} className="border-b border-border-subtle bg-surface-muted">
                      <td colSpan={dreMonths.length + 2} className="py-2 pl-5 text-[11px] font-semibold uppercase tracking-wide text-faint">
                        {row.label}
                      </td>
                    </tr>
                  );
                }
                const isClassRow = !!row.expandable && !row.isHeader && !row.isSubtotal && !row.isTotal && row.label !== "(-) CMV";
                const isOpen = isClassRow && classAberta === row.label;
                const rowColor = row.isSubtotal
                  ? "text-brand-900"
                  : row.negative
                    ? "text-warn-500"
                    : "text-muted";
                const acumColor = row.isTotal ? (row.acumulado >= 0 ? "text-accent-500" : "text-danger-500") : rowColor;
                return (
                  <Fragment key={idx}>
                    <tr
                      onClick={isClassRow ? () => setClassAberta(isOpen ? null : row.label) : undefined}
                      className={`border-b border-border-subtle last:border-0 ${row.isSubtotal || row.isTotal ? "bg-surface-muted" : ""} ${
                        isClassRow ? "cursor-pointer hover:bg-surface-muted/60" : ""
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
                      {row.values.map((v, i) => (
                        <td
                          key={i}
                          className={`py-2.5 px-3 text-right tabular-nums whitespace-nowrap ${
                            row.isTotal ? (v >= 0 ? "text-accent-500" : "text-danger-500") : rowColor
                          }`}
                        >
                          {formatCurrencyPrecise(v)}
                        </td>
                      ))}
                      <td className={`py-2.5 pl-3 pr-5 text-right tabular-nums whitespace-nowrap font-semibold ${acumColor}`}>
                        {formatCurrencyPrecise(row.acumulado)}
                      </td>
                    </tr>
                    {isOpen &&
                      categoriaRowsFor(payables, row.label).map((catRow) => {
                        const catKey = `${row.label}|${catRow.categoria}`;
                        const catOpen = categoriaAberta === catKey;
                        return (
                          <Fragment key={catKey}>
                            <tr
                              onClick={() => setCategoriaAberta(catOpen ? null : catKey)}
                              className="cursor-pointer border-b border-border-subtle bg-surface/60 hover:bg-surface-muted/60"
                            >
                              <td className="py-2 pl-9 pr-3 whitespace-nowrap sticky left-0 bg-surface text-xs text-muted">
                                <span className="inline-flex items-center gap-1">
                                  <ChevronRight size={11} className={`text-faint transition-transform ${catOpen ? "rotate-90" : ""}`} />
                                  {catRow.categoria}
                                </span>
                              </td>
                              {catRow.values.map((v, i) => (
                                <td key={i} className="py-2 px-3 text-right text-xs tabular-nums text-muted whitespace-nowrap">
                                  {formatCurrencyPrecise(v)}
                                </td>
                              ))}
                              <td className="py-2 pl-3 pr-5 text-right text-xs font-medium tabular-nums text-muted whitespace-nowrap">
                                {formatCurrencyPrecise(catRow.acumulado)}
                              </td>
                            </tr>
                            {catOpen && (
                              <tr className="border-b border-border-subtle bg-surface/30">
                                <td colSpan={dreMonths.length + 2} className="py-2 pl-14 pr-5">
                                  <div className="flex flex-col gap-1">
                                    {catRow.lancamentos.map((l) => (
                                      <div key={l.id} className="flex items-center gap-3 text-[11px] text-faint">
                                        <span className="w-16 shrink-0">{formatDateBR(l.vencimento)}</span>
                                        <span className="flex-1 truncate">
                                          {l.favorecido !== "—" ? `${l.favorecido} — ` : ""}
                                          {l.descricao}
                                        </span>
                                        <span className="tabular-nums">{formatCurrencyPrecise(l.valor)}</span>
                                      </div>
                                    ))}
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
            </tbody>
          </table>
        </div>
      </div>

      {detalhamentoAberto && <DetalhamentoMesModal onClose={() => setDetalhamentoAberto(false)} />}
    </div>
  );
}
