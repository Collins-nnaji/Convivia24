import { withAudit } from '@/lib/audit/route';
import sql from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { generateCode } from '@/lib/commerce/gift-cards';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import {
  listAttributions,
  listPartners,
  markCommissionPaid,
  updatePartner,
  type PartnerStatus,
} from '@/lib/referrals/repo';

async function handleGET() {
  const gate = await requireAdmin('finance');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const [partners, attributions] = await Promise.all([listPartners(), listAttributions()]);
    return NextResponse.json({ partners, attributions });
  } catch (err) {
    captureApiError(err, { route: 'admin/referrals GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load referrals.');
    return NextResponse.json({ error }, { status });
  }
}

async function handlePATCH(req: NextRequest) {
  const gate = await requireAdmin('finance');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));

    // Paying a commission out — optionally as a gift card, reusing the existing ledger.
    if (body.action === 'pay') {
      const attributionId = typeof body.attributionId === 'string' ? body.attributionId.trim() : '';
      if (!attributionId) {
        return NextResponse.json({ error: 'attributionId is required.' }, { status: 400 });
      }

      const payoutRef = typeof body.payoutRef === 'string' ? body.payoutRef.trim() || null : null;
      const giftCardCode: string | null = null;

      if (body.asGiftCard === true) {
        const code = generateCode();
        const [issued] = await sql`
          WITH payable AS (
            UPDATE referral_attributions SET status = 'paid',payout_ref = ${'giftcard:' + code},paid_at = NOW()
            WHERE id = ${attributionId}::uuid AND status = 'approved' AND commission_ngn > 0 RETURNING commission_ngn
          ) INSERT INTO gift_cards(code,value_ngn,balance_ngn,issued_by,note)
            SELECT ${code},commission_ngn,commission_ngn,'admin',${'Referral payout ' + attributionId} FROM payable RETURNING code
        `;
        if (!issued) return NextResponse.json({ error: 'Only an approved commission can be paid.' }, { status: 409 });
        return NextResponse.json({ ok: true, giftCardCode: code, payoutRef: 'giftcard:' + code });
      }
      if (!payoutRef) return NextResponse.json({ error: 'Record the bank payout reference.' }, { status: 400 });

      const ok = await markCommissionPaid(attributionId, payoutRef);
      if (!ok) {
        return NextResponse.json(
          { error: 'Only an approved commission can be paid.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ ok: true, giftCardCode, payoutRef });
    }

    const partnerId = typeof body.partnerId === 'string' ? body.partnerId.trim() : '';
    if (!partnerId) return NextResponse.json({ error: 'partnerId is required.' }, { status: 400 });

    const status =
      typeof body.status === 'string' && ['pending', 'active', 'suspended'].includes(body.status)
        ? (body.status as PartnerStatus)
        : undefined;
    const commissionPct = body.commissionPct == null ? undefined : Number(body.commissionPct);
    if (commissionPct != null && !Number.isFinite(commissionPct)) {
      return NextResponse.json({ error: 'Commission must be a number.' }, { status: 400 });
    }
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : undefined;

    const partner = await updatePartner(partnerId, { status, commissionPct, notes });
    if (!partner) return NextResponse.json({ error: 'Partner not found.' }, { status: 404 });
    return NextResponse.json({ partner });
  } catch (err) {
    captureApiError(err, { route: 'admin/referrals PATCH' });
    const { status, error } = apiErrorResponse(err, 'Unable to update referrals.');
    return NextResponse.json({ error }, { status });
  }
}

export const GET = withAudit('/api/admin/referrals', handleGET);
export const PATCH = withAudit('/api/admin/referrals', handlePATCH);
