# Convivia24 — Experts in drinks (not a bottle shop)

Cocktail and spirits specialists shipping **alcohol and non-alcoholic ritual kits** for how you restore,
gather, and celebrate — plus **The Convivium** membership (monthly drops, permanent seat).
Lagos-first delivery. Age 18+.

My 24 / Companion remain in the repo as member tools (soft-parked from primary nav).

## Product surfaces

- **`/`** — Brand home: tonight’s rituals + Convivium
- **`/rituals`** — Catalog (mood + ABV track filters)
- **`/rituals/[slug]`** — Kit PDP (serve ritual, track swap, add to cart)
- **`/cart`** · **`/checkout`** — Lagos checkout (Paystack when configured; manual concierge fallback)
- **`/convivium`** — Membership tiers + waitlist
- Age gate on all public pages

## Tech Stack
- **Framework**: Next.js 16 (App Router) · **TypeScript** · **Tailwind** · Framer Motion
- **Database**: Neon Postgres (`@neondatabase/serverless`)
- **Auth**: Neon Auth (Better Auth) — used by My 24 / Companion
- **Payments**: Paystack (`PAYSTACK_SECRET_KEY`) via `/api/stripe/checkout` + webhook

## Getting Started

```bash
npm install
# set DATABASE_URL in .env / .env.local
npx tsx lib/db/migrate.ts
npm run dev
```

### Key environment variables
- `DATABASE_URL` — Neon Postgres (required for waitlist / orders)
- `PAYSTACK_SECRET_KEY` — optional; without it, checkout saves the order and uses concierge follow-up
- `NEXT_PUBLIC_APP_URL` — site origin for Paystack callback URLs
- `NEON_AUTH_*` / Azure OpenAI — only needed for My 24 / Companion

## Schema (commerce)

See `lib/db/schema.sql`:
- `waitlist`, `convivium_members`
- `ritual_orders`, `ritual_order_items`
- Plus existing calendar / companion tables

Ritual kit catalog is code-seeded in `lib/rituals/catalog.ts` (easy to edit; DB holds orders).

## Project structure (commerce)
- `lib/rituals/catalog.ts` — kits
- `components/rituals/*` · `components/AgeGate.tsx` · `components/cart/CartProvider.tsx`
- `app/api/orders` · `app/api/waitlist` · `app/api/stripe/checkout` · `app/api/stripe/webhook`
