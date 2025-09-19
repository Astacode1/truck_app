import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/trucks
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all trucks' });
});

// GET /api/trucks/:id
router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: `Get truck ${req.params.id}` });
});

// POST /api/trucks
router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'Create truck' });
});

// PUT /api/trucks/:id
router.put('/:id', (req: Request, res: Response) => {
  res.json({ message: `Update truck ${req.params.id}` });
});

// DELETE /api/trucks/:id
router.delete('/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete truck ${req.params.id}` });
});

export default router;
