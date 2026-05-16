import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

/** Public upload for event photos (no auth required — guests can upload) */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 8MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(buffer, file.name, file.type);

    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error('[convene/upload]', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
