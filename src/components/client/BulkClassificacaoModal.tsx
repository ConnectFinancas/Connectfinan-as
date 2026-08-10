"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useFinance } from "@/lib/store/FinanceContext";

export function BulkClassificacaoModal({
  tipo,
  ids,
  onClose,
}: {
  tipo: "pagar" | "receber";
  ids: string[];
  onClose: () => void;
}) {
  const finance = useFinance();
  const categorias = tipo === "pagar" ? finance.categoriasPagar : finance.categoriasReceber;
  const [classificacao, setClassificacao] = useState(categorias[0]?.classificacao ?? "");
  const [categoria, setCategoria] = useState("");
  const grupoAtual = categorias.find((c) => c.classificacao === classificacao);

  function handleAplicar() {
    if (!classificacao || !categoria) return;
    const patch = { classificacao, categoria };
    if (tipo === "pagar") finance.updatePayables(ids, patch);
    else finance.updateReceivables(ids, patch);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-brand-900">Alterar classificação e categoria</h2>
          <button onClick={onClose} className="text-faint hover:text-brand-900 transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-xs text-faint">Aplica para os {ids.length} lançamentos selecionados.</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Classificação Financeira</label>
            <select
              value={classificacao}
              onChange={(e) => {
                setClassificacao(e.target.value);
                setCategoria("");
              }}
              className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
            >
              {categorias.map((c) => (
                <option key={c.classificacao} value={c.classificacao}>
                  {c.classificacao}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
            >
              <option value="">Selecione...</option>
              {grupoAtual?.categorias.map((c) => (
                <option key={c.nome} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAplicar}
            disabled={!classificacao || !categoria}
            className="mt-1 rounded-lg bg-client-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-client-accent-dark transition-colors disabled:opacity-50"
          >
            Aplicar a {ids.length} lançamento{ids.length > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
