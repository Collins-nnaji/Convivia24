import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ valid: false });
  }

  // Admins can always access the sign-up form using a secret bypass (e.g. /auth/sign-up?invite=SECRET).
  const adminBypass = process.env.SIGNUP_ADMIN_BYPASS;
  if (adminBypass && token === adminBypass) {
    return NextResponse.json({ valid: true, bypass: true });
  }

  const rows = await sql`
    SELECT id, email, expires_at, used_at
    FROM signup_invites
    WHERE token = ${token}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ valid: false });
  }

  const invite = rows[0] as { expires_at: string; used_at: string | null; email: string | null };
  const expired = new Date(invite.expires_at) < new Date();
  const used = invite.used_at !== null;

  if (expired || used) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, email: invite.email ?? null });
}
