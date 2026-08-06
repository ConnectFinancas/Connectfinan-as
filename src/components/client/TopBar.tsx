"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Client } from "@/lib/types";

function pageLabel(pathname: string, base: string) {
  const map: Record<string, string> = {
    [base]: "Visão Geral",
    [`${base}/dre`]: "DRE",
    [`${base}/fluxo-de-caixa`]: "Fluxo de Caixa",
    [`${base}/contas-a-pagar`]: "Contas a Pagar",
    [`${base}/contas-a-receber`]: "Contas a Receber",
    [`${base}/conciliacao`]: "Conciliação Bancária",
    [`${base}/obrigacoes-fiscais`]: "Obrigações Fiscais",
    [`${base}/relatorios`]: "Relatórios",
  };
  return map[pathname] ?? "Visão Geral";
}

export function TopBar({ client }: { client: Client }) {
  const pathname = usePathname();
  const base = `/clientes/${client.slug}`;
  const label = pageLabel(pathname, base);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border-subtle bg-surface/90 backdrop-blur px-5 lg:px-8 py-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Clientes / {client.name}
        </p>
        <h1 className="text-lg font-semibold text-brand-900">{label}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-white text-slate-500 hover:text-brand-700 transition-colors">
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger-500" />
        </button>
        <div className="flex items-center gap-2.5 rounded-full border border-border-subtle bg-white py-1 pl-1 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-[11px] font-semibold text-white">
            EL
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-medium text-brand-900">Ewerton Lucas</p>
            <p className="text-[10px] text-slate-400">BPO Financeiro</p>
          </div>
        </div>
      </div>
    </header>
  );
}
