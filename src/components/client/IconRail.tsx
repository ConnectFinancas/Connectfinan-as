"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClientMonogram } from "@/components/ClientMonogram";
import { Client } from "@/lib/types";
import { visibleNavItems } from "@/lib/nav";

// Rail fixo da esquerda. No modo padrão é só ícones (logo, monograma do cliente, voltar). No
// modo navLayout: "sidebar" (ex.: LA Modas) fica mais largo e ganha o menu do cliente empilhado
// logo abaixo do monograma, tudo numa coluna só — em vez de uma segunda coluna branca separada.
export function IconRail({ client }: { client: Client }) {
  const pathname = usePathname();
  const sidebar = client.navLayout === "sidebar";
  const base = `/clientes/${client.slug}`;
  const items = sidebar ? visibleNavItems(client, base) : [];

  return (
    <aside
      className={`hidden sm:flex fixed inset-y-0 left-0 z-20 flex-col gap-3 border-r border-border-subtle bg-surface py-4 ${
        sidebar ? "w-56 items-stretch px-3" : "w-14 items-center"
      }`}
    >
      <div className={`flex items-center gap-2.5 ${sidebar ? "px-1" : ""}`}>
        <svg width="26" height="26" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          <rect width="30" height="30" rx="8" fill="#0a1330" />
          <path
            d="M9 20.5V9.5L15 15L21 9.5V20.5"
            stroke="url(#rail-logo-gradient)"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="rail-logo-gradient" x1="9" y1="9.5" x2="21" y2="20.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3a0" />
              <stop offset="1" stopColor="#5b93fd" />
            </linearGradient>
          </defs>
        </svg>
        {sidebar && (
          <span className="text-xs font-semibold leading-none text-brand-900">
            Ricavi <span className="font-normal text-faint">Finanças</span>
          </span>
        )}
      </div>

      <div className={sidebar ? "h-px bg-border-subtle" : "h-px w-6 bg-border-subtle"} />

      <Link
        href={client.tipo === "tarefas" ? `${base}/tarefas` : base}
        title={client.name}
        className={`flex items-center gap-2.5 ${sidebar ? "px-1" : ""}`}
      >
        <ClientMonogram monogram={client.monogram} accent={client.accent} accentDark={client.accentDark} size={34} />
        {sidebar && <span className="text-sm font-semibold text-brand-900">{client.name}</span>}
      </Link>

      {sidebar && (
        <nav className="mt-1 flex flex-col gap-1">
          {items.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition-colors ${
                  isActive ? "bg-client-accent/10 font-medium text-client-accent" : "text-muted hover:bg-surface-muted hover:text-brand-900"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="flex-1" />

      <Link
        href="/"
        title="Voltar para Clientes"
        className={`flex items-center gap-2.5 rounded-lg text-faint hover:bg-surface-muted hover:text-foreground transition-colors ${
          sidebar ? "px-2.5 py-2 text-sm" : "h-9 w-9 items-center justify-center"
        }`}
      >
        <ArrowLeft size={17} className="shrink-0" />
        {sidebar && "Voltar para Clientes"}
      </Link>
    </aside>
  );
}
