-- Transactional integration checks; all fixture data is rolled back.
begin;
insert into public.properties(id,slug,name,max_guests,min_nights,max_nights,base_nightly_rate,weekend_nightly_rate,cleaning_fee,tax_rate)
values('00000000-0000-4000-a000-000000009911','owner-check-9911','Owner Test',6,1,60,100,100,20,0.1);
set local role authenticated;
select set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{"role":"admin"}}',true);
update public.properties set content='{"summary":"Owner persisted text"}' where id='00000000-0000-4000-a000-000000009911';
do $$ begin
 if not exists(select 1 from public.properties where id='00000000-0000-4000-a000-000000009911' and content->>'summary'='Owner persisted text') then raise exception 'Owner save failed';end if;
end $$;
select set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{}}',true);
do $$ declare n integer; begin
 update public.properties set name='Unauthorized' where id='00000000-0000-4000-a000-000000009911';get diagnostics n=row_count;
 if n<>0 then raise exception 'Unauthorized edit succeeded';end if;
 if has_function_privilege('authenticated','public.confirm_reservation_payment(uuid,uuid,text,bigint,text,text)','execute') then raise exception 'Public confirmation allowed';end if;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
 if not exists(select 1 from public.properties where id='00000000-0000-4000-a000-000000009911' and content->>'summary'='Owner persisted text') then raise exception 'Public content read failed';end if;
 if has_table_privilege('anon','public.reservation_payments','select') then raise exception 'Payment table publicly readable';end if;
end $$;
reset role;
insert into public.reservations(id,property_id,check_in,check_out,guests,guest_name,guest_email,status,source,subtotal,cleaning_fee,tax_amount,total_amount,payment_status)
values('00000000-0000-4000-a000-000000009912','00000000-0000-4000-a000-000000009911','2040-01-01','2040-01-03',2,'Checkout Test','checkout@example.invalid','hold','direct',200,20,22,242,'pending');
insert into public.booking_calendar(property_id,stay_date,source,external_uid)
select '00000000-0000-4000-a000-000000009911',d::date,'direct','00000000-0000-4000-a000-000000009912' from generate_series('2040-01-01'::timestamp,'2040-01-02','1 day')d;
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
do $$ declare a jsonb;b jsonb;result text; begin
 a:=public.prepare_reservation_payment('00000000-0000-4000-a000-000000009912');
 b:=public.prepare_reservation_payment('00000000-0000-4000-a000-000000009912');
 if a->>'attempt_id'<>b->>'attempt_id' or (a->>'amount_cents')::int<>24200 then raise exception 'Idempotency or amount failed';end if;
 begin
  perform public.confirm_reservation_payment('00000000-0000-4000-a000-000000009912',(a->>'attempt_id')::uuid,'cs_test',1,'usd','pi_test');
  raise exception 'Tampered amount accepted';
 exception when others then if sqlerrm='Tampered amount accepted' then raise;end if;end;
 result:=public.confirm_reservation_payment('00000000-0000-4000-a000-000000009912',(a->>'attempt_id')::uuid,'cs_test',24200,'usd','pi_test');
 if result<>'confirmed' then raise exception 'Confirmation failed';end if;
 result:=public.confirm_reservation_payment('00000000-0000-4000-a000-000000009912',(a->>'attempt_id')::uuid,'cs_test',24200,'usd','pi_test');
 if result<>'already_confirmed' then raise exception 'Duplicate confirmation failed';end if;
 if not exists(select 1 from public.reservations where id='00000000-0000-4000-a000-000000009912' and status='confirmed' and payment_status='paid')then raise exception 'Payment state not persisted';end if;
 begin
  perform public.prepare_reservation_payment('00000000-0000-4000-a000-000000009912');raise exception 'Paid checkout accepted';
 exception when others then if sqlerrm='Paid checkout accepted' then raise;end if;end;
end $$;
rollback;
