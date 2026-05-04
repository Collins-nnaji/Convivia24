import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const activations = await sql`
      SELECT a.*, s.title as sprint_title
      FROM brand_activations a
      LEFT JOIN market_sprints s ON s.id = a.sprint_id
      WHERE a.user_id = ${user.id}
      ORDER BY a.activation_date ASC NULLS LAST, a.created_at DESC
    `;

    return NextResponse.json({ activations });
  } catch (err) {
    console.error('Activations load error:', err);
    return NextResponse.json({ error: 'Failed to load activations.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const body = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Activation title is required.' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO brand_activations (
        sprint_id, user_id, title, city, channel, venue,
        activation_date, target_leads, actual_leads, status, notes
      )
      VALUES (
        ${body.sprint_id || null},
        ${user.id},
        ${body.title.trim()},
        ${body.city?.trim() || 'Lagos'},
        ${body.channel?.trim() || 'sampling'},
        ${body.venue?.trim() || null},
        ${body.activation_date || null},
        ${Number(body.target_leads || 100)},
        ${Number(body.actual_leads || 0)},
        ${body.status || 'planned'},
        ${body.notes?.trim() || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ ok: true, activation: rows[0] });
  } catch (err) {
    console.error('Activation create error:', err);
    return NextResponse.json({ error: 'Failed to create activation.' }, { status: 500 });
  }
}
