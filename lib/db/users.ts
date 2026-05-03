import sql from '@/lib/db';

/**
 * Get or create a user record linked to their Neon Auth ID.
 * Called after successful authentication to sync the auth user with our users table.
 */
export async function getOrCreateUser(authUser: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  // Check if user already exists by auth_id
  const existing = await sql`
    SELECT * FROM users WHERE auth_id = ${authUser.id} LIMIT 1
  `;

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new user linked to auth — no default avatar, user sets their own
  const created = await sql`
    INSERT INTO users (auth_id, name, email, avatar_url)
    VALUES (
      ${authUser.id},
      ${authUser.name || 'Member'},
      ${authUser.email || ''},
      ${authUser.image || null}
    )
    RETURNING *
  `;

  return created[0];
}

/**
 * Get user by their auth ID
 */
export async function getUserByAuthId(authId: string) {
  const rows = await sql`
    SELECT * FROM users WHERE auth_id = ${authId} LIMIT 1
  `;
  return rows[0] || null;
}
