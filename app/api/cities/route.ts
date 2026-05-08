import { NextResponse } from 'next/server';
import sql from '@/lib/db';

/** GET /api/cities — canonical cities for filters & onboarding (DB-backed). */
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, slug, sort_order
      FROM cities
      ORDER BY sort_order ASC, name ASC
    `;
    return NextResponse.json({
      cities: rows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        slug: String(r.slug),
        sort_order: Number(r.sort_order),
      })),
    });
  } catch (err) {
    console.error('GET /api/cities', err);
    return NextResponse.json({ error: 'Failed to load cities.' }, { status: 500 });
  }
}
