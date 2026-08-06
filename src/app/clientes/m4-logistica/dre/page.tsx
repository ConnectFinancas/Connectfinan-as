import { dreCompetencia, dreFechamento, dreLines } from "@/lib/data/m4-logistica";
import { formatCurrencyPrecise } from "@/lib/format";

export default function DrePage() {
  const receitaLiquida = dreLines.find((l) => l.label === "Receita Líquida")?.value ?? 0;
  const lucroLiquido = dreLines.find((l) => l.isTotal)?.value ?? 0;
  const margem = receitaLiquida ? (lucroLiquido / receitaLiquida) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-brand-900">
            Demonstrativo do Resultado do Exercício (DRE)
          </h1>
          <p className="text-sm text-slate-500">
            Competência: <span className="font-medium text-brand-700">{dreCompetencia}</span> · Fechado em {dreFechamento}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl bg-surface-muted px-4 py-2.5 text-right">
            <p className="text-[11px] text-slate-400">Margem Líquida</p>
            <p className="text-base font-semibold text-brand-900">{margem.toFixed(1)}%</p>
          </div>
          <div className="rounded-xl bg-accent-100 px-4 py-2.5 text-right">
            <p className="text-[11px] text-accent-600">Lucro Líquido</p>
            <p className="text-base font-semibold text-accent-600">{formatCurrencyPrecise(lucroLiquido)}</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {dreLines.map((line, idx) => (
              <tr
                key={idx}
                className={`border-b border-border-subtle last:border-0 ${
                  line.isTotal ? "bg-brand-900" : line.isSubtotal ? "bg-surface-muted" : ""
                }`}
              >
                <td
                  className={`py-3 pl-5 pr-3 ${line.indent ? "pl-9 text-slate-500" : "font-medium"} ${
                    line.isTotal ? "text-white font-semibold" : line.isSubtotal ? "text-brand-900 font-semibold" : "text-brand-900"
                  }`}
                >
                  {line.label}
                </td>
                <td
                  className={`py-3 pr-5 text-right tabular-nums whitespace-nowrap ${
                    line.isTotal
                      ? "text-white font-semibold text-base"
                      : line.isSubtotal
                        ? "text-brand-900 font-semibold"
                        : line.negative
                          ? "text-danger-500"
                          : "text-slate-600"
                  }`}
                >
                  {formatCurrencyPrecise(line.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Regime tributário: Lucro Presumido. Valores apurados a partir da conciliação bancária e lançamentos
        contábeis do período. DRE gerencial elaborada pela equipe de BPO financeiro — Connect Finanças.
      </p>
    </div>
  );
}
