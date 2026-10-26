-- Ricavi Finanças — armazena o token OAuth da integração com o IXC (sistema de gestão onde ficam
-- cadastrados os clientes da Connect/Connect Ecommerce e o Contas a Receber de cada um). Só o
-- Client ID/Secret do app OAuth ficam em variável de ambiente (nunca aqui); essa tabela guarda só
-- o resultado da troca do código pelo token — acesso restrito a admin via RLS.
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase.

create table if not exists public.integracao_ixc_token (
  id int primary key default 1,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  obtained_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint integracao_ixc_token_singleton check (id = 1)
);

alter table public.integracao_ixc_token enable row level security;

create policy "integracao_ixc_token_admin_only"
  on public.integracao_ixc_token for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
