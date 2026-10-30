/**
 * Sportika Database Migration Script (SQLite)
 * Verifies and applies schema tables
 * Run: npm run db:migrate
 */
import db from './database';

function runMigration() {
  console.log('🔄 Checking and applying database migrations...');
  try {
    // Database schema is automatically verified & created in ./database.ts
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
    console.log('✅ SQLite Tables present:');
    tables.forEach(t => console.log(`   - ${t.name}`));
    console.log('✅ Database migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
