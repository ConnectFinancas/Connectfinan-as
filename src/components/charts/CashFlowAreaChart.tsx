"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CashFlowPoint } from "@/lib/types";
import { formatCompact, formatCurrencyPrecise } from "@/lib/format";

export function CashFlowAreaChart({ data }: { data: CashFlowPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="saldoFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b46a3" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#2b46a3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e2e6f0" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickFormatter={(v) => formatCompact(v)}
          width={56}
        />
        <Tooltip
          formatter={(value) => formatCurrencyPrecise(Number(value))}
          labelFormatter={(l) => `Saldo em caixa · ${l}`}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e6f0",
            boxShadow: "0 4px 10px -2px rgb(16 23 40 / 0.10)",
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="saldo"
          stroke="#2b46a3"
          strokeWidth={2.5}
          fill="url(#saldoFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
