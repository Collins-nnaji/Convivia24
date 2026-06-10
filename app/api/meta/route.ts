import { NextResponse } from 'next/server';
import sql from '@/lib/db';

/** Public discovery metadata: live cities and category counts for filters. */
export async function GET() {
  try {
    const cities = await sql`
      SELECT city, country, COUNT(*) AS count
      FROM events
      WHERE status = 'published' AND starts_at > NOW()
      GROUP BY city, country
      ORDER BY count DESC, city
    `;
    const categories = await sql`
      SELECT category, COUNT(*) AS count
      FROM events
      WHERE status = 'published' AND starts_at > NOW()
      GROUP BY category
      ORDER BY count DESC
    `;
    return NextResponse.json({ cities, categories });
  } catch (err) {
    console.error('[GET /api/meta]', err);
    return NextResponse.json({ cities: [], categories: [] });
  }
}
