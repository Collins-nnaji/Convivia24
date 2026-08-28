import sql from '@/lib/db';
import { captureApiError } from '@/lib/sentry';
import {
  DEFAULT_COMMISSION_PCT,
  clampCommissionPct,
  commissionNgn,
  isValidCode,
  normaliseCode,
} from './codes';

export const PARTNER_KINDS = [
  'planner',
  'venue',
  'caterer',
  'dj',
  'decorator',
  'photographer',
  'mc',
  'other',
] as const;
export type PartnerKind = (typeof PARTNER_KINDS)[number];

export const KIND_LABELS: Record<PartnerKind, string> = {
  planner: 'Event planner',
  venue: 'Venue',
  caterer: 'Caterer',
  dj: 'DJ',
  decorator: 'Decorator',
  photographer: 'Photographer',
  mc: 'MC / host',
  other: 'Something else',
};

export type PartnerStatus = 'pending' | 'active' | 'suspended';
export type AttributionStatus = 'pending' | 'approved' | 'paid' | 'void';

export type ReferralPartner = {
  id: string;
  ownerId: string | null;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  kind: PartnerKind;
  commissionPct: number;
  status: PartnerStatus;
  notes: string | null;
  createdAt: string;
};

export type PartnerInput = {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  kind?: string;
  code?: string | null;
};

function mapPartner(r: Record<string, unknown>): ReferralPartner {
  return {
    id: String(r.id),
    ownerId: (r.owner_id as string) || null,
    code: String(r.code),
    name: String(r.name),
    email: String(r.email),
    phone: (r.phone as string) || null,
    company: (r.company as string) || null,
    kind: (r.kind as PartnerKind) || 'planner',
    commissionPct: Number(r.commission_pct ?? DEFAULT_COMMISSION_PCT),
    status: (r.status as PartnerStatus) || 'pending',
    notes: (r.notes as string) || null,
    createdAt: String(r.created_at),
  };
}

export function validatePartner(input: PartnerInput): string | null {
  if (!input.name || input.name.trim().length < 2) return 'Your name is required.';
  if (input.name.trim().length > 120) return 'That name is too long.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email || '').trim())) {
    return 'A valid email is required.';
  }
  if (input.phone && input.phone.trim() && !/^[+\d][\d\s-]{6,19}$/.test(input.phone.trim())) {
    return 'That phone number does not look right.';
  }
  if (input.kind && !(PARTNER_KINDS as readonly string[]).includes(input.kind)) {
    return 'Pick what kind of business you run.';
  }
  if (input.code && !normaliseCode(input.code)) {
    return 'A referral code needs at least 4 letters or numbers.';
  }
  return null;
}

/** Finds a free code near the one requested, so two partners never collide. */
async function claimCode(preferred: string): Promise<string> {
  const base = normaliseCode(preferred) || 'REF';
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = attempt === 0 ? base : normaliseCode(`${base}${attempt + 1}`);
    if (!isValidCode(candidate)) continue;
    const [taken] = await sql`SELECT 1 FROM referral_partners WHERE code = ${candidate} LIMIT 1`;
    if (!taken) return candidate;
  }
  throw new Error('Could not allocate a referral code. Try a different one.');
}

export async function createPartner(
  input: PartnerInput,
  ownerId: string | null
): Promise<ReferralPartner> {
  const email = input.email.trim().toLowerCase();

  // One application per email — a second submission returns what they already have.
  const [existing] = await sql`SELECT * FROM referral_partners WHERE LOWER(email) = ${email} LIMIT 1`;
  if (existing) return mapPartner(existing);

  const code = await claimCode(input.code || input.company || input.name);
  const kind = (PARTNER_KINDS as readonly string[]).includes(input.kind || '')
    ? (input.kind as PartnerKind)
    : 'planner';

  const rows = await sql`
    INSERT INTO referral_partners (owner_id, code, name, email, phone, company, kind, commission_pct, status)
    VALUES (
      ${ownerId}, ${code}, ${input.name.trim()}, ${email},
      ${input.phone?.trim() || null}, ${input.company?.trim() || null},
      ${kind}, ${DEFAULT_COMMISSION_PCT}, 'pending'
    )
    RETURNING *
  `;
  return mapPartner(rows[0]);
}

