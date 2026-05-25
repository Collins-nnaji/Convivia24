import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

/** GET inquiries submitted with the signed-in user's email */
export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await getOrCreateUser(authUser);
    const email = String(user.email || authUser.email).trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ inquiries: [] });
    }
    const rows = await sql`
      SELECT id, name, email, company, inquiry_type, message, status, created_at
      FROM inquiries
      WHERE LOWER(TRIM(email)) = ${email}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ inquiries: rows });
  } catch (e) {
    console.error('[inquiries/mine]', e);
    return NextResponse.json({ error: 'Failed to load inquiries' }, { status: 500 });
  }
}
