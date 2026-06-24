// Companion Support data access — supporter directory + booked sessions.
// Peer support, not licensed clinical care: any signed-in user can opt in as
// a supporter, no vetting in v1.

import sql from '@/lib/db';

export interface SupporterProfile {
  user_id: string;
  display_name: string;
  bio: string | null;
  tags: string[];
  is_active: boolean;
}

export interface SupportSession {
  id: string;
  seeker_id: string;
  seeker_name: string;
  supporter_id: string;
  /** Only populated when listing a seeker's own sessions — joined from supporter_profiles. */
  supporter_name?: string;
  starts_at: string;
  duration_mins: number;
  note: string | null;
  call_link: string | null;
  status: 'requested' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
  response_token: string;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS supporter_profiles (
          user_id       TEXT PRIMARY KEY,
          display_name  TEXT NOT NULL,
          bio           TEXT,
          tags          TEXT[] NOT NULL DEFAULT '{}',
          is_active     BOOLEAN NOT NULL DEFAULT true,
          created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS support_sessions (
          id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          seeker_id       TEXT NOT NULL,
          seeker_name     TEXT NOT NULL,
          supporter_id    TEXT NOT NULL,
          requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          starts_at       TIMESTAMPTZ NOT NULL,
          duration_mins   INTEGER NOT NULL DEFAULT 30,
          note            TEXT,
          call_link       TEXT,
          status          TEXT NOT NULL DEFAULT 'requested'
                            CHECK (status IN ('requested','confirmed','declined','cancelled','completed')),
          response_token  UUID NOT NULL DEFAULT gen_random_uuid(),
          created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_support_sessions_seeker ON support_sessions(seeker_id, starts_at)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_support_sessions_supporter ON support_sessions(supporter_id, starts_at)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_support_sessions_token ON support_sessions(response_token)`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

function toSupporter(r: Record<string, unknown>): SupporterProfile {
  return {
    user_id: String(r.user_id),
    display_name: String(r.display_name),
    bio: (r.bio as string | null) ?? null,
    tags: (r.tags as string[]) ?? [],
    is_active: !!r.is_active,
  };
}

function toSession(r: Record<string, unknown>): SupportSession {
  return {
    id: String(r.id),
    seeker_id: String(r.seeker_id),
    seeker_name: String(r.seeker_name),
    supporter_id: String(r.supporter_id),
    supporter_name: r.supporter_name ? String(r.supporter_name) : undefined,
    starts_at: new Date(r.starts_at as string).toISOString(),
    duration_mins: Number(r.duration_mins),
    note: (r.note as string | null) ?? null,
    call_link: (r.call_link as string | null) ?? null,
    status: r.status as SupportSession['status'],
    response_token: String(r.response_token),
  };
}

/** Active supporters, excluding the given user (so you don't see/book yourself). */
export async function listActiveSupporters(excludeUserId: string): Promise<SupporterProfile[]> {
  await ensureSchema();
  const rows = await sql`
    SELECT user_id, display_name, bio, tags, is_active FROM supporter_profiles
    WHERE is_active = true AND user_id != ${excludeUserId}
    ORDER BY updated_at DESC LIMIT 100
  `;
  return rows.map(toSupporter);
}

export async function getSupporterProfile(userId: string): Promise<SupporterProfile | null> {
  await ensureSchema();
  const [row] = await sql`SELECT user_id, display_name, bio, tags, is_active FROM supporter_profiles WHERE user_id = ${userId}`;
  return row ? toSupporter(row) : null;
}

export async function upsertSupporterProfile(
  userId: string,
  input: { display_name: string; bio?: string | null; tags: string[]; is_active: boolean },
): Promise<SupporterProfile> {
  await ensureSchema();
  const [row] = await sql`
    INSERT INTO supporter_profiles (user_id, display_name, bio, tags, is_active)
    VALUES (${userId}, ${input.display_name.trim()}, ${input.bio?.trim() || null}, ${input.tags}, ${input.is_active})
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      bio          = EXCLUDED.bio,
      tags         = EXCLUDED.tags,
      is_active    = EXCLUDED.is_active,
      updated_at   = NOW()
    RETURNING user_id, display_name, bio, tags, is_active
  `;
  return toSupporter(row);
}

export interface NewSessionInput {
  supporter_id: string;
  starts_at: string;
  duration_mins?: number;
  note?: string | null;
}

export async function requestSession(seekerId: string, seekerName: string, input: NewSessionInput): Promise<SupportSession> {
  await ensureSchema();
  const [row] = await sql`
    INSERT INTO support_sessions (seeker_id, seeker_name, supporter_id, starts_at, duration_mins, note)
    VALUES (${seekerId}, ${seekerName}, ${input.supporter_id}, ${input.starts_at}, ${input.duration_mins || 30}, ${input.note?.trim() || null})
    RETURNING id, seeker_id, seeker_name, supporter_id, starts_at, duration_mins, note, call_link, status, response_token
  `;
  return toSession(row);
}

export async function listSessionsForUser(userId: string): Promise<{ asSeeker: SupportSession[]; asSupporter: SupportSession[] }> {
  await ensureSchema();
  const [asSeeker, asSupporter] = await Promise.all([
    sql`
      SELECT s.id, s.seeker_id, s.seeker_name, s.supporter_id, p.display_name AS supporter_name,
             s.starts_at, s.duration_mins, s.note, s.call_link, s.status, s.response_token
      FROM support_sessions s
      LEFT JOIN supporter_profiles p ON p.user_id = s.supporter_id
      WHERE s.seeker_id = ${userId} ORDER BY s.starts_at DESC LIMIT 50
    `,
    sql`
      SELECT id, seeker_id, seeker_name, supporter_id, starts_at, duration_mins, note, call_link, status, response_token
      FROM support_sessions WHERE supporter_id = ${userId} ORDER BY starts_at DESC LIMIT 50
    `,
  ]);
  return { asSeeker: asSeeker.map(toSession), asSupporter: asSupporter.map(toSession) };
}

/** Looks up a session by its public response token — the token itself is the credential, no user_id check. */
export async function getSessionByToken(token: string): Promise<SupportSession | null> {
  await ensureSchema();
  const [row] = await sql`
    SELECT id, seeker_id, seeker_name, supporter_id, starts_at, duration_mins, note, call_link, status, response_token
    FROM support_sessions WHERE response_token = ${token}
  `;
  return row ? toSession(row) : null;
}

export async function respondToSession(
  token: string,
  status: 'confirmed' | 'declined',
  callLink?: string | null,
): Promise<SupportSession | null> {
  await ensureSchema();
  const rows = await sql`
    UPDATE support_sessions SET
      status     = ${status},
      call_link  = COALESCE(${callLink?.trim() || null}, call_link),
      updated_at = NOW()
    WHERE response_token = ${token} AND status = 'requested'
    RETURNING id
  `;
  if (!rows.length) return null;
  return getSessionByToken(token);
}
