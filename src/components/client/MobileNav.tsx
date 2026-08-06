"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Client } from "@/lib/types";
import { clientNavItems } from "@/lib/nav";

export function MobileNav({ client }: { client: Client }) {
  const pathname = usePathname();
  const base = `/clientes/${client.slug}`;
  const items = clientNavItems(base);

  return (
    <nav className="lg:hidden sticky top-0 z-20 flex gap-1.5 overflow-x-auto bg-brand-900 px-3 py-2.5 scrollbar-thin">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              active ? "bg-white text-brand-900" : "text-white/70 bg-white/10"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
