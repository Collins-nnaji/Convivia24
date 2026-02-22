import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getAppUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/auth/access';
import sql from '@/lib/db';

const IDRIVE_ENDPOINT = process.env.IDRIVE_ENDPOINT ?? '';
const IDRIVE_BUCKET = process.env.IDRIVE_BUCKET ?? '';

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

  const clientId = await getClientForUser(appUser.id);
  if (!clientId) return NextResponse.json([]);

  const docs = await sql`SELECT * FROM documents WHERE client_id = ${clientId} ORDER BY created_at DESC`;
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({ id: session.user.id, email: session.user.email!, name: session.user.name, image: session.user.image });

  const { name, key, size, type, clientId: adminClientId } = await req.json();

  let clientId: string | null;
  if (canAccessAdmin(appUser)) {
    clientId = adminClientId ?? null;
  } else {
    clientId = await getClientForUser(appUser.id);
  }
  if (!clientId) {
    const msg = canAccessAdmin(appUser)
      ? 'Admins must select a client when uploading (use the client dropdown on the Documents page).'
      : 'Your account is not linked to a client. Contact support to get access to document uploads.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (!IDRIVE_ENDPOINT || !IDRIVE_BUCKET) {
    return NextResponse.json(
      { error: 'Storage not configured (IDRIVE_ENDPOINT / IDRIVE_BUCKET).' },
      { status: 503 }
    );
  }

  const url = `https://${IDRIVE_ENDPOINT}/${IDRIVE_BUCKET}/${key}`;

  const [doc] = await sql`
    INSERT INTO documents (client_id, uploaded_by, name, idrive_key, url, size_bytes, mime_type)
    VALUES (${clientId}, ${appUser.id}, ${name}, ${key}, ${url}, ${size}, ${type})
    RETURNING *
  `;
  return NextResponse.json(doc, { status: 201 });
}
