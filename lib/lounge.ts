import sql from '@/lib/db';

export interface EventGuest {
  id: string;
  event_id: string;
  user_id: string;
  display_name: string;
  headline: string | null;
  avatar_url: string | null;
  intent_badge: string | null;
  is_public: boolean;
}

export async function listPublicGuests(eventId: string): Promise<EventGuest[]> {
  const rows = await sql`
    SELECT * FROM event_guests
    WHERE event_id = ${eventId} AND is_public = true
    ORDER BY created_at ASC
  `;
  return rows as unknown as EventGuest[];
}

export async function upsertGuestProfile(data: {
  eventId: string;
  userId: string;
  displayName: string;
  headline?: string;
  avatarUrl?: string;
  intentBadge?: string;
  isPublic?: boolean;
  ticketId?: string;
}): Promise<EventGuest> {
  const rows = await sql`
    INSERT INTO event_guests (event_id, user_id, display_name, headline, avatar_url, intent_badge, is_public, ticket_id)
    VALUES (
      ${data.eventId}, ${data.userId}, ${data.displayName},
      ${data.headline ?? null}, ${data.avatarUrl ?? null},
      ${data.intentBadge ?? null}, ${data.isPublic ?? true}, ${data.ticketId ?? null}
    )
    ON CONFLICT (event_id, user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      headline = EXCLUDED.headline,
      avatar_url = COALESCE(EXCLUDED.avatar_url, event_guests.avatar_url),
      intent_badge = EXCLUDED.intent_badge,
      is_public = EXCLUDED.is_public,
      updated_at = NOW()
    RETURNING *
  `;
  return rows[0] as unknown as EventGuest;
}

export async function getGuestProfile(eventId: string, userId: string): Promise<EventGuest | null> {
  const rows = await sql`
    SELECT * FROM event_guests WHERE event_id = ${eventId} AND user_id = ${userId} LIMIT 1
  `;
  return (rows[0] as unknown as EventGuest) ?? null;
}

export async function createConnection(data: {
  eventId: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
}) {
  const rows = await sql`
    INSERT INTO guest_connections (event_id, from_user_id, to_user_id, message)
    VALUES (${data.eventId}, ${data.fromUserId}, ${data.toUserId}, ${data.message ?? null})
    ON CONFLICT (event_id, from_user_id, to_user_id) DO NOTHING
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function listConnections(eventId: string, userId: string) {
  const rows = await sql`
    SELECT * FROM guest_connections
    WHERE event_id = ${eventId}
      AND (from_user_id = ${userId} OR to_user_id = ${userId})
    ORDER BY created_at DESC
  `;
  return rows;
}
