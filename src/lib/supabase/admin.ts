import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a service role key — ignora RLS e pode usar a Admin API (criar/excluir login de
// autenticação), coisa que a anon key não permite. SÓ pode ser importado em código de servidor
// (Route Handlers) — nunca num Client Component, senão a service role key vaza no bundle do
// navegador.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente do servidor.");
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
