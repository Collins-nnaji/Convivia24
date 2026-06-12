import sql from '@/lib/db';

export interface EventRow {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  category: string;
  organizer_name: string | null;
  venue: string | null;
  address: string | null;
  city: string;
  country: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  cover_image: string | null;
  currency: string;
  capacity: number | null;
  age_restriction: string | null;
  lineup: string[] | null;
  tags: string[] | null;
  is_featured: boolean;
  status: string;
}

export interface TicketTypeRow {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  quantity: number;
  sold: number;
  max_per_order: number;
  perks: string[] | null;
  is_active: boolean;
  sort_order: number;
}

export { CATEGORIES, CATEGORY_LABELS } from './categories';

const FALLBACK_IMAGES = ['/The Spaces2.png', '/Convivium.png', '/conv1.png', '/Convivium2.png', '/Convivium3.png', '/dealrooms.png'];

export function eventImage(e: { cover_image: string | null; id?: string }): string {
  if (e.cover_image) return e.cover_image;
  const seed = (e.id || '').charCodeAt(0) || 0;
  return FALLBACK_IMAGES[seed % FALLBACK_IMAGES.length];
}

interface DiscoverFilters {
  q?: string;
  city?: string;
  category?: string;
  featured?: boolean;
  limit?: number;
}

export async function getEvents(filters: DiscoverFilters = {}): Promise<EventRow[]> {
  const { q, city, category, featured, limit = 60 } = filters;
  const rows = await sql`
    SELECT * FROM events
    WHERE status = 'published'
      AND (${q ?? null}::text IS NULL OR title ILIKE ${'%' + (q ?? '') + '%'} OR description ILIKE ${'%' + (q ?? '') + '%'} OR venue ILIKE ${'%' + (q ?? '') + '%'})
      AND (${city ?? null}::text IS NULL OR city = ${city ?? null})
      AND (${category ?? null}::text IS NULL OR category = ${category ?? null})
      AND (${featured ?? null}::boolean IS NULL OR is_featured = ${featured ?? null})
    ORDER BY is_featured DESC, starts_at ASC
    LIMIT ${limit}
  `;
  return rows as unknown as EventRow[];
}

export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  const rows = await sql`SELECT * FROM events WHERE slug = ${slug} LIMIT 1`;
  return (rows[0] as unknown as EventRow) ?? null;
}

export async function getTicketTypes(eventId: string): Promise<TicketTypeRow[]> {
  const rows = await sql`
    SELECT * FROM ticket_types
    WHERE event_id = ${eventId} AND is_active = true
    ORDER BY sort_order, price
  `;
  return rows as unknown as TicketTypeRow[];
}

export async function getCities(): Promise<string[]> {
  const rows = await sql`SELECT DISTINCT city FROM events WHERE status = 'published' ORDER BY city`;
  return rows.map((r) => r.city as string);
}

export function formatEventDate(iso: string, withTime = true): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  if (!withTime) return date;
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}
