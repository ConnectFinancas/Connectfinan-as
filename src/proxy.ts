import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ROTAS_PUBLICAS = ["/login"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // getUser() (e não getSession()) porque revalida o token com o servidor da Supabase
  // em vez de confiar cegamente no cookie — evita aceitar uma sessão adulterada.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const rotaPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  if (!user && !rotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && rotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, client_slug")
      .eq("id", user.id)
      .single();

    // Login válido mas sem profile (removido, ou o gatilho de criação falhou) — nega por
    // padrão em vez de deixar passar sem nenhuma das checagens de papel abaixo.
    if (!profile && !rotaPublica) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Cliente logado só tem uma porta: o próprio painel. Nem o hub com todos os
    // clientes, nem o painel de outro cliente.
    if (profile?.role === "cliente") {
      const proprioSlug = profile.client_slug;
      const acessandoOutroPainel = pathname.startsWith("/clientes/") && !pathname.startsWith(`/clientes/${proprioSlug}`);
      const foraDoPainel = !pathname.startsWith("/clientes/");

      if (acessandoOutroPainel || foraDoPainel) {
        const url = request.nextUrl.clone();
        url.pathname = proprioSlug ? `/clientes/${proprioSlug}` : "/login";
        return NextResponse.redirect(url);
      }
    }

    // Colaborador vê só os clientes liberados pra ele; admin vê tudo.
    if (profile?.role === "colaborador" && pathname.startsWith("/clientes/")) {
      const slug = pathname.split("/")[2];
      const { data: permissao } = await supabase
        .from("colaborador_clientes")
        .select("client_slug")
        .eq("colaborador_id", user.id)
        .eq("client_slug", slug)
        .maybeSingle();

      if (!permissao) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    // A gestão de colaboradores/permissões é coisa de admin.
    if (profile?.role !== "admin" && pathname.startsWith("/colaboradores")) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Roda em tudo, exceto arquivos estáticos do Next e a pasta pública.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
