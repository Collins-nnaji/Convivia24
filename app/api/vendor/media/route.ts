import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

const MAX_MEDIA = 20;

/** POST /api/vendor/media — add a photo or video URL to the vendor gallery */
export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);

    const body = await req.json();
    const url: string = String(body.url || '').trim();
    const media_type: string = body.media_type === 'video' ? 'video' : 'photo';
    const caption: string | null = body.caption ? String(body.caption).trim().slice(0, 200) : null;

    if (!url) return NextResponse.json({ error: 'url is required.' }, { status: 400 });

    const oaRows = await sql`SELECT id FROM outlet_applications WHERE user_id = ${user.id} LIMIT 1`;
    if (oaRows.length === 0) return NextResponse.json({ error: 'No vendor application found.' }, { status: 404 });
    const outletId = oaRows[0].id;

    // Cap at MAX_MEDIA items
    const countRows = await sql`SELECT COUNT(*) AS n FROM vendor_media WHERE outlet_id = ${outletId}`;
    if (Number(countRows[0].n) >= MAX_MEDIA) {
      return NextResponse.json({ error: `Max ${MAX_MEDIA} media items allowed.` }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO vendor_media (outlet_id, url, media_type, caption, sort_order)
      VALUES (${outletId}, ${url}, ${media_type}, ${caption}, (SELECT COALESCE(MAX(sort_order),0)+1 FROM vendor_media WHERE outlet_id = ${outletId}))
      RETURNING *
    `;
    return NextResponse.json({ ok: true, media: inserted[0] });
  } catch (err) {
    console.error('POST /api/vendor/media error:', err);
    return NextResponse.json({ error: 'Failed to add media.' }, { status: 500 });
  }
}

/** DELETE /api/vendor/media — remove a media item by id */
export async function DELETE(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });

    // Verify ownership via join
    await sql`
      DELETE FROM vendor_media vm
      USING outlet_applications oa
      WHERE vm.outlet_id = oa.id
        AND oa.user_id = ${user.id}
        AND vm.id = ${id}::uuid
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/vendor/media error:', err);
    return NextResponse.json({ error: 'Failed to delete media.' }, { status: 500 });
  }
}
