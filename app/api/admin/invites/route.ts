import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/server';
import { isAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import { randomBytes } from 'crypto';

async function getAdminUser() {
  const { data } = await getAuth().getSession();
  const user = data?.user ?? (data as any)?.session?.user;
  if (!user || !isAdmin(user.email)) return null;
  return user;
}

/** POST /api/admin/invites — create a new invite link */
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const email: string | undefined = body.email?.trim() || undefined;
  const expiresInDays: number = Number(body.expiresInDays) || 7;

  const token = randomBytes(20).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO signup_invites (token, email, created_by, expires_at)
    VALUES (${token}, ${email ?? null}, ${user.email}, ${expiresAt.toISOString()})
  `;

  const origin = new URL(request.url).origin;
  const inviteUrl = `${origin}/auth/sign-up?invite=${token}`;

  return NextResponse.json({ inviteUrl, token, expiresAt: expiresAt.toISOString() });
}

/** GET /api/admin/invites — list recent invites */
export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await sql`
    SELECT id, token, email, created_by, expires_at, used_at, used_by, created_at
    FROM signup_invites
    ORDER BY created_at DESC
    LIMIT 50
  `;

  return NextResponse.json({ invites: rows });
}
