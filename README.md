# Pacific Stay Properties

Next.js website and direct-booking system for Pacific Stay Properties.

## Stack

- Next.js 15
- React 19
- TypeScript
- Supabase for booking data, authentication, reservations, property content, photos, and calendar state
- Stripe Checkout for direct-booking payments
- Resend for transactional reservation email delivery
- Vercel for hosting

## Local development

```bash
npm install
npm run dev
```

Create a local `.env.local` from `.env.example` and provide the required environment values. Never commit real credentials.

## Production build

```bash
npm run build
npm start
```

`npm run build` performs the production compilation and TypeScript validation used by Vercel.

## Tests

```bash
npm test
```

The payment route test suite mocks Stripe network activity and checks webhook signatures, tamper resistance, server-derived totals, idempotency, redirect handling, and missing-configuration behavior.

## Main routes

- `/` - marketing site
- `/properties/chestnut-by-the-sea` - property detail page
- `/book/chestnut-by-the-sea` - direct booking request flow
- `/reservation/[id]` - guest reservation portal
- `/reservation/[id]/checkout` - Stripe payment handoff
- `/admin` - owner property and reservation dashboard

## Integrations

- **Supabase** handles authentication, content, reservations, availability, and private integration storage.
- **Airbnb iCal** is synchronized through the authenticated Supabase edge function. The private feed URL is stored server-side in the Supabase private integration store.
- **Stripe Checkout** handles direct-booking payment sessions and signed webhook events.
- **Resend** handles reservation email delivery.

Deployment credentials belong in secure hosting or backend configuration, never source control.

## Repository hygiene

Generated Next.js output (`.next`), local environment files, Vercel metadata, logs, editor files, and local build artifacts are intentionally ignored and should not be committed. Homepage animation is implemented as progressive enhancement and respects `prefers-reduced-motion`.
