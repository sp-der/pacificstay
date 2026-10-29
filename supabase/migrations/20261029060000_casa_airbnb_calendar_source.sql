-- Add a private Airbnb iCal source for Casa Del Cactus.
-- This migration must be applied to Pacific Stay's Supabase project before
-- activating Casa direct booking requests.

-- A single authenticated-admin-only entry point stores the private iCal URL
-- and configures the existing calendar source machinery. Never write URLs to
-- public.properties.content, GitHub, or a client-readable table.
create or replace function public.configure_airbnb_calendar(
  p_slug text,
  p_ical_url text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  property_uuid uuid;
  integration_key text;
  airbnb_listing text;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Administrator access required';
  end if;
  if p_slug not in ('chestnut-by-the-sea', 'casa-del-cactus') then
    raise exception 'This property does not use the Pacific Stay Airbnb calendar';
  end if;
  if p_ical_url is null or length(p_ical_url) > 2048 or
     p_ical_url !~ '^https://(www\.)?airbnb\.com/calendar/ical/[0-9]+\.ics\?s=[a-zA-Z0-9_-]{8,}$' then
    raise exception 'Use the private Airbnb calendar export URL, not the public listing URL';
  end if;

  select id into property_uuid from public.properties
  where slug = p_slug;
  if property_uuid is null then
    raise exception 'Create the property in Pacific Stay before connecting its calendar';
  end if;

  integration_key := case when p_slug = 'chestnut-by-the-sea'
    then 'airbnb_ical_url' else 'airbnb_ical_url_casa_del_cactus' end;
  airbnb_listing := substring(p_ical_url from '/calendar/ical/([0-9]+)\.ics');

  insert into booking_core.integration_secrets(name, value, updated_at)
  values (integration_key, p_ical_url, now())
  on conflict (name) do update set value = excluded.value, updated_at = now();

  insert into booking_core.calendar_sources(
    property_id, provider, external_listing_id, secret_name, enabled, last_synced_at
  ) values (
    property_uuid, 'airbnb_ical', airbnb_listing, integration_key, false, null
  )
  on conflict (property_id, provider) do update
    set external_listing_id = excluded.external_listing_id,
        secret_name = excluded.secret_name,
        enabled = false,
        last_synced_at = null,
        updated_at = now();
  return true;
end;
$$;

revoke all on function public.configure_airbnb_calendar(text, text) from public, anon, authenticated;
grant execute on function public.configure_airbnb_calendar(text, text) to authenticated;

-- Only the trusted server, via its existing server-only service role, can read
-- whether Casa's availability feed has been recently synchronized. No calendar
-- secrets or reservation information are returned to the public client.
create or replace function public.booking_calendar_source_ready(p_slug text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from booking_core.calendar_sources s
    join public.properties p on p.id = s.property_id
    where p.slug = p_slug
      and p.active = true
      and s.provider = 'airbnb_ical'
      and s.enabled = true
      and s.last_synced_at >= now() - interval '72 hours'
  );
$$;
revoke all on function public.booking_calendar_source_ready(text) from public, anon, authenticated;
grant execute on function public.booking_calendar_source_ready(text) to service_role;

-- RLS remains enabled on booking_core tables; service_role reads the metadata
-- via an invoker function, while only an authenticated owner/admin can configure
-- URLs through the narrow definer function above.
