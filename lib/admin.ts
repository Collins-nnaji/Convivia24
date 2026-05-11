import sql from '@/lib/db';

export const DEFAULT_OWNER_ADMIN_EMAIL = 'collinsnnaji1@gmail.com';

/**
 * Platform admins — database-backed, with env/default-owner fallback.
 */
export function parseConviviaAdminEmails(): string[] {
  const raw = process.env.CONVIVIA_ADMIN_EMAILS || '';
  const fromEnv = raw
    .split(/[,;\n\r]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([DEFAULT_OWNER_ADMIN_EMAIL, ...fromEnv]));
}

export function isConviviaAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return parseConviviaAdminEmails().includes(e);
}

export async function ensureAppAdminsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_admins (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email       TEXT NOT NULL UNIQUE,
      role        TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
      added_by    TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO app_admins (email, role, added_by)
    VALUES (${DEFAULT_OWNER_ADMIN_EMAIL}, 'owner', 'system')
    ON CONFLICT (email) DO UPDATE SET role = 'owner', updated_at = NOW()
  `;

  const envAdmins = parseConviviaAdminEmails().filter((email) => email !== DEFAULT_OWNER_ADMIN_EMAIL);
  for (const email of envAdmins) {
    await sql`
      INSERT INTO app_admins (email, role, added_by)
      VALUES (${email}, 'admin', 'env')
      ON CONFLICT (email) DO NOTHING
    `;
  }
}

export async function isConviviaAdminAsync(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (isConviviaAdmin(normalized)) return true;

  try {
    await ensureAppAdminsTable();
    const rows = await sql`
      SELECT 1 FROM app_admins WHERE lower(email) = ${normalized} LIMIT 1
    `;
    return rows.length > 0;
  } catch (err) {
    console.error('[isConviviaAdminAsync]', err);
    return false;
  }
}

export async function requireConviviaAdmin(email: string | null | undefined): Promise<boolean> {
  return isConviviaAdminAsync(email);
}
