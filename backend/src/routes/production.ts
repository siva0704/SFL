import { Router } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// TODO: Add production routes implementation
// GET /api/v1/production - Get production data
// POST /api/v1/production - Create production record
// PUT /api/v1/production/:id - Update production record
// DELETE /api/v1/production/:id - Delete production record

router.get('/', protect, (_req, res) => {
  res.status(200).json({ message: 'Production route - TODO: implement' });
});

export default router; 