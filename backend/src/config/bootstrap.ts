import bcrypt from 'bcryptjs';
import db from './database';

const genId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});

/**
 * Bootstrap the application.
 * If ADMIN_EMAIL and ADMIN_PASSWORD are set in the environment and no admin user exists,
 * create one with the password hashed. Never log the password.
 */
export async function bootstrapAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  try {
    const existingAdmin = db.prepare('SELECT id, email, role FROM users WHERE email = ?').get(adminEmail) as
      | { id: string; email: string; role: string }
      | undefined;

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const adminId = genId();
      const now = new Date().toISOString();
      const adminName = process.env.ADMIN_NAME || 'Sportika Administrator';

      db.prepare(
        "INSERT INTO users (id, name, email, password_hash, role, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', 1, ?, ?)"
      ).run(adminId, adminName, adminEmail, passwordHash, now, now);

      console.log(`[BOOTSTRAP] Admin user created for ${adminEmail}`);
    } else if (existingAdmin.role !== 'admin') {
      db.prepare("UPDATE users SET role = 'admin', email_verified = 1 WHERE email = ?").run(adminEmail);
      console.log(`[BOOTSTRAP] Role updated to admin for ${adminEmail}`);
    }
  } catch (err: any) {
    console.error('[BOOTSTRAP] Failed to bootstrap admin user:', err.message);
  }
}
