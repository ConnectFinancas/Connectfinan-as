import { notFound } from "next/navigation";
import { IconRail } from "@/components/client/IconRail";
import { ClientHeader } from "@/components/client/ClientHeader";
import { ClientFooter } from "@/components/client/ClientFooter";
import { getClient } from "@/lib/data/clients";
import { FinanceProvider } from "@/lib/store/FinanceContext";

export default function M4Layout({ children }: { children: React.ReactNode }) {
  const client = getClient("m4-logistica");
  if (!client) notFound();

  return (
    <div
      className="cf-dark min-h-screen bg-background"
      style={
        {
          "--client-accent": client.accent,
          "--client-accent-dark": client.accentDark,
        } as React.CSSProperties
      }
    >
      <FinanceProvider>
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
