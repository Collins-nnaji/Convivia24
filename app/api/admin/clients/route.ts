import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getAppUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/auth/access';
import sql from '@/lib/db';

export async function GET() {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({ id: session.user.id, email: session.user.email!, name: session.user.name, image: session.user.image });
  if (!canAccessAdmin(appUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const clients = await sql`SELECT id, name FROM clients ORDER BY name`;
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({ id: session.user.id, email: session.user.email!, name: session.user.name, image: session.user.image });
  if (!canAccessAdmin(appUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, industry, contact_email, contact_phone, userEmail } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const [client] = await sql`
    INSERT INTO clients (name, industry, contact_email, contact_phone, assigned_admin)
    VALUES (${name}, ${industry || null}, ${contact_email || null}, ${contact_phone || null}, ${appUser.id})
    RETURNING *
  `;

  // If a user email was provided, upsert the user and link them
  if (userEmail?.trim()) {
    // Upsert the user (they may not have logged in yet; we create a placeholder)
    const existingRows = await sql`SELECT id FROM app_users WHERE email = ${userEmail.trim()}`;
    let userId: string;
    if (existingRows.length > 0) {
      userId = String(existingRows[0].id);
    } else {
      // Create placeholder — will be updated on first login via syncUser
      const placeholder = `pending-${Date.now()}`;
      await sql`
        INSERT INTO app_users (id, email, role)
        VALUES (${placeholder}, ${userEmail.trim()}, 'client')
        ON CONFLICT (email) DO NOTHING
      `;
      const [u] = await sql`SELECT id FROM app_users WHERE email = ${userEmail.trim()}`;
      userId = String(u.id);
    }
    await sql`
      INSERT INTO client_users (client_id, user_id) VALUES (${(client as { id: string }).id}, ${userId})
      ON CONFLICT DO NOTHING
    `;
  }

  return NextResponse.json(client, { status: 201 });
}
