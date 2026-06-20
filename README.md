# Convivia24 — The Mindful Calendar

Lower your stress. Optimize your hours. Love your day.

Convivia24 is a calm personal calendar. Add what's on your day — tasks, events,
gatherings with people — and it auto-inserts a quiet 15-minute rest block wherever
things run back-to-back. A persistent-memory Companion chats with you and proposes
things to add to your day. When a day gets heavy, **Destress my day** asks the AI for
a calmer version and lets you accept it with one tap.

## Features

- **My 24** (`/my24`) — the day as one soft, scrollable ribbon. Mark things done and
  they dissolve away. Invite people to any item.
- **Rest buffers** — pure scheduling logic (`lib/calendar/buffers.ts`) inserts a 15-minute
  "Rest" block between any two items less than 10 minutes apart. No setup required.
- **Destress my day** (`/api/ai/destress`) — AI proposes moving low-priority items to
  tomorrow to clear space; high-priority items are never touched, and nothing moves
  until you accept.
- **Companion** (`/companion`) — a chat with persistent memory (`companion_memory`)
  that remembers preferences, habits and people, and can suggest items to add to My 24.

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

Every page under `/my24` and `/companion` requires sign-in; signed-out visitors land on
`/signin?next=...`.

**Neon Auth dashboard setup (once):**
1. Enable the **Google** social provider.
2. Set the project's app URL / trusted origin to your deployed domain (`NEXT_PUBLIC_APP_URL`)
   so OAuth redirect URIs and cookies resolve to your domain.
3. Add the Google OAuth redirect URI for your domain as instructed by Neon Auth.

> The live OAuth round-trip can only be verified from a deployed environment that can reach
> the Neon Auth host; it is network-blocked in CI sandboxes.

## Project Structure
- `/app/(public)` — `/`, `/my24`, `/companion`, `/signin`
- `/app/api/calendar` — personal calendar CRUD (`lib/calendar/repo.ts`)
- `/app/api/companion` — chat + memory
- `/app/api/ai/destress` — AI rescheduling proposals
- `/components/calendar` — `MyDayRibbon`, `DestressButton`
- `/lib/calendar` — `buffers.ts` (rest-buffer logic), `repo.ts` (Postgres data access)
- `/lib/db` — Neon client, schema, migration runner

## Branding
- **Obsidian**: `#0a0a0a` · **Gold**: `#c9a84c` · **Cream**: `#f5f0e8`
- Display serif: Cormorant Garamond · Sans: Outfit
