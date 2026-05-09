import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

function toSlug(name: string, id: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    id.slice(0, 6)
  );
}

/** GET /api/vendor/profile — returns the vendor's outlet_application row + media */
export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);

    const rows = await sql`
      SELECT oa.*, c.name AS city_name
      FROM outlet_applications oa
      JOIN cities c ON c.id = oa.city_id
      WHERE oa.user_id = ${user.id}
      LIMIT 1
    `;
    if (rows.length === 0) return NextResponse.json({ vendor: null });

    const oa = rows[0];
    const media = await sql`
      SELECT id, url, media_type, caption, sort_order
      FROM vendor_media
      WHERE outlet_id = ${oa.id}
      ORDER BY sort_order, created_at
    `;

    return NextResponse.json({ vendor: { ...oa, media: Array.from(media) } });
  } catch (err) {
    console.error('GET /api/vendor/profile error:', err);
    return NextResponse.json({ error: 'Failed to load vendor profile.' }, { status: 500 });
  }
}

/** PATCH /api/vendor/profile — update description, full_address, instagram_handle, logo_url, cover_url */
export async function PATCH(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);

    const body = await req.json();
    const { description, full_address, instagram_handle, logo_url, cover_url } = body;

    const rows = await sql`SELECT id, business_name, slug FROM outlet_applications WHERE user_id = ${user.id} LIMIT 1`;
    if (rows.length === 0) return NextResponse.json({ error: 'No vendor application found.' }, { status: 404 });

    const oa = rows[0];
    const currentSlug = oa.slug as string | null;
    const newSlug = currentSlug || toSlug(String(oa.business_name || 'vendor'), String(oa.id));

    const updated = await sql`
      UPDATE outlet_applications SET
        description      = COALESCE(${description ?? null}, description),
        full_address     = COALESCE(${full_address ?? null}, full_address),
        instagram_handle = COALESCE(${instagram_handle ?? null}, instagram_handle),
        logo_url         = COALESCE(${logo_url ?? null}, logo_url),
        cover_url        = COALESCE(${cover_url ?? null}, cover_url),
        slug             = COALESCE(slug, ${newSlug}),
        updated_at       = NOW()
      WHERE id = ${oa.id}
      RETURNING *
    `;

    return NextResponse.json({ ok: true, vendor: updated[0] });
  } catch (err) {
    console.error('PATCH /api/vendor/profile error:', err);
    return NextResponse.json({ error: 'Failed to update vendor profile.' }, { status: 500 });
  }
}
