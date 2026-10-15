-- Ricavi Finanças — mantém profiles.email sincronizado quando o e-mail de login muda no
-- Supabase Auth (Dashboard → Authentication → Users → editar e-mail), sem precisar de um UPDATE
-- manual depois. Rode este arquivo inteiro no SQL Editor do painel do Supabase.

create or replace function public.handle_user_email_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_updated();
