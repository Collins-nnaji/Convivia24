import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { uploadToAzure } from '@/lib/storage';

/**
 * POST /api/guest/photo
 * Guest uploads a photo to the live campaign wall
 * Body: FormData { campaign_id, pass_token?, file, uploader_name? }
 *
 * GET /api/guest/photo?campaign_id=xxx&limit=20
 * Fetch approved photos for the live wall
 */

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });

  const campaignId = form.get('campaign_id') as string;
  const passToken  = form.get('pass_token') as string | null;
  const file       = form.get('file') as File | null;
  const name       = (form.get('uploader_name') as string | null)?.slice(0, 60) || 'Guest';

  if (!campaignId || !file) return NextResponse.json({ error: 'campaign_id and file are required.' }, { status: 400 });

  const [campaign] = await sql`SELECT id, photowall_enabled FROM brand_campaigns WHERE id = ${campaignId}`;
  if (!campaign || !campaign.photowall_enabled) return NextResponse.json({ error: 'Photo wall not available.' }, { status: 404 });

  let passId: string | null = null;
  if (passToken) {
    const [pass] = await sql`SELECT id FROM guest_passes WHERE pass_token = ${passToken} AND campaign_id = ${campaignId}`;
    if (pass) passId = pass.id as string;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'jpg';
  const blobName = `campaign-photos/${campaignId}/${Date.now()}.${ext}`;

  let url: string;
  try {
    url = await uploadToAzure(buffer, blobName, file.type || 'image/jpeg');
  } catch {
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }

  const [photo] = await sql`
    INSERT INTO campaign_photos (campaign_id, pass_id, url, uploader_name)
    VALUES (${campaignId}, ${passId}, ${url}, ${name})
    RETURNING *
  `;

  await sql`UPDATE brand_campaigns SET total_photos = total_photos + 1 WHERE id = ${campaignId}`;

  return NextResponse.json({ photo }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaign_id');
  const slug = searchParams.get('slug'); // photowall_slug
  const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 60);

  if (!campaignId && !slug) return NextResponse.json({ error: 'campaign_id or slug required.' }, { status: 400 });

  let resolvedId = campaignId;
  if (!resolvedId && slug) {
    const [c] = await sql`SELECT id FROM brand_campaigns WHERE photowall_slug = ${slug}`;
    if (!c) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    resolvedId = c.id as string;
  }

  const photos = await sql`
    SELECT id, url, thumbnail_url, uploader_name, created_at
    FROM campaign_photos
    WHERE campaign_id = ${resolvedId!} AND approved = true
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return NextResponse.json({ photos });
}
