"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MonthlyFinancials } from "@/lib/types";
import { formatCompact, formatCurrencyPrecise } from "@/lib/format";

export function RevenueExpenseChart({ data }: { data: MonthlyFinancials[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
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
          cursor={{ fill: "var(--surface-muted)" }}
          formatter={(value, name) => [
            formatCurrencyPrecise(Number(value)),
            name === "receita" ? "Receita" : "Saídas",
          ]}
          labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 4 }}
          contentStyle={{
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 8px 20px -6px rgb(0 0 0 / 0.35)",
            fontSize: 13,
          }}
        />
        <Legend
          formatter={(value) => (value === "receita" ? "Receita" : "Saídas")}
          wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }}
        />
        <Bar dataKey="receita" fill="#22d3a0" radius={[4, 4, 0, 0]} barSize={14} isAnimationActive={false} />
        <Bar dataKey="despesa" name="saidas" fill="#ff8a5c" radius={[4, 4, 0, 0]} barSize={14} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
