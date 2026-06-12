import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const rows = type
      ? await sql`SELECT * FROM events WHERE is_active = true AND event_type = ${type} ORDER BY sort_order, name`
      : await sql`SELECT * FROM events WHERE is_active = true ORDER BY event_type, sort_order, name`;

    return NextResponse.json({ events: rows });
  } catch (err) {
    console.error('[GET /api/events]', err);
    return NextResponse.json({ error: 'Failed to fetch events.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, description, event_type, frequency, day_of_week, time_start, time_end, access_level, access_note, image_url, booking_required, sort_order } = data;

    if (!name || !description || !event_type) {
      return NextResponse.json({ error: 'name, description, event_type required' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO events (name, description, event_type, frequency, day_of_week, time_start, time_end, access_level, access_note, image_url, booking_required, sort_order)
      VALUES (${name}, ${description}, ${event_type}, ${frequency || null}, ${day_of_week || null}, ${time_start || null}, ${time_end || null}, ${access_level || 'public'}, ${access_note || null}, ${image_url || null}, ${booking_required || false}, ${sort_order || 0})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('[POST /api/events]', err);
    return NextResponse.json({ error: 'Failed to create event.' }, { status: 500 });
  }
}
