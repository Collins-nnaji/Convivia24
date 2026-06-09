import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

function slugify(input: string): string {
  return input.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'event';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const all = searchParams.get('all'); // admin: include drafts

    const rows = await sql`
      SELECT e.*,
        (SELECT MIN(price) FROM ticket_types t WHERE t.event_id = e.id AND t.is_active) AS min_price,
        (SELECT COALESCE(SUM(sold),0) FROM ticket_types t WHERE t.event_id = e.id) AS tickets_sold,
        (SELECT COALESCE(SUM(quantity),0) FROM ticket_types t WHERE t.event_id = e.id) AS tickets_total
      FROM events e
      WHERE (${all ? 'true' : 'false'}::boolean OR e.status = 'published')
        AND (${q ?? null}::text IS NULL OR e.title ILIKE ${'%' + (q ?? '') + '%'} OR e.description ILIKE ${'%' + (q ?? '') + '%'})
        AND (${city ?? null}::text IS NULL OR e.city = ${city ?? null})
        AND (${category ?? null}::text IS NULL OR e.category = ${category ?? null})
      ORDER BY e.is_featured DESC, e.starts_at ASC
    `;
    return NextResponse.json({ events: rows });
  } catch (err) {
    console.error('[GET /api/events]', err);
    return NextResponse.json({ error: 'Failed to fetch events.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        ${organizer_name || 'Convivia Live'}, ${venue || null}, ${address || null}, ${city || 'Lagos'}, ${country || 'Nigeria'},
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
