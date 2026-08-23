create table public.booking_requests (
  id uuid primary key default gen_random_uuid(), property_slug text not null, property_name text not null,
  check_in date not null, check_out date not null, guests smallint not null, full_name text not null,
  email text not null, phone text not null, message text, status text not null default 'new',
  source text not null default 'website', created_at timestamptz not null default now(),
  constraint booking_requests_property_slug_format check (property_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint booking_requests_property_name_length check (char_length(property_name) between 2 and 120),
  constraint booking_requests_stay_dates check (check_out >= check_in + 5 and check_in >= current_date and check_out <= check_in + 60),
  constraint booking_requests_guest_count check (guests between 1 and 6),
  constraint booking_requests_full_name_length check (char_length(btrim(full_name)) between 2 and 100),
  constraint booking_requests_email_format check (char_length(email) <= 254 and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint booking_requests_phone_length check (char_length(phone) between 7 and 30),
  constraint booking_requests_message_length check (message is null or char_length(message) <= 1500),
  constraint booking_requests_status_values check (status in ('new', 'contacted', 'approved', 'declined', 'cancelled')),
  constraint booking_requests_source_values check (source in ('website', 'admin'))
);
comment on table public.booking_requests is 'Private booking inquiries submitted through the Pacific Stay website.';
create index booking_requests_created_at_idx on public.booking_requests (created_at desc);
create index booking_requests_property_dates_idx on public.booking_requests (property_slug, check_in, check_out);
create index booking_requests_status_idx on public.booking_requests (status);
alter table public.booking_requests enable row level security;
revoke all on table public.booking_requests from anon, authenticated;
grant insert on table public.booking_requests to anon, authenticated;
create policy "Guests can submit booking requests" on public.booking_requests for insert to anon, authenticated
with check (status = 'new' and source = 'website' and property_slug = 'chestnut-by-the-sea'
  and property_name = 'Chestnut By the Sea' and check_out >= check_in + 5 and check_in >= current_date
  and check_out <= check_in + 60 and guests between 1 and 6);
