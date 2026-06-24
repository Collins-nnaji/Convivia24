import sql from '@/lib/db';

export interface Broadcast {
  id: string;
  event_id: string;
  subject: string;
  body: string;
  channel: string;
  scheduled_for: string | null;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
}

export async function listBroadcasts(eventId: string): Promise<Broadcast[]> {
  const rows = await sql`
    SELECT * FROM broadcasts WHERE event_id = ${eventId} ORDER BY created_at DESC
  `;
  return rows as unknown as Broadcast[];
}

export async function createBroadcast(data: {
  eventId: string;
  subject: string;
  body: string;
  channel?: string;
  scheduledFor?: string | null;
  createdBy?: string;
}): Promise<Broadcast> {
  const recipientRows = await sql`
    SELECT COUNT(DISTINCT o.buyer_email) AS c FROM orders o
    WHERE o.event_id = ${data.eventId} AND o.status = 'paid'
  `;
  const count = Number(recipientRows[0]?.c ?? 0);
  const sendNow = !data.scheduledFor;

  const rows = await sql`
    INSERT INTO broadcasts (event_id, subject, body, channel, scheduled_for, sent_at, recipient_count, created_by)
    VALUES (
      ${data.eventId}, ${data.subject}, ${data.body},
      ${data.channel ?? 'email'}, ${data.scheduledFor ?? null},
      ${sendNow ? new Date().toISOString() : null}, ${count}, ${data.createdBy ?? null}
    )
    RETURNING *
  `;
  return rows[0] as unknown as Broadcast;
}
