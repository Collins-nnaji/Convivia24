import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ sql: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mocks.sql }));
vi.mock('@/lib/auth/session', () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/admin', () => ({ requireAdmin: vi.fn().mockResolvedValue({ ok: true, actor: 'neon-user-123', actorLabel: 'staff@example.com', role: 'owner' }) }));
import { editStockRow, upsertAdminProduct } from '@/lib/inventory';
import { upsertSupplierSkuPrice, deleteSupplierSkuPrice } from '@/lib/suppliers/sku-prices';
import { GET } from '@/app/api/admin/inventory/movements/route';

let db: PGlite;
const actor = { kind: 'admin' as const, label: 'staff@example.com (neon-user-123)' };
const supplierId = '00000000-0000-0000-0000-000000000001';

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync('lib/db/bootstrap.sql', 'utf8'));
  for (const file of ['schema.sql', 'venues-migration.sql', 'ecommerce.sql', 'suppliers-portal.sql', 'desk-raffle-giftcards.sql', 'launch-readiness.sql']) {
    await db.exec(readFileSync('lib/db/' + file, 'utf8'));
  }
  mocks.sql.mockImplementation(async (parts: TemplateStringsArray, ...values: unknown[]) => {
    const query = parts.reduce((text, part, index) => text + (index ? `$${index}` : '') + part, '');
    return (await db.query(query, values)).rows;
  });
  await db.query("INSERT INTO inventory(slug,name,on_hand,price_ngn,cost_ngn) VALUES('history-test','Test drink',10,10000,6000)");
  await db.query("INSERT INTO suppliers(id,name) VALUES($1,'Test supplier')", [supplierId]);
}, 30000);
afterAll(async () => { await db?.close(); });

describe('drink price history', () => {
  it('records retail and cost before/after, Neon staff identity, and timestamp', async () => {
    await editStockRow('history-test', { priceNgn: 12000, costNgn: 7000 }, actor);
    const { rows } = await db.query('SELECT * FROM inventory_movements WHERE slug=$1', ['history-test']);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ actor: 'admin', actor_label: actor.label, delta_on_hand: 0, note: 'Retail (NGN): 10000 → 12000; Cost (NGN): 6000 → 7000' });
    expect(rows[0].created_at).toBeTruthy();
  });
  it('does not invent a price change when the same values are saved', async () => {
    await editStockRow('history-test', { priceNgn: 12000, costNgn: 7000 }, actor);
    expect((await db.query('SELECT * FROM inventory_movements WHERE slug=$1', ['history-test'])).rows).toHaveLength(1);
  });
  it('records changes through the full product form', async () => {
    await upsertAdminProduct({ slug: 'history-test', name: 'Test drink', onHand: 10, priceNgn: 14000 }, actor);
    const { rows } = await db.query("SELECT * FROM inventory_movements WHERE reason='admin_upload' AND slug='history-test'");
    expect(rows[0]).toMatchObject({ actor_label: actor.label, delta_on_hand: 0, note: 'Product saved. Retail (NGN): 12000 → 14000' });
  });
  it('rolls back a price edit if its history cannot be stored', async () => {
    await db.exec("ALTER TABLE inventory_movements ADD CONSTRAINT reject_test_price CHECK (note NOT LIKE '%99999%')");
    await expect(editStockRow('history-test', { priceNgn: 99999 }, actor)).rejects.toThrow();
    expect((await db.query("SELECT price_ngn FROM inventory WHERE slug='history-test'")).rows[0].price_ngn).toBe(14000);
    await db.exec('ALTER TABLE inventory_movements DROP CONSTRAINT reject_test_price');
  });
  it('records supplier cost additions, changes and removals with the actual staff account', async () => {
    await upsertSupplierSkuPrice(supplierId, 'history-test', 5000, actor.label);
    await upsertSupplierSkuPrice(supplierId, 'history-test', 5500, actor.label);
    await deleteSupplierSkuPrice(supplierId, 'history-test', actor.label);
    const { rows } = await db.query('SELECT * FROM supplier_audit_log ORDER BY created_at');
    expect(rows.map(row => row.detail)).toEqual([{ from: null, to: 5000 }, { from: 5000, to: 5500 }, { from: 5500, to: null }]);
    expect(rows.every(row => row.actor_label === actor.label && row.created_at)).toBe(true);
  });
  it('shows retail and supplier cost changes together in the drink history', async () => {
    const response = await GET(new NextRequest('https://convivia24.com/api/admin/inventory/movements?slug=history-test'));
    expect(response.status).toBe(200);
    const { movements } = await response.json();
    expect(movements).toHaveLength(5);
    expect(movements.find((row: { reason: string }) => row.reason === 'cost.remove')).toMatchObject({
      note: 'Supplier cost (NGN): 5500 → unset', actorLabel: actor.label, supplierName: 'Test supplier',
    });
  });
});

vi.mock('@/lib/audit/route', () => ({ withAudit: (_route: string, handler: unknown) => handler }));
