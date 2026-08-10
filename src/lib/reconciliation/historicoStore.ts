"use client";

import { useEffect, useState } from "react";
import { ResultadoConciliacao } from "./match";

export type ResultadoSalvo = ResultadoConciliacao & { editadoManualmente?: boolean };

function storageKey(slug: string) {
  return `cf-${slug}-conciliacao-historico-v1`;
}

export function useConciliacaoHistorico(slug: string) {
  const [historico, setHistorico] = useState<Record<string, ResultadoSalvo>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setHistorico(JSON.parse(raw));
    } catch {
      // ignora estado salvo corrompido
    }
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(slug), JSON.stringify(historico));
  }, [historico, hydrated, slug]);

  function salvar(resultado: ResultadoConciliacao) {
    setHistorico((atual) => {
      if (atual[resultado.data]?.editadoManualmente) return atual;
      return { ...atual, [resultado.data]: resultado };
    });
  }

  function atualizarItem(data: string, updater: (r: ResultadoSalvo) => ResultadoSalvo) {
    setHistorico((atual) => {
      const atualR = atual[data];
      if (!atualR) return atual;
      return { ...atual, [data]: { ...updater(atualR), editadoManualmente: true } };
    });
  }

  const datas = Object.keys(historico).sort().reverse();

  return { historico, datas, salvar, atualizarItem };
}
