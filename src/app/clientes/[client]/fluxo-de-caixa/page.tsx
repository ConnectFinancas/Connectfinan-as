"use client";

import dynamic from "next/dynamic";
import { AlertTriangle, Download, Landmark, Pin, Target, TrendingUp } from "lucide-react";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { MiniBarCompare } from "@/components/charts/MiniBarCompare";
import { useFinance } from "@/lib/store/FinanceContext";
import { formatCurrencyPrecise } from "@/lib/format";

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
  } = useFinance();

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
              {maioresRecebimentos.map((r) => (
                <tr key={r.data} className="border-t border-border-subtle">
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
                {maioresPagamentos.map((p) => (
                  <tr key={p.data} className="border-t border-border-subtle">
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

      <p className="text-[11px] text-faint">
        * Valores em Reais (R$) · Fonte: Contas a Receber (banco) + Contas a Pagar · Fluxo por regime de caixa
        (data de recebimento/pagamento).
      </p>
    </div>
  );
}
