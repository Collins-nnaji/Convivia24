import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

/**
 * GET /api/outlet/matched-workers?city=Lagos&area=VI&role=Waiter
 * Verified workers from the database (certifications + ratings when present).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = (searchParams.get('city') || '').trim();
    const area = (searchParams.get('area') || '').trim();
    const role = (searchParams.get('role') || '').trim();
    const cityEmpty = city.length === 0;

    const workers = await sql`
      SELECT
        u.id,
        u.name,
        u.avatar_url,
        u.rating,
        u.verified,
        u.location,
        u.certifications,
        u.bio
      FROM users u
      WHERE u.verified = true
        AND (
          ${cityEmpty}::boolean
          OR u.location ILIKE ${'%' + city + '%'}
        )
      ORDER BY u.rating DESC NULLS LAST, u.hangouts_count DESC
      LIMIT 24
    `;

    const mapped = workers.map((w: Record<string, unknown>) => {
      const certs = Array.isArray(w.certifications)
        ? (w.certifications as string[]).filter(Boolean)
        : [];
      const loc = String(w.location || '');
      let zoneGuess = area || '';
      if (!zoneGuess && city && loc.toLowerCase().includes(city.toLowerCase())) {
        const parts = loc.split(/[·|,]/).map((s) => s.trim()).filter(Boolean);
        zoneGuess = parts.find((p) => p.length <= 24 && p !== city) || parts[0] || city;
      }
      return {
        id: String(w.id),
        name: String(w.name || 'Staff'),
        avatar: (w.avatar_url as string) || `https://i.pravatar.cc/120?u=${w.id}`,
        rating: w.rating != null ? Number(w.rating) : null,
        verified: Boolean(w.verified),
        zone: zoneGuess || city || '—',
        certifications: certs.length ? certs : ['Verified hire'],
        roleHint: role || null,
      };
    });

    return NextResponse.json({ workers: mapped });
  } catch (err) {
    console.error('GET /api/outlet/matched-workers', err);
    return NextResponse.json({ error: 'Failed to load matches.' }, { status: 500 });
  }
}
