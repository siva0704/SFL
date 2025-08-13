import { Router } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// TODO: Add inventory routes implementation
// GET /api/v1/inventory - Get inventory data
// POST /api/v1/inventory - Create inventory record
// PUT /api/v1/inventory/:id - Update inventory record
// DELETE /api/v1/inventory/:id - Delete inventory record

router.get('/', protect, (_req, res) => {
  res.status(200).json({ message: 'Inventory route - TODO: implement' });
});

export default router; 