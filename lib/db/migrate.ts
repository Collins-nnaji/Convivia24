// Run: npx tsx lib/db/migrate.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const schema = readFileSync(join(process.cwd(), 'lib/db/schema.sql'), 'utf-8');
  console.log('Running migration…');
  await client.query(schema);
  await client.end();
  console.log('Migration complete.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
