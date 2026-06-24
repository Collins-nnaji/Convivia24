// Discover feed — reads curated picks from the DB (manual + AI-curated rows)
// and tops up with the seed list per city, so the feed is never thin while
// real-world curation/scraping coverage for a city is still building out.

import sql from '@/lib/db';
import { CURATED_EVENT_SEEDS, citiesFromSeeds, type CuratedEvent } from './seeds';

interface CuratedEventRow {
  id: string;
  city: string;
  title: string;
  venue: string;
  category: CuratedEvent['category'];
  vibe_tags: string[];
  summary: string;
  starts_at: string;
  price_label: string | null;
  source_url: string | null;
  source: CuratedEvent['source'];
}

function fromRow(row: CuratedEventRow): CuratedEvent {
  return {
    id: row.id,
    city: row.city,
    title: row.title,
    venue: row.venue,
    category: row.category,
    vibeTags: row.vibe_tags ?? [],
    summary: row.summary,
    startsAt: row.starts_at,
    priceLabel: row.price_label ?? '',
    sourceUrl: row.source_url,
    source: row.source,
  };
}

async function dbEvents(city?: string): Promise<CuratedEvent[]> {
  const rows = city
    ? await sql`SELECT * FROM curated_events WHERE city = ${city} AND starts_at > NOW() ORDER BY starts_at ASC`
    : await sql`SELECT * FROM curated_events WHERE starts_at > NOW() ORDER BY starts_at ASC`;
  return (rows as unknown as CuratedEventRow[]).map(fromRow);
}

/** Curated picks for a city (or all cities), newest-curated DB rows first, seed picks filling the rest. */
export async function getCuratedEvents(city?: string): Promise<CuratedEvent[]> {
  let live: CuratedEvent[] = [];
  try {
    live = await dbEvents(city);
  } catch {
    live = []; // no DB configured yet, or table not migrated — seeds carry the feed
  }

  const seeds = city ? CURATED_EVENT_SEEDS.filter((e) => e.city === city) : CURATED_EVENT_SEEDS;
  const liveIds = new Set(live.map((e) => e.id));
  return [...live, ...seeds.filter((e) => !liveIds.has(e.id))].sort(
    (a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)
  );
}

export async function getDiscoverCities(): Promise<string[]> {
  try {
    const rows = await sql`SELECT DISTINCT city FROM curated_events ORDER BY city ASC`;
    const dbCities = (rows as unknown as { city: string }[]).map((r) => r.city);
    return Array.from(new Set([...dbCities, ...citiesFromSeeds()])).sort();
  } catch {
    return citiesFromSeeds();
  }
}
