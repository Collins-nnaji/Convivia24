import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth/session';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const context = formData.get('context') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and AVIF images are allowed.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File must be under 10MB.' }, { status: 400 });
    }

    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const container = process.env.AZURE_STORAGE_CONTAINER || 'convivia24-images';

    const blobService = BlobServiceClient.fromConnectionString(connStr);
    const containerClient = blobService.getContainerClient(container);
    await containerClient.createIfNotExists({ access: 'blob' });

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const blobName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blockBlob = containerClient.getBlockBlobClient(blobName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await blockBlob.uploadData(buffer, { blobHTTPHeaders: { blobContentType: file.type } });

    const url = blockBlob.url;

    await sql`
      INSERT INTO uploads (blob_name, url, filename, content_type, size_bytes, context)
      VALUES (${blobName}, ${url}, ${file.name}, ${file.type}, ${file.size}, ${context || null})
    `;

    return NextResponse.json({ url, blob_name: blobName }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/upload]', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await sql`SELECT * FROM uploads ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({ uploads: rows });
  } catch (err) {
    console.error('[GET /api/upload]', err);
    return NextResponse.json({ error: 'Failed to fetch uploads.' }, { status: 500 });
  }
}
