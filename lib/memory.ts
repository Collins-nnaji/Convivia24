import sql from '@/lib/db';

export interface MemoryPost {
  id: string;
  event_id: string;
  user_id: string;
  author_name: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  tagged_user_ids: string[] | null;
  reactions: Record<string, number>;
  created_at: string;
}

export function memoryWallUnlocked(event: { ends_at?: string | null; starts_at: string }): boolean {
  const end = event.ends_at ? new Date(event.ends_at) : new Date(event.starts_at);
  end.setHours(end.getHours() + 6);
  return new Date() >= end;
}

export async function listMemoryPosts(eventId: string): Promise<MemoryPost[]> {
  const rows = await sql`
    SELECT * FROM memory_posts WHERE event_id = ${eventId} ORDER BY created_at DESC
  `;
  return rows as unknown as MemoryPost[];
}

export async function addMemoryPost(data: {
  eventId: string;
  userId: string;
  authorName: string;
  mediaUrl: string;
  mediaType?: string;
  caption?: string;
}): Promise<MemoryPost> {
  const rows = await sql`
    INSERT INTO memory_posts (event_id, user_id, author_name, media_url, media_type, caption)
    VALUES (
      ${data.eventId}, ${data.userId}, ${data.authorName},
      ${data.mediaUrl}, ${data.mediaType ?? 'image'}, ${data.caption ?? null}
    )
    RETURNING *
  `;
  return rows[0] as unknown as MemoryPost;
}

export async function reactToPost(postId: string, emoji: string): Promise<MemoryPost | null> {
  const rows = await sql`
    UPDATE memory_posts SET
      reactions = jsonb_set(
        COALESCE(reactions, '{}'::jsonb),
        ARRAY[${emoji}],
        to_jsonb(COALESCE((reactions->>${emoji})::int, 0) + 1),
        true
      )
    WHERE id = ${postId}
    RETURNING *
  `;
  return (rows[0] as unknown as MemoryPost) ?? null;
}
