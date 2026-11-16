import { withAudit } from '@/lib/audit/route';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { adminEmails } from '@/lib/admin-emails';
import sql, { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';
import { profit } from '@/lib/accounting/queries';
import {
  EXPENSE_CATEGORIES,
  RETAIN_PCT,
  currentPeriod,
  monthRange,
  partnerName,
  shiftPeriod,
  splitProfit,
  type Partner,
} from '@/lib/finance/profit-share';

/**
 * Finance desk: monthly partner profit share, manual expenses, and payouts to partners and
 * suppliers. Partners are the full-access desk admins (CONVIVIA_ADMIN_EMAILS); each gets an
 * equal cut of net profit after RETAIN_PCT is kept in the business.
 */

const PERIOD = /^\d{4}-\d{2}$/;
const UUID = /^[0-9a-f-]{36}$/i;
/** Orders whose supplier cost is a real debt: collected and not cancelled. */
const OWED_STATUSES_EXCLUDED = ['pending', 'awaiting_payment', 'cancelled'];

function partners(): Partner[] {
  return adminEmails().map((email) => ({ key: email, name: partnerName(email) }));
}

const n = (v: unknown) => Number(v ?? 0) || 0;
const text = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const money = (v: unknown) => {
  const x = Math.round(Number(v));
  return Number.isFinite(x) && x > 0 ? x : null;
};

async function audit(actor: string, action: string, subject: string, detail: unknown) {
  await sql`INSERT INTO admin_audit(actor, action, subject, detail) VALUES(${actor}, ${action}, ${subject}, ${JSON.stringify(detail)}::jsonb)`;
}

/**
 * Write (or refresh) the month's profit-share lines. Paid lines never change; pending lines track
 * the books, so a late refund or expense corrects the share until someone pays it out.
 */
async function syncProfitShare(period: string, actor: string) {
  const range = monthRange(period);
  const pnl = await profit(range.from, range.to);
  const split = splitProfit(pnl.netProfitNgn, partners());
  for (const share of split.shares) {
    if (share.amountNgn > 0) {
      await sql`
        INSERT INTO payouts(kind, payee_key, payee_name, period, amount_ngn, note, created_by)
        VALUES('profit_share', ${share.key}, ${share.name}, ${period}, ${share.amountNgn},
               ${`${split.partnerPct}% of ${range.label} net profit`}, ${actor})
        ON CONFLICT (payee_key, period) WHERE kind = 'profit_share' AND status <> 'void'
        DO UPDATE SET amount_ngn = EXCLUDED.amount_ngn, note = EXCLUDED.note, updated_at = NOW()
        WHERE payouts.status = 'pending'
      `;
    } else {
      // The month no longer shows a profit — withdraw any unpaid share.
      await sql`
        UPDATE payouts SET status = 'void', note = 'Month closed without profit', updated_at = NOW()
        WHERE kind = 'profit_share' AND period = ${period} AND payee_key = ${share.key} AND status = 'pending'
      `;
    }
  }
  return split;
}

async function handleGET(req: NextRequest) {
  const gate = await requireAdmin('finance');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const now = currentPeriod();
  const period = req.nextUrl.searchParams.get('period') || now;
  const allTime = period === 'all';
  if (!allTime && !PERIOD.test(period)) return NextResponse.json({ error: 'Period must be YYYY-MM or all.' }, { status: 400 });

  try {
    // Automatic close: last month's shares appear as pending payouts without anyone asking.
    const lastMonth = shiftPeriod(now, -1);
    await syncProfitShare(lastMonth, 'system').catch((err) => captureApiError(err, { route: 'admin/finance auto-close' }));

    // "All time" runs from before the first order to the end of today.
    const range = allTime
      ? { from: '2020-01-01T00:00:00.000Z', to: new Date(Date.now() + 86_400_000).toISOString(), label: 'All time' }
      : monthRange(period);
    const [pnl, expenses, byCategory, payoutRows, supplierRows, commissionRow] = await Promise.all([
      profit(range.from, range.to),
      sql`
        SELECT id, spent_on, category, description, amount_ngn, paid_to, reference, created_by, created_at, voided_at, void_reason
        FROM business_expenses
        WHERE spent_on >= (${range.from}::timestamptz AT TIME ZONE 'Africa/Lagos')::date
          AND spent_on < (${range.to}::timestamptz AT TIME ZONE 'Africa/Lagos')::date
        ORDER BY spent_on DESC, created_at DESC
      `,
      sql`
        SELECT category, COALESCE(SUM(amount_ngn), 0)::bigint AS total
        FROM business_expenses
        WHERE voided_at IS NULL
          AND spent_on >= (${range.from}::timestamptz AT TIME ZONE 'Africa/Lagos')::date
          AND spent_on < (${range.to}::timestamptz AT TIME ZONE 'Africa/Lagos')::date
        GROUP BY category ORDER BY total DESC
      `,
      sql`
        SELECT id, kind, payee_key, payee_name, period, amount_ngn, status, reference, note, created_by, created_at, paid_at, paid_by
        FROM payouts
        WHERE ${allTime}
           OR status = 'pending'
           OR period = ${period}
           OR (COALESCE(paid_at, created_at) >= ${range.from}::timestamptz AND COALESCE(paid_at, created_at) < ${range.to}::timestamptz)
        ORDER BY (status = 'pending') DESC, created_at DESC
        LIMIT 500
      `,
      sql`
        WITH owed AS (
          SELECT supplier_id, COALESCE(SUM(supplier_cost_ngn), 0)::bigint AS owed, COUNT(*)::int AS orders
          FROM ritual_orders
          WHERE supplier_id IS NOT NULL AND supplier_cost_ngn IS NOT NULL
            AND status <> ALL(${OWED_STATUSES_EXCLUDED})
          GROUP BY supplier_id
        ), settled AS (
          SELECT payee_key,
                 COALESCE(SUM(amount_ngn) FILTER (WHERE status = 'paid'), 0)::bigint AS paid,
                 COALESCE(SUM(amount_ngn) FILTER (WHERE status = 'pending'), 0)::bigint AS queued
          FROM payouts WHERE kind = 'supplier' GROUP BY payee_key
        )
        SELECT s.id, s.name, s.active, COALESCE(o.owed, 0) AS owed, COALESCE(o.orders, 0) AS orders,
               COALESCE(p.paid, 0) AS paid, COALESCE(p.queued, 0) AS queued
        FROM suppliers s
        LEFT JOIN owed o ON o.supplier_id = s.id
        LEFT JOIN settled p ON p.payee_key = s.id::text
        WHERE s.active OR COALESCE(o.owed, 0) > 0
        ORDER BY (COALESCE(o.owed, 0) - COALESCE(p.paid, 0)) DESC, s.name
      `,
      sql`
        SELECT COUNT(*)::int AS count, COALESCE(SUM(commission_ngn), 0)::bigint AS total
        FROM referral_attributions WHERE status = 'approved' AND commission_ngn > 0
      `,
    ]);

    const split = splitProfit(pnl.netProfitNgn, partners());
    const shareRows = payoutRows.filter((r) => r.kind === 'profit_share' && r.period === period);

    return NextResponse.json({
      period: { key: period, label: range.label, allTime, closed: !allTime && period < now, current: period === now },
      retainPct: RETAIN_PCT,
      pnl: {
        netRevenueNgn: pnl.netRevenueNgn,
        cogsNgn: pnl.cogsNgn,
        grossProfitNgn: pnl.grossProfitNgn,
        feesNgn: pnl.flutterwaveNgn + pnl.accessNgn,
        deliveryNgn: pnl.deliveryCostNgn ?? 0,
        commissionsNgn: pnl.commissionsAccruedNgn,
        loyaltyNgn: pnl.loyaltyAccruedNgn,
        expensesNgn: pnl.expensesNgn,
        netProfitNgn: pnl.netProfitNgn,
        unsourcedOrders: pnl.unsourcedOrders,
        orderCount: pnl.orderCount,
      },
      share: {
        ...split,
        shares: split.shares.map((s) => {
          const line = shareRows.find((r) => r.payee_key === s.key && r.status !== 'void');
          return { ...s, payoutId: line ? String(line.id) : null, status: line ? String(line.status) : null };
        }),
      },
      expenses: expenses.map((r) => ({
        id: String(r.id),
        spentOn: String(r.spent_on instanceof Date ? r.spent_on.toISOString().slice(0, 10) : r.spent_on).slice(0, 10),
        category: String(r.category),
        description: String(r.description),
        amountNgn: n(r.amount_ngn),
        paidTo: r.paid_to ? String(r.paid_to) : null,
        reference: r.reference ? String(r.reference) : null,
        createdBy: String(r.created_by),
        voided: Boolean(r.voided_at),
        voidReason: r.void_reason ? String(r.void_reason) : null,
      })),
      expensesByCategory: byCategory.map((r) => ({ category: String(r.category), totalNgn: n(r.total) })),
      payouts: payoutRows.map((r) => ({
        id: String(r.id),
        kind: String(r.kind),
        payeeKey: String(r.payee_key),
        payeeName: String(r.payee_name),
        period: r.period ? String(r.period) : null,
        amountNgn: n(r.amount_ngn),
        status: String(r.status),
        reference: r.reference ? String(r.reference) : null,
        note: r.note ? String(r.note) : null,
        createdAt: String(r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at),
        paidAt: r.paid_at ? String(r.paid_at instanceof Date ? r.paid_at.toISOString() : r.paid_at) : null,
        paidBy: r.paid_by ? String(r.paid_by) : null,
      })),
      suppliers: supplierRows.map((r) => {
        const owed = n(r.owed);
        const paid = n(r.paid);
        const queued = n(r.queued);
        return {
          id: String(r.id),
          name: String(r.name),
          active: Boolean(r.active),
          orders: n(r.orders),
          owedNgn: owed,
          paidNgn: paid,
          queuedNgn: queued,
          dueNgn: Math.max(0, owed - paid - queued),
        };
      }),
      commissions: { count: n(commissionRow[0]?.count), owedNgn: n(commissionRow[0]?.total) },
      categories: EXPENSE_CATEGORIES,
    });
  } catch (err) {
    captureApiError(err, { route: 'admin/finance GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load the finance desk. Run the database migration if this is new.');
    return NextResponse.json({ error }, { status });
  }
}

async function handlePOST(req: NextRequest) {
  const gate = await requireAdmin('finance');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const actor = gate.actorLabel || gate.actor;
  try {
    const body = await req.json().catch(() => ({}));
    const action = text(body.action, 40);

    if (action === 'add-expense') {
      const spentOn = text(body.spentOn, 10);
      const category = text(body.category, 30);
      const description = text(body.description, 300);
      const amountNgn = money(body.amountNgn);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(spentOn)) return NextResponse.json({ error: 'Pick the date the money was spent.' }, { status: 400 });
      if (!(EXPENSE_CATEGORIES as readonly string[]).includes(category)) return NextResponse.json({ error: 'Choose a category.' }, { status: 400 });
      if (!description) return NextResponse.json({ error: 'Describe what the money was for.' }, { status: 400 });
      if (!amountNgn) return NextResponse.json({ error: 'Enter an amount above zero.' }, { status: 400 });
      const [row] = await sql`
        INSERT INTO business_expenses(spent_on, category, description, amount_ngn, paid_to, reference, created_by)
        VALUES(${spentOn}::date, ${category}, ${description}, ${amountNgn}, ${text(body.paidTo) || null}, ${text(body.reference, 120) || null}, ${actor})
        RETURNING id
      `;
      await audit(actor, 'expense.added', String(row.id), { spentOn, category, amountNgn });
      return NextResponse.json({ ok: true, id: String(row.id) });
    }

    if (action === 'void-expense') {
      const id = text(body.id, 36);
      const reason = text(body.reason, 300);
      if (!UUID.test(id)) return NextResponse.json({ error: 'Valid expense ID required.' }, { status: 400 });
      if (!reason) return NextResponse.json({ error: 'Say why the expense is being voided.' }, { status: 400 });
      const done = await sql`UPDATE business_expenses SET voided_at = NOW(), void_reason = ${reason} WHERE id = ${id}::uuid AND voided_at IS NULL RETURNING id`;
      if (!done.length) return NextResponse.json({ error: 'Expense was already voided. Refresh and retry.' }, { status: 409 });
      await audit(actor, 'expense.voided', id, { reason });
      return NextResponse.json({ ok: true });
    }

    if (action === 'close-month') {
      const period = text(body.period, 7);
      if (!PERIOD.test(period)) return NextResponse.json({ error: 'Period must be YYYY-MM.' }, { status: 400 });
      if (period >= currentPeriod()) return NextResponse.json({ error: 'A month can only be closed once it has ended.' }, { status: 400 });
      const split = await syncProfitShare(period, actor);
      await audit(actor, 'profit-share.closed', period, { netProfitNgn: split.netProfitNgn, distributableNgn: split.distributableNgn });
      return NextResponse.json({ ok: true });
    }

    if (action === 'create-payout') {
      const kind = text(body.kind, 20);
      if (kind !== 'supplier' && kind !== 'other') return NextResponse.json({ error: 'Choose a supplier or other payout.' }, { status: 400 });
      const amountNgn = money(body.amountNgn);
      if (!amountNgn) return NextResponse.json({ error: 'Enter an amount above zero.' }, { status: 400 });
      let payeeKey = text(body.payeeKey, 120);
      let payeeName = text(body.payeeName, 120);
      if (kind === 'supplier') {
        if (!UUID.test(payeeKey)) return NextResponse.json({ error: 'Choose a supplier.' }, { status: 400 });
        const [sup] = await sql`SELECT id, name FROM suppliers WHERE id = ${payeeKey}::uuid`;
        if (!sup) return NextResponse.json({ error: 'Supplier not found.' }, { status: 404 });
        payeeKey = String(sup.id);
        payeeName = String(sup.name);
      } else if (!payeeName) {
        return NextResponse.json({ error: 'Who is being paid?' }, { status: 400 });
      } else {
        payeeKey = payeeKey || payeeName.toLowerCase();
      }
      const paid = body.paid === true;
      const reference = text(body.reference, 120);
      if (paid && !reference) return NextResponse.json({ error: 'Enter the transfer reference for a payment already made.' }, { status: 400 });
      const [row] = await sql`
        INSERT INTO payouts(kind, payee_key, payee_name, amount_ngn, status, reference, note, created_by, paid_at, paid_by)
        VALUES(${kind}, ${payeeKey}, ${payeeName}, ${amountNgn}, ${paid ? 'paid' : 'pending'}, ${reference || null},
               ${text(body.note, 300) || null}, ${actor}, ${paid ? new Date().toISOString() : null}::timestamptz, ${paid ? actor : null})
        RETURNING id
      `;
      await audit(actor, paid ? 'payout.recorded' : 'payout.queued', String(row.id), { kind, payeeName, amountNgn, reference });
      return NextResponse.json({ ok: true, id: String(row.id) });
    }

    if (action === 'mark-paid' || action === 'void-payout') {
      const id = text(body.id, 36);
      if (!UUID.test(id)) return NextResponse.json({ error: 'Valid payout ID required.' }, { status: 400 });
      if (action === 'mark-paid') {
        const reference = text(body.reference, 120);
        if (!reference) return NextResponse.json({ error: 'Enter the bank transfer reference.' }, { status: 400 });
        const done = await sql`
          UPDATE payouts SET status = 'paid', reference = ${reference}, paid_at = NOW(), paid_by = ${actor}, updated_at = NOW()
          WHERE id = ${id}::uuid AND status = 'pending' RETURNING id, amount_ngn, payee_name
        `;
        if (!done.length) return NextResponse.json({ error: 'Payout is no longer pending. Refresh and retry.' }, { status: 409 });
        await audit(actor, 'payout.paid', id, { reference, amountNgn: n(done[0].amount_ngn), payee: done[0].payee_name });
        return NextResponse.json({ ok: true });
      }
      const reason = text(body.reason, 300);
      if (!reason) return NextResponse.json({ error: 'Say why the payout is cancelled.' }, { status: 400 });
      const done = await sql`
        UPDATE payouts SET status = 'void', note = ${reason}, updated_at = NOW()
        WHERE id = ${id}::uuid AND status = 'pending' RETURNING id
      `;
      if (!done.length) return NextResponse.json({ error: 'Only a pending payout can be cancelled. Refresh and retry.' }, { status: 409 });
      await audit(actor, 'payout.voided', id, { reason });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Choose a supported finance action.' }, { status: 400 });
  } catch (err) {
    captureApiError(err, { route: 'admin/finance POST' });
    const { status, error } = apiErrorResponse(err, 'Could not save. Refresh and retry.');
    return NextResponse.json({ error }, { status });
  }
}

export const GET = withAudit('/api/admin/finance', handleGET);
export const POST = withAudit('/api/admin/finance', handlePOST);
