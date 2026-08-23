create schema if not exists booking_core;
revoke all on schema booking_core from public, anon, authenticated;
grant usage on schema booking_core to service_role;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  timezone text not null default 'America/Los_Angeles',
  max_guests smallint not null,
  min_nights smallint not null default 5,
  max_nights smallint not null default 60,
  base_nightly_rate numeric(10,2),
  weekend_nightly_rate numeric(10,2),
  cleaning_fee numeric(10,2),
  tax_rate numeric(6,5),
  currency text not null default 'usd',
  airbnb_listing_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint properties_name_length check (char_length(name) between 2 and 120),
  constraint properties_guest_count check (max_guests between 1 and 30),
  constraint properties_night_limits check (min_nights >= 1 and max_nights >= min_nights and max_nights <= 365),
  constraint properties_rate_values check (
    (base_nightly_rate is null or base_nightly_rate >= 0)
    and (weekend_nightly_rate is null or weekend_nightly_rate >= 0)
    and (cleaning_fee is null or cleaning_fee >= 0)
    and (tax_rate is null or (tax_rate >= 0 and tax_rate <= 1))
  ),
  constraint properties_currency_format check (currency ~ '^[a-z]{3}$')
);

insert into public.properties (slug, name, timezone, max_guests, min_nights, max_nights, airbnb_listing_id)
values ('chestnut-by-the-sea', 'Chestnut By the Sea', 'America/Los_Angeles', 6, 5, 60, '1553757930360534380')
on conflict (slug) do update set
  name = excluded.name,
  timezone = excluded.timezone,
  max_guests = excluded.max_guests,
  min_nights = excluded.min_nights,
  max_nights = excluded.max_nights,
  airbnb_listing_id = excluded.airbnb_listing_id,
  updated_at = now();

create table public.booking_calendar (
  id bigint generated always as identity primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  stay_date date not null,
  source text not null,
  external_uid text,
  created_at timestamptz not null default now(),
  constraint booking_calendar_source_values check (source in ('airbnb', 'direct', 'manual', 'maintenance')),
  unique (property_id, stay_date)
);
create index booking_calendar_date_idx on public.booking_calendar (stay_date);
create index booking_calendar_property_date_idx on public.booking_calendar (property_id, stay_date);

