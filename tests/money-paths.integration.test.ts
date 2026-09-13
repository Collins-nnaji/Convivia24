/**
 * Integration tests for the paths that move stock and money. They run against a real Postgres
 * (a Neon branch is ideal) named by TEST_DATABASE_URL and are skipped otherwise, so the unit
 * suite stays green on a laptop with no database.
 *
 *   TEST_DATABASE_URL=postgres://… npx vitest run tests/
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';

const DB = process.env.TEST_DATABASE_URL;
if (DB) process.env.DATABASE_URL = DB;

const run = DB ? describe : describe.skip;

run('stock reserve / release / fulfil', () => {
  let sql: typeof import('@/lib/db').default;
  let inv: typeof import('@/lib/inventory');
  const slug = `test-bottle-${randomUUID().slice(0, 8)}`;
  const orderA = randomUUID();
  const orderB = randomUUID();

  beforeAll(async () => {
    sql = (await import('@/lib/db')).default;
    inv = await import('@/lib/inventory');
    await sql`
      INSERT INTO inventory (slug, name, on_hand, reserved, low_stock_threshold, track_stock, active, price_ngn)
      VALUES (${slug}, 'Test bottle', 5, 0, 1, true, true, 10000)
    `;
  });

  afterAll(async () => {
    await sql`DELETE FROM inventory_movements WHERE slug = ${slug}`;
    await sql`DELETE FROM inventory WHERE slug = ${slug}`;
  });

  async function row() {
    const [r] = await sql`SELECT on_hand, reserved FROM inventory WHERE slug = ${slug}`;
    return { onHand: Number(r.on_hand), reserved: Number(r.reserved) };
  }

  it('reserves within what is free and refuses beyond it', async () => {
    expect(await inv.reserveStockForOrder([{ slug, qty: 3 }], orderA)).toBeNull();
    expect(await row()).toEqual({ onHand: 5, reserved: 3 });
    const refused = await inv.reserveStockForOrder([{ slug, qty: 3 }], orderB);
    expect(refused).not.toBeNull();
    expect(await row()).toEqual({ onHand: 5, reserved: 3 });
  });

  it('release gives the reservation back without touching on-hand', async () => {
    await inv.reserveStockForOrder([{ slug, qty: 1 }], orderB);
    await inv.releaseStockForOrder([{ slug, qty: 1 }], orderB);
    expect(await row()).toEqual({ onHand: 5, reserved: 3 });
  });

  it('fulfil consumes on-hand and the reservation together', async () => {
    await inv.fulfillStockForOrder([{ slug, qty: 3 }], orderA);
    expect(await row()).toEqual({ onHand: 2, reserved: 0 });
  });

  it('writes a movement for every step with an actor', async () => {
    const rows = await sql`SELECT reason, actor FROM inventory_movements WHERE slug = ${slug} ORDER BY created_at`;
    expect(rows.map((r) => r.reason)).toEqual(['reserve', 'reserve', 'release', 'fulfill']);
    expect(rows.every((r) => r.actor === 'system')).toBe(true);
  });
});

run('gift cards', () => {
  let sql: typeof import('@/lib/db').default;
  let gc: typeof import('@/lib/commerce/gift-cards');
  const ids: string[] = [];

  beforeAll(async () => {
    sql = (await import('@/lib/db')).default;
    gc = await import('@/lib/commerce/gift-cards');
  });
  afterAll(async () => {
    for (const id of ids) await sql`DELETE FROM gift_cards WHERE id = ${id}`;
  });

  it('redeems exactly once', async () => {
    const card = await gc.issueGiftCard('test', 5000);
    ids.push(card.id);
    const first = await gc.redeemGiftCardForOrder(card.code, randomUUID());
    expect('valueNgn' in first && first.valueNgn).toBe(5000);
    const second = await gc.redeemGiftCardForOrder(card.code, randomUUID());
    expect('error' in second && second.error).toMatch(/already been used/);
  });

  it('refuses an expired card and a voided card with the right reason', async () => {
    const expired = await gc.issueGiftCard('test', 5000, null, { expiresAt: new Date(Date.now() - 60_000).toISOString() });
    ids.push(expired.id);
    const r1 = await gc.redeemGiftCardForOrder(expired.code, randomUUID());
    expect('error' in r1 && r1.error).toMatch(/expired/);

    const voided = await gc.issueGiftCard('test', 5000);
    ids.push(voided.id);
    expect(await gc.voidGiftCard(voided.id)).toBe(true);
    expect(await gc.voidGiftCard(voided.id)).toBe(false);
    const r2 = await gc.redeemGiftCardForOrder(voided.code, randomUUID());
    expect('error' in r2 && r2.error).toMatch(/no longer valid/);
  });
});

run('order status transitions', () => {
  let sql: typeof import('@/lib/db').default;
  let tx: typeof import('@/lib/commerce/transitions');
  let orderId: string;

  beforeAll(async () => {
    sql = (await import('@/lib/db')).default;
    tx = await import('@/lib/commerce/transitions');
    const [o] = await sql`
      INSERT INTO ritual_orders (email, full_name, phone, address_line1, city, area, subtotal_ngn, total_ngn, status)
      VALUES ('test@example.com', 'Test Person', null, '1 Test St', 'Lagos', 'Lekki', 10000, 10000, 'paid')
      RETURNING id
    `;
    orderId = String(o.id);
  });
  afterAll(async () => {
    await sql`DELETE FROM order_events WHERE order_id = ${orderId}`;
    await sql`DELETE FROM ritual_orders WHERE id = ${orderId}`;
  });

  it('moves forward, refuses backwards, and refuses reopening a closed order', async () => {
    const a = await tx.applyOrderStatus(orderId, 'packed', { actor: { kind: 'admin' } });
    expect(a.ok).toBe(true);
    const back = await tx.applyOrderStatus(orderId, 'paid', { actor: { kind: 'admin' } });
    expect(back.ok).toBe(false);
    const done = await tx.applyOrderStatus(orderId, 'delivered', { actor: { kind: 'admin' } });
    expect(done.ok).toBe(true);
    const reopen = await tx.applyOrderStatus(orderId, 'out_for_delivery', { actor: { kind: 'admin' } });
    expect(reopen.ok).toBe(false);
  });

  it('a supplier cannot cancel', async () => {
    const r = await tx.applyOrderStatus(orderId, 'cancelled', { actor: { kind: 'supplier', supplierId: randomUUID() }, allowed: ['processing', 'packed', 'out_for_delivery', 'delivered'] });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.httpStatus).toBe(403);
  });
});
