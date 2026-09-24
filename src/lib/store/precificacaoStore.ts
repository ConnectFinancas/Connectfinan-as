"use client";

import { useEffect, useState } from "react";
import { Plataforma } from "@/lib/precificacaoTaxas";

export type CustoFixo = {
  id: string;
  nome: string;
  valor: number;
};

export type ProdutoPrecificado = {
  id: string;
  nome: string;
  plataforma: Plataforma;
  custoProduto: number;
  custoVariavel: number;
  preco: number;
  desconto: number;
  comissaoPct: number;
  taxaFixa: number;
  impostoPct: number;
  afiliadosPct: number;
  margemPct: number;
  lucro: number;
  criadoEm: string;
};

type PrecificacaoState = {
  custosFixos: CustoFixo[];
  produtos: ProdutoPrecificado[];
};

const ESTADO_VAZIO: PrecificacaoState = { custosFixos: [], produtos: [] };

function storageKey(slug: string) {
  return `cf-${slug}-precificacao-v1`;
}

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function usePrecificacao(slug: string) {
  const [state, setState] = useState<PrecificacaoState>(ESTADO_VAZIO);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug));
      if (raw) {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ custosFixos: parsed.custosFixos ?? [], produtos: parsed.produtos ?? [] });
      }
    } catch {
      // ignora estado salvo corrompido
    }
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(slug), JSON.stringify(state));
  }, [state, hydrated, slug]);

  function adicionarCustoFixo(nome: string, valor: number) {
    setState((s) => ({ ...s, custosFixos: [...s.custosFixos, { id: genId("cf"), nome, valor }] }));
  }

  function removerCustoFixo(id: string) {
    setState((s) => ({ ...s, custosFixos: s.custosFixos.filter((c) => c.id !== id) }));
  }

  function salvarProduto(produto: Omit<ProdutoPrecificado, "id" | "criadoEm">) {
    setState((s) => ({
      ...s,
      produtos: [{ ...produto, id: genId("prod"), criadoEm: new Date().toISOString() }, ...s.produtos],
    }));
  }

  function removerProduto(id: string) {
    setState((s) => ({ ...s, produtos: s.produtos.filter((p) => p.id !== id) }));
  }

  return {
    custosFixos: state.custosFixos,
    produtos: state.produtos,
    adicionarCustoFixo,
    removerCustoFixo,
    salvarProduto,
    removerProduto,
  };
}
