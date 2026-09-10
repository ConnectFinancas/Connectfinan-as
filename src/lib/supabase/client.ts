"use client";

import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase pra uso em Client Components (formulário de login, hooks etc).
// A anon key é pública por design — a segurança de verdade vem das políticas de
// RLS configuradas no banco, não do sigilo dessa chave.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
