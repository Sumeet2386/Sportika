import { Router, Response } from 'express';
import db from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const revenue = db.prepare(`SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count FROM orders WHERE status != 'cancelled'`).get() as any;
    const orders = db.prepare(`SELECT COUNT(*) as total FROM orders`).get() as any;
    const customers = db.prepare(`SELECT COUNT(*) as total FROM users WHERE role = 'customer'`).get() as any;
    const recentOrders = db.prepare(
      `SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 10`
    ).all();

    res.json({
      success: true,
      data: {
        revenue: parseFloat(revenue.total) || 0,
        totalOrders: parseInt(orders.total) || 0,
        totalCustomers: parseInt(customers.total) || 0,
        recentOrders,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const users = db.prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
       COUNT(o.id) as order_count, COALESCE(SUM(o.total), 0) as total_spent
       FROM users u LEFT JOIN orders o ON o.user_id = u.id
       GROUP BY u.id ORDER BY u.created_at DESC LIMIT 50`
    ).all();
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
