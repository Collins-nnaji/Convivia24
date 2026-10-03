import { withAudit } from '@/lib/audit/route';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { getCurrentUser } from '@/lib/auth/session';
import sql, { apiErrorResponse } from '@/lib/db';
async function handleGET() {
  const gate = await requireAdmin('read');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const [outlets, wholesale, rewards] = await Promise.all([
      sql`SELECT id, venue_name, email, contact, area, venue_kind, seats, target_margin_pct, approval_status, created_at, updated_at FROM partner_outlets ORDER BY created_at DESC LIMIT 200`,
      sql`SELECT w.*, o.venue_name FROM partner_wholesale_orders w JOIN partner_outlets o ON o.id = w.outlet_id ORDER BY w.created_at DESC LIMIT 200`,
      sql`SELECT r.*, m.email FROM reward_redemptions r LEFT JOIN loyalty_members m ON m.owner_id = r.owner_id ORDER BY r.created_at DESC LIMIT 200`,
    ]);
    return NextResponse.json({ outlets, wholesale, rewards });
  } catch (err) { const { status, error } = apiErrorResponse(err); return NextResponse.json({ error }, { status }); }
}
async function handlePOST(req: NextRequest) {
  const gate = await requireAdmin('read');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json();
    const id = String(body.id || ''); const status = String(body.status || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Valid record ID required.' }, { status: 400 });
    let updated;
    const permission = await requireAdmin(body.kind === 'outlet' ? 'owner' : body.kind === 'wholesale' && ['paid','refunded'].includes(status) ? 'finance' : 'operations');
    if (permission.ok === false) return NextResponse.json({ error: permission.error }, { status: permission.status });
    if (body.kind === 'outlet' && ['approved','suspended','pending'].includes(status)) {
      updated = await sql`UPDATE partner_outlets SET approval_status = ${status}, updated_at = NOW() WHERE id = ${id}::uuid RETURNING id`;
    } else if (body.kind === 'reward' && ['fulfilled','cancelled'].includes(status)) {
      await sql`SELECT c24_finish_reward(${id}::uuid, ${status}, ${String(body.note || '').slice(0, 500)})`;
      updated = [{ id }];
    } else if (body.kind === 'wholesale') {
      const reference = String(body.reference || '').trim().slice(0, 120);
      const from = ({ paid: 'awaiting_payment', packed: 'paid', dispatched: 'packed' } as Record<string, string>)[status];
      if (status === 'refunded') {
        await sql`SELECT c24_refund_wholesale(${id}::uuid,${Number(body.amountNgn)}::integer,${reference},${gate.actor})`;
        updated = [{ id }];
      } else if (from) {
        if ((status === 'paid' || status === 'dispatched') && !reference) return NextResponse.json({ error: 'Payment or dispatch reference is required.' }, { status: 400 });
        const [result] = await sql`SELECT c24_transition_wholesale(${id}::uuid,${from},${status},${reference}) AS changed`;
        updated = result.changed ? [{ id }] : [];
      } else if (status === 'cancelled') {
        updated = await sql`UPDATE partner_wholesale_orders SET status = 'cancelled' WHERE id = ${id}::uuid AND status = 'awaiting_payment' RETURNING id`;
      } else return NextResponse.json({ error: 'Unsupported transition.' }, { status: 400 });
    } else return NextResponse.json({ error: 'Unknown operation.' }, { status: 400 });
    if (!updated.length) return NextResponse.json({ error: 'Record changed or transition is unavailable. Refresh and retry.' }, { status: 409 });
    const user = await getCurrentUser();
    await sql`INSERT INTO admin_audit(actor,action,subject,detail) VALUES(${user?.id || 'shared-admin'}, ${String(body.kind) + '.' + status}, ${id}, ${JSON.stringify({ reference: body.reference, note: body.note })}::jsonb)`;
    return NextResponse.json({ ok: true });
  } catch (err) { const { status, error } = apiErrorResponse(err, 'Could not complete operation.'); return NextResponse.json({ error }, { status }); }
}

export const GET = withAudit('/api/admin/operations', handleGET);
export const POST = withAudit('/api/admin/operations', handlePOST);
