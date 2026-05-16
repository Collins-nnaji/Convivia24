import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getEventById, checkInGuest } from '@/lib/convene';
import { neon } from '@neondatabase/serverless';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT pass_token, event_id FROM convene_guests WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const event = await getEventById(rows[0].event_id as string);
  if (!event || event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const guest = await checkInGuest(rows[0].pass_token as string);
  return NextResponse.json({ guest });
}
