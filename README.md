# Convivia24 — Gather. Order. Split.

Know what dinner costs before you go.

Convivia24 is where a table plans a meal out and sees the split in the same place.
Pick a venue, pull up its **real menu with real prices**, build the order together, and
watch each person's share settle as it grows. Shared plates divide only across the people
actually eating them; service charge and VAT ride along on each individual share.

**No money moves through the platform.** It is not a wallet, an escrow, or a payment app —
you still settle at the till. What it removes is the arithmetic, the awkwardness, and the
surprise at the end of the night.

## The product

- **Places** (`/places`) — every venue and its full menu, searchable by dish, area or price
  band, with a typical all-in spend per head.
- **Meetups** (`/meetups`) — the plans you have going, each showing the running bill and
  what an even split would come to.
- **Building an order** (`/meetups/[id]`) — the menu and the split side by side. Pick who
  you are ordering for (one person, a few, or the whole table), tap anything on the menu,
  and every share updates live.
- **Budgets** — anyone can say up front what they are willing to spend. Go past it and
  Convivia24 flags it while there is still time to change the order.

## How the maths works

`lib/split/compute.ts` is pure and self-contained:

- Every order line belongs to one or more people; the line total divides evenly among them.
- Each person's subtotal is the sum of their shares.
- Service charge is a percentage of *their* subtotal; VAT applies to subtotal + service
  (as it does in Nigeria); an optional tip is a percentage of subtotal.
- Removing someone strips them from every line they were carrying, and a line left with no
  payers falls back to the whole table.

Venues and menus live in `lib/dining/venues.ts`. Meetups are stored in `localStorage`
(`lib/meetup/store.ts`) — there is no account or server round-trip yet, so swapping the
four `read`/`write` calls in that module for API routes is all that stands between this and
shared, multi-device meetups.

## Archived: the Resort, Spa & Lounge site

The previous hospitality site (`/stays`, `/convivium`, `/my24`, `/companion`, `/inquire`,
`/invite/[token]`) is preserved intact under `app/(public)/_archive/`. The leading
underscore makes it a Next.js private folder, so nothing there is routable — but the code,
its API routes, and its `lib/` and `components/` modules are all untouched and still
type-checked. See `app/(public)/_archive/README.md` to bring any of it back.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React · **Animations**: Framer Motion
- **Database**: Neon Postgres (`@neondatabase/serverless`)
- **AI**: Azure OpenAI (chat completions)
- **Auth**: Neon Auth (Better Auth) + Google sign-in

## Getting Started

```bash
npm install
# set DATABASE_URL (Neon), Neon Auth vars, and Azure OpenAI vars in .env.local
npx tsx lib/db/migrate.ts   # creates the schema
npm run dev
```

### Key environment variables
- `DATABASE_URL` — Neon Postgres connection string (required)
- `NEON_AUTH_BASE_URL` — Neon Auth (Better Auth) server URL (required for sign-in)
- `NEXT_PUBLIC_NEON_AUTH_BASE_URL` — public auth base; set to `/api/auth` (the same-origin proxy)
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_CHAT_DEPLOYMENT` — enable the
  Companion and Destress my day
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — optional rate limiting (`lib/redis`)

## Authentication (Neon Auth + Google)

Sign-in uses **Neon Auth** (powered by Better Auth), proxied same-origin through
`/api/auth/*` so session cookies are first-party. Its tables live in the `neon_auth`
schema of the same database.

- `app/api/auth/[...path]/route.ts` — transparent reverse proxy to `NEON_AUTH_BASE_URL`
  (forwards cookies, re-issues `Set-Cookie` first-party).
- `app/api/auth/me/route.ts` — server-validated current user (`/get-session`).
- `lib/auth/session.ts` — `getCurrentUser()` for server/API gating.
- `components/auth/AuthProvider.tsx` — `useUser()` hook; `lib/auth/client.ts` — Google
  sign-in / sign-out.

Auth is wired up and `/signin` is live, but the meetup flow does not require an account —
meetups are local to the device until sharing lands.

**Neon Auth dashboard setup (once):**
1. Enable the **Google** social provider.
2. Set the project's app URL / trusted origin to your deployed domain (`NEXT_PUBLIC_APP_URL`)
   so OAuth redirect URIs and cookies resolve to your domain.
3. Add the Google OAuth redirect URI for your domain as instructed by Neon Auth.

> The live OAuth round-trip can only be verified from a deployed environment that can reach
> the Neon Auth host; it is network-blocked in CI sandboxes.

## Project Structure
- `/app/(public)` — `/`, `/places`, `/places/[slug]`, `/meetups`, `/meetups/new`,
  `/meetups/[id]`, `/signin`
- `/app/(public)/_archive` — the archived resort site (not routable)
- `/lib/dining/venues.ts` — venues, menus, prices, service and VAT rates
- `/lib/split/compute.ts` — the bill maths (pure, no I/O)
- `/lib/meetup/store.ts` — meetup persistence and React binding
- `/components/meetup` — `MenuPicker`, `OrderList`, `SplitTable`, `VenueCard`, `PersonChip`
- `/app/api/*`, `/lib/calendar`, `/lib/companion`, `/lib/db` — kept for the archived pages

## Branding
- **Obsidian**: `#0a0a0a` · **Gold**: `#c9a84c` · **Cream**: `#f5f0e8`
- Display serif: Cormorant Garamond · Sans: Outfit
