"use client";

import { useState } from "react";
import { AlertTriangle, Check, Plus } from "lucide-react";
import { ResultadoConciliacao } from "@/lib/reconciliation/match";
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

export function ConciliacaoResultado({ resultado }: { resultado: ResultadoConciliacao }) {
  const [lancarTaxa, setLancarTaxa] = useState(false);
  const [lancarPagamento, setLancarPagamento] = useState<{
    pessoa: string;
    descricao: string;
    valor: number;
    vencimento: string;
  } | null>(null);

  const { cartao, pix, dinheiro, pagamentos } = resultado;

  return (
    <div className="flex flex-col gap-5">
      {resultado.totalPendencias > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-warn-500/30 bg-warn-100 px-4 py-3 text-sm text-warn-500">
          <AlertTriangle size={15} />
          <span className="font-medium">
            {resultado.totalPendencias} conciliaç{resultado.totalPendencias > 1 ? "ões pendentes" : "ão pendente"} em {formatDateBR(resultado.data)}
          </span>
        </div>
      )}

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
            <button
              onClick={() => setLancarTaxa(true)}
              className="flex items-center gap-1.5 rounded-lg bg-client-accent px-3 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
            >
              <Plus size={12} />
              Lançar taxa da maquineta
            </button>
          </div>
        </div>
        {!cartao.quantidadeBate && (
          <p className="mt-3 text-xs text-warn-500">
            Quantidade de vendas no cartão ({cartao.faturamentoQtd}) diferente da quantidade de recebimentos no PagBank ({cartao.pagbankQtd}) — confira antes de lançar a taxa.
          </p>
        )}
      </div>

      {/* Pix */}
      <div className="card overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-semibold text-brand-900">Pix</h3>
          <p className="text-xs text-faint">Faturamento × recebido no extrato Bradesco</p>
        </div>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-faint">
                <th className="pb-2 font-medium">Faturamento</th>
                <th className="pb-2 font-medium">Bradesco</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {pix.map((item, i) => (
                <tr key={i} className="border-b border-border-subtle last:border-0">
                  <td className="py-2 tabular-nums text-brand-900">
                    {formatCurrencyPrecise(item.vendaValor)} <span className="text-faint">· {item.vendaHora}</span>
                  </td>
                  <td className="py-2 text-muted">{item.match ? item.match.historico : "—"}</td>
                  <td className="py-2 text-right">
                    <StatusPill ok={item.status === "conciliado"} />
                  </td>
                </tr>
              ))}
              {pix.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-xs text-faint">
                    Nenhuma venda em Pix no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dinheiro */}
      <div className="card overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-semibold text-brand-900">Dinheiro / Espécie</h3>
          <p className="text-xs text-faint">Faturamento × movimento do caixa físico</p>
        </div>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-faint">
                <th className="pb-2 font-medium">Faturamento</th>
                <th className="pb-2 font-medium">Caixa físico</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {dinheiro.map((item, i) => (
                <tr key={i} className="border-b border-border-subtle last:border-0">
                  <td className="py-2 tabular-nums text-brand-900">
                    {formatCurrencyPrecise(item.vendaValor)} <span className="text-faint">· {item.vendaHora}</span>
                  </td>
                  <td className="py-2 text-muted">{item.match ? item.match.historico : "—"}</td>
                  <td className="py-2 text-right">
                    <StatusPill ok={item.status === "conciliado"} />
                  </td>
                </tr>
              ))}
              {dinheiro.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-xs text-faint">
                    Nenhuma venda em dinheiro no período.
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
              {pagamentos.map((p, i) => (
                <tr key={i} className="border-b border-border-subtle last:border-0">
                  <td className="py-2 text-muted capitalize">{p.origem}</td>
                  <td className="py-2 text-brand-900">{p.historico}</td>
                  <td className="py-2 text-muted">{p.tipo === "transferencia" ? "Transferência" : "Pagamento"}</td>
                  <td className="py-2 text-right tabular-nums text-brand-900">{formatCurrencyPrecise(p.valor)}</td>
                  <td className="py-2 text-right">
                    <StatusPill ok={p.status === "conciliado"} />
                  </td>
                  <td className="py-2 text-right">
                    {p.status === "pendente" && p.tipo === "pagamento" && (
                      <button
                        onClick={() =>
                          setLancarPagamento({
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
                    )}
                  </td>
                </tr>
              ))}
              {pagamentos.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-xs text-faint">
                    Nenhuma saída no período.
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
          prefill={{
            descricao: `Taxa de maquininha - conciliação ${formatDateBR(resultado.data)}`,
            classificacao: "DESPESAS FINANCEIRAS",
            categoria: "Tarifas de Maquininhas",
            valor: cartao.diferenca,
            vencimento: resultado.data,
          }}
        />
      )}
      {lancarPagamento && (
        <LancamentoModal
          tipo="pagar"
          onClose={() => setLancarPagamento(null)}
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
