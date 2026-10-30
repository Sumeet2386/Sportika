import { Router, Request, Response } from 'express';

const router = Router();

// Coupons are managed in the frontend Zustand store for now
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

router.post('/validate', (_req: Request, res: Response) => {
  res.json({ success: false, message: 'Use frontend coupon validation' });
});

export default router;
