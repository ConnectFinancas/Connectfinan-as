import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { CashFlowAreaChart } from "@/components/charts/CashFlowAreaChart";
import { cashFlow } from "@/lib/data/m4-logistica";
import { formatCurrencyPrecise } from "@/lib/format";

export default function FluxoDeCaixaPage() {
  const last = cashFlow[cashFlow.length - 1];
  const prev = cashFlow[cashFlow.length - 2];
  const totalEntradas = cashFlow.reduce((a, c) => a + c.entradas, 0);
  const totalSaidas = cashFlow.reduce((a, c) => a + c.saidas, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Saldo Atual em Caixa"
          value={last.saldo}
          delta={((last.saldo - prev.saldo) / prev.saldo) * 100}
          icon={Wallet}
          accent="#e8722c"
        />
        <KpiCard label="Entradas (12 meses)" value={totalEntradas} icon={ArrowUpCircle} accent="#22d3a0" hint="acumulado" />
        <KpiCard label="Saídas (12 meses)" value={totalSaidas} icon={ArrowDownCircle} accent="#f2665c" hint="acumulado" />
      </div>

      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-brand-900">Evolução do Saldo em Caixa</h2>
        <p className="mb-2 text-xs text-faint">Setembro/2025 a Agosto/2026 (mês corrente parcial)</p>
        <CashFlowAreaChart data={cashFlow} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted text-left text-xs text-muted">
                <th className="py-3 pl-5 font-medium">Mês</th>
                <th className="py-3 font-medium text-right">Entradas</th>
                <th className="py-3 font-medium text-right">Saídas</th>
                <th className="py-3 pr-5 font-medium text-right">Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              {cashFlow.map((c) => (
                <tr key={c.month} className="border-b border-border-subtle last:border-0">
                  <td className="py-2.5 pl-5 font-medium text-brand-900">{c.month}</td>
                  <td className="py-2.5 text-right tabular-nums text-accent-500">{formatCurrencyPrecise(c.entradas)}</td>
                  <td className="py-2.5 text-right tabular-nums text-danger-500">{formatCurrencyPrecise(c.saidas)}</td>
                  <td className="py-2.5 pr-5 text-right tabular-nums font-semibold text-brand-900">
                    {formatCurrencyPrecise(c.saldo)}
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
