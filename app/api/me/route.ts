import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getAppUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/auth/access';
import sql from '@/lib/db';

export async function GET() {
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appUser = await getAppUser({
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
  });

  const me: { role: string; email: string; name?: string | null; clients?: { id: string; name: string }[] } = {
    role: appUser.role,
    email: appUser.email,
    name: appUser.name,
  };

  if (canAccessAdmin(appUser)) {
    const rows = await sql`
      SELECT id, name FROM clients ORDER BY name
    `;
    me.clients = rows as { id: string; name: string }[];
  }

  return NextResponse.json(me);
}
