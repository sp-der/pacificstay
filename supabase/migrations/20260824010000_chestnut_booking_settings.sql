update public.properties
set
  base_nightly_rate = 861,
  weekend_nightly_rate = 1488,
  cleaning_fee = 250,
  tax_rate = 0.12,
  updated_at = now()
where slug = 'chestnut-by-the-sea';

-- Limit public booking requests to the 12-month booking window provided by the host.
drop policy if exists "Guests can submit booking requests" on public.booking_requests;
create policy "Guests can submit booking requests" on public.booking_requests
for insert to anon, authenticated
with check (
  status = 'new'
  and source = 'website'
  and property_slug = 'chestnut-by-the-sea'
  and property_name = 'Chestnut By the Sea'
  and property_id = (select id from public.properties where slug = property_slug and active = true)
  and check_out >= check_in + 5
  and check_in >= current_date
  and check_in <= current_date + 365
  and check_out <= current_date + 365
  and check_out <= check_in + 60
  and guests between 1 and 6
);
