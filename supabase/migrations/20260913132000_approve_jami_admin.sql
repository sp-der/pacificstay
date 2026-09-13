-- Keep admin authorization limited to explicitly approved Pacific Stay owner/manager emails.
-- This runs before a new auth.users row is written, so approved users receive the
-- app_metadata role used by the existing /admin authorization checks.
create or replace function booking_core.assign_first_admin()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
begin
  if lower(new.email) in ('otrservicesie@gmail.com', 'info@pacificstayproperties.com') then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', 'admin');
  end if;

  return new;
end;
$$;

revoke all on function booking_core.assign_first_admin() from public;
