import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// GET /api/venues — List all active venues
export async function GET() {
  try {
    const venues = await sql`
      SELECT * FROM venues WHERE is_active = true ORDER BY city, name
    `;

    const serialized = venues.map((v) => ({
      ...v,
      created_at: v.created_at instanceof Date ? v.created_at.toISOString() : v.created_at,
    }));

    return NextResponse.json({ venues: serialized });
  } catch (err) {
    console.error('Error fetching venues:', err);
    return NextResponse.json({ error: 'Failed to load venues.' }, { status: 500 });
  }
}
