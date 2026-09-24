"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Client } from "@/lib/types";
import { visibleNavItems } from "@/lib/nav";

// Menu do cliente empilhado verticalmente à esquerda do conteúdo, em vez das abas horizontais
// padrão — usado só por clientes com navLayout: "sidebar" (ex.: LA Modas). Some em telas
// pequenas: nesse caso o ClientHeader volta a mostrar as abas horizontais como alternativa.
export function ClientSidebarNav({ client }: { client: Client }) {
  const pathname = usePathname();
  const base = `/clientes/${client.slug}`;
  const items = visibleNavItems(client, base);

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col gap-1 border-r border-border-subtle bg-surface px-3 py-6">
      {items.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive ? "bg-client-accent/10 font-medium text-client-accent" : "text-muted hover:bg-surface-muted hover:text-brand-900"
            }`}
          >
            <Icon size={16} className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
