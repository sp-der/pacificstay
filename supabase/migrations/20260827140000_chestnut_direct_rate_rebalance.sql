-- Rebalance Chestnut By the Sea direct-booking baseline to target roughly a 5% advantage
-- versus the comparable Airbnb all-in total used for validation on 2026-08-28 through 2026-09-04.
update public.properties
set
  base_nightly_rate = 675,
  weekend_nightly_rate = 775,
  cleaning_fee = 250,
  tax_rate = 0.12,
  updated_at = now()
where slug = 'chestnut-by-the-sea';
