import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser, isAdminRequest } from '@/lib/auth/session';

function slugify(input: string): string {
  return input.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'event';
}

/** Compute a [from, to] window for the `when` filter. */
function dateWindow(when: string | null): { from: string | null; to: string | null } {
  if (!when) return { from: null, to: null };
  const now = new Date();
  const endOf = (d: Date) => { const e = new Date(d); e.setHours(23, 59, 59, 999); return e; };
  switch (when) {
    case 'today':
      return { from: now.toISOString(), to: endOf(now).toISOString() };
    case 'weekend': {
      // Friday 00:00 through Sunday 23:59 of the current week (or today if already inside).
      const day = now.getDay(); // 0 Sun … 6 Sat
      const fri = new Date(now);
      fri.setDate(now.getDate() + ((5 - day + 7) % 7));
      fri.setHours(0, 0, 0, 0);
      const start = day === 0 || day === 6 ? now : (fri < now ? now : fri);
      const sun = new Date(fri);
      sun.setDate(fri.getDate() + (day === 0 ? 0 : 2));
      return { from: start.toISOString(), to: endOf(sun).toISOString() };
    }
    case 'week': {
      const to = new Date(now.getTime() + 7 * 86400000);
      return { from: now.toISOString(), to: endOf(to).toISOString() };
    }
    case 'month': {
      const to = new Date(now.getTime() + 30 * 86400000);
      return { from: now.toISOString(), to: endOf(to).toISOString() };
    }
    default:
      return { from: null, to: null };
  }
}

function sortEvents(rows: Record<string, unknown>[], sort: string) {
  const list = [...rows];
  const byDate = (a: Record<string, unknown>, b: Record<string, unknown>) =>
    +new Date(String(a.starts_at)) - +new Date(String(b.starts_at));
  const price = (r: Record<string, unknown>) => {
    const n = Number(r.min_price);
    return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
  };

  switch (sort) {
    case 'featured':
      return list.sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)) || byDate(a, b));
    case 'price_asc':
      return list.sort((a, b) => price(a) - price(b) || byDate(a, b));
    case 'price_desc':
      return list.sort((a, b) => price(b) - price(a) || byDate(a, b));
    default:
      return list.sort(byDate);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const { from, to } = dateWindow(searchParams.get('when'));
    const sort = searchParams.get('sort') || 'soonest';
    // Drafts and past events are only visible to an authenticated admin.
    const all = searchParams.get('all') && (await isAdminRequest(req)) ? '1' : '';

    const rows = await sql`
      SELECT e.*,
        (SELECT MIN(price) FROM ticket_types t WHERE t.event_id = e.id AND t.is_active) AS min_price,
        (SELECT COALESCE(SUM(sold),0) FROM ticket_types t WHERE t.event_id = e.id) AS tickets_sold,
        (SELECT COALESCE(SUM(quantity),0) FROM ticket_types t WHERE t.event_id = e.id) AS tickets_total
      FROM events e
      WHERE (${all ? 'true' : 'false'}::boolean OR (e.status = 'published' AND COALESCE(e.ends_at, e.starts_at + INTERVAL '6 hours') > NOW()))
        AND (${q ?? null}::text IS NULL OR e.title ILIKE ${'%' + (q ?? '') + '%'} OR e.description ILIKE ${'%' + (q ?? '') + '%'} OR e.city ILIKE ${'%' + (q ?? '') + '%'} OR e.venue ILIKE ${'%' + (q ?? '') + '%'})
        AND (${city ?? null}::text IS NULL OR e.city = ${city ?? null})
        AND (${category ?? null}::text IS NULL OR e.category = ${category ?? null})
        AND (${from}::timestamptz IS NULL OR e.starts_at >= ${from}::timestamptz OR (e.starts_at <= NOW() AND COALESCE(e.ends_at, e.starts_at + INTERVAL '6 hours') > NOW()))
        AND (${to}::timestamptz IS NULL OR e.starts_at <= ${to}::timestamptz)
    `;
    return NextResponse.json({ events: sortEvents(rows, sort) });
  } catch (err) {
    console.error('[GET /api/events]', err);
    return NextResponse.json({ error: 'Failed to fetch events.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Please sign in to create an event.' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const {
      title, tagline, description, category, organizer_name, venue, address, city, country,
      starts_at, ends_at, cover_image, currency, capacity, age_restriction, lineup, tags,
      is_featured, status, ai_generated, ticket_types,
    } = data;

    if (!title?.trim() || !description?.trim() || !starts_at) {
      return NextResponse.json({ error: 'title, description and starts_at are required.' }, { status: 400 });
    }

    // Ensure a unique slug
    let base = slugify(title);
    let slug = base;
    let n = 1;
    while ((await sql`SELECT 1 FROM events WHERE slug = ${slug} LIMIT 1`).length) {
      slug = `${base}-${++n}`;
    }

    const rows = await sql`
      INSERT INTO events (slug, title, tagline, description, category, organizer_name, venue, address, city, country,
        starts_at, ends_at, cover_image, currency, capacity, age_restriction, lineup, tags, is_featured, status, ai_generated)
      VALUES (${slug}, ${title.trim()}, ${tagline || null}, ${description.trim()}, ${category || 'party'},
        ${organizer_name || user.name || 'Convivia Live'}, ${venue || null}, ${address || null}, ${city || 'Lagos'}, ${country || 'Nigeria'},
        ${starts_at}, ${ends_at || null}, ${cover_image || null}, ${currency || 'NGN'}, ${capacity || null},
        ${age_restriction || null}, ${lineup || null}, ${tags || null}, ${is_featured || false}, ${status || 'published'}, ${ai_generated || false})
      RETURNING *
    `;
    const event = rows[0];

    if (Array.isArray(ticket_types)) {
      let order = 0;
      for (const t of ticket_types) {
        if (!t?.name?.trim()) continue;
        await sql`
          INSERT INTO ticket_types (event_id, name, description, price, currency, quantity, max_per_order, perks, sort_order)
          VALUES (${event.id}, ${t.name.trim()}, ${t.description || null}, ${Number(t.price) || 0}, ${currency || 'NGN'},
            ${Number(t.quantity) || 100}, ${Number(t.max_per_order) || 10}, ${t.perks || null}, ${order++})
        `;
      }
    }

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error('[POST /api/events]', err);
    return NextResponse.json({ error: 'Failed to create event.' }, { status: 500 });
  }
}
