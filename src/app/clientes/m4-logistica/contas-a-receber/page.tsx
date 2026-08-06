import { AlertOctagon, CalendarClock, CheckCircle2 } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { receivables } from "@/lib/data/m4-logistica";
import { formatCurrencyPrecise } from "@/lib/format";

export default function ContasAReceberPage() {
  const atrasado = receivables.filter((r) => r.status === "atrasado").reduce((a, r) => a + r.valor, 0);
  const pendente = receivables
    .filter((r) => r.status === "pendente" || r.status === "agendado")
    .reduce((a, r) => a + r.valor, 0);
  const recebido = receivables.filter((r) => r.status === "pago").reduce((a, r) => a + r.valor, 0);

  const rows = [...receivables].sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Atrasado" value={atrasado} icon={AlertOctagon} accent="#f2665c" hint="cobrar cliente" />
        <KpiCard label="A Receber (agosto)" value={pendente} icon={CalendarClock} accent="#f2a93c" hint="pendente + agendado" />
        <KpiCard label="Recebido no mês" value={recebido} icon={CheckCircle2} accent="#22d3a0" hint="já liquidado" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-sm font-semibold text-brand-900">Contas a Receber — Agosto/2026</h2>
          <span className="text-xs text-faint">{rows.length} lançamentos</span>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-faint">
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Descrição</th>
                <th className="pb-2 font-medium">Vencimento</th>
                <th className="pb-2 font-medium text-right">Valor</th>
                <th className="pb-2 pl-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border-subtle last:border-0">
                  <td className="py-3 font-medium text-brand-900">{r.cliente}</td>
                  <td className="py-3 text-muted">{r.descricao}</td>
                  <td className="py-3 whitespace-nowrap text-muted">
                    {new Date(r.vencimento + "T00:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 text-right font-medium tabular-nums text-brand-900">
                    {formatCurrencyPrecise(r.valor)}
                  </td>
                  <td className="py-3 pl-4">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border-subtle bg-surface-muted">
                <td className="py-3 pl-1 font-semibold text-brand-900" colSpan={3}>
                  Total do mês
                </td>
                <td className="py-3 text-right font-semibold tabular-nums text-brand-900">
                  {formatCurrencyPrecise(rows.reduce((a, r) => a + r.valor, 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
