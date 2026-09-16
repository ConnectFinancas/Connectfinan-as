import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clients } from "@/lib/data/clients";

type Role = "admin" | "colaborador" | "cliente";

type CriarColaboradorBody = {
  nome?: string;
  email?: string;
  senha?: string;
  role?: Role;
  clientSlug?: string | null;
  clientSlugs?: string[];
};

const SLUGS_VALIDOS = new Set(clients.map((c) => c.slug));

export async function POST(request: Request) {
  // Só admin pode criar login novo — confere a sessão de quem está chamando (via cookie),
  // nunca confia em nada que venha do corpo da requisição pra essa checagem.
  const supabase = await createServerClient();
  const {
    data: { user: chamador },
  } = await supabase.auth.getUser();
  if (!chamador) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }
  const { data: perfilChamador } = await supabase.from("profiles").select("role").eq("id", chamador.id).single();
  if (perfilChamador?.role !== "admin") {
    return NextResponse.json({ erro: "Só administradores podem cadastrar novos colaboradores." }, { status: 403 });
  }

  const body = (await request.json()) as CriarColaboradorBody;
  const nome = body.nome?.trim();
  const email = body.email?.trim().toLowerCase();
  const senha = body.senha ?? "";
  const role = body.role;

  if (!nome || !email || !role) {
    return NextResponse.json({ erro: "Preencha nome, e-mail e papel." }, { status: 400 });
  }
  if (senha.length < 8) {
    return NextResponse.json({ erro: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  }
  if (!["admin", "colaborador", "cliente"].includes(role)) {
    return NextResponse.json({ erro: "Papel inválido." }, { status: 400 });
  }
  if (role === "cliente" && (!body.clientSlug || !SLUGS_VALIDOS.has(body.clientSlug))) {
    return NextResponse.json({ erro: "Selecione um cliente válido pra esse login." }, { status: 400 });
  }
  const clientSlugs = (body.clientSlugs ?? []).filter((s) => SLUGS_VALIDOS.has(s));

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { erro: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor. Peça pro Ewerton adicionar essa variável de ambiente." },
      { status: 500 }
    );
  }

  const { data: criado, error: erroCriar } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: {
      nome,
      role,
      client_slug: role === "cliente" ? body.clientSlug : null,
    },
  });

  if (erroCriar || !criado.user) {
    const mensagem = erroCriar?.message?.includes("already been registered")
      ? "Já existe um login com esse e-mail."
      : erroCriar?.message || "Não consegui criar o login.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }

  // O gatilho on_auth_user_created já criou a linha em profiles a partir do user_metadata acima.
  if (role === "colaborador" && clientSlugs.length > 0) {
    await admin.from("colaborador_clientes").insert(clientSlugs.map((client_slug) => ({ colaborador_id: criado.user.id, client_slug })));
  }

  await admin.from("audit_log").insert({
    profile_id: chamador.id,
    email: chamador.email,
    acao: "criou_colaborador",
    detalhes: `Criou o login de ${nome} (${email}) como ${role}.`,
  });

  return NextResponse.json({ ok: true, id: criado.user.id });
}
