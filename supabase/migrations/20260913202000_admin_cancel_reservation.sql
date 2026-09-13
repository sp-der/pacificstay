create or replace function public.get_reservation_cancellation_state(p_reservation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reservations%rowtype;
  p public.reservation_payments%rowtype;
begin
  if not booking_core.is_admin() then raise exception 'Administrator access required'; end if;
  select * into r from public.reservations where id = p_reservation_id;
  if r.id is null then raise exception 'Reservation not found'; end if;
  select * into p from public.reservation_payments where reservation_id = r.id;
  return jsonb_build_object(
    'reservation_id', r.id,
    'status', r.status,
    'payment_status', r.payment_status,
    'booking_request_id', r.booking_request_id,
    'payment_attempt_status', p.status,
    'stripe_session_id', p.session_id
  );
end;
$$;
revoke all on function public.get_reservation_cancellation_state(uuid) from public, anon;
grant execute on function public.get_reservation_cancellation_state(uuid) to authenticated;

create or replace function public.cancel_reservation(p_reservation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reservations%rowtype;
begin
  if not booking_core.is_admin() then raise exception 'Administrator access required'; end if;
  select * into r from public.reservations where id = p_reservation_id for update;
  if r.id is null then raise exception 'Reservation not found'; end if;
  if r.status = 'cancelled' then return true; end if;
  if r.status = 'completed' then raise exception 'Completed stays cannot be cancelled from the dashboard'; end if;

  update public.reservation_payments
  set status = 'expired', updated_at = now()
  where reservation_id = r.id and status = 'pending';

  delete from public.booking_calendar
  where property_id = r.property_id and source = 'direct' and external_uid = r.id::text;

  update public.reservations
  set status = 'cancelled', updated_at = now()
  where id = r.id;

  if r.booking_request_id is not null then
    update public.booking_requests
    set status = 'cancelled', updated_at = now()
    where id = r.booking_request_id;
  end if;

  return true;
end;
$$;
revoke all on function public.cancel_reservation(uuid) from public, anon;
grant execute on function public.cancel_reservation(uuid) to authenticated;
