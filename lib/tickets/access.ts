import sql from '@/lib/db';

export async function userHasTicketForEvent(userId: string, eventId: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM tickets t
    JOIN orders o ON o.id = t.order_id
    WHERE t.event_id = ${eventId}
      AND o.user_id = ${userId}
      AND t.status = 'valid'
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function userHasApprovedGuestlist(userId: string, eventId: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM guestlist_applications
    WHERE event_id = ${eventId} AND user_id = ${userId} AND status = 'approved'
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function canAccessLounge(userId: string, eventId: string): Promise<boolean> {
  return userHasTicketForEvent(userId, eventId);
}
