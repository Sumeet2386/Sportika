import { Router, Response } from 'express';
import db from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to format a DB row into CartItem
const formatCartRow = (row: any) => {
  let productObj = {};
  try {
    productObj = JSON.parse(row.product_data || '{}');
  } catch (_) {
    productObj = {};
  }
  return {
    id: row.id,
    productId: row.product_id,
    size: row.size,
    color: row.color,
    quantity: row.quantity,
    price: row.price,
    product: productObj,
  };
};

// ── GET /api/cart ──
// Retrieve user's current saved cart
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = db.prepare('SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];
    const items = rows.map(formatCartRow);
    res.json({ success: true, data: items });
  } catch (err: any) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve cart items' });
  }
});

// ── POST /api/cart ──
// Add item or increment quantity
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, product, size = 'M', color = 'Standard', quantity = 1, price } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const itemPrice = price || product?.price || 0;
    const productData = JSON.stringify(product || {});

    // SQLite Upsert
    const stmt = db.prepare(`
      INSERT INTO cart_items (user_id, product_id, size, color, quantity, price, product_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, product_id, size, color) DO UPDATE SET
        quantity = quantity + excluded.quantity,
        price = excluded.price,
        product_data = excluded.product_data,
        updated_at = datetime('now')
    `);

    stmt.run(userId, productId, size, color, quantity, itemPrice, productData);

    const rows = db.prepare('SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];
    res.json({ success: true, message: 'Item added to cart', data: rows.map(formatCartRow) });
  } catch (err: any) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
});

// ── PUT /api/cart/quantity ──
// Update item quantity
router.put('/quantity', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, size, color, quantity } = req.body;

    if (!productId || size === undefined || color === undefined || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    if (quantity <= 0) {
      db.prepare(`
        DELETE FROM cart_items
        WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?
      `).run(userId, productId, size, color);
    } else {
      db.prepare(`
        UPDATE cart_items
        SET quantity = ?, updated_at = datetime('now')
        WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?
      `).run(quantity, userId, productId, size, color);
    }

    const rows = db.prepare('SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];
    res.json({ success: true, message: 'Cart updated', data: rows.map(formatCartRow) });
  } catch (err: any) {
    console.error('Error updating cart quantity:', err);
    res.status(500).json({ success: false, message: 'Failed to update quantity' });
  }
});

// ── DELETE /api/cart/item ──
// Remove single item from cart
router.delete('/item', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, size, color } = req.body;

    if (!productId || size === undefined || color === undefined) {
      return res.status(400).json({ success: false, message: 'Missing product identifiers' });
    }

    db.prepare(`
      DELETE FROM cart_items
      WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?
    `).run(userId, productId, size, color);

    const rows = db.prepare('SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];
    res.json({ success: true, message: 'Item removed', data: rows.map(formatCartRow) });
  } catch (err: any) {
    console.error('Error deleting cart item:', err);
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
});

// ── DELETE /api/cart ──
// Clear entire cart for user
router.delete('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    res.json({ success: true, message: 'Cart cleared', data: [] });
  } catch (err: any) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
});

// ── POST /api/cart/sync ──
// Sync local cart to user's database cart upon login
router.post('/sync', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { items = [] } = req.body;

    if (Array.isArray(items) && items.length > 0) {
      const upsert = db.prepare(`
        INSERT INTO cart_items (user_id, product_id, size, color, quantity, price, product_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, product_id, size, color) DO UPDATE SET
          quantity = quantity + excluded.quantity,
          updated_at = datetime('now')
      `);

      const tx = db.transaction((list: any[]) => {
        for (const it of list) {
          const pId = it.productId || it.product?.id;
          if (pId) {
            upsert.run(
              userId,
              pId,
              it.size || 'M',
              it.color || 'Standard',
              it.quantity || 1,
              it.price || it.product?.price || 0,
              JSON.stringify(it.product || {})
            );
          }
        }
      });

      tx(items);
    }

    const rows = db.prepare('SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];
    res.json({ success: true, message: 'Cart synced successfully', data: rows.map(formatCartRow) });
  } catch (err: any) {
    console.error('Error syncing cart:', err);
    res.status(500).json({ success: false, message: 'Failed to sync cart' });
  }
});

export default router;
