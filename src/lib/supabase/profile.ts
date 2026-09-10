import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string;
  nome: string;
  role: "admin" | "colaborador" | "cliente";
  client_slug: string | null;
};

// Perfil do usuário logado, pra Server Components decidirem o que mostrar
// (o proxy.ts já garante que só chega aqui quem tem sessão válida).
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("id, email, nome, role, client_slug").eq("id", user.id).single();
  return data as Profile | null;
}
