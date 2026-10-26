-- Ricavi Finanças — Contas a Receber sincronizado em tempo real do IXC (sistema onde ficam o
-- cadastro de clientes e o financeiro da Connect/Connect Ecommerce). A autenticação com o IXC é
-- Basic Auth (usuário/senha em variável de ambiente, nunca aqui) — essa tabela só guarda o
-- resultado da sincronização (fn_areceber), pra ser lida pelo painel sem bater na API do IXC a
-- cada carregamento de tela.
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase.

create table if not exists public.ixc_contas_a_receber (
  id text primary key, -- id do título em fn_areceber (prefixado, ver rotina de sync)
  client_slug text not null check (client_slug in ('connect', 'connect-ecommerce')),
  ixc_cliente_id text,
  cliente_nome text,
  descricao text,
  valor numeric(14, 2) not null default 0,
  data_vencimento date,
  data_pagamento date,
  status text not null, -- A=aberto, R=recebido, C=cancelado, P=parcialmente recebido (ver IXC)
  synced_at timestamptz not null default now()
);

create index if not exists ixc_contas_a_receber_client_slug_idx on public.ixc_contas_a_receber (client_slug);
create index if not exists ixc_contas_a_receber_vencimento_idx on public.ixc_contas_a_receber (data_vencimento);

alter table public.ixc_contas_a_receber enable row level security;

-- Mesmo critério de acesso já usado em colaborador_clientes: admin vê tudo; colaborador só os
-- client_slug que tiver liberado; cliente (role='cliente') só o próprio client_slug.
create policy "ixc_contas_a_receber_select"
  on public.ixc_contas_a_receber for select
  using (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.colaborador_clientes cc
      where cc.colaborador_id = auth.uid() and cc.client_slug = ixc_contas_a_receber.client_slug
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'cliente' and p.client_slug = ixc_contas_a_receber.client_slug
    )
  );

-- Só a rotina de sincronização (que roda com a service role key, ignora RLS) escreve aqui — não
-- precisa de policy de insert/update pra usuário comum nenhum.
