import { Router } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// TODO: Add reports routes implementation
// GET /api/v1/reports - Get reports data
// POST /api/v1/reports - Generate new report
// GET /api/v1/reports/:id - Get specific report
// DELETE /api/v1/reports/:id - Delete report

router.get('/', protect, (_req, res) => {
  res.status(200).json({ message: 'Reports route - TODO: implement' });
});

export default router; 