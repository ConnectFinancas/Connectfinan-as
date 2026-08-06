import { Download, FileBarChart, FileSpreadsheet, FileText, Landmark, ReceiptText } from "lucide-react";

const reports = [
  { label: "DRE Gerencial", desc: "Demonstrativo de resultado mensal ou por período", icon: ReceiptText },
  { label: "Fluxo de Caixa", desc: "Entradas, saídas e projeção de saldo", icon: FileBarChart },
  { label: "Contas a Pagar e Receber", desc: "Posição consolidada de vencimentos", icon: FileSpreadsheet },
  { label: "Extrato Conciliado", desc: "Movimentações bancárias com status de conciliação", icon: Landmark },
  { label: "Balancete", desc: "Balancete de verificação contábil", icon: FileText },
];

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <h1 className="text-base font-semibold text-brand-900">Relatórios</h1>
        <p className="text-sm text-slate-500">Gere e exporte os relatórios financeiros da M4 Logística em PDF ou Excel.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <div key={r.label} className="card flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-800/10 text-brand-700">
                <r.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-900">{r.label}</p>
                <p className="truncate text-xs text-slate-500">{r.desc}</p>
              </div>
            </div>
            <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors">
              <Download size={14} />
              Exportar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
