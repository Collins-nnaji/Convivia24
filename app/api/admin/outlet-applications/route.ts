import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { isConviviaAdmin } from '@/lib/admin';
import { serializeOutletApplication } from '@/lib/outlet-application';

/** GET — list applications for admin inbox. */
export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser?.email || !isConviviaAdmin(authUser.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rows = await sql`
      SELECT
        oa.*,
        c.name AS city_name,
        c.slug AS city_slug,
        u.email AS user_email,
        u.name AS user_name
      FROM outlet_applications oa
      JOIN cities c ON c.id = oa.city_id
      JOIN users u ON u.id = oa.user_id
      ORDER BY oa.submitted_at DESC NULLS LAST, oa.updated_at DESC
    `;

    return NextResponse.json({
      applications: rows.map((r) => ({
        ...serializeOutletApplication(r),
        user_email: r.user_email as string,
        user_name: r.user_name as string,
      })),
    });
  } catch (err) {
    console.error('GET /api/admin/outlet-applications', err);
    return NextResponse.json({ error: 'Failed to load.' }, { status: 500 });
  }
}
