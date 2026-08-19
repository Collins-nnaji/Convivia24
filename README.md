# Convivia24 — Drinks to the party, club & lounge

Lagos drink ordering and delivery for **parties, clubs, and lounges**. Age 18+.

## Product surfaces

- **`/`** — Brand home (logo, shop)
- **`/shop`** · **`/shop/[slug]`** — Catalog + PDP (search, categories, party packs); a Companion CTA sits above
  the search bar
- **`/cart`** · **`/checkout`** — Address or venue delivery, gift-card codes, Paystack when configured
- **`/orders`** — Order history with a live fulfillment tracker (rider/ETA) and real loyalty tier standing
- **`/crews`** · **`/crews/[id]`** — Party Crews: start a crew, share the invite link, everyone adds to one
  shared cart, one member checks out for the group
- **`/circles`** — Vibe-tagged interest groups (join/leave), DB-backed
- **`/companion`** — AI night-planning chat, now in primary nav
- **`/venues`** — B2B inquire for clubs & lounges
- **`/admin`** — Stock desk, order fulfillment + delivery tracking + refunds, gift card issuance, events &
  trivia scheduling (signed admin session, or Neon Auth allowlist)
- **`/age-check`** — Server-enforced 18+ gate (see `proxy.ts`); a request without a valid signed cookie never
  reaches a gated page at all

My 24 remains soft-parked (out of primary nav). `/rituals` redirects to `/shop`.

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
- Cart: [`components/cart/CartProvider.tsx`](components/cart/CartProvider.tsx) — `localStorage` for guests,
  synced to Postgres (`carts` table, `/api/cart`) once signed in
- Inventory reservation: [`lib/inventory.ts`](lib/inventory.ts) reserves stock on order creation and releases
  or consumes it as the order moves through cancel/refund/delivered
- Gift cards: [`lib/commerce/gift-cards.ts`](lib/commerce/gift-cards.ts), DB-backed, issued from `/admin`
- Order emails (Resend): [`lib/email/resend.ts`](lib/email/resend.ts), [`lib/email/templates.ts`](lib/email/templates.ts), wired via [`lib/commerce/notify.ts`](lib/commerce/notify.ts)

## Testing & CI

```bash
npm test          # vitest — pure logic: loyalty tiers, order statuses, catalog, age-gate signing
npx tsc --noEmit  # typecheck
```

`.github/workflows/ci.yml` runs install → typecheck → test → build on every push/PR.

## Mobile

No native wrapper right now — the `android/`/`ios/` directories were unconfigured, dependency-less Capacitor
scaffolding with no custom code, so they were removed. Regenerate with `npx cap add android` / `npx cap add ios`
if a native shell is picked up again.

Brand logo: `/public/convivia24.png` (red→black wordmark). Accent: ember red `#E23B2F`.
