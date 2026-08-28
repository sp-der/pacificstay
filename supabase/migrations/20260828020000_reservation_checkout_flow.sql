-- Post-approval reservation flow for Pacific Stay direct bookings.
-- Keeps approved dates blocked, stores the final direct quote, exposes a limited guest portal view,
-- and leaves payment/email provider delivery ready for Helcim + Resend integration.

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

-- Existing test/future direct reservations can move into the new payment pipeline without altering calendar blocks.
update public.reservations
set payment_status = 'pending', status = 'hold', updated_at = now()
where source = 'direct'
  and payment_status = 'not_required'
  and status = 'confirmed'
  and check_in >= current_date;
