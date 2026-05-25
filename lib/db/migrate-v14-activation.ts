// Run: npx tsx lib/db/migrate-v14-activation.ts
// Adds brand activation tables: brand_campaigns, guest_passes, voucher_configs, campaign_photos, campaign_venues
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
} catch { /* hosted env provides DATABASE_URL directly */ }

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
  const sql = neon(process.env.DATABASE_URL);
  console.log('🔧 Running v14 migration (brand activation platform)…\n');

  // Brand campaigns — the top-level activation unit
  await sql`
    CREATE TABLE IF NOT EXISTS brand_campaigns (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id          UUID REFERENCES users(id) ON DELETE CASCADE,
      name              TEXT NOT NULL,
      brand_name        TEXT NOT NULL,
      slug              TEXT UNIQUE NOT NULL,
      status            TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','active','paused','completed','archived')),
      -- White-label theme
      primary_color     TEXT NOT NULL DEFAULT '#c0975a',
      secondary_color   TEXT NOT NULL DEFAULT '#1a1714',
      bg_color          TEXT NOT NULL DEFAULT '#0d0c0a',
      text_color        TEXT NOT NULL DEFAULT '#faf6ee',
      logo_url          TEXT,
      bg_image_url      TEXT,
      -- Campaign config
      headline          TEXT,
      subheadline       TEXT,
      venue_name        TEXT,
      city              TEXT NOT NULL DEFAULT 'Lagos',
      event_date        DATE,
      start_time        TEXT,
      end_time          TEXT,
      -- Guestlist config
      guestlist_enabled BOOLEAN NOT NULL DEFAULT true,
      max_capacity      INT NOT NULL DEFAULT 500,
      -- Voucher config (embedded JSON for flexibility)
      voucher_enabled   BOOLEAN NOT NULL DEFAULT false,
      voucher_label     TEXT DEFAULT 'Free Welcome Drink',
      voucher_limit     INT DEFAULT 500,
      voucher_per_phone INT NOT NULL DEFAULT 1,
      voucher_valid_from TEXT,
      voucher_valid_to   TEXT,
      -- Photo wall config
      photowall_enabled BOOLEAN NOT NULL DEFAULT true,
      photowall_slug    TEXT UNIQUE,
      -- DJ / menu content
      lineup_text       TEXT,
      menu_text         TEXT,
      -- Analytics snapshot (updated by triggers/cron)
      total_scans       INT NOT NULL DEFAULT 0,
      total_redemptions INT NOT NULL DEFAULT 0,
      total_photos      INT NOT NULL DEFAULT 0,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ brand_campaigns');

  // Guest passes — issued when a guest registers at the door QR
  await sql`
    CREATE TABLE IF NOT EXISTS guest_passes (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id   UUID REFERENCES brand_campaigns(id) ON DELETE CASCADE,
      name          TEXT NOT NULL,
      phone         TEXT NOT NULL,
      pass_token    TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
      status        TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','used','revoked')),
      voucher_redeemed   BOOLEAN NOT NULL DEFAULT false,
      voucher_redeemed_at TIMESTAMPTZ,
      redeemed_by_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
      checked_in    BOOLEAN NOT NULL DEFAULT false,
      checked_in_at TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ guest_passes');

  // Campaign photos — uploaded by guests to the live photo wall
  await sql`
    CREATE TABLE IF NOT EXISTS campaign_photos (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id   UUID REFERENCES brand_campaigns(id) ON DELETE CASCADE,
      pass_id       UUID REFERENCES guest_passes(id) ON DELETE SET NULL,
      url           TEXT NOT NULL,
      thumbnail_url TEXT,
      uploader_name TEXT,
      approved      BOOLEAN NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ campaign_photos');

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_bc_owner ON brand_campaigns(owner_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bc_status ON brand_campaigns(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bc_slug ON brand_campaigns(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_gp_campaign ON guest_passes(campaign_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_gp_token ON guest_passes(pass_token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_gp_phone ON guest_passes(campaign_id, phone)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_campaign ON campaign_photos(campaign_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cp_approved ON campaign_photos(campaign_id, approved)`;
  console.log('✓ indexes');

  console.log('\n✅ Migration v14 complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
