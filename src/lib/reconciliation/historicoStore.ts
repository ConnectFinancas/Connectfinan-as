"use client";

import { useEffect, useState } from "react";
import { ResultadoConciliacao } from "./match";

export type ResultadoSalvo = ResultadoConciliacao & {
  editadoManualmente?: boolean;
  /** Mapa chave do item (ex.: "pix-0", "cartao", "cartao-taxa", "pagamento-2") -> id do lançamento criado em Contas a Receber/Pagar. */
  migrados?: Record<string, string>;
};

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
      const atualR = atual[resultado.data];
      if (atualR?.editadoManualmente) return atual;
      // Preserva o mapa de itens já migrados p/ Contas a Receber/Pagar ao reprocessar o mesmo dia.
      return { ...atual, [resultado.data]: { ...resultado, migrados: atualR?.migrados } };
    });
  }

  function atualizarItem(data: string, updater: (r: ResultadoSalvo) => ResultadoSalvo) {
    setHistorico((atual) => {
      const atualR = atual[data];
      if (!atualR) return atual;
      return { ...atual, [data]: { ...updater(atualR), editadoManualmente: true } };
    });
  }

  /** Registra que um item já foi lançado em Contas a Receber/Pagar, sem marcar o dia como editado manualmente. */
  function marcarMigrados(data: string, novasChaves: Record<string, string>) {
    setHistorico((atual) => {
      const atualR = atual[data];
      if (!atualR) return atual;
      return { ...atual, [data]: { ...atualR, migrados: { ...atualR.migrados, ...novasChaves } } };
    });
  }

  function desmarcarMigrado(data: string, chave: string) {
    setHistorico((atual) => {
      const atualR = atual[data];
      if (!atualR?.migrados) return atual;
      const migrados = { ...atualR.migrados };
      delete migrados[chave];
      return { ...atual, [data]: { ...atualR, migrados } };
    });
  }

  const datas = Object.keys(historico).sort().reverse();

  return { historico, datas, salvar, atualizarItem, marcarMigrados, desmarcarMigrado };
}
