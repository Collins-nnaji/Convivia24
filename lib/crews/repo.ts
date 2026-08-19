import { randomBytes } from 'crypto';
import sql from '@/lib/db';

export type Crew = {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  status: 'open' | 'checked_out' | 'closed';
  orderId: string | null;
  createdAt: string;
};

export type CrewMember = { userId: string; name: string; joinedAt: string };
export type CrewCartItem = { slug: string; name: string; unitPriceNgn: number; qty: number; addedBy: string };

function mapCrew(r: Record<string, unknown>): Crew {
  return {
    id: String(r.id),
    name: String(r.name),
    inviteCode: String(r.invite_code),
    ownerId: String(r.owner_id),
    status: r.status as Crew['status'],
    orderId: (r.order_id as string) || null,
    createdAt: String(r.created_at),
  };
}

function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export async function createCrew(ownerId: string, ownerName: string, name: string): Promise<Crew> {
  const inviteCode = generateInviteCode();
  const [row] = await sql`
    INSERT INTO crews (name, invite_code, owner_id) VALUES (${name}, ${inviteCode}, ${ownerId}) RETURNING *
  `;
  await sql`
    INSERT INTO crew_members (crew_id, user_id, name) VALUES (${row.id}, ${ownerId}, ${ownerName})
    ON CONFLICT (crew_id, user_id) DO NOTHING
  `;
  return mapCrew(row);
}

export async function myCrews(userId: string): Promise<Crew[]> {
  const rows = await sql`
    SELECT c.* FROM crews c
    JOIN crew_members m ON m.crew_id = c.id
    WHERE m.user_id = ${userId}
    ORDER BY c.created_at DESC
  `;
  return rows.map(mapCrew);
}

export async function getCrew(crewId: string): Promise<Crew | null> {
  const [row] = await sql`SELECT * FROM crews WHERE id = ${crewId} LIMIT 1`;
  return row ? mapCrew(row) : null;
}

export async function isMember(crewId: string, userId: string): Promise<boolean> {
  const [row] = await sql`SELECT 1 FROM crew_members WHERE crew_id = ${crewId} AND user_id = ${userId} LIMIT 1`;
  return Boolean(row);
}

export async function joinCrew(crewId: string, userId: string, name: string): Promise<void> {
  await sql`
    INSERT INTO crew_members (crew_id, user_id, name) VALUES (${crewId}, ${userId}, ${name})
    ON CONFLICT (crew_id, user_id) DO NOTHING
  `;
}

export async function crewMembers(crewId: string): Promise<CrewMember[]> {
  const rows = await sql`SELECT user_id, name, joined_at FROM crew_members WHERE crew_id = ${crewId} ORDER BY joined_at ASC`;
  return rows.map((r) => ({ userId: String(r.user_id), name: String(r.name), joinedAt: String(r.joined_at) }));
}

export async function crewCartItems(crewId: string): Promise<CrewCartItem[]> {
  const rows = await sql`
    SELECT slug, name, unit_price_ngn, qty, added_by FROM crew_cart_items WHERE crew_id = ${crewId} ORDER BY created_at ASC
  `;
  return rows.map((r) => ({
    slug: String(r.slug),
    name: String(r.name),
    unitPriceNgn: Number(r.unit_price_ngn),
    qty: Number(r.qty),
    addedBy: String(r.added_by),
  }));
}

export async function addCrewItem(
  crewId: string,
  item: { slug: string; name: string; unitPriceNgn: number; qty: number },
  addedBy: string
): Promise<void> {
  await sql`
    INSERT INTO crew_cart_items (crew_id, slug, name, unit_price_ngn, qty, added_by)
    VALUES (${crewId}, ${item.slug}, ${item.name}, ${item.unitPriceNgn}, ${item.qty}, ${addedBy})
    ON CONFLICT (crew_id, slug) DO UPDATE SET qty = crew_cart_items.qty + EXCLUDED.qty
  `;
}

export async function removeCrewItem(crewId: string, slug: string): Promise<void> {
  await sql`DELETE FROM crew_cart_items WHERE crew_id = ${crewId} AND slug = ${slug}`;
}

export async function markCrewCheckedOut(crewId: string, orderId: string): Promise<void> {
  await sql`UPDATE crews SET status = 'checked_out', order_id = ${orderId} WHERE id = ${crewId}`;
}
