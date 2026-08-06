"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useFinance } from "@/lib/store/FinanceContext";
import { CategoryGroup } from "@/lib/types";

function GroupCard({ group, tipo }: { group: CategoryGroup; tipo: "pagar" | "receber" }) {
  const finance = useFinance();
  const [novaCategoria, setNovaCategoria] = useState("");

  function adicionar() {
    const nome = novaCategoria.trim();
    if (!nome) return;
    finance.addCategoria(tipo, group.classificacao, nome);
    setNovaCategoria("");
  }

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: group.color }} />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-900">{group.classificacao}</h3>
        </div>
        {group.padrao ? (
          <span className="text-[10px] font-medium text-faint">padrão</span>
        ) : (
          <button className="flex items-center gap-1 text-[11px] font-medium text-danger-500 hover:text-danger-500/80">
            <X size={11} />
            remover classificação
          </button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {group.categorias.length === 0 && <span className="text-xs text-faint">Nenhuma categoria ainda.</span>}
        {group.categorias.map((c) => (
          <span
            key={c.nome}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-brand-900"
          >
            {c.nome}
            {c.padrao ? (
              <span className="text-[9px] font-semibold text-faint">PADRÃO</span>
            ) : (
              <X size={11} className="text-danger-500 cursor-pointer" />
            )}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder={`Nova categoria em ${group.classificacao}...`}
          className="flex-1 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
        <button
          onClick={adicionar}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-m4-accent px-3 py-2 text-xs font-semibold text-white hover:bg-m4-accent-dark transition-colors"
        >
          <Plus size={13} />
          Categoria
        </button>
      </div>
    </div>
  );
}

export default function CadastrosPage() {
  const finance = useFinance();
  const [tab, setTab] = useState<"pagar" | "receber">("pagar");
  const [novaClassificacao, setNovaClassificacao] = useState("");
  const groups = tab === "pagar" ? finance.categoriasPagar : finance.categoriasReceber;

  function adicionarClassificacao() {
    const nome = novaClassificacao.trim();
    if (!nome) return;
    finance.addClassificacao(tab, nome);
    setNovaClassificacao("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="inline-flex w-fit rounded-lg border border-border-subtle bg-surface p-1">
        <button
          onClick={() => setTab("pagar")}
          className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
            tab === "pagar" ? "bg-m4-accent text-white" : "text-muted hover:text-brand-900"
          }`}
        >
          Contas a Pagar
        </button>
        <button
          onClick={() => setTab("receber")}
          className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
            tab === "receber" ? "bg-m4-accent text-white" : "text-muted hover:text-brand-900"
          }`}
        >
          Contas a Receber
        </button>
      </div>

      <p className="text-sm text-muted">
        As <span className="font-medium text-brand-900">categorias</span> ficam dentro de cada{" "}
        <span className="font-medium text-brand-900">classificação</span>. Adicione uma categoria no grupo certo, ou
        crie uma classificação nova embaixo.
      </p>

      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <GroupCard key={g.classificacao} group={g} tipo={tab} />
        ))}
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Plus size={15} className="text-accent-500" />
          <h3 className="text-sm font-semibold text-brand-900">Nova classificação</h3>
        </div>
        <p className="mb-3 text-xs text-faint">Cria um novo grupo (uma nova classificação financeira)</p>
        <div className="flex gap-2">
          <input
            value={novaClassificacao}
            onChange={(e) => setNovaClassificacao(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionarClassificacao()}
            placeholder="Nome da nova classificação..."
            className="flex-1 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-xs text-brand-900 placeholder:text-faint"
          />
          <button
            onClick={adicionarClassificacao}
            className="whitespace-nowrap rounded-lg bg-m4-accent px-4 py-2 text-xs font-semibold text-white hover:bg-m4-accent-dark transition-colors"
          >
            Adicionar classificação
          </button>
        </div>
      </div>
    </div>
  );
}
