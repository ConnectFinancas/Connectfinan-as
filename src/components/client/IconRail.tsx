import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientMonogram } from "@/components/ClientMonogram";
import { Client } from "@/lib/types";

export function IconRail({ client }: { client: Client }) {
  return (
    <aside className="hidden sm:flex fixed inset-y-0 left-0 z-20 w-14 flex-col items-center gap-3 border-r border-border-subtle bg-surface py-4">
      <svg width="26" height="26" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      <div className="h-px w-6 bg-border-subtle" />

      <Link href={`/clientes/${client.slug}`} title={client.name}>
        <ClientMonogram monogram={client.monogram} accent={client.accent} accentDark={client.accentDark} size={34} />
      </Link>

      <div className="flex-1" />

      <Link
        href="/"
        title="Voltar para Clientes"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-faint hover:bg-surface-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={17} />
      </Link>
    </aside>
  );
}
