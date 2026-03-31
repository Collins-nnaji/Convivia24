import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

// GET /api/profile — Get current user's profile
export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(authUser);

    // Get connections count
    const connectionsResult = await sql`
      SELECT COUNT(*) as count FROM connections WHERE user_id_1 = ${user.id}
    `;

    // Get circles count
    const circlesResult = await sql`
      SELECT COUNT(*) as count FROM circle_members WHERE user_id = ${user.id}
    `;

    return NextResponse.json({
      user: {
        ...user,
        created_at: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at,
        connections_count: Number(connectionsResult[0]?.count || 0),
        circles_count: Number(circlesResult[0]?.count || 0),
      },
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return NextResponse.json({ error: 'Failed to load profile.' }, { status: 500 });
  }
}

// PATCH /api/profile — Update profile
export async function PATCH(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(authUser);
    const body = await req.json();
    const { name, bio, avatar_url, location } = body;

    const updated = await sql`
      UPDATE users SET
        name = COALESCE(${name?.trim() || null}, name),
        bio = COALESCE(${bio?.trim() || null}, bio),
        avatar_url = COALESCE(${avatar_url || null}, avatar_url),
        location = COALESCE(${location?.trim() || null}, location)
      WHERE id = ${user.id}
      RETURNING *
    `;

    return NextResponse.json({ ok: true, user: updated[0] });
  } catch (err) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
