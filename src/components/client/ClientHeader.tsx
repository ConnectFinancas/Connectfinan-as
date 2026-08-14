"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2 } from "lucide-react";
import { Client } from "@/lib/types";
import { clientNavItems } from "@/lib/nav";

export function ClientHeader({ client }: { client: Client }) {
  const pathname = usePathname();
  const base = `/clientes/${client.slug}`;
  const items = clientNavItems(base);

  const active = items.find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href))) ?? items[0];

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border-subtle">
      <div className="flex items-start justify-between gap-4 px-5 lg:px-8 pt-5 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">{active.pageTitle}</h1>
          <p className="mt-0.5 text-sm text-muted">{active.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-muted">
            Financeiro · {active.shortLabel}
          </span>
          <Link
            href="/"
            title="Trocar de cliente"
            className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
          >
            <Building2 size={14} />
            <span className="hidden sm:inline">Trocar de cliente</span>
          </Link>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface text-muted hover:text-foreground transition-colors">
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger-500" />
          </button>
          <div className="flex items-center gap-2.5 rounded-full border border-border-subtle bg-surface py-1 pl-1 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-[11px] font-semibold text-white">
              EL
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-medium text-brand-900">Ewerton Lucas</p>
              <p className="text-[10px] text-faint">BPO Financeiro</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex gap-5 overflow-x-auto px-5 lg:px-8 scrollbar-thin">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm transition-colors ${
                isActive
                  ? "border-client-accent font-medium text-brand-900"
                  : "border-transparent text-muted hover:text-brand-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
