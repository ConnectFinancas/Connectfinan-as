import { AlertOctagon, CalendarClock, CheckCircle2, ScrollText } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { taxObligations } from "@/lib/data/m4-logistica";
import { formatCurrencyPrecise } from "@/lib/format";

export default function ObrigacoesFiscaisPage() {
  const atrasado = taxObligations.filter((t) => t.status === "atrasado").reduce((a, t) => a + t.valor, 0);
  const pendente = taxObligations.filter((t) => t.status === "pendente").reduce((a, t) => a + t.valor, 0);
  const pago = taxObligations.filter((t) => t.status === "pago").reduce((a, t) => a + t.valor, 0);

  const rows = [...taxObligations].sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Em Atraso" value={atrasado} icon={AlertOctagon} accent="#f2665c" hint="regularizar" />
        <KpiCard label="A Vencer (agosto)" value={pendente} icon={CalendarClock} accent="#f2a93c" hint="guias pendentes" />
        <KpiCard label="Recolhido no trimestre" value={pago} icon={CheckCircle2} accent="#22d3a0" hint="já pago" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 p-5 pb-0">
          <ScrollText size={16} className="text-brand-700" />
          <h2 className="text-sm font-semibold text-brand-900">Calendário de Obrigações Fiscais — Regime: Lucro Presumido</h2>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-faint">
                <th className="pb-2 font-medium">Obrigação</th>
                <th className="pb-2 font-medium">Competência</th>
                <th className="pb-2 font-medium">Vencimento</th>
                <th className="pb-2 font-medium text-right">Valor</th>
                <th className="pb-2 pl-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-border-subtle last:border-0">
                  <td className="py-3 font-medium text-brand-900">{t.nome}</td>
                  <td className="py-3 text-muted">{t.competencia}</td>
                  <td className="py-3 whitespace-nowrap text-muted">
                    {new Date(t.vencimento + "T00:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 text-right font-medium tabular-nums text-brand-900">
                    {t.valor > 0 ? formatCurrencyPrecise(t.valor) : <span className="text-faint">Declaratória</span>}
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