export async function getPartnerByCode(code: string): Promise<ReferralPartner | null> {
  const clean = normaliseCode(code);
  if (!clean) return null;
  const rows = await sql`SELECT * FROM referral_partners WHERE code = ${clean} LIMIT 1`;
  return rows[0] ? mapPartner(rows[0]) : null;
}

export async function getPartnerByOwner(ownerId: string): Promise<ReferralPartner | null> {
  const rows = await sql`SELECT * FROM referral_partners WHERE owner_id = ${ownerId} LIMIT 1`;
  return rows[0] ? mapPartner(rows[0]) : null;
}

export async function getPartnerByEmail(email: string): Promise<ReferralPartner | null> {
  const rows = await sql`
    SELECT * FROM referral_partners WHERE LOWER(email) = ${email.trim().toLowerCase()} LIMIT 1
  `;
  return rows[0] ? mapPartner(rows[0]) : null;
}

/** Links a partner row to a Neon Auth user the first time they sign in, so the portal finds them. */
export async function attachOwner(partnerId: string, ownerId: string): Promise<void> {
  await sql`
    UPDATE referral_partners SET owner_id = ${ownerId}, updated_at = NOW()
    WHERE id = ${partnerId} AND owner_id IS NULL
  `;
}

export async function listPartners(): Promise<ReferralPartner[]> {
  const rows = await sql`
    SELECT * FROM referral_partners
    ORDER BY (status = 'pending') DESC, created_at DESC
  `;
  return rows.map(mapPartner);
}

