import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { getGuestByToken } from '@/lib/activation';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const passToken = String(formData.get('pass_token') ?? '').trim();
    if (!file || !passToken) {
      return NextResponse.json({ error: 'file and pass_token required' }, { status: 400 });
    }
    const guest = await getGuestByToken(passToken);
    if (!guest) return NextResponse.json({ error: 'Invalid pass' }, { status: 404 });
    if (!guest.photowall_enabled) {
      return NextResponse.json({ error: 'Photo wall disabled' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (5MB max)' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(buffer, file.name, file.type);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error('[activation/guest-upload]', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
