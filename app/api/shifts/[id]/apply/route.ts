import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { rateLimit } from '@/lib/rate-limit';
import { ShiftApplySchema, zodFirstError } from '@/lib/schemas';

// POST /api/shifts/[id]/apply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = await rateLimit(req, 'shift:apply', 10, 60);
  if (limited) return limited;

  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Sign in to apply.' }, { status: 401 });

  const user = await getOrCreateUser(authUser);
  const { id: shiftId } = await params;

  const raw = await req.json().catch(() => ({}));
  const parsed = ShiftApplySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: zodFirstError(parsed.error) },
      { status: 400 },
    );
  }
  const { payout_provider, payout_phone, note } = parsed.data;

  const shifts = await sql`
    SELECT id, status, max_guests, current_guests
    FROM hangouts
    WHERE id = ${shiftId}
      AND status IN ('pending', 'confirmed')
  `;
  if (shifts.length === 0) {
    return NextResponse.json({ error: 'Shift not found or no longer open.' }, { status: 404 });
  }

  const shift = shifts[0] as Record<string, unknown>;
  if ((shift.current_guests as number) >= (shift.max_guests as number)) {
    return NextResponse.json({ error: 'This shift is already fully staffed.' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO shift_applications (shift_id, worker_id, payout_provider, payout_phone, note, status)
    VALUES (
      ${shiftId},
      ${String(user.id)},
      ${payout_provider},
      ${payout_phone.trim()},
      ${note?.trim() || null},
      'pending'
    )
    ON CONFLICT (shift_id, worker_id) DO UPDATE SET
      payout_provider = EXCLUDED.payout_provider,
      payout_phone    = EXCLUDED.payout_phone,
      note            = EXCLUDED.note,
      status          = CASE
        WHEN shift_applications.status = 'rejected' THEN 'pending'
        ELSE shift_applications.status
      END,
      updated_at = NOW()
    RETURNING *
  `;

  return NextResponse.json({ ok: true, application: rows[0] });
}

// GET /api/shifts/[id]/apply — worker checks their own application status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const user = await getOrCreateUser(authUser);
  const { id: shiftId } = await params;

  const rows = await sql`
    SELECT * FROM shift_applications
    WHERE shift_id = ${shiftId} AND worker_id = ${String(user.id)}
    LIMIT 1
  `;

  return NextResponse.json({ application: rows[0] ?? null });
}
