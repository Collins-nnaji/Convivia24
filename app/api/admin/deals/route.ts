import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getAppUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/auth/access';
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({ id: session.user.id, email: session.user.email!, name: session.user.name, image: session.user.image });
  if (!canAccessAdmin(appUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { clientId, title, stage, value, currency, notes } = await req.json();
  if (!clientId || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const [deal] = await sql`
    INSERT INTO pipeline_deals (client_id, title, stage, value, currency, notes)
    VALUES (${clientId}, ${title}, ${stage || 'lead'}, ${value || null}, ${currency || 'GBP'}, ${notes || null})
    RETURNING *
  `;
  return NextResponse.json(deal, { status: 201 });
}
