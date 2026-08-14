-- Convivia24 — venue and menu seed
--
-- Generated from lib/dining/venues.ts by scripts/build-seed.mjs -- do not edit by
-- hand. Re-run "npm run seed:sql" after changing a menu in that file.
--
-- Idempotent: every row upserts on its primary key, so running this again after
-- a price change updates the menu rather than duplicating it. Prices already
-- captured on an order line are untouched by design.
--
-- Money is in kobo and rates in basis points, matching 001_gatherings.sql.

-- ── The Terrace, Victoria Island ──
INSERT INTO venues (slug, name, area, city, cuisine, blurb, image_url, price_band, typical_per_head_kobo, service_charge_bp, vat_bp)
VALUES ('the-terrace', 'The Terrace', 'Victoria Island', 'Lagos', 'West African · Farm to table', 'Open-air dining on the upper floor, water views, and a kitchen that treats pepper soup with the seriousness of a stock. The long tables are made for eight.', '/The Spaces.png', 3, 2400000, 1000, 750)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, area = EXCLUDED.area, city = EXCLUDED.city,
  cuisine = EXCLUDED.cuisine, blurb = EXCLUDED.blurb, image_url = EXCLUDED.image_url,
  price_band = EXCLUDED.price_band, typical_per_head_kobo = EXCLUDED.typical_per_head_kobo,
  service_charge_bp = EXCLUDED.service_charge_bp, vat_bp = EXCLUDED.vat_bp,
  updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'the-terrace', 'Small Plates', 'food', 0
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'the-terrace' AND name = 'Small Plates'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-asun', 'the-terrace', sec.id, 'Asun Skewers', 'scotch bonnet glaze, red onion', 850000, true, false, true, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Small Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-dumpling', 'the-terrace', sec.id, 'Pepper Soup Dumplings', 'ukpaka dipping sauce', 750000, false, false, true, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Small Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-akara', 'the-terrace', sec.id, 'Crab Akara', 'mango avocado, pickled cucumber', 950000, false, false, false, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Small Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-puff', 'the-terrace', sec.id, 'Puff Puff', 'truffle honey, aged parmesan', 600000, false, true, true, 3
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Small Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-plantain', 'the-terrace', sec.id, 'Burnt Plantain', 'smoked scotch bonnet crème', 550000, false, true, true, 4
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Small Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'the-terrace', 'Mains', 'food', 1
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'the-terrace' AND name = 'Mains'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-wagyu', 'the-terrace', sec.id, 'Wagyu Suya', 'suya spice rub, tiger nut salsa', 3200000, true, false, false, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Mains'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-bream', 'the-terrace', sec.id, 'Whole Bream', 'jollof-smoked butter, yam purée', 2600000, false, false, true, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Mains'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-egusi', 'the-terrace', sec.id, 'Ẹ̀gúsí Risotto', 'toasted melon seed, parmesan', 1850000, false, true, false, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Mains'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-oha', 'the-terrace', sec.id, 'Oha Leaf Pasta', 'crayfish, crispy garlic', 1950000, false, false, false, 3
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Mains'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-jollof', 'the-terrace', sec.id, 'Party Jollof', 'for the table, bottom-of-the-pot', 1200000, false, true, true, 4
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'Mains'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'the-terrace', 'From the Bar', 'drink', 2
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'the-terrace' AND name = 'From the Bar'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-negroni', 'the-terrace', sec.id, 'Convivia Negroni', 'palm wine-washed gin', 900000, true, false, false, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'From the Bar'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-sour', 'the-terrace', sec.id, 'Lagos Sour', 'Nigerian rum, tamarind, lime', 850000, false, false, false, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'From the Bar'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-zobo', 'the-terrace', sec.id, 'Zobo Smash', 'hibiscus gin, mint, cucumber', 800000, false, false, false, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'From the Bar'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-24', 'the-terrace', sec.id, 'The 24', 'daily-changing, ask the bar', 950000, false, false, false, 3
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'From the Bar'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-wine', 'the-terrace', sec.id, 'House Red / White', 'by the bottle', 2800000, false, false, true, 4
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'From the Bar'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'ter-water', 'the-terrace', sec.id, 'Still or Sparkling', 'large bottle', 250000, false, false, true, 5
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-terrace' AND sec.name = 'From the Bar'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

