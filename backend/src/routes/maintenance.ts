import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/maintenance
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all maintenance records' });
});

// GET /api/maintenance/:id
router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: `Get maintenance record ${req.params.id}` });
});

// POST /api/maintenance
router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'Create maintenance record' });
});

export default router;
