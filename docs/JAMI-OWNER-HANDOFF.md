# Jami’s Pacific Stay dashboard

Dashboard: https://www.pacificstayproperties.com/admin

## Login
Approved owner email: **info@pacificstayproperties.com**. There is no public owner signup. Once the Supabase Auth user is created, use that email and the owner password at the dashboard. “Forgot password?” sends a reset link to the approved address. Use a unique password of at least 12 characters. Passwords are never included in this guide.

## Maintain your property
In **Your property**, choose the listing and open the section you need:
- **Property information & descriptions:** name, descriptions, arrival times, house rules, cancellation policy, occupancy details, and neighborhood information. Lists use one item per line.
- **Rates & booking limits:** default and Friday/Saturday nightly rates, cleaning fee, tax percentage, minimum/maximum nights, maximum guests. Approved reservation totals remain unchanged.
- **Amenities & sleeping arrangements:** amenity groups and room/bed descriptions.
- **Property photos:** add JPG, PNG, or WebP images under 10 MB to the appropriate room. Choose a cover and preview images, move images earlier, or remove them from the listing. Choose another cover before removing the current cover.

Click **Save changes**, wait for “Saved,” then **View public listing**. Saving publishes the changes immediately; no code deployment is needed. Uploading alone does not publish a photo. Avoid editing the same listing in two tabs at once.

The booking panels let you review requests, approve stays, block unavailable nights, and set rates for individual dates. Stripe confirms online payments automatically. Use “Mark paid & confirm” only for a payment you independently received outside Stripe. Cancellation does not issue a refund; issue any required refund in your own Stripe dashboard. A pending Stripe checkout temporarily prevents cancellation until it expires or payment completes.

## Activate Stripe yourself
You keep ownership of your Stripe account. No Stripe password or Administrator invitation is required for your website manager.

**Prerequisite:** you need authorized access to the Pacific Stay Vercel project’s environment settings. The website manager must arrange that access first; the website dashboard cannot grant it. Do not send keys by email or paste them into the website editor.

1. In your own Stripe Dashboard, complete business verification and payout-bank setup.
2. Start in a Stripe sandbox/test mode. In **Developers → API keys**, copy the secret API key. In Vercel → **pacificstay-6zc9 → Settings → Environment Variables**, add it as **STRIPE_SECRET_KEY**. It must never start with `NEXT_PUBLIC_`. Keep test and live keys in separate deployment environments.
3. In Stripe **Workbench → Webhooks**, add an event destination for your account pointing to **https://www.pacificstayproperties.com/api/payments/webhook**. Select `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`. Copy that destination’s signing secret into Vercel as **STRIPE_WEBHOOK_SECRET**.
4. Your website manager must configure the server-only **SUPABASE_SERVICE_ROLE_KEY** and set **NEXT_PUBLIC_SITE_URL** to **https://www.pacificstayproperties.com**. You do not need Supabase credentials from Stripe. Do not create Stripe Products or Payment Links; the server uses approved reservation totals.
5. Redeploy after changing environment variables. Complete an approved test booking in test mode, confirm the webhook delivery returns HTTP 200, and check that the reservation becomes **Paid / Confirmed**. A cancelled checkout must remain unpaid. Do not use real cards in test mode.
6. When the test passes, repeat steps 2–3 in Stripe live mode, select Vercel’s **Production** environment for both live secrets, and redeploy. Live and test signing secrets are different. Do not mix them.

## Leave these with your website manager
Do not change Supabase keys, account roles, database rules, hosting/deployment configuration, webhook URL/events, or secret-variable names during routine site editing. Change taxes only after confirming the correct rate. Listing text is public: never enter door codes, passwords, guest data, or payment keys in property content.

## Activation status
The public custom domain is **pacificstayproperties.com** and currently redirects to the canonical production host **https://www.pacificstayproperties.com**. Jami’s owner email is approved in the database admin-auth rule while the existing OTR admin remains approved. The final Supabase Auth user/password record still must be created through the supported Auth user-management flow. Stripe credentials and a live end-to-end Stripe transaction have not been supplied or completed.

## Website manager: provision the owner
In the existing Supabase project, open **Authentication → Users → Add user** for **info@pacificstayproperties.com**. The database trigger automatically grants this approved address the existing `admin` app-metadata role while preserving the OTR admin account. Do not grant roles from a public signup form. Ensure the Supabase redirect allowlist includes **https://www.pacificstayproperties.com/admin** so password-reset links return to the production owner dashboard.
