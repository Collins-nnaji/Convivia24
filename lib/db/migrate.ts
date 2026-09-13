// Run: npx tsx lib/db/migrate.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

// Load .env.local then .env
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
  } catch { /* file not present */ }
}


/**
 * Split a SQL script into statements.
 *
 * Semicolons inside string literals, dollar-quoted bodies and `--` comments are not terminators,
 * so we walk the text rather than calling `.split(';')`.
 */
function splitSql(sql: string): string[] {
  const out: string[] = [];
  let buf = '';
  let i = 0;

  while (i < sql.length) {
    const two = sql.slice(i, i + 2);

    // Line comment — drop through to end of line.
    if (two === '--') {
      const nl = sql.indexOf('\n', i);
      i = nl === -1 ? sql.length : nl;
      continue;
    }
    // Block comment.
    if (two === '/*') {
      const close = sql.indexOf('*/', i + 2);
      i = close === -1 ? sql.length : close + 2;
      continue;
    }
    // Single-quoted string, '' escapes a quote.
    if (sql[i] === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") { j += 2; continue; }
        if (sql[j] === "'") break;
        j++;
      }
      buf += sql.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    // Dollar-quoted body ($$ … $$ or $tag$ … $tag$) — function definitions live here.
    const dollar = /^\$[A-Za-z_]*\$/.exec(sql.slice(i));
    if (dollar) {
      const tag = dollar[0];
      const close = sql.indexOf(tag, i + tag.length);
      const end = close === -1 ? sql.length : close + tag.length;
      buf += sql.slice(i, end);
      i = end;
      continue;
    }
    if (sql[i] === ';') {
      if (buf.trim()) out.push(buf.trim());
      buf = '';
      i++;
      continue;
    }
    buf += sql[i];
    i++;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const schemaFiles = [
    'lib/db/schema.sql',
    'lib/db/venues-migration.sql',
    // Inventory, supplier pricing and per-supplier stock. All statements are IF NOT EXISTS /
    // ADD COLUMN IF NOT EXISTS, so re-running is safe.
    'lib/db/ecommerce.sql',
    // Supplier portal: per-supplier slugs, access keys and the audit log.
    'lib/db/suppliers-portal.sql',
  ];
  const schema = schemaFiles
    .map(f => readFileSync(join(process.cwd(), f), 'utf-8'))
    .join('\n');

  // Split on statement terminators only. Comments are stripped first because a `--` line
  // containing a semicolon ("reviewed manually; admin desk unchanged.") used to split mid-comment
  // and abort the whole migration, leaving every later table uncreated.
  const statements = splitSql(schema);

  console.log(`Running migration (${statements.length} statements)…`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
      console.log(`  [${i + 1}/${statements.length}] OK`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (stmt.toLowerCase().includes('drop') && msg.includes('does not exist')) {
        console.log(`  [${i + 1}/${statements.length}] SKIP`);
      } else {
        console.error(`  [${i + 1}/${statements.length}] FAIL: ${msg}`);
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
