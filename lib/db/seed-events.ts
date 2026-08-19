// Seed DB events from the old static catalog.
// Run: npx tsx lib/db/seed-events.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import { EVENTS_CACHE_KEY } from '../events/store';
import { redis } from '../redis';

for (const file of ['.env.local', '.env']) {
  try {
    const content = readFileSync(join(process.cwd(), file), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}

function atOffset(days: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

const EVENTS = [
  { id: 'lumen-thursdays', title: 'Lumen Thursdays', venueSlug: 'lumen-lounge', offsetDays: 0, startHour: 21, endHour: 2, tag: 'Rooftop', blurb: 'Resident selectors, bottle tables, VI skyline. Cardholders skip the lift queue.', expected: '~180 in', coverNgn: 15000 },
  { id: 'harbour-late', title: 'Harbour Late', venueSlug: 'harbour-house', offsetDays: 1, startHour: 23, endHour: 5, tag: 'Club', blurb: 'Main floor until the lights come up. Drop bottles to the booth before midnight.', expected: '~320 in', coverNgn: 20000 },
  { id: 'terrace-golden', title: 'Golden Hour · Terrace 14', venueSlug: 'terrace-14', offsetDays: 0, startHour: 17, endHour: 22, tag: 'Lounge', blurb: 'Admiralty terrace from 5. Tequila tables, then the room gets louder.', expected: '~90 in', coverNgn: 10000 },
  { id: 'afterlight-gra', title: 'Afterlight GRA', venueSlug: 'afterlight', offsetDays: 2, startHour: 22, endHour: 4, tag: 'Club', blurb: "Ikeja's Saturday room. Mainland first, VI later if you still have legs.", expected: '~250 in', coverNgn: 8000 },
  { id: 'palm-supper', title: 'Palm Court Supper', venueSlug: 'palm-court', offsetDays: 1, startHour: 19, endHour: 23, tag: 'Dining', blurb: 'Ikoyi courtyard dinner that becomes Cognac. Cardholders: two-top before 8.', expected: '~60 seats', coverNgn: null },
  { id: 'fifth-sunset', title: 'Sunset on Five', venueSlug: 'fifth-floor', offsetDays: 0, startHour: 16, endHour: 21, tag: 'Rooftop', blurb: "Yaba golden hour. Canned cocktails, then whoever is still standing moves.", expected: '~110 in', coverNgn: 5000 },
  { id: 'saltwater-sunday', title: 'Saltwater Sundays', venueSlug: 'saltwater', offsetDays: 3, startHour: 13, endHour: 21, tag: 'Beach', blurb: 'Elegushi stretch, cabanas, Party Packs in the sand. Afterparty listed at 9.', expected: '~200 in', coverNgn: 12000 },
  { id: 'naija-live', title: 'Live at Naija House', venueSlug: 'naija-house', offsetDays: 2, startHour: 20, endHour: 1, tag: 'Live', blurb: "Surulere live set. No velvet rope — just a room that sings back.", expected: '~140 in', coverNgn: 4000 },
  { id: 'copper-midweek', title: 'Copper Midweek', venueSlug: 'copper-bar', offsetDays: 4, startHour: 18, endHour: 23, tag: 'Whisky', blurb: 'Maryland whisky night. Soft booths, member-rate flights.', expected: '~40 in', coverNgn: null },
  { id: 'lumen-sunday', title: 'Lumen Sundays', venueSlug: 'lumen-lounge', offsetDays: 3, startHour: 18, endHour: 0, tag: 'Rooftop', blurb: 'Soft Sunday. Skyline, jazz into house, tables that stay.', expected: '~120 in', coverNgn: 10000 },
  { id: 'harbour-friday', title: 'Friday at Harbour', venueSlug: 'harbour-house', offsetDays: 5, startHour: 22, endHour: 4, tag: 'Club', blurb: "The week's first proper club night. Guest list for Resident cards after 11.", expected: '~280 in', coverNgn: 18000 },
  { id: 'terrace-late', title: 'Terrace After', venueSlug: 'terrace-14', offsetDays: 5, startHour: 21, endHour: 2, tag: 'Lounge', blurb: 'Lekki late lounge. Order the Tequila Terrace Pack to the booth.', expected: '~150 in', coverNgn: 12000 },
];

async function seed() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
  const sql = neon(process.env.DATABASE_URL);

  for (const ev of EVENTS) {
    const startsAt = atOffset(ev.offsetDays, ev.startHour);
    const endDay = ev.endHour < ev.startHour ? ev.offsetDays + 1 : ev.offsetDays;
    const endsAt = atOffset(endDay, ev.endHour);

    await sql`
      INSERT INTO night_events (id, title, venue_slug, tag, blurb, expected, cover_ngn, starts_at, ends_at, published)
      VALUES (${ev.id}, ${ev.title}, ${ev.venueSlug}, ${ev.tag}, ${ev.blurb}, ${ev.expected}, ${ev.coverNgn}, ${startsAt.toISOString()}, ${endsAt.toISOString()}, true)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, venue_slug = EXCLUDED.venue_slug, tag = EXCLUDED.tag,
        blurb = EXCLUDED.blurb, expected = EXCLUDED.expected, cover_ngn = EXCLUDED.cover_ngn,
        starts_at = EXCLUDED.starts_at, ends_at = EXCLUDED.ends_at, updated_at = NOW()
    `;
    console.log(`  Seeded: ${ev.title}`);
  }
  try {
    await redis()?.del(EVENTS_CACHE_KEY);
  } catch {
    /* cache clear is best-effort */
  }
  console.log('Done. All events are now in the DB.');
}

seed().catch((e) => { console.error(e); process.exit(1); });
