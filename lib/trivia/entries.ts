import sql from '@/lib/db';

export type TriviaEntry = {
  id: string;
  code: string;
  roundSlug: string;
  brand: string;
  name: string;
  email: string;
  phone: string | null;
  score: number;
  total: number;
  status: string;
  createdAt: string;
};

export class DuplicateEntryError extends Error {
  constructor(message = 'You are already entered in this brand’s draw.') {
    super(message);
    this.name = 'DuplicateEntryError';
  }
}

function mapRow(r: Record<string, unknown>): TriviaEntry {
  return {
    id: String(r.id),
    code: String(r.code),
    roundSlug: String(r.round_slug),
    brand: String(r.brand),
    name: String(r.name),
    email: String(r.email),
    phone: (r.phone as string) || null,
    score: Number(r.score ?? 0),
    total: Number(r.total ?? 0),
    status: String(r.status || 'entered'),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

/** Short, human-readable claim reference, e.g. C24-HEN-4KQ2. */
function makeCode(roundSlug: string): string {
  const prefix = roundSlug.replace(/[^a-z]/g, '').slice(0, 3).toUpperCase() || 'C24';
  const body = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `C24-${prefix}-${body}`;
}

export async function createEntry(input: {
  roundSlug: string;
  brand: string;
  name: string;
  email: string;
  phone?: string | null;
  score: number;
  total: number;
}): Promise<TriviaEntry> {
  const code = makeCode(input.roundSlug);
  try {
    const rows = await sql`
      INSERT INTO trivia_entries (code, round_slug, brand, name, email, phone, score, total)
      VALUES (
        ${code}, ${input.roundSlug}, ${input.brand}, ${input.name.trim()},
        ${input.email.trim().toLowerCase()}, ${input.phone || null},
        ${Math.max(0, Math.floor(input.score))}, ${Math.max(0, Math.floor(input.total))}
      )
      RETURNING *
    `;
    return mapRow(rows[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('idx_trivia_entries_once') || message.includes('duplicate key')) {
      throw new DuplicateEntryError();
    }
    throw err;
  }
}

export async function listEntries(roundSlug?: string): Promise<TriviaEntry[]> {
  const rows = roundSlug
    ? await sql`SELECT * FROM trivia_entries WHERE round_slug = ${roundSlug} ORDER BY created_at DESC LIMIT 500`
    : await sql`SELECT * FROM trivia_entries ORDER BY created_at DESC LIMIT 500`;
  return rows.map(mapRow);
}

export async function setEntryStatus(id: string, status: string): Promise<TriviaEntry | null> {
  const rows = await sql`
    UPDATE trivia_entries SET status = ${status} WHERE id = ${id} RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}
