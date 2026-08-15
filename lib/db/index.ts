import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

export class DatabaseUnavailableError extends Error {
  constructor(message = 'Ordering temporarily unavailable. Please try again shortly.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new DatabaseUnavailableError();
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, unknown>[]> {
  return (getSql() as (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>)(
    strings,
    ...values
  );
}

export function apiErrorResponse(err: unknown, fallback = 'Something went wrong.') {
  if (err instanceof DatabaseUnavailableError) {
    return { status: 503 as const, error: err.message };
  }
  console.error(err);
  return { status: 500 as const, error: fallback };
}

export default sql;
