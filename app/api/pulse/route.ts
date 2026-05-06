import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

/**
 * GET /api/pulse?city=London
 *
 * Live City Pulse — derives "where the energy is right now" from real data:
 *   - upcoming hangouts grouped by area (location prefix)
 *   - venue density per area
 *   - recent match_requests per area (popularity signal)
 *
 * Returns a list of pulse cards for the Discover tab. If no live data exists for a city
 * we still return curated default areas so the UI never feels empty (with energy="quiet").
 */

type PulseCard = {
  id: string;
  area: string;
  city: string;
  vibe: string;
  energy: 'quiet' | 'rising' | 'high' | 'peak';
  tag: string;
  group_size: number;
  live_tables: number;
  matches_recent: number;
};

// Curated fallback areas per city — used when no live hangouts exist yet.
const CURATED_AREAS: Record<string, Omit<PulseCard, 'id' | 'energy' | 'tag' | 'live_tables' | 'matches_recent'>[]> = {
  London: [
    { area: 'Soho',          city: 'London', vibe: 'Young professionals · drinks',  group_size: 6 },
    { area: 'Shoreditch',    city: 'London', vibe: 'Trending dinner spots',         group_size: 5 },
    { area: 'Camden',        city: 'London', vibe: 'Live music · high energy',      group_size: 8 },
    { area: 'Brixton',       city: 'London', vibe: 'Diaspora · late nights',        group_size: 6 },
  ],
  Lagos: [
    { area: 'Victoria Island', city: 'Lagos', vibe: 'Lounge · founders after-dark', group_size: 6 },
    { area: 'Lekki Phase 1',   city: 'Lagos', vibe: 'Brunch · creatives',           group_size: 4 },
    { area: 'Ikoyi',           city: 'Lagos', vibe: 'Rooftops · whisky',            group_size: 6 },
    { area: 'Yaba',            city: 'Lagos', vibe: 'Tech · co-working evenings',   group_size: 8 },
  ],
  Abuja: [
    { area: 'Wuse 2',          city: 'Abuja', vibe: 'Rooftops · whisky',            group_size: 6 },
    { area: 'Maitama',         city: 'Abuja', vibe: 'Quiet dining · diplomats',     group_size: 4 },
    { area: 'Jabi',            city: 'Abuja', vibe: 'Lakeside · brunch',            group_size: 6 },
  ],
};

/** Curated pulse rows for cities not in the map (user-added metros). */
function curatedAreasForCity(city: string): Omit<PulseCard, 'id' | 'energy' | 'tag' | 'live_tables' | 'matches_recent'>[] {
  const exact = CURATED_AREAS[city as keyof typeof CURATED_AREAS];
  if (exact) return exact;
  const matchKey = Object.keys(CURATED_AREAS).find(
    (k) => k.toLowerCase() === city.trim().toLowerCase(),
  ) as keyof typeof CURATED_AREAS | undefined;
  if (matchKey) return CURATED_AREAS[matchKey];
  const c = city.trim() || 'Your city';
  return [
    { area: `Downtown · ${c}`, city: c, vibe: 'Host a table — energy shows up here first.', group_size: 6 },
    { area: `Waterfront · ${c}`, city: c, vibe: 'Sunset hangs · dining & lounges.', group_size: 5 },
    { area: `Arts & music · ${c}`, city: c, vibe: 'Gigs · culture · open seats.', group_size: 6 },
    { area: `Uptown · ${c}`, city: c, vibe: 'Founders · whisky · long tables.', group_size: 4 },
  ];
}

function classifyEnergy(liveTables: number, recentMatches: number): { energy: PulseCard['energy']; tag: string } {
  const score = liveTables * 3 + recentMatches;
  if (score >= 12) return { energy: 'peak',   tag: 'Peak' };
  if (score >= 6)  return { energy: 'high',   tag: 'Buzzing' };
  if (score >= 2)  return { energy: 'rising', tag: 'Rising' };
  return { energy: 'quiet', tag: 'Quiet' };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || 'London';

    // 1. live tables grouped by first segment of location (the area)
    const liveTables = await sql`
      SELECT
        TRIM(SPLIT_PART(h.location, ',', 1)) as area,
        COUNT(*) as table_count,
        SUM(GREATEST(h.max_guests - h.current_guests, 0)) as open_seats,
        ARRAY_AGG(DISTINCT h.category) as categories
      FROM hangouts h
      WHERE h.status IN ('pending', 'confirmed')
        AND h.event_time > NOW() - INTERVAL '2 hours'
        AND h.event_time < NOW() + INTERVAL '36 hours'
        AND (h.city ILIKE ${city} OR h.location ILIKE ${'%' + city + '%'})
      GROUP BY area
      ORDER BY table_count DESC
    `;

    // 2. recent matches per area (last 24h) — popularity signal
    const recentMatches = await sql`
      SELECT area, COUNT(*) as match_count
      FROM match_requests
      WHERE city ILIKE ${city}
        AND created_at > NOW() - INTERVAL '24 hours'
        AND area IS NOT NULL
      GROUP BY area
    `;
    const matchMap = new Map(recentMatches.map((r) => [String(r.area).toLowerCase(), Number(r.match_count)]));

    const cards: PulseCard[] = [];

    // 3. start from real hangout areas — they're already "live"
    for (const row of liveTables) {
      const area = String(row.area).trim();
      const tableCount = Number(row.table_count);
      const matches = matchMap.get(area.toLowerCase()) || 0;
      const { energy, tag } = classifyEnergy(tableCount, matches);
      cards.push({
        id: `live-${area}`,
        area,
        city,
        vibe: tableCount > 1 ? `${tableCount} tables forming · join one tonight` : 'Live table · join now',
        energy,
        tag,
        group_size: 6,
        live_tables: tableCount,
        matches_recent: matches,
      });
    }

    // 4. fill in with curated areas that have no live tables (so the grid is always populated)
    const curated = curatedAreasForCity(city);
    for (const c of curated) {
      if (cards.find((x) => x.area.toLowerCase() === c.area.toLowerCase())) continue;
      const matches = matchMap.get(c.area.toLowerCase()) || 0;
      const { energy, tag } = classifyEnergy(0, matches);
      cards.push({
        id: `curated-${c.area}`,
        area: c.area,
        city: c.city,
        vibe: c.vibe,
        energy: matches > 0 ? energy : 'quiet',
        tag: matches > 0 ? tag : 'Quiet',
        group_size: c.group_size,
        live_tables: 0,
        matches_recent: matches,
      });
    }

    return NextResponse.json({ city, pulse: cards.slice(0, 8) });
  } catch (err) {
    console.error('Error loading pulse:', err);
    return NextResponse.json({ error: 'Failed to load pulse.' }, { status: 500 });
  }
}
