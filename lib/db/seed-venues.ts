// Seed DB venues from the old static catalog.
// Run: npx tsx lib/db/seed-venues.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

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

const VENUES = [
  { slug: 'lumen-lounge', name: 'Lumen Lounge', kind: 'rooftop', areaId: 'vi', area: 'Victoria Island', address: 'Adeola Odeku, Victoria Island', lat: 6.4294, lng: 3.4228, tagline: 'Skyline pours, low lights, long tables.', about: 'A VI rooftop built for bottle service and late conversations. Cardholders skip the door queue on Thursdays and Sundays.', hours: 'Thu–Sun · 7pm–3am', coverNgn: 15000, cardPerk: 'Skip the line + 10% off table bottles', cardDiscountPct: 10 },
  { slug: 'harbour-house', name: 'Harbour House', kind: 'club', areaId: 'vi', area: 'Victoria Island', address: 'Akin Adesola, Victoria Island', lat: 6.4312, lng: 3.4186, tagline: 'The room that still opens at 1am.', about: 'A two-room club with a main floor and a quieter amber lounge. Partner venue — Convivia drops restock the back bar the same night.', hours: 'Fri–Sat · 10pm–5am', coverNgn: 20000, cardPerk: 'Guest list after 11pm for Resident+', cardDiscountPct: 8 },
  { slug: 'terrace-14', name: 'Terrace 14', kind: 'lounge', areaId: 'lekki', area: 'Lekki Phase 1', address: 'Admiralty Way, Lekki Phase 1', lat: 6.4486, lng: 3.4652, tagline: 'Admiralty terrace. Soft music until it isn\'t.', about: 'Open-air lounge with booth seating and a tequila-forward back bar.', hours: 'Wed–Sun · 5pm–2am', coverNgn: 10000, cardPerk: 'One complimentary mixer flight', cardDiscountPct: 12 },
  { slug: 'afterlight', name: 'Afterlight', kind: 'club', areaId: 'ikeja', area: 'Ikeja GRA', address: 'Isaac John, Ikeja GRA', lat: 6.5831, lng: 3.3518, tagline: 'GRA nights, mainland energy.', about: 'Ikeja\'s late room — DJs until dawn, a covered courtyard, and a spirits wall that turns over every weekend.', hours: 'Fri–Sat · 9pm–4am', coverNgn: 8000, cardPerk: '₦5,000 door credit', cardDiscountPct: 10 },
  { slug: 'palm-court', name: 'Palm Court', kind: 'lounge', areaId: 'ikoyi', area: 'Ikoyi', address: 'Awolowo Road, Ikoyi', lat: 6.4528, lng: 3.4341, tagline: 'Dinner first. Cognac after.', about: 'An Ikoyi courtyard lounge for long dinners that become nights. Cardholders get a reserved two-top on weeknights.', hours: 'Tue–Sun · 12pm–12am', coverNgn: null, cardPerk: 'Reserved two-top before 8pm', cardDiscountPct: 8 },
  { slug: 'fifth-floor', name: 'The Fifth Floor', kind: 'rooftop', areaId: 'yaba', area: 'Yaba', address: 'Herbert Macaulay, Yaba', lat: 6.5082, lng: 3.3774, tagline: 'Sunset sets over the mainland.', about: 'A Yaba rooftop for golden hour and canned-cocktail tables. Crowds land here before they move to VI.', hours: 'Thu–Sun · 4pm–1am', coverNgn: 5000, cardPerk: 'Free cover before 7pm', cardDiscountPct: 5 },
  { slug: 'saltwater', name: 'Saltwater', kind: 'beach', areaId: 'lekki', area: 'Lekki', address: 'Elegushi stretch, Lekki', lat: 6.4228, lng: 3.535, tagline: 'Sand, speakers, then the after.', about: 'Beach-club days that run into afterparties.', hours: 'Sat–Sun · 12pm–10pm', coverNgn: 12000, cardPerk: 'Cabana upgrade when available', cardDiscountPct: 10 },
  { slug: 'naija-house', name: 'Naija House', kind: 'live', areaId: 'surulere', area: 'Surulere', address: 'Adeniran Ogunsanya, Surulere', lat: 6.4994, lng: 3.3562, tagline: 'Live sets. No velvet rope energy.', about: 'A Surulere live house — bands, DJs, and a bar that stays honest.', hours: 'Thu–Sat · 7pm–2am', coverNgn: 4000, cardPerk: '₦3,000 bar credit', cardDiscountPct: 5 },
  { slug: 'copper-bar', name: 'Copper Bar', kind: 'lounge', areaId: 'maryland', area: 'Maryland', address: 'Mobolaji Bank Anthony, Maryland', lat: 6.5748, lng: 3.3689, tagline: 'Weeknight whisky. Soft booths.', about: 'A Maryland lounge for midweek pours. Quiet enough to talk, stocked enough to stay.', hours: 'Mon–Sat · 4pm–1am', coverNgn: null, cardPerk: 'Whisky flight at member rate', cardDiscountPct: 10 },
];

async function seed() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
  const sql = neon(process.env.DATABASE_URL);

  for (const v of VENUES) {
    await sql`
      INSERT INTO venues (slug, name, kind, area_id, area, address, lat, lng, tagline, about, hours, cover_ngn, card_perk, card_discount_pct, status, source)
      VALUES (${v.slug}, ${v.name}, ${v.kind}, ${v.areaId}, ${v.area}, ${v.address}, ${v.lat}, ${v.lng}, ${v.tagline}, ${v.about}, ${v.hours}, ${v.coverNgn}, ${v.cardPerk}, ${v.cardDiscountPct}, 'active', 'admin')
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, kind = EXCLUDED.kind, area_id = EXCLUDED.area_id, area = EXCLUDED.area,
        address = EXCLUDED.address, tagline = EXCLUDED.tagline, about = EXCLUDED.about, hours = EXCLUDED.hours,
        cover_ngn = EXCLUDED.cover_ngn, card_perk = EXCLUDED.card_perk, card_discount_pct = EXCLUDED.card_discount_pct,
        updated_at = NOW()
    `;
    console.log(`  Seeded: ${v.name}`);
  }
  console.log('Done.');
}

seed().catch((e) => { console.error(e); process.exit(1); });
