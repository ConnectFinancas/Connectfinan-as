import { notFound } from "next/navigation";
import { Sidebar } from "@/components/client/Sidebar";
import { TopBar } from "@/components/client/TopBar";
import { MobileNav } from "@/components/client/MobileNav";
import { getClient } from "@/lib/data/clients";

export default function M4Layout({ children }: { children: React.ReactNode }) {
  const client = getClient("m4-logistica");
  if (!client) notFound();

  return (
    <div
      className="min-h-screen bg-background"
      style={
        {
          "--client-accent": client.accent,
          "--client-accent-dark": client.accentDark,
        } as React.CSSProperties
      }
    >
      <Sidebar client={client} />
      <div className="lg:pl-64 flex min-h-screen flex-col">
        <MobileNav client={client} />
        <TopBar client={client} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
