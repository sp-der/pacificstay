# Jami’s Pacific Stay dashboard

Dashboard: https://pacificstay.vercel.app/admin

## Login
Your website manager must first provision your approved owner email. There is no public owner signup. Once your account is ready, use your email and password at the dashboard. “Forgot password?” sends a reset link to that address. Use a unique password of at least 12 characters. Passwords are never included in this guide.

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
2. Start in a Stripe sandbox/test mode. In **Developers → API keys**, copy the secret API key. In Vercel → **pacificstay → Settings → Environment Variables**, add it as **STRIPE_SECRET_KEY**. It must never start with `NEXT_PUBLIC_`. Keep test and live keys in separate deployment environments.
3. In Stripe **Workbench → Webhooks**, add an event destination for your account pointing to **https://pacificstay.vercel.app/api/payments/webhook** (use the preview deployment URL for a preview test). Select `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`. Copy that destination’s signing secret into Vercel as **STRIPE_WEBHOOK_SECRET**.
4. Your website manager must configure the server-only **SUPABASE_SERVICE_ROLE_KEY** and set **NEXT_PUBLIC_SITE_URL** to the exact deployment origin, currently **https://pacificstay.vercel.app**. You do not need Supabase credentials from Stripe. Do not create Stripe Products or Payment Links; the server uses approved reservation totals.
5. Redeploy after changing environment variables. Complete an approved test booking in test mode, confirm the webhook delivery returns HTTP 200, and check that the reservation becomes **Paid / Confirmed**. A cancelled checkout must remain unpaid. Do not use real cards in test mode.
6. When the test passes, repeat steps 2–3 in Stripe live mode, select Vercel’s **Production** environment for both live secrets, and redeploy. Live and test signing secrets are different. Do not mix them.

## Leave these with your website manager
Do not change Supabase keys, account roles, database rules, hosting/deployment configuration, webhook URL/events, or secret-variable names during routine site editing. Change taxes only after confirming the correct rate. Listing text is public: never enter door codes, passwords, guest data, or payment keys in property content.

## Activation status
The owner sign-in email still needs to be confirmed and provisioned. Stripe credentials and a live end-to-end Stripe transaction have not been supplied or completed. Hosting environment access must be arranged before the Stripe steps can be completed.

## Website manager: provision the owner
Confirm Jami’s preferred sign-in email directly with her. In the existing Supabase project, **Authentication → Users → Invite user**, use that exact email and the `/admin` redirect. After verifying that the created user is Jami, grant the existing `admin` role in **app metadata**, not user metadata. Do not grant roles from a public signup form. Preserve the existing OTR admin account. Ensure the Supabase redirect allowlist includes `https://pacificstay.vercel.app/admin` so invite and password-reset links return here. Jami must choose her own password from the invitation.
