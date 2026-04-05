import { query } from './index';

/**
 * Runs all pending database migrations.
 * Safe to call multiple times — uses IF NOT EXISTS.
 */
export async function runMigrations(): Promise<void> {
  try {
    // Add columns to users table if they don't exist
    await query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'owner'`
    );
    await query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_id TEXT`
    );
    await query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS cargo VARCHAR(255)`
    );

    // Create team_invites table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS team_invites (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
        last_accessed_at TIMESTAMPTZ
      )
    `);

    // Create team_members table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        owner_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(owner_id, member_id)
      )
    `);

    console.log('✓ Database migrations completed successfully');
  } catch (error) {
    console.error('Database migration error:', error);
    throw error;
  }
}
