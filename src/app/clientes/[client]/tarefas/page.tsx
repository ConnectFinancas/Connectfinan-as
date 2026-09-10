"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Check, Plus, Trash2 } from "lucide-react";
import { useTarefas, Prioridade, Tarefa } from "@/lib/store/tarefasStore";
import { formatDateBR } from "@/lib/today";

const PRIORIDADES: { valor: Prioridade; rotulo: string; cor: string }[] = [
  { valor: "p1", rotulo: "P1 · Urgente", cor: "bg-danger-100 text-danger-500" },
  { valor: "p2", rotulo: "P2 · Alta", cor: "bg-warn-100 text-warn-500" },
  { valor: "p3", rotulo: "P3 · Média", cor: "bg-info-100 text-info-500" },
  { valor: "p4", rotulo: "P4 · Baixa", cor: "bg-surface-muted text-muted" },
];

function prioridadeInfo(p: Prioridade) {
  return PRIORIDADES.find((x) => x.valor === p) ?? PRIORIDADES[3];
}

function NovaTarefaForm({ onAdicionar }: { onAdicionar: (titulo: string, data?: string, prioridade?: Prioridade) => void }) {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [prioridade, setPrioridade] = useState<Prioridade>("p4");

  function salvar() {
    if (!titulo.trim()) return;
    onAdicionar(titulo.trim(), data || undefined, prioridade);
    setTitulo("");
    setData("");
    setPrioridade("p4");
    setAberto(false);
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-subtle px-3 py-2 text-xs font-medium text-faint hover:border-client-accent hover:text-client-accent transition-colors"
      >
        <Plus size={13} />
        Adicionar tarefa
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-muted p-2.5">
      <input
        autoFocus
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && salvar()}
        placeholder="Nome da tarefa"
        className="w-full rounded-md border border-border-subtle bg-white px-2 py-1.5 text-xs text-brand-900 placeholder:text-faint"
      />
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="rounded-md border border-border-subtle bg-white px-2 py-1.5 text-xs text-brand-900"
        />
        <select
          value={prioridade}
          onChange={(e) => setPrioridade(e.target.value as Prioridade)}
          className="rounded-md border border-border-subtle bg-white px-2 py-1.5 text-xs text-brand-900"
        >
          {PRIORIDADES.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.rotulo}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={salvar} className="rounded-md bg-client-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors">
          Adicionar
        </button>
        <button onClick={() => setAberto(false)} className="text-xs font-medium text-faint hover:text-danger-500">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function CartaoTarefa({
  tarefa,
  onToggle,
  onRemover,
  onDragStart,
}: {
  tarefa: Tarefa;
  onToggle: () => void;
  onRemover: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const info = prioridadeInfo(tarefa.prioridade);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group flex cursor-grab flex-col gap-2 rounded-lg border border-border-subtle bg-surface p-3 active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <button
          onClick={onToggle}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
            tarefa.concluida ? "border-accent-500 bg-accent-500 text-white" : "border-border-subtle hover:border-client-accent"
          }`}
        >
          {tarefa.concluida && <Check size={10} />}
        </button>
        <p className={`flex-1 text-sm ${tarefa.concluida ? "text-faint line-through" : "text-brand-900"}`}>{tarefa.titulo}</p>
        <button onClick={onRemover} className="shrink-0 text-faint opacity-0 group-hover:opacity-100 hover:text-danger-500 transition-opacity">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pl-6">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${info.cor}`}>{info.rotulo}</span>
        {tarefa.dataVencimento && (
          <span className="flex items-center gap-1 text-[10px] text-faint">
            <Calendar size={10} />
            {formatDateBR(tarefa.dataVencimento)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TarefasPage() {
  const params = useParams<{ client: string }>();
  const { secoes, tarefas, adicionarSecao, adicionarTarefa, removerTarefa, alternarConcluida, moverTarefa } = useTarefas(params.client);
  const [novaSecaoAberta, setNovaSecaoAberta] = useState(false);
  const [nomeNovaSecao, setNomeNovaSecao] = useState("");
  const [secaoArrastada, setSecaoArrastada] = useState<string | null>(null);

  function salvarNovaSecao() {
    if (!nomeNovaSecao.trim()) return;
    adicionarSecao(nomeNovaSecao.trim());
    setNomeNovaSecao("");
    setNovaSecaoAberta(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <h2 className="text-sm font-semibold text-brand-900">Demandas</h2>
        <p className="mt-0.5 text-xs text-faint">
          Organize as tarefas por seção — arraste um card pra mover entre colunas, clique na bolinha pra concluir.
        </p>
      </div>

      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {secoes.map((secao) => {
          const tarefasDaSecao = tarefas.filter((t) => t.secaoId === secao.id);
          return (
            <div
              key={secao.id}
              onDragOver={(e) => {
                e.preventDefault();
                setSecaoArrastada(secao.id);
              }}
              onDragLeave={() => setSecaoArrastada((s) => (s === secao.id ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setSecaoArrastada(null);
                const tarefaId = e.dataTransfer.getData("text/plain");
                if (tarefaId) moverTarefa(tarefaId, secao.id);
              }}
              className={`flex w-72 shrink-0 flex-col gap-3 rounded-xl border p-3 transition-colors ${
                secaoArrastada === secao.id ? "border-client-accent bg-client-accent/5" : "border-border-subtle bg-surface-muted/40"
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{secao.nome}</h3>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-faint">{tarefasDaSecao.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {tarefasDaSecao.map((tarefa) => (
                  <CartaoTarefa
                    key={tarefa.id}
                    tarefa={tarefa}
                    onToggle={() => alternarConcluida(tarefa.id)}
                    onRemover={() => removerTarefa(tarefa.id)}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", tarefa.id)}
                  />
                ))}
              </div>

              <NovaTarefaForm onAdicionar={(titulo, data, prioridade) => adicionarTarefa(secao.id, titulo, data, prioridade)} />
            </div>
          );
        })}

        <div className="w-72 shrink-0">
          {novaSecaoAberta ? (
            <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-muted/40 p-3">
              <input
                autoFocus
                value={nomeNovaSecao}
                onChange={(e) => setNomeNovaSecao(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && salvarNovaSecao()}
                placeholder="Nome da seção"
                className="w-full rounded-md border border-border-subtle bg-white px-2 py-1.5 text-xs text-brand-900 placeholder:text-faint"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={salvarNovaSecao}
                  className="rounded-md bg-client-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
                >
                  Criar seção
                </button>
                <button onClick={() => setNovaSecaoAberta(false)} className="text-xs font-medium text-faint hover:text-danger-500">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNovaSecaoAberta(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-subtle p-3 text-xs font-medium text-faint hover:border-client-accent hover:text-client-accent transition-colors"
            >
              <Plus size={13} />
              Nova seção
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
