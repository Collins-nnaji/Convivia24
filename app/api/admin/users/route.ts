import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { ensureAppAdminsTable, isConviviaAdminAsync } from '@/lib/admin';

function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  try {
    const { user } = await neonAuth();
    if (!user?.email || !(await isConviviaAdminAsync(user.email))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ensureAppAdminsTable();
    const admins = await sql`
      SELECT id, email, role, added_by, created_at, updated_at
      FROM app_admins
      ORDER BY
        CASE role WHEN 'owner' THEN 0 ELSE 1 END,
        created_at ASC
    `;

    return NextResponse.json({ admins });
  } catch (err) {
    console.error('GET /api/admin/users', err);
    return NextResponse.json({ error: 'Failed to load admins.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await neonAuth();
    if (!user?.email || !(await isConviviaAdminAsync(user.email))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const role = body.role === 'owner' ? 'owner' : 'admin';

    if (!validEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
    }

    await ensureAppAdminsTable();
    const rows = await sql`
      INSERT INTO app_admins (email, role, added_by)
      VALUES (${email}, ${role}, ${user.email})
      ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        added_by = EXCLUDED.added_by,
        updated_at = NOW()
      RETURNING id, email, role, added_by, created_at, updated_at
    `;

    return NextResponse.json({ ok: true, admin: rows[0] });
  } catch (err) {
    console.error('POST /api/admin/users', err);
    return NextResponse.json({ error: 'Failed to save admin.' }, { status: 500 });
  }
}
