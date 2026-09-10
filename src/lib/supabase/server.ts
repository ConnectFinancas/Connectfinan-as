import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente Supabase pra uso em Server Components / Route Handlers, sincronizado com
// os cookies de sessão do Next.js. Em Server Components a escrita de cookie é ignorada
// (o middleware já cuida de renovar a sessão a cada request) — daí o try/catch vazio.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // chamado de um Server Component — a sessão é renovada pelo middleware
          }
        },
      },
    },
  );
}
