"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ClientMonogram } from "@/components/ClientMonogram";
import { Client } from "@/lib/types";
import { clientNavItems } from "@/lib/nav";

export function Sidebar({ client }: { client: Client }) {
  const pathname = usePathname();
  const base = `/clientes/${client.slug}`;
  const items = clientNavItems(base);

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-brand-900 text-white">
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <Link href="/" className="block rounded-lg -mx-1 px-1 [&_span]:text-white [&_span.font-light]:text-white/60">
          <Logo />
        </Link>
      </div>

      <div className="px-4 py-4 flex items-center gap-3 border-b border-white/10">
        <ClientMonogram monogram={client.monogram} accent={client.accent} accentDark={client.accentDark} size={38} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{client.name}</p>
          <p className="text-[11px] text-white/50 truncate">{client.segment}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-0.5">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
              style={active ? { boxShadow: `inset 2px 0 0 0 ${client.accent}` } : undefined}
            >
              <Icon size={17} strokeWidth={2} className={active ? "" : "opacity-70 group-hover:opacity-100"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para Clientes
        </Link>
      </div>
    </aside>
  );
}
