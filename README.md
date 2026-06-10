# Convivia24 — AI-Powered Events & Ticketing Platform

Convivia24 is an events discovery and ticketing platform for parties, concerts, festivals and
culture — think Fatsoma, but AI-powered. Guests discover events, buy tickets in seconds, and
walk in with secure **QR + barcode** entry. Organizers list events with an AI co-pilot, sell
tickets, scan guests at the door, and track sales in real time.

## Features

### For guests
- **Discover** events with search, category and city filters (`/events`)
- **AI Concierge** — describe your ideal night and get matched to live events (`/concierge`)
- **Instant tickets** — pick a tier, check out, and get tickets immediately (free/RSVP mode)
- **Digital tickets** with a signed QR code and Code 128 barcode (`/t/[code]`)
- **My Tickets** lookup by order reference (`/tickets`)

### For organizers
- **AI Event Builder** — drafts your tagline, description, lineup and ticket tiers from a sentence (`/create`)
- **Organizer console** (`/admin`) — dashboard, event management, orders, and a **door scanner**
- **Door scanner** with live camera QR scanning (where supported) + manual check-in (`/admin/scan`)
- Tamper-evident tickets (HMAC-signed payloads), duplicate-proof check-in

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React · **Animations**: Framer Motion
- **Database**: Neon Postgres (`@neondatabase/serverless`)
- **AI**: Azure OpenAI (chat completions) — graceful template fallback when unconfigured
- **Tickets**: `qrcode` (QR) + a pure-TS Code 128 barcode generator

## Getting Started

```bash
npm install
# set DATABASE_URL (Neon) and optionally Azure OpenAI vars in .env.local
npx tsx lib/db/migrate.ts   # creates the schema + seeds global sample events
npm run dev
```

### Sample data
Global sample events (Lagos, London, New York, Accra, Nairobi, Toronto, Dubai, Atlanta,
Johannesburg, Berlin, Paris, Manchester, Abuja) live in `lib/seed.ts`. They're seeded
idempotently by the migration, or on demand from **Organizer Console → Seed sample events**
(`POST /api/admin/seed`, admin only).

### Key environment variables
- `DATABASE_URL` — Neon Postgres connection string (required)
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_CHAT_DEPLOYMENT` — enable AI features
- `NEON_AUTH_BASE_URL` — Neon Auth (Better Auth) server URL (required for sign-in)
- `NEXT_PUBLIC_NEON_AUTH_BASE_URL` — public auth base; set to `/api/auth` (the same-origin proxy)
- `CONVIVIA_ADMIN_EMAILS` — comma-separated emails granted the organizer/admin role
- `CONVIVIA_EVERYTHING_FREE=1` — free/RSVP ticketing (no payment gateway)
- `NEON_AUTH_COOKIE_SECRET` — used to HMAC-sign ticket QR payloads
- `ADMIN_SECRET` — optional break-glass header (`x-admin-secret`) for admin APIs

## Authentication (Neon Auth + Google)

Sign-in uses **Neon Auth** (powered by Better Auth), proxied same-origin through
`/api/auth/*` so session cookies are first-party. Its tables live in the `neon_auth`
schema of the same database.

- `app/api/auth/[...path]/route.ts` — transparent reverse proxy to `NEON_AUTH_BASE_URL`
  (forwards cookies, re-issues `Set-Cookie` first-party).
- `app/api/auth/me/route.ts` — server-validated current user (`/get-session`).
- `lib/auth/session.ts` — `getCurrentUser()`, `isAdminRequest()` for server/API gating.
- `components/auth/AuthProvider.tsx` — `useUser()` hook; `lib/auth/client.ts` — Google
  sign-in / sign-out.

**What requires sign-in:** buying tickets (checkout), creating events (`/create`), and the
organizer console (`/admin`, admin role via `CONVIVIA_ADMIN_EMAILS`). Browsing stays open.

**Neon Auth dashboard setup (once):**
1. Enable the **Google** social provider.
2. Set the project's app URL / trusted origin to your deployed domain (`NEXT_PUBLIC_APP_URL`)
   so OAuth redirect URIs and cookies resolve to your domain.
3. Add the Google OAuth redirect URI for your domain as instructed by Neon Auth.

> The live OAuth round-trip can only be verified from a deployed environment that can reach
> the Neon Auth host; it is network-blocked in CI sandboxes.

## Project Structure
- `/app/(public)` — guest-facing pages (home, discover, event detail, checkout, tickets, concierge, create)
- `/app/(presentation)/admin` — organizer console (dashboard, events, orders, scanner, media)
- `/app/api` — events, checkout, orders, tickets (+ qr/barcode), scan, AI endpoints
- `/components` — Navigation, Footer, EventCard, forms
- `/lib` — `db` (Neon), `events`/`categories`, `money`, `ai/azure`, `tickets/*` (codes, qr, barcode)

## Branding
- **Obsidian**: `#0a0a0a` · **Gold**: `#c9a84c` · **Cream**: `#f5f0e8`
- Display serif: Cormorant Garamond · Sans: Outfit
