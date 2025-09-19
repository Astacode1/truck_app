import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/trips
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all trips' });
});

// GET /api/trips/:id
router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: `Get trip ${req.params.id}` });
});

// POST /api/trips
router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'Create trip' });
});

// PUT /api/trips/:id
router.put('/:id', (req: Request, res: Response) => {
  res.json({ message: `Update trip ${req.params.id}` });
});

export default router;