-- ── Ọ̀únjẹ, Yaba ──
INSERT INTO venues (slug, name, area, city, cuisine, blurb, image_url, price_band, typical_per_head_kobo, service_charge_bp, vat_bp)
VALUES ('ounje', 'Ọ̀únjẹ', 'Yaba', 'Lagos', 'Yoruba home cooking', 'Plastic chairs, enamel bowls, and the best ofada in the city. Cash-cheap and loud — the sort of place a group of six can eat properly for the price of two cocktails elsewhere.', '/conv1.png', 1, 750000, 0, 750)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, area = EXCLUDED.area, city = EXCLUDED.city,
  cuisine = EXCLUDED.cuisine, blurb = EXCLUDED.blurb, image_url = EXCLUDED.image_url,
  price_band = EXCLUDED.price_band, typical_per_head_kobo = EXCLUDED.typical_per_head_kobo,
  service_charge_bp = EXCLUDED.service_charge_bp, vat_bp = EXCLUDED.vat_bp,
  updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'ounje', 'From the Pot', 'food', 0
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'ounje' AND name = 'From the Pot'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-ofada', 'ounje', sec.id, 'Ofada & Ayamase', 'green pepper stew, assorted meat', 550000, true, false, false, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'From the Pot'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-efo', 'ounje', sec.id, 'Ẹ̀fọ́ Rirọ̀', 'with pounded yam', 480000, false, false, false, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'From the Pot'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-egusi', 'ounje', sec.id, 'Ẹ̀gúsí & Eba', 'goat meat, stockfish', 520000, false, false, false, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'From the Pot'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-ewa', 'ounje', sec.id, 'Ẹ̀wà Agoyin', 'agoyin sauce, agege bread', 300000, false, true, false, 3
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'From the Pot'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-asaro', 'ounje', sec.id, 'Àsáró', 'yam porridge, smoked fish', 420000, false, false, false, 4
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'From the Pot'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'ounje', 'Sides & Extras', 'food', 1
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'ounje' AND name = 'Sides & Extras'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-goat', 'ounje', sec.id, 'Extra Goat Meat', NULL, 250000, false, false, false, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'Sides & Extras'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-fish', 'ounje', sec.id, 'Grilled Titus', NULL, 350000, false, false, false, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'Sides & Extras'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-dodo', 'ounje', sec.id, 'Dodo', 'fried plantain', 150000, false, true, true, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'Sides & Extras'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-moi', 'ounje', sec.id, 'Moi Moi', NULL, 180000, false, true, false, 3
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'Sides & Extras'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'ounje', 'Drinks', 'drink', 2
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'ounje' AND name = 'Drinks'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-palm', 'ounje', sec.id, 'Fresh Palm Wine', 'by the jug', 400000, true, false, true, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'Drinks'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-zobo', 'ounje', sec.id, 'Chilled Zobo', NULL, 120000, false, true, false, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'Drinks'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-malt', 'ounje', sec.id, 'Malt', NULL, 150000, false, false, false, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'Drinks'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'oun-star', 'ounje', sec.id, 'Star / Trophy', 'big bottle', 200000, false, false, false, 3
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'ounje' AND sec.name = 'Drinks'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

-- ── The Lounge, Ikoyi ──
INSERT INTO venues (slug, name, area, city, cuisine, blurb, image_url, price_band, typical_per_head_kobo, service_charge_bp, vat_bp)
VALUES ('the-lounge', 'The Lounge', 'Ikoyi', 'Lagos', 'Cocktails · Listening room', 'Candlelit bar and listening room. Live sets Thursday to Saturday. Bar snacks exist, but nobody comes here for the food — plan the drinks and the ₦ adds up fast.', '/Convivium.png', 4, 3200000, 1250, 750)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, area = EXCLUDED.area, city = EXCLUDED.city,
  cuisine = EXCLUDED.cuisine, blurb = EXCLUDED.blurb, image_url = EXCLUDED.image_url,
  price_band = EXCLUDED.price_band, typical_per_head_kobo = EXCLUDED.typical_per_head_kobo,
  service_charge_bp = EXCLUDED.service_charge_bp, vat_bp = EXCLUDED.vat_bp,
  updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'the-lounge', 'Signatures', 'drink', 0
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'the-lounge' AND name = 'Signatures'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-smoke', 'the-lounge', sec.id, 'Smoke & Suya', 'mezcal, suya tincture, agave', 1200000, true, false, false, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Signatures'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-agbo', 'the-lounge', sec.id, 'Agbo Old Fashioned', 'bitters steeped in agbo herbs', 1350000, true, false, false, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Signatures'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-tiger', 'the-lounge', sec.id, 'Tiger Nut Colada', 'kunu aya, aged rum', 1100000, false, false, false, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Signatures'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-chapman', 'the-lounge', sec.id, 'Grown Chapman', 'the childhood one, with teeth', 950000, false, false, false, 3
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Signatures'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'the-lounge', 'Bottles', 'drink', 1
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'the-lounge' AND name = 'Bottles'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-champ', 'the-lounge', sec.id, 'Champagne', 'bottle, for the table', 18000000, false, false, true, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Bottles'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-whisky', 'the-lounge', sec.id, 'Single Malt', '12yr, bottle service', 14500000, false, false, true, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Bottles'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-wine', 'the-lounge', sec.id, 'Red Burgundy', 'bottle', 6500000, false, false, true, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Bottles'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'the-lounge', 'Bar Snacks', 'food', 2
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'the-lounge' AND name = 'Bar Snacks'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-gizzard', 'the-lounge', sec.id, 'Peppered Gizzard', NULL, 900000, false, false, true, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Bar Snacks'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-nuts', 'the-lounge', sec.id, 'Spiced Kuli Kuli', NULL, 450000, false, true, true, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Bar Snacks'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'lng-slider', 'the-lounge', sec.id, 'Suya Sliders', 'three per order', 1150000, false, false, true, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-lounge' AND sec.name = 'Bar Snacks'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

