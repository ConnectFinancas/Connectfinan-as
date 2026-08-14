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

// No tema escuro, todos os clientes compartilhavam exatamente o mesmo fundo — só o
// destaque (botões/links) mudava. Aqui o fundo/superfícies do tema escuro ganham um leve
// tingimento na cor de cada cliente, pra cada painel ter uma identidade própria mesmo
// sem precisar cadastrar uma paleta inteira nova por cliente (o tema claro da MJ Prime e
// o preto+dourado da Connect são intencionalmente fixos, então ficam de fora disso).
function backgroundVars(client: Client): React.CSSProperties {
  if (client.theme === "light" || client.theme === "black-gold") return {};
  const a = client.accent;
  return {
    "--background": `color-mix(in srgb, ${a} 11%, #05070d)`,
    "--surface": `color-mix(in srgb, ${a} 8%, #10141c)`,
    "--surface-muted": `color-mix(in srgb, ${a} 10%, #161b26)`,
    "--border-subtle": `color-mix(in srgb, ${a} 16%, #232a38)`,
  } as React.CSSProperties;
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
          ...backgroundVars(client),
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
