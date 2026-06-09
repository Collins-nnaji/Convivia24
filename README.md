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
npx tsx lib/db/migrate.ts   # creates the schema + seeds demo events
npm run dev
```

### Key environment variables
- `DATABASE_URL` — Neon Postgres connection string (required)
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_CHAT_DEPLOYMENT` — enable AI features
- `ADMIN_SECRET` — gate the organizer console & write APIs (open in demo mode if unset)
- `CONVIVIA_EVERYTHING_FREE=1` — free/RSVP ticketing (no payment gateway)
- `NEON_AUTH_COOKIE_SECRET` — used to HMAC-sign ticket QR payloads

## Project Structure
- `/app/(public)` — guest-facing pages (home, discover, event detail, checkout, tickets, concierge, create)
- `/app/(presentation)/admin` — organizer console (dashboard, events, orders, scanner, media)
- `/app/api` — events, checkout, orders, tickets (+ qr/barcode), scan, AI endpoints
- `/components` — Navigation, Footer, EventCard, forms
- `/lib` — `db` (Neon), `events`/`categories`, `money`, `ai/azure`, `tickets/*` (codes, qr, barcode)

## Branding
- **Obsidian**: `#0a0a0a` · **Gold**: `#c9a84c` · **Cream**: `#f5f0e8`
- Display serif: Cormorant Garamond · Sans: Outfit
