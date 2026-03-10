import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
  ssl: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('localhost')
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;

export async function query(text: string, params?: (string | number | boolean | null)[]) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
