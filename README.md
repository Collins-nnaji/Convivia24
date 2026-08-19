# Convivia24 — Drinks to the party, club & lounge

Lagos drink ordering and delivery for **parties, clubs, and lounges**. Age 18+.

## Product surfaces

- **`/`** — Brand home (logo, shop)
- **`/shop`** · **`/shop/[slug]`** — Catalog + PDP (search, categories, party packs)
- **`/cart`** · **`/checkout`** — Address or venue delivery; Paystack when configured
- **`/venues`** — B2B inquire for clubs & lounges
- **`/admin`** — Stock desk, order fulfillment, events & trivia scheduling (password or Neon Auth allowlist)
- Age gate on public pages

My 24 / Companion remain soft-parked (out of primary nav). `/rituals` redirects to `/shop`.
`/circles` and `/crews` currently redirect to `/events` — the standalone Circles feed and Party Crews
shared-cart feature described in earlier drafts of this README were pulled from primary nav and are not
implemented (no `lib/circles` or `lib/crews` module exists). Treat any mention of them elsewhere as aspirational
until they're rebuilt.

## Tech stack

- Next.js 16 (App Router) · TypeScript · Tailwind · Framer Motion
- Neon Postgres · Neon Auth (member tools)
- Paystack via `/api/stripe/checkout` + webhook

## Getting started

```bash
npm install
# set DATABASE_URL in .env / .env.local
npx tsx lib/db/migrate.ts
npm run dev
```

### Env

- `DATABASE_URL` — Neon (waitlist / orders)
- `PAYSTACK_SECRET_KEY` — optional; without it, checkout uses concierge follow-up
- `NEXT_PUBLIC_APP_URL` — Paystack callback origin
- `RESEND_API_KEY` — enables transactional email (order received, paid, status updates, waitlist);
  without it, `lib/email/resend.ts` no-ops and checkout/orders still work normally
- `RESEND_FROM` — e.g. `"Convivia24 <orders@yourdomain.com>"`, required alongside `RESEND_API_KEY`
- `RESEND_API_URL` — optional, defaults to `https://api.resend.com`
- `ADMIN_NOTIFY_EMAIL` — optional; BCC'd on every "order received" email as an ops copy
- `ADMIN_PASSWORD` / `CONVIVIA_ADMIN_EMAILS` — admin desk access (shared password or a Neon Auth allowlist)

## Catalog & cart

- Seeded products: [`lib/drinks/catalog.ts`](lib/drinks/catalog.ts)
- Cart: [`components/cart/CartProvider.tsx`](components/cart/CartProvider.tsx)
- Order emails (Resend): [`lib/email/resend.ts`](lib/email/resend.ts), [`lib/email/templates.ts`](lib/email/templates.ts), wired via [`lib/commerce/notify.ts`](lib/commerce/notify.ts)

Brand logo: `/public/convivia24.png` (red→black wordmark). Accent: ember red `#E23B2F`.
