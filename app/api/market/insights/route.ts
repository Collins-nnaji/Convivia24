import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const insights = await sql`
      SELECT i.*, s.title as sprint_title
      FROM market_insights i
      LEFT JOIN market_sprints s ON s.id = i.sprint_id
      WHERE i.user_id = ${user.id}
      ORDER BY i.created_at DESC
    `;

    return NextResponse.json({ insights });
  } catch (err) {
    console.error('Insights load error:', err);
    return NextResponse.json({ error: 'Failed to load insights.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const body = await req.json();

    if (!body.title?.trim() || !body.summary?.trim()) {
      return NextResponse.json({ error: 'Title and summary are required.' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO market_insights (
        sprint_id, user_id, title, market, insight_type,
        summary, recommendation, confidence
      )
      VALUES (
        ${body.sprint_id || null},
        ${user.id},
        ${body.title.trim()},
        ${body.market?.trim() || 'Nigeria'},
        ${body.insight_type || 'consumer'},
        ${body.summary.trim()},
        ${body.recommendation?.trim() || null},
        ${Number(body.confidence || 70)}
      )
      RETURNING *
    `;

    return NextResponse.json({ ok: true, insight: rows[0] });
  } catch (err) {
    console.error('Insight create error:', err);
    return NextResponse.json({ error: 'Failed to save insight.' }, { status: 500 });
  }
}
