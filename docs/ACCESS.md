# Access control & scaling

## Difference between the two dashboards

| | **Client dashboard** | **Admin dashboard** |
|---|------------------------|----------------------|
| **URL** | `/dashboard`, `/dashboard/pipeline`, etc. | `/admin`, `/admin/clients`, etc. |
| **Who** | Any signed-in user. Data is for *their* client only. | Only users with role `admin` (see below). |
| **Sidebar** | “Pipeline Suite” + **Client** badge. Nav: Overview, Pipeline, Messages, Documents. | Red border + “Admin” badge. Nav: Overview, **Clients**, Pipeline, Messages, **Leads**. |
| **How to tell** | Grey “Client” badge in sidebar; no red border. | Red stripe on left sidebar; “Admin” and “Admin Dashboard” in header. |
| **Your role** | Shown under your name in sidebar as “Role: client” or “Role: admin”. | You only see this if you have admin access. |

If you think you should be admin but don’t see “Open Admin panel →” on the client dashboard, check that your sidebar shows **Role: admin**. If it shows **Role: client**, the app thinks you’re not an admin (see “Adding more admins” below).

## Who can access what

- **Admin panel (`/admin`)**: Only users with `role = 'admin'` in `app_users`. Shown only to them (e.g. “Admin panel” link in dashboard sidebar).
- **Client dashboard (`/dashboard`)**: Any signed-in user. Data is scoped by `client_users` (which client they belong to).
- **Public routes**: Home, auth sign-in/sign-up, briefing, intel, etc.

## How admin is determined

1. **Source of truth**: `lib/auth/session.ts` exports `ADMIN_EMAILS` (the only list of emails that can be admins).
2. **On every login**: `syncUser()` runs (e.g. from `/auth/callback`). It sets `app_users.role = 'admin'` when the user’s email is in `ADMIN_EMAILS`, otherwise `'client'`. On conflict it **updates** `role` too, so the DB stays in sync.
3. **Checks**: Use `app_users.role`, not the email list:
   - **Pages**: `requireAdmin()` in `app/admin/layout.tsx` (redirects to `/dashboard` if not admin).
   - **UI**: “Admin panel” link only if `canAccessAdmin(appUser)` (i.e. `appUser.role === 'admin'`).
   - **APIs**: Admin routes use `canAccessAdmin(appUser)` and return 403 if false.

So the **only** place you configure “who is admin” is `ADMIN_EMAILS` in `lib/auth/session.ts`. The DB role is kept in sync on login.

## Adding more admins

1. Add the new email to `ADMIN_EMAILS` in `lib/auth/session.ts`.
2. That user signs in at least once so `syncUser()` sets their `role` to `'admin'`.
3. They will then see “Admin panel” and can access `/admin` and all admin APIs.

## Scaling later

- **More roles**: Add a `role` value (e.g. `'viewer'`, `'manager'`) and use `canAccessAdmin`-style helpers (e.g. `canAccessPipeline(appUser)`).
- **Role in DB only**: To promote someone to admin without a code deploy, update `app_users.role` in the DB; keep using `canAccessAdmin(appUser)` everywhere. `ADMIN_EMAILS` would then only affect **new** logins (syncUser). Optionally add an admin-only “Promote to admin” UI that updates `app_users.role`.
