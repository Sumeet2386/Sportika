import { Router, Request, Response } from 'express';
import db from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const genId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});

// Helper to parse a SQLite product row into standard frontend Product structure
export const parseProduct = (row: any) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand || 'Sportika',
    description: row.description || '',
    category: row.category,
    subcategory: row.subcategory,
    sport: row.sport || 'Training',
    price: Number(row.price) || 0,
    originalPrice: Number(row.original_price) || Number(row.price) || 0,
    discount: Number(row.discount) || 0,
    rating: Number(row.rating) || 4.8,
    reviewCount: Number(row.review_count) || 0,
    stock: Number(row.stock) || 0,
    sold: Number(row.sold) || 0,
    images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : row.images || [],
    sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes || '[]') : row.sizes || [],
    colors: typeof row.colors === 'string' ? JSON.parse(row.colors || '[]') : row.colors || [],
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : row.tags || [],
    featured: Boolean(row.featured),
    newArrival: Boolean(row.new_arrival),
    bestseller: Boolean(row.bestseller),
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// ── GET /api/products ── (Fetch products with search, filter, and sorting)
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      category,
      sub,
      sport,
      search,
      minPrice,
      maxPrice,
      featured,
      filter,
      sort = 'featured',
      page = '1',
      limit = '100',
    } = req.query;

    const conditions: string[] = ['active = 1'];
    const params: any[] = [];

    if (category && typeof category === 'string' && category.trim()) {
      conditions.push('category = ?');
      params.push(category.trim().toLowerCase());
    }

    if (sub && typeof sub === 'string' && sub.trim()) {
      conditions.push('subcategory = ?');
      params.push(sub.trim().toLowerCase());
    }

    if (sport && typeof sport === 'string' && sport.trim()) {
      conditions.push('sport LIKE ?');
      params.push(`%${sport.trim()}%`);
    }

    if (featured === 'true' || featured === '1') {
      conditions.push('featured = 1');
    }

    if (filter === 'new') {
      conditions.push('new_arrival = 1');
    } else if (filter === 'sale') {
      conditions.push('discount > 0');
    } else if (filter === 'bestselling') {
      conditions.push('bestseller = 1');
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      conditions.push('price >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      conditions.push('price <= ?');
      params.push(Number(maxPrice));
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      conditions.push('(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR tags LIKE ?)');
      params.push(q, q, q);
    }

    let orderBy = 'featured DESC, created_at DESC';
    if (sort === 'price-low') {
      orderBy = 'price ASC';
    } else if (sort === 'price-high') {
      orderBy = 'price DESC';
    } else if (sort === 'rating') {
      orderBy = 'rating DESC, review_count DESC';
    } else if (sort === 'newest') {
      orderBy = 'created_at DESC';
    } else if (sort === 'bestselling') {
      orderBy = 'sold DESC, rating DESC';
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const totalCount = (db.prepare(countQuery).get(...params) as any)?.total || 0;

    const query = `
      SELECT * FROM products
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(query).all(...params, limitNum, offset) as any[];
    const products = rows.map(parseProduct);

    return res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err: any) {
    console.error('Error fetching products:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
});

// ── GET /api/products/:slugOrId ── (Fetch single product by slug or id)
router.get('/:slugOrId', (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const row = db
      .prepare('SELECT * FROM products WHERE (slug = ? OR id = ?) AND active = 1')
      .get(slugOrId, slugOrId) as any;

    if (!row) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({
      success: true,
      data: parseProduct(row),
    });
  } catch (err: any) {
    console.error('Error fetching product:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product' });
  }
});

// ── POST /api/products ── (Admin: Create product)
router.post('/', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      category,
      subcategory,
      sport = 'Training',
      price,
      originalPrice,
      stock = 50,
      description = '',
      images = [],
      sizes = [],
      colors = [],
      tags = [],
      featured = false,
      newArrival = true,
      bestseller = false,
      active = true,
    } = req.body;

    if (!name || !category || !subcategory || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, subcategory, and price are required',
      });
    }

    const id = genId();
    const cleanName = name.trim();
    const slugBase = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${id.slice(-4)}`;

    const numPrice = Number(price);
    const numOrig = originalPrice ? Number(originalPrice) : Math.round(numPrice * 1.5);
    const discount = numOrig > numPrice ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;
    const now = new Date().toISOString();

    const defaultImages = images.length
      ? images
      : ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80'];

    const defaultSizes = sizes.length
      ? sizes
      : [
          { size: 'S', stock: 15 },
          { size: 'M', stock: 25 },
          { size: 'L', stock: 20 },
          { size: 'XL', stock: 10 },
        ];

    const defaultColors = colors.length
      ? colors
      : [
          { name: 'Navy Blue', hex: '#1B2A4A', stock: 35 },
          { name: 'Carbon Black', hex: '#111111', stock: 35 },
        ];

    db.prepare(`
      INSERT INTO products (
        id, name, slug, brand, description, category, subcategory, sport,
        price, original_price, discount, rating, review_count, stock, sold,
        images, sizes, colors, tags, featured, new_arrival, bestseller, active, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, 4.8, 0, ?, 0,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      id,
      cleanName,
      slug,
      'Sportika',
      description,
      category.toLowerCase(),
      subcategory.toLowerCase(),
      sport,
      numPrice,
      numOrig,
      discount,
      Number(stock) || 50,
      JSON.stringify(defaultImages),
      JSON.stringify(defaultSizes),
      JSON.stringify(defaultColors),
      JSON.stringify(tags),
      featured ? 1 : 0,
      newArrival ? 1 : 0,
      bestseller ? 1 : 0,
      active ? 1 : 0,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: parseProduct(created),
    });
  } catch (err: any) {
    console.error('Error creating product:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// ── PUT /api/products/:id ── (Admin: Update product)
router.put('/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      category,
      subcategory,
      sport,
      price,
      originalPrice,
      stock,
      description,
      images,
      sizes,
      colors,
      tags,
      featured,
      newArrival,
      bestseller,
      active,
    } = req.body;

    const numPrice = price !== undefined ? Number(price) : existing.price;
    const numOrig = originalPrice !== undefined ? Number(originalPrice) : existing.original_price;
    const discount = numOrig > numPrice ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        subcategory = COALESCE(?, subcategory),
        sport = COALESCE(?, sport),
        price = ?,
        original_price = ?,
        discount = ?,
        stock = COALESCE(?, stock),
        description = COALESCE(?, description),
        images = COALESCE(?, images),
        sizes = COALESCE(?, sizes),
        colors = COALESCE(?, colors),
        tags = COALESCE(?, tags),
        featured = COALESCE(?, featured),
        new_arrival = COALESCE(?, new_arrival),
        bestseller = COALESCE(?, bestseller),
        active = COALESCE(?, active),
        updated_at = ?
      WHERE id = ?
    `).run(
      name || null,
      category ? category.toLowerCase() : null,
      subcategory ? subcategory.toLowerCase() : null,
      sport || null,
      numPrice,
      numOrig,
      discount,
      stock !== undefined ? Number(stock) : null,
      description !== undefined ? description : null,
      images ? JSON.stringify(images) : null,
      sizes ? JSON.stringify(sizes) : null,
      colors ? JSON.stringify(colors) : null,
      tags ? JSON.stringify(tags) : null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      newArrival !== undefined ? (newArrival ? 1 : 0) : null,
      bestseller !== undefined ? (bestseller ? 1 : 0) : null,
      active !== undefined ? (active ? 1 : 0) : null,
      now,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: parseProduct(updated),
    });
  } catch (err: any) {
    console.error('Error updating product:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// ── DELETE /api/products/:id ── (Admin: Delete product)
router.delete('/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting product:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;
