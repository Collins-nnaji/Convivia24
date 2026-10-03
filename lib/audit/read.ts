import sql from '@/lib/db';
import { auditDetail } from './detail';

export const AUDIT_CATEGORIES = ['auth', 'navigation', 'api', 'admin', 'supplier', 'drinks'] as const;
export type AuditCategory = typeof AUDIT_CATEGORIES[number];
export type AuditFilters = { search: string; category: string; outcome: string; from: string | null; to: string | null; before: string | null; limit: number };

export async function readAudit(filters: AuditFilters) {
  const rows = await sql`
    SELECT f.*, COALESCE(f.actor_email, p.email) AS email, COALESCE(f.actor_name, p.name) AS name
    FROM platform_audit_feed f LEFT JOIN platform_user_activity p ON p.user_id = f.actor_id
    WHERE (${filters.category} = '' OR f.category = ${filters.category})
      AND (${filters.search} = '' OR concat_ws(' ', f.actor_id, f.actor_email, p.email, f.action, f.subject, f.detail::text) ILIKE ${'%' + filters.search.replace(/[\\%_]/g, '\\$&') + '%'})
      AND (${filters.from}::timestamptz IS NULL OR f.created_at >= ${filters.from}::timestamptz)
      AND (${filters.to}::timestamptz IS NULL OR f.created_at < ${filters.to}::timestamptz)
      AND (${filters.before}::text IS NULL OR (f.created_at, f.id) < (
        SELECT created_at, id FROM platform_audit_feed WHERE id = ${filters.before}
      ))
      AND (${filters.outcome} = '' OR
        (${filters.outcome} = 'success' AND (f.status IS NULL OR f.status < 400)) OR
        (${filters.outcome} = 'rejected' AND f.status >= 400 AND f.status < 500) OR
        (${filters.outcome} = 'failed' AND f.status >= 500))
    ORDER BY f.created_at DESC, f.id DESC LIMIT ${filters.limit + 1}
  `;
  const more = rows.length > filters.limit;
  const entries = rows.slice(0, filters.limit).map(row => ({
    id: String(row.id), actorId: row.actor_id == null ? null : String(row.actor_id),
    email: row.email == null ? null : String(row.email), name: row.name == null ? null : String(row.name),
    category: String(row.category), action: String(row.action), subject: row.subject == null ? null : String(row.subject),
    method: row.method == null ? null : String(row.method), status: row.status == null ? null : Number(row.status),
    durationMs: row.duration_ms == null ? null : Number(row.duration_ms), detail: auditDetail(row.detail ?? {}) as Record<string, unknown>,
    createdAt: new Date(row.created_at as string).toISOString(),
  }));
  return { entries, nextCursor: more ? entries.at(-1)?.id ?? null : null };
}

export async function readSignedInUsers(search: string, offset: number, limit = 50) {
  try {
    // Select only user metadata. Never select session tokens, OAuth tokens or password hashes.
    const rows = await sql`
      WITH signed_in AS (
        SELECT u.id::text AS user_id, u.email, u.name, COUNT(*)::int AS sessions,
          MAX(s."expiresAt") AS expires_at, MIN(s."createdAt") AS signed_in_at
        FROM neon_auth.session s JOIN neon_auth."user" u ON u.id = s."userId"
        WHERE s."expiresAt" > NOW()
          AND (${search} = '' OR concat_ws(' ', u.email, u.name, u.id::text) ILIKE ${'%' + search.replace(/[\\%_]/g, '\\$&') + '%'})
        GROUP BY u.id, u.email, u.name
      )
      SELECT u.*, p.last_seen_at, p.last_path, COUNT(*) OVER()::int AS total
      FROM signed_in u LEFT JOIN platform_user_activity p ON p.user_id = u.user_id
      ORDER BY p.last_seen_at DESC NULLS LAST, u.user_id LIMIT ${limit} OFFSET ${offset}
    `;
    return { source: 'neon' as const, users: rows.map(mapUser), total: Number(rows[0]?.total ?? 0), warning: null };
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
    if (!['42P01', '42703', '42501', '3F000'].includes(String(code))) throw error;
    // Older Neon Auth environments may not expose the managed session tables. Do not call
    // these signed-in users: presence is evidence of recent activity, not an unexpired session.
    const rows = await sql`
      SELECT user_id, email, name, last_seen_at, last_path, NULL::int AS sessions,
        NULL::timestamptz AS expires_at, first_seen_at AS signed_in_at, COUNT(*) OVER()::int AS total
      FROM platform_user_activity
      WHERE last_seen_at > NOW() - INTERVAL '24 hours'
        AND (${search} = '' OR concat_ws(' ', email, name, user_id) ILIKE ${'%' + search.replace(/[\\%_]/g, '\\$&') + '%'})
      ORDER BY last_seen_at DESC, user_id LIMIT ${limit} OFFSET ${offset}
    `;
    return { source: 'presence' as const, users: rows.map(mapUser), total: Number(rows[0]?.total ?? 0), warning: 'Neon session tables are unavailable in this environment. Showing users seen in the last 24 hours; their current sign-in status cannot be confirmed.' };
  }
}

function mapUser(row: Record<string, unknown>) {
  const date = (value: unknown) => value == null ? null : new Date(value as string).toISOString();
  return { userId: String(row.user_id), email: String(row.email), name: row.name == null ? null : String(row.name),
    sessions: row.sessions == null ? null : Number(row.sessions), expiresAt: date(row.expires_at), signedInAt: date(row.signed_in_at),
    lastSeenAt: date(row.last_seen_at), lastPath: row.last_path == null ? null : String(row.last_path) };
}
