// Run: npx tsx lib/db/migrate-v2.ts
// Adds new columns without dropping existing data
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

const envPath = join(process.cwd(), '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env */ }

async function migrate() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔧 Running v2 migration...\n');

  // users: add verified column
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS product_category TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS target_markets TEXT[] NOT NULL DEFAULT '{}'`;
  console.log('✓ users market profile columns');

  // hangouts: add new columns
  await sql`ALTER TABLE hangouts ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'social'`;
  await sql`ALTER TABLE hangouts ADD COLUMN IF NOT EXISTS city TEXT`;
  await sql`ALTER TABLE hangouts ADD COLUMN IF NOT EXISTS ticket_url TEXT`;
  await sql`ALTER TABLE hangouts ADD COLUMN IF NOT EXISTS ticket_price INT`;
  console.log('✓ hangouts.category, city, ticket_url, ticket_price');

  // add category check constraint if not exists (best-effort)
  try {
    await sql`ALTER TABLE hangouts DROP CONSTRAINT IF EXISTS hangouts_category_check`;
    await sql`ALTER TABLE hangouts ADD CONSTRAINT hangouts_category_check CHECK (category IN ('walk','run','cook','workout','stretch','mindful','nightlife','dining','sports','fitness','gigs','outdoors','arts','social'))`;
  } catch { /* existing data may need manual cleanup before constraint can be added */ }

  await sql`
    CREATE TABLE IF NOT EXISTS checkins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      pillars TEXT[] NOT NULL DEFAULT '{}',
      feel TEXT,
      reflection TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_checkins_user_created ON checkins(user_id, created_at DESC)`;
  console.log('✓ checkins');

  await sql`ALTER TABLE circles ADD COLUMN IF NOT EXISTS intention TEXT NOT NULL DEFAULT 'morning'`;
  console.log('✓ circles.intention');

  await sql`
    CREATE TABLE IF NOT EXISTS client_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      company TEXT,
      role TEXT,
      website TEXT,
      product_category TEXT,
      target_markets TEXT[] NOT NULL DEFAULT '{}',
      launch_goal TEXT,
      budget_range TEXT,
      logo_url TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS market_sprints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      product_name TEXT NOT NULL,
      market TEXT NOT NULL DEFAULT 'Nigeria',
      category TEXT,
      stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea','research','testing','activation','report','complete')),
      goal TEXT,
      audience TEXT,
      budget TEXT,
      asset_url TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','complete','archived')),
      start_date DATE,
      end_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS market_insights (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sprint_id UUID REFERENCES market_sprints(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      market TEXT NOT NULL DEFAULT 'Nigeria',
      insight_type TEXT NOT NULL DEFAULT 'consumer' CHECK (insight_type IN ('consumer','pricing','competitor','channel','culture','risk')),
      summary TEXT NOT NULL,
      recommendation TEXT,
      confidence INT NOT NULL DEFAULT 70,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS brand_activations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sprint_id UUID REFERENCES market_sprints(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Lagos',
      channel TEXT NOT NULL DEFAULT 'sampling',
      venue TEXT,
      activation_date DATE,
      target_leads INT DEFAULT 100,
      actual_leads INT DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','live','complete','cancelled')),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ market entry tables');

  // index for city filtering
  await sql`CREATE INDEX IF NOT EXISTS idx_hangouts_city ON hangouts(city)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_hangouts_category ON hangouts(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_market_sprints_user ON market_sprints(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_market_insights_user ON market_insights(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_brand_activations_user ON brand_activations(user_id, created_at DESC)`;
  console.log('✓ indexes');

  await sql`
    CREATE TABLE IF NOT EXISTS outlet_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      outlet_name TEXT,
      outlet_type TEXT NOT NULL DEFAULT 'nightlife',
      city TEXT NOT NULL DEFAULT 'Lagos',
      address TEXT,
      contact_name TEXT,
      phone TEXT,
      logo_url TEXT,
      delivery_window TEXT,
      credit_terms BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE outlet_profiles ADD COLUMN IF NOT EXISTS logo_url TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS drink_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sku TEXT UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('beer','spirits','wine','non_alcoholic','water','energy','mixer')),
      pack_size TEXT NOT NULL,
      unit TEXT NOT NULL DEFAULT 'case',
      price_ngn INT NOT NULL,
      market_price_ngn INT,
      moq NUMERIC(8, 2) NOT NULL DEFAULT 1,
      stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','low_stock','preorder','out_of_stock')),
      image_url TEXT,
      tags TEXT[] NOT NULL DEFAULT '{}',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE drink_products ADD COLUMN IF NOT EXISTS market_price_ngn INT`;
  await sql`ALTER TABLE drink_products ALTER COLUMN moq TYPE NUMERIC(8, 2) USING moq::numeric`;

  await sql`
    CREATE TABLE IF NOT EXISTS drink_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      outlet_profile_id UUID REFERENCES outlet_profiles(id),
      order_type TEXT NOT NULL DEFAULT 'regular' CHECK (order_type IN ('regular','emergency')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','dispatching','delivered','cancelled')),
      delivery_city TEXT NOT NULL DEFAULT 'Lagos',
      delivery_address TEXT,
      delivery_window TEXT,
      subtotal_ngn INT NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS drink_order_items (
      order_id UUID REFERENCES drink_orders(id) ON DELETE CASCADE,
      product_id UUID REFERENCES drink_products(id),
      quantity NUMERIC(8, 2) NOT NULL,
      unit_price_ngn INT NOT NULL,
      line_total_ngn INT NOT NULL,
      PRIMARY KEY (order_id, product_id)
    )
  `;
  await sql`ALTER TABLE drink_order_items ALTER COLUMN quantity TYPE NUMERIC(8, 2) USING quantity::numeric`;

  const products = [
    ['BEER-STAR-LAGER-60CL', 'Star', 'Lager Beer 60cl', 'beer', '24 bottles x 60cl', 18500, 20500, 0.5, 'in_stock', ['alcoholic','lager','nightlife']],
    ['BEER-GULDER-60CL', 'Gulder', 'Premium Lager 60cl', 'beer', '24 bottles x 60cl', 20500, 22800, 0.5, 'in_stock', ['alcoholic','lager','bar']],
    ['BEER-HEINEKEN-33CL', 'Heineken', 'Premium Lager 33cl', 'beer', '24 bottles x 33cl', 28500, 31500, 0.5, 'low_stock', ['alcoholic','premium']],
    ['SPIRIT-JW-RED-70CL', 'Johnnie Walker', 'Red Label 70cl', 'spirits', '12 bottles x 70cl', 126000, 142000, 0.5, 'in_stock', ['whisky','club','premium']],
    ['SPIRIT-SMIRNOFF-70CL', 'Smirnoff', 'Vodka 70cl', 'spirits', '12 bottles x 70cl', 98000, 112000, 0.5, 'in_stock', ['vodka','cocktail']],
    ['SPIRIT-HENNESSY-VS-70CL', 'Hennessy', 'VS Cognac 70cl', 'spirits', '12 bottles x 70cl', 410000, 455000, 0.5, 'preorder', ['cognac','vip']],
    ['WINE-FOUR-COUSINS-75CL', 'Four Cousins', 'Sweet Red Wine 75cl', 'wine', '12 bottles x 75cl', 76000, 86000, 0.5, 'in_stock', ['wine','restaurant']],
    ['NA-MALTINA-33CL', 'Maltina', 'Classic Malt 33cl', 'non_alcoholic', '24 cans x 33cl', 16200, 18000, 0.5, 'in_stock', ['malt','family','restaurant']],
    ['NA-CHIVITA-1L', 'Chivita', 'Fruit Juice 1L', 'non_alcoholic', '12 packs x 1L', 29500, 33000, 0.5, 'in_stock', ['juice','breakfast','hotel']],
    ['WATER-EVA-75CL', 'Eva', 'Table Water 75cl', 'water', '12 bottles x 75cl', 3200, 4000, 0.5, 'in_stock', ['water','horeca']],
    ['ENERGY-RED-BULL-25CL', 'Red Bull', 'Energy Drink 25cl', 'energy', '24 cans x 25cl', 52000, 57500, 0.5, 'low_stock', ['energy','club','mixer']],
    ['MIXER-SCHWEPPES-TONIC', 'Schweppes', 'Tonic Water 33cl', 'mixer', '24 cans x 33cl', 24500, 27500, 0.5, 'in_stock', ['mixer','cocktail']],
  ];

  for (const p of products) {
    await sql`
      INSERT INTO drink_products (sku, brand, name, category, pack_size, price_ngn, market_price_ngn, moq, stock_status, tags)
      VALUES (${p[0]}, ${p[1]}, ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}::text[])
      ON CONFLICT (sku) DO UPDATE SET
        brand = EXCLUDED.brand,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        pack_size = EXCLUDED.pack_size,
        price_ngn = EXCLUDED.price_ngn,
        market_price_ngn = EXCLUDED.market_price_ngn,
        moq = EXCLUDED.moq,
        stock_status = EXCLUDED.stock_status,
        tags = EXCLUDED.tags,
        is_active = true
    `;
  }

  await sql`CREATE INDEX IF NOT EXISTS idx_drink_products_category ON drink_products(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_drink_orders_user ON drink_orders(user_id, created_at DESC)`;
  console.log('✓ bulk drinks tables and seed products');

  console.log('\n✅ Migration complete.');
}

migrate().catch(err => { console.error(err); process.exit(1); });
