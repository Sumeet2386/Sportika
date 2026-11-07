import bcrypt from 'bcryptjs';
import db from './database';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from './initialData';

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

/**
 * Bootstrap default catalog and coupons into SQLite if tables are empty.
 */
export function bootstrapCatalog(): void {
  try {
    const productCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
    if (productCount === 0) {
      console.log('🌱 Seeding initial products into database...');
      const insertProduct = db.prepare(`
        INSERT INTO products (
          id, name, slug, brand, description, category, subcategory, sport,
          price, original_price, discount, rating, review_count, stock, sold,
          images, sizes, colors, tags, featured, new_arrival, bestseller, active, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
        )
      `);

      const tx = db.transaction((products: typeof INITIAL_PRODUCTS) => {
        for (const p of products) {
          insertProduct.run(
            p.id, p.name, p.slug, p.brand, p.description, p.category, p.subcategory, p.sport,
            p.price, p.original_price, p.discount, p.rating, p.review_count, p.stock, p.sold,
            JSON.stringify(p.images), JSON.stringify(p.sizes), JSON.stringify(p.colors), JSON.stringify(p.tags),
            p.featured, p.new_arrival, p.bestseller, p.active
          );
        }
      });
      tx(INITIAL_PRODUCTS);
      console.log(`✅ Seeded ${INITIAL_PRODUCTS.length} products successfully.`);
    }

    const couponCount = (db.prepare('SELECT COUNT(*) as count FROM coupons').get() as any).count;
    if (couponCount === 0) {
      console.log('🌱 Seeding initial coupons into database...');
      const insertCoupon = db.prepare(`
        INSERT INTO coupons (id, code, type, value, min_order, max_discount, usage_limit, used_count, expires_at, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      const tx = db.transaction((coupons: typeof INITIAL_COUPONS) => {
        for (const c of coupons) {
          insertCoupon.run(
            c.id, c.code, c.type, c.value, c.min_order, c.max_discount, c.usage_limit, c.used_count, c.expires_at, c.active
          );
        }
      });
      tx(INITIAL_COUPONS);
      console.log(`✅ Seeded ${INITIAL_COUPONS.length} coupons successfully.`);
    }
  } catch (err: any) {
    console.error('[BOOTSTRAP] Failed to bootstrap catalog:', err.message);
  }
}

