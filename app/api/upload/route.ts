import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth/session';
import { blobConfigured, uploadBlob, validateMediaFile } from '@/lib/azure/blob';

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!blobConfigured()) {
    return NextResponse.json({ error: 'Azure Storage is not configured.' }, { status: 503 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const context = (formData.get('context') as string | null) || 'admin-media';
    const eventId = formData.get('event_id') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });

    const validationError = validateMediaFile(file);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const purpose = context === 'event-cover' ? 'event-cover' : 'admin-media';
    const result = await uploadBlob(buffer, file.type, {
      filename: file.name,
      context,
      purpose,
      eventId: eventId ?? undefined,
    });

    return NextResponse.json({
      url: result.url,
      blob_name: result.blobName,
      media_type: result.mediaType,
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/upload]', err);
    const msg = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: msg.includes('Azure') ? msg : 'Upload failed. Please try again.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await sql`SELECT * FROM uploads ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({ uploads: rows, azure_configured: blobConfigured() });
  } catch (err) {
    console.error('[GET /api/upload]', err);
    return NextResponse.json({ error: 'Failed to fetch uploads.' }, { status: 500 });
  }
}
