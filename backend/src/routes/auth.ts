import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendOtpEmail } from '../utils/mailer';

const router = Router();

// Helper: generate UUID-like string
const genId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const generateTokens = (userId: string, email: string, role: string) => {
  const token = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET || 'sportika_secret_2024',
    { expiresIn: '7d' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'sportika_refresh_2024',
    { expiresIn: '30d' }
  );
  return { token, refreshToken };
};

const getAddresses = (userId: string) => {
  return db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC').all(userId)
    .map((a: any) => ({ ...a, isDefault: !!a.is_default }));
};

// In-memory OTP storage: email -> { code, expiresAt }
const otpStore = new Map<string, { code: string; expiresAt: number }>();

const generateOtp = (email: string): string => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase().trim(), {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  return code;
};

// ── POST /api/auth/google ── (Direct Google Sign In & Sign Up)
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.prepare('SELECT id, name, email, phone, role, avatar, email_verified, created_at FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      const userId = genId();
      const now = new Date().toISOString();
      const defaultName = name || cleanEmail.split('@')[0];
      const userAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}`;

      const role = (cleanEmail === 'sumeetgite23@gmail.com' || cleanEmail === 'admin@sportika.in') ? 'admin' : 'customer';

      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, phone, role, avatar, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(userId, defaultName, cleanEmail, 'google_oauth_verified', null, role, userAvatar, now, now);

      user = db.prepare('SELECT id, name, email, phone, role, avatar, email_verified, created_at FROM users WHERE id = ?').get(userId);
    } else {
      const role = (cleanEmail === 'sumeetgite23@gmail.com' || cleanEmail === 'admin@sportika.in') ? 'admin' : user.role;
      db.prepare('UPDATE users SET email_verified = 1, role = ? WHERE id = ?').run(role, user.id);
      user.email_verified = 1;
      user.role = role;
    }

    const addresses = getAddresses(user.id);
    const { token, refreshToken } = generateTokens(user.id, user.email, user.role);

    return res.json({
      success: true,
      message: `Signed in with Google as ${user.name}! 🚀`,
      data: {
        user: { ...user, addresses },
        token,
        refreshToken,
      },
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    return res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

// ── POST /api/auth/send-otp ── (Send email verification OTP)
router.post('/send-otp', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email address is required' });

  const code = generateOtp(email);
  console.log(`📧 [Verification Code for ${email}]: ${code}`);

  // Send real email via sumeetgite23@gmail.com
  sendOtpEmail({ toEmail: email, otp: code, type: 'login' }).catch(err => {
    console.error('Error sending OTP email:', err);
  });

  return res.json({
    success: true,
    message: `Verification code sent to ${email}`,
    code, // Included for instant test preview
  });
});

// ── POST /api/auth/verify-otp ── (Verify email OTP code)
router.post('/verify-otp', (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const stored = otpStore.get(cleanEmail);

  if (!stored) {
    return res.status(400).json({ success: false, message: 'No verification code found. Please request a new code.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
  }

  if (stored.code !== code.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
  }

  otpStore.delete(cleanEmail);
  db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE email = ?')
    .run(new Date().toISOString(), cleanEmail);

  const user = db.prepare('SELECT id, name, email, phone, avatar, role, email_verified, created_at FROM users WHERE email = ?').get(cleanEmail) as any;
  let token, refreshToken;
  let addresses: any[] = [];
  if (user) {
    addresses = getAddresses(user.id);
    const tokens = generateTokens(user.id, user.email, user.role);
    token = tokens.token;
    refreshToken = tokens.refreshToken;
  }

  return res.json({
    success: true,
    message: 'Email successfully verified! ✅',
    data: user ? { user: { ...user, addresses }, token, refreshToken } : undefined,
  });
});

// ── POST /api/auth/forgot-password ──
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
      const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(cleanEmail) as any;
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email address. Please register.'
        });
      }

      const code = generateOtp(cleanEmail);
      console.log(`🔐 [Password Reset OTP for ${cleanEmail}]: ${code}`);

      sendOtpEmail({ toEmail: cleanEmail, userName: user.name, otp: code, type: 'reset_password' }).catch(err => {
        console.error('Error sending reset password email:', err);
      });

      return res.json({
        success: true,
        message: `A 6-digit password reset code has been sent to ${cleanEmail}`,
        code, // Provided for instant testing preview
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ success: false, message: 'Could not process password reset request.' });
    }
  }
);

// ── POST /api/auth/reset-password ──
router.post('/reset-password',
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('code').notEmpty().withMessage('Reset code is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, code, newPassword } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
      const stored = otpStore.get(cleanEmail);
      if (!stored) {
        return res.status(400).json({ success: false, message: 'Reset code expired or not requested. Please request a new code.' });
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new code.' });
      }

      if (stored.code !== code.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
      }

      const user = db.prepare('SELECT id, name, email, phone, avatar, role FROM users WHERE email = ?').get(cleanEmail) as any;
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      db.prepare('UPDATE users SET password_hash = ?, email_verified = 1, updated_at = ? WHERE email = ?')
        .run(passwordHash, new Date().toISOString(), cleanEmail);

      otpStore.delete(cleanEmail);

      const addresses = getAddresses(user.id);
      const { token, refreshToken } = generateTokens(user.id, user.email, user.role);

      return res.json({
        success: true,
        message: 'Password reset successful! Logging you in...',
        data: {
          user: { ...user, addresses, email_verified: 1 },
          token,
          refreshToken,
        },
      });
    } catch (err: any) {
      console.error('Reset password error:', err);
      return res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
  }
);

// ── POST /api/auth/register ──
router.post('/register',
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password, phone } = req.body;

    try {
      // Check if email already exists
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const userId = genId();
      const now = new Date().toISOString();
      const otp = generateOtp(email);

      const cleanEmail = email.toLowerCase().trim();
      const role = (cleanEmail === 'sumeetgite23@gmail.com' || cleanEmail === 'admin@sportika.in') ? 'admin' : 'customer';

      db.prepare(
        'INSERT INTO users (id, name, email, password_hash, phone, role, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)'
      ).run(userId, name, cleanEmail, passwordHash, phone || null, role, now, now);

      const user = db.prepare('SELECT id, name, email, phone, avatar, role, email_verified, created_at FROM users WHERE id = ?').get(userId) as any;
      const { token, refreshToken } = generateTokens(user.id, user.email, user.role);

      console.log(`📧 [New Registration OTP for ${cleanEmail}]: ${otp}`);

      // Send real email to customer from sumeetgite23@gmail.com
      sendOtpEmail({ toEmail: cleanEmail, userName: name, otp, type: 'registration' }).catch(err => {
        console.error('Error sending registration OTP email:', err);
      });

      return res.status(201).json({
        success: true,
        message: `Welcome to Sportika, ${name.split(' ')[0]}! Please verify your email.`,
        otp, // sent for development verification modal
        data: {
          user: { ...user, addresses: [] },
          token,
          refreshToken,
        },
      });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
  }
);

// ── POST /api/auth/login ──
router.post('/login',
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    try {
      const user = db.prepare(
        'SELECT id, name, email, phone, password_hash, role, avatar, created_at FROM users WHERE email = ?'
      ).get(cleanEmail) as any;

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const { password_hash, ...safeUser } = user;
      const addresses = getAddresses(user.id);
      const { token, refreshToken } = generateTokens(user.id, user.email, user.role);

      return res.json({
        success: true,
        message: 'Login successful!',
        data: {
          user: { ...safeUser, addresses },
          token,
          refreshToken,
        },
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
  }
);

// ── GET /api/auth/me ──
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare(
      'SELECT id, name, email, phone, avatar, role, created_at FROM users WHERE id = ?'
    ).get(req.user!.id) as any;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const addresses = getAddresses(user.id);
    return res.json({ success: true, data: { ...user, addresses } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/refresh ──
router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'sportika_refresh_2024') as any;
    const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(decoded.id) as any;

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const tokens = generateTokens(user.id, user.email, user.role);
    return res.json({ success: true, data: tokens });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// ── PUT /api/auth/profile ── (update profile)
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  const { name, phone, avatar } = req.body;
  try {
    db.prepare(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar), updated_at = ? WHERE id = ?'
    ).run(name || null, phone || null, avatar || null, new Date().toISOString(), req.user!.id);

    const updated = db.prepare(
      'SELECT id, name, email, phone, avatar, role, created_at FROM users WHERE id = ?'
    ).get(req.user!.id) as any;
    const addresses = getAddresses(updated.id);

    return res.json({ success: true, message: 'Profile updated!', data: { ...updated, addresses } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/auth/password ── (change password)
router.put('/password', authenticate,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as any;
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const newHash = await bcrypt.hash(newPassword, 12);
      db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
        .run(newHash, new Date().toISOString(), req.user!.id);
      return res.json({ success: true, message: 'Password changed successfully!' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── POST /api/auth/addresses ── (add address)
router.post('/addresses', authenticate, (req: AuthRequest, res: Response) => {
  const { name, phone, line1, line2, city, state, pincode, country, isDefault, type } = req.body;
  try {
    if (isDefault) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user!.id);
    }
    const id = genId();
    db.prepare(
      'INSERT INTO addresses (id, user_id, name, phone, line1, line2, city, state, pincode, country, is_default, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, req.user!.id, name, phone, line1, line2 || null, city, state, pincode, country || 'India', isDefault ? 1 : 0, type || 'home');

    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(id) as any;
    return res.status(201).json({
      success: true,
      message: 'Address added!',
      data: { ...address, isDefault: !!address.is_default }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/auth/addresses/:id ──
router.delete('/addresses/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
    return res.json({ success: true, message: 'Address removed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
