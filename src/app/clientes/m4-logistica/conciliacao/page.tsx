import { CheckCircle2, CircleDashed, Landmark } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { bankTransactions } from "@/lib/data/m4-logistica";
import { formatCurrencyPrecise } from "@/lib/format";

export default function ConciliacaoPage() {
  const naoConciliado = bankTransactions.filter((t) => t.status === "nao_conciliado");
  const conciliado = bankTransactions.filter((t) => t.status === "conciliado");
  const saldoExtrato = bankTransactions.reduce((a, t) => a + t.valor, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Saldo Movimentado (extrato)" value={saldoExtrato} icon={Landmark} accent="#2b46a3" hint="período exibido" />
        <KpiCard label="Itens Conciliados" value={conciliado.length} icon={CheckCircle2} accent="#0f9d6a" hint="lançamentos" />
        <KpiCard label="Pendentes de Conciliação" value={naoConciliado.length} icon={CircleDashed} accent="#d97706" hint="lançamentos" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h2 className="text-sm font-semibold text-brand-900">Extrato Bancário — Banco Itaú · Conta Corrente</h2>
            <p className="text-xs text-slate-400">Últimos lançamentos importados via Open Finance</p>
          </div>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-slate-400">
                <th className="pb-2 font-medium">Data</th>
                <th className="pb-2 font-medium">Descrição</th>
                <th className="pb-2 font-medium">Categoria</th>
                <th className="pb-2 font-medium text-right">Valor</th>
                <th className="pb-2 pl-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bankTransactions.map((t) => (
                <tr key={t.id} className="border-b border-border-subtle last:border-0">
                  <td className="py-3 whitespace-nowrap text-slate-500">
                    {new Date(t.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 font-medium text-brand-900">{t.descricao}</td>
                  <td className="py-3 text-slate-500">{t.categoria}</td>
                  <td className={`py-3 text-right font-medium tabular-nums ${t.valor < 0 ? "text-danger-500" : "text-accent-600"}`}>
                    {formatCurrencyPrecise(t.valor)}
                  </td>
                  <td className="py-3 pl-4">
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
