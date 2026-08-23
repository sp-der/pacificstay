-- Bootstrap exactly one Pacific Stay administrator without exposing a privileged API key.
-- The approved owner chooses their own password through Supabase Auth; this trigger
-- adds the authorization claim before the user is written.
create or replace function booking_core.assign_first_admin()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
begin
  if lower(new.email) = 'otrservicesie@gmail.com'
     and not exists (
       select 1
       from auth.users
       where raw_app_meta_data ->> 'role' = 'admin'
     ) then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', 'admin');
  end if;

  return new;
end;
$$;

revoke all on function booking_core.assign_first_admin() from public;

drop trigger if exists assign_first_admin_before_signup on auth.users;
create trigger assign_first_admin_before_signup
before insert on auth.users
for each row execute function booking_core.assign_first_admin();

