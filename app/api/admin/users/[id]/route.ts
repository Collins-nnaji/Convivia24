import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { DEFAULT_OWNER_ADMIN_EMAIL, ensureAppAdminsTable, isConviviaAdminAsync } from '@/lib/admin';

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await neonAuth();
    if (!user?.email || !(await isConviviaAdminAsync(user.email))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await ctx.params;
    await ensureAppAdminsTable();

    const existing = await sql`
      SELECT id, email, role FROM app_admins WHERE id = ${id}::uuid LIMIT 1
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
    }

    const email = String(existing[0].email || '').toLowerCase();
    if (email === DEFAULT_OWNER_ADMIN_EMAIL || existing[0].role === 'owner') {
      return NextResponse.json({ error: 'Owner admin cannot be removed.' }, { status: 400 });
    }

    if (email === user.email.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot remove yourself.' }, { status: 400 });
    }

    await sql`DELETE FROM app_admins WHERE id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/users/[id]', err);
    return NextResponse.json({ error: 'Failed to remove admin.' }, { status: 500 });
  }
}
