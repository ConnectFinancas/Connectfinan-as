import Link from "next/link";
import { AlertTriangle, ArrowRight, Banknote, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { RevenueExpenseChart } from "@/components/charts/RevenueExpenseChart";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { CashFlowAreaChart } from "@/components/charts/CashFlowAreaChart";
import {
  bankTransactions,
  cashFlow,
  expenseBreakdown,
  kpis,
  monthlyFinancials,
  payables,
  receivables,
} from "@/lib/data/m4-logistica";
import { formatCurrencyPrecise } from "@/lib/format";

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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Receita (Julho/26)" value={kpis.receitaMes.value} delta={kpis.receitaMes.delta} icon={TrendingUp} accent="#0f9d6a" />
        <KpiCard label="Despesas (Julho/26)" value={kpis.despesaMes.value} delta={-kpis.despesaMes.delta} icon={TrendingDown} accent="#dc2626" />
        <KpiCard label="Lucro Líquido (Julho/26)" value={kpis.lucroLiquido.value} delta={kpis.lucroLiquido.delta} icon={Wallet} accent="#2b46a3" hint={`margem de ${kpis.margemLiquida}%`} />
        <KpiCard label="Saldo em Caixa (hoje)" value={kpis.saldoCaixa.value} delta={kpis.saldoCaixa.delta} icon={Banknote} accent="#e8722c" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-brand-900">Receita x Despesa — últimos 12 meses</h2>
          </div>
          <p className="mb-2 text-xs text-slate-400">Linha: receita bruta · Barras: despesa total</p>
          <RevenueExpenseChart data={monthlyFinancials} />
        </div>
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-semibold text-brand-900">Despesas por Categoria</h2>
          <p className="mb-3 text-xs text-slate-400">Competência: Julho/2026</p>
          <ExpensePieChart data={expenseBreakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <h2 className="mb-1 text-sm font-semibold text-brand-900">Evolução do Saldo em Caixa</h2>
          <p className="mb-2 text-xs text-slate-400">Saldo consolidado em contas bancárias</p>
          <CashFlowAreaChart data={cashFlow} />
        </div>

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
                  <p className="text-xs text-slate-400">
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
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-brand-900">Movimentações Bancárias Recentes</h2>
          <Link href="/clientes/m4-logistica/conciliacao" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
            Ver conciliação completa <ArrowRight size={13} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-slate-400">
                <th className="pb-2 font-medium">Data</th>
                <th className="pb-2 font-medium">Descrição</th>
                <th className="pb-2 font-medium">Categoria</th>
                <th className="pb-2 pr-0 text-right font-medium">Valor</th>
                <th className="pb-2 pl-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bankTransactions.slice(0, 6).map((t) => (
                <tr key={t.id} className="border-b border-border-subtle last:border-0">
                  <td className="py-2.5 whitespace-nowrap text-slate-500">
                    {new Date(t.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-2.5 text-brand-900">{t.descricao}</td>
                  <td className="py-2.5 text-slate-500">{t.categoria}</td>
                  <td className={`py-2.5 text-right font-medium tabular-nums ${t.valor < 0 ? "text-danger-500" : "text-accent-600"}`}>
                    {formatCurrencyPrecise(t.valor)}
                  </td>
                  <td className="py-2.5 pl-4">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
