import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getAppUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/auth/access';
import sql from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appUser = await getAppUser({ id: session.user.id, email: session.user.email!, name: session.user.name, image: session.user.image });
  if (!canAccessAdmin(appUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { stage, value, notes } = await req.json();
  const [deal] = await sql`
    UPDATE pipeline_deals
    SET
      stage      = COALESCE(${stage ?? null}, stage),
      value      = COALESCE(${value ?? null}::numeric, value),
      notes      = COALESCE(${notes ?? null}, notes),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(deal);
}
