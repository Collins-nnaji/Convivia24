# Convivia24 — Gather. Share. Remember.

An app for eating and drinking with people.

Convivia24 is about the table, not the bill. Find a gathering with a seat spare, keep what
happens there in photos, and let the arithmetic run quietly underneath — everyone knows
their number before the food arrives, and nobody does maths at the end of a good evening.

**No money moves through the platform.** It is not a wallet, an escrow, or a payment app —
you settle at the till. Working out who owes what is a chore the app removes, not the
reason it exists.

## The three things it does

**1. Find a table** — `/discover`
Open tables are gatherings someone is hosting with room left: a stated vibe, a place, a
time, who is already going, and an honest number for the evening. Some are old friends;
one is for people who moved here in January and have eaten alone since. Taking a seat
creates your own copy of the plan with the whole table already at it.

**2. Keep the night** — `/moments`
A photo, a line, and who was there. Posted from the table or afterwards, it stays in the
feed long after anyone remembers what it cost. Every gathering has its own Moments pane,
so a plan turns into a memory in the same place it was made.

**3. Let the bill sort itself out** — inside every gathering
The venue's real menu, the order built together, and each person's share moving as it
grows. Shared plates divide across whoever is eating them; service and VAT ride on each
individual share; anyone who named a budget gets flagged before they pass it, not after.
Most of the time nobody opens this pane, which is the point.

## The rest of it

- **Places** (`/places`) — every venue and its full menu, searchable by dish, area or price
  band, with a typical all-in spend per head.
- **Plans** (`/meetups`) — your gatherings, each showing your own share rather than the
  whole bill.
- **Sharing** (`/meetups/join`) — a whole plan packs into the URL fragment, so a gathering
  travels as a ~250-character link through the OS share sheet. Whoever opens it previews
  the table and the order, says which one is them, and keeps their own copy.
- **Identity** — anywhere you tell the app your name (onboarding, an invite, taking a seat)
  it remembers, and never asks again.

## Built for the phone

The site behaves like an app on a phone and like a website on a desktop, from one route
table in `components/shell/routes.ts`:

- A **bottom tab bar** for the places you return to (Moments, Discover, Plans, New), and
  focused full-screen flows — creating, joining, taking a seat — that swap it for a back
  arrow. Any screen ending in a fixed commit bar drops the tab bar, or the two stack and
  the tab bar covers the only button that matters.
- A **contextual app bar** per route: transparent over a hero, solid once you scroll.
- **Bottom sheets** (`components/ui/Sheet.tsx`) with a grab handle and drag-to-dismiss,
  which become centred dialogs above `sm`. They portal to `<body>`: the route-transition
  wrapper sets `relative z-0`, and anything rendered inside that stacking context can never
  rise above the tab bar however high its z-index goes.
- Safe-area insets, no tap highlight, 16px inputs (iOS zooms anything smaller on focus),
  `overscroll-behavior` containment, and a full `prefers-reduced-motion` path.
- **Installable**: `app/manifest.ts` ships a standalone-display PWA that opens on
  `/moments`, plus a first-run onboarding sheet that pre-fills your name and usual budget.
  It never fires on a screen that already asks who you are — an invite, or an open table.

## Images

The source photography is 8–10MB per PNG and `next.config.js` disables Next's optimiser
for Netlify, so `scripts/build-images.mjs` pre-builds WebP renditions at 640/1280/1920 into
`public/img/` (whole set under 3MB) and writes `lib/images.ts` with a 20px inline blur
placeholder per asset. `components/ui/SmartImage.tsx` serves them with a `srcset`, a blur-up
and a fade. A phone now pulls about **500KB** for the landing page instead of tens of
megabytes. Re-run with `npm run images` after adding a PNG to `public/`.

## Where things live

- `lib/social/tables.ts` — open tables (seeded; joining one is real)
- `lib/moments/store.ts` — moments metadata, reactions, the feed
- `lib/moments/photos.ts` — photo storage in IndexedDB, with compression
- `lib/dining/venues.ts` — venues, menus, service and VAT rates
- `lib/split/compute.ts` — the bill maths, pure and self-contained
- `lib/meetup/store.ts` — gatherings, the device profile, contacts
- `lib/meetup/share.ts` — packing a gathering into a link

## Photos

A phone snap is 3–5MB and localStorage holds 5MB for everything, so photos never go near
it. `lib/moments/photos.ts` downscales each pick to a 1400px WebP through a canvas (which
strips EXIF as a side effect — a photo shared to a table should not carry the street it was
taken on) and stores the blob in IndexedDB. The moment record keeps only the id. Object
URLs are revoked on unmount, or a feed leaks every image scrolled past.

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
live, multi-device meetups. Until then `lib/meetup/share.ts` carries a plan between phones
in the URL itself: two people opening the same link each get their own copy, which is the
honest model for a client-only app.

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
- `/app/(public)` — `/`, `/moments`, `/discover`, `/discover/[id]`, `/places`,
  `/places/[slug]`, `/meetups`, `/meetups/new`, `/meetups/[id]`, `/meetups/join`, `/signin`
- `/app/(public)/_archive` — the archived resort site (not routable)
- `/lib/dining/venues.ts` — venues, menus, prices, service and VAT rates
- `/lib/split/compute.ts` — the bill maths (pure, no I/O)
- `/lib/meetup/store.ts` — meetup persistence and React binding
- `/lib/meetup/share.ts` — packing a meetup into a link, and the OS share sheet
- `/lib/images.ts` + `/scripts/build-images.mjs` — generated responsive image manifest
- `/components/shell` — `AppShell`, `MobileHeader`, `routes.ts`, `OnboardingSheet`
- `/components/moments` — `MomentCard`, `MomentComposer`, `MomentPhoto`
- `/components/meetup` — `MenuPicker`, `OrderList`, `SplitTable`, `YourShare`, `PeopleSheet`
- `/components/ui` — `Sheet` (bottom sheet / dialog), `Toast`, `SmartImage`
- `/app/api/*`, `/lib/calendar`, `/lib/companion`, `/lib/db` — kept for the archived pages

## Branding
- **Obsidian**: `#0a0a0a` · **Gold**: `#c9a84c` · **Cream**: `#f5f0e8`
- Display serif: Cormorant Garamond · Sans: Outfit
