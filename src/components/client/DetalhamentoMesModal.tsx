"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useFinance } from "@/lib/store/FinanceContext";
import { computeDetalhamentoMes, computePagamentosFornecedores } from "@/lib/derive";
import { dreMonths } from "@/lib/constants";
import { formatCurrencyPrecise } from "@/lib/format";
import { HOJE, formatDateBR } from "@/lib/today";

function ultimoMesComMovimento(payables: { vencimento: string }[]): number {
  const mesesComDado = new Set(payables.map((p) => new Date(p.vencimento + "T00:00:00").getMonth()));
  for (let i = Math.min(HOJE.getMonth(), 11); i >= 0; i--) {
    if (mesesComDado.has(i)) return i;
  }
  return HOJE.getMonth();
}

export function DetalhamentoMesModal({ onClose }: { onClose: () => void }) {
  const finance = useFinance();
  const [mesIndex, setMesIndex] = useState(() => ultimoMesComMovimento(finance.payables));
  const [classAberta, setClassAberta] = useState<string | null>(null);
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null);

  const detalhamento = useMemo(
    () => computeDetalhamentoMes(finance.payables, finance.categoriasPagar, mesIndex),
    [finance.payables, finance.categoriasPagar, mesIndex]
  );
  const fornecedores = useMemo(() => computePagamentosFornecedores(finance.payables, mesIndex), [finance.payables, mesIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10 sm:pt-16" onClick={onClose}>
      <div className="card w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-900">Detalhamento por mês</h2>
            <p className="text-xs text-faint">Classificação e categoria com % de representatividade sobre o total de saídas do mês</p>
          </div>
          <button onClick={onClose} className="text-faint hover:text-brand-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <label className="text-xs font-medium text-muted">Mês</label>
          <select
            value={mesIndex}
            onChange={(e) => {
              setMesIndex(Number(e.target.value));
              setClassAberta(null);
              setCategoriaAberta(null);
            }}
            className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
          >
            {dreMonths.map((m, i) => (
              <option key={m} value={i}>
                {m}/26
              </option>
            ))}
          </select>
          <span className="ml-auto text-xs text-faint">
            Total do mês: <span className="font-semibold text-brand-900">{formatCurrencyPrecise(detalhamento.totalMes)}</span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
          {detalhamento.classificacoes.length === 0 && (
            <p className="py-6 text-center text-xs text-faint">Nenhum lançamento em {detalhamento.mes}/26.</p>
          )}
          {detalhamento.classificacoes.map((c) => (
            <div key={c.classificacao} className="rounded-lg border border-border-subtle">
              <button
                onClick={() => setClassAberta(classAberta === c.classificacao ? null : c.classificacao)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-muted transition-colors"
              >
                {classAberta === c.classificacao ? (
                  <ChevronDown size={13} className="shrink-0 text-faint" />
                ) : (
                  <ChevronRight size={13} className="shrink-0 text-faint" />
                )}
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
                <span className="flex-1 text-xs font-medium text-brand-900">{c.classificacao}</span>
                <span className="text-xs tabular-nums text-muted">{formatCurrencyPrecise(c.valor)}</span>
                <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-brand-700">{c.pctDoTotal.toFixed(1)}%</span>
              </button>
              {classAberta === c.classificacao && (
                <div className="flex flex-col gap-1 border-t border-border-subtle p-2 pl-6">
                  {c.categorias.map((cat) => (
                    <div key={cat.categoria}>
                      <button
                        onClick={() => setCategoriaAberta(categoriaAberta === `${c.classificacao}|${cat.categoria}` ? null : `${c.classificacao}|${cat.categoria}`)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-muted transition-colors"
                      >
                        {categoriaAberta === `${c.classificacao}|${cat.categoria}` ? (
                          <ChevronDown size={11} className="shrink-0 text-faint" />
                        ) : (
                          <ChevronRight size={11} className="shrink-0 text-faint" />
                        )}
                        <span className="flex-1 text-[11px] text-muted">{cat.categoria}</span>
                        <span className="text-[11px] tabular-nums text-muted">{formatCurrencyPrecise(cat.valor)}</span>
                        <span className="w-10 shrink-0 text-right text-[11px] font-medium tabular-nums text-brand-700">{cat.pctDoTotal.toFixed(1)}%</span>
                      </button>
                      {categoriaAberta === `${c.classificacao}|${cat.categoria}` && (
                        <div className="flex flex-col gap-0.5 pl-6 pr-2 pb-1">
                          {cat.lancamentos.map((l) => (
                            <div key={l.id} className="flex items-center gap-2 py-1 text-[11px] text-faint">
                              <span className="w-16 shrink-0">{formatDateBR(l.vencimento)}</span>
                              <span className="flex-1 truncate">{l.descricao}</span>
                              <span className="tabular-nums">{formatCurrencyPrecise(l.valor)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-border-subtle bg-surface-muted p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-brand-900">Pagamentos a fornecedores no mês</h3>
            <span className="text-xs text-faint">
              não entra no DRE · {fornecedores.quantidade} lançamento{fornecedores.quantidade !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="mb-3 text-lg font-semibold tabular-nums text-brand-900">{formatCurrencyPrecise(fornecedores.total)}</p>
          {fornecedores.porFornecedor.length > 0 ? (
            <div className="flex flex-col gap-1">
              {fornecedores.porFornecedor.map((f) => (
                <div key={f.fornecedor} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{f.fornecedor}</span>
                  <span className="tabular-nums text-brand-900">{formatCurrencyPrecise(f.valor)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-faint">Sem pagamentos a fornecedor em {detalhamento.mes}/26.</p>
          )}
        </div>
      </div>
    </div>
  );
}
