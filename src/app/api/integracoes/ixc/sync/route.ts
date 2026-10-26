import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ixcListarClientesPorFilial, ixcListarContasAReceber, IxcTituloAReceber } from "@/lib/integracoes/ixc";

export const maxDuration = 60;

// Sincroniza o Contas a Receber do IXC (fn_areceber) pra public.ixc_contas_a_receber, separado
// por filial: id_filial 1 = Connect, id_filial 2 = Connect Ecommerce (ver cadastro de cliente no
// IXC). Chamado de duas formas:
//   - Vercel Cron, com o header "Authorization: Bearer <CRON_SECRET>" que o próprio Vercel envia;
//   - Manualmente, por um admin logado (sessão via cookie).
const FILIAIS: { idFilial: number; clientSlug: "connect" | "connect-ecommerce" }[] = [
  { idFilial: 1, clientSlug: "connect" },
  { idFilial: 2, clientSlug: "connect-ecommerce" },
];

// "Recebido ou em atraso, passado/presente/futuro" — traz tudo exceto cancelado, sem recorte de
// data (o "em atraso" já vem como status "A" com vencimento no passado, igual o IXC mostra).
const STATUS_SINCRONIZADOS = ["A", "R", "P"] as const;

async function autorizado(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return perfil?.role === "admin";
}

export async function GET(request: NextRequest) {
  if (!(await autorizado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const admin = createAdminClient();
  const resumo: Record<string, number> = {};

  for (const { idFilial, clientSlug } of FILIAIS) {
    const clientes = await ixcListarClientesPorFilial(idFilial);
    const nomePorId = new Map(clientes.map((c) => [c.id, c.razao]));
    const titulos = await ixcListarContasAReceber({
      idsCliente: clientes.map((c) => c.id),
      status: [...STATUS_SINCRONIZADOS],
    });

    const linhas = titulos.map((t: IxcTituloAReceber) => ({
      id: `ixc-${t.id}`,
      client_slug: clientSlug,
      ixc_cliente_id: t.id_cliente ?? null,
      cliente_nome: t.id_cliente ? nomePorId.get(String(t.id_cliente)) ?? null : null,
      descricao: (t.obs as string) ?? (t.descricao as string) ?? null,
      valor: Number(t.valor ?? 0),
      data_vencimento: t.data_vencimento || null,
      data_pagamento: t.data_pagamento || null,
      status: t.status ?? "A",
      synced_at: new Date().toISOString(),
    }));

    if (linhas.length > 0) {
      const { error } = await admin.from("ixc_contas_a_receber").upsert(linhas, { onConflict: "id" });
      if (error) {
        return NextResponse.json({ erro: `Falhou ao salvar ${clientSlug}: ${error.message}` }, { status: 500 });
      }
    }
    resumo[clientSlug] = linhas.length;
  }

  return NextResponse.json({ ok: true, sincronizados: resumo });
}
