"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { MovimentoCaixaFisico } from "@/lib/reconciliation/types";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";

export function CaixaFisicoManualTable({
  movimentos,
  onChange,
}: {
  movimentos: MovimentoCaixaFisico[];
  onChange: (movs: MovimentoCaixaFisico[]) => void;
}) {
  const [data, setData] = useState("");
  const [historico, setHistorico] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");

  function adicionar() {
    const valorNum = Number(valor.replace(",", "."));
    if (!data || !historico.trim() || !valorNum) return;
    const novo: MovimentoCaixaFisico = {
      data,
      historico: historico.trim(),
      entrada: tipo === "entrada" ? valorNum : undefined,
      saida: tipo === "saida" ? valorNum : undefined,
    };
    onChange([...movimentos, novo]);
    setHistorico("");
    setValor("");
  }

  function remover(idx: number) {
    onChange(movimentos.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-faint">
        Digite os lançamentos do caderno de caixa (letra à mão não é lida automaticamente) — rápido, olhando a foto anexada.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        />
        <input
          value={historico}
          onChange={(e) => setHistorico(e.target.value)}
          placeholder="Histórico (ex.: Severina)"
          className="sm:col-span-2 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "entrada" | "saida")}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0,00"
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
      </div>
      <button
        onClick={adicionar}
        className="flex items-center justify-center gap-1.5 self-start rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
      >
        <Plus size={12} />
        Adicionar linha
      </button>

      {movimentos.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-border-subtle p-2">
          {movimentos.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-16 shrink-0 text-faint">{formatDateBR(m.data)}</span>
              <span className="flex-1 truncate text-muted">{m.historico}</span>
              <span className={`tabular-nums ${m.entrada ? "text-accent-500" : "text-danger-500"}`}>
                {formatCurrencyPrecise(m.entrada ?? -(m.saida ?? 0))}
              </span>
              <button onClick={() => remover(i)} className="text-faint hover:text-danger-500 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
