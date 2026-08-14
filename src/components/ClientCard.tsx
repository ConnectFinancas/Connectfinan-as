import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { ClientMonogram } from "@/components/ClientMonogram";
import { Client } from "@/lib/types";

export function ClientCard({ client }: { client: Client }) {
  const active = client.status === "ativo";
  const isBlackGold = client.theme === "black-gold";

  const content = (
    <div
      className={`card group relative flex flex-col gap-4 p-5 transition-all ${
        active ? "hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 cursor-pointer" : "opacity-70"
      } ${isBlackGold ? "cf-black-gold" : ""}`}
    >
      <div className="flex items-center justify-between">
        <ClientMonogram
          monogram={client.monogram}
          accent={client.accent}
          accentDark={client.accentDark}
          muted={!active}
          size={52}
        />
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-medium text-accent-600">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Painel ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-muted">
            <Clock size={11} />
            Em breve
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-brand-900">{client.name}</h3>
        <p className="text-sm text-muted">{client.segment}</p>
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-faint">
        <span>{client.cnpj}</span>
        {active && (
          <span className="inline-flex items-center gap-1 font-medium text-brand-600 group-hover:gap-1.5 transition-all">
            Acessar painel <ArrowRight size={13} />
          </span>
        )}
      </div>
    </div>
  );

  if (!active) return <div>{content}</div>;

  return (
    <Link href={`/clientes/${client.slug}`} className="block">
      {content}
    </Link>
  );
}
