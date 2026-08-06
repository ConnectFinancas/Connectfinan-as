"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ExpenseSlice } from "@/lib/types";
import { formatCurrencyPrecise } from "@/lib/format";

export function ExpensePieChart({ data }: { data: ExpenseSlice[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <ResponsiveContainer width="100%" height={220} className="sm:!w-[220px] shrink-0">
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
              borderRadius: 12,
              border: "1px solid #e2e6f0",
              boxShadow: "0 4px 10px -2px rgb(16 23 40 / 0.10)",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 w-full grid grid-cols-1 gap-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-slate-600">
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
