import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

const VALID_PILLARS = new Set(['move', 'nourish', 'hydrate', 'rest', 'connect', 'reflect']);

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const checkins = await sql`
      SELECT * FROM checkins
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 30
    `;

    return NextResponse.json({
      checkins: checkins.map((c) => ({
        ...c,
        created_at: c.created_at instanceof Date ? c.created_at.toISOString() : c.created_at,
      })),
    });
  } catch (err) {
    console.error('Error loading check-ins:', err);
    return NextResponse.json({ error: 'Failed to load check-ins.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Sign in to check in.' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const body = await req.json();
    const pillars = Array.isArray(body.pillars)
      ? body.pillars.filter((pillar: unknown) => typeof pillar === 'string' && VALID_PILLARS.has(pillar))
      : [];

    if (pillars.length === 0) {
      return NextResponse.json({ error: 'Choose at least one pillar.' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO checkins (user_id, pillars, feel, reflection)
      VALUES (
        ${user.id},
        ${pillars}::text[],
        ${typeof body.feel === 'string' ? body.feel : null},
        ${typeof body.reflection === 'string' ? body.reflection.trim() || null : null}
      )
      RETURNING *
    `;

    return NextResponse.json({ ok: true, checkin: rows[0] });
  } catch (err) {
    console.error('Error saving check-in:', err);
    return NextResponse.json({ error: 'Failed to save check-in.' }, { status: 500 });
  }
}
