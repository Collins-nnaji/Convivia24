import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL('../lib/db/launch-readiness.sql', import.meta.url), 'utf8');
const migration = schema.match(/ALTER TABLE delivery_zones DROP CONSTRAINT IF EXISTS delivery_zones_city_check;\s*ALTER TABLE delivery_zones ADD CONSTRAINT delivery_zones_city_check CHECK \([\s\S]*?\);/);
if (!migration) throw new Error('Delivery city migration was not found.');
const statements = migration[0].split(';').map(statement => statement.trim()).filter(Boolean);

try {
  const results = await sql.transaction([
    ...statements.map(statement => sql.query(statement)),
    sql`SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint
        WHERE conrelid = 'delivery_zones'::regclass AND conname = 'delivery_zones_city_check'`,
    sql`SELECT city, COUNT(*)::int AS zones, COUNT(*) FILTER (WHERE active)::int AS enabled
        FROM delivery_zones GROUP BY city ORDER BY city`,
  ]);
  console.log('Delivery city migration completed.');
  console.log('Verified constraint:', results[2][0]?.definition);
  console.log('Existing delivery zones:', JSON.stringify(results[3]));
} catch (error) {
  console.error('Delivery city migration failed:', error instanceof Error ? error.message : 'Database request failed.');
  process.exitCode = 1;
}
