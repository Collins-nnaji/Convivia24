# Convivia24 — Drinks to the party, club & lounge

Lagos drink ordering and delivery for **parties, clubs, and lounges**. Age 18+.

## Product surfaces

- **`/`** — Brand home (logo, shop)
- **`/shop`** · **`/shop/[slug]`** — Catalog + PDP (search, categories, party packs)
- **`/cart`** · **`/checkout`** — Address or venue delivery, gift-card codes, Flutterwave when configured
- **`/orders`** — Order history with a live fulfillment tracker (rider/ETA) and real loyalty tier standing
- **`/events`** — Nights, venues, and Circles (follow community rooms) as tabs on one page
- **`/venues`** — B2B inquire for clubs & lounges
- **`/partners`** · **`/partners/portal`** — Outlet sign-up + desk (margin pricing, Premium points, wholesale
  restocking, perk → gift-card conversion). Requires the same Neon Auth sign-in customers use — no more
  anonymous/localStorage partner state
- **`/admin`** — Stock desk, order fulfillment + delivery tracking + refunds, gift card issuance, events &
  trivia scheduling (signed admin session, or Neon Auth allowlist)
- **`/age-check`** — Server-enforced 18+ gate (see `proxy.ts`); a request without a valid signed cookie never
  reaches a gated page at all

My 24 remains soft-parked (out of primary nav). `/rituals` redirects to `/shop`.

## Tech stack

- Next.js 16 (App Router) · TypeScript · Tailwind · Framer Motion
- Neon Postgres · Neon Auth (member tools)
- Flutterwave via `/api/stripe/checkout` + webhook

## Getting started

```bash
npm install
# set DATABASE_URL in .env / .env.local
npx tsx lib/db/migrate.ts
npm run dev
```

### Env

- `DATABASE_URL` — Neon (waitlist / orders)
- `FLUTTERWAVE_SECRET_KEY` — optional; without it, checkout uses concierge follow-up
- `FLUTTERWAVE_SECRET_HASH` — webhook `verif-hash` from the Flutterwave dashboard
- `NEXT_PUBLIC_APP_URL` — Flutterwave redirect origin
- `RESEND_API_KEY` — enables transactional email (order received, paid, status updates, waitlist);
  without it, `lib/email/resend.ts` no-ops and checkout/orders still work normally
- `RESEND_FROM` — e.g. `"Convivia24 <orders@yourdomain.com>"`, required alongside `RESEND_API_KEY`
- `RESEND_API_URL` — optional, defaults to `https://api.resend.com`
- `ADMIN_NOTIFY_EMAIL` — optional; comma-separated list BCC'd on every "order received" email as an ops copy
- `ADMIN_PASSWORD` / `CONVIVIA_ADMIN_EMAILS` — admin desk access (shared password or a Neon Auth allowlist)
- `TERMII_API_KEY` — enables SMS (and WhatsApp, via `TERMII_CHANNEL=whatsapp`) order/delivery updates;
  without it, `lib/notify/termii.ts` no-ops the same way Resend does
- `TERMII_SENDER_ID` — optional, your registered Termii sender ID; falls back to Termii's shared "N-Alert" ID
- `TERMII_API_URL` — optional, defaults to `https://api.ng.termii.com/api`
- `NEON_AUTH_COOKIE_SECRET` — signs the age-gate cookie (`lib/age-gate.ts`) in addition to Neon Auth's own
  session; without it, age-gate signing falls back to a fixed non-secret string (fine for local dev, not prod)

## Catalog & cart

- Seeded products: [`lib/drinks/catalog.ts`](lib/drinks/catalog.ts)
- Cart: [`components/cart/CartProvider.tsx`](components/cart/CartProvider.tsx) — `localStorage` for guests,
  synced to Postgres (`carts` table, `/api/cart`) once signed in
- Inventory reservation: [`lib/inventory.ts`](lib/inventory.ts) reserves stock on order creation and releases
  or consumes it as the order moves through cancel/refund/delivered
- Gift cards: [`lib/commerce/gift-cards.ts`](lib/commerce/gift-cards.ts), DB-backed, issued from `/admin`
- Order emails (Resend): [`lib/email/resend.ts`](lib/email/resend.ts), [`lib/email/templates.ts`](lib/email/templates.ts), wired via [`lib/commerce/notify.ts`](lib/commerce/notify.ts)
- Order SMS/WhatsApp (Termii): [`lib/notify/termii.ts`](lib/notify/termii.ts), same `notify.ts` call sites as email

## Testing & CI

```bash
npm test          # vitest — pure logic: loyalty tiers, order statuses, catalog, age-gate signing
npx tsc --noEmit  # typecheck
```

`.github/workflows/ci.yml` runs install → typecheck → test → build on every push/PR.

## Mobile

`android/`/`ios/` are real Capacitor projects (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`, see
`capacitor.config.ts`). This is a full Next.js SSR app — API routes, `proxy.ts`, cookie-based auth/age-gate —
so it can't be statically exported into the native bundle the way a static site can. Instead the native shell
wraps the **live deployed site**: the WebView loads `NEXT_PUBLIC_APP_URL` directly (`server.url` mode), so every
request still runs through the real Next.js server and native Capacitor plugins (push, share, haptics) are
still available on top of it.

```bash
# set NEXT_PUBLIC_APP_URL to your real deployed origin first
npm run cap:sync     # copy web config + sync native plugins
npm run cap:android  # opens the project in Android Studio
npm run cap:ios      # opens the project in Xcode
```

Building an installable app/IPA and publishing to the Play Store / App Store needs your own developer accounts
— not something this repo can do for you. App icon/splash screen are still Capacitor's defaults; generate real
ones with `npx @capacitor/assets generate` once brand assets in the right (square) proportions exist — the
current `/public/convivia24.png` is a wide wordmark, not an icon shape.

Brand logo: `/public/convivia24.png` (red→black wordmark). Accent: ember red `#E23B2F`.
