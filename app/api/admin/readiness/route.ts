import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import sql from '@/lib/db';
import { configurationChecks, readinessFailureMessage, type ReadinessCheck } from '@/lib/launch-readiness';

export async function GET() {
  const gate = await requireAdmin('owner');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const checks = configurationChecks(process.env);
  async function inspect(name: string, run: () => Promise<Pick<ReadinessCheck, 'ok' | 'detail'>>) {
    try { return { name, ...await run() }; }
    catch (err) {
      console.error(`Readiness: ${name}`, err);
      return { name, ok: false, detail: readinessFailureMessage(err) };
    }
  }
  let stockMismatches: Record<string, unknown>[] = [];
  let supplierStockMismatches: Record<string, unknown>[] = [];
  checks.push(...await Promise.all([
    inspect('Supplier setup', async () => {
      const [row] = await sql`SELECT COUNT(*)::int AS n FROM suppliers WHERE active`;
      return { ok: Number(row.n) === 1, detail: `${row.n} active suppliers. Keep one active supplier for the current fulfillment setup.` };
    }),
    inspect('Delivery coverage', async () => {
      const zones = await sql`SELECT DISTINCT city FROM delivery_zones WHERE active`;
      return { ok: zones.length > 0, detail: zones.length ? `Enabled delivery cities: ${zones.map(zone => zone.city).join(', ')}. Confirm these are served by your supplier.` : 'Enable at least one validated delivery zone served by your supplier. Checkout shows enabled areas only.' };
    }),
    inspect('Courier providers', async () => {
      const [row] = await sql`SELECT COUNT(*)::int AS n FROM delivery_providers WHERE active`;
      return { ok: Number(row.n) > 0, detail: `${row.n} enabled courier providers. Keep a current booking contact for fulfillment.` };
    }),
    inspect('Stock ledger reconciliation', async () => {
      [stockMismatches, supplierStockMismatches] = await Promise.all([
        sql`SELECT i.slug,i.reserved,COALESCE(SUM(r.qty),0)::int AS ledger FROM inventory i LEFT JOIN order_stock_reservations r ON r.slug=i.slug AND r.state='reserved' GROUP BY i.slug HAVING i.reserved<>COALESCE(SUM(r.qty),0)`,
        sql`SELECT s.supplier_id,s.slug,s.reserved,COALESCE(SUM(r.qty),0)::int AS ledger FROM supplier_stock s LEFT JOIN order_stock_reservations r ON r.supplier_id=s.supplier_id AND r.slug=s.slug AND r.state='reserved' GROUP BY s.supplier_id,s.slug HAVING s.reserved<>COALESCE(SUM(r.qty),0)`,
      ]);
      return { ok: !stockMismatches.length && !supplierStockMismatches.length, detail: `${stockMismatches.length} inventory and ${supplierStockMismatches.length} supplier mismatches. Reconcile physical stock and outstanding holds before launch.` };
    }),
    inspect('Notification delivery', async () => {
      const [row] = await sql`SELECT COUNT(*)::int AS n FROM notification_jobs WHERE status='failed' OR (status IN ('pending','processing') AND created_at<NOW()-INTERVAL '30 minutes')`;
      return { ok: Number(row.n) === 0, detail: `${row.n} failed or overdue notifications. Retry failed messages from Refunds & exceptions.` };
    }),
    inspect('Payment exceptions', async () => {
      const [row] = await sql`SELECT COUNT(*)::int AS n FROM payment_receipts WHERE exception IS NOT NULL`;
      return { ok: Number(row.n) === 0, detail: `${row.n} unresolved payment exceptions. Verify external reconciliation before clearing each exception.` };
    }),
    ...(process.env.NEXT_PUBLIC_EVENTS_ENABLED === 'true' ? [inspect('Live events', async () => {
      const [row] = await sql`SELECT COUNT(*)::int AS n FROM night_events WHERE published AND ends_at>NOW()`;
      return { ok: Number(row.n) > 0, detail: `${row.n} published future events. Publish verified listings in Events & venues.` };
    })] : []),
  ]));
  return NextResponse.json({ targetDate: '2026-11-01', ready: checks.every(check => check.ok), checks, stockMismatches, supplierStockMismatches }, { headers: { 'Cache-Control': 'no-store' } });
}
