import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth/session';
import { detectFace, verifyFaces, faceConfigured } from '@/lib/ai/face';
import { verifyTicketPayload } from '@/lib/tickets/codes';

const MATCH_THRESHOLD = 0.6;

/**
 * Door-side Face Check-in. Admin only.
 * Multipart form: { payload (QR/code), file (live photo) }.
 * Compares the live photo to the enrolled selfie on the ticket's order.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!faceConfigured()) return NextResponse.json({ error: 'Face check-in is not configured.' }, { status: 503 });

  try {
    const form = await req.formData();
    const payload = String(form.get('payload') || '');
    const file = form.get('file') as File | null;
    if (!payload || !file) return NextResponse.json({ error: 'A ticket and a photo are required.' }, { status: 400 });

    const { code, valid } = verifyTicketPayload(payload);
    if (!valid) return NextResponse.json({ match: false, message: 'Unrecognised ticket.' });

    const rows = await sql`
      SELECT t.attendee_name, o.face_image_url
      FROM tickets t JOIN orders o ON o.id = t.order_id
      WHERE t.code = ${code} LIMIT 1
    `;
    const ticket = rows[0];
    if (!ticket) return NextResponse.json({ match: false, message: 'Ticket not found.' });
    if (!ticket.face_image_url) return NextResponse.json({ match: false, enrolled: false, message: 'No face enrolled for this ticket.' });

    // Detect the live face, fetch + detect the enrolled selfie, then verify.
    const liveBuf = Buffer.from(await file.arrayBuffer());
    const liveFace = await detectFace(liveBuf);
    if (!liveFace) return NextResponse.json({ match: false, message: 'No face detected at the door.' });

    const enrolledRes = await fetch(String(ticket.face_image_url));
    if (!enrolledRes.ok) return NextResponse.json({ match: false, message: 'Could not load the enrolled photo.' });
    const enrolledBuf = Buffer.from(await enrolledRes.arrayBuffer());
    const enrolledFace = await detectFace(enrolledBuf);
    if (!enrolledFace) return NextResponse.json({ match: false, message: 'Enrolled photo is unusable.' });

    const { confidence } = await verifyFaces(liveFace.faceId, enrolledFace.faceId);
    const match = confidence >= MATCH_THRESHOLD;

    return NextResponse.json({
      match,
      enrolled: true,
      confidence,
      attendee_name: ticket.attendee_name,
      message: match ? 'Face matched.' : 'Face did not match — verify manually.',
    });
  } catch (err) {
    console.error('[POST /api/face/identify]', err);
    return NextResponse.json({ match: false, message: 'Face check failed.' }, { status: 500 });
  }
}
