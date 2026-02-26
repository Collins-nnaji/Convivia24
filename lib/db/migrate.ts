// Run: npx tsx lib/db/migrate.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

// Load .env manually
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
} catch { /* no .env file */ }

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const schema = readFileSync(join(process.cwd(), 'lib/db/schema.sql'), 'utf-8');

  // Split by semicolons and run each statement
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      // Remove empty or comment-only blocks
      const lines = s.split('\n').filter(l => l.trim() && !l.trim().startsWith('--'));
      return lines.length > 0;
    });

  console.log(`Running migration (${statements.length} statements)…`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
      console.log(`  [${i + 1}/${statements.length}] OK`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Ignore "does not exist" errors for DROP IF EXISTS
      if (stmt.toLowerCase().includes('drop') && msg.includes('does not exist')) {
        console.log(`  [${i + 1}/${statements.length}] SKIP (already gone)`);
      } else {
        throw err;
      }
    }
  }

  console.log('Migration complete.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
