import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const getAddresses = (userId: string) => {
  return db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC').all(userId)
    .map((a: any) => ({ ...a, isDefault: !!a.is_default }));
};

// GET /api/users/profile
router.get('/profile', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, name, email, phone, avatar, role, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
    const addresses = getAddresses(req.user!.id);
    res.json({ success: true, data: { ...user, addresses } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    db.prepare('UPDATE users SET name = ?, phone = ?, updated_at = ? WHERE id = ?')
      .run(name, phone || null, new Date().toISOString(), req.user!.id);
    const user = db.prepare('SELECT id, name, email, phone, avatar, role FROM users WHERE id = ?').get(req.user!.id) as any;
    res.json({ success: true, data: user, message: 'Profile updated!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/password
router.put('/password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as any;
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const hash = await bcrypt.hash(newPassword, 12);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(hash, new Date().toISOString(), req.user!.id);
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/addresses
router.post('/addresses', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const genId = () => require('uuid').v4();
    const { name, phone, line1, line2, city, state, pincode, country, type, isDefault } = req.body;
    if (isDefault) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user!.id);
    const id = genId();
    db.prepare(
      'INSERT INTO addresses (id, user_id, name, phone, line1, line2, city, state, pincode, country, type, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, req.user!.id, name, phone, line1, line2 || null, city, state, pincode, country || 'India', type || 'home', isDefault ? 1 : 0);
    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(id) as any;
    res.status(201).json({ success: true, data: { ...address, isDefault: !!address.is_default } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/addresses/:id
router.put('/addresses/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, type, isDefault } = req.body;
    if (isDefault) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user!.id);
    db.prepare(
      'UPDATE addresses SET name=?, phone=?, line1=?, line2=?, city=?, state=?, pincode=?, type=?, is_default=? WHERE id=? AND user_id=?'
    ).run(name, phone, line1, line2 || null, city, state, pincode, type || 'home', isDefault ? 1 : 0, req.params.id, req.user!.id);
    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id) as any;
    res.json({ success: true, data: { ...address, isDefault: !!address.is_default } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/addresses/:id
router.delete('/addresses/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Address deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: get all users
router.get('/', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
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
