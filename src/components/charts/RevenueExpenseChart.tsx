"use client";

import {
  Bar,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthlyFinancials } from "@/lib/types";
import { formatCompact, formatCurrencyPrecise } from "@/lib/format";

export function RevenueExpenseChart({ data }: { data: MonthlyFinancials[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e2e6f0" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickFormatter={(v) => formatCompact(v)}
          width={56}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrencyPrecise(Number(value)),
            name === "receita" ? "Receita" : "Despesa",
          ]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e6f0",
            boxShadow: "0 4px 10px -2px rgb(16 23 40 / 0.10)",
            fontSize: 13,
          }}
        />
        <Bar dataKey="despesa" fill="#dbe1ee" radius={[6, 6, 0, 0]} barSize={22} isAnimationActive={false} />
        <Line
          type="monotone"
          dataKey="receita"
          stroke="#0f9d6a"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#0f9d6a", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