create table public.nightly_rates (
  id bigint generated always as identity primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  stay_date date not null,
  nightly_rate numeric(10,2) not null,
  min_nights smallint,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nightly_rates_value check (nightly_rate >= 0),
  constraint nightly_rates_min_nights check (min_nights is null or min_nights between 1 and 365),
  constraint nightly_rates_note_length check (note is null or char_length(note) <= 500),
  unique (property_id, stay_date)
);
create index nightly_rates_property_date_idx on public.nightly_rates (property_id, stay_date);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  confirmation_code text not null unique default ('PS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  property_id uuid not null references public.properties(id),
  booking_request_id uuid references public.booking_requests(id) on delete set null,
  check_in date not null,
  check_out date not null,
  guests smallint not null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  status text not null default 'hold',
  source text not null default 'direct',
  subtotal numeric(10,2),
  cleaning_fee numeric(10,2),
  tax_amount numeric(10,2),
  total_amount numeric(10,2),
  payment_status text not null default 'not_required',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_dates check (check_out > check_in),
  constraint reservations_guest_count check (guests between 1 and 30),
  constraint reservations_guest_name_length check (char_length(btrim(guest_name)) between 2 and 100),
  constraint reservations_guest_email_format check (char_length(guest_email) <= 254 and guest_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint reservations_status_values check (status in ('hold', 'confirmed', 'cancelled', 'completed')),
  constraint reservations_source_values check (source in ('direct', 'airbnb', 'manual')),
  constraint reservations_payment_status_values check (payment_status in ('not_required', 'pending', 'paid', 'refunded', 'failed')),
  constraint reservations_amount_values check (
    (subtotal is null or subtotal >= 0) and (cleaning_fee is null or cleaning_fee >= 0)
    and (tax_amount is null or tax_amount >= 0) and (total_amount is null or total_amount >= 0)
  ),
  constraint reservations_notes_length check (internal_notes is null or char_length(internal_notes) <= 3000)
);
create index reservations_property_dates_idx on public.reservations (property_id, check_in, check_out);
create index reservations_booking_request_id_idx on public.reservations (booking_request_id);
create index reservations_status_idx on public.reservations (status);
create index reservations_created_at_idx on public.reservations (created_at desc);

alter table public.booking_requests
  add column property_id uuid references public.properties(id),
  add column request_number bigint generated by default as identity unique,
  add column updated_at timestamptz not null default now();
update public.booking_requests br set property_id = p.id from public.properties p
where br.property_slug = p.slug and br.property_id is null;
alter table public.booking_requests alter column property_id set not null;
create index booking_requests_property_id_idx on public.booking_requests (property_id);

create table booking_core.calendar_sources (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  provider text not null,
  external_listing_id text,
  secret_name text,
  enabled boolean not null default false,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_sources_provider_values check (provider in ('airbnb_ical')),
  constraint calendar_sources_secret_name_length check (secret_name is null or char_length(secret_name) <= 200),
  unique (property_id, provider)
);
insert into booking_core.calendar_sources (property_id, provider, external_listing_id, secret_name, enabled)
select id, 'airbnb_ical', airbnb_listing_id, 'PACIFIC_STAY_AIRBNB_ICAL_URL', false
from public.properties where slug = 'chestnut-by-the-sea'
on conflict (property_id, provider) do nothing;

create table booking_core.calendar_sync_runs (
  id bigint generated always as identity primary key,
  calendar_source_id uuid not null references booking_core.calendar_sources(id) on delete cascade,
  status text not null,
  events_seen integer not null default 0,
  dates_added integer not null default 0,
  dates_removed integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint calendar_sync_status_values check (status in ('running', 'success', 'failed')),
  constraint calendar_sync_counts check (events_seen >= 0 and dates_added >= 0 and dates_removed >= 0),
  constraint calendar_sync_error_length check (error_message is null or char_length(error_message) <= 2000)
);
create index calendar_sync_runs_source_id_idx on booking_core.calendar_sync_runs (calendar_source_id);
grant all on all tables in schema booking_core to service_role;
grant usage, select on all sequences in schema booking_core to service_role;

alter table public.properties enable row level security;
alter table public.booking_calendar enable row level security;
alter table public.nightly_rates enable row level security;
alter table public.reservations enable row level security;
alter table booking_core.calendar_sources enable row level security;
alter table booking_core.calendar_sync_runs enable row level security;
create policy "Service role manages calendar sources" on booking_core.calendar_sources
for all to service_role using (true) with check (true);
create policy "Service role manages calendar sync runs" on booking_core.calendar_sync_runs
for all to service_role using (true) with check (true);

grant usage on schema booking_core to authenticated;
create or replace function booking_core.is_admin()
returns boolean language sql stable security invoker set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;
revoke execute on function booking_core.is_admin() from public, anon;
grant execute on function booking_core.is_admin() to authenticated, service_role;

revoke all on public.properties, public.booking_calendar, public.nightly_rates, public.reservations from anon, authenticated;
grant select on public.properties, public.booking_calendar, public.nightly_rates to anon, authenticated;
grant select, insert, update, delete on public.properties, public.booking_calendar, public.nightly_rates, public.reservations to authenticated;
grant usage, select on sequence public.booking_calendar_id_seq, public.nightly_rates_id_seq to authenticated;
revoke select on public.booking_calendar from anon;
grant select (property_id, stay_date, source) on public.booking_calendar to anon;
revoke select on public.nightly_rates from anon;
grant select (property_id, stay_date, nightly_rate, min_nights) on public.nightly_rates to anon;

create policy "Public can view active properties" on public.properties for select to anon using (active = true);
create policy "Public can view unavailable dates" on public.booking_calendar for select to anon using (true);
create policy "Public can view nightly rates" on public.nightly_rates for select to anon using (true);
create policy "Admins manage properties" on public.properties for all to authenticated
using ((select booking_core.is_admin())) with check ((select booking_core.is_admin()));
create policy "Admins manage booking calendar" on public.booking_calendar for all to authenticated
using ((select booking_core.is_admin())) with check ((select booking_core.is_admin()));
create policy "Admins manage nightly rates" on public.nightly_rates for all to authenticated
using ((select booking_core.is_admin())) with check ((select booking_core.is_admin()));
create policy "Admins manage reservations" on public.reservations for all to authenticated
using ((select booking_core.is_admin())) with check ((select booking_core.is_admin()));

grant select, update on public.booking_requests to authenticated;
create policy "Admins view booking requests" on public.booking_requests for select to authenticated
using ((select booking_core.is_admin()));
create policy "Admins update booking requests" on public.booking_requests for update to authenticated
using ((select booking_core.is_admin())) with check ((select booking_core.is_admin()));

create or replace function booking_core.set_booking_request_property_id()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  select id into new.property_id from public.properties where slug = new.property_slug and active = true;
  if new.property_id is null then raise exception 'Unknown or inactive property'; end if;
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function booking_core.set_booking_request_property_id() from public, anon, authenticated;
grant execute on function booking_core.set_booking_request_property_id() to service_role;
create trigger booking_requests_set_property_id before insert on public.booking_requests
for each row execute function booking_core.set_booking_request_property_id();
grant usage, select on sequence public.booking_requests_request_number_seq to anon, authenticated;

drop policy if exists "Guests can submit booking requests" on public.booking_requests;
create policy "Guests can submit booking requests" on public.booking_requests for insert to anon, authenticated
with check (
  status = 'new' and source = 'website' and property_slug = 'chestnut-by-the-sea'
  and property_name = 'Chestnut By the Sea'
  and property_id = (select id from public.properties where slug = property_slug and active = true)
  and check_out >= check_in + 5 and check_in >= current_date and check_out <= check_in + 60
  and guests between 1 and 6
);

create or replace function public.replace_airbnb_calendar(p_property_id uuid, p_entries jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  inserted_count integer;
  source_id uuid;
begin
  if jsonb_typeof(p_entries) <> 'array' then raise exception 'Calendar entries must be a JSON array'; end if;
  select id into source_id from booking_core.calendar_sources
  where property_id = p_property_id and provider = 'airbnb_ical';
  if source_id is null then raise exception 'Airbnb calendar source is not configured for this property'; end if;

  delete from public.booking_calendar where property_id = p_property_id and source = 'airbnb';
  insert into public.booking_calendar (property_id, stay_date, source, external_uid)
  select p_property_id, entry.stay_date, 'airbnb', left(entry.external_uid, 500)
  from jsonb_to_recordset(p_entries) as entry(stay_date date, external_uid text)
  where entry.stay_date >= current_date - 1 and entry.stay_date <= current_date + 730
  on conflict (property_id, stay_date) do nothing;
  get diagnostics inserted_count = row_count;

  update booking_core.calendar_sources set enabled = true, last_synced_at = now(), updated_at = now()
  where id = source_id;
  insert into booking_core.calendar_sync_runs
    (calendar_source_id, status, events_seen, dates_added, dates_removed, completed_at)
  values (source_id, 'success', jsonb_array_length(p_entries), inserted_count, 0, now());
  return inserted_count;
end;
$$;
revoke all on function public.replace_airbnb_calendar(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.replace_airbnb_calendar(uuid, jsonb) to service_role;

create or replace function public.approve_booking_request(p_request_id uuid)
returns text language plpgsql security invoker set search_path = '' as $$
declare
  request_row public.booking_requests%rowtype;
  property_row public.properties%rowtype;
  reservation_id uuid;
  code text;
begin
  if not booking_core.is_admin() then raise exception 'Administrator access required'; end if;
  select * into request_row from public.booking_requests where id = p_request_id for update;
  if request_row.id is null then raise exception 'Booking request not found'; end if;
  if request_row.status not in ('new', 'contacted') then raise exception 'Only new or contacted requests can be approved'; end if;
  select * into property_row from public.properties where id = request_row.property_id and active = true;
  if property_row.id is null then raise exception 'Property is not active'; end if;
  if request_row.check_out < request_row.check_in + property_row.min_nights
    or request_row.check_out > request_row.check_in + property_row.max_nights then
    raise exception 'Stay does not meet property night limits';
  end if;
  if exists (select 1 from public.booking_calendar where property_id = request_row.property_id
    and stay_date >= request_row.check_in and stay_date < request_row.check_out) then
    raise exception 'Requested dates are no longer available';
  end if;
  insert into public.reservations (
    property_id, booking_request_id, check_in, check_out, guests,
    guest_name, guest_email, guest_phone, status, source, payment_status
  ) values (
    request_row.property_id, request_row.id, request_row.check_in, request_row.check_out,
    request_row.guests, request_row.full_name, request_row.email, request_row.phone,
    'confirmed', 'direct', 'not_required'
  ) returning id, confirmation_code into reservation_id, code;
  insert into public.booking_calendar (property_id, stay_date, source, external_uid)
  select request_row.property_id, day::date, 'direct', reservation_id::text
  from generate_series(request_row.check_in::timestamp, (request_row.check_out - 1)::timestamp, interval '1 day') day;
  update public.booking_requests set status = 'approved', updated_at = now() where id = request_row.id;
  return code;
end;
$$;
revoke all on function public.approve_booking_request(uuid) from public, anon;
grant execute on function public.approve_booking_request(uuid) to authenticated;

create or replace function public.cancel_booking_request(p_request_id uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare reservation_row public.reservations%rowtype;
begin
  if not booking_core.is_admin() then raise exception 'Administrator access required'; end if;
  select * into reservation_row from public.reservations
  where booking_request_id = p_request_id and status in ('hold', 'confirmed') for update;
  if reservation_row.id is not null then
    delete from public.booking_calendar where property_id = reservation_row.property_id
      and source = 'direct' and external_uid = reservation_row.id::text;
    update public.reservations set status = 'cancelled', updated_at = now() where id = reservation_row.id;
  end if;
  update public.booking_requests set status = 'cancelled', updated_at = now() where id = p_request_id;
  return found;
end;
$$;
revoke all on function public.cancel_booking_request(uuid) from public, anon;
grant execute on function public.cancel_booking_request(uuid) to authenticated;
