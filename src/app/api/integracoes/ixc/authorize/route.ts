import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { ixcAuthorizeUrl } from "@/lib/integracoes/ixc";

// Início do fluxo OAuth com o IXC — só admin pode disparar (é quem autoriza o acesso aos dados
// financeiros dos clientes). Gera um "state" aleatório pra conferir no callback (proteção contra
// CSRF) e guarda num cookie de curta duração.
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }
  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (perfil?.role !== "admin") {
    return NextResponse.json({ erro: "Só administradores podem autorizar essa integração." }, { status: 403 });
  }

  const state = randomBytes(16).toString("hex");
  let url: string;
  try {
    url = ixcAuthorizeUrl(state);
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : "Erro ao montar a URL de autorização." }, { status: 500 });
  }

  const resposta = NextResponse.redirect(url);
  resposta.cookies.set("ixc_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return resposta;
}
