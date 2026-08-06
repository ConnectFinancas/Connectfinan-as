import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { RevenueExpenseChart } from "@/components/charts/RevenueExpenseChart";
import { AccumulatedRevenueAreaChart } from "@/components/charts/AccumulatedRevenueAreaChart";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import {
  anoCorrente,
  bankTransactions,
  evolucaoReceitaAcumulada,
  indicadores,
  monthlyFinancials,
  payables,
  receivables,
  resumoDoAno,
  resumoKpis,
  saidasPorClassificacao,
} from "@/lib/data/m4-logistica";
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
  const pendencias = [
    ...payables
      .filter((p) => p.status === "atrasado" || p.status === "pendente")
      .map((p) => ({
        id: p.id,
        titulo: p.favorecido,
        tipo: "A pagar" as const,
        vencimento: p.vencimento,
        valor: p.valor,
        status: p.status,
      })),
    ...receivables
      .filter((r) => r.status === "atrasado")
      .map((r) => ({
        id: r.id,
        titulo: r.cliente,
        tipo: "A receber" as const,
        vencimento: r.vencimento,
        valor: r.valor,
        status: r.status,
      })),
  ]
    .sort((a, b) => (a.status === "atrasado" ? -1 : 1) - (b.status === "atrasado" ? -1 : 1))
    .slice(0, 5);

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
          <ExpensePieChart data={saidasPorClassificacao} />
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5 flex flex-col">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warn-500" />
            <h2 className="text-sm font-semibold text-brand-900">Ações Pendentes</h2>
          </div>
          <ul className="flex flex-1 flex-col gap-3">
            {pendencias.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-900">{item.titulo}</p>
                  <p className="text-xs text-faint">
                    {item.tipo} · vence em {new Date(item.vencimento + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-brand-900">{formatCurrencyPrecise(item.valor)}</p>
                  <StatusBadge status={item.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-brand-900">Movimentações Bancárias Recentes</h2>
            <Link href="/clientes/m4-logistica/importar-ofx" className="inline-flex items-center gap-1 text-xs font-medium text-accent-500 hover:text-accent-600">
              Ver extrato completo <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {bankTransactions.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm text-brand-900">{t.descricao}</p>
                  <p className="text-xs text-faint">{new Date(t.data + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                </div>
                <p className={`shrink-0 text-sm font-semibold tabular-nums ${t.valor < 0 ? "text-danger-500" : "text-accent-500"}`}>
                  {formatCurrencyPrecise(t.valor)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
