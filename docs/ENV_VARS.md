# Convivia24 — Environment Variables Reference

All variables go in two places:
1. **Local dev** — `.env` file at the project root (already gitignored)
2. **Production** — Netlify dashboard → Site settings → Environment variables

---

## Already configured

| Variable | What it does |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string. Every DB query goes through this. Without it the app crashes on any API call. |
| `NEON_AUTH_URL` | Neon Auth endpoint — handles sign-up, sign-in, session cookies. |
| `NEON_AUTH_BASE_URL` | Same as above; both are required by the Neon Auth SDK. |
| `NEON_AUTH_COOKIE_SECRET` | Secret used to sign the session cookie. If this changes all existing sessions are invalidated (everyone gets logged out). |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage credentials. Used by `/api/upload` to store profile photos, vendor gallery images, and videos. |
| `AZURE_STORAGE_CONTAINER` | The blob container name (`convivia24-images`). Files are stored here and served publicly. |
| `AZURE_STORAGE_ENDPOINT` | Public base URL for the blob container. Used to construct the `url` returned after an upload. |
| `AZURE_FACE_ENDPOINT` | Azure Cognitive Services Face API — used by the face verification flow (shift check-in selfie match). |
| `AZURE_FACE_KEY` | API key for the Face endpoint above. Requires Microsoft gated access approval for full identity verification. |
| `CONVIVIA_EVERYTHING_FREE` | Server-side flag. Set to `1` to unlock unlimited matches for all users (used during launch/testing). Set to `0` to restore paid gates. |
| `NEXT_PUBLIC_CONVIVIA_EVERYTHING_FREE` | Same flag but exposed to the browser. Must match the server-side value so the UI and API agree on what's free. |

---

## Still needed — add before launch

### Upstash Redis — rate limiting
**Where to get it:** upstash.com → Create Database → REST API tab

| Variable | What it does |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Connection URL for the Upstash Redis instance (e.g. `https://xxx.upstash.io`). |
| `UPSTASH_REDIS_REST_TOKEN` | Auth token for the Redis instance. |

**Why it matters:** The rate limiter in `lib/rate-limit.ts` uses these to enforce per-IP request limits:
- `/api/inquiries` — 5 requests/minute (stops contact form spam)
- `/api/waitlist` — 5 requests/minute (stops fake signups)
- `/api/shifts/[id]/apply` — 10 requests/minute (stops workers hammering apply)

**If not set:** The limiter silently skips — all requests are allowed. The app still works, just unprotected.

---

### Sentry — error monitoring
**Sentry org:** `standex-digital` · **Project:** `convivia24`
**Where to get DSN:** sentry.io → Projects → convivia24 → Settings → Client Keys (DSN)

| Variable | What it does |
|---|---|
| `SENTRY_DSN` | Server-side Sentry project DSN. Captures API route errors, DB failures, unhandled exceptions. |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser-side DSN (same value). Captures client-side JS errors in the app. |

**Why it matters:** When something breaks in production (a DB query fails, an API throws, a user hits a white screen) Sentry sends you an alert with the full stack trace, the user's session, and the exact line of code. Without it you're blind to production errors.

**If not set:** Sentry initialises but sends nothing — no errors are reported, no alerts fire. The app still works fine.

---

### App URL
**No signup needed — just set it.**

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_APP_URL` | The canonical public URL of the app (e.g. `https://app.convivia24.com`). Used by the Paystack callback redirect so Paystack knows where to send users after payment. Also used to build the vendor shareable link in `/v/[slug]`. |

**If not set:** Paystack callback falls back to `https://app.convivia24.com` (hardcoded default), so it works — but set it properly for any staging/preview environments.

---

### Google Places — location autocomplete
**Where to get it:** console.cloud.google.com → Enable "Maps JavaScript API" + "Places API" → Credentials → Create API Key → restrict to your domain

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_GOOGLE_PLACES_KEY` | Enables address/location autocomplete in the shift post form and profile city field. |

**If not set:** Location fields become plain text inputs — still works, just no autocomplete suggestions.

---

### Paystack — payments
**Where to get it:** paystack.com → Settings → API Keys & Webhooks

| Variable | What it does |
|---|---|
| `PAYSTACK_SECRET_KEY` | Server-side key used by `/api/paystack/initialize` to create payment links and by `/api/paystack/callback` to verify transactions. Use `sk_test_…` for testing, `sk_live_…` for production. |
| `PAYSTACK_WEBHOOK_SECRET` | Used to verify that webhook events at `/api/paystack/webhook` genuinely come from Paystack (HMAC signature check). Set in Paystack dashboard → Settings → Webhooks → your endpoint. |

**Why it matters:** Without `PAYSTACK_SECRET_KEY`, clicking "Get Black" returns a 503 error. Without `PAYSTACK_WEBHOOK_SECRET`, the webhook still works but skips signature verification (less secure).

**Webhook URL to register in Paystack:** `https://app.convivia24.com/api/paystack/webhook`

---

### Admin emails
| Variable | What it does |
|---|---|
| `CONVIVIA_ADMIN_EMAILS` | Comma-separated list of emails that have admin access (e.g. `collinsnnaji1@gmail.com`). Used by `lib/admin.ts` to gate `/admin/outlets` and platform-admin UI. |

**If not set:** Nobody sees the admin panel or outlet approval queue.

---

## Full example `.env`

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEON_AUTH_URL=https://...
NEON_AUTH_BASE_URL=https://...
NEON_AUTH_COOKIE_SECRET=...

# Storage & Face API
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER=convivia24-images
AZURE_STORAGE_ENDPOINT=https://convivia24.blob.core.windows.net/
AZURE_FACE_ENDPOINT=https://convivia24.cognitiveservices.azure.com/
AZURE_FACE_KEY=...

# Feature flags
CONVIVIA_EVERYTHING_FREE=1
NEXT_PUBLIC_CONVIVIA_EVERYTHING_FREE=1

# Rate limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Error monitoring
SENTRY_DSN=https://abc@o123.ingest.sentry.io/789
NEXT_PUBLIC_SENTRY_DSN=https://abc@o123.ingest.sentry.io/789

# App
NEXT_PUBLIC_APP_URL=https://app.convivia24.com

# Payments
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_WEBHOOK_SECRET=...

# Admin
CONVIVIA_ADMIN_EMAILS=collinsnnaji1@gmail.com

# Location autocomplete (optional)
NEXT_PUBLIC_GOOGLE_PLACES_KEY=...
```
