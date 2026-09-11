-- Post-approval reservation flow for Pacific Stay direct bookings.
-- Keeps approved dates blocked, stores the final direct quote, exposes a limited guest portal view,
-- and leaves payment/email provider delivery ready for Stripe + Resend integration.

create or replace function public.approve_booking_request(p_request_id uuid)
returns text language plpgsql security invoker set search_path = '' as $$
declare
  request_row public.booking_requests%rowtype;
  property_row public.properties%rowtype;
  reservation_id uuid;
  code text;
  stay_subtotal numeric(10,2);
  cleaning numeric(10,2);
  taxes numeric(10,2);
  stay_total numeric(10,2);
begin
  if not booking_core.is_admin() then raise exception 'Administrator access required'; end if;

  select * into request_row from public.booking_requests where id = p_request_id for update;
  if request_row.id is null then raise exception 'Booking request not found'; end if;
  if request_row.status not in ('new', 'contacted') then raise exception 'Only new or contacted requests can be approved'; end if;

  select * into property_row from public.properties where id = request_row.property_id and active = true;
  if property_row.id is null then raise exception 'Property is not active'; end if;
  if property_row.base_nightly_rate is null or request_row.guests>property_row.max_guests or request_row.check_in<current_date then raise exception 'Check property rates, occupancy and dates'; end if;
  if request_row.check_out < request_row.check_in + property_row.min_nights
    or request_row.check_out > request_row.check_in + property_row.max_nights then
    raise exception 'Stay does not meet property night limits';
  end if;
  if exists (
    select 1 from public.booking_calendar
    where property_id = request_row.property_id
      and stay_date >= request_row.check_in and stay_date < request_row.check_out
  ) then
    raise exception 'Requested dates are no longer available';
  end if;

  select coalesce(sum(
    coalesce(
      nr.nightly_rate,
      case when extract(dow from day_value)::int in (5, 6)
        then coalesce(property_row.weekend_nightly_rate, property_row.base_nightly_rate, 0)
        else coalesce(property_row.base_nightly_rate, property_row.weekend_nightly_rate, 0)
      end
    )
  ), 0)
  into stay_subtotal
  from generate_series(
    request_row.check_in::timestamp,
    (request_row.check_out - 1)::timestamp,
    interval '1 day'
  ) as day_value
  left join public.nightly_rates nr
    on nr.property_id = request_row.property_id and nr.stay_date = day_value::date;

  cleaning := coalesce(property_row.cleaning_fee, 0);
  taxes := round((stay_subtotal + cleaning) * coalesce(property_row.tax_rate, 0), 2);
  stay_total := stay_subtotal + cleaning + taxes;

  insert into public.reservations (
    property_id, booking_request_id, check_in, check_out, guests,
    guest_name, guest_email, guest_phone, status, source,
    subtotal, cleaning_fee, tax_amount, total_amount, payment_status
  ) values (
    request_row.property_id, request_row.id, request_row.check_in, request_row.check_out,
    request_row.guests, request_row.full_name, request_row.email, request_row.phone,
    'hold', 'direct', stay_subtotal, cleaning, taxes, stay_total, 'pending'
  ) returning id, confirmation_code into reservation_id, code;

  insert into public.booking_calendar (property_id, stay_date, source, external_uid)
  select request_row.property_id, day::date, 'direct', reservation_id::text
  from generate_series(
    request_row.check_in::timestamp,
    (request_row.check_out - 1)::timestamp,
    interval '1 day'
  ) day;

  update public.booking_requests
  set status = 'approved', updated_at = now()
  where id = request_row.id;

  return code;
end;
$$;
revoke all on function public.approve_booking_request(uuid) from public, anon;
grant execute on function public.approve_booking_request(uuid) to authenticated;

