"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { getFinanceData } from "@/lib/data/financeRegistry";
import { computeContasPagarKpis, computeContasReceberKpis, computeFinanceSummary, computeFluxoCaixa } from "@/lib/derive";
import { CategoryGroup, Client, ClientFinanceData, Payable, Receivable, TransferenciaConta } from "@/lib/types";

const PALETTE = ["#22d3a0", "#5b93fd", "#f2665c", "#a78bfa", "#f2a93c", "#f472b6", "#38bdf8", "#94a3b8"];

type FinanceState = {
  payables: Payable[];
  receivables: Receivable[];
  categoriasPagar: CategoryGroup[];
  categoriasReceber: CategoryGroup[];
  transferencias: TransferenciaConta[];
  saldosIniciais: Record<string, number>;
};

type Tipo = "pagar" | "receber";

type FinanceContextValue = FinanceState &
  Pick<
    ClientFinanceData,
    | "fluxoCaixaPeriodo"
    | "fluxoCaixaKpis"
    | "faturamentoXRecebimentos"
    | "maioresRecebimentos"
    | "maioresPagamentos"
    | "indicesFinanceiros"
    | "destaquesPeriodo"
    | "resumoExecutivo"
    | "pontoDeAtencao"
  > & {
  client: Client;
  fluxoDiario: { dia: string; saldo: number }[];
  addPayable: (entries: Payable[]) => void;
  addReceivable: (entries: Receivable[]) => void;
  markPago: (tipo: Tipo, id: string, dataPagamento: string) => void;
  addCategoria: (tipo: Tipo, classificacao: string, categoriaNome: string) => void;
  addClassificacao: (tipo: Tipo, nome: string) => void;
  updatePayables: (ids: string[], patch: Partial<Payable>) => void;
  updateReceivables: (ids: string[], patch: Partial<Receivable>) => void;
  deletePayables: (ids: string[]) => void;
  deleteReceivables: (ids: string[]) => void;
  duplicatePayables: (ids: string[]) => void;
  duplicateReceivables: (ids: string[]) => void;
  addTransferencia: (t: TransferenciaConta) => void;
  deleteTransferencias: (ids: string[]) => void;
  setSaldoInicial: (conta: string, valor: number) => void;
  summary: ReturnType<typeof computeFinanceSummary>;
  contasPagarKpis: ReturnType<typeof computeContasPagarKpis>;
  contasReceberKpis: ReturnType<typeof computeContasReceberKpis>;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// Renderize com key={client.slug} no elemento pai para garantir que o estado
// seja reiniciado ao trocar de cliente (cada painel é isolado do outro).
export function FinanceProvider({ client, children }: { client: Client; children: ReactNode }) {
  const seed = getFinanceData(client.slug);
  if (!seed) throw new Error(`Nenhum dado financeiro cadastrado para o cliente "${client.slug}"`);

  const storageKey = `cf-${client.slug}-finance-v1`;

  const [state, setState] = useState<FinanceState>({
    payables: seed.seedPayables,
    receivables: seed.seedReceivables,
    categoriasPagar: seed.seedCategoriasPagar,
    categoriasReceber: seed.seedCategoriasReceber,
    transferencias: [],
    saldosIniciais: {},
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratação do localStorage precisa acontecer após o primeiro render (SSR não tem window),
    // então o estado inicial (seed) é intencionalmente substituído aqui uma única vez.
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        // "transferencias"/"saldosIniciais" são campos novos — dados salvos antes dessa versão
        // não têm essas chaves, então caem pra [] / {} em vez de deixar o estado com undefined.
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((s) => ({ ...s, ...parsed, transferencias: parsed.transferencias ?? [], saldosIniciais: parsed.saldosIniciais ?? {} }));
      }
    } catch {
      // ignora estado salvo corrompido
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, hydrated, storageKey]);

  const addPayable = (entries: Payable[]) =>
    setState((s) => ({ ...s, payables: [...entries, ...s.payables] }));

  const addReceivable = (entries: Receivable[]) =>
    setState((s) => ({ ...s, receivables: [...entries, ...s.receivables] }));

  const markPago = (tipo: Tipo, id: string, dataPagamento: string) =>
    setState((s) =>
      tipo === "pagar"
        ? { ...s, payables: s.payables.map((p) => (p.id === id ? { ...p, status: "pago", pagamento: dataPagamento } : p)) }
        : { ...s, receivables: s.receivables.map((r) => (r.id === id ? { ...r, status: "recebido", recebimento: dataPagamento } : r)) }
    );

  const addCategoria = (tipo: Tipo, classificacao: string, categoriaNome: string) =>
    setState((s) => {
      const key = tipo === "pagar" ? "categoriasPagar" : "categoriasReceber";
      const groups = s[key].map((g) =>
        g.classificacao === classificacao && !g.categorias.some((c) => c.nome.toLowerCase() === categoriaNome.toLowerCase())
          ? { ...g, categorias: [...g.categorias, { nome: categoriaNome, padrao: false }] }
          : g
      );
      return { ...s, [key]: groups };
    });

  const addClassificacao = (tipo: Tipo, nome: string) =>
    setState((s) => {
      const key = tipo === "pagar" ? "categoriasPagar" : "categoriasReceber";
      if (s[key].some((g) => g.classificacao.toLowerCase() === nome.toLowerCase())) return s;
      const color = PALETTE[s[key].length % PALETTE.length];
      const novo: CategoryGroup = { classificacao: nome, color, padrao: false, categorias: [] };
      return { ...s, [key]: [...s[key], novo] };
    });

  const updatePayables = (ids: string[], patch: Partial<Payable>) =>
    setState((s) => ({
      ...s,
      payables: s.payables.map((p) => (ids.includes(p.id) ? { ...p, ...patch } : p)),
    }));

  const updateReceivables = (ids: string[], patch: Partial<Receivable>) =>
    setState((s) => ({
      ...s,
      receivables: s.receivables.map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)),
    }));

  const deletePayables = (ids: string[]) =>
    setState((s) => ({ ...s, payables: s.payables.filter((p) => !ids.includes(p.id)) }));

  const deleteReceivables = (ids: string[]) =>
    setState((s) => ({ ...s, receivables: s.receivables.filter((r) => !ids.includes(r.id)) }));

  const duplicatePayables = (ids: string[]) =>
    setState((s) => {
      const copies = s.payables.filter((p) => ids.includes(p.id)).map((p) => ({ ...p, id: genId("p"), status: "pendente" as const, pagamento: undefined }));
      return { ...s, payables: [...copies, ...s.payables] };
    });

  const duplicateReceivables = (ids: string[]) =>
    setState((s) => {
      const copies = s.receivables.filter((r) => ids.includes(r.id)).map((r) => ({ ...r, id: genId("r"), status: "pendente" as const, recebimento: undefined }));
      return { ...s, receivables: [...copies, ...s.receivables] };
    });

  const addTransferencia = (t: TransferenciaConta) =>
    setState((s) => ({ ...s, transferencias: [t, ...s.transferencias] }));

  const deleteTransferencias = (ids: string[]) =>
    setState((s) => ({ ...s, transferencias: s.transferencias.filter((t) => !ids.includes(t.id)) }));

  const setSaldoInicial = (conta: string, valor: number) =>
    setState((s) => ({ ...s, saldosIniciais: { ...s.saldosIniciais, [conta]: valor } }));

  const summary = useMemo(
    () => computeFinanceSummary(state.payables, state.receivables, state.categoriasPagar, seed.deducoesManuais, seed.cmvManual),
    [state.payables, state.receivables, state.categoriasPagar, seed.deducoesManuais, seed.cmvManual]
  );
  const contasPagarKpis = useMemo(() => computeContasPagarKpis(state.payables), [state.payables]);
  const contasReceberKpis = useMemo(() => computeContasReceberKpis(state.receivables), [state.receivables]);
  // Fluxo de Caixa é por regime de caixa (recebimento/pagamento efetivo) — recalculado a partir
  // dos lançamentos reais (inclusive os que a conciliação bancária cria), não do seed estático.
  const fluxoCaixa = useMemo(() => computeFluxoCaixa(state.payables, state.receivables), [state.payables, state.receivables]);

  const fluxoDiario = useMemo(() => {
    const { saldoInicial, saldoFinal } = fluxoCaixa.fluxoCaixaKpis;
    return Array.from({ length: 31 }, (_, i) => ({
      dia: String(i + 1).padStart(2, "0"),
      saldo: i < 3 ? saldoInicial : saldoFinal,
    }));
  }, [fluxoCaixa.fluxoCaixaKpis]);

  const value: FinanceContextValue = {
    ...state,
    client,
    fluxoCaixaPeriodo: fluxoCaixa.fluxoCaixaPeriodo,
    fluxoCaixaKpis: fluxoCaixa.fluxoCaixaKpis,
    fluxoDiario,
    faturamentoXRecebimentos: fluxoCaixa.faturamentoXRecebimentos,
    maioresRecebimentos: fluxoCaixa.maioresRecebimentos,
    maioresPagamentos: fluxoCaixa.maioresPagamentos,
    indicesFinanceiros: fluxoCaixa.indicesFinanceiros,
    destaquesPeriodo: seed.destaquesPeriodo,
    resumoExecutivo: seed.resumoExecutivo,
    pontoDeAtencao: seed.pontoDeAtencao,
    addPayable,
    addReceivable,
    markPago,
    addCategoria,
    addClassificacao,
    updatePayables,
    updateReceivables,
    deletePayables,
    deleteReceivables,
    duplicatePayables,
    duplicateReceivables,
    addTransferencia,
    deleteTransferencias,
    setSaldoInicial,
    summary,
    contasPagarKpis,
    contasReceberKpis,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance precisa estar dentro de <FinanceProvider>");
  return ctx;
}
