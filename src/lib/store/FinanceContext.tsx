"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  seedCategoriasPagar,
  seedCategoriasReceber,
  seedPayables,
  seedReceivables,
} from "@/lib/data/m4-logistica";
import { computeContasPagarKpis, computeContasReceberKpis, computeFinanceSummary } from "@/lib/derive";
import { CategoryGroup, Payable, Receivable } from "@/lib/types";

const STORAGE_KEY = "cf-m4-finance-v1";
const PALETTE = ["#22d3a0", "#5b93fd", "#f2665c", "#a78bfa", "#f2a93c", "#f472b6", "#38bdf8", "#94a3b8"];

type FinanceState = {
  payables: Payable[];
  receivables: Receivable[];
  categoriasPagar: CategoryGroup[];
  categoriasReceber: CategoryGroup[];
};

type Tipo = "pagar" | "receber";

type FinanceContextValue = FinanceState & {
  addPayable: (entries: Payable[]) => void;
  addReceivable: (entries: Receivable[]) => void;
  markPago: (tipo: Tipo, id: string, dataPagamento: string) => void;
  addCategoria: (tipo: Tipo, classificacao: string, categoriaNome: string) => void;
  addClassificacao: (tipo: Tipo, nome: string) => void;
  summary: ReturnType<typeof computeFinanceSummary>;
  contasPagarKpis: ReturnType<typeof computeContasPagarKpis>;
  contasReceberKpis: ReturnType<typeof computeContasReceberKpis>;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>({
    payables: seedPayables,
    receivables: seedReceivables,
    categoriasPagar: seedCategoriasPagar,
    categoriasReceber: seedCategoriasReceber,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratação do localStorage precisa acontecer após o primeiro render (SSR não tem window),
    // então o estado inicial (seed) é intencionalmente substituído aqui uma única vez.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignora estado salvo corrompido
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

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

  const summary = useMemo(
    () => computeFinanceSummary(state.payables, state.receivables, state.categoriasPagar),
    [state.payables, state.receivables, state.categoriasPagar]
  );
  const contasPagarKpis = useMemo(() => computeContasPagarKpis(state.payables), [state.payables]);
  const contasReceberKpis = useMemo(() => computeContasReceberKpis(state.receivables), [state.receivables]);

  const value: FinanceContextValue = {
    ...state,
    addPayable,
    addReceivable,
    markPago,
    addCategoria,
    addClassificacao,
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
