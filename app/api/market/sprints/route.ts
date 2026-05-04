import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const sprints = await sql`
      SELECT * FROM market_sprints
      WHERE user_id = ${user.id} AND status <> 'archived'
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ sprints });
  } catch (err) {
    console.error('Sprint load error:', err);
    return NextResponse.json({ error: 'Failed to load market sprints.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const body = await req.json();

    if (!body.title?.trim() || !body.product_name?.trim()) {
      return NextResponse.json({ error: 'Sprint title and product name are required.' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO market_sprints (
        user_id, title, product_name, market, category, stage,
        goal, audience, budget, asset_url, start_date, end_date
      )
      VALUES (
        ${user.id},
        ${body.title.trim()},
        ${body.product_name.trim()},
        ${body.market?.trim() || 'Nigeria'},
        ${body.category?.trim() || null},
        ${body.stage || 'idea'},
        ${body.goal?.trim() || null},
        ${body.audience?.trim() || null},
        ${body.budget?.trim() || null},
        ${body.asset_url?.trim() || null},
        ${body.start_date || null},
        ${body.end_date || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ ok: true, sprint: rows[0] });
  } catch (err) {
    console.error('Sprint create error:', err);
    return NextResponse.json({ error: 'Failed to create market sprint.' }, { status: 500 });
  }
}
