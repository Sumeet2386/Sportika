import Database, { Database as DatabaseInstance } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'sportika.db');
const db: DatabaseInstance = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create Tables ──
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    email_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default INTEGER DEFAULT 0,
    type TEXT DEFAULT 'home' CHECK (type IN ('home', 'work', 'other')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    items TEXT NOT NULL DEFAULT '[]',
    address TEXT NOT NULL,
    payment TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    shipping REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total REAL NOT NULL,
    coupon_code TEXT,
    coupon_discount REAL DEFAULT 0,
    notes TEXT,
    tracking TEXT DEFAULT '[]',
    expected_delivery TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    added_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    size TEXT NOT NULL DEFAULT 'M',
    color TEXT NOT NULL DEFAULT 'Standard',
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL,
    product_data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id, size, color)
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand TEXT DEFAULT 'Sportika',
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    sport TEXT DEFAULT 'Training',
    price REAL NOT NULL,
    original_price REAL NOT NULL,
    discount INTEGER DEFAULT 0,
    rating REAL DEFAULT 4.8,
    review_count INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 50,
    sold INTEGER DEFAULT 0,
    images TEXT NOT NULL DEFAULT '[]',
    sizes TEXT NOT NULL DEFAULT '[]',
    colors TEXT NOT NULL DEFAULT '[]',
    tags TEXT NOT NULL DEFAULT '[]',
    featured INTEGER DEFAULT 0,
    new_arrival INTEGER DEFAULT 0,
    bestseller INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value REAL NOT NULL,
    min_order REAL DEFAULT 0,
    max_discount REAL,
    usage_limit INTEGER DEFAULT 1000,
    used_count INTEGER DEFAULT 0,
    expires_at TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
  CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
  CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
`);

console.log('✅ SQLite database initialized at:', DB_PATH);

export default db;
