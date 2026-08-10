"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Pencil, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import { ResultadoConciliacao } from "@/lib/reconciliation/match";
import { ResultadoSalvo } from "@/lib/reconciliation/historicoStore";
import { LancamentoModal } from "@/components/client/LancamentoModal";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";

function StatusPill({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-medium text-accent-500">
      <Check size={11} /> Conciliado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-warn-100 px-2 py-0.5 text-[11px] font-medium text-warn-500">
      <AlertTriangle size={11} /> Pendente
    </span>
  );
}

type RecebimentoItem = {
  forma: "Pix" | "Dinheiro";
  vendaValor: number;
  vendaHora?: string;
  matchInfo?: string;
  status: "conciliado" | "pendente";
  index: number;
};

type Visao = "todos" | "pendentes" | "conciliados";

export function ConciliacaoResultado({
  resultado,
  datas,
  dataSelecionada,
  onNavegar,
  onEditarItem,
  onLancado,
  onFinalizar,
}: {
  resultado: ResultadoConciliacao | ResultadoSalvo;
  datas?: string[];
  dataSelecionada?: string;
  onNavegar?: (data: string) => void;
  onEditarItem?: (
    tipo: "pix" | "dinheiro" | "pagamento",
    index: number,
    patch: { status?: "conciliado" | "pendente"; matchInfo?: string }
  ) => void;
  onLancado?: (chave: string) => void;
  onFinalizar?: () => number;
}) {
  const migrados = "migrados" in resultado ? resultado.migrados ?? {} : {};
  const [taxaLancada, setTaxaLancada] = useState(false);
  const [pagamentosLancados, setPagamentosLancados] = useState<Set<number>>(new Set());
  const [lancarTaxa, setLancarTaxa] = useState(false);
  const [lancarPagamento, setLancarPagamento] = useState<{
    index: number;
    pessoa: string;
    descricao: string;
    valor: number;
    vencimento: string;
  } | null>(null);
  const [editando, setEditando] = useState<{ tipo: "pix" | "dinheiro" | "pagamento"; index: number } | null>(null);
  const [rascunho, setRascunho] = useState("");
  const [visao, setVisao] = useState<Visao>("todos");
  const [mensagemFinalizar, setMensagemFinalizar] = useState<string | null>(null);

  const { cartao, pix, dinheiro, pagamentos } = resultado;

  const recebimentos: RecebimentoItem[] = [
    ...pix.map((item, i) => ({
      forma: "Pix" as const,
      vendaValor: item.vendaValor,
      vendaHora: item.vendaHora,
      matchInfo: item.matchInfo ?? item.match?.historico,
      status: item.status,
      index: i,
    })),
    ...dinheiro.map((item, i) => ({
      forma: "Dinheiro" as const,
      vendaValor: item.vendaValor,
      vendaHora: item.vendaHora,
      matchInfo: item.matchInfo ?? item.match?.historico,
      status: item.status,
      index: i,
    })),
  ];

  const totalItens = recebimentos.length + pagamentos.length;
  const totalPendentes =
    recebimentos.filter((r) => r.status === "pendente").length + pagamentos.filter((p) => p.status === "pendente").length;
  const totalConciliados = totalItens - totalPendentes;

  const recebimentosVisiveis = recebimentos.filter((r) => visao === "todos" || (visao === "pendentes") === (r.status === "pendente"));
  const pagamentosVisiveis = pagamentos.filter((p) => visao === "todos" || (visao === "pendentes") === (p.status === "pendente"));

  const idx = datas && dataSelecionada ? datas.indexOf(dataSelecionada) : -1;
  const podeAnterior = datas && idx !== -1 && idx < datas.length - 1;
  const podeProximo = datas && idx > 0;

  function iniciarEdicao(tipo: "pix" | "dinheiro" | "pagamento", index: number, atual?: string) {
    setEditando({ tipo, index });
    setRascunho(atual ?? "");
  }

  function salvarEdicao() {
    if (!editando || !onEditarItem) return;
    onEditarItem(editando.tipo, editando.index, { matchInfo: rascunho, status: rascunho.trim() ? "conciliado" : "pendente" });
    setEditando(null);
  }

  function reabrir(tipo: "pix" | "dinheiro", index: number) {
    onEditarItem?.(tipo, index, { status: "pendente", matchInfo: "" });
  }

  function finalizarDia() {
    const qtd = onFinalizar?.() ?? 0;
    setMensagemFinalizar(
      qtd > 0
        ? `${qtd} despesa${qtd > 1 ? "s" : ""} enviada${qtd > 1 ? "s" : ""} para Contas a Pagar.`
        : "Nada pendente pra enviar — esse dia já está tudo migrado."
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {datas && datas.length > 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-1.5">
            <button
              disabled={!podeAnterior}
              onClick={() => podeAnterior && onNavegar?.(datas[idx + 1])}
              className="flex items-center gap-1 rounded-lg border border-border-subtle px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={13} />
              Anterior
            </button>
            <button
              disabled={!podeProximo}
              onClick={() => podeProximo && onNavegar?.(datas[idx - 1])}
              className="flex items-center gap-1 rounded-lg border border-border-subtle px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Próximo
              <ChevronRight size={13} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {datas.map((d) => (
              <button
                key={d}
                onClick={() => onNavegar?.(d)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  d === dataSelecionada
                    ? "bg-client-accent text-white"
                    : "bg-surface-muted text-muted hover:bg-border-subtle"
                }`}
              >
                {formatDateBR(d)}
              </button>
            ))}
          </div>
        </div>
      )}

      {resultado.totalPendencias > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-warn-500/30 bg-warn-100 px-4 py-3 text-sm text-warn-500">
          <AlertTriangle size={15} />
          <span className="font-medium">
            {resultado.totalPendencias} conciliaç{resultado.totalPendencias > 1 ? "ões pendentes" : "ão pendente"} em {formatDateBR(resultado.data)}
          </span>
        </div>
      )}

      {/* Barra de visão + finalizar, no estilo Conta Azul (Filtros / Conciliação / Todos conciliados) */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex gap-1.5">
          {([
            ["todos", `Todos (${totalItens})`],
            ["pendentes", `Pendentes (${totalPendentes})`],
            ["conciliados", `Conciliados (${totalConciliados})`],
          ] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setVisao(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                visao === v ? "bg-client-accent text-white" : "text-muted hover:bg-surface-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {mensagemFinalizar && <span className="text-xs text-faint">{mensagemFinalizar}</span>}
          <button
            onClick={finalizarDia}
            className="flex items-center gap-1.5 rounded-lg border border-client-accent px-3 py-1.5 text-xs font-semibold text-client-accent hover:bg-client-accent/10 transition-colors"
          >
            <Sparkles size={13} />
            Finalizar conciliação do dia
          </button>
        </div>
      </div>

      {/* Cartão */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-900">Cartão (Crédito + Débito)</h3>
          <StatusPill ok={cartao.quantidadeBate} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase text-faint">Faturado</p>
            <p className="text-sm font-semibold text-brand-900">{formatCurrencyPrecise(cartao.faturamentoTotal)}</p>
            <p className="text-[11px] text-faint">{cartao.faturamentoQtd} vendas</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-faint">Recebido no PagBank</p>
            <p className="text-sm font-semibold text-brand-900">{formatCurrencyPrecise(cartao.pagbankTotal)}</p>
            <p className="text-[11px] text-faint">{cartao.pagbankQtd} recebimentos</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-faint">Diferença (taxa maquineta)</p>
            <p className="text-sm font-semibold text-warn-500">{formatCurrencyPrecise(cartao.diferenca)}</p>
          </div>
          <div className="flex items-end">
            {taxaLancada || migrados["cartao-taxa"] ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent-100 px-3 py-2 text-xs font-medium text-accent-500">
                <Check size={12} />
                Taxa lançada
              </span>
            ) : (
              <button
                onClick={() => setLancarTaxa(true)}
                className="flex items-center gap-1.5 rounded-lg bg-client-accent px-3 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
              >
                <Plus size={12} />
                Lançar taxa da maquineta
              </button>
            )}
          </div>
        </div>
        {!cartao.quantidadeBate && (
          <p className="mt-3 text-xs text-warn-500">
            Quantidade de vendas no cartão ({cartao.faturamentoQtd}) diferente da quantidade de recebimentos no PagBank ({cartao.pagbankQtd}) — confira antes de lançar a taxa.
          </p>
        )}
        {cartao.quantidadeBate && migrados["cartao"] && (
          <p className="mt-3 flex items-center gap-1 text-xs text-accent-500">
            <Check size={12} />
            Faturamento do cartão já enviado para Contas a Receber.
          </p>
        )}
      </div>

      {/* Pix + Dinheiro unificados */}
      <div className="card overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-semibold text-brand-900">Recebimentos (Pix e Dinheiro)</h3>
          <p className="text-xs text-faint">
            Faturamento × extrato Bradesco (Pix) e caixa físico (Dinheiro) — só o que está pendente pode ser corrigido
          </p>
        </div>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-faint">
                <th className="pb-2 font-medium">Forma</th>
                <th className="pb-2 font-medium">Informação do faturamento</th>
                <th className="pb-2 font-medium">Informação dos outros documentos</th>
                <th className="pb-2 font-medium text-right">Status</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recebimentosVisiveis.map((item) => {
                const tipo = item.forma === "Pix" ? "pix" : "dinheiro";
                const emEdicao = editando?.tipo === tipo && editando.index === item.index;
                const conciliado = item.status === "conciliado";
                return (
                  <tr key={`${item.forma}-${item.index}`} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 text-muted">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          item.forma === "Pix" ? "bg-client-accent/10 text-client-accent" : "bg-surface-muted text-muted"
                        }`}
                      >
                        {item.forma}
                      </span>
                    </td>
                    <td className="py-2 tabular-nums text-brand-900">
                      {formatCurrencyPrecise(item.vendaValor)} <span className="text-faint">· {item.vendaHora}</span>
                    </td>
                    <td className="py-2 text-muted">
                      {emEdicao ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={rascunho}
                            onChange={(e) => setRascunho(e.target.value)}
                            placeholder="Descreva onde foi encontrado, ou deixe vazio p/ pendente"
                            className="w-full rounded-md border border-border-subtle bg-surface-muted px-2 py-1 text-xs text-brand-900 placeholder:text-faint"
                          />
                          <button onClick={salvarEdicao} className="shrink-0 text-accent-500 hover:text-accent-600">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditando(null)} className="shrink-0 text-faint hover:text-danger-500">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        item.matchInfo || "—"
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <StatusPill ok={conciliado} />
                    </td>
                    <td className="py-2 text-right">
                      {!emEdicao && onEditarItem && (
                        conciliado ? (
                          <button
                            onClick={() => reabrir(tipo, item.index)}
                            className="text-faint hover:text-warn-500 transition-colors"
                            title="Não é isso? Reabrir para corrigir"
                          >
                            <RotateCcw size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => iniciarEdicao(tipo, item.index, item.matchInfo)}
                            className="text-faint hover:text-brand-900 transition-colors"
                            title="Corrigir"
                          >
                            <Pencil size={13} />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
              {recebimentosVisiveis.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-xs text-faint">
                    Nenhum item nessa visão.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagamentos / saídas */}
      <div className="card overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-semibold text-brand-900">Saídas (Bradesco + PagBank)</h3>
          <p className="text-xs text-faint">Transferências entre contas não entram no Contas a Pagar nem no DRE</p>
        </div>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-faint">
                <th className="pb-2 font-medium">Origem</th>
                <th className="pb-2 font-medium">Histórico</th>
                <th className="pb-2 font-medium">Tipo</th>
                <th className="pb-2 font-medium text-right">Valor</th>
                <th className="pb-2 font-medium text-right">Status</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pagamentosVisiveis.map((p) => {
                const i = pagamentos.indexOf(p);
                return (
                  <tr key={i} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 text-muted capitalize">{p.origem}</td>
                    <td className="py-2 text-brand-900">{p.historico}</td>
                    <td className="py-2 text-muted">{p.tipo === "transferencia" ? "Transferência" : "Pagamento"}</td>
                    <td className="py-2 text-right tabular-nums text-brand-900">{formatCurrencyPrecise(p.valor)}</td>
                    <td className="py-2 text-right">
                      <StatusPill ok={p.status === "conciliado"} />
                    </td>
                    <td className="py-2 text-right">
                      {p.status === "pendente" && p.tipo === "pagamento" && (pagamentosLancados.has(i) || migrados[`pagamento-${i}`] ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-accent-100 px-2 py-1 text-[11px] font-medium text-accent-500">
                          <Check size={11} />
                          Lançado
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setLancarPagamento({
                              index: i,
                              pessoa: p.sugestao?.favorecido ?? "",
                              descricao: p.historico,
                              valor: p.valor,
                              vencimento: p.data,
                            })
                          }
                          className="flex items-center gap-1 rounded-lg border border-border-subtle px-2 py-1 text-[11px] font-medium text-brand-700 hover:bg-surface-muted transition-colors"
                        >
                          <Plus size={11} />
                          Lançar despesa
                        </button>
                      ))}
                    </td>
                  </tr>
                );
              })}
              {pagamentosVisiveis.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-xs text-faint">
                    Nenhum item nessa visão.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lancarTaxa && (
        <LancamentoModal
          tipo="pagar"
          onClose={() => setLancarTaxa(false)}
          onSaved={() => {
            setTaxaLancada(true);
            onLancado?.("cartao-taxa");
          }}
          prefill={{
            descricao: `Taxa de maquininha - conciliação ${formatDateBR(resultado.data)}`,
            classificacao: "DESPESAS FINANCEIRAS",
            categoria: "Tarifas de Maquininhas",
            valor: cartao.diferenca,
            vencimento: resultado.data,
            status: "pago",
            dataPagamento: resultado.data,
          }}
        />
      )}
      {lancarPagamento && (
        <LancamentoModal
          tipo="pagar"
          onClose={() => setLancarPagamento(null)}
          onSaved={() => {
            setPagamentosLancados((atual) => new Set(atual).add(lancarPagamento.index));
            onLancado?.(`pagamento-${lancarPagamento.index}`);
          }}
          prefill={{
            pessoa: lancarPagamento.pessoa,
            descricao: lancarPagamento.descricao,
            classificacao: "DESPESAS ADMINISTRATIVAS",
            valor: lancarPagamento.valor,
            vencimento: lancarPagamento.vencimento,
          }}
        />
      )}
    </div>
  );
}
