import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

function scoreApplicant(applicant: Record<string, unknown>, shift: Record<string, unknown>) {
  let score = 0;
  const reasons: string[] = [];
  const certs = Array.isArray(applicant.worker_certifications)
    ? (applicant.worker_certifications as unknown[]).map((c) => String(c).toLowerCase())
    : [];
  const title = String(shift.title || '').toLowerCase();
  const city = String((shift as Record<string, unknown>).city || '').toLowerCase();
  const area = String((shift as Record<string, unknown>).area || '').toLowerCase();
  const location = String(applicant.worker_location || '').toLowerCase();
  const rating = Number(applicant.worker_rating || 0);

  if (applicant.worker_verified) {
    score += 30;
    reasons.push('Verified');
  }
  if (rating >= 4.5) {
    score += 20;
    reasons.push(`${rating.toFixed(1)} rating`);
  } else if (rating >= 4) {
    score += 12;
    reasons.push('Good rating');
  }
  if (certs.length > 0) {
    score += Math.min(18, certs.length * 6);
    reasons.push(`${certs.length} cert${certs.length === 1 ? '' : 's'}`);
  }
  if (certs.some((cert) => title.includes(cert) || cert.includes(title.split(/\s+/)[0] || ''))) {
    score += 14;
    reasons.push('Role fit');
  }
  if (location && ((city && location.includes(city)) || (area && location.includes(area)))) {
    score += 12;
    reasons.push('Close by');
  }
  if (applicant.note) {
    score += 6;
    reasons.push('Added note');
  }
  if (applicant.payout_phone) {
    score += 5;
    reasons.push('Payout ready');
  }
  if (applicant.status === 'confirmed') {
    score += 40;
    reasons.unshift('Already hired');
  } else if (applicant.status === 'shortlisted') {
    score += 20;
    reasons.unshift('Shortlisted');
  }

  return {
    score,
    reasons: reasons.slice(0, 4),
  };
}

// GET /api/shifts/[id]/applicants
// Outlet-only: returns all workers who applied for this shift.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const user = await getOrCreateUser(authUser);
  const { id: shiftId } = await params;

  // Only the outlet that posted the shift (host) can view applicants
  const shifts = await sql`
    SELECT id, host_id, title, city, area FROM hangouts WHERE id = ${shiftId} LIMIT 1
  `;
  if (shifts.length === 0) {
    return NextResponse.json({ error: 'Shift not found.' }, { status: 404 });
  }
  if (String(shifts[0].host_id) !== String(user.id)) {
    return NextResponse.json({ error: 'Only the outlet that posted this shift can view applicants.' }, { status: 403 });
  }

  const applicants = await sql`
    SELECT
      sa.id,
      sa.shift_id,
      sa.worker_id,
      sa.status,
      sa.payout_provider,
      sa.payout_phone,
      sa.note,
      sa.applied_at,
      sa.updated_at,
      u.name         AS worker_name,
      u.avatar_url   AS worker_avatar,
      u.rating       AS worker_rating,
      u.verified     AS worker_verified,
      u.location     AS worker_location,
      u.certifications AS worker_certifications,
      u.bio          AS worker_bio
    FROM shift_applications sa
    JOIN users u ON u.id = sa.worker_id
    WHERE sa.shift_id = ${shiftId}
    ORDER BY
      CASE sa.status
        WHEN 'confirmed'   THEN 1
        WHEN 'shortlisted' THEN 2
        WHEN 'pending'     THEN 3
        WHEN 'rejected'    THEN 4
        WHEN 'no_show'     THEN 5
      END,
      sa.applied_at ASC
  `;

  const ranked = applicants
    .map((applicant) => {
      const intelligence = scoreApplicant(applicant as Record<string, unknown>, shifts[0] as Record<string, unknown>);
      return {
        ...applicant,
        match_score: intelligence.score,
        match_reasons: intelligence.reasons,
      } as Record<string, unknown>;
    })
    .sort((a, b) => {
      const statusRank: Record<string, number> = {
        confirmed: 1,
        shortlisted: 2,
        pending: 3,
        rejected: 4,
        no_show: 5,
      };
      const statusDelta = (statusRank[String(a.status)] ?? 9) - (statusRank[String(b.status)] ?? 9);
      if (statusDelta !== 0) return statusDelta;
      return Number(b.match_score || 0) - Number(a.match_score || 0);
    });

  return NextResponse.json({ applicants: ranked });
}
