import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ixcTrocarCodigoPorToken } from "@/lib/integracoes/ixc";

// Callback do OAuth do IXC — recebe o "code", troca pelo access/refresh token e guarda em
// integracao_ixc_token (ver migration 0003). Redireciona de volta pro painel com ?ixc=ok|erro.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const stateCookie = request.cookies.get("ixc_oauth_state")?.value;
  const erroParam = searchParams.get("error");

  const voltarPara = (status: "ok" | "erro", mensagem?: string) => {
    const url = new URL("/", request.url);
    url.searchParams.set("ixc", status);
    if (mensagem) url.searchParams.set("ixc_msg", mensagem);
    const resp = NextResponse.redirect(url);
    resp.cookies.delete("ixc_oauth_state");
    return resp;
  };

  if (erroParam) {
    return voltarPara("erro", `IXC recusou a autorização: ${erroParam}`);
  }
  if (!code) {
    return voltarPara("erro", "Callback sem o parâmetro code.");
  }
  if (!state || !stateCookie || state !== stateCookie) {
    return voltarPara("erro", "State inválido — tente autorizar de novo.");
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return voltarPara("erro", "Sessão expirou durante a autorização — faça login e tente de novo.");
  }

  let token;
  try {
    token = await ixcTrocarCodigoPorToken(code);
  } catch (e) {
    return voltarPara("erro", e instanceof Error ? e.message : "Erro ao trocar o código pelo token.");
  }

  const admin = createAdminClient();
  const expiresAt = token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null;
  const { error } = await admin.from("integracao_ixc_token").upsert({
    id: 1,
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? null,
    expires_at: expiresAt,
    obtained_by: user.id,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return voltarPara("erro", `Token obtido, mas falhou ao salvar: ${error.message}`);
  }

  return voltarPara("ok");
}
