import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ClientCard } from "@/components/ClientCard";
import { LogoutButton } from "@/components/LogoutButton";
import { clients } from "@/lib/data/clients";
import { financeRegistry } from "@/lib/data/financeRegistry";
import { computeContasPagarKpis, computeContasReceberKpis } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { ArrowDownCircle, ArrowUpCircle, Building2, Users } from "lucide-react";

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const ROTULO_PAPEL: Record<string, string> = {
  admin: "Administrador",
  colaborador: "Colaborador",
  cliente: "Cliente",
};

export default async function ClientPortfolioPage() {
  const profile = await getCurrentProfile();

  // Colaborador só vê os clientes liberados pra ele; admin (e, por segurança, qualquer
  // perfil não reconhecido) vê tudo. Cliente nunca chega aqui — o proxy já redireciona
  // ele direto pro próprio painel.
  let clientesVisiveis = clients;
  if (profile?.role === "colaborador") {
    const supabase = await createClient();
    const { data: permissoes } = await supabase
      .from("colaborador_clientes")
      .select("client_slug")
      .eq("colaborador_id", profile.id);
    const liberados = new Set((permissoes ?? []).map((p) => p.client_slug));
    clientesVisiveis = clients.filter((c) => liberados.has(c.slug));
  }

  const activeClients = clientesVisiveis.filter((c) => c.status === "ativo").length;
  const ativos = clientesVisiveis.filter((c) => c.status === "ativo" && financeRegistry[c.slug]);
  const aReceberTotal = ativos.reduce(
    (a, c) => a + computeContasReceberKpis(financeRegistry[c.slug].seedReceivables).aReceber.value,
    0
  );
  const aPagarTotal = ativos.reduce(
    (a, c) => a + computeContasPagarKpis(financeRegistry[c.slug].seedPayables).emAberto.value,
    0
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            {profile?.role === "admin" && (
              <Link
                href="/colaboradores"
                className="flex items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
              >
                <Users size={13} />
                Colaboradores
              </Link>
            )}
            <div className="flex items-center gap-2.5 rounded-full border border-border-subtle bg-white py-1 pl-1 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-[11px] font-semibold text-white">
                {profile ? iniciais(profile.nome) : "—"}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-medium text-brand-900">{profile?.nome ?? "—"}</p>
                <p className="text-[10px] text-slate-400">{profile ? ROTULO_PAPEL[profile.role] : ""} · BPO Financeiro</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">Portfólio de Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Selecione um cliente para acessar o painel financeiro dedicado.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card flex items-center gap-3.5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800/10 text-brand-700">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-lg font-semibold text-brand-900">
                {activeClients} <span className="text-sm font-normal text-slate-400">/ {clientesVisiveis.length}</span>
              </p>
              <p className="text-xs text-slate-500">Clientes com painel ativo</p>
            </div>
          </div>
          <div className="card flex items-center gap-3.5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
              <ArrowUpCircle size={18} />
            </div>
            <div>
              <p className="text-lg font-semibold text-brand-900">{formatCurrency(aReceberTotal)}</p>
              <p className="text-xs text-slate-500">A receber em aberto (carteira)</p>
            </div>
          </div>
          <div className="card flex items-center gap-3.5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-100 text-danger-500">
              <ArrowDownCircle size={18} />
            </div>
            <div>
              <p className="text-lg font-semibold text-brand-900">{formatCurrency(aPagarTotal)}</p>
              <p className="text-xs text-slate-500">A pagar em aberto (carteira)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientesVisiveis.map((client) => (
            <ClientCard key={client.slug} client={client} />
          ))}
        </div>

        {clientesVisiveis.length === 0 && (
          <div className="card p-8 text-center text-sm text-slate-500">
            Nenhum cliente liberado pro seu acesso ainda. Fale com quem administra sua conta.
          </div>
        )}
      </main>
    </div>
  );
}
