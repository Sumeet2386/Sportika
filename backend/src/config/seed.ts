/**
 * Sportika Admin Setup Script
 * Creates the default admin account and sets up initial data
 * Run: npx ts-node src/config/seed.ts
 */
import bcrypt from 'bcryptjs';
import db from './database';
import dotenv from 'dotenv';

dotenv.config();

const genId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
});

const ADMIN_EMAIL = 'admin@sportika.in';
const ADMIN_PASSWORD = 'Admin@Sportika2024';
const ADMIN_NAME = 'Sportika Admin';

async function seed() {
  console.log('\n🌱 Sportika Database Seeder\n');

  // Check if admin already exists
  const existing = db.prepare('SELECT id, email FROM users WHERE email = ?').get(ADMIN_EMAIL) as any;
  if (existing) {
    console.log(`✅ Admin account already exists: ${existing.email}`);
    console.log(`   (To reset password, delete the user and re-run this script)\n`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const adminId = genId();
    const now = new Date().toISOString();

    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(adminId, ADMIN_NAME, ADMIN_EMAIL, passwordHash, 'admin', now, now);

    console.log('✅ Admin account created!');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   ⚠️  IMPORTANT: Change this password after first login!\n`);
  }

  // Show summary
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const orderCount = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
  
  console.log('📊 Database Summary:');
  console.log(`   Users: ${userCount}`);
  console.log(`   Orders: ${orderCount}`);
  console.log('\n🚀 Server ready at: http://localhost:3001/api/health\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
