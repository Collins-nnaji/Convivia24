import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const rows = status
      ? await sql`SELECT * FROM convivium_members WHERE status = ${status} ORDER BY joined_at DESC`
      : await sql`SELECT * FROM convivium_members ORDER BY joined_at DESC`;
    return NextResponse.json({ members: rows });
  } catch (err) {
    console.error('[GET /api/members]', err);
    return NextResponse.json({ error: 'Failed to fetch members.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, phone, member_type, notes } = await req.json();
    if (!name || !email) return NextResponse.json({ error: 'name and email required' }, { status: 400 });

    // Auto-generate member number: CV-YYYY-NNNN
    const year = new Date().getFullYear();
    const countRows = await sql`SELECT COUNT(*) AS n FROM convivium_members`;
    const n = Number(countRows[0].n) + 1;
    const member_number = `CV-${year}-${String(n).padStart(4, '0')}`;

    const rows = await sql`
      INSERT INTO convivium_members (name, email, phone, member_type, member_number, notes)
      VALUES (${name}, ${email.toLowerCase()}, ${phone || null}, ${member_type || 'regular'}, ${member_number}, ${notes || null})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'A member with this email already exists.' }, { status: 409 });
    }
    console.error('[POST /api/members]', err);
    return NextResponse.json({ error: 'Failed to create member.' }, { status: 500 });
  }
}
