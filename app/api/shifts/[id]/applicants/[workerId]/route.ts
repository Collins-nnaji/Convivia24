import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { staffingWhatsAppUrl } from '@/lib/staffing';

// PATCH /api/shifts/[id]/applicants/[workerId]
// Body: { status: 'shortlisted' | 'confirmed' | 'rejected' | 'no_show' }
// Outlet-only: update a worker's application status for a shift.
// On confirm: increments hangout current_guests.
// On reject after confirm: decrements hangout current_guests.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; workerId: string }> },
) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const user = await getOrCreateUser(authUser);
  const { id: shiftId, workerId } = await params;

  const body = await req.json().catch(() => ({}));
  const { status } = body as { status?: string };

  const VALID = ['shortlisted', 'confirmed', 'rejected', 'no_show'];
  if (!status || !VALID.includes(status)) {
    return NextResponse.json(
      { error: 'status must be shortlisted, confirmed, rejected, or no_show.' },
      { status: 400 },
    );
  }

  // Only the host outlet can update applicant status
  const shifts = await sql`
    SELECT id, host_id, title, location, city, area, event_time, ticket_price
    FROM hangouts WHERE id = ${shiftId} LIMIT 1
  `;
  if (shifts.length === 0) {
    return NextResponse.json({ error: 'Shift not found.' }, { status: 404 });
  }
  const shift = shifts[0] as Record<string, unknown>;
  if (String(shift.host_id) !== String(user.id)) {
    return NextResponse.json({ error: 'Only the outlet that posted this shift can update applicants.' }, { status: 403 });
  }

  // Get current application state
  const existing = await sql`
    SELECT sa.*, u.name AS worker_name, u.payout_phone AS worker_phone
    FROM shift_applications sa
    JOIN users u ON u.id = sa.worker_id
    WHERE sa.shift_id = ${shiftId} AND sa.worker_id = ${workerId}
    LIMIT 1
  `;
  if (existing.length === 0) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
  }

  const prev = existing[0] as Record<string, unknown>;
  const wasConfirmed = prev.status === 'confirmed';
  const nowConfirmed = status === 'confirmed';

  // Update the application
  const updated = await sql`
    UPDATE shift_applications
    SET status = ${status}, updated_at = NOW()
    WHERE shift_id = ${shiftId} AND worker_id = ${workerId}
    RETURNING *
  `;

  // Keep current_guests count accurate
  if (!wasConfirmed && nowConfirmed) {
    await sql`UPDATE hangouts SET current_guests = current_guests + 1 WHERE id = ${shiftId}`;
  } else if (wasConfirmed && !nowConfirmed) {
    await sql`UPDATE hangouts SET current_guests = GREATEST(current_guests - 1, 0) WHERE id = ${shiftId}`;
  }

  // Build a WhatsApp confirmation link for the outlet to send the worker
  let whatsappUrl: string | null = null;
  if (nowConfirmed) {
    const workerPhone = String(prev.payout_phone || '').replace(/\D/g, '');
    const shiftTitle = String(shift.title || 'Your shift');
    const shiftCity = String(shift.city || shift.location || '');
    const eventTime = shift.event_time instanceof Date
      ? shift.event_time.toISOString()
      : String(shift.event_time || '');
    const d = eventTime ? new Date(eventTime) : null;
    const timeStr = d
      ? d.toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'time TBC';

    const message =
      `Hi ${String(prev.worker_name || 'there')} — you're confirmed for: ${shiftTitle} · ${shiftCity} · ${timeStr}. ` +
      `Arrive 15 mins early. Payout via ${String(prev.payout_provider || 'mobile money')} after sign-off. ` +
      `Reply to confirm receipt. — Convivia24`;

    if (workerPhone.length >= 10) {
      whatsappUrl = `https://wa.me/${workerPhone}?text=${encodeURIComponent(message)}`;
    } else {
      whatsappUrl = staffingWhatsAppUrl(message);
    }
  }

  return NextResponse.json({ ok: true, application: updated[0], whatsappUrl });
}
