import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/users
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all users' });
});

// GET /api/users/:id
router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: `Get user ${req.params.id}` });
});

export default router;
