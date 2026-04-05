import { runMigrations } from './db/migrate';

let initialized = false;

export async function initializeDatabase() {
  if (initialized) return;

  try {
    console.log('🔄 Initializing database...');
    await runMigrations();
    initialized = true;
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw — let the app continue, migrations can be retried
  }
}
