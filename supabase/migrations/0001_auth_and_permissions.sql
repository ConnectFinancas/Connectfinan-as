-- Ricavi Finanças — autenticação real, permissões por colaborador/cliente e histórico de acesso.
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase (Database > SQL Editor > New query).

-- 1. Perfil de cada usuário autenticado (colaborador, cliente ou admin).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nome text not null,
  role text not null check (role in ('admin', 'colaborador', 'cliente')),
  -- só preenchido quando role = 'cliente': o único painel que esse login pode acessar.
  client_slug text,
  created_at timestamptz not null default now()
);

-- 2. Quais clientes cada colaborador pode ver (irrelevante pra role admin/cliente).
create table if not exists public.colaborador_clientes (
  colaborador_id uuid not null references public.profiles (id) on delete cascade,
  client_slug text not null,
  primary key (colaborador_id, client_slug)
);

-- 3. Histórico de acesso e ações — última vez que logou, o que fez.
create table if not exists public.audit_log (
  id bigserial primary key,
  profile_id uuid references public.profiles (id) on delete set null,
  email text not null,
  nome text,
  acao text not null,
  client_slug text,
  detalhes text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_profile_id_idx on public.audit_log (profile_id);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

-- Função auxiliar pra checar o papel do usuário logado sem cair em recursão nas
-- políticas de RLS da própria tabela profiles (padrão recomendado pelo Supabase).
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Cria o profile automaticamente quando um usuário é criado no painel de Authentication.
-- Ao criar o usuário, preencha "User Metadata" (JSON) com algo como:
--   Admin:       {"nome": "Ewerton Lucas", "role": "admin"}
--   Colaborador: {"nome": "Fulano", "role": "colaborador"}
--   Cliente:     {"nome": "MJ Prime", "role": "cliente", "client_slug": "mj-prime"}
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, role, client_slug)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'colaborador'),
    new.raw_user_meta_data ->> 'client_slug'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: cada um só enxerga o que pode.
alter table public.profiles enable row level security;
alter table public.colaborador_clientes enable row level security;
alter table public.audit_log enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.current_user_role() = 'admin');

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.current_user_role() = 'admin');

create policy "profiles_insert_admin_only"
  on public.profiles for insert
  with check (public.current_user_role() = 'admin');

create policy "profiles_delete_admin_only"
  on public.profiles for delete
  using (public.current_user_role() = 'admin');

create policy "colaborador_clientes_select_own_or_admin"
  on public.colaborador_clientes for select
  using (colaborador_id = auth.uid() or public.current_user_role() = 'admin');

create policy "colaborador_clientes_write_admin_only"
  on public.colaborador_clientes for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "audit_log_select_own_or_admin"
  on public.audit_log for select
  using (profile_id = auth.uid() or public.current_user_role() = 'admin');

create policy "audit_log_insert_own"
  on public.audit_log for insert
  with check (profile_id = auth.uid());
