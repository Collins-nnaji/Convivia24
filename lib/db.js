import { neon } from '@neondatabase/serverless';

// Handle missing DATABASE_URL gracefully for build time
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
export const sql = databaseUrl ? neon(databaseUrl) : null;

/**
 * Execute a query with error handling
 */
export async function query(text, params) {
  if (!sql) {
    throw new Error('Database connection not configured. Please set DATABASE_URL environment variable.');
  }
  try {
    const result = await sql(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a transaction
 */
export async function transaction(callback) {
  if (!sql) {
    throw new Error('Database connection not configured. Please set DATABASE_URL environment variable.');
  }
  try {
    const result = await callback(sql);
    return result;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}
