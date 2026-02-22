import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getAppUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/auth/access';
import sql from '@/lib/db';

async function getClientForUser(userId: string): Promise<string | null> {
  const rows = await sql`
    SELECT c.id FROM clients c
    JOIN client_users cu ON cu.client_id = c.id
    WHERE cu.user_id = ${userId}
    LIMIT 1
  `;
  const row = rows[0];
  return row ? String(row.id) : null;
}

export async function GET(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
  });

  if (canAccessAdmin(appUser)) {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');
    let rows: Record<string, unknown>[];
    if (clientId && status) {
      rows = (await sql`
        SELECT l.*, c.name as client_name
        FROM listings l
        JOIN clients c ON c.id = l.client_id
        WHERE l.client_id = ${clientId} AND l.status = ${status}
        ORDER BY l.updated_at DESC
      `) as Record<string, unknown>[];
    } else if (clientId) {
      rows = (await sql`
        SELECT l.*, c.name as client_name
        FROM listings l
        JOIN clients c ON c.id = l.client_id
        WHERE l.client_id = ${clientId}
        ORDER BY l.updated_at DESC
      `) as Record<string, unknown>[];
    } else if (status) {
      rows = (await sql`
        SELECT l.*, c.name as client_name
        FROM listings l
        JOIN clients c ON c.id = l.client_id
        WHERE l.status = ${status}
        ORDER BY l.updated_at DESC
      `) as Record<string, unknown>[];
    } else {
      rows = (await sql`
        SELECT l.*, c.name as client_name
        FROM listings l
        JOIN clients c ON c.id = l.client_id
        ORDER BY l.updated_at DESC
      `) as Record<string, unknown>[];
    }
    return NextResponse.json(rows);
  }

  const clientId = await getClientForUser(appUser.id);
  if (!clientId) return NextResponse.json([]);

  const rows = await sql`
    SELECT * FROM listings
    WHERE client_id = ${clientId}
    ORDER BY updated_at DESC
  `;
  return NextResponse.json(rows as Record<string, unknown>[]);
}

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
  });

  if (canAccessAdmin(appUser)) {
    return NextResponse.json({ error: 'Use dashboard to add listings as a client' }, { status: 403 });
  }

  const clientId = await getClientForUser(appUser.id);
  if (!clientId) {
    return NextResponse.json(
      { error: 'Your account is not linked to a client. Contact support.' },
      { status: 400 }
    );
  }

  const body = await req.json();
  const title = body.title?.trim();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const description = body.description?.trim() ?? null;
  const asking_price = body.asking_price != null ? Number(body.asking_price) : null;
  const currency = body.currency?.trim() || 'GBP';
  const commission_pct = body.commission_pct != null ? Number(body.commission_pct) : null;

  const [row] = await sql`
    INSERT INTO listings (client_id, title, description, asking_price, currency, commission_pct, status)
    VALUES (${clientId}, ${title}, ${description}, ${asking_price}, ${currency}, ${commission_pct}, 'draft')
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