-- A reservation UUID is the opaque guest access credential. Only non-sensitive fields are returned.
create or replace function public.get_guest_reservation(p_reservation_id uuid)
returns table (
  reservation_id uuid,
  confirmation_code text,
  property_name text,
  property_slug text,
  check_in date,
  check_out date,
  guests smallint,
  guest_name text,
  reservation_status text,
  payment_status text,
  subtotal numeric,
  cleaning_fee numeric,
  tax_amount numeric,
  total_amount numeric,
  created_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select
    r.id,
    r.confirmation_code,
    p.name,
    p.slug,
    r.check_in,
    r.check_out,
    r.guests,
    r.guest_name,
    r.status,
    r.payment_status,
    r.subtotal,
    r.cleaning_fee,
    r.tax_amount,
    r.total_amount,
    r.created_at
  from public.reservations r
  join public.properties p on p.id = r.property_id
  where r.id = p_reservation_id
    and r.source = 'direct'
  limit 1;
$$;
revoke all on function public.get_guest_reservation(uuid) from public;
grant execute on function public.get_guest_reservation(uuid) to anon, authenticated, service_role;


-- Public listing content contains no credentials. Existing admin RLS protects writes.
alter table public.properties add column if not exists content jsonb not null default '{}'::jsonb
  check (jsonb_typeof(content) = 'object' and octet_length(content::text) <= 200000);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('property-photos','property-photos',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "Owners upload property photos" on storage.objects for insert to authenticated
with check (bucket_id='property-photos' and (select booking_core.is_admin()));
create policy "Owners read property photos" on storage.objects for select to authenticated
using (bucket_id='property-photos' and (select booking_core.is_admin()));
-- Uploads use unique paths; replacing photos changes listing references, never overwrites a file.

-- Requests follow owner-maintained limits instead of hardcoded names/occupancy.
drop policy if exists "Guests can submit booking requests" on public.booking_requests;
create policy "Guests can submit booking requests" on public.booking_requests for insert to anon, authenticated
with check (status='new' and source='website' and check_in>=current_date and check_out<=current_date+365
  and exists(select 1 from public.properties p where p.id=booking_requests.property_id and p.slug=booking_requests.property_slug and p.active
    and p.name=booking_requests.property_name and guests between 1 and p.max_guests
    and check_out-check_in between p.min_nights and p.max_nights));

-- Each reservation has one reusable checkout attempt. Only trusted server calls can manage it.
create table public.reservation_payments (
  reservation_id uuid primary key references public.reservations(id),
  attempt_id uuid not null default gen_random_uuid(),
  session_id text unique,
  expires_at timestamptz not null default now()+interval '35 minutes',
  amount_cents bigint not null check(amount_cents>0),
  currency text not null check(currency='usd'),
  status text not null default 'pending' check(status in ('pending','paid','expired','failed')),
  payment_intent_id text,
  updated_at timestamptz not null default now()
);
alter table public.reservation_payments enable row level security;
revoke all on public.reservation_payments from anon,authenticated;
grant all on public.reservation_payments to service_role;

create function public.prepare_reservation_payment(p_reservation_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.reservations%rowtype; p public.properties%rowtype; a public.reservation_payments%rowtype;
begin
 select * into r from public.reservations where id=p_reservation_id for update;
 if r.id is null or r.source<>'direct' or r.status<>'hold' or r.payment_status not in ('pending','failed') or r.check_in<current_date then
   raise exception 'Reservation is not available for payment';
 end if;
 select * into p from public.properties where id=r.property_id and active;
 if p.id is null or p.currency<>'usd' or r.guests>p.max_guests or r.total_amount is null or r.total_amount<=0
   or r.subtotal is null or r.cleaning_fee is null or r.tax_amount is null
   or r.total_amount<>r.subtotal+r.cleaning_fee+r.tax_amount then raise exception 'Reservation quote is invalid'; end if;
 if (select count(*) from public.booking_calendar where property_id=r.property_id and source='direct'
     and external_uid=r.id::text and stay_date>=r.check_in and stay_date<r.check_out)<>r.check_out-r.check_in then
   raise exception 'Reservation dates are no longer held'; end if;
 select * into a from public.reservation_payments where reservation_id=r.id for update;
 if a.status='paid' then raise exception 'Reservation is already paid'; end if;
 if a.reservation_id is null then
   insert into public.reservation_payments(reservation_id,amount_cents,currency) values(r.id,round(r.total_amount*100),'usd') returning * into a;
 elsif a.status in ('expired','failed') then
   update public.reservation_payments set attempt_id=gen_random_uuid(),session_id=null,expires_at=now()+interval '35 minutes',
     amount_cents=round(r.total_amount*100),status='pending',updated_at=now() where reservation_id=r.id returning * into a;
 end if;
 if a.amount_cents<>round(r.total_amount*100) then raise exception 'Quote changed during checkout; contact host'; end if;
 return to_jsonb(a)||jsonb_build_object('property_name',p.name,'guest_email',r.guest_email,'confirmation_code',r.confirmation_code);
end; $$;
revoke all on function public.prepare_reservation_payment(uuid) from public,anon,authenticated;
grant execute on function public.prepare_reservation_payment(uuid) to service_role;

create function public.confirm_reservation_payment(p_reservation_id uuid,p_attempt_id uuid,p_session_id text,p_amount bigint,p_currency text,p_payment_intent text)
returns text language plpgsql security invoker set search_path='' as $$
declare r public.reservations%rowtype; a public.reservation_payments%rowtype;
begin
 select * into r from public.reservations where id=p_reservation_id for update;
 select * into a from public.reservation_payments where reservation_id=p_reservation_id for update;
 if a.reservation_id is null or a.attempt_id<>p_attempt_id or (a.session_id is not null and a.session_id<>p_session_id)
   or a.amount_cents<>p_amount or a.currency<>p_currency or round(r.total_amount*100)<>p_amount then
   raise exception 'Payment does not match reservation'; end if;
 if a.status='paid' then return 'already_confirmed'; end if;
 if r.status<>'hold' or r.payment_status not in ('pending','failed') then raise exception 'Reservation requires manual reconciliation'; end if;
 if (select count(*) from public.booking_calendar where property_id=r.property_id and source='direct'
   and external_uid=r.id::text and stay_date>=r.check_in and stay_date<r.check_out)<>r.check_out-r.check_in then raise exception 'Reservation dates require reconciliation'; end if;
 update public.reservation_payments set status='paid',session_id=p_session_id,payment_intent_id=p_payment_intent,updated_at=now() where reservation_id=r.id;
 update public.reservations set status='confirmed',payment_status='paid',updated_at=now() where id=r.id;
 return 'confirmed';
end; $$;
revoke all on function public.confirm_reservation_payment(uuid,uuid,text,bigint,text,text) from public,anon,authenticated;
grant execute on function public.confirm_reservation_payment(uuid,uuid,text,bigint,text,text) to service_role;

-- Do not release a hold or manually mark paid while Stripe can still collect payment.
create function booking_core.guard_checkout_reservation() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if coalesce(auth.role(),'')<>'service_role' and exists(select 1 from public.reservation_payments where reservation_id=old.id and status='pending')
   and (new.status is distinct from old.status or new.payment_status is distinct from old.payment_status
     or new.total_amount is distinct from old.total_amount or new.check_in is distinct from old.check_in or new.check_out is distinct from old.check_out) then
   raise exception 'A Stripe checkout is pending. Wait for payment or checkout expiry before changing this reservation.';
 end if;
 return new;
end; $$;
revoke all on function booking_core.guard_checkout_reservation() from public,anon,authenticated;
create trigger guard_checkout_reservation before update on public.reservations for each row execute function booking_core.guard_checkout_reservation();

-- Populate only missing rates from the existing committed direct-booking baseline.
update public.properties set base_nightly_rate=coalesce(base_nightly_rate,675),weekend_nightly_rate=coalesce(weekend_nightly_rate,775),cleaning_fee=coalesce(cleaning_fee,250),tax_rate=coalesce(tax_rate,0.12) where slug='chestnut-by-the-sea';
