import { Router, Request, Response } from 'express';

const router = Router();

router.post('/create-order', (_req: Request, res: Response) => {
  res.json({ success: false, message: 'Payment gateway not configured. Please set up Razorpay keys.' });
});

router.post('/verify', (_req: Request, res: Response) => {
  res.json({ success: false, message: 'Payment verification not configured.' });
});

export default router;
