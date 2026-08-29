import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { EMPTY_TASTE_PROFILE, sanitizeProfile, type TasteProfile } from '@/lib/trivia/taste';

/** Taste profiles are account-bound; guests keep theirs in the browser. */
export async function resolveTasteOwner(): Promise<string | null> {
  const user = await getCurrentUser();
  return user ? `user:${user.id}` : null;
}

function mapRow(r: Record<string, unknown>): TasteProfile {
  return sanitizeProfile({
    spirits: r.spirits,
    flavours: r.flavours,
    occasions: r.occasions,
    priceBand: r.price_band,
  });
}

export async function getTasteProfile(ownerId: string): Promise<TasteProfile | null> {
  const rows = await sql`SELECT * FROM taste_profiles WHERE owner_id = ${ownerId} LIMIT 1`;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function saveTasteProfile(ownerId: string, input: unknown): Promise<TasteProfile> {
  const p = sanitizeProfile(input);
  const rows = await sql`
    INSERT INTO taste_profiles (owner_id, spirits, flavours, occasions, price_band)
    VALUES (${ownerId}, ${p.spirits}, ${p.flavours}, ${p.occasions}, ${p.priceBand})
    ON CONFLICT (owner_id) DO UPDATE SET
      spirits = EXCLUDED.spirits,
      flavours = EXCLUDED.flavours,
      occasions = EXCLUDED.occasions,
      price_band = EXCLUDED.price_band,
      updated_at = NOW()
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : EMPTY_TASTE_PROFILE;
}
