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

    // Drop Stripe columns (no longer used)
    await query(`ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id`);
    await query(`ALTER TABLE subscriptions DROP COLUMN IF EXISTS stripe_subscription_id`);
    await query(`ALTER TABLE subscriptions DROP COLUMN IF EXISTS stripe_price_id`);
    await query(`DROP INDEX IF EXISTS idx_users_stripe_customer`);
    await query(`DROP INDEX IF EXISTS idx_subscriptions_stripe`);

    // Create onboarding_forms table
    await query(`
      CREATE TABLE IF NOT EXISTS onboarding_forms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token VARCHAR(64) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
        client_name VARCHAR(255) DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        form_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
        completed_at TIMESTAMPTZ
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_onboarding_forms_token ON onboarding_forms(token)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_onboarding_forms_user ON onboarding_forms(user_id)`);
    await query(`ALTER TABLE onboarding_forms ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ`);

    console.log('✓ Database migrations completed successfully');
  } catch (error) {
    console.error('Database migration error:', error);
    throw error;
  }
}
