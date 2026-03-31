import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

// GET /api/circles — List user's circles
export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(authUser);

    const circles = await sql`
      SELECT c.*, 
        (SELECT COUNT(*) FROM circle_members cm WHERE cm.circle_id = c.id) as member_count
      FROM circles c
      LEFT JOIN circle_members cm ON c.id = cm.circle_id AND cm.user_id = ${user.id}
      WHERE cm.user_id IS NOT NULL OR c.created_by = ${user.id}
      ORDER BY c.created_at DESC
    `;

    const serialized = circles.map((c) => ({
      ...c,
      created_at: c.created_at instanceof Date ? c.created_at.toISOString() : c.created_at,
    }));

    return NextResponse.json({ circles: serialized });
  } catch (err) {
    console.error('Error fetching circles:', err);
    return NextResponse.json({ error: 'Failed to load circles.' }, { status: 500 });
  }
}

// POST /api/circles — Create a new circle
export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Sign in to create a circle.' }, { status: 401 });
    }

    const user = await getOrCreateUser(authUser);
    const { name, description } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Circle name is required.' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO circles (name, description, created_by)
      VALUES (${name.trim()}, ${description?.trim() || null}, ${user.id})
      RETURNING *
    `;

    // Auto-join the creator
    await sql`
      INSERT INTO circle_members (circle_id, user_id)
      VALUES (${rows[0].id}, ${user.id})
    `;

    return NextResponse.json({ ok: true, circle: rows[0] });
  } catch (err) {
    console.error('Error creating circle:', err);
    return NextResponse.json({ error: 'Failed to create circle.' }, { status: 500 });
  }
}
