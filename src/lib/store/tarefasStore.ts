"use client";

import { useEffect, useState } from "react";

export type Prioridade = "p1" | "p2" | "p3" | "p4";

export type Secao = {
  id: string;
  nome: string;
};

export type Tarefa = {
  id: string;
  secaoId: string;
  titulo: string;
  dataVencimento?: string;
  prioridade: Prioridade;
  concluida: boolean;
};

type TarefasState = {
  secoes: Secao[];
  tarefas: Tarefa[];
};

const SECOES_PADRAO: Secao[] = [
  { id: "a-fazer", nome: "A Fazer" },
  { id: "em-andamento", nome: "Em Andamento" },
  { id: "concluido", nome: "Concluído" },
];

function storageKey(slug: string) {
  return `cf-${slug}-tarefas-v1`;
}

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function useTarefas(slug: string) {
  const [state, setState] = useState<TarefasState>({ secoes: SECOES_PADRAO, tarefas: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug));
      if (raw) {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ secoes: parsed.secoes ?? SECOES_PADRAO, tarefas: parsed.tarefas ?? [] });
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

  function adicionarSecao(nome: string) {
    setState((s) => ({ ...s, secoes: [...s.secoes, { id: genId("sec"), nome }] }));
  }

  function renomearSecao(id: string, nome: string) {
    setState((s) => ({ ...s, secoes: s.secoes.map((sec) => (sec.id === id ? { ...sec, nome } : sec)) }));
  }

  function removerSecao(id: string) {
    setState((s) => ({ secoes: s.secoes.filter((sec) => sec.id !== id), tarefas: s.tarefas.filter((t) => t.secaoId !== id) }));
  }

  function adicionarTarefa(secaoId: string, titulo: string, dataVencimento?: string, prioridade: Prioridade = "p4") {
    setState((s) => ({
      ...s,
      tarefas: [...s.tarefas, { id: genId("tsk"), secaoId, titulo, dataVencimento, prioridade, concluida: false }],
    }));
  }

  function atualizarTarefa(id: string, patch: Partial<Omit<Tarefa, "id">>) {
    setState((s) => ({ ...s, tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }

  function removerTarefa(id: string) {
    setState((s) => ({ ...s, tarefas: s.tarefas.filter((t) => t.id !== id) }));
  }

  function alternarConcluida(id: string) {
    setState((s) => ({ ...s, tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)) }));
  }

  // Move (ou reordena) uma tarefa pra outra seção — usado no arrastar-e-soltar. Sem controle
  // fino de posição dentro da seção por enquanto: a tarefa movida vai pro fim da seção de destino.
  function moverTarefa(tarefaId: string, secaoDestinoId: string) {
    setState((s) => ({ ...s, tarefas: s.tarefas.map((t) => (t.id === tarefaId ? { ...t, secaoId: secaoDestinoId } : t)) }));
  }

  return {
    secoes: state.secoes,
    tarefas: state.tarefas,
    adicionarSecao,
    renomearSecao,
    removerSecao,
    adicionarTarefa,
    atualizarTarefa,
    removerTarefa,
    alternarConcluida,
    moverTarefa,
  };
}
