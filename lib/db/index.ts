import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

// Export a real function so Turbopack/bundler treats it as callable (Proxy can break in server bundle).
// Return type ensures destructuring (e.g. const [row] = await sql`...`) type-checks.
function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, unknown>[]> {
  return (getSql() as (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>)(strings, ...values);
}

export default sql;