export async function updatePartner(
  id: string,
  patch: { status?: PartnerStatus; commissionPct?: number; notes?: string | null }
): Promise<ReferralPartner | null> {
  const status =
    patch.status && ['pending', 'active', 'suspended'].includes(patch.status) ? patch.status : null;
  const pct = patch.commissionPct == null ? null : clampCommissionPct(patch.commissionPct);

  const rows = await sql`
    UPDATE referral_partners SET
      status = COALESCE(${status}, status),
      commission_pct = COALESCE(${pct}, commission_pct),
      notes = COALESCE(${patch.notes ?? null}, notes),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapPartner(rows[0]) : null;
}

/* ── Attribution lifecycle ──────────────────────────────────────────────── */

/**
 * Record that an order came through a referral code. Called at order creation, before payment,
 * so commission starts at zero and `pending` — nothing is earned until money is collected.
 *
 * Never throws: a referral problem must not stop someone buying drinks.
 */
export async function attributeOrder(orderId: string, code: string): Promise<boolean> {
  try {
    const partner = await getPartnerByCode(code);
    if (!partner || partner.status !== 'active') return false;

    await sql`
      INSERT INTO referral_attributions (order_id, partner_id, code, commission_pct, order_total_ngn, commission_ngn, status)
      VALUES (${orderId}, ${partner.id}, ${partner.code}, ${partner.commissionPct}, 0, 0, 'pending')
      ON CONFLICT (order_id) DO NOTHING
    `;
    return true;
  } catch (err) {
    captureApiError(err, { route: 'referrals/attributeOrder', orderId });
    return false;
  }
}

/**
 * Order was paid — lock in the commission against what was actually collected.
 *
 * Idempotent: both the Flutterwave verify callback and the webhook fire for the same order, and a
 * `void` attribution (cancelled or refunded) is never resurrected.
 */
export async function approveReferralForOrder(orderId: string): Promise<void> {
  try {
    const [row] = await sql`
      SELECT a.id, a.commission_pct, a.status,
             o.total_ngn, o.subtotal_ngn, o.refunded_ngn
      FROM referral_attributions a
      JOIN ritual_orders o ON o.id = a.order_id
      WHERE a.order_id = ${orderId}
      LIMIT 1
    `;
    if (!row) return;
    if (row.status === 'void' || row.status === 'paid') return;

    const collected = Math.max(
      0,
      Number(row.total_ngn ?? row.subtotal_ngn ?? 0) - Number(row.refunded_ngn ?? 0)
    );
    const owed = commissionNgn(collected, Number(row.commission_pct));

    await sql`
      UPDATE referral_attributions
      SET order_total_ngn = ${collected},
          commission_ngn = ${owed},
          status = 'approved',
          approved_at = COALESCE(approved_at, NOW())
      WHERE id = ${row.id}
    `;
  } catch (err) {
    captureApiError(err, { route: 'referrals/approveReferralForOrder', orderId });
  }
}

/** Order cancelled or refunded — the commission is not owed. Already-paid ones are left alone. */
export async function voidReferralForOrder(orderId: string): Promise<void> {
  try {
    await sql`
      UPDATE referral_attributions
      SET status = 'void', commission_ngn = 0
      WHERE order_id = ${orderId} AND status IN ('pending', 'approved')
    `;
  } catch (err) {
    captureApiError(err, { route: 'referrals/voidReferralForOrder', orderId });
  }
}

export async function markCommissionPaid(
  attributionId: string,
  payoutRef: string | null
): Promise<boolean> {
  const rows = await sql`
    UPDATE referral_attributions
    SET status = 'paid', payout_ref = ${payoutRef}, paid_at = NOW()
    WHERE id = ${attributionId} AND status = 'approved'
    RETURNING id
  `;
  return rows.length > 0;
}

export type PartnerEarnings = {
  partner: ReferralPartner;
  orders: number;
  pendingNgn: number;
  approvedNgn: number;
  paidNgn: number;
  referredRevenueNgn: number;
  recent: {
    id: string;
    orderId: string;
    orderTotalNgn: number;
    commissionNgn: number;
    status: AttributionStatus;
    createdAt: string;
  }[];
};

export async function partnerEarnings(partner: ReferralPartner): Promise<PartnerEarnings> {
  const rows = await sql`
    SELECT id, order_id, order_total_ngn, commission_ngn, status, created_at
    FROM referral_attributions
    WHERE partner_id = ${partner.id}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  const [totals] = await sql`
    SELECT
      COUNT(*)::int AS orders,
      COALESCE(SUM(order_total_ngn) FILTER (WHERE status IN ('approved','paid')), 0)::int AS revenue,
      COALESCE(SUM(commission_ngn) FILTER (WHERE status = 'approved'), 0)::int AS approved,
      COALESCE(SUM(commission_ngn) FILTER (WHERE status = 'paid'), 0)::int AS paid
    FROM referral_attributions
    WHERE partner_id = ${partner.id}
  `;

  return {
    partner,
    orders: Number(totals?.orders ?? 0),
    // Not yet earned — the order exists but has not been paid for.
    pendingNgn: 0,
    approvedNgn: Number(totals?.approved ?? 0),
    paidNgn: Number(totals?.paid ?? 0),
    referredRevenueNgn: Number(totals?.revenue ?? 0),
    recent: rows.map((r) => ({
      id: String(r.id),
      orderId: String(r.order_id),
      orderTotalNgn: Number(r.order_total_ngn ?? 0),
      commissionNgn: Number(r.commission_ngn ?? 0),
      status: r.status as AttributionStatus,
      createdAt: String(r.created_at),
    })),
  };
}

/** Admin view: every attribution with its partner, newest first. */
export async function listAttributions(status?: AttributionStatus) {
  const rows = status
    ? await sql`
        SELECT a.*, p.name AS partner_name, p.code AS partner_code, p.email AS partner_email
        FROM referral_attributions a
        JOIN referral_partners p ON p.id = a.partner_id
        WHERE a.status = ${status}
        ORDER BY a.created_at DESC LIMIT 200
      `
    : await sql`
        SELECT a.*, p.name AS partner_name, p.code AS partner_code, p.email AS partner_email
        FROM referral_attributions a
        JOIN referral_partners p ON p.id = a.partner_id
        ORDER BY a.created_at DESC LIMIT 200
      `;
  return rows.map((r) => ({
    id: String(r.id),
    orderId: String(r.order_id),
    partnerName: String(r.partner_name),
    partnerCode: String(r.partner_code),
    partnerEmail: String(r.partner_email),
    orderTotalNgn: Number(r.order_total_ngn ?? 0),
    commissionNgn: Number(r.commission_ngn ?? 0),
    commissionPct: Number(r.commission_pct ?? 0),
    status: r.status as AttributionStatus,
    createdAt: String(r.created_at),
    paidAt: r.paid_at ? String(r.paid_at) : null,
  }));
}
