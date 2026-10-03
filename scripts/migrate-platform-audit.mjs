import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = neon(process.env.DATABASE_URL);
// This scoped migration contains ordinary DDL and a view, without SQL function bodies.
const statements = readFileSync(new URL('../lib/db/platform-audit.sql', import.meta.url), 'utf8')
  .replace(/^\s*--.*$/gm, '')
  .split(';').map(statement => statement.trim()).filter(Boolean);
await sql.transaction(statements.map(statement => sql.query(statement)));
console.log('Platform audit tables and activity view are ready.');
