"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ExpenseSlice } from "@/lib/types";
import { formatCurrencyPrecise } from "@/lib/format";

export function ExpensePieChart({
  data,
  centerLabel,
  centerSub,
}: {
  data: ExpenseSlice[];
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative shrink-0 w-full sm:w-[220px] h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={1.5}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, entry) => {
                const num = Number(value);
                return [
                  `${formatCurrencyPrecise(num)} (${((num / total) * 100).toFixed(1)}%)`,
                  (entry.payload as ExpenseSlice).label,
                ];
              }}
              contentStyle={{
                background: "var(--surface)",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 8px 20px -6px rgb(0 0 0 / 0.35)",
                fontSize: 13,
                color: "var(--foreground)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-base font-semibold text-brand-900 leading-tight">{centerLabel}</span>
            {centerSub && <span className="text-[11px] text-faint">{centerSub}</span>}
          </div>
        )}
      </div>
      <ul className="flex-1 w-full grid grid-cols-1 gap-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="font-medium text-brand-900 tabular-nums">
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
