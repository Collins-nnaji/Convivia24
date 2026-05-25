import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

/**
 * PATCH /api/profile/interests
 *   { interest_tags?, social_vibe?, event_types_i_attend? }
 */

const VALID_VIBES = ['chill','hype','social','focused','adventurous','laid-back','creative','spontaneous'];
const VALID_EVENT_TYPES = ['concert','sports','festival','networking','conference','nightlife','university','fitness','travel','dining','arts','other'];

export async function PATCH(req: NextRequest) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const body = await req.json().catch(() => ({}));
  const { interest_tags, social_vibe, event_types_i_attend } = body;

  const tags: string[] = Array.isArray(interest_tags)
    ? interest_tags.filter((t: unknown) => typeof t === 'string').slice(0, 12)
    : undefined as unknown as string[];

  const vibe: string | null = typeof social_vibe === 'string' && VALID_VIBES.includes(social_vibe)
    ? social_vibe : undefined as unknown as string;

  const eventTypes: string[] = Array.isArray(event_types_i_attend)
    ? event_types_i_attend.filter((t: unknown) => typeof t === 'string' && VALID_EVENT_TYPES.includes(t as string)).slice(0, 8)
    : undefined as unknown as string[];

  const [updated] = await sql`
    UPDATE users SET
      interest_tags        = COALESCE(${tags || null}::text[], interest_tags),
      social_vibe          = COALESCE(${vibe || null}, social_vibe),
      event_types_i_attend = COALESCE(${eventTypes || null}::text[], event_types_i_attend)
    WHERE id = ${user.id}
    RETURNING interest_tags, social_vibe, event_types_i_attend
  `;

  return NextResponse.json({ interests: updated });
}

export async function GET() {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const [row] = await sql`
    SELECT interest_tags, social_vibe, event_types_i_attend FROM users WHERE id = ${user.id}
  `;

  return NextResponse.json({ interests: row });
}
