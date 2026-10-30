import { Router, Request, Response } from 'express';

const router = Router();

// These routes are stubs — products are managed in the frontend store (Zustand)
// In production, wire these to the SQLite/PostgreSQL products table

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: [], message: 'Products served from frontend store' });
});

router.get('/:slug', (req: Request, res: Response) => {
  res.json({ success: false, message: 'Product not found in API — use frontend store' });
});

export default router;
