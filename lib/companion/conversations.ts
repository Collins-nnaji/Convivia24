// Companion chat threads — lets a user keep several parallel conversations
// ("New chat") with a history list on the left.

import sql from '@/lib/db';

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

let schemaReady: Promise<void> | null = null;

/**
 * Idempotently make sure the conversation tables/columns exist. Runs once per
 * server process so the feature works even if the SQL migration hasn't been
 * run yet against the deployment's database.
 */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS companion_conversations (
          id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id    TEXT NOT NULL,
          title      TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_companion_conversations_user ON companion_conversations(user_id, updated_at DESC)`;
      await sql`ALTER TABLE companion_messages ADD COLUMN IF NOT EXISTS conversation_id UUID`;
      await sql`CREATE INDEX IF NOT EXISTS idx_companion_messages_conversation ON companion_messages(conversation_id, created_at)`;
    })().catch((err) => {
      // Let the next call retry rather than caching a failure forever.
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

function toConversation(r: Record<string, unknown>): Conversation {
  return {
    id: String(r.id),
    title: (r.title as string | null) ?? null,
    created_at: new Date(r.created_at as string).toISOString(),
    updated_at: new Date(r.updated_at as string).toISOString(),
  };
}

/** Turn a first message into a short, friendly thread title. */
export function titleFromMessage(message: string): string {
  const clean = message.trim().replace(/\s+/g, ' ');
  const words = clean.split(' ').slice(0, 6).join(' ');
  return (words.length < clean.length ? `${words}…` : words).slice(0, 80) || 'New chat';
}

/**
 * Adopt any pre-threads messages into a single "Earlier chat" so a user's old
 * history isn't lost when conversations are introduced.
 */
async function backfillOrphans(userId: string): Promise<void> {
  const [orphan] = await sql`
    SELECT 1 FROM companion_messages WHERE user_id = ${userId} AND conversation_id IS NULL LIMIT 1
  `;
  if (!orphan) return;
  const [conv] = await sql`
    INSERT INTO companion_conversations (user_id, title) VALUES (${userId}, 'Earlier chat')
    RETURNING id
  `;
  await sql`
    UPDATE companion_messages SET conversation_id = ${conv.id}
    WHERE user_id = ${userId} AND conversation_id IS NULL
  `;
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  await ensureSchema();
  await backfillOrphans(userId);
  const rows = await sql`
    SELECT id, title, created_at, updated_at FROM companion_conversations
    WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 100
  `;
  return rows.map(toConversation);
}

export async function createConversation(userId: string, title?: string): Promise<Conversation> {
  await ensureSchema();
  const [row] = await sql`
    INSERT INTO companion_conversations (user_id, title) VALUES (${userId}, ${title ?? null})
    RETURNING id, title, created_at, updated_at
  `;
  return toConversation(row);
}

/** Confirms a conversation belongs to the user; returns it or null. */
export async function getConversation(userId: string, id: string): Promise<Conversation | null> {
  await ensureSchema();
  const [row] = await sql`
    SELECT id, title, created_at, updated_at FROM companion_conversations
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return row ? toConversation(row) : null;
}

export async function getMessages(userId: string, conversationId: string): Promise<ChatMessageRow[]> {
  await ensureSchema();
  const rows = await sql`
    SELECT id, role, content, created_at FROM companion_messages
    WHERE user_id = ${userId} AND conversation_id = ${conversationId}
    ORDER BY created_at ASC LIMIT 200
  `;
  return rows.map((r) => ({
    id: String(r.id),
    role: r.role as 'user' | 'assistant',
    content: String(r.content),
    created_at: new Date(r.created_at as string).toISOString(),
  }));
}

export async function deleteConversation(userId: string, id: string): Promise<boolean> {
  await ensureSchema();
  await sql`DELETE FROM companion_messages WHERE user_id = ${userId} AND conversation_id = ${id}`;
  const rows = await sql`DELETE FROM companion_conversations WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}

export async function touchConversation(userId: string, id: string, titleIfEmpty?: string): Promise<void> {
  if (titleIfEmpty) {
    await sql`
      UPDATE companion_conversations
      SET updated_at = NOW(), title = COALESCE(NULLIF(title, ''), ${titleIfEmpty})
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } else {
    await sql`UPDATE companion_conversations SET updated_at = NOW() WHERE id = ${id} AND user_id = ${userId}`;
  }
}
