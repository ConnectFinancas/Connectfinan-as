"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, formatCurrencyPrecise } from "@/lib/format";

export function DailyBalanceChart({ data }: { data: { dia: string; saldo: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
        <XAxis
          dataKey="dia"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          interval={4}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          tickFormatter={(v) => formatCompact(v)}
          width={56}
        />
        <Tooltip
          formatter={(value) => formatCurrencyPrecise(Number(value))}
          labelFormatter={(l) => `Dia ${l}`}
          labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 4 }}
          contentStyle={{
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 8px 20px -6px rgb(0 0 0 / 0.35)",
            fontSize: 13,
          }}
        />
        <Line type="monotone" dataKey="saldo" stroke="#f2a93c" strokeWidth={2.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
