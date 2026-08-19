import sql from '@/lib/db';
import { EVENT_TAGS, type EventTag, type NightEvent, type VenueSnapshot } from '@/lib/events/catalog';

export const EVENTS_CACHE_KEY = 'events:feed:v1';

export type StoredEvent = NightEvent & {
  startsAtIso: string;
  endsAtIso: string;
  source: 'admin';
  published: boolean;
  venue?: VenueSnapshot;
};

export type EventInput = {
  id?: string;
  title: string;
  venueSlug: string;
  tag: string;
  blurb?: string;
  expected?: string;
  coverNgn?: number | null;
  startsAtIso: string;
  endsAtIso: string;
  published?: boolean;
};

function mapRow(r: Record<string, unknown>): StoredEvent {
  const tag = String(r.tag || 'Lounge') as EventTag;
  const event: StoredEvent = {
    id: String(r.id),
    title: String(r.title),
    venueSlug: String(r.venue_slug),
    tag: EVENT_TAGS.includes(tag) ? tag : 'Lounge',
    blurb: String(r.blurb || ''),
    expected: String(r.expected || ''),
    coverNgn: r.cover_ngn != null ? Number(r.cover_ngn) : undefined,
    startsAtIso: new Date(r.starts_at as string).toISOString(),
    endsAtIso: new Date(r.ends_at as string).toISOString(),
    source: 'admin',
    published: r.published !== false,
  };

  if (r.venue_name) {
    event.venue = {
      slug: String(r.venue_slug),
      name: String(r.venue_name),
      kind: String(r.venue_kind || 'lounge'),
      areaId: String(r.venue_area_id || ''),
      area: String(r.venue_area || ''),
      address: String(r.venue_address || ''),
      lat: Number(r.venue_lat || 0),
      lng: Number(r.venue_lng || 0),
      tagline: String(r.venue_tagline || ''),
      cardPerk: String(r.venue_card_perk || ''),
      photoUrl: r.venue_photo_url ? String(r.venue_photo_url) : null,
    };
  }

  return event;
}

function makeId(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'event'}-${suffix}`;
}

export async function listEvents(publishedOnly = false): Promise<StoredEvent[]> {
  const rows = publishedOnly
    ? await sql`
        SELECT e.*, v.name AS venue_name, v.kind AS venue_kind, v.area_id AS venue_area_id,
          v.area AS venue_area, v.address AS venue_address, v.lat AS venue_lat,
          v.lng AS venue_lng, v.tagline AS venue_tagline, v.card_perk AS venue_card_perk,
          v.photo_url AS venue_photo_url
        FROM night_events e
        LEFT JOIN venues v ON v.slug = e.venue_slug AND v.status = 'active'
        WHERE e.published = true
        ORDER BY e.starts_at ASC
      `
    : await sql`
        SELECT e.*, v.name AS venue_name, v.kind AS venue_kind, v.area_id AS venue_area_id,
          v.area AS venue_area, v.address AS venue_address, v.lat AS venue_lat,
          v.lng AS venue_lng, v.tagline AS venue_tagline, v.card_perk AS venue_card_perk,
          v.photo_url AS venue_photo_url
        FROM night_events e
        LEFT JOIN venues v ON v.slug = e.venue_slug AND v.status = 'active'
        ORDER BY e.starts_at ASC
      `;
  return rows.map(mapRow);
}

export async function listUpcomingEvents(): Promise<StoredEvent[]> {
  const rows = await sql`
    SELECT e.*, v.name AS venue_name, v.kind AS venue_kind, v.area_id AS venue_area_id,
      v.area AS venue_area, v.address AS venue_address, v.lat AS venue_lat,
      v.lng AS venue_lng, v.tagline AS venue_tagline, v.card_perk AS venue_card_perk,
      v.photo_url AS venue_photo_url
    FROM night_events e
    LEFT JOIN venues v ON v.slug = e.venue_slug AND v.status = 'active'
    WHERE e.published = true
    ORDER BY e.starts_at ASC
  `;
  return rows.map(mapRow);
}

export function validateEventInput(input: EventInput): string | null {
  if (!input.title.trim()) return 'Title is required.';
  if (!input.venueSlug.trim()) return 'Venue is required.';
  const starts = new Date(input.startsAtIso);
  const ends = new Date(input.endsAtIso);
  if (Number.isNaN(starts.getTime())) return 'Start date/time is invalid.';
  if (Number.isNaN(ends.getTime())) return 'End date/time is invalid.';
  if (ends <= starts) return 'End must be after start.';
  return null;
}

export async function upsertEvent(input: EventInput): Promise<StoredEvent> {
  const id = input.id?.trim() || makeId(input.title);
  const tag = EVENT_TAGS.includes(input.tag as EventTag) ? input.tag : 'Lounge';
  const rows = await sql`
    INSERT INTO night_events (
      id, title, venue_slug, tag, blurb, expected, cover_ngn, starts_at, ends_at, published, updated_at
    ) VALUES (
      ${id},
      ${input.title.trim()},
      ${input.venueSlug.trim()},
      ${tag},
      ${input.blurb || ''},
      ${input.expected || ''},
      ${input.coverNgn != null && input.coverNgn > 0 ? Math.floor(input.coverNgn) : null},
      ${new Date(input.startsAtIso).toISOString()},
      ${new Date(input.endsAtIso).toISOString()},
      ${input.published !== false},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      venue_slug = EXCLUDED.venue_slug,
      tag = EXCLUDED.tag,
      blurb = EXCLUDED.blurb,
      expected = EXCLUDED.expected,
      cover_ngn = EXCLUDED.cover_ngn,
      starts_at = EXCLUDED.starts_at,
      ends_at = EXCLUDED.ends_at,
      published = EXCLUDED.published,
      updated_at = NOW()
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function setEventPublished(id: string, published: boolean): Promise<StoredEvent | null> {
  const rows = await sql`
    UPDATE night_events SET published = ${published}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM night_events WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
