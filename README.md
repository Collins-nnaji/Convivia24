# Convivia24 — Drinks to the party, club & lounge

Lagos drink ordering and delivery for **parties, clubs, and lounges** — plus **Circles** (outdoor / like-minded crews) and **Party Crews** (shared group orders). Age 18+.

## Product surfaces

- **`/`** — Brand home (logo, shop + start a crew)
- **`/shop`** · **`/shop/[slug]`** — Catalog + PDP (search, categories, party packs)
- **`/cart`** · **`/checkout`** — Address or venue delivery; Paystack when configured
- **`/circles`** — Community feed (join / like, vibe tags)
- **`/crews`** · **`/crews/[id]`** — Shared cart, invite link, equal-split hint
- **`/venues`** — B2B inquire for clubs & lounges
- Age gate on public pages

My 24 / Companion remain soft-parked (out of primary nav). `/rituals` redirects to `/shop`.

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

## Catalog & cart

- Seeded products: [`lib/drinks/catalog.ts`](lib/drinks/catalog.ts)
- Cart: [`components/cart/CartProvider.tsx`](components/cart/CartProvider.tsx)
- Circles seeds: [`lib/circles/seeds.ts`](lib/circles/seeds.ts)
- Party Crews (localStorage): [`lib/crews/store.ts`](lib/crews/store.ts)

Brand logo: `/public/convivia24.png` (red→black wordmark). Accent: ember red `#E23B2F`.
