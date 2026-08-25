"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Landmark, Pencil, Wallet } from "lucide-react";
import { useFinance } from "@/lib/store/FinanceContext";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";

const CONTAS = [
  { nome: "Bradesco", icon: Landmark },
  { nome: "PagBank", icon: Landmark },
  { nome: "Caixa Físico", icon: Wallet },
] as const;

type Movimento = {
  data: string;
  descricao: string;
  valor: number;
  tipo: "receber" | "pagar" | "transferencia";
};

function SaldoInicialInput({ contaNome }: { contaNome: string }) {
  const finance = useFinance();
  const salvo = finance.saldosIniciais[contaNome] ?? 0;
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState(String(salvo).replace(".", ","));

  if (!editando) {
    return (
      <button
        onClick={() => {
          setRascunho(String(salvo).replace(".", ","));
          setEditando(true);
        }}
        className="flex items-center gap-1 text-xs font-medium text-faint hover:text-client-accent transition-colors"
        title="Editar saldo inicial"
      >
        <Pencil size={11} />
        Saldo inicial: {formatCurrencyPrecise(salvo)}
      </button>
    );
  }

  function salvar() {
    const valor = Number(rascunho.replace(",", "."));
    finance.setSaldoInicial(contaNome, Number.isFinite(valor) ? valor : 0);
    setEditando(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-faint">Saldo inicial:</span>
      <input
        autoFocus
        inputMode="decimal"
        value={rascunho}
        onChange={(e) => setRascunho(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && salvar()}
        placeholder="0,00"
        className="w-24 rounded-md border border-border-subtle bg-white px-2 py-1 text-xs text-brand-900"
      />
      <button onClick={salvar} className="text-xs font-semibold text-client-accent hover:underline">
        Salvar
      </button>
      <button onClick={() => setEditando(false)} className="text-xs text-faint hover:text-danger-500">
        Cancelar
      </button>
    </div>
  );
}

function ContaCard({ contaNome, icon: Icon }: { contaNome: string; icon: typeof Landmark }) {
  const finance = useFinance();

  const movimentos = useMemo<Movimento[]>(() => {
    const doReceber: Movimento[] = finance.receivables
      .filter((r) => r.conta === contaNome && r.status === "recebido")
      .map((r) => ({ data: r.recebimento ?? r.vencimento, descricao: r.descricao, valor: r.valor, tipo: "receber" }));

    const doPagar: Movimento[] = finance.payables
      .filter((p) => p.conta === contaNome && p.status === "pago")
      .map((p) => ({ data: p.pagamento ?? p.vencimento, descricao: p.descricao || p.favorecido, valor: -p.valor, tipo: "pagar" }));

    const dasTransferencias: Movimento[] = finance.transferencias
      .filter((t) => t.contaOrigem === contaNome || t.contaDestino === contaNome)
      .map((t) => ({
        data: t.data,
        descricao:
          t.contaOrigem === contaNome
            ? `Transferência para ${t.contaDestino} — ${t.descricao}`
            : `Transferência de ${t.contaOrigem} — ${t.descricao}`,
        valor: t.contaOrigem === contaNome ? -t.valor : t.valor,
        tipo: "transferencia",
      }));

    return [...doReceber, ...doPagar, ...dasTransferencias].sort((a, b) => a.data.localeCompare(b.data));
  }, [finance.receivables, finance.payables, finance.transferencias, contaNome]);

  const saldoInicial = finance.saldosIniciais[contaNome] ?? 0;

  const movimentosComSaldo = useMemo(() => {
    return movimentos.reduce<(Movimento & { saldo: number })[]>((acc, m) => {
      const saldoAnterior = acc.length > 0 ? acc[acc.length - 1].saldo : saldoInicial;
      return [...acc, { ...m, saldo: saldoAnterior + m.valor }];
    }, []);
  }, [movimentos, saldoInicial]);

  const saldoAtual = saldoInicial + movimentos.reduce((acc, m) => acc + m.valor, 0);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-client-accent/10 text-client-accent">
            <Icon size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-brand-900">{contaNome}</h2>
            <SaldoInicialInput contaNome={contaNome} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-faint">Saldo atual</p>
          <p className={`text-lg font-semibold tabular-nums ${saldoAtual < 0 ? "text-danger-500" : "text-brand-900"}`}>
            {formatCurrencyPrecise(saldoAtual)}
          </p>
        </div>
      </div>

      {movimentosComSaldo.length === 0 ? (
        <p className="p-5 text-xs text-faint">Nenhuma movimentação registrada nessa conta ainda.</p>
      ) : (
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-faint">
                <th className="pb-2 font-medium">Data</th>
                <th className="pb-2 font-medium">Descrição</th>
                <th className="pb-2 pl-4 font-medium"></th>
                <th className="pb-2 pl-4 text-right font-medium">Valor</th>
                <th className="pb-2 pl-4 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {[...movimentosComSaldo].reverse().map((m, i) => (
                <tr key={i} className="border-b border-border-subtle last:border-0">
                  <td className="py-2.5 whitespace-nowrap text-muted">{formatDateBR(m.data)}</td>
                  <td className="py-2.5 text-brand-900">{m.descricao}</td>
                  <td className="py-2.5 pl-4">
                    {m.tipo === "transferencia" ? (
                      <ArrowLeftRight size={13} className="text-faint" />
                    ) : m.valor >= 0 ? (
                      <ArrowDownLeft size={13} className="text-accent-500" />
                    ) : (
                      <ArrowUpRight size={13} className="text-danger-500" />
                    )}
                  </td>
                  <td className={`py-2.5 pl-4 text-right tabular-nums font-medium whitespace-nowrap ${m.valor < 0 ? "text-danger-500" : "text-accent-500"}`}>
                    {formatCurrencyPrecise(m.valor)}
                  </td>
                  <td className="py-2.5 pl-4 text-right tabular-nums whitespace-nowrap text-muted">{formatCurrencyPrecise(m.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ContasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-brand-900">Contas</h2>
        <p className="mt-0.5 text-xs text-faint">
          Saldo e movimentações de cada conta, a partir dos lançamentos pagos/recebidos e das transferências entre contas
          confirmadas na Conciliação Bancária. O saldo inicial é editável — ajuste pra bater com o saldo real da conta.
        </p>
      </div>
      {CONTAS.map((c) => (
        <ContaCard key={c.nome} contaNome={c.nome} icon={c.icon} />
      ))}
    </div>
  );
}
