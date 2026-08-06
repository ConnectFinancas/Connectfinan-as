import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: number;
  delta?: number;
  icon: LucideIcon;
  accent?: string;
  hint?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${accent ?? "#2b46a3"}1a`, color: accent ?? "#2b46a3" }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>
      </div>
      <div className="text-2xl font-semibold tracking-tight text-brand-900">
        {formatCurrency(value)}
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {delta !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium ${
              positive ? "bg-accent-100 text-accent-500" : "bg-danger-100 text-danger-500"
            }`}
          >
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        <span className="text-faint">{hint ?? "vs. mês anterior"}</span>
      </div>
    </div>
  );
}
