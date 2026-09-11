# Owner dashboard / Stripe verification

- Production build passes. Only `/`, `/admin`, and not-found remain in the prerender manifest; managed property pages read the database per request.
- HTTP 200: admin sign-in, property detail, photo tour, booking request page, public property API, and cancelled-checkout page.
- `tests/owner-payment.sql`: transaction rollback tests cover admin content writes, public content reads, unauthorized-write denial, payment-table isolation, amount validation, stable attempts, idempotent confirmation, and paid-reservation rejection. No fixture property or reservation remains.
- `node tests/payment-routes.cjs`: real Stripe signature generation/verification against fixture payloads, tamper rejection, expiration handling, origin and reservation-ID validation, server-derived amount, idempotency key, success/cancel redirects, and unavailable-configuration handling. Stripe network calls are mocked.
- New server payment modules use `server-only`; Stripe keys have no public prefix and no browser storage or content-table storage.
- Security advisor: the payment table intentionally has no client policies; service-role access only. The existing UUID guest-portal function deliberately exposes limited reservation details by opaque link. No new anonymous payment-confirmation function is permitted.
- Live owner login, password recovery, and image upload were not completed. Automatic approval review rejected the synthetic privileged production account / content mutation / upload test. The temporary account was removed; inspection found no test upload and listing content stayed unchanged.
- A real Stripe sandbox payment, real webhook delivery, and live activation need Jami’s Stripe configuration. No claim of live payment success is made.
- Jami’s email must be confirmed before her account can be provisioned. The existing OTR admin is retained.
