import { readFileSync, writeFileSync } from 'fs';

// Pull the venue data straight out of the TS source so the seed can never
// disagree with what the app currently ships.
const src = readFileSync('lib/dining/venues.ts', 'utf-8');
const body = src.slice(src.indexOf('export const VENUES'), src.indexOf('export function getVenue'));
const json = body.slice(body.indexOf('['), body.lastIndexOf('];') + 1);
const VENUES = eval(json);

const q = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const kobo = (naira) => Math.round(naira * 100);
const bp = (pct) => Math.round(pct * 100);

const out = [];
out.push(`-- Convivia24 — venue and menu seed`);
out.push(`--`);
out.push(`-- Generated from lib/dining/venues.ts by scripts/build-seed.mjs -- do not edit by`);
out.push(`-- hand. Re-run "npm run seed:sql" after changing a menu in that file.`);
out.push(`--`);
out.push(`-- Idempotent: every row upserts on its primary key, so running this again after`);
out.push(`-- a price change updates the menu rather than duplicating it. Prices already`);
out.push(`-- captured on an order line are untouched by design.`);
out.push(`--`);
out.push(`-- Money is in kobo and rates in basis points, matching 001_gatherings.sql.`);
out.push('');

for (const v of VENUES) {
  out.push(`-- ── ${v.name}, ${v.area} ──`);
  out.push(`INSERT INTO venues (slug, name, area, city, cuisine, blurb, image_url, price_band, typical_per_head_kobo, service_charge_bp, vat_bp)
VALUES (${q(v.slug)}, ${q(v.name)}, ${q(v.area)}, ${q(v.city)}, ${q(v.cuisine)}, ${q(v.blurb)}, ${q(v.image)}, ${v.priceBand}, ${kobo(v.typicalPerHead)}, ${bp(v.serviceChargePct)}, ${bp(v.vatPct)})
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, area = EXCLUDED.area, city = EXCLUDED.city,
  cuisine = EXCLUDED.cuisine, blurb = EXCLUDED.blurb, image_url = EXCLUDED.image_url,
  price_band = EXCLUDED.price_band, typical_per_head_kobo = EXCLUDED.typical_per_head_kobo,
  service_charge_bp = EXCLUDED.service_charge_bp, vat_bp = EXCLUDED.vat_bp,
  updated_at = NOW();`);
  out.push('');

  v.sections.forEach((s, si) => {
    // Sections have no natural key, so match on (venue, name) to stay idempotent.
    out.push(`INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT ${q(v.slug)}, ${q(s.name)}, ${q(s.kind)}, ${si}
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = ${q(v.slug)} AND name = ${q(s.name)}
);`);

    s.items.forEach((i, ii) => {
      out.push(`INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT ${q(i.id)}, ${q(v.slug)}, sec.id, ${q(i.name)}, ${q(i.note)}, ${kobo(i.price)}, ${!!i.signature}, ${!!i.veg}, ${!!i.shareable}, ${ii}
FROM venue_menu_sections sec
WHERE sec.venue_slug = ${q(v.slug)} AND sec.name = ${q(s.name)}
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();`);
    });
    out.push('');
  });
}

writeFileSync('lib/db/migrations/002_seed_venues.sql', out.join('\n'));
const items = VENUES.reduce((n, v) => n + v.sections.reduce((m, s) => m + s.items.length, 0), 0);
console.log(`${VENUES.length} venues, ${items} menu items`);
