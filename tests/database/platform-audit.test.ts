import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
const mocks = vi.hoisted(() => ({ sql: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mocks.sql }));
import { recordAudit, recordPresence, auditPath } from '@/lib/audit/record';
import { readAudit, readSignedInUsers, type AuditFilters } from '@/lib/audit/read';
import { auditDetail } from '@/lib/audit/detail';
let db: PGlite;
const user = { id: 'user-1', email: 'owner@example.com', name: 'Owner', image: null };
const filters: AuditFilters = { search: '', category: '', outcome: '', from: null, to: null, before: null, limit: 50 };
beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync('lib/db/bootstrap.sql', 'utf8'));
  for (const file of ['schema.sql', 'venues-migration.sql', 'ecommerce.sql', 'suppliers-portal.sql', 'desk-raffle-giftcards.sql', 'launch-readiness.sql', 'platform-audit.sql']) await db.exec(readFileSync('lib/db/' + file, 'utf8'));
  await db.exec(readFileSync('lib/db/platform-audit.sql', 'utf8'));
  mocks.sql.mockImplementation(async (parts: TemplateStringsArray, ...values: unknown[]) => (await db.query(parts.reduce((text, part, index) => text + (index ? `$${index}` : '') + part, ''), values)).rows);
}, 30000);
afterAll(async () => { await db?.close(); });
describe('platform audit data', () => {
  it('records attributed actions and deduplicates session observations', async () => {
    await recordAudit({ user, category: 'auth', action: 'auth.session.observed', eventKey: 'session:hash' });
    await recordAudit({ user, category: 'auth', action: 'auth.session.observed', eventKey: 'session:hash' });
    expect((await readAudit({ ...filters, category: 'auth' })).entries).toHaveLength(1);
    await recordPresence(user, '/shop');
    expect((await db.query('SELECT * FROM platform_user_activity')).rows[0]).toMatchObject({ user_id: user.id, email: user.email, last_path: '/shop' });
  });
  it('merges existing admin and price ledgers with new actions', async () => {
    await db.query("INSERT INTO admin_audit(actor,action,subject) VALUES($1,'staff.update','staff@example.com')", [user.id]);
    await db.exec("INSERT INTO inventory_movements(slug,reason,note,actor,actor_label) VALUES('drink','adjust','Retail (NGN): 10000 → 12000','admin','owner@example.com')");
    const result = await readAudit({ ...filters, search: user.email });
    expect(result.entries.map(row => row.category)).toEqual(expect.arrayContaining(['auth', 'admin', 'drinks']));
    expect(result.entries.find(row => row.category === 'drinks')?.detail.note).toContain('10000 → 12000');
  });
  it('filters outcomes and paginates without repeating boundary records', async () => {
    await recordAudit({ user, category: 'api', action: 'POST /api/orders', status: 403 });
    await recordAudit({ user, category: 'api', action: 'POST /api/cart', status: 200 });
    const rejected = await readAudit({ ...filters, outcome: 'rejected' });
    expect(rejected.entries).toHaveLength(1); expect(rejected.entries[0].status).toBe(403);
    const first = await readAudit({ ...filters, limit: 2 });
    expect(first.nextCursor).toBeTruthy();
    const second = await readAudit({ ...filters, limit: 2, before: first.nextCursor });
    expect(second.entries.some(row => first.entries.some(old => old.id === row.id))).toBe(false);
  });
  it('marks presence fallback accurately when Neon sessions are unavailable', async () => {
    const result = await readSignedInUsers('', 0);
    expect(result.source).toBe('presence'); expect(result.warning).toContain('cannot be confirmed');
    expect(result.users[0]).toMatchObject({ userId: user.id, sessions: null });
  });
  it('lists all unexpired Neon sessions grouped by user and excludes expired sessions', async () => {
    await db.exec(`CREATE SCHEMA neon_auth;
      CREATE TABLE neon_auth."user" (id text PRIMARY KEY, email text, name text);
      CREATE TABLE neon_auth.session (id text, "userId" text, "expiresAt" timestamptz, "createdAt" timestamptz DEFAULT NOW(), token text);
      INSERT INTO neon_auth."user" VALUES ('user-1','owner@example.com','Owner'), ('user-2','other@example.com','Other'), ('expired','expired@example.com','Expired');
      INSERT INTO neon_auth.session(id,"userId","expiresAt",token) VALUES ('s1','user-1',NOW()+INTERVAL '1 day','secret'), ('s2','user-1',NOW()+INTERVAL '2 days','secret2'), ('s3','user-2',NOW()+INTERVAL '1 day','secret3'), ('s4','expired',NOW()-INTERVAL '1 day','old');`);
    const result = await readSignedInUsers('', 0);
    expect(result.source).toBe('neon'); expect(result.total).toBe(2);
    expect(result.users.find(row => row.userId === user.id)?.sessions).toBe(2);
    expect(JSON.stringify(result)).not.toContain('secret');
    expect((await readSignedInUsers('other@example.com', 0)).users).toHaveLength(1);
  });
  it('redacts credential details and sensitive URLs', () => {
    expect(auditDetail({ password: 'secret', nested: { accessToken: 'secret', price: 12000 } })).toEqual({ password: '[redacted]', nested: { accessToken: '[redacted]', price: 12000 } });
    expect(auditPath('/shop?password=secret')).toBe('/shop');
    expect(auditPath('//evil.example')).toBeNull();
  });
});
