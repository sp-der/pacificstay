# Pacific Stay Properties

Next.js website and direct-booking system for Pacific Stay Properties.

## Stack

- Next.js 15
- React 19
- TypeScript
- Supabase for booking data, authentication, reservations, and calendar state
- Vercel for hosting
- Resend for transactional reservation email delivery

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

## Main routes

- `/` - marketing site
- `/properties/chestnut-by-the-sea` - property detail page
- `/book/chestnut-by-the-sea` - direct booking request flow
- `/reservation/[id]` - guest reservation portal
- `/reservation/[id]/checkout` - payment handoff
- `/admin` - reservation operations dashboard

## Integrations

The codebase supports Supabase, Airbnb iCal synchronization, reservation calendar export, Resend email delivery, and a payment-provider checkout handoff. Integration credentials belong in deployment environment variables rather than source control.

## Repository hygiene

Generated Next.js output (`.next`), local environment files, Vercel metadata, logs, editor files, and local build artifacts are intentionally ignored and should not be committed.
