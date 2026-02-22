import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getAppUser } from '@/lib/auth/session';
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

export async function GET() {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appUser = await getAppUser({ id: session.user.id, email: session.user.email!, name: session.user.name, image: session.user.image });

  let clientId: string | null;
  if (appUser.role === 'admin') return NextResponse.json([]);

  clientId = await getClientForUser(appUser.id);
  if (!clientId) return NextResponse.json([]);

  // Mark admin messages as read
  await sql`
    UPDATE messages SET read_at = NOW()
    WHERE client_id = ${clientId} AND sender_role = 'admin' AND read_at IS NULL
  `;

  const messages = await sql`
    SELECT m.*, u.name as sender_name
    FROM messages m
    JOIN app_users u ON u.id = m.sender_id
    WHERE m.client_id = ${clientId}
    ORDER BY m.created_at ASC
  `;
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appUser = await getAppUser({ id: session.user.id, email: session.user.email!, name: session.user.name, image: session.user.image });

  const { body, clientId: adminClientId } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

  let clientId: string | null;
  if (appUser.role === 'admin') {
    clientId = adminClientId ?? null;
  } else {
    clientId = await getClientForUser(appUser.id);
  }
  if (!clientId) return NextResponse.json({ error: 'No client found' }, { status: 400 });

  const [msg] = await sql`
    INSERT INTO messages (client_id, sender_id, sender_role, body)
    VALUES (${clientId}, ${appUser.id}, ${appUser.role}, ${body.trim()})
    RETURNING *
  `;
  return NextResponse.json(msg, { status: 201 });
}
