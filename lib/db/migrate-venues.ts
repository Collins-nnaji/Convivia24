// Run: npx tsx lib/db/migrate-venues.ts
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

async function migrateVenues() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const venuesSql = readFileSync(join(process.cwd(), 'lib/db/venues-migration.sql'), 'utf-8');
  const statements = venuesSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      const lines = s.split('\n').filter((l) => l.trim() && !l.trim().startsWith('--'));
      return lines.length > 0;
    });

  console.log(`Running venues migration (${statements.length} statements)…`);
  for (let i = 0; i < statements.length; i++) {
    await sql.query(statements[i]);
    console.log(`  [${i + 1}/${statements.length}] OK`);
  }
  console.log('Venues migration complete.');
}

migrateVenues().catch((err) => {
  console.error(err);
  process.exit(1);
});
