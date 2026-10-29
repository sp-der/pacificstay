# Pacific Stay booking routing and activation

Updated October 28, 2026. Repo \`sp-der/pacificstay\`, production \`www.pacificstayproperties.com\`.

## Property booking modes

| Property slug | Mode now | Switch condition |
| --- | --- | --- |
| \`beach-baby-oceanfront-escape\` | Hostaway embed + verified Hostaway listing link | Listing 591608 on published Hostaway Booking Website |
| \`chestnut-by-the-sea\` | Pacific Stay's existing Supabase-backed direct request/approval flow | Future: set \`NEXT_PUBLIC_HOSTAWAY_CHESTNUT_LISTING_ID\` only when Jami publishes that listing in Hostaway |
| \`casa-del-cactus\` | Airbnb link until native booking is safely enabled | See next section; future Hostaway migration uses \`NEXT_PUBLIC_HOSTAWAY_CASA_LISTING_ID\` |

Beach Baby's verified Hostaway Booking Website is **https://pacificstayproperties.holidayfuture.com/**. The previous code was missing the letter "i" (\`pacfic...\`), returning HTTP 404. The verified booking listing page at \`/listings/591608\` returns HTTP 200. The calendar widget uses the official Hostaway script and opens Hostaway checkout in a separate browser tab. If it does not render, guests can open the verified listing link. A working public listing page does not by itself prove a completed payment transaction.

## Casa Del Cactus: activation dependencies

This code prepares the same DirectBookingForm used by Chestnut. However, enabling it requires ALL conditions:

1. **Create a managed property:** Jami signs into the Pacific Stay owner dashboard and clicks **Import Casa Del Cactus** in **Your property** (already present from the listing import). Save and publish the managed listing. When the database is unavailable or the listing is not yet active, the existing fallback continues showing Casa on the website while directing guests to Airbnb.
2. **Set verified rates and rules:** Set actual nightly and weekend rates, cleaning fee, lodging taxes, minimum nights, maximum guests, house rules, and cancellation terms. No rates or taxes were inferred from Airbnb. The website won't accept Casa direct requests with a missing/zero nightly rate.
3. **Deploy the Supabase changes:** Apply migration \`supabase/migrations/20261029060000_casa_airbnb_calendar_source.sql\` to the **Pacific Stay** Supabase project (\`jujenvaofyrwbyunqtya\`) and deploy updated Edge Function \`supabase/functions/sync-airbnb-calendar\`. These are NOT deployed by a Vercel site build.
4. **Connect Casa's private Airbnb calendar:** From Jami's owner dashboard, open Casa > **Rates & booking limits**, paste the private Airbnb **iCal export** URL into **Private Airbnb iCal export URL**, and press **Connect & sync Casa calendar**. This writes the feed URL to the protected \`booking_core.integration_secrets\` store through an admin-only RPC; the URL is never saved to \`public.properties.content\`. The public Airbnb listing link will not work here. Only Jami should enter the private export URL, never paste it in chat/source control.
5. **Verify blocked dates:** Cross-check unavailable Airbnb dates against Pacific Stay's owner calendar and check House Rules, guest limits, and rates. Then check **Enable direct booking requests** on Casa and **Save changes**.
6. **Maintain sync freshness:** The public booking route requires the private calendar source to have synced successfully in the previous **72 hours**. The owner can select **Re-sync Casa calendar** at any time. If it expires or the backend is unavailable, bookings **fail closed** and Casa automatically directs guests back to Airbnb.

The server-only readiness check verifies the active managed record and positive nightly rate, the owner's explicit \`directBookingEnabled\` flag, and \`booking_core.calendar_sources.enabled\` plus \`last_synced_at\` from the protected server-only Supabase RPC. Client credentials never include \`SUPABASE_SERVICE_ROLE_KEY\`.

**Important:** Until the migration and Edge Function are deployed and a real iCal feed is connected, the Casa booking engine is prepared but NOT activated. Don't claim its calendar or checkout has been verified. Native direct requests are reviewed by Jami and not automatically confirmed; no unconfigured Stripe payment is charged.

## Future Hostaway migration

After Jami has added and published Chestnut and Casa on the **same** Hostaway Booking Website and tested their listing pages and checkout, add their real listing IDs as Vercel environment variables:

- \`NEXT_PUBLIC_HOSTAWAY_CHESTNUT_LISTING_ID\`
- \`NEXT_PUBLIC_HOSTAWAY_CASA_LISTING_ID\`

Then redeploy. Both properties will route to the same Hostaway calendar component and Hostaway checkout; no new booking UI is necessary. Do not assign invented listing IDs or enable Hostaway paths before publication is verified.

## Verification

- GitHub Actions runs \`npm test\`, covering existing payment behavior and booking routing/readiness.
- Vercel preview should render Beach Baby's widget and correct fallback, Chestnut's native booking page, and Casa's protected fallback until activated.
- The production deployment must be confirmed READY with the intended commit and the actual public routes checked.
- External payment checkout is only considered verified after Jami tests a date selection and hosted checkout; no live charge is performed by automated tests.
