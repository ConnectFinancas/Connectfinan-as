"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, formatCurrencyPrecise } from "@/lib/format";

export type AccumulatedPoint = { month: string; acumulado: number };

export function AccumulatedRevenueAreaChart({ data }: { data: AccumulatedPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="receitaAcumFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3a0" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22d3a0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--text-muted)" }}
          tickFormatter={(v) => formatCompact(v)}
          width={56}
        />
        <Tooltip
          formatter={(value) => [formatCurrencyPrecise(Number(value)), "Receita acumulada"]}
          labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 4 }}
          contentStyle={{
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 8px 20px -6px rgb(0 0 0 / 0.35)",
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="acumulado"
          stroke="#22d3a0"
          strokeWidth={2.5}
          fill="url(#receitaAcumFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
