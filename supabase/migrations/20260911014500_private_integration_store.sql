create table if not exists booking_core.integration_secrets (
  name text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

revoke all on table booking_core.integration_secrets from public, anon, authenticated;
grant select on table booking_core.integration_secrets to service_role;

create or replace function public.get_private_integration(p_name text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.value
  from booking_core.integration_secrets s
  where s.name = p_name
  limit 1;
$$;

revoke all on function public.get_private_integration(text) from public, anon, authenticated;
grant execute on function public.get_private_integration(text) to service_role;
