import { notFound } from "next/navigation";
import { IconRail } from "@/components/client/IconRail";
import { ClientHeader } from "@/components/client/ClientHeader";
import { ClientFooter } from "@/components/client/ClientFooter";
import { clients, getClient } from "@/lib/data/clients";
import { getFinanceData } from "@/lib/data/financeRegistry";
import { FinanceProvider } from "@/lib/store/FinanceContext";
import { Client } from "@/lib/types";

// Pré-gera cada cliente conhecido como página estática em tempo de build,
// para que a troca entre abas seja instantânea (sem SSR a cada navegação).
export function generateStaticParams() {
  return clients.filter((c) => c.status === "ativo" && getFinanceData(c.slug)).map((c) => ({ client: c.slug }));
}

function themeClass(theme: Client["theme"]) {
  if (theme === "light") return "";
  if (theme === "black-gold") return "cf-black-gold";
  return "cf-dark";
}

export default async function ClientLayout({ children, params }: LayoutProps<"/clientes/[client]">) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client || !getFinanceData(slug)) notFound();

  return (
    <div
      className={`min-h-screen bg-background ${themeClass(client.theme)}`}
      style={
        {
          "--client-accent": client.accent,
          "--client-accent-dark": client.accentDark,
        } as React.CSSProperties
      }
    >
      <FinanceProvider key={client.slug} client={client}>
        <IconRail client={client} />
        <div className="sm:pl-14 flex min-h-screen flex-col">
          <ClientHeader client={client} />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
          <ClientFooter clientName={client.name} />
        </div>
      </FinanceProvider>
    </div>
  );
}
