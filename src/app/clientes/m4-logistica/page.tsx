"use client";

import { RevenueExpenseChart } from "@/components/charts/RevenueExpenseChart";
import { AccumulatedRevenueAreaChart } from "@/components/charts/AccumulatedRevenueAreaChart";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { useFinance } from "@/lib/store/FinanceContext";
import { formatCurrencyPrecise } from "@/lib/format";

function ResumoCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold tracking-tight ${
          tone === "positive" ? "text-accent-500" : tone === "negative" ? "text-danger-500" : "text-brand-900"
        }`}
      >
        {formatCurrencyPrecise(value)}
      </p>
      <p className="mt-1.5 text-xs text-faint">{hint}</p>
    </div>
  );
}

export default function M4DashboardPage() {
  const { summary } = useFinance();
  const { anoCorrente, resumoKpis, resumoDoAno, indicadores, monthlyFinancials, evolucaoReceitaAcumulada, saidasPorClassificacao } = summary;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumoCard label="Receita do Mês" value={resumoKpis.receitaMes.value} hint="Agosto/2026" />
        <ResumoCard label="Saídas do Mês" value={resumoKpis.saidasMes.value} hint="contas a pagar do mês" />
        <ResumoCard
          label="Resultado do Mês"
          value={resumoKpis.resultadoMes.value}
          hint="receita − saídas"
          tone={resumoKpis.resultadoMes.value >= 0 ? "positive" : "negative"}
        />
        <ResumoCard label="Receita Acumulada" value={resumoKpis.receitaAcumulada.value} hint={`ano ${anoCorrente}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Receita x Saídas por mês</h2>
          <p className="mb-2 text-xs text-faint">Meses com lançamentos</p>
          <RevenueExpenseChart data={monthlyFinancials} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Evolução da receita</h2>
          <p className="mb-2 text-xs text-faint">Acumulada no ano</p>
          <AccumulatedRevenueAreaChart data={evolucaoReceitaAcumulada} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Saídas por classificação</h2>
          <p className="mb-3 text-xs text-faint">Acumulado do ano</p>
          <ExpensePieChart data={saidasPorClassificacao} centerLabel={`${formatCurrencyPrecise(resumoDoAno.saidasTotais)}`} centerSub="saídas 2026" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-semibold text-brand-900">Resumo do ano</h2>
          <p className="mb-4 text-xs text-faint">Receita, saídas e resultado</p>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <dt className="text-muted">Receita</dt>
              <dd className="font-medium text-brand-900 tabular-nums">{formatCurrencyPrecise(resumoDoAno.receita)}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <dt className="text-muted">(−) Saídas totais</dt>
              <dd className="font-medium text-brand-900 tabular-nums">{formatCurrencyPrecise(resumoDoAno.saidasTotais)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-brand-900">(=) Resultado</dt>
              <dd className={`text-base font-semibold tabular-nums ${resumoDoAno.resultado >= 0 ? "text-accent-500" : "text-danger-500"}`}>
                {formatCurrencyPrecise(resumoDoAno.resultado)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="mb-1 text-sm font-semibold text-brand-900">Indicadores</h2>
          <p className="mb-4 text-xs text-faint">M4 · {anoCorrente}</p>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <dt className="text-muted">Margem do resultado</dt>
              <dd className={`font-medium tabular-nums ${indicadores.margemResultado >= 0 ? "text-accent-500" : "text-danger-500"}`}>
                {indicadores.margemResultado.toFixed(1)}%
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <dt className="text-muted">Receita já recebida (caixa)</dt>
              <dd className="font-medium text-brand-900 tabular-nums">{indicadores.receitaRecebidaCaixa.toFixed(1)}%</dd>
            </div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <dt className="text-muted">Maior grupo de saída</dt>
              <dd className="font-medium text-brand-900 text-right">
                {indicadores.maiorGrupoSaida.label} · {formatCurrencyPrecise(indicadores.maiorGrupoSaida.valor)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Meses com movimento</dt>
              <dd className="font-medium text-brand-900 tabular-nums">{indicadores.mesesComMovimento}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
