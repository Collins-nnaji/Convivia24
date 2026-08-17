import sql from '@/lib/db';
import type { DrinkPlan } from '@/lib/party/drinks-plan';

/** A party saved from the shop-side planner — the brief plus its drink basket. */
export type SavedParty = {
  id: string;
  name: string;
  occasion: string | null;
  eventDate: string | null;
  venue: string | null;
  guests: number;
  hours: number;
  vibe: string;
  budgetNgn: number | null;
  plan: DrinkPlan | null;
  createdAt: string;
};

export type SavePartyInput = {
  id?: string;
  ownerId: string;
  name: string;
  occasion?: string | null;
  eventDate?: string | null;
  venue?: string | null;
  guests: number;
  hours: number;
  vibe: string;
  budgetNgn?: number | null;
  plan?: DrinkPlan | null;
};

function mapRow(r: Record<string, unknown>): SavedParty {
  return {
    id: String(r.id),
    name: String(r.name),
    occasion: (r.occasion as string) || null,
    eventDate: r.event_date ? String(r.event_date).slice(0, 10) : null,
    venue: (r.venue as string) || null,
    guests: Number(r.guests ?? 0),
    hours: Number(r.hours ?? 0),
    vibe: String(r.vibe || 'balanced'),
    budgetNgn: r.budget_ngn != null ? Number(r.budget_ngn) : null,
    plan: (r.plan as DrinkPlan) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export function validatePartyInput(input: SavePartyInput): string | null {
  if (!input.name.trim()) return 'Give the party a name.';
  if (!Number.isFinite(input.guests) || input.guests < 1) return 'Guest count must be at least 1.';
  if (!Number.isFinite(input.hours) || input.hours < 1) return 'Hours must be at least 1.';
  if (input.eventDate && Number.isNaN(new Date(input.eventDate).getTime())) return 'Date is invalid.';
  return null;
}

export async function listParties(ownerId: string): Promise<SavedParty[]> {
  const rows = await sql`
    SELECT * FROM party_plans WHERE owner_id = ${ownerId} ORDER BY created_at DESC LIMIT 50
  `;
  return rows.map(mapRow);
}

export async function saveParty(input: SavePartyInput): Promise<SavedParty> {
  const guests = Math.max(1, Math.min(800, Math.floor(input.guests)));
  const hours = Math.max(1, Math.min(24, Math.floor(input.hours)));
  const budget = input.budgetNgn != null && input.budgetNgn > 0 ? Math.floor(input.budgetNgn) : null;
  const planJson = input.plan ? JSON.stringify(input.plan) : null;

  const rows = input.id
    ? await sql`
        UPDATE party_plans SET
          name = ${input.name.trim()},
          occasion = ${input.occasion || null},
          event_date = ${input.eventDate || null},
          venue = ${input.venue || null},
          guests = ${guests},
          hours = ${hours},
          vibe = ${input.vibe},
          budget_ngn = ${budget},
          plan = ${planJson}::jsonb,
          updated_at = NOW()
        WHERE id = ${input.id} AND owner_id = ${input.ownerId}
        RETURNING *
      `
    : await sql`
        INSERT INTO party_plans (owner_id, name, occasion, event_date, venue, guests, hours, vibe, budget_ngn, plan)
        VALUES (
          ${input.ownerId}, ${input.name.trim()}, ${input.occasion || null}, ${input.eventDate || null},
          ${input.venue || null}, ${guests}, ${hours}, ${input.vibe}, ${budget}, ${planJson}::jsonb
        )
        RETURNING *
      `;

  if (!rows[0]) throw new Error('Party not found');
  return mapRow(rows[0]);
}

export async function deleteParty(id: string, ownerId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM party_plans WHERE id = ${id} AND owner_id = ${ownerId} RETURNING id`;
  return rows.length > 0;
}
