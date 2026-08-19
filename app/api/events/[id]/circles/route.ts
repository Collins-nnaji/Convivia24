import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import sql, { apiErrorResponse } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await sql`
      SELECT ec.*, c.name AS circle_name, c.vibe_tag, c.slug AS circle_slug,
        (SELECT COUNT(*) FROM circle_members cm WHERE cm.circle_id = c.id) AS member_count
      FROM event_circles ec
      JOIN circles c ON c.id = ec.circle_id
      WHERE ec.event_id = ${id}
      ORDER BY ec.created_at DESC
    `;
    const linked = rows.map((r) => ({
      id: String(r.id),
      circleId: String(r.circle_id),
      circleName: String(r.circle_name),
      circleSlug: String(r.circle_slug),
      vibeTag: String(r.vibe_tag),
      memberCount: Number(r.member_count ?? 0),
      note: r.note ? String(r.note) : null,
    }));
    return NextResponse.json({ linked });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not load event circles.');
    return NextResponse.json({ error, linked: [] }, { status });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in to link a circle.' }, { status: 401 });

    const { circleId, note } = await req.json();
    if (!circleId) return NextResponse.json({ error: 'Circle ID is required.' }, { status: 400 });

    await sql`
      INSERT INTO event_circles (event_id, circle_id, created_by, note)
      VALUES (${id}, ${circleId}, ${user.id}, ${note || null})
      ON CONFLICT (event_id, circle_id) DO NOTHING
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not link circle.');
    return NextResponse.json({ error }, { status });
  }
}
