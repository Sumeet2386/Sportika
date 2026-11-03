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

const ADMINS = [
  {
    email: 'sumeetgite23@gmail.com',
    name: 'Sumeet Ravindra Gite',
    password: 'Admin@Sportika2024',
  },
  {
    email: 'admin@sportika.in',
    name: 'Sportika Admin',
    password: 'Admin@Sportika2024',
  },
];

async function seed() {
  console.log('\n🌱 Sportika Database Seeder\n');

  for (const admin of ADMINS) {
    const existing = db.prepare('SELECT id, email, role FROM users WHERE email = ?').get(admin.email) as any;
    if (existing) {
      db.prepare("UPDATE users SET role = 'admin', email_verified = 1 WHERE email = ?").run(admin.email);
      console.log(`✅ Admin account updated with admin role: ${existing.email}`);
    } else {
      const passwordHash = await bcrypt.hash(admin.password, 12);
      const adminId = genId();
      const now = new Date().toISOString();

      db.prepare(
        "INSERT INTO users (id, name, email, password_hash, role, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', 1, ?, ?)"
      ).run(adminId, admin.name, admin.email, passwordHash, now, now);

      console.log(`✅ Admin account created: ${admin.email} (Password: ${admin.password})`);
    }
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
