"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, Pencil, Tag, Trash2, X } from "lucide-react";
import { CategoryTag } from "@/components/CategoryTag";
import { StatusBadge } from "@/components/StatusBadge";
import { LancamentoModal } from "@/components/client/LancamentoModal";
import { BulkClassificacaoModal } from "@/components/client/BulkClassificacaoModal";
import { useFinance } from "@/lib/store/FinanceContext";
import { displayStatus } from "@/lib/derive";
import { formatDateBR, HOJE, toISO } from "@/lib/today";
import { formatCurrencyPrecise } from "@/lib/format";
import { Payable } from "@/lib/types";

function Kpi({ label, value, hint, tone }: { label: string; value: number; hint: string; tone?: "positive" | "negative" | "warn" }) {
  const color = tone === "positive" ? "text-accent-500" : tone === "negative" ? "text-danger-500" : tone === "warn" ? "text-warn-500" : "text-brand-900";
  return (
    <div className="card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${color}`}>{formatCurrencyPrecise(value)}</p>
      <p className="mt-1.5 text-xs text-faint">{hint}</p>
    </div>
  );
}

export default function ContasAPagarPage() {
  const finance = useFinance();
  const [modalAberto, setModalAberto] = useState(false);
  const [editEntry, setEditEntry] = useState<Payable | null>(null);
  const [bulkClassifAberto, setBulkClassifAberto] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [classificacaoFiltro, setClassificacaoFiltro] = useState("todas");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const rows = useMemo(() => {
    return [...finance.payables]
      .filter((p) => {
        const status = displayStatus(p.status, p.vencimento);
        if (statusFiltro !== "todos" && status !== statusFiltro) return false;
        if (classificacaoFiltro !== "todas" && p.classificacao !== classificacaoFiltro) return false;
        if (de && p.vencimento < de) return false;
        if (ate && p.vencimento > ate) return false;
        if (busca && !`${p.favorecido} ${p.descricao}`.toLowerCase().includes(busca.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  }, [finance.payables, busca, statusFiltro, classificacaoFiltro, de, ate]);

  const todosVisiveisSelecionados = rows.length > 0 && rows.every((p) => selecionados.includes(p.id));

  function limparFiltros() {
    setBusca("");
    setStatusFiltro("todos");
    setClassificacaoFiltro("todas");
    setDe("");
    setAte("");
  }

  function toggleTodos() {
    if (todosVisiveisSelecionados) {
      setSelecionados((s) => s.filter((id) => !rows.some((r) => r.id === id)));
    } else {
      setSelecionados((s) => [...new Set([...s, ...rows.map((r) => r.id)])]);
    }
  }

  function toggleUm(id: string) {
    setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function handleExcluirSelecionados() {
    if (!confirm(`Excluir ${selecionados.length} lançamento(s) selecionado(s)? Essa ação não pode ser desfeita.`)) return;
    finance.deletePayables(selecionados);
    setSelecionados([]);
  }

  function handleDuplicarSelecionados() {
    finance.duplicatePayables(selecionados);
    setSelecionados([]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <button
            onClick={() => setModalAberto(true)}
            className="rounded-lg bg-m4-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-m4-accent-dark transition-colors whitespace-nowrap"
          >
            + Nova despesa
          </button>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Vencimento de</label>
            <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Até</label>
            <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Classificação financeira</label>
            <select
              value={classificacaoFiltro}
              onChange={(e) => setClassificacaoFiltro(e.target.value)}
              className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
            >
              <option value="todas">Todas as classificações</option>
              {finance.categoriasPagar.map((c) => (
                <option key={c.classificacao} value={c.classificacao}>
                  {c.classificacao}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 min-w-[160px] flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Fornecedor / descrição</label>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="buscar..."
              className="w-full rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Status</label>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
            >
              <option value="todos">Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Em aberto</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-2 text-xs font-semibold text-brand-950 hover:bg-accent-600 transition-colors whitespace-nowrap">
            <Download size={13} />
            Exportar CSV
          </button>
          <button onClick={limparFiltros} className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-muted hover:bg-surface-muted transition-colors">
            Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Kpi label="Despesas no período" value={finance.contasPagarKpis.despesasPeriodo.value} hint={finance.contasPagarKpis.despesasPeriodo.hint} />
        <Kpi label="Pago" value={finance.contasPagarKpis.pago.value} hint={finance.contasPagarKpis.pago.hint} tone="positive" />
        <Kpi label="Em Aberto" value={finance.contasPagarKpis.emAberto.value} hint={finance.contasPagarKpis.emAberto.hint} tone="warn" />
        <Kpi label="Maior Valor" value={finance.contasPagarKpis.maiorValor.value} hint={finance.contasPagarKpis.maiorValor.hint} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-sm font-semibold text-brand-900">Despesas</h2>
          {selecionados.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-brand-900">{selecionados.length} selecionado{selecionados.length > 1 ? "s" : ""}</span>
              <button
                onClick={() => setBulkClassifAberto(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
              >
                <Tag size={12} />
                Alterar classificação/categoria
              </button>
              <button
                onClick={handleDuplicarSelecionados}
                className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
              >
                <Copy size={12} />
                Duplicar
              </button>
              <button
                onClick={handleExcluirSelecionados}
                className="flex items-center gap-1.5 rounded-lg border border-danger-500/40 px-2.5 py-1.5 text-xs font-medium text-danger-500 hover:bg-danger-500/10 transition-colors"
              >
                <Trash2 size={12} />
                Excluir
              </button>
              <button
                onClick={() => setSelecionados([])}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-faint hover:text-brand-900 transition-colors"
              >
                <X size={12} />
                Cancelar
              </button>
            </div>
          ) : (
            <span className="text-xs text-faint">{rows.length} de {finance.payables.length} lançamentos</span>
          )}
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-faint">
                <th className="pb-2 pr-2 font-medium">
                  <input type="checkbox" checked={todosVisiveisSelecionados} onChange={toggleTodos} className="accent-accent-500" />
                </th>
                <th className="pb-2 font-medium">Fornecedor</th>
                <th className="pb-2 font-medium">Categoria</th>
                <th className="pb-2 pr-4 font-medium">Classificação financeira</th>
                <th className="pb-2 pr-4 font-medium">Vencimento</th>
                <th className="pb-2 font-medium text-right">Valor</th>
                <th className="pb-2 pl-4 font-medium">Status</th>
                <th className="pb-2 pl-4 font-medium">Pagamento</th>
                <th className="pb-2 pl-4 font-medium">Conta</th>
                <th className="pb-2 pl-4 font-medium">Descrição</th>
                <th className="pb-2 pl-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const status = displayStatus(p.status, p.vencimento);
                return (
                  <tr
                    key={p.id}
                    onClick={() => setEditEntry(p)}
                    className="cursor-pointer border-b border-border-subtle last:border-0 group hover:bg-surface-muted/60"
                  >
                    <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selecionados.includes(p.id)} onChange={() => toggleUm(p.id)} className="accent-accent-500" />
                    </td>
                    <td className="py-3 font-medium text-brand-900 whitespace-nowrap">{p.favorecido}</td>
                    <td className="py-3"><CategoryTag name={p.categoria} /></td>
                    <td className="py-3 pr-4 text-muted whitespace-nowrap">{p.classificacao}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted">{formatDateBR(p.vencimento)}</td>
                    <td className="py-3 text-right font-medium tabular-nums text-brand-900 whitespace-nowrap">
                      {formatCurrencyPrecise(p.valor)}
                    </td>
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                        {status !== "pago" && (
                          <button
                            title="Marcar como pago"
                            onClick={(e) => {
                              e.stopPropagation();
                              finance.markPago("pagar", p.id, toISO(HOJE));
                            }}
                            className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded-full bg-accent-100 text-accent-500 transition-opacity"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pl-4 whitespace-nowrap text-muted">{p.pagamento ? formatDateBR(p.pagamento) : "—"}</td>
                    <td className="py-3 pl-4 whitespace-nowrap text-muted">{p.conta ?? "—"}</td>
                    <td className="py-3 pl-4 text-muted whitespace-nowrap">{p.descricao}</td>
                    <td className="py-3 pl-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="Editar lançamento"
                        onClick={() => setEditEntry(p)}
                        className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-full text-faint hover:bg-surface-muted hover:text-brand-900 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalAberto && <LancamentoModal tipo="pagar" onClose={() => setModalAberto(false)} />}
      {editEntry && <LancamentoModal key={editEntry.id} tipo="pagar" entry={editEntry} onClose={() => setEditEntry(null)} />}
      {bulkClassifAberto && (
        <BulkClassificacaoModal tipo="pagar" ids={selecionados} onClose={() => { setBulkClassifAberto(false); setSelecionados([]); }} />
      )}
    </div>
  );
}