-- ── The Brunch House, Lekki Phase 1 ──
INSERT INTO venues (slug, name, area, city, cuisine, blurb, image_url, price_band, typical_per_head_kobo, service_charge_bp, vat_bp)
VALUES ('the-brunch-house', 'The Brunch House', 'Lekki Phase 1', 'Lagos', 'All-day brunch', 'Saturday jazz, bottomless mimosas, and the slowest morning of the week. Splits get messy here because half the table drinks and half does not — which is exactly the point.', '/Homepage2.png', 2, 1500000, 1000, 750)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, area = EXCLUDED.area, city = EXCLUDED.city,
  cuisine = EXCLUDED.cuisine, blurb = EXCLUDED.blurb, image_url = EXCLUDED.image_url,
  price_band = EXCLUDED.price_band, typical_per_head_kobo = EXCLUDED.typical_per_head_kobo,
  service_charge_bp = EXCLUDED.service_charge_bp, vat_bp = EXCLUDED.vat_bp,
  updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'the-brunch-house', 'Plates', 'food', 0
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'the-brunch-house' AND name = 'Plates'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'brn-shakshuka', 'the-brunch-house', sec.id, 'Suya Shakshuka', 'two eggs, agege toast', 1100000, true, false, false, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-brunch-house' AND sec.name = 'Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'brn-pancake', 'the-brunch-house', sec.id, 'Plantain Pancakes', 'coconut cream, palm sugar', 950000, false, true, false, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-brunch-house' AND sec.name = 'Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'brn-benedict', 'the-brunch-house', sec.id, 'Smoked Fish Benedict', 'hollandaise, dodo hash', 1300000, false, false, false, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-brunch-house' AND sec.name = 'Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'brn-akara', 'the-brunch-house', sec.id, 'Akara & Ogi', 'the classic, done properly', 650000, false, true, false, 3
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-brunch-house' AND sec.name = 'Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'brn-bowl', 'the-brunch-house', sec.id, 'Green Bowl', 'ugu, avocado, poached egg', 1000000, false, true, false, 4
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-brunch-house' AND sec.name = 'Plates'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();

INSERT INTO venue_menu_sections (venue_slug, name, kind, position)
SELECT 'the-brunch-house', 'Bottomless', 'drink', 1
WHERE NOT EXISTS (
  SELECT 1 FROM venue_menu_sections WHERE venue_slug = 'the-brunch-house' AND name = 'Bottomless'
);
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'brn-mimosa', 'the-brunch-house', sec.id, 'Bottomless Mimosa', '90 minutes, per person', 1800000, true, false, false, 0
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-brunch-house' AND sec.name = 'Bottomless'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'brn-bloody', 'the-brunch-house', sec.id, 'Bloody Mary', NULL, 800000, false, false, false, 1
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-brunch-house' AND sec.name = 'Bottomless'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'brn-juice', 'the-brunch-house', sec.id, 'Cold Press', 'pineapple, ginger, mint', 450000, false, true, false, 2
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-brunch-house' AND sec.name = 'Bottomless'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
INSERT INTO venue_menu_items (id, venue_slug, section_id, name, note, price_kobo, is_signature, is_vegetarian, is_shareable, position)
SELECT 'brn-coffee', 'the-brunch-house', sec.id, 'Flat White', NULL, 350000, false, true, false, 3
FROM venue_menu_sections sec
WHERE sec.venue_slug = 'the-brunch-house' AND sec.name = 'Bottomless'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, note = EXCLUDED.note, price_kobo = EXCLUDED.price_kobo,
  is_signature = EXCLUDED.is_signature, is_vegetarian = EXCLUDED.is_vegetarian,
  is_shareable = EXCLUDED.is_shareable, position = EXCLUDED.position,
  is_available = true, updated_at = NOW();
