"use client";

import { useEffect, useState } from "react";

export type Pendencia = {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: "pix" | "dinheiro" | "pagamento" | "cartao";
};

function storageKey(slug: string) {
  return `cf-${slug}-conciliacao-pendencias-v1`;
}

export function usePendencias(slug: string) {
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setPendencias(JSON.parse(raw));
    } catch {
      // ignora estado salvo corrompido
    }
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(slug), JSON.stringify(pendencias));
  }, [pendencias, hydrated, slug]);

  // Substitui TODAS as pendências de `data` pelas `novas` (mesmo que `novas` esteja vazio) —
  // evita pendências fantasma quando um tipo que antes tinha pendência é totalmente reconciliado.
  function upsertPendencias(data: string, novas: Pendencia[]) {
    setPendencias((atual) => [...atual.filter((p) => p.data !== data), ...novas]);
  }

  function resolver(id: string) {
    setPendencias((atual) => atual.filter((p) => p.id !== id));
  }

  function limparTudo() {
    setPendencias([]);
  }

  return { pendencias, upsertPendencias, resolver, limparTudo };
}
