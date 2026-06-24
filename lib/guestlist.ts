import sql from '@/lib/db';

export interface GuestlistApplication {
  id: string;
  event_id: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  linkedin_url: string | null;
  instagram_url: string | null;
  application_text: string | null;
  status: string;
  created_at: string;
}

export async function listApplications(eventId: string, status?: string): Promise<GuestlistApplication[]> {
  const rows = await sql`
    SELECT * FROM guestlist_applications
    WHERE event_id = ${eventId}
      AND (${status ?? null}::text IS NULL OR status = ${status ?? null})
    ORDER BY created_at DESC
  `;
  return rows as unknown as GuestlistApplication[];
}

export async function submitApplication(data: {
  eventId: string;
  userId: string;
  name: string;
  email: string;
  linkedin?: string;
  instagram?: string;
  text?: string;
}): Promise<GuestlistApplication> {
  const rows = await sql`
    INSERT INTO guestlist_applications (
      event_id, user_id, applicant_name, applicant_email,
      linkedin_url, instagram_url, application_text
    ) VALUES (
      ${data.eventId}, ${data.userId}, ${data.name}, ${data.email.toLowerCase()},
      ${data.linkedin?.trim() || null}, ${data.instagram?.trim() || null}, ${data.text?.trim() || null}
    )
    ON CONFLICT (event_id, applicant_email) DO UPDATE SET
      applicant_name = EXCLUDED.applicant_name,
      linkedin_url = EXCLUDED.linkedin_url,
      instagram_url = EXCLUDED.instagram_url,
      application_text = EXCLUDED.application_text,
      status = CASE WHEN guestlist_applications.status = 'rejected' THEN 'pending' ELSE guestlist_applications.status END,
      updated_at = NOW()
    RETURNING *
  `;
  return rows[0] as unknown as GuestlistApplication;
}

export async function reviewApplication(
  id: string,
  status: 'approved' | 'rejected',
  reviewerEmail: string
): Promise<GuestlistApplication | null> {
  const rows = await sql`
    UPDATE guestlist_applications SET
      status = ${status},
      reviewed_by = ${reviewerEmail},
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as GuestlistApplication) ?? null;
}

export async function getUserApplication(eventId: string, userId: string): Promise<GuestlistApplication | null> {
  const rows = await sql`
    SELECT * FROM guestlist_applications
    WHERE event_id = ${eventId} AND user_id = ${userId}
    LIMIT 1
  `;
  return (rows[0] as unknown as GuestlistApplication) ?? null;
}
