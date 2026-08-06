import { formatCurrencyPrecise } from "@/lib/format";

export type MiniBar = { label: string; value: number; color: string };

export function MiniBarCompare({ bars, height = 140 }: { bars: MiniBar[]; height?: number }) {
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
  return (
    <div className="flex items-end justify-center gap-8" style={{ height }}>
      {bars.map((b) => (
        <div key={b.label} className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-brand-900 tabular-nums">{formatCurrencyPrecise(b.value)}</span>
          <div
            className="w-10 rounded-t-md"
            style={{
              height: Math.max((Math.abs(b.value) / max) * (height - 60), 4),
              background: b.value === 0 ? "var(--border-subtle)" : b.color,
            }}
          />
          <span className="text-xs text-faint">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
