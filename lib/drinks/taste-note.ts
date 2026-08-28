import { TASTE_NOTES } from '@/lib/drinks/brand-guide';

/** Instant taste copy — static catalog first, DB note when provided. */
export function tasteNoteForSlug(slug: string, fromDb?: string | null): string | null {
  const db = fromDb?.trim();
  if (db) return db;
  return TASTE_NOTES[slug] || null;
}
