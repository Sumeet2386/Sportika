import { Router, Response } from 'express';
import db from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const genId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
});

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SPT-${date}-${rand}`;
};

// POST /api/orders — create order
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { items, address, paymentMethod, couponCode, notes, subtotal, discount, shipping, tax, total, couponDiscount } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: 'Order items are required' });

    const orderId = genId();
    const orderNumber = generateOrderNumber();
    const expectedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const initialTracking = JSON.stringify([{
      status: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received and is being processed.',
      timestamp: now,
      completed: true,
    }]);

    db.prepare(
      `INSERT INTO orders (id, order_number, user_id, items, address, payment, status, subtotal, discount, shipping, tax, total, coupon_code, coupon_discount, notes, tracking, expected_delivery, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderId, orderNumber, req.user!.id,
      JSON.stringify(items),
      JSON.stringify(address),
      JSON.stringify({ method: paymentMethod }),
      subtotal || 0, discount || 0, shipping || 0, tax || 0, total || 0,
      couponCode || null, couponDiscount || 0,
      notes || null, initialTracking, expectedDelivery, now, now
    );

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    return res.status(201).json({
      success: true,
      message: `Order ${orderNumber} placed successfully! 🎉`,
      data: {
        ...order,
        items: JSON.parse(order.items),
        address: JSON.parse(order.address),
        payment: JSON.parse(order.payment),
        tracking: JSON.parse(order.tracking || '[]'),
      },
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders — user's orders
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id) as any[];
    const parsed = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
      address: JSON.parse(o.address || '{}'),
      payment: JSON.parse(o.payment || '{}'),
      tracking: JSON.parse(o.tracking || '[]'),
    }));
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id — get single order
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as any;
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({
      success: true, data: {
        ...order,
        items: JSON.parse(order.items || '[]'),
        address: JSON.parse(order.address || '{}'),
        payment: JSON.parse(order.payment || '{}'),
        tracking: JSON.parse(order.tracking || '[]'),
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/status — admin update status
router.patch('/:id/status', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status, note } = req.body;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const tracking = JSON.parse(order.tracking || '[]');
    const statusLabels: Record<string, string> = {
      confirmed: 'Order Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    tracking.push({
      status,
      label: statusLabels[status] || status,
      description: note || `Order status updated to ${status}`,
      timestamp: new Date().toISOString(),
      completed: true,
    });

    db.prepare('UPDATE orders SET status = ?, tracking = ?, updated_at = ? WHERE id = ?')
      .run(status, JSON.stringify(tracking), new Date().toISOString(), req.params.id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
    return res.json({
      success: true, message: `Order updated to ${status}`, data: {
        ...updated,
        items: JSON.parse(updated.items || '[]'),
        address: JSON.parse(updated.address || '{}'),
        payment: JSON.parse(updated.payment || '{}'),
        tracking: JSON.parse(updated.tracking || '[]'),
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/admin/all — admin view all orders
router.get('/admin/all', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const orders = db.prepare(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC LIMIT 100`
    ).all() as any[];
    const parsed = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
      address: JSON.parse(o.address || '{}'),
      payment: JSON.parse(o.payment || '{}'),
      tracking: JSON.parse(o.tracking || '[]'),
    }));
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
