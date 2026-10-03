import sql from '@/lib/db';
import type { AuthUser } from '@/lib/auth/session';

// Record paths, never query strings, invite tokens, recovery links or credentials.
export function auditPath(value: string): string | null {
  if (!value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return null;
  const path = value.split(/[?#]/)[0].slice(0, 300);
  return path
    .replace(/^(\/party-planner|\/verify|\/supplier)\/[^/]+/, '$1/[record]')
    .replace(/^(\/api\/night-plans)\/[^/]+/, '$1/[token]');
}

export type AuditInput = {
  user: AuthUser | null;
  category: 'auth' | 'navigation' | 'api';
  action: string;
  subject?: string | null;
  method?: string;
  status?: number;
  durationMs?: number;
  eventKey?: string;
};

/** Best effort: telemetry must not change the result of a login or a purchase. */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await sql`
      WITH seen AS (
        INSERT INTO platform_user_activity (user_id, email, name, last_path)
        SELECT ${input.user?.id ?? null}, ${input.user?.email ?? null}, ${input.user?.name ?? null},
          ${input.category === 'navigation' ? input.subject ?? null : null}
        WHERE ${Boolean(input.user?.id && input.user?.email)}
        ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name,
          last_seen_at = NOW(), last_path = COALESCE(EXCLUDED.last_path, platform_user_activity.last_path)
      )
      INSERT INTO platform_audit (actor_id, actor_email, actor_name, category, action, subject, method, status, duration_ms, event_key)
      VALUES (${input.user?.id ?? null}, ${input.user?.email ?? null}, ${input.user?.name ?? null},
        ${input.category}, ${input.action}, ${input.subject ?? null}, ${input.method ?? null},
        ${input.status ?? null}, ${input.durationMs == null ? null : Math.max(0, Math.round(input.durationMs))}, ${input.eventKey ?? null})
      ON CONFLICT (event_key) DO NOTHING
    `;
  } catch {
    console.error('Platform audit could not be recorded. Check the platform-audit migration and database availability.');
  }
}

export async function recordPresence(user: AuthUser, path: string): Promise<void> {
  await sql`
    INSERT INTO platform_user_activity (user_id, email, name, last_path)
    VALUES (${user.id}, ${user.email}, ${user.name}, ${path})
    ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name,
      last_seen_at = NOW(), last_path = EXCLUDED.last_path
  `;
}
