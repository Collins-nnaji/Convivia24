// Run: npx tsx lib/db/migrate-v15-fmcg-activation.ts
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* hosted env */ }

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
  const sql = neon(process.env.DATABASE_URL);
  console.log('🔧 Running v15 migration (FMCG brand activation)…\n');

  await sql`
    CREATE TABLE IF NOT EXISTS brand_campaigns (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name              TEXT NOT NULL,
      brand_name        TEXT NOT NULL,
      slug              TEXT UNIQUE NOT NULL,
      status            TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','active','paused','completed','archived')),
      primary_color     TEXT NOT NULL DEFAULT '#c9a84c',
      logo_url          TEXT,
      headline          TEXT,
      subheadline       TEXT,
      venue_name        TEXT,
      city              TEXT NOT NULL DEFAULT 'Lagos',
      event_date        DATE,
      start_time        TEXT,
      end_time          TEXT,
      guestlist_enabled BOOLEAN NOT NULL DEFAULT true,
      max_capacity      INT NOT NULL DEFAULT 500,
      age_gate          BOOLEAN NOT NULL DEFAULT true,
      voucher_enabled   BOOLEAN NOT NULL DEFAULT false,
      voucher_label     TEXT DEFAULT 'Free sample',
      voucher_limit     INT DEFAULT 500,
      voucher_per_phone INT NOT NULL DEFAULT 1,
      photowall_enabled BOOLEAN NOT NULL DEFAULT true,
      lineup_text       TEXT,
      menu_text         TEXT,
      total_scans       INT NOT NULL DEFAULT 0,
      total_checkins    INT NOT NULL DEFAULT 0,
      total_redemptions INT NOT NULL DEFAULT 0,
      total_photos      INT NOT NULL DEFAULT 0,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ brand_campaigns');

  await sql`
    CREATE TABLE IF NOT EXISTS campaign_members (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID NOT NULL REFERENCES brand_campaigns(id) ON DELETE CASCADE,
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role        TEXT NOT NULL DEFAULT 'field'
                    CHECK (role IN ('owner','brand','field')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (campaign_id, user_id)
    )
  `;
  console.log('✓ campaign_members');

  await sql`
    CREATE TABLE IF NOT EXISTS campaign_guests (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id     UUID NOT NULL REFERENCES brand_campaigns(id) ON DELETE CASCADE,
      name            TEXT NOT NULL,
      phone           TEXT NOT NULL,
      email           TEXT,
      pass_token      TEXT UNIQUE NOT NULL,
      segment         TEXT,
      consent_at      TIMESTAMPTZ,
      checked_in_at   TIMESTAMPTZ,
      voucher_redeemed_at TIMESTAMPTZ,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (campaign_id, phone)
    )
  `;
  console.log('✓ campaign_guests');

  await sql`
    CREATE TABLE IF NOT EXISTS campaign_redemptions (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID NOT NULL REFERENCES brand_campaigns(id) ON DELETE CASCADE,
      guest_id    UUID NOT NULL REFERENCES campaign_guests(id) ON DELETE CASCADE,
      redeemed_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ campaign_redemptions');

  await sql`
    CREATE TABLE IF NOT EXISTS campaign_photos (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id  UUID NOT NULL REFERENCES brand_campaigns(id) ON DELETE CASCADE,
      guest_id     UUID REFERENCES campaign_guests(id) ON DELETE SET NULL,
      url          TEXT NOT NULL,
      caption      TEXT,
      approved     BOOLEAN NOT NULL DEFAULT false,
      uploaded_by  UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ campaign_photos');

  await sql`
    CREATE TABLE IF NOT EXISTS campaign_scans (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID NOT NULL REFERENCES brand_campaigns(id) ON DELETE CASCADE,
      event_type  TEXT NOT NULL CHECK (event_type IN ('hub_view','pass_open','checkin','redeem','photo')),
      guest_id    UUID REFERENCES campaign_guests(id) ON DELETE SET NULL,
      meta        JSONB,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ campaign_scans');

  await sql`CREATE INDEX IF NOT EXISTS idx_brand_campaigns_owner ON brand_campaigns(owner_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_brand_campaigns_slug ON brand_campaigns(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaign_guests_campaign ON campaign_guests(campaign_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaign_guests_token ON campaign_guests(pass_token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaign_photos_campaign ON campaign_photos(campaign_id, approved, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaign_scans_campaign ON campaign_scans(campaign_id, created_at DESC)`;

  console.log('\n✅ v15 FMCG activation migration complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
