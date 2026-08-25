"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { MovimentoCaixaFisico } from "@/lib/reconciliation/types";
import { useFinance } from "@/lib/store/FinanceContext";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";

function FormularioLinha({
  inicial,
  onSalvar,
  onCancelar,
  textoBotao,
}: {
  inicial?: MovimentoCaixaFisico;
  onSalvar: (mov: MovimentoCaixaFisico) => void;
  onCancelar?: () => void;
  textoBotao: string;
}) {
  const finance = useFinance();
  const [data, setData] = useState(inicial?.data ?? "");
  const [historico, setHistorico] = useState(inicial?.historico ?? "");
  const [valor, setValor] = useState(inicial ? String(inicial.entrada ?? inicial.saida ?? "").replace(".", ",") : "");
  const [tipo, setTipo] = useState<"entrada" | "saida">(inicial?.saida ? "saida" : "entrada");
  const [classificacao, setClassificacao] = useState(inicial?.classificacao ?? finance.categoriasPagar[0]?.classificacao ?? "");
  const [categoria, setCategoria] = useState(inicial?.categoria ?? "");

  const grupoAtual = finance.categoriasPagar.find((c) => c.classificacao === classificacao);

  function salvar() {
    const valorNum = Number(valor.replace(",", "."));
    if (!data || !historico.trim() || !valorNum) return;
    if (tipo === "saida" && (!classificacao || !categoria)) return;
    onSalvar({
      data,
      historico: historico.trim(),
      entrada: tipo === "entrada" ? valorNum : undefined,
      saida: tipo === "saida" ? valorNum : undefined,
      classificacao: tipo === "saida" ? classificacao : undefined,
      categoria: tipo === "saida" ? categoria : undefined,
    });
  }

  return (
    <div className="flex flex-col gap-2">
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

      {tipo === "saida" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            value={classificacao}
            onChange={(e) => {
              setClassificacao(e.target.value);
              setCategoria("");
            }}
            className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
          >
            {finance.categoriasPagar.map((c) => (
              <option key={c.classificacao} value={c.classificacao}>
                {c.classificacao}
              </option>
            ))}
          </select>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
          >
            <option value="">Categoria...</option>
            {grupoAtual?.categorias.map((c) => (
              <option key={c.nome} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={salvar}
          className="flex items-center justify-center gap-1.5 self-start rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
        >
          {textoBotao === "Adicionar linha" ? <Plus size={12} /> : <Check size={12} />}
          {textoBotao}
        </button>
        {onCancelar && (
          <button onClick={onCancelar} className="text-xs font-medium text-faint hover:text-danger-500 transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export function CaixaFisicoManualTable({
  movimentos,
  onChange,
}: {
  movimentos: MovimentoCaixaFisico[];
  onChange: (movs: MovimentoCaixaFisico[]) => void;
}) {
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);

  function remover(idx: number) {
    onChange(movimentos.filter((_, i) => i !== idx));
  }

  function salvarEdicao(idx: number, mov: MovimentoCaixaFisico) {
    onChange(movimentos.map((m, i) => (i === idx ? mov : m)));
    setEditandoIdx(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-faint">
        Digite os lançamentos do caderno de caixa (letra à mão não é lida automaticamente) — rápido, olhando a foto anexada. Lançou
        algo errado? Clique no lápis pra corrigir — a conciliação já refaz o pareamento sozinha com o valor certo.
      </p>

      {editandoIdx === null && (
        <FormularioLinha textoBotao="Adicionar linha" onSalvar={(mov) => onChange([...movimentos, mov])} />
      )}

      {movimentos.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-border-subtle p-2">
          {movimentos.map((m, i) =>
            editandoIdx === i ? (
              <div key={i} className="rounded-lg bg-surface-muted p-2">
                <FormularioLinha inicial={m} textoBotao="Salvar correção" onSalvar={(mov) => salvarEdicao(i, mov)} onCancelar={() => setEditandoIdx(null)} />
              </div>
            ) : (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 text-faint">{formatDateBR(m.data)}</span>
                <span className="flex-1 truncate text-muted">
                  {m.historico}
                  {m.saida && m.categoria && <span className="text-faint"> · {m.categoria}</span>}
                </span>
                <span className={`tabular-nums ${m.entrada ? "text-accent-500" : "text-danger-500"}`}>
                  {formatCurrencyPrecise(m.entrada ?? -(m.saida ?? 0))}
                </span>
                <button onClick={() => setEditandoIdx(i)} title="Corrigir esse lançamento" className="text-faint hover:text-client-accent transition-colors">
                  <Pencil size={12} />
                </button>
                <button onClick={() => remover(i)} title="Remover" className="text-faint hover:text-danger-500 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
