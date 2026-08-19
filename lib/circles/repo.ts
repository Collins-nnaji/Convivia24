import sql from '@/lib/db';

export type Circle = {
  id: string;
  slug: string;
  name: string;
  vibeTag: string;
  description: string;
  memberCount: number;
  joined: boolean;
};

export async function listCircles(userId: string | null): Promise<Circle[]> {
  const rows = await sql`
    SELECT
      c.id, c.slug, c.name, c.vibe_tag, c.description,
      COUNT(m.user_id) AS member_count,
      BOOL_OR(m.user_id = ${userId}) AS joined
    FROM circles c
    LEFT JOIN circle_members m ON m.circle_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `;
  return rows.map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    vibeTag: String(r.vibe_tag),
    description: String(r.description),
    memberCount: Number(r.member_count ?? 0),
    joined: Boolean(r.joined),
  }));
}

export async function joinCircle(circleId: string, userId: string, name: string): Promise<void> {
  await sql`
    INSERT INTO circle_members (circle_id, user_id, name) VALUES (${circleId}, ${userId}, ${name})
    ON CONFLICT (circle_id, user_id) DO NOTHING
  `;
}

export async function leaveCircle(circleId: string, userId: string): Promise<void> {
  await sql`DELETE FROM circle_members WHERE circle_id = ${circleId} AND user_id = ${userId}`;
}
