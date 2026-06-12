import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { detectFace, faceConfigured } from '@/lib/ai/face';
import { uploadImage } from '@/lib/azure/blob';
import { rateLimit, clientIp } from '@/lib/redis';

/**
 * Enroll a selfie for Face Check-in against an order.
 * Multipart form: { reference, file (image) }. The buyer must own the order.
 */
export async function POST(req: NextRequest) {
  if (!faceConfigured()) {
    return NextResponse.json({ error: 'Face check-in is not available on this event.' }, { status: 503 });
  }

  const rl = await rateLimit(`face-enroll:${clientIp(req)}`, 10, 60);
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Try again shortly.' }, { status: 429 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

  try {
    const form = await req.formData();
    const reference = String(form.get('reference') || '');
    const file = form.get('file') as File | null;
    if (!reference || !file) return NextResponse.json({ error: 'Order reference and a photo are required.' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Please provide an image.' }, { status: 400 });

    const orders = await sql`SELECT id, user_id, buyer_email FROM orders WHERE reference = ${reference} LIMIT 1`;
    const order = orders[0];
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.user_id !== user.id && String(order.buyer_email).toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'This order is not on your account.' }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate exactly one clear face before storing.
    const face = await detectFace(buffer);
    if (!face) return NextResponse.json({ error: 'No face detected — use a clear, front-facing photo.' }, { status: 422 });

    const { url } = await uploadImage(buffer, file.type, { context: 'face-enroll', filename: `${reference}.jpg` });
    await sql`UPDATE orders SET face_image_url = ${url}, updated_at = NOW() WHERE id = ${order.id}`;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/face/enroll]', err);
    return NextResponse.json({ error: 'Could not enroll your face. Please try again.' }, { status: 500 });
  }
}
