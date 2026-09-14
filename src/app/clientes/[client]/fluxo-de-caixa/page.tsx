"use client";

import { Fragment, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, ChevronRight, Download, Gauge, Landmark, Pin, Target, TrendingUp } from "lucide-react";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { MiniBarCompare } from "@/components/charts/MiniBarCompare";
import { useFinance } from "@/lib/store/FinanceContext";
import {
  computeFluxoCaixaDreGrid,
  computeMargemEPontoEquilibrio,
  computeMargemEPontoEquilibrioPorMes,
  lancamentosFluxoCaixaPorLinha,
} from "@/lib/derive";
import { dreMonths } from "@/lib/constants";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";
import { Payable } from "@/lib/types";

const DailyBalanceChart = dynamic(() => import("@/components/charts/DailyBalanceChart").then((m) => m.DailyBalanceChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const ExpensePieChart = dynamic(() => import("@/components/charts/ExpensePieChart").then((m) => m.ExpensePieChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

function Kpi({ label, value, hint, tone, isPct }: { label: string; value: number; hint: string; tone?: "positive" | "negative"; isPct?: boolean }) {
  const color = tone === "positive" ? "text-accent-500" : tone === "negative" ? "text-danger-500" : "text-brand-900";
  return (
    <div className="card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <p className={`mt-1.5 text-lg font-semibold tracking-tight ${color}`}>
        {isPct ? `${value > 0 ? "+" : ""}${value.toFixed(1)}%` : formatCurrencyPrecise(value)}
      </p>
      <p className="mt-1 text-[11px] text-faint">{hint}</p>
    </div>
  );
}

const destaqueIcons = [Landmark, TrendingUp, Target, Pin];

// Mesmo drill-down (classificação → categoria → lançamentos) da aba Faturamento & DRE, por
// competência (vencimento) — reaproveitado aqui só pra exibição, sem mexer naquela aba.
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

export default function FluxoDeCaixaPage() {
  const {
    fluxoCaixaPeriodo,
    fluxoCaixaKpis,
    fluxoDiario,
    faturamentoXRecebimentos,
    maioresRecebimentos,
    maioresPagamentos,
    indicesFinanceiros,
    destaquesPeriodo,
    resumoExecutivo,
    pontoDeAtencao,
    payables,
    receivables,
    categoriasPagar,
    summary,
    client,
  } = useFinance();

  const [linhaAberta, setLinhaAberta] = useState<string | null>(null);
  const [linhaCompAberta, setLinhaCompAberta] = useState<string | null>(null);
  const [categoriaCompAberta, setCategoriaCompAberta] = useState<string | null>(null);

  const dreCaixaGrid = computeFluxoCaixaDreGrid(payables, receivables, categoriasPagar);
  const margemEPontoEquilibrio = computeMargemEPontoEquilibrio(summary.dreGrid);
  const margemEPontoEquilibrioPorMes = client.temPontoEquilibrioMensal
    ? computeMargemEPontoEquilibrioPorMes(summary.dreGrid)
    : null;

  // Visão inspirada em outro sistema que o cliente usa (Arken): os mesmos dados do DRE por
  // competência (o de sempre, sem alteração nenhuma nele), só que também exibidos aqui dentro do
  // Fluxo de Caixa, com 4 cards de resumo + tabela mês a mês em visual navy/dourado.
  const kpiReceita = summary.dreGrid.find((r) => r.label === "RECEITA")?.acumulado ?? 0;
  const kpiMargemContribuicao = summary.dreGrid.find((r) => r.label === "= Lucro Bruto ou Valor a Gastar")?.acumulado ?? 0;
  const kpiDespesasTotais = summary.dreGrid.find((r) => r.label === "= Despesas totais")?.acumulado ?? 0;
  const kpiResultado = summary.dreGrid.find((r) => r.isTotal)?.acumulado ?? 0;
  const DOURADO = "#d4af37";

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Mês</label>
            <select className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900">
              <option>Agosto/2026</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">De</label>
            <input type="date" defaultValue="2026-08-01" className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Até</label>
            <input type="date" defaultValue="2026-08-31" className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Visão</label>
            <select className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900">
              <option>Geral (receitas – despesas)</option>
            </select>
          </div>
          <button className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors">
            Mês atual
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-client-accent px-3 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors">
            <Download size={13} />
            Exportar Excel
          </button>
        </div>
        <span className="text-xs font-medium text-warn-500">{fluxoCaixaPeriodo}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Saldo Inicial" value={fluxoCaixaKpis.saldoInicial} hint="no início do período" tone={fluxoCaixaKpis.saldoInicial >= 0 ? undefined : "negative"} />
        <Kpi label="Recebimentos" value={fluxoCaixaKpis.recebimentos} hint="entradas de caixa" tone="positive" />
        <Kpi label="Pagamentos" value={fluxoCaixaKpis.pagamentos} hint="saídas de caixa" />
        <Kpi label="Geração Líquida" value={fluxoCaixaKpis.geracaoLiquida} hint={`${fluxoCaixaKpis.geracaoLiquidaPct.toFixed(1)}% dos recebimentos`} tone="positive" />
        <Kpi label="Saldo Final" value={fluxoCaixaKpis.saldoFinal} hint="no fim do período" tone={fluxoCaixaKpis.saldoFinal >= 0 ? undefined : "negative"} />
        <Kpi label="Crescimento do Caixa" value={fluxoCaixaKpis.crescimentoCaixa} hint="vs início do período" tone="positive" isPct />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Evolução diária do caixa</h2>
          <p className="mb-2 text-xs text-faint">Saldo ao fim de cada dia</p>
          <DailyBalanceChart data={fluxoDiario} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Recebimentos x Pagamentos</h2>
          <p className="mb-2 text-xs text-faint">no período</p>
          <MiniBarCompare
            bars={[
              { label: "Recebimentos", value: fluxoCaixaKpis.recebimentos, color: "#22d3a0" },
              { label: "Pagamentos", value: fluxoCaixaKpis.pagamentos, color: "#f2665c" },
              { label: "Resultado", value: fluxoCaixaKpis.geracaoLiquida, color: "#5b93fd" },
            ]}
          />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Composição do fluxo</h2>
          <p className="mb-2 text-xs text-faint">Entradas vs saídas</p>
          <ExpensePieChart
            data={[
              { label: "Recebimentos", value: fluxoCaixaKpis.recebimentos, color: "#22d3a0" },
              { label: "Pagamentos", value: fluxoCaixaKpis.pagamentos, color: "#f2665c" },
            ]}
            centerLabel={formatCurrencyPrecise(fluxoCaixaKpis.recebimentos)}
            centerSub="no período"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Faturamento x Recebimentos</h2>
          <p className="mb-2 text-xs text-faint">Quanto do faturado virou caixa</p>
          <MiniBarCompare
            bars={[
              { label: "Faturamento", value: faturamentoXRecebimentos.faturamento, color: "#f2a93c" },
              { label: "Recebido", value: faturamentoXRecebimentos.recebido, color: "#22d3a0" },
            ]}
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-surface-muted p-2.5 text-center">
              <p className="text-[10px] text-faint">Conversão em caixa</p>
              <p className="text-sm font-semibold text-brand-900">{faturamentoXRecebimentos.conversaoEmCaixa.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-2.5 text-center">
              <p className="text-[10px] text-faint">Diferença</p>
              <p className="text-sm font-semibold text-danger-500">{formatCurrencyPrecise(faturamentoXRecebimentos.diferenca)}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Maiores recebimentos</h2>
          <p className="mb-3 text-xs text-faint">Top 5 do período</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-faint">
                <th className="pb-2 font-medium">Data</th>
                <th className="pb-2 font-medium text-right">Valor</th>
                <th className="pb-2 pl-2 font-medium text-right">% Total</th>
              </tr>
            </thead>
            <tbody>
              {maioresRecebimentos.map((r, i) => (
                <tr key={`${r.data}-${i}`} className="border-t border-border-subtle">
                  <td className="py-2 text-muted">{r.data}</td>
                  <td className="py-2 text-right font-medium text-accent-500">{formatCurrencyPrecise(r.valor)}</td>
                  <td className="py-2 pl-2 text-right text-muted">{r.pctTotal.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="border-t border-border-subtle font-semibold">
                <td className="py-2 text-brand-900">Top 5</td>
                <td className="py-2 text-right text-brand-900">
                  {formatCurrencyPrecise(maioresRecebimentos.reduce((a, r) => a + r.valor, 0))}
                </td>
                <td className="py-2 pl-2 text-right text-brand-900">100,0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Maiores pagamentos</h2>
          <p className="mb-3 text-xs text-faint">Top 5 do período</p>
          {maioresPagamentos.length === 0 ? (
            <p className="py-6 text-center text-xs text-faint">Sem lançamentos</p>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {maioresPagamentos.map((p, i) => (
                  <tr key={`${p.data}-${i}`} className="border-t border-border-subtle">
                    <td className="py-2 text-muted">{p.data}</td>
                    <td className="py-2 text-right font-medium text-danger-500">{formatCurrencyPrecise(p.valor)}</td>
                    <td className="py-2 pl-2 text-right text-muted">{p.pctTotal.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-brand-900">Índices financeiros</h2>
          <p className="mb-3 -mt-2 text-xs text-faint">Indicadores do período</p>
          <dl className="flex flex-col gap-2.5 text-xs">
            {indicesFinanceiros.map((i) => (
              <div key={i.label} className="flex items-center justify-between border-b border-border-subtle pb-2.5 last:border-0">
                <dt className="text-muted">{i.label}</dt>
                <dd className="font-semibold text-accent-500">{i.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-brand-900">Destaques do período</h2>
          <ul className="flex flex-col gap-3">
            {destaquesPeriodo.map((d, i) => {
              const Icon = destaqueIcons[i % destaqueIcons.length];
              return (
                <li key={d.title} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-100 text-info-500">
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-900">{d.title}</p>
                    <p className="text-xs text-faint">{d.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-brand-900">Resumo executivo</h2>
          <div className="flex flex-col gap-2.5 text-sm text-muted">
            {resumoExecutivo.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="mt-1 flex items-start gap-2 rounded-lg bg-warn-100 p-3 text-xs text-warn-500">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <p><span className="font-semibold">Ponto de atenção:</span> {pontoDeAtencao}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- DRE de Caixa: mesma ideia do DRE por competência, mas pela data de pagamento/recebimento efetivo ---------- */}
      <div className="card overflow-hidden">
        <div className="p-5 pb-4">
          <h2 className="text-sm font-semibold text-brand-900">DRE de Caixa</h2>
          <p className="text-xs text-faint">
            Regime de <span className="font-medium text-brand-700">caixa</span> (pela data de pagamento/recebimento, não pelo
            vencimento). Entradas por fonte de recebimento; saídas por classificação — incluindo pagamento a fornecedores,
            aqui contabilizado como Custos Variáveis. Clique em ▸ pra ver os lançamentos.
          </p>
        </div>
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-[11px] text-faint">
                <th className="py-2 pl-5 pr-3 font-medium sticky left-0 bg-surface">Conta</th>
                {dreMonths.map((m) => (
                  <th key={m} className="py-2 px-3 text-right font-medium whitespace-nowrap">{m.toUpperCase()}</th>
                ))}
                <th className="py-2 pl-3 pr-5 text-right font-medium whitespace-nowrap">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {dreCaixaGrid.map((row, idx) => {
                if (row.isSection) {
                  return (
                    <tr key={idx} className="border-b border-border-subtle bg-surface-muted">
                      <td colSpan={dreMonths.length + 2} className="py-2 pl-5 text-[11px] font-semibold uppercase tracking-wide text-faint">
                        {row.label}
                      </td>
                    </tr>
                  );
                }
                const isLinhaExpansivel = !!row.expandable;
                const isOpen = isLinhaExpansivel && linhaAberta === row.label;
                const tipo: "entrada" | "saida" = row.negative ? "saida" : "entrada";
                const rowColor = row.isSubtotal ? "text-brand-900" : row.negative ? "text-warn-500" : "text-muted";
                const acumColor = row.isTotal ? (row.acumulado >= 0 ? "text-accent-500" : "text-danger-500") : rowColor;
                return (
                  <Fragment key={idx}>
                    <tr
                      onClick={isLinhaExpansivel ? () => setLinhaAberta(isOpen ? null : row.label) : undefined}
                      className={`border-b border-border-subtle last:border-0 ${row.isSubtotal || row.isTotal ? "bg-surface-muted" : ""} ${
                        isLinhaExpansivel ? "cursor-pointer hover:bg-surface-muted/60" : ""
                      }`}
                    >
                      <td
                        className={`py-2.5 pl-5 pr-3 whitespace-nowrap sticky left-0 ${row.isSubtotal || row.isTotal ? "bg-surface-muted" : "bg-surface"} ${
                          row.isTotal || row.isSubtotal ? "font-semibold text-brand-900" : "text-muted"
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
                    {isOpen && (
                      <tr className="border-b border-border-subtle bg-surface/60">
                        <td colSpan={dreMonths.length + 2} className="py-2 pl-9 pr-5">
                          <div className="flex flex-col gap-1">
                            {lancamentosFluxoCaixaPorLinha(payables, receivables, tipo, row.label).map((l) => (
                              <div key={l.id} className="flex items-center gap-3 text-[11px] text-faint">
                                <span className="w-16 shrink-0">
                                  {formatDateBR(tipo === "entrada" ? (l as { recebimento?: string }).recebimento! : (l as { pagamento?: string }).pagamento!)}
                                </span>
                                <span className="flex-1 truncate">
                                  {("favorecido" in l ? l.favorecido : l.cliente) !== "—" ? `${"favorecido" in l ? l.favorecido : l.cliente} — ` : ""}
                                  {l.descricao}
                                </span>
                                <span className="tabular-nums">{formatCurrencyPrecise(l.valor)}</span>
                              </div>
                            ))}
                            {lancamentosFluxoCaixaPorLinha(payables, receivables, tipo, row.label).length === 0 && (
                              <p className="text-[11px] text-faint">Sem lançamentos</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Margem média e ponto de equilíbrio ---------- */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Gauge size={16} className="text-client-accent" />
          <h2 className="text-sm font-semibold text-brand-900">Margem e Ponto de Equilíbrio</h2>
        </div>
        <p className="-mt-3 mb-4 text-xs text-faint">
          A partir do DRE por competência: custos variáveis = CMV; custos fixos = demais despesas do período.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-surface-muted p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-faint">Margem de Contribuição</p>
            <p className="mt-1 text-lg font-semibold text-brand-900">{margemEPontoEquilibrio.margemContribuicaoPct.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-surface-muted p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-faint">Margem Líquida</p>
            <p className={`mt-1 text-lg font-semibold ${margemEPontoEquilibrio.margemLiquidaPct >= 0 ? "text-accent-500" : "text-danger-500"}`}>
              {margemEPontoEquilibrio.margemLiquidaPct.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-surface-muted p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-faint">Custos Fixos</p>
            <p className="mt-1 text-lg font-semibold text-brand-900">{formatCurrencyPrecise(margemEPontoEquilibrio.custosFixos)}</p>
          </div>
          <div className="rounded-lg bg-surface-muted p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-faint">Ponto de Equilíbrio</p>
            <p className="mt-1 text-lg font-semibold text-brand-900">{formatCurrencyPrecise(margemEPontoEquilibrio.pontoEquilibrio)}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-border-subtle p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Receita do ano</span>
            <span className="font-medium text-brand-900">{formatCurrencyPrecise(margemEPontoEquilibrio.receita)}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className={`h-full rounded-full ${margemEPontoEquilibrio.atingiuPontoEquilibrio ? "bg-accent-500" : "bg-warn-500"}`}
              style={{
                width: `${
                  margemEPontoEquilibrio.pontoEquilibrio > 0
                    ? Math.min(100, Math.round((margemEPontoEquilibrio.receita / margemEPontoEquilibrio.pontoEquilibrio) * 100))
                    : 0
                }%`,
              }}
            />
          </div>
          <p className={`mt-2 text-xs ${margemEPontoEquilibrio.atingiuPontoEquilibrio ? "text-accent-500" : "text-warn-500"}`}>
            {margemEPontoEquilibrio.pontoEquilibrio <= 0
              ? "Sem margem de contribuição suficiente no período pra calcular o ponto de equilíbrio."
              : margemEPontoEquilibrio.atingiuPontoEquilibrio
                ? `Ponto de equilíbrio já atingido — ${formatCurrencyPrecise(margemEPontoEquilibrio.distanciaDoPontoEquilibrio)} acima do necessário.`
                : `Faltam ${formatCurrencyPrecise(Math.abs(margemEPontoEquilibrio.distanciaDoPontoEquilibrio))} em receita pra atingir o ponto de equilíbrio.`}
          </p>
        </div>
      </div>

      {margemEPontoEquilibrioPorMes && (
        <div className="card overflow-hidden" style={{ borderTop: `3px solid ${DOURADO}` }}>
          <div className="p-5 pb-1">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-client-accent" />
              <h2 className="text-sm font-semibold text-brand-900">Ponto de Equilíbrio por Mês</h2>
            </div>
            <p className="mt-1 text-xs text-faint">Quanto precisa faturar em cada mês pra cobrir os custos do período.</p>
          </div>
          <div className="overflow-x-auto p-5 pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-brand-900 text-left text-[11px] text-white">
                  <th className="py-2.5 pl-4 pr-3 font-medium whitespace-nowrap">Mês</th>
                  <th className="py-2.5 px-3 text-right font-medium whitespace-nowrap">Receita</th>
                  <th className="py-2.5 px-3 text-right font-medium whitespace-nowrap">Margem Contrib.</th>
                  <th className="py-2.5 px-3 text-right font-medium whitespace-nowrap">Custos Fixos</th>
                  <th className="py-2.5 px-3 text-right font-medium whitespace-nowrap">Ponto de Equilíbrio</th>
                  <th className="py-2.5 pl-3 pr-4 text-right font-medium whitespace-nowrap">Folga sobre o PE</th>
                </tr>
              </thead>
              <tbody>
                {margemEPontoEquilibrioPorMes.map((linha) => (
                  <tr key={linha.mes} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 pl-4 pr-3 whitespace-nowrap text-muted">{linha.mes}/26</td>
                    <td className="py-2 px-3 text-right tabular-nums text-brand-900 whitespace-nowrap">{formatCurrencyPrecise(linha.receita)}</td>
                    <td className="py-2 px-3 text-right tabular-nums whitespace-nowrap text-muted">
                      {linha.margemContribuicaoPct.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums whitespace-nowrap text-muted">
                      {formatCurrencyPrecise(linha.custosFixos)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums whitespace-nowrap text-muted">
                      {formatCurrencyPrecise(linha.pontoEquilibrio)}
                    </td>
                    <td
                      className={`py-2 pl-3 pr-4 text-right tabular-nums whitespace-nowrap font-medium ${
                        linha.atingiuPontoEquilibrio ? "text-accent-500" : "text-danger-500"
                      }`}
                    >
                      {linha.folga >= 0 ? "+" : ""}
                      {formatCurrencyPrecise(linha.folga)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-muted font-semibold text-brand-900">
                  <td className="py-2.5 pl-4 pr-3 whitespace-nowrap">Período</td>
                  <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">{formatCurrencyPrecise(margemEPontoEquilibrio.receita)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                    {margemEPontoEquilibrio.margemContribuicaoPct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">{formatCurrencyPrecise(margemEPontoEquilibrio.custosFixos)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">{formatCurrencyPrecise(margemEPontoEquilibrio.pontoEquilibrio)}</td>
                  <td
                    className={`py-2.5 pl-3 pr-4 text-right tabular-nums whitespace-nowrap ${
                      margemEPontoEquilibrio.atingiuPontoEquilibrio ? "text-accent-500" : "text-danger-500"
                    }`}
                  >
                    {margemEPontoEquilibrio.distanciaDoPontoEquilibrio >= 0 ? "+" : ""}
                    {formatCurrencyPrecise(margemEPontoEquilibrio.distanciaDoPontoEquilibrio)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {margemEPontoEquilibrioPorMes && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="card p-5" style={{ borderTop: `3px solid ${DOURADO}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Receita</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">{formatCurrencyPrecise(kpiReceita)}</p>
            </div>
            <div className="card p-5" style={{ borderTop: `3px solid ${DOURADO}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Margem de Contribuição</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">{formatCurrencyPrecise(kpiMargemContribuicao)}</p>
              <p className="mt-1 text-xs text-faint">{margemEPontoEquilibrio.margemContribuicaoPct.toFixed(1)}%</p>
            </div>
            <div className="card p-5" style={{ borderTop: `3px solid ${DOURADO}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Despesas Totais</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">{formatCurrencyPrecise(kpiDespesasTotais)}</p>
            </div>
            <div className="card p-5" style={{ borderTop: `3px solid ${DOURADO}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Geração de Caixa</p>
              <p className={`mt-2 text-2xl font-semibold tracking-tight ${kpiResultado >= 0 ? "text-accent-500" : "text-danger-500"}`}>
                {formatCurrencyPrecise(kpiResultado)}
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-5 pb-4" style={{ borderBottom: `2px solid ${DOURADO}` }}>
              <h2 className="text-sm font-semibold text-brand-900">Demonstrativo por Competência</h2>
              <p className="text-xs text-faint">Mesmos dados da aba Faturamento &amp; DRE, mês a mês, pra acompanhar aqui também.</p>
            </div>
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-white" style={{ backgroundColor: "#0a1330" }}>
                    <th className="py-2.5 pl-5 pr-3 font-medium sticky left-0" style={{ backgroundColor: "#0a1330" }}>
                      Linha
                    </th>
                    {dreMonths.map((m) => (
                      <th key={m} className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                        {m.toUpperCase()}/26
                      </th>
                    ))}
                    <th className="py-2.5 pl-3 pr-5 text-right font-medium whitespace-nowrap">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.dreGrid.map((row, idx) => {
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
                    const isOpen = isClassRow && linhaCompAberta === row.label;
                    const rowColor = row.isSubtotal ? "text-brand-900" : row.negative ? "text-warn-500" : "text-muted";
                    const acumColor = row.isTotal ? (row.acumulado >= 0 ? "text-accent-500" : "text-danger-500") : rowColor;
                    return (
                      <Fragment key={idx}>
                        <tr
                          onClick={isClassRow ? () => setLinhaCompAberta(isOpen ? null : row.label) : undefined}
                          className={`border-b border-border-subtle last:border-0 ${row.isSubtotal || row.isTotal ? "bg-surface-muted" : ""} ${
                            isClassRow ? "cursor-pointer hover:bg-surface-muted/60" : ""
                          }`}
                        >
                          <td
                            className={`py-2 pl-5 pr-3 whitespace-nowrap sticky left-0 ${row.isSubtotal || row.isTotal ? "bg-surface-muted" : "bg-surface"} ${
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
                            <td key={i} className={`py-2 px-3 text-right tabular-nums whitespace-nowrap ${rowColor}`}>
                              {formatCurrencyPrecise(v)}
                            </td>
                          ))}
                          <td className={`py-2 pl-3 pr-5 text-right tabular-nums whitespace-nowrap font-semibold ${acumColor}`}>
                            {formatCurrencyPrecise(row.acumulado)}
                          </td>
                        </tr>
                        {isOpen &&
                          categoriaRowsFor(payables, row.label).map((catRow) => {
                            const catKey = `${row.label}|${catRow.categoria}`;
                            const catOpen = categoriaCompAberta === catKey;
                            return (
                              <Fragment key={catKey}>
                                <tr
                                  onClick={() => setCategoriaCompAberta(catOpen ? null : catKey)}
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
        </>
      )}

      <p className="text-[11px] text-faint">
        * Valores em Reais (R$) · Fonte: Contas a Receber (banco) + Contas a Pagar · Fluxo por regime de caixa
        (data de recebimento/pagamento).
      </p>
    </div>
  );
}
